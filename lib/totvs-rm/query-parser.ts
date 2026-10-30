import { parseRmJoinPairs, formatRmJoinSnippet } from "./sql-format.ts";
import type { RMSemanticTableWithKey, RMSemanticColumn } from "./types.ts";

export interface ParsedTableReference {
  tableName: string;
  alias: string;
  joinType?: string;
  rawClause: string;
}

export interface JoinOpportunity {
  baseTable: string;
  targetTable: string;
  targetDescription?: string;
  targetModulo?: string;
  chavesLigacao: string;
  isIncoming: boolean;
  joinType: "INNER JOIN" | "LEFT JOIN";
  formattedSnippet: string;
}

export interface QueryQualityCheck {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  severity: "error" | "warning" | "info";
  fixSuggestion?: string;
}

export interface QueryAnalysisResult {
  tables: ParsedTableReference[];
  selectedColumns: string[];
  qualityChecks: QueryQualityCheck[];
  hasErrors: boolean;
}

/**
 * Extrai referências de tabelas presentes em consultas T-SQL do TOTVS RM
 * com suporte a schemas CORPORE.DBO, aliases e WITH (NOLOCK).
 */
export function extractTablesFromQuery(sql: string): ParsedTableReference[] {
  if (!sql || typeof sql !== "string") return [];

  const tables: ParsedTableReference[] = [];
  const seenAliases = new Set<string>();

  // 1. Extração do FROM
  const fromRegex = /\bFROM\s+([A-Za-z0-9_.]+(?:\.[A-Za-z0-9_.]+)*)(?:\s+(?:AS\s+)?([A-Za-z0-9_]+))?(?:\s+WITH\s*\([^)]*\))?/gi;
  let match: RegExpExecArray | null;

  while ((match = fromRegex.exec(sql)) !== null) {
    const rawTable = match[1].trim();
    const parts = rawTable.split(".");
    const tableName = (parts[parts.length - 1] || rawTable).toUpperCase();
    const alias = (match[2] || tableName).toUpperCase();

    if (!seenAliases.has(alias) && tableName.length > 1) {
      seenAliases.add(alias);
      tables.push({
        tableName,
        alias,
        rawClause: match[0],
      });
    }
  }

  // 2. Extração de JOINs (INNER JOIN, LEFT JOIN, etc.)
  const joinRegex = /\b((?:INNER|LEFT|RIGHT|FULL|CROSS)\s+(?:OUTER\s+)?JOIN)\s+([A-Za-z0-9_.]+(?:\.[A-Za-z0-9_.]+)*)(?:\s+(?:AS\s+)?([A-Za-z0-9_]+))?(?:\s+WITH\s*\([^)]*\))?/gi;

  while ((match = joinRegex.exec(sql)) !== null) {
    const joinType = match[1].replace(/\s+/g, " ").toUpperCase();
    const rawTable = match[2].trim();
    const parts = rawTable.split(".");
    const tableName = (parts[parts.length - 1] || rawTable).toUpperCase();
    const alias = (match[3] || tableName).toUpperCase();

    if (!seenAliases.has(alias) && tableName.length > 1) {
      seenAliases.add(alias);
      tables.push({
        tableName,
        alias,
        joinType,
        rawClause: match[0],
      });
    }
  }

  return tables;
}

/**
 * Extrai campos selecionados no bloco SELECT de uma query simples.
 */
