begin;
set local role observatorio_coletor;
select set_config('observatorio.run_key','ci-reavaliacao',true);
do $$
declare
  v_fonte uuid;
  v_materia uuid;
  v_evento uuid;
  v_evento2 uuid;
  v_relacao uuid;
begin
  insert into public.observatorio_fontes(nome,dominio,tipo)
  values ('CI Synthetic','ci-recheck.example','institucional')
  on conflict (dominio) do update set nome=excluded.nome
  returning id into v_fonte;
  insert into public.observatorio_materias(fonte_id,url_canonica,titulo,resumo)
  values (v_fonte,'https://ci-recheck.example/item','Materia CI','Resumo') returning id into v_materia;
  insert into public.observatorio_eventos(chave,titulo,descricao,categoria)
  values ('ci-event-'||gen_random_uuid(),'Evento CI','Descricao','tecnologia') returning id into v_evento;
  insert into public.observatorio_eventos(chave,titulo,descricao,categoria)
  values ('ci-event-2-'||gen_random_uuid(),'Evento CI 2','Descricao 2','tecnologia') returning id into v_evento2;
  insert into public.observatorio_relacoes(origem_id,destino_id,tipo,justificativa)
  values (v_evento,v_evento2,'influencia_alegada','hipotese') returning id into v_relacao;
  update public.observatorio_materias set status_verificacao='checado' where id=v_materia;
  update public.observatorio_materias set titulo='Materia CI alterada' where id=v_materia;
  update public.observatorio_eventos set status_verificacao='verificado',status_sanitizacao='revisado' where id=v_evento;
  update public.observatorio_eventos set titulo='Evento CI alterado' where id=v_evento;
  update public.observatorio_relacoes set revisao='revisado' where id=v_relacao;
  update public.observatorio_relacoes set justificativa='alteracao material' where id=v_relacao;
  if not (select revisao_necessaria from public.observatorio_materias where id=v_materia) then raise exception 'materia recheck missing'; end if;
  if not (select revisao_necessaria from public.observatorio_eventos where id=v_evento) then raise exception 'evento recheck missing'; end if;
  if not (select revisao_necessaria from public.observatorio_relacoes where id=v_relacao) then raise exception 'relacao recheck missing'; end if;
end $$;
rollback;
