import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFile(join(root, path), "utf8");

test("Dicionário RM público - Auditoria de Middleware e Rotas Públicas", async () => {
  const middleware = await read("lib/supabase/middleware.ts");

  // 1. Verifica se /dicionario-rm, /dicionario e /api/totvs-rm/tables são públicas
  assert.match(
    middleware,
    /"\/dicionario-rm"/,
    "A rota /dicionario-rm deve constar explicitamente em ALWAYS_PUBLIC_PREFIXES"
  );
  assert.match(
    middleware,
    /"\/dicionario"/,
    "A rota /dicionario deve constar em ALWAYS_PUBLIC_PREFIXES"
  );
  assert.match(
    middleware,
    /"\/api\/totvs-rm\/tables"/,
    "A API /api/totvs-rm/tables deve ser pública para consulta irrestrita do catálogo"
  );
});

test("Dicionário RM público - Estrutura da Página e Componentes", async () => {
  const [page, client, sidebar, pane, commonBar] = await Promise.all([
    read("app/dicionario-rm/page.tsx"),
    read("components/dicionario-rm/dicionario-client.tsx"),
    read("components/dicionario-rm/dicionario-sidebar.tsx"),
    read("components/dicionario-rm/table-viewer-pane.tsx"),
    read("components/dicionario-rm/common-columns-bar.tsx"),
  ]);

  // Page Server Component com SEO e Suspense
  assert.match(page, /metadata/);
  assert.match(page, /Dicionário de Dados TOTVS RM/);
  assert.match(page, /Suspense/);

  // Client Component com suporte a Split View e persistência em localStorage
  assert.match(client, /isSplitView/);
  assert.match(client, /camini_dicionario_history/);
  assert.match(client, /CommonColumnsBar/);
  assert.match(client, /TableViewerPane/);

  // Sidebar filha no estilo ChatGPT com histórico
  assert.match(sidebar, /Nova Pesquisa|Nova/);
  assert.match(sidebar, /pinned/);
  assert.match(sidebar, /Hoje/);
  assert.match(sidebar, /Últimos 7 dias/);

  // Painel de tabela com tabs de Colunas, FKs de saída, FKs de entrada e SQL
  assert.match(pane, /relacionamentos_saida/);
  assert.match(pane, /relacionamentos_entrada/);
  assert.match(pane, /WITH \(NOLOCK\)/);
  assert.match(pane, /Abrir ao Lado/);

  // Barra de colunas em comum
  assert.match(commonBar, /Relação Detectada/);
  assert.match(commonBar, /Copiar Cláusula ON/);
});

test("Dicionário RM público - Navegação no Ecossistema Camini", async () => {
  const [navbar, mobileSidebar, home, totvsRmPage] = await Promise.all([
    read("components/layout/navbar.tsx"),
    read("components/layout/mobile-sidebar.tsx"),
    read("app/page.tsx"),
    read("app/totvs-rm/page.tsx"),
  ]);

  // Navbar inclui o Dicionário RM
  assert.match(navbar, /href:\s*"\/dicionario-rm"/);
  assert.match(navbar, /Dicionário RM/);

  // Mobile Sidebar inclui o Dicionário RM
  assert.match(mobileSidebar, /href:\s*"\/dicionario-rm"/);
  assert.match(mobileSidebar, /Dicionário RM/);

  // Home Page possui card do Dicionário RM
  assert.match(home, /href="\/dicionario-rm"/);
  assert.match(home, /Dicionário RM/);

  // RM SQL AI possui link para a página dedicada
  assert.match(totvsRmPage, /href="\/dicionario-rm"/);
});

test("Dicionário RM - Integridade do Dicionário Semântico JSON", async () => {
  const dictRaw = await read("public/dicionario_rm/data/DicionarioSemantico_Completo.json");
  const dict = JSON.parse(dictRaw);

  // Tabelas fundamentais do TOTVS RM
  assert.ok(dict["TMOV"], "Tabela TMOV deve existir");
  assert.ok(dict["TITMMOV"], "Tabela TITMMOV deve existir");
  assert.ok(dict["FLAN"], "Tabela FLAN deve existir");
  assert.ok(dict["FCFO"], "Tabela FCFO deve existir");
  assert.ok(dict["PFUNC"], "Tabela PFUNC deve existir");

  // Colunas e relacionamentos
  assert.ok(dict["TMOV"].colunas.length > 50, "TMOV deve possuir dezenas de colunas");
  assert.ok(dict["TMOV"].relacionamentos_saida.length > 0, "TMOV deve ter relacionamentos de saída");
});

