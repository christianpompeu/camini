-- Marco B1.2: auditoria append-only e aprovacao editorial separada da coleta.

create table public.observatorio_aprovadores (
  user_id uuid primary key,
  email text not null,
  pode_revisar boolean not null default false,
  ativo boolean not null default true,
  provisionado_em timestamptz not null default now(),
  provisionado_por text not null default current_user
);

create table public.observatorio_aprovacoes_editoriais (
  id uuid primary key default gen_random_uuid(),
  relacao_id uuid not null references public.observatorio_relacoes (id),
  decisao text not null check (decisao in ('aprovar', 'rejeitar', 'contestar', 'confirmar_causalidade')),
  aprovador_id uuid not null,
  aprovador_email text not null,
  justificativa text not null,
  decidido_em timestamptz not null default now()
);

create index obs_aprovacoes_relacao_idx
  on public.observatorio_aprovacoes_editoriais (relacao_id, decidido_em desc);

alter table public.observatorio_aprovadores enable row level security;
alter table public.observatorio_aprovacoes_editoriais enable row level security;

revoke all on table public.observatorio_aprovadores, public.observatorio_aprovacoes_editoriais
from public, anon, authenticated, service_role;
grant all on table public.observatorio_aprovadores to service_role;
grant insert on table public.observatorio_decisoes_historico to service_role;

create policy observatorio_aprovador_proprio
  on public.observatorio_aprovadores
  for select to authenticated
  using (user_id = (select auth.uid()) and ativo and pode_revisar);

-- O backend provisiona esta allowlist a partir das permissoes efetivas do Camini.
-- O solicitante nunca fornece o proprio aprovador nem a propria permissao.
grant select on table public.observatorio_aprovadores to authenticated;

create or replace function public.observatorio_bloquear_mutacao_auditoria()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if current_setting('observatorio.emergency_override', true) is distinct from 'approved' then
    raise exception using errcode = '42501', message = 'auditoria append-only: mutacao bloqueada';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger observatorio_historico_append_only
before update or delete on public.observatorio_decisoes_historico
for each row execute function public.observatorio_bloquear_mutacao_auditoria();

create trigger observatorio_aprovacoes_append_only
before update or delete on public.observatorio_aprovacoes_editoriais
for each row execute function public.observatorio_bloquear_mutacao_auditoria();

create or replace function public.observatorio_bloquear_decisao_sem_fluxo()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if current_setting('observatorio.run_key', true) is null
     and current_setting('observatorio.approval_context', true) is distinct from 'approved' then
    raise exception using errcode = '42501', message = 'decisao editorial exige ingestao controlada ou aprovacao autenticada';
  end if;
  return new;
end;
$$;

create trigger observatorio_relacao_fluxo_controlado
before update on public.observatorio_relacoes
for each row execute function public.observatorio_bloquear_decisao_sem_fluxo();

revoke update, delete on table public.observatorio_decisoes_historico,
  public.observatorio_aprovacoes_editoriais from service_role;
revoke update on sequence public.observatorio_decisoes_historico_id_seq from service_role;
grant usage, select on sequence public.observatorio_decisoes_historico_id_seq to service_role;

create or replace function public.observatorio_aprovar_relacao(
  p_relacao_id uuid,
  p_decisao text,
  p_justificativa text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_relacao public.observatorio_relacoes%rowtype;
  v_existing_causal uuid;
begin
  if v_uid is null then
    raise exception using errcode = '42501', message = 'aprovacao exige sessao autenticada';
  end if;
  if nullif(trim(p_justificativa), '') is null then
    raise exception using errcode = '22023', message = 'justificativa obrigatoria';
  end if;

  select email into v_email
  from public.observatorio_aprovadores
  where user_id = v_uid and ativo and pode_revisar;
  if v_email is null then
    raise exception using errcode = '42501', message = 'usuario sem permissao editorial efetiva';
  end if;

  select * into v_relacao
  from public.observatorio_relacoes
  where id = p_relacao_id
  for update;
  if not found then
    raise exception using errcode = '22023', message = 'relacao inexistente';
  end if;
  if p_decisao not in ('aprovar', 'rejeitar', 'contestar', 'confirmar_causalidade') then
    raise exception using errcode = '22023', message = 'decisao editorial invalida';
  end if;

  if p_decisao = 'confirmar_causalidade' then
    if v_relacao.tipo <> 'influencia_alegada'
       or not exists (
         select 1 from public.observatorio_relacoes_evidencias e
         where e.relacao_id = v_relacao.id and e.papel = 'apoia'
       ) then
      raise exception using errcode = '42501', message = 'causalidade exige influencia alegada e evidencia apoia';
    end if;
    select id into v_existing_causal
    from public.observatorio_relacoes
    where origem_id = v_relacao.origem_id and destino_id = v_relacao.destino_id
      and tipo = 'causal_comprovada';
    if v_existing_causal is not null then
      raise exception using errcode = '23505', message = 'causalidade ja registrada';
    end if;
  end if;

  insert into public.observatorio_aprovacoes_editoriais (
    relacao_id, decisao, aprovador_id, aprovador_email, justificativa
  ) values (p_relacao_id, p_decisao, v_uid, v_email, p_justificativa);

  perform set_config('observatorio.approval_context', 'approved', true);

  update public.observatorio_relacoes
  set tipo = case when p_decisao = 'confirmar_causalidade' then 'causal_comprovada' else tipo end,
      evidencia_status = case
        when p_decisao = 'aprovar' or p_decisao = 'confirmar_causalidade' then 'confirmado'
        when p_decisao = 'contestar' then 'contestado'
        else evidencia_status
      end,
      revisao = case when p_decisao = 'rejeitar' then 'rejeitado' else 'revisado' end,
      revisado_em = now()
  where id = p_relacao_id;

  return jsonb_build_object(
    'relacao_id', p_relacao_id,
    'decisao', p_decisao,
    'aprovador_id', v_uid,
    'aprovador_email', v_email
  );
end;
$$;

revoke all on function public.observatorio_aprovar_relacao(uuid, text, text)
from public, anon, service_role;
grant execute on function public.observatorio_aprovar_relacao(uuid, text, text)
to authenticated;

revoke all on function public.observatorio_bloquear_mutacao_auditoria()
  from public, anon, authenticated, service_role;
revoke all on function public.observatorio_bloquear_decisao_sem_fluxo()
  from public, anon, authenticated, service_role;
