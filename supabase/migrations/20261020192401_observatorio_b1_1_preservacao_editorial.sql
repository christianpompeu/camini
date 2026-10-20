-- Marco B1.1: preservacao editorial e trilha append-only de decisoes.

create table public.observatorio_decisoes_historico (
  id bigint generated always as identity primary key,
  entidade text not null,
  entidade_id uuid not null,
  operacao text not null check (operacao in ('INSERT', 'UPDATE', 'DELETE')),
  antes jsonb,
  depois jsonb,
  run_key text,
  ator text not null default current_user,
  ocorrido_em timestamptz not null default now()
);

alter table public.observatorio_decisoes_historico enable row level security;
revoke all on table public.observatorio_decisoes_historico from anon, authenticated;
grant all on table public.observatorio_decisoes_historico to service_role;
revoke all on sequence public.observatorio_decisoes_historico_id_seq from anon, authenticated;
grant all on sequence public.observatorio_decisoes_historico_id_seq to service_role;

create index obs_decisoes_historico_entidade_idx
  on public.observatorio_decisoes_historico (entidade, entidade_id, ocorrido_em desc);

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

create trigger observatorio_eventos_decisao_audit
after insert or update or delete on public.observatorio_eventos
for each row execute function public.observatorio_registrar_decisao();

create trigger observatorio_relacoes_decisao_audit
after insert or update or delete on public.observatorio_relacoes
for each row execute function public.observatorio_registrar_decisao();

create trigger observatorio_evidencias_decisao_audit
after insert or update or delete on public.observatorio_relacoes_evidencias
for each row execute function public.observatorio_registrar_decisao();

