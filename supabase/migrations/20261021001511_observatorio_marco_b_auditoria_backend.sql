-- Fecha a cadeia minima exigida pelo trigger de auditoria executado dentro da
-- RPC SECURITY DEFINER. O owner continua sem UPDATE, DELETE ou TRUNCATE.
grant insert on table public.observatorio_decisoes_historico
  to observatorio_ingest_owner;
grant usage, select on sequence public.observatorio_decisoes_historico_id_seq
  to observatorio_ingest_owner;

drop policy if exists observatorio_ingest_owner_insert
  on public.observatorio_decisoes_historico;
create policy observatorio_ingest_owner_insert
  on public.observatorio_decisoes_historico
  for insert
  to observatorio_ingest_owner
  with check (true);

-- O adaptador server-only usa a credencial secreta do Supabase, mas sua unica
-- operacao automatizada no Observatorio permanece limitada a esta RPC.
grant observatorio_ingest_owner to postgres;
set local role observatorio_ingest_owner;
grant execute on function public.observatorio_ingest_lote(jsonb)
  to service_role;
reset role;
revoke observatorio_ingest_owner from postgres;
