import test from "node:test";
import assert from "node:assert/strict";
import { detectAutocompleteContext } from "../../../components/sql-studio/use-sql-autocomplete.ts";
import type { RMSemanticTableWithKey } from "../types.ts";
import type { ParsedTableReference, JoinOpportunity } from "../query-parser.ts";

const mockFlanDetails: RMSemanticTableWithKey = {
  tabela: "FLAN",
  descricao: "Lançamentos Financeiros",
  colunas: [
    { nome: "CODCOLIGADA", tipo: "SMALLINT", descricao: "Coligada" },
    { nome: "IDLAN", tipo: "INT", descricao: "Identificador do Lançamento" },
    { nome: "NUMERODOCUMENTO", tipo: "VARCHAR(40)", descricao: "Número do Documento" },
    { nome: "VALORORIGINAL", tipo: "DECIMAL(15,2)", descricao: "Valor do Título" },
  ],
  relacionamentos_saida: [
    {
      tabela_destino: "FCFO",
      chaves_ligacao: "CODCOLCFO,CODCFO = CODCOLIGADA,CODCFO",
      descricao: "Clientes e Fornecedores",
    },
  ],
};

const tablesInQuery: ParsedTableReference[] = [
  { tableName: "FLAN", alias: "FLAN", rawClause: "FROM FLAN" },
];

const tableDetailsMap: Record<string, RMSemanticTableWithKey> = {
  FLAN: mockFlanDetails,
};

const joinOpportunities: JoinOpportunity[] = [
  {
    baseTable: "FLAN",
    targetTable: "FCFO",
    targetDescription: "Clientes e Fornecedores",
    chavesLigacao: "FLAN.CODCOLCFO = FCFO.CODCOLIGADA AND FLAN.CODCFO = FCFO.CODCFO",
    isIncoming: false,
    joinType: "INNER JOIN",
    formattedSnippet: `    INNER JOIN\n        CORPORE.DBO.FCFO AS FCFO WITH (NOLOCK)\n            ON  FLAN.CODCOLCFO = FCFO.CODCOLIGADA\n            AND FLAN.CODCFO = FCFO.CODCFO`,
  },
];

test("Autocomplete - Detecção de Coluna via Ponto (FLAN.)", () => {
  const sql = "SELECT FLAN.";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities
  );

  assert.ok(state !== null);
  assert.equal(state?.type, "column");
  assert.equal(state?.tableLabel, "FLAN");
  assert.equal(state?.columnItems?.length, 4);
  assert.equal(state?.replaceStart, sql.length);
  assert.equal(state?.replaceEnd, sql.length);
});

test("Autocomplete - Filtragem de Coluna por Prefixo (FLAN.NUM)", () => {
  const sql = "SELECT FLAN.NUM";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities
  );

  assert.ok(state !== null);
  assert.equal(state?.type, "column");
  assert.equal(state?.prefix, "NUM");
  assert.equal(state?.columnItems?.length, 1);
  assert.equal(state?.columnItems?.[0].column.nome, "NUMERODOCUMENTO");
  // O replaceStart deve ser antes do 'NUM', logo após o '.'
  assert.equal(state?.replaceStart, sql.indexOf("NUM"));
  assert.equal(state?.replaceEnd, sql.length);
});

test("Autocomplete - Suporte a Alias Curto (F.ID)", () => {
  const tablesWithAlias: ParsedTableReference[] = [
    { tableName: "FLAN", alias: "F", rawClause: "FROM FLAN F" },
  ];
  const sql = "SELECT F.ID";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesWithAlias,
    tableDetailsMap,
    joinOpportunities
  );

  assert.ok(state !== null);
  assert.equal(state?.type, "column");
  assert.equal(state?.tableLabel, "F");
  assert.equal(state?.targetTable, "FLAN");
  assert.equal(state?.columnItems?.[0].column.nome, "IDLAN");
});

test("Autocomplete - Detecção de JOIN com Sugestões do Grafo", () => {
  const sql = "SELECT * FROM FLAN\n    INNER JOIN ";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities
  );

  assert.ok(state !== null);
  assert.equal(state?.type, "join");
  assert.equal(state?.joinItems?.length, 1);
  assert.equal(state?.joinItems?.[0].targetTable, "FCFO");
  // Deve substituir a partir do início da cláusula "INNER JOIN "
  assert.equal(sql.slice(state!.replaceStart, state!.replaceEnd), "INNER JOIN ");
});

