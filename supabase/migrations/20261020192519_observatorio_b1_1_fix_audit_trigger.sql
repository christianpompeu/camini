-- Correcao do trigger generico: tabelas de evidencias nao possuem coluna id.
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
    current_user
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