export function extractColumnsFromSelect(sql: string): string[] {
  if (!sql) return [];

  const selectMatch = sql.match(/\bSELECT\s+(?:DISTINCT\s+)?(?:TOP\s+\d+\s+)?([\s\S]*?)\bFROM\b/i);
  if (!selectMatch || !selectMatch[1]) return [];

  return selectMatch[1]
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

/**
 * Validação rigorosa de conformidade corporativa para T-SQL do TOTVS RM:
 * - Sem comentários inline (--) que quebram o interpretador do RM
 * - Qualificação completa CORPORE.DBO
 * - WITH (NOLOCK) presente em todas as tabelas
 * - Validação de filtro de CODCOLIGADA
 */
export function validateRmSqlQuery(sql: string): QueryQualityCheck[] {
  const checks: QueryQualityCheck[] = [];

  if (!sql.trim()) {
    return [
      {
        id: "empty",
        label: "Consulta Vazia",
        description: "Escreva ou selecione uma tabela para iniciar a consulta.",
        passed: false,
        severity: "info",
      },
    ];
  }

  // 1. Proibição de comentários inline --
  const hasInlineComments = /--[^\r\n]*/.test(sql);
  checks.push({
    id: "no_inline_comments",
    label: "Sem Comentários Inline (--)",
    description: hasInlineComments
      ? "O interpretador do TOTVS RM falha com comentários inline '--'. Substitua por /* ... */."
      : "Nenhum comentário inline '--' detectado.",
    passed: !hasInlineComments,
    severity: "error",
    fixSuggestion: "Substituir comentários '--' por blocos '/* ... */'",
  });

  // 2. Qualificação CORPORE.DBO.
  const tables = extractTablesFromQuery(sql);
  const tablesWithoutCorpore = tables.filter((t) => {
    const pattern = new RegExp(`(?:FROM|JOIN)\\s+(?:CORPORE\\.DBO\\.)?${t.tableName}\\b`, "i");
    const m = sql.match(pattern);
    return m ? !m[0].toUpperCase().includes("CORPORE.DBO.") : false;
  });

  const hasCorpore = tables.length > 0 && tablesWithoutCorpore.length === 0;
  checks.push({
    id: "corpore_schema",
    label: "Qualificação CORPORE.DBO",
    description: hasCorpore
      ? "Todas as tabelas estão devidamente qualificadas com CORPORE.DBO."
      : `Tabelas sem prefixo CORPORE.DBO: ${tablesWithoutCorpore.map((t) => t.tableName).join(", ") || "Nenhuma"}`,
    passed: hasCorpore,
    severity: "warning",
    fixSuggestion: "Adicionar 'CORPORE.DBO.' no FROM e JOINs",
  });

  // 3. WITH (NOLOCK)
  const tablesWithoutNolock = tables.filter((t) => {
    const pattern = new RegExp(
      `(?:FROM|JOIN)\\s+(?:CORPORE\\.DBO\\.)?${t.tableName}(?:\\s+(?:AS\\s+)?${t.alias})?(?:\\s+WITH\\s*\\([^)]*NOLOCK[^)]*\\))?`,
      "i"
    );
    const m = sql.match(pattern);
    return m ? !m[0].toUpperCase().includes("NOLOCK") : true;
  });

  const hasNolock = tables.length > 0 && tablesWithoutNolock.length === 0;
  checks.push({
    id: "with_nolock",
    label: "Instrução WITH (NOLOCK)",
    description: hasNolock
      ? "Todas as tabelas utilizam WITH (NOLOCK) para evitar deadlocks no RM."
      : `Tabelas sem WITH (NOLOCK): ${tablesWithoutNolock.map((t) => t.tableName).join(", ")}`,
    passed: hasNolock,
    severity: "warning",
    fixSuggestion: "Adicionar 'WITH (NOLOCK)' após cada tabela/alias",
  });

  // 4. Filtro por Coligada (CODCOLIGADA / CODCOLCFO)
  const hasColigadaInQuery =
    /CODCOLIGADA|CODCOLCFO|CODCOLPAG|CODCOL/i.test(sql) || tables.length === 0;
  checks.push({
    id: "coligada_filter",
    label: "Isolamento Multicoligada",
    description: hasColigadaInQuery
      ? "Referência a CODCOLIGADA detectada nos relacionamentos ou filtros."
      : "Nenhuma referência a CODCOLIGADA detectada. O RM exige isolamento por coligada para evitar vazamento de dados.",
    passed: hasColigadaInQuery,
    severity: "warning",
    fixSuggestion: "Incluir filtro de coligada (ex: WHERE CODCOLIGADA = 1 ou no JOIN)",
  });

  return checks;
}

/**
 * Descobre todas as oportunidades de JOIN possíveis para as tabelas atualmente na consulta,
 * consultando o grafo de relacionamentos semânticos (saída e entrada).
 */
export function findAvailableJoins(
  tablesInQuery: ParsedTableReference[],
  tableDetailsMap: Record<string, RMSemanticTableWithKey>
): JoinOpportunity[] {
  if (!tablesInQuery || tablesInQuery.length === 0) return [];

  const existingTableNames = new Set(tablesInQuery.map((t) => t.tableName.toUpperCase()));
  const opportunities: JoinOpportunity[] = [];
  const seenPairKey = new Set<string>();

  tablesInQuery.forEach((baseRef) => {
    const details = tableDetailsMap[baseRef.tableName.toUpperCase()];
    if (!details) return;

    // 1. Relacionamentos de Saída (FKs de saída do RM: baseTable aponta para targetTable)
    (details.relacionamentos_saida || []).forEach((rel) => {
      const dest = rel.tabela_destino.toUpperCase();
      if (!existingTableNames.has(dest) && !seenPairKey.has(`${baseRef.alias}->${dest}`)) {
        seenPairKey.add(`${baseRef.alias}->${dest}`);

        const formatted = formatRmJoinSnippet(baseRef.alias, dest, rel.chaves_ligacao, {
          joinType: "INNER JOIN",
          isIncoming: false,
        });

        opportunities.push({
          baseTable: baseRef.alias,
          targetTable: dest,
          targetDescription: rel.descricao || "",
          targetModulo: rel.tabela_destino.charAt(0),
          chavesLigacao: rel.chaves_ligacao,
          isIncoming: false,
          joinType: "INNER JOIN",
          formattedSnippet: formatted,
        });
      }
    });

    // 2. Relacionamentos de Entrada (tabelas filhas que apontam para esta tabela)
    (details.relacionamentos_entrada || []).forEach((rel) => {
      const orig = rel.tabela_origem.toUpperCase();
      if (!existingTableNames.has(orig) && !seenPairKey.has(`${orig}->${baseRef.alias}`)) {
        seenPairKey.add(`${orig}->${baseRef.alias}`);

        const formatted = formatRmJoinSnippet(baseRef.alias, orig, rel.chaves_ligacao, {
          joinType: "INNER JOIN",
          isIncoming: true,
        });

        opportunities.push({
          baseTable: baseRef.alias,
          targetTable: orig,
          targetDescription: `Tabela filha que referencia ${baseRef.alias}`,
          targetModulo: orig.charAt(0),
          chavesLigacao: rel.chaves_ligacao,
          isIncoming: true,
          joinType: "INNER JOIN",
          formattedSnippet: formatted,
        });
      }
    });
  });

  return opportunities;
}

/**
 * Insere um novo JOIN na consulta SQL existente, posicionando-o de forma cirúrgica
 * logo após o último JOIN ou após a cláusula FROM.
 */
export function appendJoinToQuery(currentSql: string, joinSnippet: string): string {
  if (!currentSql.trim()) return joinSnippet;

  // Se houver WHERE, insere imediatamente antes do WHERE
  const whereMatch = currentSql.match(/\bWHERE\b/i);
  if (whereMatch && typeof whereMatch.index === "number") {
    const beforeWhere = currentSql.slice(0, whereMatch.index).trimEnd();
    const fromWhereOn = currentSql.slice(whereMatch.index);
    return `${beforeWhere}\n${joinSnippet}\n${fromWhereOn}`;
  }

  // Se houver GROUP BY / ORDER BY, insere antes deles
  const groupMatch = currentSql.match(/\b(?:GROUP\s+BY|ORDER\s+BY)\b/i);
  if (groupMatch && typeof groupMatch.index === "number") {
    const beforeGroup = currentSql.slice(0, groupMatch.index).trimEnd();
    const fromGroupOn = currentSql.slice(groupMatch.index);
    return `${beforeGroup}\n${joinSnippet}\n${fromGroupOn}`;
  }

  // Caso contrário, anexa ao final
  return `${currentSql.trimEnd()}\n${joinSnippet}`;
}

/**
 * Adiciona uma coluna na cláusula SELECT existente, preservando vírgulas à esquerda (padrão corporativo).
 */
export function appendColumnToSelect(currentSql: string, columnExpr: string): string {
  if (!currentSql.trim()) {
    return `SELECT\n        ${columnExpr}\nFROM ...`;
  }

  const fromMatch = currentSql.match(/\bFROM\b/i);
  if (!fromMatch || typeof fromMatch.index !== "number") {
    return currentSql;
  }

  const beforeFrom = currentSql.slice(0, fromMatch.index).trimEnd();
  const fromOnwards = currentSql.slice(fromMatch.index);

  // Se o SELECT ainda estiver com asterisco '*', substitui
  if (/\bSELECT\s+\*\s*$/i.test(beforeFrom)) {
    return `SELECT\n        ${columnExpr}\n${fromOnwards}`;
  }

  // Formato vírgula à esquerda: "      , COLUNA"
  const updatedSelect = `${beforeFrom}\n      , ${columnExpr}\n${fromOnwards}`;
  return updatedSelect;
}
