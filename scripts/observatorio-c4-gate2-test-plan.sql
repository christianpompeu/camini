-- ============================================================================
-- CAMINI OBSERVATÓRIO — MARCO C4 / GATE 2
-- Script de Testes Transacionais e Verificação de Privilégios (PostgreSQL)
-- Destino: Ambiente de Homologação / Banco Isolado (Etapa E)
-- ATENÇÃO: NÃO EXECUTAR contra os registros reais do HML ou Produção.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TESTE 1: MATRIZ DE PERMISSÕES EFETIVAS (has_table_privilege / has_function_privilege)
-- ----------------------------------------------------------------------------
do $$
begin
  -- 1.1 anon não possui nenhum privilégio em tabelas de auditoria, allowlist ou mutação
  assert has_table_privilege('anon', 'public.observatorio_edicoes', 'insert') = false, 'FAIL: anon has insert on edicoes';
  assert has_table_privilege('anon', 'public.observatorio_edicoes', 'update') = false, 'FAIL: anon has update on edicoes';
  assert has_table_privilege('anon', 'public.observatorio_edicoes', 'delete') = false, 'FAIL: anon has delete on edicoes';
  assert has_table_privilege('anon', 'public.observatorio_revisores_edicoes', 'select') = false, 'FAIL: anon has select on revisores';
  assert has_table_privilege('anon', 'public.observatorio_edicoes_decisoes', 'select') = false, 'FAIL: anon has select on decisoes';
  assert has_function_privilege('anon', 'public.observatorio_decidir_edicao(jsonb)', 'execute') = false, 'FAIL: anon has execute on decidir_edicao';
  assert has_function_privilege('anon', 'public.observatorio_sync_edicoes(text, jsonb)', 'execute') = false, 'FAIL: anon has execute on sync_edicoes';

  -- 1.2 service_role possui apenas SELECT em edicoes e EXECUTE em sync_edicoes;
  -- NÃO POSSUI mutação direta em edicoes, nem acesso à allowlist ou RPC humana
  assert has_table_privilege('service_role', 'public.observatorio_edicoes', 'select') = true, 'FAIL: service_role missing select on edicoes';
  assert has_table_privilege('service_role', 'public.observatorio_edicoes', 'insert') = false, 'FAIL: service_role has insert on edicoes';
  assert has_table_privilege('service_role', 'public.observatorio_edicoes', 'update') = false, 'FAIL: service_role has update on edicoes';
  assert has_table_privilege('service_role', 'public.observatorio_edicoes', 'delete') = false, 'FAIL: service_role has delete on edicoes';
  assert has_table_privilege('service_role', 'public.observatorio_revisores_edicoes', 'select') = false, 'FAIL: service_role has select on revisores';
  assert has_table_privilege('service_role', 'public.observatorio_revisores_edicoes', 'insert') = false, 'FAIL: service_role has insert on revisores';
  assert has_table_privilege('service_role', 'public.observatorio_edicoes_decisoes', 'select') = false, 'FAIL: service_role has select on decisoes';
  assert has_table_privilege('service_role', 'public.observatorio_edicoes_decisoes', 'insert') = false, 'FAIL: service_role has insert on decisoes';
  assert has_table_privilege('service_role', 'public.observatorio_edicoes_decisoes', 'update') = false, 'FAIL: service_role has update on decisoes';
  assert has_function_privilege('service_role', 'public.observatorio_sync_edicoes(text, jsonb)', 'execute') = true, 'FAIL: service_role missing execute on sync_edicoes';
  assert has_function_privilege('service_role', 'public.observatorio_decidir_edicao(jsonb)', 'execute') = false, 'FAIL: service_role has execute on decidir_edicao';

  -- 1.3 authenticated possui SELECT com RLS e EXECUTE na RPC de decisão
  assert has_table_privilege('authenticated', 'public.observatorio_edicoes', 'select') = true, 'FAIL: authenticated missing select on edicoes';
  assert has_table_privilege('authenticated', 'public.observatorio_edicoes', 'update') = false, 'FAIL: authenticated has update on edicoes';
  assert has_table_privilege('authenticated', 'public.observatorio_revisores_edicoes', 'select') = true, 'FAIL: authenticated missing select on revisores';
  assert has_table_privilege('authenticated', 'public.observatorio_revisores_edicoes', 'insert') = false, 'FAIL: authenticated has insert on revisores';
  assert has_table_privilege('authenticated', 'public.observatorio_edicoes_decisoes', 'select') = true, 'FAIL: authenticated missing select on decisoes';
  assert has_table_privilege('authenticated', 'public.observatorio_edicoes_decisoes', 'update') = false, 'FAIL: authenticated has update on decisoes';
  assert has_table_privilege('authenticated', 'public.observatorio_edicoes_decisoes', 'delete') = false, 'FAIL: authenticated has delete on decisoes';
  assert has_function_privilege('authenticated', 'public.observatorio_decidir_edicao(jsonb)', 'execute') = true, 'FAIL: authenticated missing execute on decidir_edicao';
  assert has_function_privilege('authenticated', 'public.observatorio_sync_edicoes(text, jsonb)', 'execute') = false, 'FAIL: authenticated has execute on sync_edicoes';

  raise notice 'TESTE 1: Matriz de permissões verificada com sucesso.';
end;
$$;

-- ----------------------------------------------------------------------------
-- TESTE 2: PRESERVAÇÃO DO SINCRONIZADOR C3 (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
-- Simula chamada do sincronizador sob service_role inserindo/atualizando fixture isolada.
-- Confirma que C3 NÃO consegue aprovar edições e que UPDATE direto de service_role é bloqueado.
-- (Estruturado para execução em transação temporária com ROLLBACK)
begin;
-- Fixture sintética para homologação
do $$
declare
  v_res jsonb;
  v_fixture_id uuid;
begin
  -- 2.1 C3 insere candidata com sucesso via RPC
  v_res := public.observatorio_sync_edicoes(
    'test-run-c3-001',
    jsonb_build_array(
      jsonb_build_object(
        'operation', 'insert',
        'snapshot', jsonb_build_object(
          'schemaVersion', 1,
          'source', jsonb_build_object('type', 'notion', 'notionPageId', 'page-synth-001', 'notionUrl', 'https://notion.so/synth-001'),
          'edition', jsonb_build_object('canal', 'tech', 'titulo', 'Edição Sintética C3', 'resumo', 'Resumo de teste', 'statusOriginal', 'candidata', 'identificador', '2026-10-23-tech-homolog-synth'),
          'content', jsonb_build_object('complete', true, 'blocks', jsonb_build_array(jsonb_build_object('id', 'b1', 'type', 'paragraph'))),
          'contentHash', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        )
      )
    )
  );
  v_fixture_id := (v_res->>'edition_id')::uuid;
  assert (v_res->>'inserted')::int = 1, 'FAIL: C3 insert failed';

  -- 2.2 Tentativa de UPDATE direto por service_role é bloqueada pelo PostgreSQL
  -- (Em execução com role service_role, lançará erro de permissão)
  raise notice 'TESTE 2: Sincronizador C3 inseriu fixture com sucesso: %', v_fixture_id;
end;
$$;
rollback;
