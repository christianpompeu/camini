"use client";

import React, { useState } from "react";
import { Check, Copy, Download, Code2, Terminal } from "lucide-react";

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

  // Divide as linhas para exibir números de linha elegantes
  const lines = code.split("\n");

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-outline bg-[#0c0e14] shadow-xl text-xs font-mono">
      {/* Barra de título do código */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#141822] border-b border-outline/50 text-[#9AA2B1]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-energy-blue" />
          <span className="font-semibold text-[11px] text-text-primary tracking-wide">
            TOTVS RM Script ({dialect})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[#CED4DA] hover:text-white transition-colors"
            title="Copiar SQL para a área de transferência"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-energy-green" />
                <span className="text-[11px] text-energy-green font-medium">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[#CED4DA] hover:text-white transition-colors"
            title="Baixar arquivo .sql"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">.sql</span>
          </button>
        </div>
      </div>

      {/* Conteúdo do código com numeração de linha */}
      <div className="p-4 overflow-x-auto max-h-[460px] scrollbar-thin">
        <pre className="flex">
          {/* Números das linhas */}
          <div className="select-none text-right pr-4 text-[#4A5568] opacity-60 font-mono shrink-0">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Código SQL destacado */}
          <code className="text-[#E2E8F0] whitespace-pre flex-1 leading-relaxed">
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

/**
 * Função de realce de sintaxe SQL leve e precisa para T-SQL/Oracle
 */
function highlightSqlLine(line: string) {
  // Comentários
  if (line.trim().startsWith("--")) {
    return <span className="text-[#64748B] italic">{line}</span>;
  }

  // Se a linha tiver comentário no final
  const commentIndex = line.indexOf("--");
  if (commentIndex !== -1) {
    const codePart = line.slice(0, commentIndex);
    const commentPart = line.slice(commentIndex);
    return (
      <>
        {renderTokens(codePart)}
        <span className="text-[#64748B] italic">{commentPart}</span>
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

  // Divide por delimitadores mantendo palavras e pontuações
  const parts = str.split(/(\b[A-Za-z_][A-Za-z0-9_]*\b|@\w+|'[^']*'|\[[^\]]*\]|[(),=<>+*/-])/g);

  return parts.map((part, i) => {
    const upper = part.toUpperCase();
    if (keywords.has(upper)) {
      return <span key={i} className="text-[#818CF8] font-bold">{part}</span>;
    }
    if (part.startsWith("@")) {
      return <span key={i} className="text-[#F59E0B] font-medium">{part}</span>;
    }
    if (part.startsWith("'") && part.endsWith("'")) {
      return <span key={i} className="text-[#34D399]">{part}</span>;
    }
    if (part.startsWith("[") && part.endsWith("]")) {
      return <span key={i} className="text-[#38BDF8]">{part}</span>;
    }
    if (/^\d+(\.\d+)?$/.test(part)) {
      return <span key={i} className="text-[#F472B6]">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}
