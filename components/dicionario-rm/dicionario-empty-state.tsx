"use client";

import React from "react";
import {
  Database,
  ArrowRight,
  Sparkles,
  Columns2,
  Layers,
  Search,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  POPULAR_RM_TABLES,
  RM_MODULES_CONFIG,
  PopularTableShortcut,
} from "./types";

interface DicionarioEmptyStateProps {
  onSelectTable: (tableName: string) => void;
  onOpenSideBySide?: (tableA: string, tableB: string) => void;
  onSelectModule: (modulePrefix: string) => void;
  onFocusSearch: () => void;
}

export function DicionarioEmptyState({
  onSelectTable,
  onOpenSideBySide,
  onSelectModule,
  onFocusSearch,
}: DicionarioEmptyStateProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 space-y-10 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted border border-border text-foreground">
          <Database className="h-3.5 w-3.5 text-primary" />
          <span>9.400+ Tabelas Catalogadas</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Esquemas & Chaves Estrangeiras</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Dicionário de Dados TOTVS RM
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Consulte a estrutura completa de campos, chaves primárias e relacionamentos
          das tabelas do Corpore RM. Abra tabelas lado a lado para comparar esquemas e montar
          consultas SQL instantaneamente.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="sm"
            onClick={onFocusSearch}
            className="gap-2 h-9 px-4 font-medium shadow-xs"
          >
            <Search className="h-4 w-4" />
            <span>Pesquisar Tabela</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded">
              Ctrl+K
            </kbd>
          </Button>

          {onOpenSideBySide && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenSideBySide("TMOV", "TITMMOV")}
              className="gap-2 h-9 px-4 font-medium border-border hover:bg-muted"
            >
              <Columns2 className="h-4 w-4 text-primary" />
              <span>Exemplo Lado a Lado (TMOV + TITMMOV)</span>
            </Button>
          )}
        </div>
      </div>

      {/* Destaque de Funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Columns2 className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-bold text-foreground">Janelas Lado a Lado</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Inspecione duas tabelas simultaneamente, visualizando colunas em comum e relacionamentos cruzados.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Key className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-bold text-foreground">FKs de Saída e Entrada</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Descubra não apenas as tabelas que a entidade referencia, mas também todas as tabelas do RM que apontam para ela.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2">
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <h4 className="text-sm font-bold text-foreground">Gerador SQL T-SQL</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Copie queries formatadas com `WITH (NOLOCK)` e cláusulas `ON` pré-calculadas prontas para o SSMS ou RM SQL AI.
          </p>
        </div>
      </div>

      {/* Tabelas Populares */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Tabelas mais Consultadas no RM
          </h3>
          <span className="text-xs text-muted-foreground">Clique para inspecionar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {POPULAR_RM_TABLES.map((item: PopularTableShortcut) => (
            <div
              key={item.table}
              onClick={() => onSelectTable(item.table)}
              className="p-3.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-muted/30 cursor-pointer transition-all shadow-xs group flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {item.table}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeClass}`}
                  >
                    {item.module}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-foreground">{item.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                <span className="group-hover:text-primary transition-colors flex items-center gap-1 font-medium">
                  Abrir tabela <ArrowRight className="h-3 w-3" />
                </span>

                {onOpenSideBySide && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSideBySide(item.table, "TITMMOV");
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground font-mono hover:underline"
                    title="Comparar ao lado"
                  >
                    + Lado a lado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Módulos do Sistema */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Explorar por Módulo TOTVS RM
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {RM_MODULES_CONFIG.filter((m) => m.prefix !== "").map((mod) => (
            <button
              key={mod.prefix}
              onClick={() => onSelectModule(mod.prefix)}
              className="p-3 text-left rounded-lg border border-border bg-card hover:bg-muted/40 hover:border-border/80 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-muted">
                    {mod.prefix}*
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${mod.badgeClass}`}>
                    {mod.shortLabel}
                  </span>
                </div>
                <div className="text-xs font-semibold mt-2 text-foreground truncate">
                  {mod.label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                  {mod.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
