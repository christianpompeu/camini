-- Marco C4 / Gate 2: Proposta local de esquema, segregação de privilégios e RPC transacional determinística para decisão editorial humana.
-- PROPOSTA LOCAL — NÃO APLICAR sem autorização humana prévia e explícita.
-- Ambiente-alvo: Supabase HML hrpathjcxyzzwxgkhwnt
-- Modelo de identidade: Alternativa A (Autenticação dedicada no Supabase HML)

-- A canonicalização permanece a do C3/TypeScript: objetos com chaves ordenadas,
-- arrays na ordem original, JSON compacto e remoção de url/expiry_time efêmeros.
-- Esta função existe apenas para recalcular o digest no banco; não reescreve
-- snapshots históricos.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.observatorio_canonical_json(p_value jsonb)
returns text
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  v_type text := pg_catalog.jsonb_typeof(p_value);
  v_result text;
begin
  if p_value is null or v_type = 'null' then
    return 'null';
  elsif v_type in ('string', 'number', 'boolean') then
    return p_value::text;
  elsif v_type = 'array' then
    select '[' || coalesce(string_agg(public.observatorio_canonical_json(value), ',' order by ordinality), '') || ']'
      into v_result
      from pg_catalog.jsonb_array_elements(p_value) with ordinality as item(value, ordinality);
    return v_result;
  elsif v_type = 'object' then
    select '{' || coalesce(string_agg(
      pg_catalog.to_jsonb(key)::text || ':' || public.observatorio_canonical_json(value),
      ',' order by key
    ), '') || '}'
      into v_result
      from pg_catalog.jsonb_each(p_value) as item(key, value)
     where key <> 'expiry_time'
       and not (key = 'url' and pg_catalog.jsonb_typeof(p_value->'expiry_time') = 'string');
    return v_result;
  end if;
  raise exception using errcode = '22023', message = 'JSON canonico invalido';
end;
$$;

create or replace function public.observatorio_hash_editorial(p_value jsonb)
returns text
language sql
immutable
set search_path = pg_catalog
as $$
  select pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(public.observatorio_canonical_json(p_value), 'UTF8'),
      'sha256'
    ),
    'hex'
  )
$$;

revoke all on function public.observatorio_canonical_json(jsonb) from public, anon, authenticated, service_role;
revoke all on function public.observatorio_hash_editorial(jsonb) from public, anon, authenticated, service_role;

