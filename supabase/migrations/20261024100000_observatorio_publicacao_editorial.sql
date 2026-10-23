-- Observatório C4: publicação humana explícita, separada da aprovação.
-- Proposta local. Aplicação no HML exige autorização explícita.

create table if not exists public.observatorio_edicoes_publicacoes (
  id uuid primary key default gen_random_uuid(),
  edicao_id uuid not null references public.observatorio_edicoes (id),
  identificador text not null,
  canal text not null,
  versao integer not null check (versao >= 1),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  actor_user_id uuid not null references auth.users (id),
  actor_email text not null,
  chave_idempotencia text not null unique,
  fingerprint text not null,
  snapshot_congelado jsonb not null,
  publicada_em timestamptz not null default now()
);

create unique index if not exists obs_edicoes_publicacoes_edicao_versao_uidx
  on public.observatorio_edicoes_publicacoes (edicao_id, versao);

create index if not exists obs_edicoes_publicacoes_canal_idx
  on public.observatorio_edicoes_publicacoes (canal, publicada_em desc);

alter table public.observatorio_edicoes_publicacoes enable row level security;
revoke all on table public.observatorio_edicoes_publicacoes
  from public, anon, authenticated, service_role;
grant select on table public.observatorio_edicoes_publicacoes to authenticated;

drop policy if exists observatorio_edicoes_publicacoes_leitura_propria
  on public.observatorio_edicoes_publicacoes;
create policy observatorio_edicoes_publicacoes_leitura_propria
  on public.observatorio_edicoes_publicacoes
  for select to authenticated
  using (actor_user_id = (select auth.uid()));

drop trigger if exists observatorio_edicoes_publicacoes_append_only
  on public.observatorio_edicoes_publicacoes;
create trigger observatorio_edicoes_publicacoes_append_only
before update or delete on public.observatorio_edicoes_publicacoes
for each row execute function public.observatorio_bloquear_mutacao_auditoria();

create or replace function public.observatorio_publicar_edicao(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
  v_id uuid;
  v_id_text text;
  v_identifier text;
  v_version_text text;
  v_version integer;
  v_hash text;
  v_key text;
  v_fingerprint text;
  v_current public.observatorio_edicoes%rowtype;
  v_existing public.observatorio_edicoes_publicacoes%rowtype;
  v_now timestamptz := pg_catalog.now();
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'unauthenticated';
  end if;
  perform pg_catalog.set_config('observatorio.actor', 'editorial:' || v_uid::text, true);

  select email into v_email
    from public.observatorio_revisores_edicoes
   where user_id = v_uid and ativo is true
   for update;
  if v_email is null then
    raise exception using errcode = '42501', message = 'editorial_permission_required';
  end if;

  if pg_catalog.jsonb_typeof(p_payload) is distinct from 'object'
     or p_payload ? 'actor_user_id' or p_payload ? 'actorUserId' then
    raise exception using errcode = '42501', message = 'client_identity_forbidden';
  end if;

  v_id_text := pg_catalog.btrim(nullif(p_payload->>'edition_id', ''));
  if v_id_text is null or not (v_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') then
    raise exception using errcode = '22023', message = 'required_fields';
  end if;
  v_id := v_id_text::uuid;
  v_identifier := pg_catalog.btrim(nullif(p_payload->>'identifier', ''));
  v_version_text := pg_catalog.btrim(nullif(p_payload->>'version', ''));
  if v_version_text is null or not (v_version_text ~ '^[1-9][0-9]*$') then
    raise exception using errcode = '22023', message = 'required_fields';
  end if;
  v_version := v_version_text::integer;
  v_hash := pg_catalog.lower(pg_catalog.btrim(nullif(p_payload->>'content_hash', '')));
  v_key := pg_catalog.btrim(nullif(p_payload->>'idempotency_key', ''));
  if v_identifier is null or v_version is null or v_version < 1
     or v_hash is null or not (v_hash ~ '^[a-f0-9]{64}$')
     or v_key is null then
    raise exception using errcode = '22023', message = 'required_fields';
  end if;

  v_fingerprint := '{' ||
    '"actorUserId":' || pg_catalog.to_jsonb(v_uid::text)::text || ',' ||
    '"contentHash":' || pg_catalog.to_jsonb(v_hash)::text || ',' ||
    '"editionId":' || pg_catalog.to_jsonb(v_id::text)::text || ',' ||
    '"identifier":' || pg_catalog.to_jsonb(v_identifier)::text || ',' ||
    '"version":' || v_version::text ||
  '}';

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_identifier, 0));
  select * into v_current from public.observatorio_edicoes where id = v_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'edition_not_found';
  end if;
  if v_current.identificador <> v_identifier then
    raise exception using errcode = '22023', message = 'edition_identity_mismatch';
  end if;

  select * into v_existing from public.observatorio_edicoes_publicacoes
   where chave_idempotencia = v_key;
  if found then
    if v_existing.fingerprint = v_fingerprint and v_existing.actor_user_id = v_uid
       and v_existing.edicao_id = v_id then
      return pg_catalog.jsonb_build_object('ok', true, 'replay', true, 'status', 'publicada', 'publicada_em', v_existing.publicada_em, 'edition_id', v_id);
    end if;
    raise exception using errcode = '23505', message = 'idempotency_key_reused';
  end if;

  if v_current.status <> 'aprovada' or v_current.aprovada_em is null
     or v_current.publicada_em is not null then
    raise exception using errcode = '42501', message = 'editorial_state_not_approved';
  end if;
  if v_current.versao <> v_version then
    raise exception using errcode = '40001', message = 'stale_version';
  end if;
  if v_current.snapshot->>'contentHash' is distinct from v_hash then
    raise exception using errcode = '40001', message = 'stale_content_hash';
  end if;
  if v_current.snapshot->>'contentHash' is distinct from public.observatorio_hash_editorial(
    pg_catalog.jsonb_build_object(
      'schemaVersion', v_current.snapshot->'schemaVersion',
      'notionPageId', v_current.snapshot#>'{source,notionPageId}',
      'edition', v_current.snapshot->'edition',
      'content', v_current.snapshot->'content'
    )
  ) then
    raise exception using errcode = '22023', message = 'snapshot_hash_invalid';
  end if;

  update public.observatorio_edicoes
     set status = 'publicada', publicada_em = v_now
   where id = v_id;

  insert into public.observatorio_edicoes_publicacoes (
    edicao_id, identificador, canal, versao, content_hash, actor_user_id,
    actor_email, chave_idempotencia, fingerprint, snapshot_congelado, publicada_em
  ) values (
    v_id, v_identifier, v_current.canal, v_version, v_hash, v_uid,
    v_email, v_key, v_fingerprint, v_current.snapshot, v_now
  );

  return pg_catalog.jsonb_build_object('ok', true, 'replay', false, 'status', 'publicada', 'publicada_em', v_now, 'edition_id', v_id);
end;
$$;

revoke all on function public.observatorio_publicar_edicao(jsonb)
  from public, anon, service_role;
grant execute on function public.observatorio_publicar_edicao(jsonb) to authenticated;
