begin;

-- A criacao dos registros exercita o mesmo contrato usado pelo backend.
set local role observatorio_coletor;
select public.observatorio_ingest_lote($json$
{
  "round": {"run_key":"ci-reavaliacao","canal":"tech","origem":"fixture-administrativa","status":"concluida"},
  "sources": [{
    "nome":"CI Synthetic",
    "dominio":"ci-recheck.example",
    "tipo":"institucional",
    "articles":[{
      "url_canonica":"https://ci-recheck.example/item",
      "titulo":"Materia CI",
      "resumo":"Resumo",
      "events":[
        {"chave":"ci-recheck-event-1","titulo":"Evento CI","descricao":"Descricao","categoria":"tecnologia"},
        {"chave":"ci-recheck-event-2","titulo":"Evento CI 2","descricao":"Descricao 2","categoria":"tecnologia"}
      ]
    }]
  }],
  "relations":[{
    "origem_chave":"ci-recheck-event-1",
    "destino_chave":"ci-recheck-event-2",
    "tipo":"influencia_alegada",
    "justificativa":"hipotese",
    "evidencias":[{"url_canonica":"https://ci-recheck.example/item","papel":"contextualiza"}]
  }]
}$json$::jsonb);

-- A reavaliacao editorial e deliberadamente administrativa e fica isolada
-- nesta transacao descartavel.
reset role;
do $$
declare
  v_materia uuid;
  v_evento uuid;
  v_relacao uuid;
begin
  select id into strict v_materia from public.observatorio_materias
    where url_canonica = 'https://ci-recheck.example/item';
  select id into strict v_evento from public.observatorio_eventos
    where chave = 'ci-recheck-event-1';
  select id into strict v_relacao from public.observatorio_relacoes
    where origem_id = v_evento;

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
