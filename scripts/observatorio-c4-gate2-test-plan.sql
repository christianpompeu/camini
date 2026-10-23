-- CAMINI OBSERVATÓRIO — C4 / GATE 2
-- Plano reproduzível para banco isolado de homologação.
-- NÃO executar no HML com as seis edições reais. NÃO cria Auth nem allowlist.
-- Pré-condições: migration aplicada em banco descartável; dois UUIDs Auth já
-- existentes (um autorizado e um não autorizado); uma allowlist ativa; psql
-- conectado como DBA para preparar grants e como os papéis de teste.
-- Toda seção mutável deve ser executada em banco descartável e terminar em
-- ROLLBACK. Os comandos marcados como SESSÃO A/B são simultâneos.

\set ON_ERROR_STOP on

-- 1. Privilégios efetivos (executar como DBA; não confundir com teste de RPC).
select has_table_privilege('anon', 'public.observatorio_edicoes', 'insert') = false as anon_no_insert,
       has_table_privilege('anon', 'public.observatorio_edicoes', 'update') = false as anon_no_update,
       has_function_privilege('anon', 'public.observatorio_decidir_edicao(jsonb)', 'execute') = false as anon_no_decision,
       has_table_privilege('service_role', 'public.observatorio_edicoes', 'select') = true as service_select,
       has_table_privilege('service_role', 'public.observatorio_edicoes', 'update') = false as service_no_update,
       has_function_privilege('service_role', 'public.observatorio_sync_edicoes(text,jsonb)', 'execute') = true as service_c3,
       has_function_privilege('service_role', 'public.observatorio_decidir_edicao(jsonb)', 'execute') = false as service_no_c4,
       has_table_privilege('authenticated', 'public.observatorio_edicoes', 'select') = true as auth_select,
       has_table_privilege('authenticated', 'public.observatorio_edicoes', 'update') = false as auth_no_update,
       has_function_privilege('authenticated', 'public.observatorio_decidir_edicao(jsonb)', 'execute') = true as auth_c4,
       has_function_privilege('authenticated', 'public.observatorio_sync_edicoes(text,jsonb)', 'execute') = false as auth_no_c3;

-- 2. Vetores JS/PostgreSQL. Os hashes foram calculados por hashEditorialContent
-- (ver editorial-sync.test.ts) e devem ser retornados exatamente pelo banco.
select public.observatorio_hash_editorial(
  '{"schemaVersion":1,"notionPageId":"page-vector-1","edition":{"identificador":"2026-tech-vector","canal":"tech","titulo":"Vetor","resumo":"Resumo","criadaEm":"2026-10-23","publicadaEm":null,"statusOriginal":"candidata","revisaoOriginal":null,"slug":null,"declaredSupabaseId":null},"content":{"complete":true,"blocks":[{"id":"b1","type":"paragraph","data":{"rich_text":[{"plain_text":"Olá"}]},"children":[]}]}}'::jsonb
  = '8d3a89630655715c1e1cec373703311a332803072f6559de94115417ed1ab687' as vector_1_match,
       public.observatorio_hash_editorial(
  '{"b":2,"a":1,"nested":{"z":2,"b":3},"transient":{"url":"https://x","expiry_time":"2026-01-01T00:00:00Z"}}'::jsonb
  = 'c98da04f76ded3771fde61cef42e8415e17eff651c55c46e61ce637889de7407' as vector_2_match;

-- 3. Fixture estrutural e criptograficamente válida (SESSÃO DE PREPARAÇÃO).
-- Substitua :authorized_uid por uma Auth existente, sem criar usuário.
begin;
set local role service_role;
select public.observatorio_sync_edicoes(
  'gate2-fixture-' || txid_current()::text,
  jsonb_build_array(jsonb_build_object(
    'operation', 'insert',
    'snapshot', jsonb_build_object(
      'schemaVersion', 1,
      'source', jsonb_build_object('type','notion','notionPageId','gate2-page-' || txid_current()::text,'notionUrl','https://notion.so/gate2'),
      'edition', jsonb_build_object('canal','tech','titulo','Fixture C4 Gate 2','resumo','Fixture isolada para homologação','statusOriginal','candidata','identificador','gate2-fixture-' || txid_current()::text),
      'content', jsonb_build_object('complete',true,'blocks',jsonb_build_array(jsonb_build_object('id','b1','type','paragraph','data',jsonb_build_object('rich_text',jsonb_build_array(jsonb_build_object('plain_text','fixture'))),'children',jsonb_build_array()))),
      'contentHash', public.observatorio_hash_editorial(jsonb_build_object(
        'schemaVersion',1,
        'notionPageId','gate2-page-' || txid_current()::text,
        'edition',jsonb_build_object('canal','tech','titulo','Fixture C4 Gate 2','resumo','Fixture isolada para homologação','statusOriginal','candidata','identificador','gate2-fixture-' || txid_current()::text),
        'content',jsonb_build_object('complete',true,'blocks',jsonb_build_array(jsonb_build_object('id','b1','type','paragraph','data',jsonb_build_object('rich_text',jsonb_build_array(jsonb_build_object('plain_text','fixture'))),'children',jsonb_build_array())))
      ))
    )
  ))
);
rollback;

-- 4. Testes transacionais (cada caso começa de uma candidata diferente ou
-- restaura a fixture entre os casos):
-- 4.1 anon: chamar RPC -> 42501; authenticated sem allowlist -> 42501.
-- 4.2 revisor autorizado: payload sem actor_user_id -> aprovar/rejeitar atômico;
--     verificar status, decisão, snapshot_congelado, ator e histórico.
-- 4.3 payload com actor_user_id/actorUserId -> 42501; identidade do cliente nunca é aceita.
-- 4.4 content_hash de 64 hex arbitrário igual ao persistido -> snapshot_hash_invalid;
--     hash correto -> sucesso. Não aceitar apenas formato ou igualdade persistida.
-- 4.5 mesma chave + mesmo payload/ator -> replay=true e nenhuma segunda linha;
--     mesma chave com justificativa, decisão, ator ou edição divergente -> 23505.
-- 4.6 duas decisões simultâneas: uma vence o lock e conclui; a outra retorna
--     estado terminal/replay conforme a chave, sem segunda decisão (unique edicao/versao).
-- 4.7 C3 via service_role insere/atualiza candidata; UPDATE direto de
--     service_role, authenticated e anon falha por privilégio.
-- 4.8 C3 com hash adulterado falha; snapshot aprovado/rejeitado/publicado falha.

-- 5. Concorrência revogação/decisão — SESSÃO A (authenticated autorizado):
-- begin;
-- set local role authenticated;
-- select set_config('request.jwt.claim.sub', ':authorized_uid', true);
-- select public.observatorio_decidir_edicao(:payload::jsonb); -- segura allowlist
-- -- manter aberta para observar a sessão B
-- commit;
-- SESSÃO B (DBA, enquanto A está aberta):
-- begin;
-- update public.observatorio_revisores_edicoes set ativo=false, revogado_em=now()
--   where user_id=':authorized_uid'; -- bloqueia até A terminar
-- commit;
-- Resultado obrigatório: se B commitou antes de A adquirir o lock, A rejeita;
-- se A adquiriu primeiro, A conclui atomicamente e B só efetiva a revogação depois.

-- 6. Após cada caso, registrar manualmente: SQL/role, código SQLSTATE,
-- contagem antes/depois, status, versao, hash, linhas de decisão/histórico e
-- run_key. Não chamar resultado estático de teste transacional executado.
