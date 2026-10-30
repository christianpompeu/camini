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

export interface ColumnProjectionParsed {
  expr: string;
  alias: string;
}

/**
 * Divide expressões de projeção (colunas do SELECT) respeitando parênteses e strings literais.
 */
export function splitSqlProjectionItems(rawCols: string): string[] {
  const items: string[] = [];
  let current = "";
  let parenDepth = 0;
  let inString = false;

  // Normaliza leading commas (ex: "\n      , CAMPO") para vírgulas padrão (", CAMPO")
  const cleanRaw = rawCols
    .replace(/\r?\n\s*,/g, ", ")
    .replace(/\r?\n/g, " ");

  for (let i = 0; i < cleanRaw.length; i++) {
    const char = cleanRaw[i];

    if (char === "'" && cleanRaw[i - 1] !== "\\") {
      inString = !inString;
      current += char;
    } else if (!inString && char === "(") {
      parenDepth++;
      current += char;
    } else if (!inString && char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      current += char;
    } else if (!inString && parenDepth === 0 && char === ",") {
      const trimmed = current.trim();
      if (trimmed) items.push(trimmed);
      current = "";
    } else {
      current += char;
    }
  }

  const lastTrimmed = current.trim();
  if (lastTrimmed) items.push(lastTrimmed);

  return items;
}

/**
 * Normaliza e gera alias entre colchetes [ALIAS] para cada coluna da projeção,
 * resolvendo duplicidades automaticamente com base no nome da tabela.
 */
export function parseAndNormalizeColumns(colItems: string[]): ColumnProjectionParsed[] {
  const usedAliases = new Set<string>();
  const results: ColumnProjectionParsed[] = [];

  for (const item of colItems) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    if (trimmed === "*") {
      results.push({ expr: "*", alias: "" });
      continue;
    }

    // Procura alias explícito no final: expr AS [ALIAS] ou expr AS ALIAS ou expr [ALIAS] ou expr ALIAS
    const aliasRegex = /\s+(?:AS\s+)?(?:\[([^\]]+)\]|([A-Za-z0-9_]+))$/i;
    const match = trimmed.match(aliasRegex);

    let expr = trimmed;
    let explicitAlias = "";

    if (match) {
      explicitAlias = match[1] || match[2] || "";
      expr = trimmed.substring(0, match.index).trim();
    }

    let finalAlias = explicitAlias;

    if (!finalAlias) {
      // Se não há alias explícito, infere a partir do campo
      const dotParts = expr.split(".");
      const candidate = dotParts[dotParts.length - 1].replace(/[^A-Za-z0-9_]/g, "").trim().toUpperCase();

      if (candidate && !usedAliases.has(candidate)) {
        finalAlias = candidate;
      } else if (candidate && dotParts.length >= 2) {
        // Duplicidade! Cria alias desambiguado com o nome da tabela: TABELA_CAMPO
        const tblName = dotParts[dotParts.length - 2].replace(/[^A-Za-z0-9_]/g, "").trim().toUpperCase();
        const disambiguated = `${tblName}_${candidate}`;
        if (!usedAliases.has(disambiguated)) {
          finalAlias = disambiguated;
        } else {
          let count = 2;
          while (usedAliases.has(`${disambiguated}_${count}`)) {
            count++;
          }
          finalAlias = `${disambiguated}_${count}`;
        }
      } else if (candidate) {
        let count = 2;
        while (usedAliases.has(`${candidate}_${count}`)) {
          count++;
        }
        finalAlias = `${candidate}_${count}`;
      } else {
        finalAlias = "CAMPO";
      }
    }

    usedAliases.add(finalAlias.toUpperCase());
    results.push({ expr, alias: finalAlias });
  }

  return results;
}

/**
 * Formata de forma robusta e inteligente qualquer consulta T-SQL para o padrão corporativo TOTVS RM:
 * - Preserva cabeçalhos e comentários em bloco
 * - Transforma comentários inline -- em /* ... *\/
 * - Projeção de colunas com alias obrigatório entre colchetes [ALIAS] e vírgulas alinhadas à esquerda
 * - Cláusula FROM com schema CORPORE.DBO.{TABELA} AS {ALIAS} WITH (NOLOCK) sem espaços desnecessários no início
 * - Cláusulas JOIN aninhadas em 3 níveis (Nível 1: JOIN, Nível 2: TABELA, Nível 3: ON/AND alinhados)
 * - Cláusula WHERE sem espaço inicial e com AND/OR alinhados
 * - Cláusula ORDER BY sem espaço inicial
 * - Finalização com ';'
 */
