# RM SQL AI — Histórico, Estado Atual e Planejamento

Módulo `totvs-rm` do camini: chat estilo ChatGPT que gera consultas SQL
para o ERP TOTVS Corpore RM a partir do dicionário de dados em
`public/dicionario_rm/data`. Trava temporária: **somente SQL Server (T-SQL)**.

Última atualização: 17/09/2026. Status: Fases 0–1 concluídas e verificadas.

## 1. Arquitetura atual (como funciona)

```
pergunta do usuário
  → identifyRelevantTables()          (sementes: menção direta + keywords + overlap GDIC)
  → connectSeedTables()               (BFS no grafo de JOINs; inclui tabelas-ponte)
  → buildSchemaContextPrompt()        (detalhes das tabelas + JOINS GARANTIDOS)
  → cadeia LLM (selecionado → outro → fallback local)
  → validateAndNormalizeTSql()        (converte resíduos Oracle, gera avisos PT-BR)
  → resposta JSON { sqlCode, sqlExplanation, tablesUsed, tips }
```

## 2. Histórico de alterações

### Fase 0 — Trava SQL Server + validador amigável (concluída)
- `app/api/totvs-rm/chat/route.ts`: campo `dialect` do client ignorado;
  fallback reescrito em T-SQL puro (`DECLARE @`, `ISNULL`, `TOP`,
  `WITH (NOLOCK)`); nova `validateAndNormalizeTSql()` aplicada à saída do
  LLM **e** do fallback (conversões `NVL→ISNULL`, `SYSDATE→GETDATE()`,
  `VARCHAR2→VARCHAR`, `FETCH FIRST→TOP`, `:VAR→@VAR`, remove `FROM DUAL`;
  avisos PT-BR anexados ao `tips`).
- `components/totvs-rm/settings-modal.tsx`: botão Oracle desabilitado
  ("Em breve"); `app/totvs-rm/page.tsx`: normaliza settings antigos para
  `sqlserver` no load e no save.

### Fase 1 — RAG por grafo de JOINs (concluída, prioridade do usuário)
- `scripts/build-rm-index.cjs` (`npm run build:rm-index`, Node puro):
  gera `public/dicionario_rm/index/join-graph.json` —
  **30.733 arestas entre 7.127 tabelas** (5,9 MB) de
  `DicionarioGLINKSREL.json` (30.966 entradas) + `RelacionamentosRM` dos
  27 `DicionarioMaster_*.json` (68.549 rels, maioria duplicada do GLINKSREL).
  Self-loops descartados; 3 arestas com divergência de chave marcadas (`mm`).
- `lib/totvs-rm/join-graph.ts`: `findJoinPath()` (BFS, profundidade máx. 4,
  prefere chaves íntegras), `connectSeedTables()`, `formatJoinCondition()`.
- `lib/totvs-rm/schema-engine.ts`: nova seção `JOINS GARANTIDOS` no prompt
  (condição exata do dicionário + aliases) + `allocateAliases()`.
- `app/api/totvs-rm/chat/route.ts`: regra 8 do system prompt (usar
  exclusivamente os JOINs garantidos); tabelas-ponte carregadas no contexto.
- `app/api/totvs-rm/tables/route.ts`: `GET ?path=ORIGEM,DESTINO` retorna o
  caminho de JOINs (debug + futura UI).
- `scripts/rm-golden.json` + `scripts/check-golden.cjs`
  (`npm run check:rm-golden [baseUrl]`): 8 casos
  (financeiro, movimento, RH, contábil, cross-sistema, trava anti-Oracle).

### Providers chaveáveis (concluído)
- `lib/totvs-rm/llm/providers.ts`: `chatCompleteWithFailover()` + adaptadores
  Gemini (existente), Groq (OpenAI-compatível) e OpenRouter (implementado,
  **desligado** via `OPENROUTER_ENABLED = false`). 429/quota = rota
  alternativa, não erro.
- Settings: seletor Gemini/Groq (+ OpenRouter "em breve"), chave Groq
  (localStorage, como a do Gemini), modelos Groq
  (`llama-3.3-70b-versatile` padrão); servidor aceita `GROQ_API_KEY` via env.
  Chip do provider ativo no topo do chat.

### Verificação executada
- `npm run build` OK (TypeScript incluso); lint sem erros novos
  (erros restantes são padrões pré-existentes de hooks).
- Golden set **8/8 PASS** em servidor prod local; failover Groq com chave
  inválida testado (401 → fallback local T-SQL válido).

## 3. Como continuar em outra máquina

```bash
npm install
npm run build:rm-index   # regenera public/dicionario_rm/index/join-graph.json
npm run build
npm start -- --port 3100
node scripts/check-golden.cjs http://localhost:3100
```

Para usar IA real: Configurações → provedor → colar chave (Gemini e/ou Groq).

## 4. Fase 2 — Cobertura de colunas (PRÓXIMA)
1. Estender o build do índice com `column-docs.json`
   (tabela + coluna + descrição do `DicionarioGDIC.json`).
2. Em `buildSchemaContextPrompt()`, trocar a heurística atual de prefixos
   (`COD/DATA/VALOR/STATUS…`) por ranqueamento de colunas pela pergunta
   (teto ~25/tabela), **preservando sempre PK/FKs usadas nos JOINs da Fase 1**.
3. Estender o golden set com casos que exijam colunas específicas
   (ex.: "CNPJ do fornecedor" → `FCFO.CGCCFO`; "histórico salarial" →
   `PFHSTSAL`) e rodar antes/depois.

## 5. Futuro (fora de escopo por enquanto)
- Volta do Oracle: reverter a trava (`route.ts`, settings, tipos),
  recriar branches de dialeto + validador por dialeto.
- Retry de reparo: realimentar o modelo com SQL + avisos do validador (1x).
- Sinônimos PT-BR externalizados em JSON (hoje em `FREQUENT_RM_TABLES`).
- Embeddings apenas se léxico + grafo provarem insuficiência.
- Testes automatizados (hoje: verificação manual + golden set).
