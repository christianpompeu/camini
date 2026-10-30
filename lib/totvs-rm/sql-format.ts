import type { RMSemanticTableWithKey, RMSemanticColumn } from "./types";

export interface RmJoinPair {
  baseField: string;
  relatedField: string;
}

export interface FormatJoinSnippetOptions {
  joinType?: "INNER JOIN" | "LEFT JOIN";
  isIncoming?: boolean;
  indentBase?: number; // padrão 4 espaços para nível 1
  includeSemicolon?: boolean;
}

/**
 * Analisa e pareia as chaves de ligação de relacionamentos do TOTVS RM,
 * garantindo ordenação com prioridade absoluta para campos de Coligada (CODCOLIGADA / COLIGADA) no índice 0.
 */
export function parseRmJoinPairs(
  baseTable: string,
  relatedTable: string,
  chavesLigacao: string,
  isIncoming = false
): RmJoinPair[] {
  if (!chavesLigacao || typeof chavesLigacao !== "string") {
    return [];
  }

  const parts = chavesLigacao.split("=");
  if (parts.length !== 2) {
    const rawCols = chavesLigacao
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    return rawCols.map((col) => ({ baseField: col, relatedField: col }));
  }

  const leftFields = parts[0]
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  const rightFields = parts[1]
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  const count = Math.min(leftFields.length, rightFields.length);
  const pairs: RmJoinPair[] = [];

  for (let i = 0; i < count; i++) {
    if (isIncoming) {
      // Incoming: tabela_origem (left) aponta para tabela_destino / baseTable (right)
      pairs.push({
        relatedField: leftFields[i],
        baseField: rightFields[i],
      });
    } else {
      // Outgoing: baseTable (left) relaciona com tabela_destino (right)
      pairs.push({
        baseField: leftFields[i],
        relatedField: rightFields[i],
      });
    }
  }

  // Regra de ouro: CODCOLIGADA / CODCOL... deve ser a primeira condição (índice 0)
  pairs.sort((a, b) => {
    const aIsCol =
      a.baseField.startsWith("CODCOL") ||
      a.relatedField.startsWith("CODCOL") ||
      a.baseField.includes("COLIGADA") ||
      a.relatedField.includes("COLIGADA");

    const bIsCol =
      b.baseField.startsWith("CODCOL") ||
      b.relatedField.startsWith("CODCOL") ||
      b.baseField.includes("COLIGADA") ||
      b.relatedField.includes("COLIGADA");

    if (aIsCol && !bIsCol) return -1;
    if (!aIsCol && bIsCol) return 1;
    return 0;
  });

  return pairs;
}

/**
 * Formata o bloco de JOIN em 3 níveis hierárquicos com alinhamento vertical dos sinais de '=':
 * Nível 1 (4 espaços): INNER JOIN ou LEFT JOIN
 * Nível 2 (8 espaços): CORPORE.DBO.{TABELA_REL} AS {TABELA_REL} WITH(NOLOCK)
 * Nível 3 (12 espaços): ON  {TABELA_REL}.{CAMPO_REL} = {TABELA_BASE}.{CAMPO_BASE}
 *           (12 espaços): AND {TABELA_REL}.{CAMPO_REL} = {TABELA_BASE}.{CAMPO_BASE}
 */
