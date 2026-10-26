"use client";

import React, { useState } from "react";
import { Link2, Copy, Check, Sparkles, ArrowRightLeft } from "lucide-react";
import { RMSemanticTableWithKey } from "@/lib/totvs-rm/types";
import { Button } from "@/components/ui/button";

interface CommonColumnsBarProps {
  tableA: RMSemanticTableWithKey;
  tableB: RMSemanticTableWithKey;
  onSwapTables?: () => void;
}

export function CommonColumnsBar({
  tableA,
  tableB,
  onSwapTables,
}: CommonColumnsBarProps) {
  const [copied, setCopied] = useState(false);

  // 1. Verificar se há FK direta documentada no RM entre A e B (ou B e A)
  const relAtoB = tableA.relacionamentos_saida?.find(
    (r) => r.tabela_destino.toUpperCase() === tableB.tabela.toUpperCase()
  );

  const relBtoA = tableB.relacionamentos_saida?.find(
    (r) => r.tabela_destino.toUpperCase() === tableA.tabela.toUpperCase()
  );

  // 2. Colunas em comum
  const colsA = new Set(tableA.colunas.map((c) => c.nome.toUpperCase()));
  const commonCols = tableB.colunas
    .map((c) => c.nome.toUpperCase())
    .filter((col) => colsA.has(col));

  // Priorizar colunas de ligação típicas do TOTVS RM
  const keyColumns = commonCols.filter(
    (c) =>
      c.startsWith("COD") ||
      c.startsWith("ID") ||
      c === "CHAPA" ||
      c === "NSEQITMMOV" ||
      c === "CODFILIAL" ||
      c === "CODCOLIGADA"
  );

  // Determinar a melhor cláusula de ligação
  let joinClause = "";
  let isOfficialFK = false;

  if (relAtoB) {
    isOfficialFK = true;
    joinClause = formatRelationshipClause(tableA.tabela, tableB.tabela, relAtoB.chaves_ligacao);
  } else if (relBtoA) {
    isOfficialFK = true;
    joinClause = formatRelationshipClause(tableB.tabela, tableA.tabela, relBtoA.chaves_ligacao);
  } else if (keyColumns.length > 0) {
    // Montar ligação pelas chaves em comum
    joinClause = keyColumns
      .map((col) => `${tableA.tabela}.${col} = ${tableB.tabela}.${col}`)
      .join(" AND ");
  }

  const handleCopy = () => {
    if (!joinClause) return;
    navigator.clipboard.writeText(`ON ${joinClause}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (commonCols.length === 0 && !relAtoB && !relBtoA) {
    return null;
  }

  return (
    <div className="shrink-0 border-b border-border bg-muted/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Link2 className="h-4 w-4 text-primary shrink-0" />
          <span>Relação Detectada:</span>
        </div>

        <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
          {tableA.tabela}
        </span>
        <span className="text-muted-foreground font-mono">⟷</span>
        <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
          {tableB.tabela}
        </span>

        {isOfficialFK ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-3 w-3" />
            FK Documentada no RM
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            {commonCols.length} {commonCols.length === 1 ? "coluna em comum" : "colunas em comum"}
          </span>
        )}

        {joinClause && (
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground bg-background/80 px-2 py-1 rounded border border-border truncate max-w-md">
            <span className="font-semibold text-primary">ON</span>
            <span className="truncate">{joinClause}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onSwapTables && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwapTables}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            title="Inverter ordem das tabelas"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Inverter</span>
          </Button>
        )}

        {joinClause && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2.5 text-xs font-medium gap-1.5 border-border bg-background hover:bg-muted"
            title="Copiar cláusula ON de junção"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Cláusula ON</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function formatRelationshipClause(
  fromTable: string,
  toTable: string,
  rawKeys: string
): string {
  const parts = rawKeys.split("=");
  if (parts.length === 2) {
    const left = parts[0].split(",").map((c) => c.trim());
    const right = parts[1].split(",").map((c) => c.trim());
    const n = Math.min(left.length, right.length);
    const conditions: string[] = [];
    for (let i = 0; i < n; i++) {
      conditions.push(`${fromTable}.${left[i]} = ${toTable}.${right[i]}`);
    }
    return conditions.join(" AND ");
  }
  return rawKeys;
}
