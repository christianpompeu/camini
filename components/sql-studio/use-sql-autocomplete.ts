"use client";

import { useMemo } from "react";
import type { RMSemanticTableWithKey, RMSemanticColumn } from "../../lib/totvs-rm/types.ts";
import type { ParsedTableReference, JoinOpportunity } from "../../lib/totvs-rm/query-parser.ts";
import { formatRmJoinSnippet } from "../../lib/totvs-rm/sql-format.ts";
import type { AutocompleteTriggerType, ColumnSuggestionItem } from "./sql-autocomplete-card.tsx";

export interface AutocompleteState {
  type: AutocompleteTriggerType;
  tableLabel?: string;
  targetTable?: string;
  prefix: string;
  replaceStart: number;
  replaceEnd: number;
  columnItems?: ColumnSuggestionItem[];
  joinItems?: JoinOpportunity[];
}

/**
 * Verifica se a posição do cursor está dentro de comentário ou string literal
 */
function isInsideCommentOrString(sql: string, cursorPos: number): boolean {
  const textBefore = sql.slice(0, cursorPos);

  // 1. Bloco de Comentário /* ... */
  const lastBlockOpen = textBefore.lastIndexOf("/*");
  const lastBlockClose = textBefore.lastIndexOf("*/");
  if (lastBlockOpen !== -1 && lastBlockOpen > lastBlockClose) {
    return true;
  }

  // 2. Comentário de Linha --
  const lastNewline = textBefore.lastIndexOf("\n");
  const currentLineBefore = lastNewline === -1 ? textBefore : textBefore.slice(lastNewline + 1);
  if (currentLineBefore.includes("--")) {
    return true;
  }

  // 3. String Literal com aspas simples '...'
  let quoteCount = 0;
  for (let i = 0; i < currentLineBefore.length; i++) {
    if (currentLineBefore[i] === "'") {
      quoteCount++;
    }
  }
  if (quoteCount % 2 !== 0) {
    return true;
  }

  return false;
}