export function formatRmJoinSnippet(
  baseTable: string,
  relatedTable: string,
  chavesLigacao: string,
  options: FormatJoinSnippetOptions = {}
): string {
  const {
    joinType = "INNER JOIN",
    isIncoming = false,
    indentBase = 4,
    includeSemicolon = false,
  } = options;

  const bTable = (baseTable || "").trim().toUpperCase();
  const rTable = (relatedTable || "").trim().toUpperCase();
  const pairs = parseRmJoinPairs(bTable, rTable, chavesLigacao, isIncoming);

  const spcLevel1 = " ".repeat(indentBase);
  const spcLevel2 = " ".repeat(indentBase + 4);
  const spcLevel3 = " ".repeat(indentBase + 8);

  if (pairs.length === 0) {
    return `${spcLevel1}${joinType}\n${spcLevel2}CORPORE.DBO.${rTable} AS ${rTable} WITH(NOLOCK)\n${spcLevel3}ON  /* Chave não especificada */${
      includeSemicolon ? ";" : ""
    }`;
  }

  // Prepara as expressões da esquerda ({TABELA_REL}.{CAMPO_REL}) para calcular o padEnd
  const leftExpressions = pairs.map((p) => `${rTable}.${p.relatedField}`);
  const maxLeftLen = Math.max(...leftExpressions.map((e) => e.length));

  const conditionLines = pairs.map((pair, idx) => {
    const isFirst = idx === 0;
    const clauseKeyword = isFirst ? "ON  " : "AND ";
    const leftExpr = `${rTable}.${pair.relatedField}`.padEnd(maxLeftLen, " ");
    const rightExpr = `${bTable}.${pair.baseField}`;
    return `${spcLevel3}${clauseKeyword}${leftExpr} = ${rightExpr}`;
  });

  const lines = [
    `${spcLevel1}${joinType}`,
    `${spcLevel2}CORPORE.DBO.${rTable} AS ${rTable} WITH(NOLOCK)`,
    ...conditionLines,
  ];

  let result = lines.join("\n");
  if (includeSemicolon) {
    result += ";";
  }
  return result;
}

/**
 * Formata em 1 linha compacta para cards do canvas no Grafo:
 * Exemplo: DCFOP.CODCOLIGADA = TMOV.CODCOLIGADA AND DCFOP.IDNAT = TMOV.IDNAT2
 */
export function formatRmJoinInline(
  baseTable: string,
  relatedTable: string,
  chavesLigacao: string,
  isIncoming = false
): string {
  const bTable = (baseTable || "").trim().toUpperCase();
  const rTable = (relatedTable || "").trim().toUpperCase();
  const pairs = parseRmJoinPairs(bTable, rTable, chavesLigacao, isIncoming);

  if (pairs.length === 0) {
    return chavesLigacao || "1 = 1";
  }

  return pairs
    .map((p) => `${rTable}.${p.relatedField} = ${bTable}.${p.baseField}`)
    .join(" AND ");
}

/**
 * Formata a projeção de coluna com vírgulas frontais e alinhamento do AS:
 * 1ª coluna: 5 espaços -> "     {TABELA}.{COLUNA}.padEnd(40, ' ')AS [{ALIAS}]"
 * Demais:    3 espaços + ", " -> "   , {TABELA}.{COLUNA}.padEnd(40, ' ')AS [{ALIAS}]"
 */
export function formatColumnProjection(
  tableName: string,
  columnName: string,
  isFirst: boolean,
  customAlias?: string
): string {
  const prefix = isFirst ? "     " : "   , ";
  const expr = `${tableName}.${columnName}`;
  const alias = customAlias || columnName;
  const paddedExpr = expr.length < 40 ? expr.padEnd(40, " ") : `${expr} `;
  return `${prefix}${paddedExpr}AS [${alias}]`;
}

/**
 * Gera o Template 1: "TEMPLATE DE CONSULTA SELECT (T-SQL)"
 */
export function generateSelectScript(
  table: RMSemanticTableWithKey,
  moduleName?: string
): string {
  const tName = table.tabela.trim().toUpperCase();
  const modTitle = moduleName || table.Modulo || "Geral RM";
  const desc = table.descricao || "Tabela do TOTVS RM";

  const header = `/* =====================================================================
   TOTVS CORPORE RM - ${modTitle}
   Tabela: ${tName} (${desc})
   Dialeto: Microsoft SQL Server T-SQL
   ===================================================================== */
SET NOCOUNT ON;

SELECT
     TOP 100`;

  const cols = (table.colunas || []).filter((c) => Boolean(c && c.nome));
  const maxDisplayCols = 15;
  const displayCols = cols.slice(0, maxDisplayCols);

  const columnLines = displayCols.map((c, idx) =>
    formatColumnProjection(tName, c.nome.toUpperCase(), idx === 0)
  );

  const moreNotice =
    cols.length > maxDisplayCols
      ? `\n   /* ... mais ${cols.length - maxDisplayCols} colunas disponíveis na tabela ${tName} */`
      : "";

  const fromClause = `FROM
    CORPORE.DBO.${tName} AS ${tName} WITH(NOLOCK);`;

  return `${header}\n${columnLines.join("\n")}${moreNotice}\n${fromClause}`;
}

