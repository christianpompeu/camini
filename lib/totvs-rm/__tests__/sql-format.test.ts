import test from "node:test";
import assert from "node:assert/strict";
import {
  parseRmJoinPairs,
  formatRmJoinSnippet,
  formatRmJoinInline,
  generateSelectScript,
  generateJoinScript,
} from "../sql-format.ts";
import type { RMSemanticTableWithKey } from "../types.ts";

test("T-SQL Formatter - Prioridade de CODCOLIGADA no índice 0", () => {
  const rawChaves = "IDNAT,CODCOLIGADA = IDNAT2,CODCOLIGADA";
  const pairs = parseRmJoinPairs("TMOV", "DCFOP", rawChaves, false);

  assert.equal(pairs.length, 2);
  assert.equal(pairs[0].baseField, "CODCOLIGADA");
  assert.equal(pairs[0].relatedField, "CODCOLIGADA");
  assert.equal(pairs[1].baseField, "IDNAT");
  assert.equal(pairs[1].relatedField, "IDNAT2");
});

test("T-SQL Formatter - formatRmJoinSnippet com 3 níveis de indentação e alinhamento do '='", () => {
  const rawChaves = "IDNAT,CODCOLIGADA = IDNAT2,CODCOLIGADA";
  const snippet = formatRmJoinSnippet("TMOV", "DCFOP", rawChaves, {
    joinType: "INNER JOIN",
    isIncoming: false,
    indentBase: 4,
  });

  const lines = snippet.split("\n");
  assert.equal(lines[0], "    INNER JOIN");
  assert.equal(lines[1], "        CORPORE.DBO.DCFOP AS DCFOP WITH(NOLOCK)");
  assert.equal(lines[2], "            ON  DCFOP.CODCOLIGADA = TMOV.CODCOLIGADA");
  assert.equal(lines[3], "            AND DCFOP.IDNAT2      = TMOV.IDNAT");
});

test("T-SQL Formatter - formatRmJoinInline para nós compactos", () => {
  const rawChaves = "IDNAT,CODCOLIGADA = IDNAT2,CODCOLIGADA";
  const inline = formatRmJoinInline("TMOV", "DCFOP", rawChaves, false);
  assert.equal(
    inline,
    "DCFOP.CODCOLIGADA = TMOV.CODCOLIGADA AND DCFOP.IDNAT2 = TMOV.IDNAT"
  );
});

test("T-SQL Formatter - generateSelectScript obedece regras estritas", () => {
  const mockTable: RMSemanticTableWithKey = {
    tabela: "TMOV",
    descricao: "Movimentações de Estoque",
    Modulo: "Faturamento",
    colunas: [
      { nome: "CODCOLIGADA", tipo: "SMALLINT", descricao: "Código da Coligada" },
      { nome: "IDMOV", tipo: "INT", descricao: "Identificador do Movimento" },
      { nome: "CODFILIAL", tipo: "SMALLINT", descricao: "Código da Filial" },
    ],
    relacionamentos_saida: [],
  };

  const sql = generateSelectScript(mockTable);

  // 1. Proibido comentários inline (--)
  assert.ok(!sql.includes("--"), "Não pode conter comentários inline (--)");
  assert.ok(sql.includes("/*"), "Deve conter cabeçalho em bloco");

  // 2. Qualificação Completa
  assert.ok(
    sql.includes("CORPORE.DBO.TMOV AS TMOV WITH(NOLOCK)"),
    "Deve conter FROM qualificado em UPPERCASE"
  );

  // 3. Leading commas e alinhamento
  assert.ok(sql.includes("     TMOV.CODCOLIGADA"), "1ª coluna deve iniciar com 5 espaços");
  assert.ok(sql.includes("   , TMOV.IDMOV"), "2ª coluna deve iniciar com 3 espaços e vírgula");
  assert.ok(sql.includes("AS [CODCOLIGADA]"), "Alias explícito entre colchetes");
});

test("T-SQL Formatter - generateJoinScript projeta colunas sem TABELA.* e formata LEFT JOINs", () => {
  const mockTable: RMSemanticTableWithKey = {
    tabela: "TMOV",
    descricao: "Movimentações de Estoque",
    colunas: [
      { nome: "CODCOLIGADA", tipo: "SMALLINT", descricao: "Código da Coligada" },
      { nome: "IDMOV", tipo: "INT", descricao: "Identificador do Movimento" },
      { nome: "CODFILIAL", tipo: "SMALLINT", descricao: "Código da Filial" },
      { nome: "NUMEROMOV", tipo: "VARCHAR", descricao: "Número do Movimento" },
    ],
    relacionamentos_saida: [
      {
        tabela_destino: "DCFOP",
        chaves_ligacao: "IDNAT,CODCOLIGADA = IDNAT,CODCOLIGADA",
      },
    ],
  };

  const sql = generateJoinScript(mockTable);

  // Não pode conter TABELA.* nem SELECT *
  assert.ok(!sql.includes("TMOV.*"), "Proibido usar TMOV.*");
  assert.ok(!sql.includes("DCFOP.*"), "Proibido usar DCFOP.*");
  assert.ok(!sql.includes("SELECT *"), "Proibido usar SELECT *");
  assert.ok(!sql.includes("--"), "Proibido usar comentários inline (--)");

  // Deve conter projeção de DCFOP
  assert.ok(sql.includes("DCFOP_IDNAT"), "Deve projetar coluna representativa de DCFOP");

  // Indentação de 3 níveis do LEFT JOIN
  assert.ok(sql.includes("    LEFT JOIN"), "Nível 1 do LEFT JOIN deve ter 4 espaços");
  assert.ok(
    sql.includes("        CORPORE.DBO.DCFOP AS DCFOP WITH(NOLOCK)"),
    "Nível 2 do LEFT JOIN deve ter 8 espaços"
  );
  assert.ok(
    sql.includes("            ON  DCFOP.CODCOLIGADA = TMOV.CODCOLIGADA"),
    "Nível 3 do LEFT JOIN deve ter 12 espaços com ON na CODCOLIGADA"
  );
  assert.ok(sql.endsWith(";"), "Deve finalizar com ponto e vírgula");
});
