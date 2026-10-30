"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Key,
  Database,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Plus,
  Table,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParsedTableReference, appendColumnToSelect } from "@/lib/totvs-rm/query-parser";
import { RMSemanticTableWithKey, RMSemanticColumn } from "@/lib/totvs-rm/types";

interface QueryInspectorPaneProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  tablesInQuery: ParsedTableReference[];
  tableDetailsMap: Record<string, RMSemanticTableWithKey>;
  selectedColumns: string[];
  onInsertColumn: (expr: string) => void;
}

export function QueryInspectorPane({
  isOpen,
  onToggleOpen,
  tablesInQuery,
  tableDetailsMap,
  selectedColumns,
  onInsertColumn,
}: QueryInspectorPaneProps) {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleExpand = (tbl: string) => {
    setExpandedTables((prev) => ({ ...prev, [tbl]: !prev[tbl] }));
  };

  if (!isOpen) {
    return (
      <aside className="w-10 border-l border-border bg-card/60 flex flex-col items-center py-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOpen}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Abrir painel de inspeção de tabelas e campos"
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col h-full min-h-0 shrink-0 select-none">
      {/* Top Header */}
      <div className="p-3 border-b border-border flex items-center justify-between gap-2 shrink-0 bg-muted/20">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-xs text-foreground">Inspetor do Esquema</h3>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOpen}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          title="Recolher painel de inspeção"
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Métricas Rápidas da Consulta */}
      <div className="p-3 border-b border-border/60 bg-muted/10 grid grid-cols-3 gap-2 text-center text-xs shrink-0">
        <div className="p-1.5 rounded-lg bg-background border border-border/60">
          <span className="block font-mono font-bold text-foreground text-sm">
            {tablesInQuery.length}
          </span>
          <span className="text-[10px] text-muted-foreground">Tabelas</span>
        </div>
        <div className="p-1.5 rounded-lg bg-background border border-border/60">
          <span className="block font-mono font-bold text-foreground text-sm">
            {Math.max(tablesInQuery.length - 1, 0)}
          </span>
          <span className="text-[10px] text-muted-foreground">JOINs</span>
        </div>
        <div className="p-1.5 rounded-lg bg-background border border-border/60">
          <span className="block font-mono font-bold text-foreground text-sm">
            {selectedColumns.length}
          </span>
          <span className="text-[10px] text-muted-foreground">Campos</span>
        </div>
      </div>

      {/* Lista de Tabelas Participantes na Query */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pt-1">
          Tabelas na Consulta ({tablesInQuery.length})
        </div>

        {tablesInQuery.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            <Table className="h-6 w-6 mx-auto mb-2 opacity-30" />
            <p>Nenhuma tabela detectada.</p>
            <p className="text-[11px] text-muted-foreground/80 mt-1">
              Escreva uma cláusula FROM ou dê dois cliques em uma tabela no catálogo.
            </p>
          </div>
        ) : (
          tablesInQuery.map((t, idx) => {
            const details = tableDetailsMap[t.tableName.toUpperCase()];
            const isExpanded = expandedTables[t.tableName] ?? (idx === 0);
            const columns = details?.colunas || [];

            return (
              <div
                key={t.alias}
                className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-2xs"
              >
                {/* Header da Tabela */}
                <div
                  onClick={() => toggleExpand(t.tableName)}
                  className="p-2.5 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-mono text-xs font-bold text-foreground truncate">
                      {t.tableName}
                    </span>
                    {t.alias !== t.tableName && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        as {t.alias}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {columns.length} cols
                    </span>
                    <Link
                      href={`/dicionario-rm?table=${t.tableName}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      title={`Abrir ${t.tableName} no Dicionário RM em nova aba`}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Lista de Colunas (Expandível) */}
                {isExpanded && (
                  <div className="p-2 border-t border-border/50 bg-background/50 space-y-1 max-h-60 overflow-y-auto">
                    {columns.length === 0 ? (
                      <div className="p-3 text-center text-[11px] text-muted-foreground">
                        Carregando metadados...
                      </div>
                    ) : (
                      columns.map((col) => {
                        const isPk =
                          col.nome.startsWith("COD") ||
                          col.nome.startsWith("ID") ||
                          col.nome === "CHAPA";

                        return (
                          <div
                            key={col.nome}
                            onClick={() => onInsertColumn(`${t.alias}.${col.nome}`)}
                            className="px-2 py-1 rounded text-xs hover:bg-muted/60 transition-colors flex items-center justify-between gap-1.5 cursor-pointer group"
                            title={col.descricao || col.nome}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isPk && <Key className="h-3 w-3 text-amber-500 shrink-0" />}
                              <span className="font-mono text-[11px] text-foreground truncate group-hover:text-primary">
                                {col.nome}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="font-mono text-[9.5px] text-muted-foreground">
                                {col.tipo}
                              </span>
                              <Plus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