/**
 * Gera o Template 2: "TEMPLATE COM JOINS DOCUMENTADOS"
 */
export function generateJoinScript(table: RMSemanticTableWithKey): string {
  const tName = table.tabela.trim().toUpperCase();
  const desc = table.descricao || "Tabela do TOTVS RM";
  const rels = table.relacionamentos_saida || [];

  const header = `/* =====================================================================
   TOTVS CORPORE RM - CONSULTA COM JOINS DOCUMENTADOS
   Tabela Base: ${tName} (${desc})
   Dialeto: Microsoft SQL Server T-SQL
   ===================================================================== */
SET NOCOUNT ON;`;

  // Seleciona as colunas principais/chave da tabela base (5 a 8 colunas)
  const allCols = (table.colunas || []).filter((c) => Boolean(c && c.nome));
  const primaryKeys = allCols.filter((c) => {
    const n = c.nome.toUpperCase();
    return (
      n.startsWith("COD") ||
      n.startsWith("ID") ||
      n === "CHAPA" ||
      n.startsWith("NUMERO") ||
      n.startsWith("DATA")
    );
  });

  const baseColList: RMSemanticColumn[] =
    primaryKeys.length >= 3 ? primaryKeys.slice(0, 7) : allCols.slice(0, 7);

  // Projeção das colunas da tabela base
  const projectionLines: string[] = [];
  baseColList.forEach((col, idx) => {
    projectionLines.push(
      formatColumnProjection(tName, col.nome.toUpperCase(), idx === 0)
    );
  });

  // Se não houver relacionamentos de saída documentados
  if (rels.length === 0) {
    return `${header}

/* Tabela ${tName} não possui relacionamentos de saída documentados no dicionário. */
SELECT
     TOP 100
${projectionLines.join("\n")}
FROM
    CORPORE.DBO.${tName} AS ${tName} WITH(NOLOCK);`;
  }

  // Limita os relacionamentos para demonstrar sem poluir a consulta (até 4 relacionamentos)
  const activeRels = rels.slice(0, 4);

  // Projeta 1 coluna representativa de cada tabela relacionada (usando a chave ligada da tabela de destino)
  activeRels.forEach((rel) => {
    const destTable = rel.tabela_destino.trim().toUpperCase();
    const pairs = parseRmJoinPairs(tName, destTable, rel.chaves_ligacao, false);

    // Seleciona uma coluna de destino representativa (evita CODCOLIGADA se houver outra chave específica)
    let repCol = pairs.find(
      (p) => !p.relatedField.startsWith("CODCOL") && !p.relatedField.includes("COLIGADA")
    )?.relatedField;

    if (!repCol && pairs.length > 0) {
      repCol = pairs[0].relatedField;
    }
    if (!repCol) {
      repCol = "ID";
    }

    projectionLines.push(
      formatColumnProjection(
        destTable,
        repCol,
        false,
        `${destTable}_${repCol}`
      )
    );
  });

  // Monta a cláusula FROM e os LEFT JOINs
  const fromClause = `FROM\n    CORPORE.DBO.${tName} AS ${tName} WITH(NOLOCK)`;

  const joinBlocks = activeRels.map((rel, index) => {
    const destTable = rel.tabela_destino.trim().toUpperCase();
    const isLast = index === activeRels.length - 1;
    return formatRmJoinSnippet(tName, destTable, rel.chaves_ligacao, {
      joinType: "LEFT JOIN",
      isIncoming: false,
      indentBase: 4,
      includeSemicolon: isLast,
    });
  });

  return `${header}

SELECT
     TOP 100
${projectionLines.join("\n")}
${fromClause}
${joinBlocks.join("\n")}`;
}
