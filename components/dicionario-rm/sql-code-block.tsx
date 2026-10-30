"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SqlCodeBlockProps {
  code: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
  title?: string;
}

interface CodeToken {
  type:
    | "comment"
    | "keyword"
    | "schema"
    | "alias"
    | "number"
    | "operator"
    | "text";
  value: string;
}

const TSQL_KEYWORDS = new Set([
  "SELECT",
  "TOP",
  "FROM",
  "INNER",
  "LEFT",
  "RIGHT",
  "FULL",
  "CROSS",
  "JOIN",
  "ON",
  "AND",
  "OR",
  "NOT",
  "WITH",
  "NOLOCK",
  "AS",
  "SET",
  "NOCOUNT",
  "WHERE",
  "ORDER",
  "BY",
  "GROUP",
  "HAVING",
  "IN",
  "IS",
  "NULL",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "DISTINCT",
  "UNION",
  "ALL",
]);

/**
 * Tokeniza uma fatia de linha que NÃO está dentro de comentário
 */
function tokenizeSegment(segment: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  // Regex captura:
  // 1: Aliases entre colchetes [COLUNA]
  // 2: Palavras (letras, dígitos, underscore)
  // 3: Números puros
  // 4: Operadores (=, ,, ;)
  // 5: Espaços e outros caracteres
  const regex = /(\[[^\]]*\])|([A-Za-z_][A-Za-z0-9_]*)|(\b\d+\b)|([=,;])|(\s+)|(.)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(segment)) !== null) {
    const [full, alias, word, num, op] = match;

    if (alias) {
      tokens.push({ type: "alias", value: alias });
    } else if (word) {
      const upper = word.toUpperCase();
      if (upper === "CORPORE" || upper === "DBO") {
        tokens.push({ type: "schema", value: word });
      } else if (TSQL_KEYWORDS.has(upper)) {
        tokens.push({ type: "keyword", value: word });
      } else {
        tokens.push({ type: "text", value: word });
      }
    } else if (num) {
      tokens.push({ type: "number", value: num });
    } else if (op) {
      tokens.push({ type: "operator", value: op });
    } else {
      tokens.push({ type: "text", value: full });
    }
  }

  return tokens;
}

/**
 * Realce de sintaxe T-SQL nativo, leve e sem dependências externas.
 * Trata comentários em bloco multilinhas (/* ... *\/), keywords, schemas e aliases.
 */
function highlightSql(codeText: string): CodeToken[][] {
  const lines = codeText.split("\n");
  const result: CodeToken[][] = [];
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineTokens: CodeToken[] = [];
    let curIdx = 0;

    while (curIdx < line.length) {
      if (inBlockComment) {
        const closeIdx = line.indexOf("*/", curIdx);
        if (closeIdx === -1) {
          // Continua em comentário até o fim da linha
          lineTokens.push({
            type: "comment",
            value: line.slice(curIdx),
          });
          curIdx = line.length;
        } else {
          // Fecha o comentário de bloco nesta linha
          lineTokens.push({
            type: "comment",
            value: line.slice(curIdx, closeIdx + 2),
          });
          curIdx = closeIdx + 2;
          inBlockComment = false;
        }
      } else {
        const openIdx = line.indexOf("/*", curIdx);
        if (openIdx === -1) {
          // Nenhum comentário à frente
          const segTokens = tokenizeSegment(line.slice(curIdx));
          lineTokens.push(...segTokens);
          curIdx = line.length;
        } else {
          // Processa conteúdo antes do comentário
          if (openIdx > curIdx) {
            const segTokens = tokenizeSegment(line.slice(curIdx, openIdx));
            lineTokens.push(...segTokens);
          }
          // Inicia comentário
          const closeIdx = line.indexOf("*/", openIdx + 2);
          if (closeIdx === -1) {
            lineTokens.push({
              type: "comment",
              value: line.slice(openIdx),
            });
            curIdx = line.length;
            inBlockComment = true;
          } else {
            lineTokens.push({
              type: "comment",
              value: line.slice(openIdx, closeIdx + 2),
            });
            curIdx = closeIdx + 2;
          }
        }
      }
    }

    result.push(lineTokens);
  }

  return result;
}

export function SqlCodeBlock({
  code,
  showLineNumbers = true,
  maxHeight,
  className = "",
  title,
}: SqlCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const tokenizedLines = useMemo(() => highlightSql(code), [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className={`group relative rounded-lg border border-slate-800 bg-[#0d1117] text-slate-100 shadow-md overflow-hidden font-mono text-xs flex flex-col ${className}`}
    >
      {/* Top Header Barra (opcional se houver título ou para botão de cópia rápido) */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/80 border-b border-slate-800/80 text-[11px] text-slate-400 select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="font-semibold text-slate-300">
            {title || "T-SQL • SQL Server (TOTVS RM)"}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-[10px] gap-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
          title="Copiar código SQL"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copiar</span>
            </>
          )}
        </Button>
      </div>

      {/* Área de Visualização do Código */}
      <div
        style={maxHeight ? { maxHeight } : undefined}
        className="overflow-x-auto overflow-y-auto p-3.5 leading-relaxed font-mono flex-1 min-h-0"
      >
        <div className="table w-full">
          {tokenizedLines.map((tokens, lineIdx) => (
            <div key={lineIdx} className="table-row hover:bg-slate-800/30">
              {showLineNumbers && (
                <span className="table-cell select-none text-right pr-4 text-slate-600 border-r border-slate-800/80 min-w-[2.5rem] align-top">
                  {lineIdx + 1}
                </span>
              )}
              <span
                className={`table-cell whitespace-pre align-top ${
                  showLineNumbers ? "pl-4" : ""
                }`}
              >
                {tokens.length === 0 ? (
                  "\n"
                ) : (
                  tokens.map((tok, tokIdx) => {
                    switch (tok.type) {
                      case "comment":
                        return (
                          <span
                            key={tokIdx}
                            className="text-emerald-400/90 italic"
                          >
                            {tok.value}
                          </span>
                        );
                      case "keyword":
                        return (
                          <span
                            key={tokIdx}
                            className="text-sky-400 font-semibold"
                          >
                            {tok.value}
                          </span>
                        );
                      case "schema":
                        return (
                          <span
                            key={tokIdx}
                            className="text-teal-300 font-semibold"
                          >
                            {tok.value}
                          </span>
                        );
                      case "alias":
                        return (
                          <span
                            key={tokIdx}
                            className="text-amber-300 font-medium"
                          >
                            {tok.value}
                          </span>
                        );
                      case "number":
                        return (
                          <span
                            key={tokIdx}
                            className="text-purple-400 font-medium"
                          >
                            {tok.value}
                          </span>
                        );
                      case "operator":
                        return (
                          <span key={tokIdx} className="text-slate-400">
                            {tok.value}
                          </span>
                        );
                      default:
                        return (
                          <span key={tokIdx} className="text-slate-200">
                            {tok.value}
                          </span>
                        );
                    }
                  })
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
