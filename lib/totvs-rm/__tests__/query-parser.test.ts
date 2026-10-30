import test from "node:test";
import assert from "node:assert/strict";
import {
  extractTablesFromQuery,
  extractColumnsFromSelect,
  validateRmSqlQuery,
  findAvailableJoins,
  appendJoinToQuery,
  appendColumnToSelect,
} from "../query-parser.ts";
import type { RMSemanticTableWithKey } from "../types.ts";

test("Query Parser - Extração de Tabelas e Aliases", () => {
  const sql = `
    SELECT FLAN.IDLAN, FCFO.NOMEFANTASIA
      FROM CORPORE.DBO.FLAN AS FLAN WITH (NOLOCK)
     INNER JOIN CORPORE.DBO.FCFO AS FCFO WITH (NOLOCK)
             ON FLAN.CODCOLCFO = FCFO.CODCOLIGADA
            AND FLAN.CODCFO = FCFO.CODCFO
  `;

  const tables = extractTablesFromQuery(sql);
  assert.equal(tables.length, 2);
  assert.equal(tables[0].tableName, "FLAN");
  assert.equal(tables[0].alias, "FLAN");
  assert.equal(tables[1].tableName, "FCFO");
  assert.equal(tables[1].alias, "FCFO");
  assert.equal(tables[1].joinType, "INNER JOIN");
});

test("Query Parser - Validação de Conformidade T-SQL RM", () => {
  // Query inválida: sem NOLOCK, sem CORPORE.DBO e com comentário inline --
  const badSql = `
    -- Comentário inline que quebra RM
    SELECT * FROM FLAN
  `;

  const badChecks = validateRmSqlQuery(badSql);
  const inlineCommentCheck = badChecks.find((c) => c.id === "no_inline_comments");
  const nolockCheck = badChecks.find((c) => c.id === "with_nolock");
  const corporeCheck = badChecks.find((c) => c.id === "corpore_schema");

  assert.equal(inlineCommentCheck?.passed, false);
  assert.equal(nolockCheck?.passed, false);
  assert.equal(corporeCheck?.passed, false);

  // Query válida
  const goodSql = `
    /* Comentário de bloco permitido */
    SELECT FLAN.CODCOLIGADA, FLAN.IDLAN
      FROM CORPORE.DBO.FLAN AS FLAN WITH (NOLOCK)
     WHERE FLAN.CODCOLIGADA = 1
  `;

  const goodChecks = validateRmSqlQuery(goodSql);
  assert.ok(goodChecks.every((c) => c.passed), "Query boa deve passar em todas as checagens");
});

test("Query Parser - Descoberta Inteligente de Oportunidades de JOIN", () => {
  const flanDetails: RMSemanticTableWithKey = {
    tabela: "FLAN",
    descricao: "Lançamentos Financeiros",
    colunas: [
      { nome: "CODCOLIGADA", tipo: "smallint", descricao: "Coligada" },
      { nome: "IDLAN", tipo: "int", descricao: "Identificador do lançamento" },
      { nome: "CODCFO", tipo: "varchar(25)", descricao: "Código do cliente/fornecedor" },
    ],
    relacionamentos_saida: [
      {
        tabela_destino: "FCFO",
        chaves_ligacao: "CODCOLCFO,CODCFO=CODCOLIGADA,CODCFO",
        descricao: "Cliente ou Fornecedor",
      },
      {
        tabela_destino: "GFILIAL",
        chaves_ligacao: "CODCOLIGADA,CODFILIAL=CODCOLIGADA,CODFILIAL",
        descricao: "Filial",
      },
    ],
    relacionamentos_entrada: [
      {
        tabela_origem: "FLANRATCCU",
        chaves_ligacao: "CODCOLIGADA,IDLAN=CODCOLIGADA,IDLAN",
      },
    ],
  };

  const tablesInQuery = [{ tableName: "FLAN", alias: "FLAN", rawClause: "FROM FLAN" }];
  const tableMap = { FLAN: flanDetails };

  const opportunities = findAvailableJoins(tablesInQuery, tableMap);
  assert.equal(opportunities.length, 3, "FLAN deve ter 3 oportunidades de JOIN (2 de saída + 1 de entrada)");

  // FCFO deve ser uma oportunidade de JOIN evidente para FLAN
  const fcfoOpp = opportunities.find((o) => o.targetTable === "FCFO");
  assert.ok(fcfoOpp, "FCFO deve ser sugerido para FLAN");
  assert.match(fcfoOpp.formattedSnippet, /CORPORE\.DBO\.FCFO/);
  assert.match(fcfoOpp.formattedSnippet, /WITH\s*\(NOLOCK\)/);
});

test("Query Parser - Inserção Precisa de JOIN antes de WHERE ou ORDER BY", () => {
  const baseSql = `SELECT FLAN.IDLAN FROM CORPORE.DBO.FLAN AS FLAN WITH (NOLOCK) WHERE FLAN.CODCOLIGADA = 1;`;
  const joinSnippet = ` INNER JOIN CORPORE.DBO.FCFO AS FCFO WITH (NOLOCK)\n         ON FLAN.CODCOLCFO = FCFO.CODCOLIGADA`;

  const result = appendJoinToQuery(baseSql, joinSnippet);
  const whereIndex = result.indexOf("WHERE");
  const joinIndex = result.indexOf("INNER JOIN");

  assert.ok(joinIndex < whereIndex, "JOIN deve ser inserido antes do WHERE");
});

test("Query Parser - Adição de Colunas com Vírgula à Esquerda", () => {
  const baseSql = `SELECT\n        FLAN.IDLAN\n  FROM CORPORE.DBO.FLAN AS FLAN WITH (NOLOCK)`;
  const updated = appendColumnToSelect(baseSql, "FLAN.NUMERODOCUMENTO");

  assert.match(updated, /,\s*FLAN\.NUMERODOCUMENTO/);
  assert.match(updated, /FROM/);
});