export function detectAutocompleteContext(
  sql: string,
  cursorPos: number,
  tablesInQuery: ParsedTableReference[],
  tableDetailsMap: Record<string, RMSemanticTableWithKey>,
  joinOpportunities: JoinOpportunity[]
): AutocompleteState | null {
  if (!sql || cursorPos < 0 || cursorPos > sql.length) {
    return null;
  }

  // Se estiver dentro de comentário ou string, silencia o autocomplete
  if (isInsideCommentOrString(sql, cursorPos)) {
    return null;
  }

  const textBefore = sql.slice(0, cursorPos);
  const lastNewline = textBefore.lastIndexOf("\n");
  const currentLineBefore = lastNewline === -1 ? textBefore : textBefore.slice(lastNewline + 1);

  // =========================================================================
  // GATILHO 1: Ponto / Coluna de Tabela (ex: FLAN. ou F.NUM)
  // =========================================================================
  const dotMatch = currentLineBefore.match(/([A-Za-z0-9_]+)\.([A-Za-z0-9_]*)$/);
  if (dotMatch) {
    const rawTableOrAlias = dotMatch[1].toUpperCase();
    const colPrefix = dotMatch[2] || "";

    // Procura a tabela correspondente na query pelo alias ou pelo nome
    let matchedTable = tablesInQuery.find(
      (t) =>
        t.alias.toUpperCase() === rawTableOrAlias ||
        t.tableName.toUpperCase() === rawTableOrAlias
    );

    // Fallback: se não estiver no FROM/JOIN mas existir no catálogo
    const actualTableName = matchedTable ? matchedTable.tableName : rawTableOrAlias;
    const tableDetails = tableDetailsMap[actualTableName.toUpperCase()];

    if (tableDetails && tableDetails.colunas && tableDetails.colunas.length > 0) {
      const q = colPrefix.toLowerCase();
      const allCols = tableDetails.colunas;

      const filteredCols = allCols.filter((col) => {
        if (!q) return true;
        const name = col.nome.toLowerCase();
        const desc = (col.descricao || "").toLowerCase();
        return name.includes(q) || desc.includes(q);
      });

      // Ordenação inteligente: colunas que começam com o prefixo primeiro, depois chaves
      filteredCols.sort((a, b) => {
        const aName = a.nome.toLowerCase();
        const bName = b.nome.toLowerCase();
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aPk = aName.startsWith("COD") || aName.startsWith("ID") || aName === "CHAPA";
        const bPk = bName.startsWith("COD") || bName.startsWith("ID") || bName === "CHAPA";
        if (aPk && !bPk) return -1;
        if (!aPk && bPk) return 1;

        return aName.localeCompare(bName);
      });

      // Se a única coluna resultante já coincide 100% com o prefixo digitado, não precisa reabrir
      if (
        filteredCols.length === 1 &&
        filteredCols[0].nome.toUpperCase() === colPrefix.toUpperCase()
      ) {
        return null;
      }

      if (filteredCols.length > 0) {
        return {
          type: "column",
          tableLabel: rawTableOrAlias,
          targetTable: actualTableName,
          prefix: colPrefix,
          replaceStart: cursorPos - colPrefix.length,
          replaceEnd: cursorPos,
          columnItems: filteredCols.slice(0, 50).map((col) => ({
            tableName: actualTableName,
            alias: rawTableOrAlias,
            column: col,
          })),
        };
      }
    }
  }

  // =========================================================================
  // GATILHO 2: JOIN / Sugestões do Grafo Semântico (ex: JOIN ou INNER JOIN FC)
  // =========================================================================
  const joinMatch = currentLineBefore.match(
    /\b((?:INNER|LEFT|RIGHT|FULL|CROSS)\s+(?:OUTER\s+)?JOIN|JOIN)\s+([A-Za-z0-9_]*)$/i
  );

  if (joinMatch && joinOpportunities.length > 0) {
    const rawJoinClause = joinMatch[1].trim();
    const tablePrefix = (joinMatch[2] || "").toUpperCase();

    // Normaliza tipo de JOIN digitado pelo usuário
    let normalizedJoinType: "INNER JOIN" | "LEFT JOIN" = "INNER JOIN";
    if (/LEFT/i.test(rawJoinClause)) {
      normalizedJoinType = "LEFT JOIN";
    }

    const q = tablePrefix.toLowerCase();
    const filteredOpps = joinOpportunities
      .filter((opp) => {
        if (!q) return true;
        const target = opp.targetTable.toLowerCase();
        const desc = (opp.targetDescription || "").toLowerCase();
        return target.includes(q) || desc.includes(q);
      })
      .map((opp) => {
        // Se o usuário digitou especificamente LEFT JOIN, adapta o snippet
        if (opp.joinType !== normalizedJoinType) {
          const customSnippet = formatRmJoinSnippet(
            opp.baseTable,
            opp.targetTable,
            opp.chavesLigacao,
            {
              joinType: normalizedJoinType,
              isIncoming: opp.isIncoming,
              indentBase: 4,
            }
          );
          return { ...opp, joinType: normalizedJoinType, formattedSnippet: customSnippet };
        }
        return opp;
      });

      // Se a única oportunidade já coincide 100% com o que o usuário digitou, não precisa reabrir
      if (
        filteredOpps.length === 1 &&
        filteredOpps[0].targetTable.toUpperCase() === tablePrefix.toUpperCase()
      ) {
        return null;
      }

      if (filteredOpps.length > 0) {
        // Início da substituição: onde começou a palavra JOIN nesta linha
        const joinKeywordIndexInLine = currentLineBefore.lastIndexOf(joinMatch[1]);
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        const replaceStart = lineStart + joinKeywordIndexInLine;

        return {
          type: "join",
          prefix: tablePrefix,
          replaceStart,
          replaceEnd: cursorPos,
          joinItems: filteredOpps.slice(0, 20),
        };
      }
  }

  return null;
}