test("Dicionário RM - Deduplicação de Colunas e Relevância de Busca por Tabela e Campo", async () => {
  const schemaEngineCode = await read("lib/totvs-rm/schema-engine.ts");
  const tablesRouteCode = await read("app/api/totvs-rm/tables/route.ts");
  const paneCode = await read("components/dicionario-rm/table-viewer-pane.tsx");
  const sidebarCode = await read("components/dicionario-rm/dicionario-sidebar.tsx");

  // Verifica que getTableDetails implementa deduplicateColumns
  assert.match(schemaEngineCode, /deduplicateColumns/);
  assert.match(paneCode, /uniqueColumns/);
  assert.match(paneCode, /key=\{\`\$\{col\.nome\}-\$\{colIdx\}\`\}/);

  // Verifica que a rota e o schema engine implementam busca completa por tabela, coluna e descrição
  assert.match(tablesRouteCode, /searchRMTableCatalog/);
  assert.match(schemaEngineCode, /searchRMTableCatalog/);
  assert.match(schemaEngineCode, /matchedColumn/);
  assert.match(schemaEngineCode, /column_name/);
  assert.match(schemaEngineCode, /column_desc/);

  // Verifica que a sidebar renderiza o badge da coluna correspondente
  assert.match(sidebarCode, /matchedColumn/);
});

test("SQL Studio - Modal de Salvar Consulta no Histórico e Paginação de Tabelas", async () => {
  const [clientCode, editorCode, sidebarCode, routeCode] = await Promise.all([
    read("components/sql-studio/sql-studio-client.tsx"),
    read("components/sql-studio/smart-sql-editor.tsx"),
    read("components/sql-studio/sql-studio-sidebar.tsx"),
    read("app/api/totvs-rm/tables/route.ts"),
  ]);

  // 1. O alert/prompt nativo do navegador NÃO deve mais existir no fluxo de salvar histórico
  assert.doesNotMatch(
    clientCode,
    /window\.prompt/,
    "window.prompt nativo deve ser removido de sql-studio-client.tsx"
  );

  // 2. O editor inteligente possui o modal de salvar histórico com autoFocus, atalho Ctrl+S e feedback
  assert.match(
    editorCode,
    /showSaveHistoryModal/,
    "smart-sql-editor deve conter o estado e renderização de showSaveHistoryModal"
  );
  assert.match(
    editorCode,
    /Salvar Consulta no Histórico/,
    "smart-sql-editor deve conter o título do modal de salvar histórico"
  );
  assert.match(
    editorCode,
    /handleOpenSaveHistoryModal/,
    "smart-sql-editor deve disparar abertura do modal ao clicar ou pressionar Ctrl+S"
  );

  // 3. A sidebar possui suporte a carregar mais tabelas quando atingir o fim da listagem
  assert.match(
    sidebarCode,
    /hasMore && onLoadMore/,
    "sql-studio-sidebar deve verificar hasMore && onLoadMore"
  );
  assert.match(
    sidebarCode,
    /Carregar mais tabelas/,
    "sql-studio-sidebar deve exibir a opção de Carregar mais tabelas"
  );
  assert.match(
    sidebarCode,
    /Fim da lista/,
    "sql-studio-sidebar deve indicar o fim da lista quando todas forem carregadas"
  );

  // 4. A rota da API não deve impor teto artificial rígido (permite carregar até o total real de tabelas)
  assert.match(
    routeCode,
    /Math\.max\(limitParam,\s*1\)/,
    "A rota de tabelas deve permitir que o limite cresça até o total real de tabelas"
  );
  assert.doesNotMatch(
    routeCode,
    /Math\.min/,
    "A rota de tabelas não deve conter Math.min artificial travando o carregamento"
  );
});

