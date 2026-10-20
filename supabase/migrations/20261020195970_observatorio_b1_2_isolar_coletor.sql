-- Fronteira de coleta: nenhum cliente recebe service_role.
-- Os papéis são NOLOGIN; o broker confiável deve usar uma conexão privada e
-- SET ROLE observatorio_coletor. Não há concessão administrativa ao coletor.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'observatorio_ingest_owner') then
    create role observatorio_ingest_owner nologin nosuperuser nocreatedb nocreaterole noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'observatorio_coletor') then
    create role observatorio_coletor nologin nosuperuser nocreatedb nocreaterole noinherit;
  end if;
end $$;

grant usage on schema public to observatorio_ingest_owner;
grant observatorio_ingest_owner to postgres;
grant create on schema public to observatorio_ingest_owner;
grant select, insert, update on table
  public.observatorio_rodadas,
  public.observatorio_fontes,
  public.observatorio_materias,
  public.observatorio_eventos,
  public.observatorio_eventos_materias,
  public.observatorio_relacoes,
  public.observatorio_relacoes_evidencias
  to observatorio_ingest_owner;
grant usage, select on all sequences in schema public to observatorio_ingest_owner;
alter function public.observatorio_ingest_lote(jsonb) owner to observatorio_ingest_owner;
alter function public.observatorio_ingest_lote(jsonb) security definer;
alter function public.observatorio_ingest_lote(jsonb) set search_path = pg_catalog;

revoke all on function public.observatorio_ingest_lote(jsonb) from public, anon, authenticated, service_role;
grant execute on function public.observatorio_ingest_lote(jsonb) to observatorio_coletor;

-- O service_role deixa de ser uma credencial de coleta editorial.
revoke insert, update, delete, truncate on table public.observatorio_aprovadores from service_role;
revoke update, delete, truncate on table public.observatorio_relacoes from service_role;
revoke all on table public.observatorio_aprovacoes_editoriais from service_role;
revoke create on schema public from observatorio_ingest_owner;
revoke observatorio_ingest_owner from postgres;

comment on role observatorio_coletor is
  'NOLOGIN: somente broker confiavel; nao possui grants de tabela nem fluxo editorial';
comment on role observatorio_ingest_owner is
  'NOLOGIN: proprietario restrito da RPC de ingestao; sem allowlist ou aprovacoes';
