"use client";

import type { RMSemanticTableWithKey, RMTableSummary } from "../../lib/totvs-rm/types.ts";
import type { ParsedTableReference, JoinOpportunity } from "../../lib/totvs-rm/query-parser.ts";
import { formatRmJoinSnippet } from "../../lib/totvs-rm/sql-format.ts";
import type { AutocompleteTriggerType, ColumnSuggestionItem } from "./sql-autocomplete-card.tsx";
import {
  type GenericSuggestionItem,
  SQL_KEYWORDS,
  SQL_FUNCTIONS,
  SQL_SNIPPETS,
  POPULAR_RM_TABLES,
} from "../../lib/totvs-rm/sql-autocomplete-data.ts";

export interface AutocompleteState {
  type: AutocompleteTriggerType;
  tableLabel?: string;
  targetTable?: string;
  prefix: string;
  replaceStart: number;
  replaceEnd: number;
  columnItems?: ColumnSuggestionItem[];
  joinItems?: JoinOpportunity[];
  genericItems?: GenericSuggestionItem[];
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
  joinOpportunities: JoinOpportunity[],
  force = false,
  catalogTables: RMTableSummary[] = []
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
  // GATILHO 1: Ponto / Coluna de Tabela (ex: FLAN. ou F.NUM) - Prioridade Máxima
  // =========================================================================
  const dotMatch = currentLineBefore.match(/([A-Za-z0-9_]+)\.([A-Za-z0-9_]*)$/);
  if (dotMatch) {
    const rawTableOrAlias = dotMatch[1].toUpperCase();
    const colPrefix = dotMatch[2] || "";

    // Procura a tabela correspondente na query pelo alias ou pelo nome
    const matchedTable = tablesInQuery.find(
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

      // Se a única coluna resultante já coincide 100% com o prefixo digitado e não foi forçado, não precisa reabrir
      if (
        !force &&
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
  // GATILHO 2: FROM / Tabelas do Catálogo TOTVS RM (ex: FROM FLAN ou FROM F)
  // =========================================================================
  const fromMatch = textBefore.match(/\bFROM\s+([A-Za-z0-9_]*)$/i);
  if (fromMatch) {
    const tablePrefix = fromMatch[1].toUpperCase();
    const q = tablePrefix.toLowerCase();

    // Mescla tabelas populares com o catálogo
    const tableMap = new Map<string, { tabela: string; descricao: string; modulo: string }>();
    POPULAR_RM_TABLES.forEach((t) => tableMap.set(t.tabela.toUpperCase(), t));
    catalogTables.forEach((t) => {
      const upper = t.tabela.toUpperCase();
      if (!tableMap.has(upper)) {
        tableMap.set(upper, { tabela: t.tabela, descricao: t.descricao, modulo: t.sistema });
      }
    });

    const candidateTables = Array.from(tableMap.values()).filter((t) => {
      if (!q) return true;
      return t.tabela.toLowerCase().includes(q) || t.descricao.toLowerCase().includes(q);
    });

    candidateTables.sort((a, b) => {
      const aStarts = a.tabela.toLowerCase().startsWith(q);
      const bStarts = b.tabela.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.tabela.localeCompare(b.tabela);
    });

    if (
      !force &&
      candidateTables.length === 1 &&
      candidateTables[0].tabela.toUpperCase() === tablePrefix
    ) {
      return null;
    }

    if (candidateTables.length > 0) {
      const genericItems: GenericSuggestionItem[] = candidateTables.slice(0, 30).map((t) => ({
        label: t.tabela,
        insertText: `CORPORE.DBO.${t.tabela} AS ${t.tabela} WITH (NOLOCK)`,
        type: "table",
        description: t.descricao,
        detail: t.modulo,
      }));

      return {
        type: "table",
        prefix: tablePrefix,
        replaceStart: cursorPos - tablePrefix.length,
        replaceEnd: cursorPos,
        genericItems,
      };
    }
  }

  // =========================================================================
  // GATILHO 3: JOIN / Sugestões do Grafo Semântico ou Catálogo (ex: JOIN FCFO)
  // =========================================================================
  const joinMatch = currentLineBefore.match(
    /\b((?:INNER|LEFT|RIGHT|FULL|CROSS)\s+(?:OUTER\s+)?JOIN|JOIN)\s+([A-Za-z0-9_]*)$/i
  );

  if (joinMatch) {
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

    if (
      !force &&
      filteredOpps.length === 1 &&
      filteredOpps[0].targetTable.toUpperCase() === tablePrefix.toUpperCase()
    ) {
      return null;
    }

    if (filteredOpps.length > 0) {
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

    // Se não há oportunidades no grafo para o prefixo, sugere tabelas do catálogo com JOIN
    const matchedTables = POPULAR_RM_TABLES.filter((t) => {
      if (!q) return true;
      return t.tabela.toLowerCase().includes(q) || t.descricao.toLowerCase().includes(q);
    });

    if (matchedTables.length > 0) {
      const genericItems: GenericSuggestionItem[] = matchedTables.slice(0, 20).map((t) => ({
        label: t.tabela,
        insertText: `CORPORE.DBO.${t.tabela} AS ${t.tabela} WITH (NOLOCK)\n         ON `,
        type: "table",
        description: t.descricao,
        detail: t.modulo,
      }));

      return {
        type: "table",
        prefix: tablePrefix,
        replaceStart: cursorPos - tablePrefix.length,
        replaceEnd: cursorPos,
        genericItems,
      };
    }
  }

  // =========================================================================
  // GATILHO 4: Palavras-Chave, Funções T-SQL, Snippets & Sugestão Global
  // Dispara com >= 2 letras de digitação natural OU forçado via Ctrl+Space
  // =========================================================================
  const wordMatch = currentLineBefore.match(/([A-Za-z0-9_]+)$/);
  const partialWord = wordMatch ? wordMatch[1] : "";
  const q = partialWord.toLowerCase();

  if (force || partialWord.length >= 2) {
    const combinedGeneric: GenericSuggestionItem[] = [];

    // 1. Palavras-chave SQL
    SQL_KEYWORDS.forEach((kw) => {
      if (!q || kw.label.toLowerCase().includes(q)) {
        combinedGeneric.push(kw);
      }
    });

    // 2. Funções T-SQL
    SQL_FUNCTIONS.forEach((fn) => {
      if (!q || fn.label.toLowerCase().includes(q)) {
        combinedGeneric.push(fn);
      }
    });

    // 3. Snippets Corporativos RM
    SQL_SNIPPETS.forEach((snip) => {
      if (!q || snip.label.toLowerCase().includes(q)) {
        combinedGeneric.push(snip);
      }
    });

    // 4. Colunas das tabelas presentes na query (se houver tabelas)
    const candidateCols: ColumnSuggestionItem[] = [];
    if (tablesInQuery.length > 0) {
      tablesInQuery.forEach((t) => {
        const details = tableDetailsMap[t.tableName.toUpperCase()];
        if (details && details.colunas) {
          details.colunas.forEach((col) => {
            const aliasOrTable = t.alias || t.tableName;
            const fullRef = `${aliasOrTable}.${col.nome}`;
            const colNameLower = col.nome.toLowerCase();
            const colDescLower = (col.descricao || "").toLowerCase();

            if (!q || colNameLower.includes(q) || colDescLower.includes(q) || fullRef.toLowerCase().includes(q)) {
              candidateCols.push({
                tableName: t.tableName,
                alias: aliasOrTable,
                column: col,
              });

              combinedGeneric.push({
                label: fullRef,
                insertText: fullRef,
                type: "column",
                description: col.descricao ? `${col.descricao} (${t.tableName})` : `Coluna de ${t.tableName}`,
                detail: col.tipo || "COLUNA",
              });
            }
          });
        }
      });
    }

    if (combinedGeneric.length > 0) {
      // Ordenação inteligente de pertinência
      combinedGeneric.sort((a, b) => {
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();
        const aStarts = aLabel.startsWith(q);
        const bStarts = bLabel.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Snippets e Keywords têm alta relevância se começarem com a letra
        const aPriority = a.type === "keyword" ? 1 : a.type === "snippet" ? 2 : 3;
        const bPriority = b.type === "keyword" ? 1 : b.type === "snippet" ? 2 : 3;
        if (aPriority !== bPriority) return aPriority - bPriority;

        return aLabel.localeCompare(bLabel);
      });

      // Se a única sugestão coincide 100% e não foi forçada, não reabre
      if (
        !force &&
        combinedGeneric.length === 1 &&
        combinedGeneric[0].label.toUpperCase() === partialWord.toUpperCase()
      ) {
        return null;
      }

      // Se todas as sugestões são exclusivamente colunas da query, preserva type: "column"
      if (candidateCols.length > 0 && combinedGeneric.every((i) => i.type === "column")) {
        const primaryTable = tablesInQuery[0];
        return {
          type: "column",
          tableLabel: primaryTable.alias || primaryTable.tableName,
          targetTable: primaryTable.tableName,
          prefix: partialWord,
          replaceStart: cursorPos - partialWord.length,
          replaceEnd: cursorPos,
          columnItems: candidateCols.slice(0, 50),
          genericItems: combinedGeneric.slice(0, 40),
        };
      }

      // Determina tipo predominante para cabeçalho
      let primaryType: AutocompleteTriggerType = "mixed";
      if (combinedGeneric.every((i) => i.type === "keyword")) primaryType = "keyword";
      else if (combinedGeneric.every((i) => i.type === "function")) primaryType = "function";
      else if (combinedGeneric.every((i) => i.type === "snippet")) primaryType = "snippet";

      return {
        type: primaryType,
        prefix: partialWord,
        replaceStart: cursorPos - partialWord.length,
        replaceEnd: cursorPos,
        columnItems: candidateCols.length > 0 ? candidateCols.slice(0, 50) : undefined,
        genericItems: combinedGeneric.slice(0, 40),
      };
    }
  }

  return null;
}
