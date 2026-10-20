-- Corrige a avaliação por tabela: OLD/NEW são registros tipados pelo trigger
-- e nunca devem acessar colunas de outra tabela.
create or replace function public.observatorio_marcar_reavaliacao()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if tg_table_name = 'observatorio_materias' then
    if old.status_verificacao <> 'pendente'
       and (old.titulo is distinct from new.titulo
         or old.resumo is distinct from new.resumo
         or old.formato is distinct from new.formato) then
      new.revisao_necessaria := true;
    end if;
    return new;
  end if;

  if tg_table_name = 'observatorio_eventos' then
    if (old.status_verificacao <> 'pendente' or old.status_sanitizacao <> 'bruto')
       and (old.titulo is distinct from new.titulo
         or old.descricao is distinct from new.descricao
         or old.categoria is distinct from new.categoria
         or old.data_evento is distinct from new.data_evento) then
      new.revisao_necessaria := true;
    end if;
    return new;
  end if;

  if tg_table_name = 'observatorio_relacoes' then
    if old.revisao in ('revisado', 'rejeitado')
       and (old.tipo is distinct from new.tipo
         or old.justificativa is distinct from new.justificativa
         or old.confianca is distinct from new.confianca) then
      new.revisao_necessaria := true;
    end if;
    return new;
  end if;

  return new;
end;
$$;

revoke all on function public.observatorio_marcar_reavaliacao() from public, anon, authenticated, service_role;