create or replace function public.observatorio_ingest_lote(p_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_round jsonb := p_payload->'round';
  v_source jsonb;
  v_article jsonb;
  v_event jsonb;
  v_relation jsonb;
  v_evidence jsonb;
  v_round_id uuid;
  v_source_id uuid;
  v_article_id uuid;
  v_event_id uuid;
  v_origin_id uuid;
  v_destination_id uuid;
  v_relation_id uuid;
  v_existing_relation_id uuid;
  v_inserted boolean;
  v_sources_inserted integer := 0;
  v_articles_inserted integer := 0;
  v_events_inserted integer := 0;
  v_relations_inserted integer := 0;
  v_evidences_inserted integer := 0;
  v_run_key text;
begin
  if jsonb_typeof(p_payload) <> 'object'
     or jsonb_typeof(v_round) <> 'object'
     or jsonb_typeof(coalesce(p_payload->'sources', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_payload->'relations', '[]'::jsonb)) <> 'array' then
    raise exception using errcode = '22023', message = 'payload deve conter round, sources e relations';
  end if;

  v_run_key := nullif(v_round->>'run_key', '');
  if v_run_key is null or nullif(v_round->>'canal', '') is null then
    raise exception using errcode = '22023', message = 'round.run_key e round.canal sao obrigatorios';
  end if;
  perform pg_catalog.set_config('observatorio.run_key', v_run_key, true);

  insert into public.observatorio_rodadas (run_key, canal, origem, status, janela_inicio, janela_fim, resumo, diagnostico)
  values (
    v_run_key, v_round->>'canal', coalesce(nullif(v_round->>'origem', ''), 'chatgpt'),
    coalesce(nullif(v_round->>'status', ''), 'executando'),
    nullif(v_round->>'janela_inicio', '')::timestamptz,
    nullif(v_round->>'janela_fim', '')::timestamptz,
    v_round->>'resumo', coalesce(v_round->'diagnostico', '{}'::jsonb)
  )
  on conflict (run_key) do update set
    canal = excluded.canal, origem = excluded.origem,
    status = case
      when public.observatorio_rodadas.status in ('concluida', 'falhou') then public.observatorio_rodadas.status
      else excluded.status
    end,
    janela_inicio = excluded.janela_inicio, janela_fim = excluded.janela_fim,
    resumo = excluded.resumo, diagnostico = excluded.diagnostico
  returning id into v_round_id;

  for v_source in select value from jsonb_array_elements(coalesce(p_payload->'sources', '[]'::jsonb)) as item(value)
  loop
    if nullif(v_source->>'dominio', '') is null or nullif(v_source->>'nome', '') is null then
      raise exception using errcode = '22023', message = 'cada source exige nome e dominio';
    end if;
    insert into public.observatorio_fontes (nome, dominio, tipo, notas)
    values (v_source->>'nome', v_source->>'dominio', coalesce(nullif(v_source->>'tipo', ''), 'jornalismo'), v_source->>'notas')
    on conflict (dominio) do update set nome = excluded.nome, tipo = excluded.tipo, notas = excluded.notas
    returning id, (xmax = 0) into v_source_id, v_inserted;
    if v_inserted then v_sources_inserted := v_sources_inserted + 1; end if;

    for v_article in select value from jsonb_array_elements(coalesce(v_source->'articles', '[]'::jsonb)) as item(value)
    loop
      if nullif(v_article->>'url_canonica', '') is null or nullif(v_article->>'titulo', '') is null or nullif(v_article->>'resumo', '') is null then
        raise exception using errcode = '22023', message = 'cada article exige url_canonica, titulo e resumo';
      end if;
      insert into public.observatorio_materias (
        fonte_id, rodada_id, url_canonica, titulo, resumo, idioma, formato,
        status_verificacao, revisao_por_pares, publicado_em, metadados
      ) values (
        v_source_id, v_round_id, v_article->>'url_canonica', v_article->>'titulo', v_article->>'resumo',
        coalesce(nullif(v_article->>'idioma', ''), 'pt'), coalesce(nullif(v_article->>'formato', ''), 'noticia'),
        coalesce(nullif(v_article->>'status_verificacao', ''), 'pendente'),
        nullif(v_article->>'revisao_por_pares', '')::boolean,
        nullif(v_article->>'publicado_em', '')::timestamptz, coalesce(v_article->'metadados', '{}'::jsonb)
      )
      on conflict (url_canonica) do update set
        fonte_id = excluded.fonte_id, rodada_id = excluded.rodada_id, titulo = excluded.titulo,
        resumo = excluded.resumo, idioma = excluded.idioma, formato = excluded.formato,
        status_verificacao = case when public.observatorio_materias.status_verificacao = 'pendente' then excluded.status_verificacao else public.observatorio_materias.status_verificacao end,
        revisao_por_pares = coalesce(public.observatorio_materias.revisao_por_pares, excluded.revisao_por_pares),
        publicado_em = coalesce(public.observatorio_materias.publicado_em, excluded.publicado_em),
        metadados = public.observatorio_materias.metadados || excluded.metadados
      returning id, (xmax = 0) into v_article_id, v_inserted;
      if v_inserted then v_articles_inserted := v_articles_inserted + 1; end if;

      for v_event in select value from jsonb_array_elements(coalesce(v_article->'events', '[]'::jsonb)) as item(value)
      loop
        if nullif(v_event->>'chave', '') is null or nullif(v_event->>'titulo', '') is null or nullif(v_event->>'descricao', '') is null or nullif(v_event->>'categoria', '') is null then
          raise exception using errcode = '22023', message = 'cada event exige chave, titulo, descricao e categoria';
        end if;
        insert into public.observatorio_eventos (
          chave, titulo, descricao, categoria, data_evento, data_evento_precisao,
          status_verificacao, status_sanitizacao, dados, visto_ultimo_em
        ) values (
          v_event->>'chave', v_event->>'titulo', v_event->>'descricao', v_event->>'categoria',
          nullif(v_event->>'data_evento', '')::timestamptz, coalesce(nullif(v_event->>'data_evento_precisao', ''), 'estimada'),
          coalesce(nullif(v_event->>'status_verificacao', ''), 'pendente'),
          coalesce(nullif(v_event->>'status_sanitizacao', ''), 'bruto'),
          coalesce(v_event->'dados', '{}'::jsonb), now()
        )
        on conflict (chave) do update set
          titulo = excluded.titulo, descricao = excluded.descricao, categoria = excluded.categoria,
          data_evento = coalesce(public.observatorio_eventos.data_evento, excluded.data_evento),
          data_evento_precisao = excluded.data_evento_precisao,
          status_verificacao = case when public.observatorio_eventos.status_verificacao = 'pendente' then excluded.status_verificacao else public.observatorio_eventos.status_verificacao end,
          status_sanitizacao = case
            when public.observatorio_eventos.status_sanitizacao in ('normalizado', 'revisado', 'fundido', 'descartado') then public.observatorio_eventos.status_sanitizacao
            else excluded.status_sanitizacao
          end,
          dados = public.observatorio_eventos.dados || excluded.dados,
          visto_ultimo_em = now()
        returning id, (xmax = 0) into v_event_id, v_inserted;
        if v_inserted then v_events_inserted := v_events_inserted + 1; end if;
        insert into public.observatorio_eventos_materias (evento_id, materia_id, papel)
        values (v_event_id, v_article_id, coalesce(nullif(v_event->>'papel', ''), 'cobertura'))
        on conflict (evento_id, materia_id) do update set papel = excluded.papel;
      end loop;
    end loop;
  end loop;

  for v_relation in select value from jsonb_array_elements(coalesce(p_payload->'relations', '[]'::jsonb)) as item(value)
  loop
    select id into v_origin_id from public.observatorio_eventos where chave = v_relation->>'origem_chave';
    select id into v_destination_id from public.observatorio_eventos where chave = v_relation->>'destino_chave';
    if v_origin_id is null or v_destination_id is null then
      raise exception using errcode = '23503', message = 'relacao referencia evento inexistente';
    end if;
    if v_relation->>'tipo' = 'causal_comprovada' then
      select id into v_existing_relation_id from public.observatorio_relacoes
      where origem_id = v_origin_id and destino_id = v_destination_id and tipo = 'causal_comprovada';
      if v_existing_relation_id is null
         or coalesce((v_relation->>'validacao_humana')::boolean, false) is not true
         or nullif(v_relation->>'validado_por', '') is null
         or nullif(v_relation->>'validado_em', '') is null
         or not exists (
           select 1 from jsonb_array_elements(coalesce(v_relation->'evidencias', '[]'::jsonb)) e
           where coalesce(e->>'papel', 'apoia') = 'apoia'
         ) then
        raise exception using errcode = '42501', message = 'causalidade exige relacao existente, validacao humana e evidencia apoia';
      end if;
    end if;
    insert into public.observatorio_relacoes (origem_id, destino_id, tipo, evidencia_status, justificativa, confianca, revisao)
    values (
      v_origin_id, v_destination_id, v_relation->>'tipo', coalesce(nullif(v_relation->>'evidencia_status', ''), 'hipotese'),
      coalesce(nullif(v_relation->>'justificativa', ''), 'sem justificativa'), nullif(v_relation->>'confianca', '')::numeric,
      coalesce(nullif(v_relation->>'revisao', ''), 'pendente')
    )
    on conflict (origem_id, destino_id, tipo) do update set
      evidencia_status = case when public.observatorio_relacoes.evidencia_status in ('confirmado', 'contestado') then public.observatorio_relacoes.evidencia_status else excluded.evidencia_status end,
      justificativa = excluded.justificativa,
      confianca = coalesce(public.observatorio_relacoes.confianca, excluded.confianca),
      revisao = case when public.observatorio_relacoes.revisao in ('revisado', 'rejeitado') then public.observatorio_relacoes.revisao else excluded.revisao end
    returning id, (xmax = 0) into v_relation_id, v_inserted;
    if v_inserted then v_relations_inserted := v_relations_inserted + 1; end if;

    for v_evidence in select value from jsonb_array_elements(coalesce(v_relation->'evidencias', '[]'::jsonb)) as item(value)
    loop
      select id into v_article_id from public.observatorio_materias where url_canonica = v_evidence->>'url_canonica';
      if v_article_id is null then
        raise exception using errcode = '23503', message = 'evidencia referencia materia inexistente';
      end if;
      insert into public.observatorio_relacoes_evidencias (relacao_id, materia_id, papel, justificativa)
      values (v_relation_id, v_article_id, coalesce(nullif(v_evidence->>'papel', ''), 'apoia'), v_evidence->>'justificativa')
      on conflict (relacao_id, materia_id, papel) do update set justificativa = coalesce(public.observatorio_relacoes_evidencias.justificativa, excluded.justificativa)
      returning (xmax = 0) into v_inserted;
      if v_inserted then v_evidences_inserted := v_evidences_inserted + 1; end if;
    end loop;
  end loop;

  return jsonb_build_object('run_key', v_run_key, 'round_id', v_round_id, 'inserted', jsonb_build_object(
    'sources', v_sources_inserted, 'articles', v_articles_inserted, 'events', v_events_inserted,
    'relations', v_relations_inserted, 'evidences', v_evidences_inserted
  ));
end;
$$;

revoke all on function public.observatorio_ingest_lote(jsonb) from public, anon, authenticated;
grant execute on function public.observatorio_ingest_lote(jsonb) to service_role;
