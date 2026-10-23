-- Marco C4 / Gate 2: Proposta local de esquema e RPC transacional para decisao editorial humana.
-- PROPOSTA LOCAL — NAO APLICAR sem autorizacao humana previa e explicita.
-- Ambiente-alvo: Supabase HML hrpathjcxyzzwxgkhwnt
-- Modelo de identidade: Alternativa A (Autenticacao dedicada no Supabase HML)

-- 1. Allowlist de revisores editoriais autorizados no HML
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

revoke all on table public.observatorio_revisores_edicoes from public, anon, authenticated;
grant select on table public.observatorio_revisores_edicoes to authenticated;

drop policy if exists observatorio_revisores_edicoes_leitura_propria on public.observatorio_revisores_edicoes;
create policy observatorio_revisores_edicoes_leitura_propria
  on public.observatorio_revisores_edicoes
  for select to authenticated
  using (user_id = (select auth.uid()) and ativo = true);

-- 2. Tabela append-only de auditoria de decisoes sobre edicoes
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

create index if not exists obs_edicoes_decisoes_edicao_idx
  on public.observatorio_edicoes_decisoes (edicao_id, decidido_em desc);

create index if not exists obs_edicoes_decisoes_identificador_idx
  on public.observatorio_edicoes_decisoes (identificador);

alter table public.observatorio_edicoes_decisoes enable row level security;

revoke all on table public.observatorio_edicoes_decisoes from public, anon, authenticated, service_role;
grant select on table public.observatorio_edicoes_decisoes to authenticated;

drop policy if exists observatorio_edicoes_decisoes_leitura_propria on public.observatorio_edicoes_decisoes;
create policy observatorio_edicoes_decisoes_leitura_propria
  on public.observatorio_edicoes_decisoes
  for select to authenticated
  using (actor_user_id = (select auth.uid()));

-- Protecao append-only: reutiliza a funcao padrao de bloqueio de mutacao
drop trigger if exists observatorio_edicoes_decisoes_append_only
  on public.observatorio_edicoes_decisoes;
create trigger observatorio_edicoes_decisoes_append_only
before update or delete on public.observatorio_edicoes_decisoes
for each row execute function public.observatorio_bloquear_mutacao_auditoria();

-- 3. Adicao de campo rejeitada_em na tabela observatorio_edicoes
alter table public.observatorio_edicoes
  add column if not exists rejeitada_em timestamptz;

-- 4. RPC Transacional de Decisao Editorial
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
  v_edition_id uuid;
  v_identifier text;
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
  -- 4.1. Autenticacao obrigatoria no HML
  if v_uid is null then
    raise exception using errcode = '42501', message = 'unauthenticated';
  end if;

  -- 4.2. Autorizacao na allowlist de revisores ativos
  select email into v_revisor_email
  from public.observatorio_revisores_edicoes
  where user_id = v_uid and ativo = true;

  if v_revisor_email is null then
    raise exception using errcode = '42501', message = 'editorial_permission_required';
  end if;

  -- 4.3. Rejeicao de identidade de ator fornecida pelo cliente
  if p_payload ? 'actor_user_id' or p_payload ? 'actorUserId' then
    raise exception using errcode = '42501', message = 'client_identity_forbidden';
  end if;

  -- 4.4. Validacao e extracao dos parametros obrigatorios
  v_edition_id := nullif(p_payload->>'edition_id', '')::uuid;
  v_identifier := pg_catalog.btrim(nullif(p_payload->>'identifier', ''));
  v_version := nullif(p_payload->>'version', '')::integer;
  v_content_hash := pg_catalog.lower(pg_catalog.btrim(nullif(p_payload->>'content_hash', '')));
  v_decision := pg_catalog.lower(pg_catalog.btrim(nullif(p_payload->>'decision', '')));
  v_justification := pg_catalog.btrim(nullif(p_payload->>'justification', ''));
  v_idempotency_key := pg_catalog.btrim(nullif(p_payload->>'idempotency_key', ''));

  if v_edition_id is null or v_identifier is null or v_content_hash is null or v_idempotency_key is null then
    raise exception using errcode = '22023', message = 'required_fields';
  end if;

  if v_version is null or v_version < 1 then
    raise exception using errcode = '22023', message = 'invalid_version';
  end if;

  if v_decision not in ('aprovar', 'rejeitar') then
    raise exception using errcode = '22023', message = 'invalid_decision';
  end if;

  if length(v_justification) < 10 then
    raise exception using errcode = '22023', message = 'justification_required';
  end if;

  -- 4.5. Calculo deterministico do fingerprint canônico
  v_fingerprint := pg_catalog.jsonb_build_object(
    'actorUserId', v_uid,
    'contentHash', v_content_hash,
    'decision', v_decision,
    'editionId', v_edition_id,
    'identifier', v_identifier,
    'justification', v_justification,
    'version', v_version
  )::text;

  -- 4.6. Verificacao de Idempotencia / Replay
  select * into v_existing_decision
  from public.observatorio_edicoes_decisoes
  where chave_idempotencia = v_idempotency_key;

  if found then
    if v_existing_decision.fingerprint = v_fingerprint
       and v_existing_decision.actor_user_id = v_uid
       and v_existing_decision.decisao = v_decision then
      return pg_catalog.jsonb_build_object(
        'ok', true,
        'replay', true,
        'edition_id', v_edition_id,
        'status', case when v_decision = 'aprovar' then 'aprovada' else 'rejeitada' end,
        'decidido_em', v_existing_decision.decidido_em
      );
    else
      raise exception using errcode = '23505', message = 'idempotency_key_reused';
    end if;
  end if;

  -- 4.7. Lock Transacional Concorrente (Advisory Lock por identificador + SELECT FOR UPDATE)
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

  -- 4.8. Validacao estrita de integridade e precondicoes
  if v_current.identificador <> v_identifier then
    raise exception using errcode = '22023', message = 'edition_identity_mismatch';
  end if;

  if v_current.status <> 'candidata' or v_current.aprovada_em is not null or v_current.publicada_em is not null then
    raise exception using errcode = '42501', message = 'editorial_state_not_candidate';
  end if;

  if v_current.versao <> v_version then
    raise exception using errcode = '40001', message = 'stale_version';
  end if;

  if (v_current.snapshot->>'contentHash') is distinct from v_content_hash then
    raise exception using errcode = '40001', message = 'stale_content_hash';
  end if;

  if (v_current.snapshot#>'{content,complete}')::text <> 'true'
     or pg_catalog.jsonb_array_length(v_current.snapshot#>'{content,blocks}') = 0 then
    raise exception using errcode = '22023', message = 'snapshot_incomplete';
  end if;

  -- 4.9. Aplicacao atomica da decisao
  v_new_status := case when v_decision = 'aprovar' then 'aprovada' else 'rejeitada' end;

  update public.observatorio_edicoes
  set status = v_new_status,
      aprovada_em = case when v_decision = 'aprovar' then v_now else null end,
      rejeitada_em = case when v_decision = 'rejeitar' then v_now else null end
  where id = v_edition_id;

  -- 4.10. Registro imutavel na tabela de auditoria de decisoes
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

-- 5. Privilegios restritos da RPC: exclusiva para usuarios autenticados; service_role bloqueado
revoke all on function public.observatorio_decidir_edicao(jsonb) from public, anon, service_role;
grant execute on function public.observatorio_decidir_edicao(jsonb) to authenticated;
