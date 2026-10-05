"use client";

import React, { useState } from "react";
import { Check, Copy, Download, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SqlCodeBlockProps {
  code: string;
  dialect?: string;
  filename?: string;
}

export function SqlCodeBlock({ code, dialect = "T-SQL", filename = "consulta_totvs_rm.sql" }: SqlCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = code.split("\n");

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-border bg-zinc-950 dark:bg-zinc-950 shadow-sm text-xs font-mono">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5" />
          <span className="font-semibold text-[11px] tracking-wide">
            TOTVS RM Script ({dialect})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5 text-[10px] uppercase font-bold tracking-wider">{copied ? "Copiado" : "Copiar"}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            title="Baixar .sql"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-4 overflow-x-auto max-h-[460px] scrollbar-thin">
        <pre className="flex">
          <div className="select-none text-right pr-4 text-zinc-600 font-mono shrink-0">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <code className="text-zinc-300 whitespace-pre flex-1 leading-relaxed">
            {lines.map((line, idx) => (
              <div key={idx}>
                {highlightSqlLine(line)}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function highlightSqlLine(line: string) {
  if (line.trim().startsWith("--")) {
    return <span className="text-zinc-500 italic">{line}</span>;
  }

  const commentIndex = line.indexOf("--");
  if (commentIndex !== -1) {
    const codePart = line.slice(0, commentIndex);
    const commentPart = line.slice(commentIndex);
    return (
      <>
        {renderTokens(codePart)}
        <span className="text-zinc-500 italic">{commentPart}</span>
      </>
    );
  }

  return renderTokens(line);
}

function renderTokens(str: string) {
  const keywords = new Set([
    "SELECT", "FROM", "WHERE", "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "CROSS",
    "ON", "AND", "OR", "IN", "NOT", "AS", "CASE", "WHEN", "THEN", "ELSE", "END",
    "ORDER", "BY", "GROUP", "HAVING", "TOP", "DESC", "ASC", "DECLARE", "SET",
    "IS", "NULL", "ISNULL", "COALESCE", "BETWEEN", "LIKE", "WITH", "NOLOCK",
    "DATEADD", "GETDATE", "COUNT", "SUM", "AVG", "MIN", "MAX"
  ]);

  const parts = str.split(/(\b[A-Za-z_][A-Za-z0-9_]*\b|@\w+|'[^']*'|\[[^\]]*\]|[(),=<>+*/-])/g);

  return parts.map((part, i) => {
    const upper = part.toUpperCase();
    if (keywords.has(upper)) {
      return <span key={i} className="text-blue-400 font-bold">{part}</span>;
    }
    if (part.startsWith("@")) {
      return <span key={i} className="text-yellow-400 font-medium">{part}</span>;
    }
    if (part.startsWith("'") && part.endsWith("'")) {
      return <span key={i} className="text-green-400">{part}</span>;
    }
    if (part.startsWith("[") && part.endsWith("]")) {
      return <span key={i} className="text-sky-400">{part}</span>;
    }
    if (/^\d+(\.\d+)?$/.test(part)) {
      return <span key={i} className="text-pink-400">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}