test("Autocomplete - Silenciamento em Comentários e Strings", () => {
  // Comentário de bloco
  const sqlInComment = "/* SELECT FLAN. */";
  const stateComment = detectAutocompleteContext(
    sqlInComment,
    sqlInComment.indexOf("FLAN.") + 5,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities
  );
  assert.equal(stateComment, null);

  // String literal
  const sqlInString = "SELECT 'FLAN.'";
  const stateString = detectAutocompleteContext(
    sqlInString,
    sqlInString.length - 1,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities
  );
  assert.equal(stateString, null);
});

test("Autocomplete - Gatilho Forçado via Ctrl+Space (force = true) em palavra parcial", () => {
  // Usuário digitou 'NUM' sem ponto e apertou Ctrl+Space
  const sql = "SELECT NUM";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities,
    true
  );

  assert.ok(state !== null);
  assert.equal(state?.type, "column");
  assert.equal(state?.prefix, "NUM");
  assert.equal(state?.columnItems?.[0].column.nome, "NUMERODOCUMENTO");
});

test("Autocomplete - Gatilho Forçado via Ctrl+Space (force = true) em posição vazia", () => {
  // Usuário está em uma posição vazia e aperta Ctrl+Space para ver opções da query
  const sql = "SELECT ";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities,
    true
  );

  assert.ok(state !== null);
  // Em posição vazia forçada, retorna sugestões genéricas combinadas (colunas, keywords, snippets)
  assert.ok(state?.genericItems !== undefined || state?.columnItems !== undefined);
});

test("Autocomplete Fase 2 - Sugestão de Palavras-Chave T-SQL (WHE -> WHERE)", () => {
  const sql = "SELECT * FROM FLAN WHE";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities,
    false
  );

  assert.ok(state !== null);
  assert.ok(state?.genericItems && state.genericItems.length > 0);
  const whereItem = state?.genericItems?.find((i) => i.label === "WHERE");
  assert.ok(whereItem !== undefined);
  assert.equal(whereItem?.insertText, "WHERE ");
});

test("Autocomplete Fase 2 - Sugestão de Funções T-SQL (ISN -> ISNULL)", () => {
  const sql = "SELECT ISN";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities,
    false
  );

  assert.ok(state !== null);
  const isnullItem = state?.genericItems?.find((i) => i.label.startsWith("ISNULL"));
  assert.ok(isnullItem !== undefined);
  assert.equal(isnullItem?.type, "function");
  assert.equal(isnullItem?.insertText, "ISNULL(, )");
  assert.equal(isnullItem?.cursorOffset, 3);
});

test("Autocomplete Fase 2 - Sugestão de Snippets (CAS -> CASE WHEN)", () => {
  const sql = "SELECT CAS";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities,
    false
  );

  assert.ok(state !== null);
  const caseItem = state?.genericItems?.find((i) => i.label.startsWith("CASE"));
  assert.ok(caseItem !== undefined);
  assert.equal(caseItem?.type, "snippet");
  assert.ok(caseItem?.insertText.includes("WHEN"));
});

test("Autocomplete Fase 2 - Sugestão de Tabelas após FROM (FROM FL -> FLAN)", () => {
  const sql = "SELECT * FROM FL";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    [],
    {},
    [],
    false
  );

  assert.ok(state !== null);
  assert.equal(state?.type, "table");
  const flanItem = state?.genericItems?.find((i) => i.label === "FLAN");
  assert.ok(flanItem !== undefined);
  assert.ok(flanItem?.insertText.includes("CORPORE.DBO.FLAN AS FLAN WITH (NOLOCK)"));
});

test("Autocomplete Fase 2 - Prioridade de Ponto (FLAN.) preservada sobre palavras-chave", () => {
  const sql = "SELECT FLAN.";
  const state = detectAutocompleteContext(
    sql,
    sql.length,
    tablesInQuery,
    tableDetailsMap,
    joinOpportunities,
    false
  );

  assert.ok(state !== null);
  assert.equal(state?.type, "column");
  assert.equal(state?.tableLabel, "FLAN");
  assert.ok(state?.columnItems && state.columnItems.length > 0);
});
