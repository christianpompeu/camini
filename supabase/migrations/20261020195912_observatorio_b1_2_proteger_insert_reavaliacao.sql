alter table public.observatorio_materias
  add column if not exists revisao_necessaria boolean not null default false;
alter table public.observatorio_eventos
  add column if not exists revisao_necessaria boolean not null default false;
alter table public.observatorio_relacoes
  add column if not exists revisao_necessaria boolean not null default false;

create or replace function public.observatorio_proteger_relacao_nova()
returns trigger
language plpgsql
as $$
begin
  if new.tipo = 'causal_comprovada' then
    raise exception using errcode = '42501', message = 'causalidade exige aprovacao editorial autenticada';
  end if;
  new.evidencia_status := 'hipotese';
  new.revisao := 'pendente';
  new.revisado_em := null;
  return new;
end;
$$;

drop trigger if exists observatorio_relacao_insert_editorial on public.observatorio_relacoes;
create trigger observatorio_relacao_insert_editorial
before insert on public.observatorio_relacoes
for each row execute function public.observatorio_proteger_relacao_nova();

create or replace function public.observatorio_marcar_reavaliacao()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'observatorio_materias'
     and old.status_verificacao <> 'pendente'
     and (old.titulo is distinct from new.titulo or old.resumo is distinct from new.resumo or old.formato is distinct from new.formato)
  then new.revisao_necessaria := true;
  elsif tg_table_name = 'observatorio_eventos'
     and (old.status_verificacao <> 'pendente' or old.status_sanitizacao <> 'bruto')
     and (old.titulo is distinct from new.titulo or old.descricao is distinct from new.descricao or old.categoria is distinct from new.categoria or old.data_evento is distinct from new.data_evento)
  then new.revisao_necessaria := true;
  elsif tg_table_name = 'observatorio_relacoes'
     and old.revisao in ('revisado','rejeitado')
     and (old.tipo is distinct from new.tipo or old.justificativa is distinct from new.justificativa or old.confianca is distinct from new.confianca)
  then new.revisao_necessaria := true;
  end if;
  return new;
end;
$$;

drop trigger if exists observatorio_materia_reavaliacao on public.observatorio_materias;
create trigger observatorio_materia_reavaliacao before update on public.observatorio_materias
for each row execute function public.observatorio_marcar_reavaliacao();
drop trigger if exists observatorio_evento_reavaliacao on public.observatorio_eventos;
create trigger observatorio_evento_reavaliacao before update on public.observatorio_eventos
for each row execute function public.observatorio_marcar_reavaliacao();
drop trigger if exists observatorio_relacao_reavaliacao on public.observatorio_relacoes;
create trigger observatorio_relacao_reavaliacao before update on public.observatorio_relacoes
for each row execute function public.observatorio_marcar_reavaliacao();

revoke all on function public.observatorio_proteger_relacao_nova() from public, anon, authenticated, service_role;
revoke all on function public.observatorio_marcar_reavaliacao() from public, anon, authenticated, service_role;