-- SECURITY DEFINER não deve transformar o executor técnico em ator humano.
-- C3/C4 definem explicitamente observatorio.actor dentro da própria transação;
-- registros antigos e demais chamadas preservam o fallback current_user.
create or replace function public.observatorio_registrar_decisao()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  insert into public.observatorio_decisoes_historico (
    entidade, entidade_id, operacao, antes, depois, run_key, ator
  ) values (
    tg_table_name,
    case
      when tg_table_name = 'observatorio_relacoes_evidencias' then
        case when tg_op = 'DELETE' then (to_jsonb(old)->>'relacao_id')::uuid else (to_jsonb(new)->>'relacao_id')::uuid end
      else case when tg_op = 'DELETE' then (to_jsonb(old)->>'id')::uuid else (to_jsonb(new)->>'id')::uuid end
    end,
    tg_op,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end,
    nullif(current_setting('observatorio.run_key', true), ''),
    coalesce(nullif(current_setting('observatorio.actor', true), ''), current_user)
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- ============================================================================
-- 1. SEGREGAÇÃO EFETIVA DE PRIVILÉGIOS EM public.observatorio_edicoes
-- ============================================================================
-- O service_role e usuários públicos/autenticados não podem realizar UPDATE, DELETE ou TRUNCATE diretos.
-- Apenas a função controlada C3 (SECURITY DEFINER) e a RPC C4 (SECURITY DEFINER)
-- podem alterar o estado editorial sob suas regras estritas e imutáveis.

alter table public.observatorio_edicoes
  add column if not exists rejeitada_em timestamptz;

revoke insert, update, delete, truncate on table public.observatorio_edicoes
  from public, anon, authenticated, service_role;

grant select on table public.observatorio_edicoes
  to authenticated, service_role;

-- ============================================================================
-- 2. FUNÇÃO C3 CONTROLADA: SINCRONIZADOR EDITORIAL SOB SECURITY DEFINER
-- ============================================================================
-- Redefine observatorio_sync_edicoes como SECURITY DEFINER para permitir que o
-- sincronizador C3 insira e atualize edições candidatas mesmo com UPDATE/INSERT
-- direto revogado do papel service_role.
-- A função garante categoricamente que:
-- - Apenas o estado 'candidata' pode ser inserido ou atualizado.
-- - Se a edição estiver 'aprovada', 'rejeitada' ou 'publicada', a mutação é abortada com 42501.
-- - Jamais permite aprovar, rejeitar ou publicar uma edição.

create or replace function public.observatorio_sync_edicoes(
  p_run_key text,
  p_edicoes jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_item jsonb;
  v_snapshot jsonb;
  v_operation text;
  v_identifier text;
  v_notion_page_id text;
  v_existing_id uuid;
  v_expected_version integer;
  v_expected_hash text;
  v_current public.observatorio_edicoes%rowtype;
  v_result_id uuid;
  v_inserted integer := 0;
  v_updated integer := 0;
begin
  if nullif(pg_catalog.btrim(p_run_key), '') is null then
    raise exception using errcode = '22023', message = 'run_key obrigatorio';
  end if;
  if pg_catalog.jsonb_typeof(p_edicoes) is distinct from 'array'
     or pg_catalog.jsonb_array_length(p_edicoes) <> 1 then
    raise exception using errcode = '22023', message = 'apply C3 exige exatamente uma edicao';
  end if;

  perform pg_catalog.set_config('observatorio.run_key', p_run_key, true);
  perform pg_catalog.set_config('observatorio.actor', 'observatorio_c3', true);

  for v_item in select value from pg_catalog.jsonb_array_elements(p_edicoes) item(value)
  loop
    v_operation := v_item->>'operation';
    v_snapshot := v_item->'snapshot';
    v_identifier := v_snapshot#>>'{edition,identificador}';
    v_notion_page_id := v_snapshot#>>'{source,notionPageId}';
    v_expected_version := nullif(v_item->>'expected_version', '')::integer;
    v_expected_hash := v_item->>'expected_previous_hash';

    if v_operation is null or v_operation not in ('insert', 'update')
       or pg_catalog.jsonb_typeof(v_snapshot) is distinct from 'object'
       or pg_catalog.jsonb_typeof(v_snapshot->'schemaVersion') is distinct from 'number'
       or (v_snapshot->>'schemaVersion')::integer is distinct from 1
       or pg_catalog.jsonb_typeof(v_snapshot->'source') is distinct from 'object'
       or v_snapshot#>>'{source,type}' is distinct from 'notion'
       or nullif(pg_catalog.btrim(v_snapshot#>>'{source,notionPageId}'), '') is null
       or nullif(pg_catalog.btrim(v_snapshot#>>'{source,notionUrl}'), '') is null
       or pg_catalog.jsonb_typeof(v_snapshot->'edition') is distinct from 'object'
       or nullif(pg_catalog.btrim(v_identifier), '') is null
       or nullif(pg_catalog.btrim(v_snapshot#>>'{edition,canal}'), '') is null
       or nullif(pg_catalog.btrim(v_snapshot#>>'{edition,titulo}'), '') is null
       or nullif(pg_catalog.btrim(v_snapshot#>>'{edition,resumo}'), '') is null
       or pg_catalog.lower(pg_catalog.btrim(v_snapshot#>>'{edition,statusOriginal}')) is distinct from 'candidata'
       or pg_catalog.jsonb_typeof(v_snapshot->'content') is distinct from 'object'
       or pg_catalog.jsonb_typeof(v_snapshot#>'{content,complete}') is distinct from 'boolean'
       or (v_snapshot#>>'{content,complete}')::boolean is distinct from true
       or pg_catalog.jsonb_typeof(v_snapshot#>'{content,blocks}') is distinct from 'array'
       or pg_catalog.jsonb_typeof(v_snapshot->'contentHash') is distinct from 'string'
       or nullif(pg_catalog.btrim(v_snapshot->>'contentHash'), '') is null
       or v_snapshot->>'contentHash' is distinct from public.observatorio_hash_editorial(
         pg_catalog.jsonb_build_object(
           'schemaVersion', v_snapshot->'schemaVersion',
           'notionPageId', v_snapshot#>'{source,notionPageId}',
           'edition', v_snapshot->'edition',
           'content', v_snapshot->'content'
         )
       )
       or nullif(pg_catalog.btrim(v_notion_page_id), '') is null then
      raise exception using errcode = '22023', message = 'contrato de snapshot C3 invalido';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_identifier, 0)
    );

    if v_operation = 'insert' then
      if v_item->>'existing_id' is not null
         or exists (
           select 1 from public.observatorio_edicoes
           where identificador = v_identifier or notion_page_id = v_notion_page_id
         ) then
        raise exception using errcode = '23505', message = 'identidade editorial ja existe';
      end if;

      insert into public.observatorio_edicoes (
        identificador, canal, titulo, resumo, status,
        notion_page_id, notion_url, snapshot, versao,
        aprovada_em, publicada_em, rejeitada_em
      ) values (
        v_identifier,
        v_snapshot#>>'{edition,canal}',
        v_snapshot#>>'{edition,titulo}',
        v_snapshot#>>'{edition,resumo}',
        'candidata',
        v_notion_page_id,
        v_snapshot#>>'{source,notionUrl}',
        v_snapshot,
        1,
        null,
        null,
        null
      ) returning id into v_result_id;
      v_inserted := v_inserted + 1;
    else
      v_existing_id := nullif(v_item->>'existing_id', '')::uuid;
      if v_existing_id is null or v_expected_version is null then
        raise exception using errcode = '22023', message = 'precondicoes de update ausentes';
      end if;

      select * into v_current
      from public.observatorio_edicoes
      where id = v_existing_id
      for update;

      if not found then
        raise exception using errcode = 'P0002', message = 'edicao HML nao encontrada';
      end if;
      if v_current.identificador <> v_identifier
         or v_current.notion_page_id is distinct from v_notion_page_id then
        raise exception using errcode = '23505', message = 'conflito de identidade editorial';
      end if;
      if v_current.status <> 'candidata'
         or v_current.aprovada_em is not null
         or v_current.publicada_em is not null
         or v_current.rejeitada_em is not null then
        raise exception using errcode = '42501', message = 'estado editorial HML protegido';
      end if;
      if v_current.versao <> v_expected_version
         or (v_current.snapshot->>'contentHash') is distinct from v_expected_hash then
        raise exception using errcode = '40001', message = 'edicao alterada desde o dry-run';
      end if;
      if nullif(v_current.snapshot#>>'{source,lastEditedTime}', '') is not null
         and nullif(v_snapshot#>>'{source,lastEditedTime}', '') is not null
         and (v_snapshot#>>'{source,lastEditedTime}')::timestamptz
             < (v_current.snapshot#>>'{source,lastEditedTime}')::timestamptz then
        raise exception using errcode = '40001', message = 'snapshot Notion obsoleto';
      end if;
      if v_current.snapshot->>'contentHash' = v_snapshot->>'contentHash' then
        raise exception using errcode = '22023', message = 'update sem alteracao material';
      end if;

      update public.observatorio_edicoes
      set canal = v_snapshot#>>'{edition,canal}',
          titulo = v_snapshot#>>'{edition,titulo}',
          resumo = v_snapshot#>>'{edition,resumo}',
          notion_url = v_snapshot#>>'{source,notionUrl}',
          snapshot = v_snapshot,
          versao = v_current.versao + 1
      where id = v_existing_id
      returning id into v_result_id;
      v_updated := v_updated + 1;
    end if;
  end loop;

  return pg_catalog.jsonb_build_object(
    'run_key', p_run_key,
    'inserted', v_inserted,
    'updated', v_updated,
    'edition_id', v_result_id
  );
end;
$$;

revoke all on function public.observatorio_sync_edicoes(text, jsonb)
  from public, anon, authenticated;
grant execute on function public.observatorio_sync_edicoes(text, jsonb)
  to service_role;

-- ============================================================================
-- 3. ALLOWLIST DE REVISORES EDITORIAIS NO HML
-- ============================================================================
-- Restrita exclusivamente à leitura do revisor ativo autenticado.
-- Mutação (INSERT/UPDATE/DELETE) bloqueada para service_role, anon e authenticated.
-- Gestão administrativa exclusiva de superusuário/DBA.

create table if not exists public.observatorio_revisores_edicoes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  ativo boolean not null default true,
  concedido_em timestamptz not null default now(),
  concedido_por text not null default current_user,
  revogado_em timestamptz,
  motivo_revogacao text
);

alter table public.observatorio_revisores_edicoes enable row level security;

revoke all on table public.observatorio_revisores_edicoes
  from public, anon, authenticated, service_role;
grant select on table public.observatorio_revisores_edicoes
  to authenticated;

drop policy if exists observatorio_revisores_edicoes_leitura_propria
  on public.observatorio_revisores_edicoes;
create policy observatorio_revisores_edicoes_leitura_propria
  on public.observatorio_revisores_edicoes
  for select to authenticated
  using (user_id = (select auth.uid()) and ativo = true);

-- ============================================================================
-- 4. TABELA APPEND-ONLY DE AUDITORIA DE DECISÕES EDITORIAIS
-- ============================================================================
-- Registro append-only imutável de aprovações e rejeições humanas.
-- Bloqueio total contra mutação direta.

create table if not exists public.observatorio_edicoes_decisoes (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid not null references public.observatorio_edicoes (id),
  identificador text not null,
  notion_page_id text not null,
  decisao text not null check (decisao in ('aprovar', 'rejeitar')),
  justificativa text not null check (length(pg_catalog.btrim(justificativa)) >= 10),
  versao integer not null check (versao >= 1),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  actor_user_id uuid not null references auth.users (id),
  actor_email text not null,
  chave_idempotencia text not null unique,
  fingerprint text not null,
  snapshot_congelado jsonb not null,
  decidido_em timestamptz not null default now()
);

-- Unicidade declarativa: no máximo uma decisão por ciclo/versão de uma edição
create unique index if not exists obs_edicoes_decisoes_edicao_versao_uidx
  on public.observatorio_edicoes_decisoes (edicao_id, versao);

create index if not exists obs_edicoes_decisoes_edicao_idx
  on public.observatorio_edicoes_decisoes (edicao_id, decidido_em desc);

create index if not exists obs_edicoes_decisoes_identificador_idx
  on public.observatorio_edicoes_decisoes (identificador);

alter table public.observatorio_edicoes_decisoes enable row level security;

revoke all on table public.observatorio_edicoes_decisoes
  from public, anon, authenticated, service_role;
grant select on table public.observatorio_edicoes_decisoes
  to authenticated;

drop policy if exists observatorio_edicoes_decisoes_leitura_propria
  on public.observatorio_edicoes_decisoes;
create policy observatorio_edicoes_decisoes_leitura_propria
  on public.observatorio_edicoes_decisoes
  for select to authenticated
  using (actor_user_id = (select auth.uid()));

drop trigger if exists observatorio_edicoes_decisoes_append_only
  on public.observatorio_edicoes_decisoes;
create trigger observatorio_edicoes_decisoes_append_only
before update or delete on public.observatorio_edicoes_decisoes
for each row execute function public.observatorio_bloquear_mutacao_auditoria();

-- ============================================================================
-- 5. RPC TRANSACIONAL DETERMINÍSTICA DE DECISÃO EDITORIAL
-- ============================================================================
-- Executa a decisão editorial garantindo:
-- 1. Autenticação e autorização via auth.uid() e allowlist ativa;
-- 2. Rejeição de payload com identidade de ator forjada;
-- 3. Validação rigorosa de todos os parâmetros contra tipos inválidos e nulos;
-- 4. Bloqueio transacional em ordem determinística (advisory lock + FOR UPDATE);
-- 5. Consulta de replay/idempotência APÓS a serialização de locks;
-- 6. Validação de pré-condições da edição (candidata, versão, hash, snapshot íntegro);
-- 7. Unicidade terminal (impede múltiplas decisões na mesma edição/versão);
-- 8. Efetivação atômica do status e inserção na tabela append-only de decisões.

create or replace function public.observatorio_decidir_edicao(
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_uid uuid := (select auth.uid());
  v_revisor_email text;
  v_edition_id_text text;
  v_edition_id uuid;
  v_identifier text;
  v_version_text text;
  v_version integer;
  v_content_hash text;
  v_decision text;
  v_justification text;
  v_idempotency_key text;
  v_fingerprint text;
  v_existing_decision public.observatorio_edicoes_decisoes%rowtype;
  v_current public.observatorio_edicoes%rowtype;
  v_new_status text;
  v_now timestamptz := pg_catalog.now();
begin
  -- 5.1 Autenticação obrigatória via Supabase Auth HML
  if v_uid is null then
    raise exception using errcode = '42501', message = 'unauthenticated';
  end if;

  perform pg_catalog.set_config('observatorio.actor', 'editorial:' || v_uid::text, true);

  -- 5.2 Validação de permissão editorial na allowlist ativa (revisor revogado é rejeitado imediatamente)
  select email into v_revisor_email
  from public.observatorio_revisores_edicoes
  where user_id = v_uid
    and ativo is true
  for update;

  if v_revisor_email is null then
    raise exception using errcode = '42501', message = 'editorial_permission_required';
  end if;

  -- 5.3 Rejeição explícita de identidade de cliente no payload
  if p_payload ? 'actor_user_id' or p_payload ? 'actorUserId' then
    raise exception using errcode = '42501', message = 'client_identity_forbidden';
  end if;

  -- 5.4 Validação estrita de formato e tipos dos parâmetros de entrada
  if pg_catalog.jsonb_typeof(p_payload) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'required_fields';
  end if;

  v_edition_id_text := pg_catalog.btrim(nullif(p_payload->>'edition_id', ''));
  if v_edition_id_text is null or not (v_edition_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') then
    raise exception using errcode = '22023', message = 'required_fields';
  end if;
  v_edition_id := v_edition_id_text::uuid;

  v_identifier := pg_catalog.btrim(nullif(p_payload->>'identifier', ''));
  if v_identifier is null or length(v_identifier) = 0 then
    raise exception using errcode = '22023', message = 'required_fields';
  end if;

  v_version_text := pg_catalog.btrim(nullif(p_payload->>'version', ''));
  if v_version_text is null or not (v_version_text ~ '^[1-9][0-9]*$') then
    raise exception using errcode = '22023', message = 'invalid_version';
  end if;
  v_version := v_version_text::integer;

  v_content_hash := pg_catalog.lower(pg_catalog.btrim(nullif(p_payload->>'content_hash', '')));
  if v_content_hash is null or not (v_content_hash ~ '^[a-f0-9]{64}$') then
    raise exception using errcode = '22023', message = 'required_fields';
  end if;

  v_decision := pg_catalog.lower(pg_catalog.btrim(nullif(p_payload->>'decision', '')));
  if v_decision is null or v_decision not in ('aprovar', 'rejeitar') then
    raise exception using errcode = '22023', message = 'invalid_decision';
  end if;

  v_justification := pg_catalog.btrim(nullif(p_payload->>'justification', ''));
  if v_justification is null or length(v_justification) < 10 then
    raise exception using errcode = '22023', message = 'justification_required';
  end if;

  v_idempotency_key := pg_catalog.btrim(nullif(p_payload->>'idempotency_key', ''));
  if v_idempotency_key is null or length(v_idempotency_key) = 0 then
    raise exception using errcode = '22023', message = 'required_fields';
  end if;

  -- 5.5 Cálculo determinístico do fingerprint canônico
  -- Ordem explícita igual à função fingerprint TypeScript. Não usamos
  -- jsonb::text: o jsonb reordena chaves e não é JSON.stringify.
  v_fingerprint := '{' ||
    '"actorUserId":' || pg_catalog.to_jsonb(v_uid::text)::text || ',' ||
    '"contentHash":' || pg_catalog.to_jsonb(v_content_hash)::text || ',' ||
    '"decision":' || pg_catalog.to_jsonb(v_decision)::text || ',' ||
    '"editionId":' || pg_catalog.to_jsonb(v_edition_id::text)::text || ',' ||
    '"identifier":' || pg_catalog.to_jsonb(v_identifier)::text || ',' ||
    '"justification":' || pg_catalog.to_jsonb(v_justification)::text || ',' ||
    '"version":' || v_version::text ||
  '}';

  -- 5.6 Bloqueio Transacional em Ordem Determinística (Advisory Lock + SELECT FOR UPDATE)
  -- Adquire o lock ANTES de inspecionar idempotência para serializar requisições concorrentes.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_identifier, 0)
  );

  select * into v_current
  from public.observatorio_edicoes
  where id = v_edition_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'edition_not_found';
  end if;

  -- 5.7 Verificação de Idempotência e Replay (SOB SERIALIZAÇÃO CONCLUÍDA)
  select * into v_existing_decision
  from public.observatorio_edicoes_decisoes
  where chave_idempotencia = v_idempotency_key;

  if found then
    -- Replay legítimo: idêntico ator, fingerprint canônico, decisão e edição
    if v_existing_decision.fingerprint = v_fingerprint
       and v_existing_decision.actor_user_id = v_uid
       and v_existing_decision.decisao = v_decision
       and v_existing_decision.edicao_id = v_edition_id then
      return pg_catalog.jsonb_build_object(
        'ok', true,
        'replay', true,
        'edition_id', v_edition_id,
        'status', case when v_decision = 'aprovar' then 'aprovada' else 'rejeitada' end,
        'decidido_em', v_existing_decision.decidido_em
      );
    else
      -- Tentativa de reutilizar chave de idempotência com dados, ator ou decisão divergentes
      raise exception using errcode = '23505', message = 'idempotency_key_reused';
    end if;
  end if;

  -- 5.8 Validação estrita de identidade da edição e integridade
  if v_current.identificador <> v_identifier then
    raise exception using errcode = '22023', message = 'edition_identity_mismatch';
  end if;

  -- 5.9 Estado deve ser estritamente candidata sem aprovação, rejeição ou publicação prévia
  if v_current.status <> 'candidata'
     or v_current.aprovada_em is not null
     or v_current.publicada_em is not null
     or v_current.rejeitada_em is not null then
    raise exception using errcode = '42501', message = 'editorial_state_not_candidate';
  end if;

  -- 5.10 Unicidade de ciclo: impede múltiplas decisões terminais para a mesma edição/versão
  if exists (
    select 1 from public.observatorio_edicoes_decisoes
    where edicao_id = v_edition_id and versao = v_version
  ) then
    raise exception using errcode = '42501', message = 'editorial_state_not_candidate';
  end if;

  -- 5.11 Validação de versão e contentHash contra mutação concorrente
  if v_current.versao <> v_version then
    raise exception using errcode = '40001', message = 'stale_version';
  end if;

  if (v_current.snapshot->>'contentHash') is distinct from v_content_hash then
    raise exception using errcode = '40001', message = 'stale_content_hash';
  end if;

  -- 5.12 Validação defensiva da estrutura do snapshot JSONB antes de funções de array
  if pg_catalog.jsonb_typeof(v_current.snapshot) is distinct from 'object'
     or pg_catalog.jsonb_typeof(v_current.snapshot#>'{content,complete}') is distinct from 'boolean'
     or (v_current.snapshot#>>'{content,complete}')::boolean is distinct from true
     or pg_catalog.jsonb_typeof(v_current.snapshot#>'{content,blocks}') is distinct from 'array'
     or pg_catalog.jsonb_array_length(v_current.snapshot#>'{content,blocks}') = 0 then
     raise exception using errcode = '22023', message = 'snapshot_incomplete';
  end if;

  if v_current.snapshot->>'contentHash' is distinct from public.observatorio_hash_editorial(
       pg_catalog.jsonb_build_object(
         'schemaVersion', v_current.snapshot->'schemaVersion',
         'notionPageId', v_current.snapshot#>'{source,notionPageId}',
         'edition', v_current.snapshot->'edition',
         'content', v_current.snapshot->'content'
       )
     )
     or v_content_hash is distinct from public.observatorio_hash_editorial(
       pg_catalog.jsonb_build_object(
         'schemaVersion', v_current.snapshot->'schemaVersion',
         'notionPageId', v_current.snapshot#>'{source,notionPageId}',
         'edition', v_current.snapshot->'edition',
         'content', v_current.snapshot->'content'
       )
     ) then
    raise exception using errcode = '22023', message = 'snapshot_hash_invalid';
  end if;

  -- 5.13 Efetivação atômica da transição de status
  v_new_status := case when v_decision = 'aprovar' then 'aprovada' else 'rejeitada' end;

  update public.observatorio_edicoes
  set status = v_new_status,
      aprovada_em = case when v_decision = 'aprovar' then v_now else null end,
      rejeitada_em = case when v_decision = 'rejeitar' then v_now else null end
  where id = v_edition_id;

  -- 5.14 Registro imutável na tabela append-only de auditoria
  insert into public.observatorio_edicoes_decisoes (
    edicao_id,
    identificador,
    notion_page_id,
    decisao,
    justificativa,
    versao,
    content_hash,
    actor_user_id,
    actor_email,
    chave_idempotencia,
    fingerprint,
    snapshot_congelado,
    decidido_em
  ) values (
    v_edition_id,
    v_identifier,
    v_current.notion_page_id,
    v_decision,
    v_justification,
    v_version,
    v_content_hash,
    v_uid,
    v_revisor_email,
    v_idempotency_key,
    v_fingerprint,
    v_current.snapshot,
    v_now
  );

  return pg_catalog.jsonb_build_object(
    'ok', true,
    'replay', false,
    'edition_id', v_edition_id,
    'status', v_new_status,
    'decidido_em', v_now,
    'actor_user_id', v_uid
  );
end;
$$;

-- 5.15 Privilégios restritos da RPC: exclusiva para authenticated; service_role bloqueado
revoke all on function public.observatorio_decidir_edicao(jsonb)
  from public, anon, service_role;
grant execute on function public.observatorio_decidir_edicao(jsonb)
  to authenticated;

-- ============================================================================
-- 6. VERIFICAÇÕES DE PRIVILÉGIOS (has_table_privilege)
-- ============================================================================
-- Consultas preparadas para verificação de permissões pós-aplicação no HML:
-- 1. anon: zero privilégios em todas as tabelas e funções editoriais.
-- 2. service_role:
--    - SELECT em public.observatorio_edicoes (true)
--    - INSERT, UPDATE, DELETE em public.observatorio_edicoes (false)
--    - SELECT, INSERT, UPDATE, DELETE em public.observatorio_revisores_edicoes (false)
--    - SELECT, INSERT, UPDATE, DELETE em public.observatorio_edicoes_decisoes (false)
--    - EXECUTE em observatorio_decidir_edicao (false)
--    - EXECUTE em observatorio_sync_edicoes (true)
-- 3. authenticated:
--    - SELECT em public.observatorio_edicoes (true)
--    - INSERT, UPDATE, DELETE em public.observatorio_edicoes (false)
--    - SELECT em public.observatorio_revisores_edicoes (true, via RLS da própria identidade)
--    - INSERT, UPDATE, DELETE em public.observatorio_revisores_edicoes (false)
--    - SELECT em public.observatorio_edicoes_decisoes (true, via RLS das próprias decisões)
--    - INSERT, UPDATE, DELETE em public.observatorio_edicoes_decisoes (false)
--    - EXECUTE em observatorio_decidir_edicao (true)
--    - EXECUTE em observatorio_sync_edicoes (false)