export function formatRmSqlQuery(sql: string): string {
  if (!sql || !sql.trim()) return sql;

  let text = sql.trim();

  // 1. Converte comentários inline -- para /* ... */
  text = text.replace(/--([^\r\n]*)/g, "/* $1 */");

  // 2. Extrai comentários de cabeçalho no topo
  const headerComments: string[] = [];
  while (text.startsWith("/*")) {
    const endIdx = text.indexOf("*/");
    if (endIdx === -1) break;
    headerComments.push(text.substring(0, endIdx + 2).trim());
    text = text.substring(endIdx + 2).trim();
  }

  // 3. Verifica se possui estrutura SELECT ... FROM
  const selectMatch = text.match(/^\s*SELECT\b([\s\S]*?)\bFROM\b/i);
  if (!selectMatch) {
    // Se não for um SELECT padrão, faz substituições seguras de FROM e JOIN sem duplicar
    let fallback = text.replace(
      /\bFROM\s+([A-Za-z0-9_.]+(?:\.[A-Za-z0-9_.]+)*)(?:\s+(?:AS\s+)?(?!\b(?:WHERE|INNER|LEFT|RIGHT|FULL|CROSS|JOIN|GROUP|HAVING|ORDER|UNION|WITH)\b)([A-Za-z0-9_]+))?(?:\s+WITH\s*\([^)]*\))?/gi,
      (m, rawTbl, alias) => {
        const parts = rawTbl.split(".");
        const uTbl = parts[parts.length - 1].toUpperCase();
        const uAlias = (alias || uTbl).toUpperCase();
        return `FROM CORPORE.DBO.${uTbl} AS ${uAlias} WITH (NOLOCK)`;
      }
    );
    fallback = fallback.replace(
      /\b((?:INNER|LEFT|RIGHT|FULL|CROSS)\s+(?:OUTER\s+)?JOIN)\s+([A-Za-z0-9_.]+(?:\.[A-Za-z0-9_.]+)*)(?:\s+(?:AS\s+)?(?!\b(?:ON|WHERE|INNER|LEFT|RIGHT|FULL|CROSS|JOIN|GROUP|HAVING|ORDER|UNION|WITH)\b)([A-Za-z0-9_]+))?(?:\s+WITH\s*\([^)]*\))?/gi,
      (m, jType, rawTbl, alias) => {
        const uType = jType.replace(/\s+/g, " ").toUpperCase();
        const parts = rawTbl.split(".");
        const uTbl = parts[parts.length - 1].toUpperCase();
        const uAlias = (alias || uTbl).toUpperCase();
        return `    ${uType}\n        CORPORE.DBO.${uTbl} AS ${uAlias} WITH (NOLOCK)`;
      }
    );
    return headerComments.length > 0 ? `${headerComments.join("\n")}\n${fallback}` : fallback;
  }

  // Bloco SELECT
  const rawSelectCols = selectMatch[1].trim();
  let selectPrefix = "SELECT";
  let colContent = rawSelectCols;

  const topMatch = colContent.match(/^(DISTINCT\s+)?(TOP\s+\d+\s+)?([\s\S]*)$/i);
  if (topMatch && (topMatch[1] || topMatch[2])) {
    const distinct = topMatch[1] ? topMatch[1].trim().toUpperCase() + " " : "";
    const top = topMatch[2] ? topMatch[2].trim().toUpperCase() : "";
    const prefix = `${distinct}${top}`.trim();
    if (prefix) {
      selectPrefix = `SELECT\n        ${prefix}`;
    }
    colContent = topMatch[3] ? topMatch[3].trim() : "";
  }

  let selectClause = "";
  if (colContent === "*" || colContent === "") {
    if (selectPrefix === "SELECT") {
      selectClause = "SELECT\n        *";
    } else {
      selectClause = `${selectPrefix} *`;
    }
  } else {
    const rawItems = splitSqlProjectionItems(colContent);
    const parsedCols = parseAndNormalizeColumns(rawItems);

    // Calcula padEnd para alinhar verticalmente todos os "AS [ALIAS]"
    const maxExprLen = Math.max(30, ...parsedCols.map((c) => c.expr.length));

    const formattedCols = parsedCols.map((col, idx) => {
      const prefix = idx === 0 && selectPrefix === "SELECT" ? "        " : "      , ";
      if (!col.alias) {
        return `${prefix}${col.expr}`;
      }
      const paddedExpr = col.expr.padEnd(maxExprLen, " ");
      return `${prefix}${paddedExpr}AS [${col.alias}]`;
    });

    if (selectPrefix === "SELECT") {
      selectClause = `SELECT\n${formattedCols.join("\n")}`;
    } else {
      selectClause = `${selectPrefix}\n${formattedCols.join("\n")}`;
    }
  }

  // Restante a partir do FROM
  const fromAndBeyond = text.substring(selectMatch[0].length - 4);

  // 1. Cláusula FROM (sem espaços no início)
  const fromMatch = fromAndBeyond.match(
    /\bFROM\s+([A-Za-z0-9_.]+(?:\.[A-Za-z0-9_.]+)*)(?:\s+(?:AS\s+)?(?!\b(?:WHERE|INNER|LEFT|RIGHT|FULL|CROSS|JOIN|GROUP|HAVING|ORDER|UNION|WITH)\b)([A-Za-z0-9_]+))?(?:\s+WITH\s*\([^)]*\))?/i
  );

  if (!fromMatch) {
    return text;
  }

  const rawFromTable = fromMatch[1].trim();
  const fromParts = rawFromTable.split(".");
  const pureFromTable = fromParts[fromParts.length - 1].toUpperCase();
  const fromAlias = (fromMatch[2] || pureFromTable).toUpperCase();
  const formattedFrom = `FROM CORPORE.DBO.${pureFromTable} AS ${fromAlias} WITH (NOLOCK)`;

  const afterFrom = fromAndBeyond.substring(fromMatch.index! + fromMatch[0].length);

  // Divide o restante em seções
  const joinBlocks: string[] = [];
  let whereBlock = "";
  let groupByBlock = "";
  let havingBlock = "";
  let orderByBlock = "";

  const regexClauses = /\b((?:INNER|LEFT|RIGHT|FULL|CROSS)\s+(?:OUTER\s+)?JOIN|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY)\b/gi;
  const tokens: { keyword: string; index: number; fullMatch: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = regexClauses.exec(afterFrom)) !== null) {
    tokens.push({
      keyword: m[1].replace(/\s+/g, " ").toUpperCase(),
      index: m.index,
      fullMatch: m[0],
    });
  }

  if (tokens.length === 0) {
    let cleanRest = afterFrom.trim();
    if (cleanRest.startsWith(";")) cleanRest = "";
    const result = `${selectClause}\n${formattedFrom}${cleanRest ? `\n${cleanRest}` : ""};`;
    return headerComments.length > 0 ? `${headerComments.join("\n")}\n${result}` : result;
  }

  // Processa as seções
  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i];
    const next = tokens[i + 1];
    const sectionBody = afterFrom
      .substring(cur.index + cur.fullMatch.length, next ? next.index : undefined)
      .trim();

    if (cur.keyword.endsWith("JOIN")) {
      const joinTblMatch = sectionBody.match(
        /^([A-Za-z0-9_.]+(?:\.[A-Za-z0-9_.]+)*)(?:\s+(?:AS\s+)?(?!\b(?:ON|WHERE|INNER|LEFT|RIGHT|FULL|CROSS|JOIN|GROUP|HAVING|ORDER|UNION|WITH)\b)([A-Za-z0-9_]+))?(?:\s+WITH\s*\([^)]*\))?(?:\s+ON\s+([\s\S]*))?$/i
      );

      if (joinTblMatch) {
        const rawTbl = joinTblMatch[1];
        const jParts = rawTbl.split(".");
        const pureJTable = jParts[jParts.length - 1].toUpperCase();
        const jAlias = (joinTblMatch[2] || pureJTable).toUpperCase();
        const onContent = joinTblMatch[3] ? joinTblMatch[3].trim() : "";

        // JOIN Aninhado em 3 níveis:
        // Nível 1: 4 espaços: "    INNER JOIN"
        // Nível 2: 8 espaços: "        CORPORE.DBO.TABELA AS ALIAS WITH (NOLOCK)"
        // Nível 3: 12 espaços: "            ON  ..." / "            AND ..."
        const level1 = `    ${cur.keyword}`;
        const level2 = `        CORPORE.DBO.${pureJTable} AS ${jAlias} WITH (NOLOCK)`;

        if (onContent) {
          const onConditions = onContent
            .split(/\b(AND|OR)\b/i)
            .map((s) => s.trim())
            .filter(Boolean);

          const formattedConditions: string[] = [];
          let pendingOperator = "";

          for (let cIdx = 0; cIdx < onConditions.length; cIdx++) {
            const item = onConditions[cIdx];
            const uItem = item.toUpperCase();
            if (uItem === "AND" || uItem === "OR") {
              pendingOperator = uItem;
            } else {
              if (formattedConditions.length === 0) {
                formattedConditions.push(`            ON  ${item}`);
              } else {
                const op = pendingOperator || "AND";
                const pad = op === "AND" ? "            AND " : "            OR  ";
                formattedConditions.push(`${pad}${item}`);
                pendingOperator = "";
              }
            }
          }
          joinBlocks.push(`${level1}\n${level2}\n${formattedConditions.join("\n")}`);
        } else {
          joinBlocks.push(`${level1}\n${level2}`);
        }
      } else {
        joinBlocks.push(`    ${cur.keyword}\n        ${sectionBody}`);
      }
    } else if (cur.keyword === "WHERE") {
      const whereConditions = sectionBody
        .split(/\b(AND|OR)\b/i)
        .map((s) => s.trim())
        .filter(Boolean);

      const formattedWhere: string[] = [];
      let pendingOp = "";

      for (let wIdx = 0; wIdx < whereConditions.length; wIdx++) {
        const item = whereConditions[wIdx];
        const uItem = item.toUpperCase();
        if (uItem === "AND" || uItem === "OR") {
          pendingOp = uItem;
        } else {
          if (formattedWhere.length === 0) {
            // WHERE sem espaço no início da linha
            formattedWhere.push(`WHERE ${item}`);
          } else {
            const op = pendingOp || "AND";
            const pad = op === "AND" ? "  AND " : "   OR ";
            formattedWhere.push(`${pad}${item}`);
            pendingOp = "";
          }
        }
      }
      whereBlock = formattedWhere.join("\n");
    } else if (cur.keyword === "GROUP BY") {
      groupByBlock = `GROUP BY\n    ${sectionBody.replace(/\s+/g, " ")}`;
    } else if (cur.keyword === "HAVING") {
      havingBlock = `HAVING ${sectionBody.replace(/\s+/g, " ")}`;
    } else if (cur.keyword === "ORDER BY") {
      let cleanOrder = sectionBody.replace(/;+$/, "").trim();
      // ORDER BY sem espaço no início da linha, campos indentados com 4 espaços
      orderByBlock = `ORDER BY\n    ${cleanOrder}`;
    }
  }

  // Monta a consulta final
  const queryParts = [selectClause, formattedFrom];
  if (joinBlocks.length > 0) {
    queryParts.push(joinBlocks.join("\n"));
  }
  if (whereBlock) {
    queryParts.push(whereBlock);
  }
  if (groupByBlock) {
    queryParts.push(groupByBlock);
  }
  if (havingBlock) {
    queryParts.push(havingBlock);
  }
  if (orderByBlock) {
    queryParts.push(orderByBlock);
  }

  let finalQuery = queryParts.join("\n");
  if (!finalQuery.endsWith(";")) {
    finalQuery += ";";
  }

  return headerComments.length > 0
    ? `${headerComments.join("\n")}\n${finalQuery}`
    : finalQuery;
}


