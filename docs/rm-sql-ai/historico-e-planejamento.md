# RM SQL AI — Histórico, Estado Atual e Planejamento

Módulo `totvs-rm` do camini: chat estilo ChatGPT que gera consultas SQL
para o ERP TOTVS Corpore RM a partir do dicionário de dados em
`public/dicionario_rm/data`. Trava temporária: **somente SQL Server (T-SQL)**.

Última atualização: 18/09/2026. Status: Fases 0–2 concluídas + fallback corrigido + Fase D (verificador) concluída.

## 1. Arquitetura atual (como funciona)

```
pergunta do usuário
  → identifyRelevantTables()          (sementes: menção direta + keywords + overlap GDIC)
  → connectSeedTables()               (BFS no grafo de JOINs; inclui tabelas-ponte)
  → buildSchemaContextPrompt(tabelas, pergunta)  (ranking léxico de colunas via
     column-docs.json + JOINS GARANTIDOS; teto 25/tabela, PK/FKs sempre preservadas)
  → cadeia LLM (selecionado → outro → fallback local)
  → validateAndNormalizeTSql()        (converte resíduos Oracle, gera avisos PT-BR)
  → verifySql()                       (AST: tabelas ⊆ permitidas, JOINs com lastro
     no grafo, filtros obrigatórios; rejeitado → 1 reparo com diagnóstico)
  → resposta JSON { sqlCode, sqlExplanation, tablesUsed, tips, isFallback, repaired }
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

### Fallback determinístico (corrigido em 18/09/2026)
- Bug: pedido de vendas com lançamentos ("...movimentos... com ...lançamentos
  financeiros...", coligada 9, filial 3, CODTMV 2.2.58, TPAGTO) caía no cenário
  financeiro (FLAN+FCFO, `PAGREC=1`, `STATUSLAN=0`, coligada 1), porque
  "financeiros" contém "financeiro" e o cenário financeiro era checado antes
  do de movimentos. O caminho LLM estava correto (identifica TMOV+TPAGTO e o
  grafo tem a cadeia TMOV→TMOVPAGTO→TPAGTO→FLAN) — a resposta errada veio do
  fallback, i.e. sem LLM ativo (dev server não reiniciado após preencher
  `.env.local`, ou falha dos providers).
- Correção em `lib/totvs-rm/fallback-sql.ts` (extraído de `route.ts` para
  módulo puro e testável; rota só importa):
  1. cenário de movimentos agora vem **antes** do financeiro;
  2. novo ramo de pagamentos: `tpagto/tmovpagto/"forma de pagamento"` →
     `TMOV→TMOVPAGTO→TPAGTO→FLAN` com os JOINs canônicos do dicionário;
  3. extração de parâmetros do prompt (`extractColigada`, `extractFilial`,
     `extractCodtmvList`, `extractDays`, com defaults 1/1/30d) aplicada aos
     cenários de movimento.
- `FREQUENT_RM_TABLES`: novas entradas `TPAGTO` e `TMOVPAGTO`; `FLAN` casa
  também `financeiro/lancamento/lançamento`. System prompt (item 3) documenta
  a cadeia de pagamentos.
- Golden 10 → **11 casos** (`vendas-pagto-lancamentos`: coligada 9, filial 3,
  `2.2.58` → `TMOV+TMOVPAGTO+TPAGTO+FLAN`).
- Operacional: o Next lê `.env.local` só no boot — **sempre reinicie
  `npm run dev` após editar as chaves**. Resposta do fallback vem marcada
  com `isFallback: true`.

### Providers chaveáveis (concluído)
- `lib/totvs-rm/llm/providers.ts`: `chatCompleteWithFailover()` + adaptadores
  Gemini (existente), Groq (OpenAI-compatível) e OpenRouter (implementado,
  **desligado** via `OPENROUTER_ENABLED = false`). 429/quota = rota
  alternativa, não erro.
- Settings: seletor Gemini/Groq (+ OpenRouter "em breve"), chave Groq
  (localStorage, como a do Gemini), modelos Groq
  (`llama3-70b-8192` padrão); servidor aceita `GROQ_API_KEY` via env.
  Chip do provider ativo no topo do chat.

### Fase D — Verificador semântico + reparo (concluída em 18/09/2026)
Estratégia aprovada: LLM-first com verificação; dependências npm permitidas.
- `lib/totvs-rm/sql-verify.ts` (novo, puro e testável offline): analisa o SQL
  com AST real (`node-sql-parser`, dialeto `transactsql`, Apache-2.0) e rejeita
  com diagnóstico em PT-BR (`PARSE_ERROR`, `UNKNOWN_TABLE`,
  `JOIN_NOT_GROUNDED`, `MISSING_FILTER`). JOIN é aceito se tiver lastro em
  **qualquer aresta do grafo** (`getAllEdges()` em `join-graph.ts`), não só nas
  do plano sequencial; CTEs com nome próprio são permitidas.
- `route.ts`: após o LLM, verifica; rejeitado → 1 tentativa de reparo
  (system prompt + adendo com o diagnóstico e o SQL rejeitado); ainda falhou →
  fallback. Resposta inclui `repaired: true/false` (além de `isFallback`).
- Spike registrado: parser lida com `DECLARE+SELECT`, `WITH (NOLOCK)`,
  `CORPORE.DBO.`, `@variáveis`, `IN`, `CASE`; `tableList/columnList` com
  resolução de aliases; CTE vem como `{ name: { value } }`.
- Golden: `check-golden.cjs` com `expectAbsent` (ex.: vendas não pode conter
  `PAGREC =`, `STATUSLAN = 0`, `TITMMOV`); **11/11 PASS** com o verificador
  ativo e nenhum falso-positivo nos casos antigos.

### Verificação executada
- `npm run build` OK (TypeScript incluso); lint sem erros novos
  (erros restantes são padrões pré-existentes de hooks).
- Golden set **11/11 PASS** em servidor prod local (era 8/8 nas Fases 0–1);
  failover Groq com chave inválida testado (401 → fallback local T-SQL válido).

## 3. Como continuar em outra máquina

```bash
npm install
npm run build:rm-index   # regenera index/join-graph.json + index/column-docs.json
npm run build
npm start -- --port 3100
node scripts/check-golden.cjs http://localhost:3100
```

Para usar IA real: Configurações → provedor → colar chave (Gemini e/ou Groq).

## 4. Fase 2 — Cobertura de colunas (concluída em 18/09/2026)
1. Build do índice estendido com `column-docs.json`
   (tabela → coluna → descrição do `DicionarioGDIC.json`):
   **130.927 colunas / 8.745 tabelas** (~5,8 MB), gerado por
   `scripts/build-rm-index.cjs` (`npm run build:rm-index`).
2. `buildSchemaContextPrompt(tabelas, pergunta)` agora ranqueia colunas pela
   pergunta (teto `MAX_COLUMNS_PER_TABLE = 25`/tabela), **preservando sempre
   PK/FKs dos JOINs da Fase 1 + `CODCOLIGADA`**:
   `lib/totvs-rm/schema-engine.ts` — `loadColumnDocs()`, `rankColumnsForTable()`,
   `scoreColumn()` (casa nome concatenado `NOMEFANTASIA`↔"fantasia" e descrição
   `CGCCFO`/"CNPJ"↔"cnpj", com radical para `salario/salarial/historico`).
   Sem pergunta (chamadas legadas), mantém a heurística antiga de prefixos.
   `app/api/totvs-rm/chat/route.ts` passa `userPrompt` ao contexto.
3. Golden set estendido de 8 → **10 casos** (`scripts/rm-golden.json`):
   - `financeiro-cnpj-coluna` ("...CNPJ e nome fantasia do fornecedor" →
     `FCFO.CGCCFO` + `NOMEFANTASIA`);
   - `rh-historico-salarial-colunas` ("...historico salarial, data de mudanca
     e valor do salario" → `PFHSTSAL.SALARIO` + `DTMUDANCA`).
   Fallback RH (`route.ts`) agora inclui `LEFT JOIN PFHSTSAL` +
   `SALARIO/DTMUDANCA/MOTIVO` quando a pergunta cita histórico, então os casos
   novos passam com ou sem chave de LLM. `check-golden.cjs` com contagem
   dinâmica (`GOLDEN OK (N/N)`).
4. `identifyRelevantTables()`: `PFHSTSAL` agora casa também `salarial` e
   `historico` (antes só `salario`/`histórico salarial`).

### Verificação executada (Fase 2)
- Antes/depois do ranking (sem servidor): `FCFO.CGCCFO` ausente → presente;
  `PFHSTSAL.SALARIO`/`DTMUDANCA` ausentes → presentes; teto 25/tabela
  respeitado; JOINs garantidos preservados.
- `npm run build` OK (TypeScript incluso); ESLint sem erros novos
  (restam só os `require()` pré-existentes dos scripts `.cjs`).
- Golden set **10/10 PASS** em servidor prod local (`npm start -- --port 3100`).

## 5. Futuro (fora de escopo por enquanto)
- Volta do Oracle: reverter a trava (`route.ts`, settings, tipos),
  recriar branches de dialeto + validador por dialeto.
- Retry de reparo: realimentar o modelo com SQL + avisos do validador (1x).
- Sinônimos PT-BR externalizados em JSON (hoje em `FREQUENT_RM_TABLES`).
- Embeddings apenas se léxico + grafo provarem insuficiência.
- Testes automatizados (hoje: verificação manual + golden set).
