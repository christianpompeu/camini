"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Key,
  Link2,
  Copy,
  Check,
  Columns2,
  X,
  Maximize2,
  ArrowRight,
  Search,
  Sparkles,
  Bot,
  Code2,
  ArrowDownLeft,
  Filter,
  Share2,
} from "lucide-react";
import {
  RMSemanticTableWithKey,
  RMSemanticColumn,
  RMSemanticRelationship,
  RMSemanticIncomingRelationship,
} from "@/lib/totvs-rm/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaneTab, ColumnCategoryFilter, RM_MODULES_CONFIG } from "./types";
import { TableRelationGraph } from "./table-relation-graph";

interface TableViewerPaneProps {
  table: RMSemanticTableWithKey;
  isSecondary?: boolean;
  isSplitActive?: boolean;
  onOpenSideBySide?: (targetTable: string) => void;
  onNavigateToTable?: (targetTable: string) => void;
  onCloseSecondary?: () => void;
  onMaximizePane?: () => void;
  onOpenGraphSideBySide?: () => void;
  primaryTableName?: string;
}

export function TableViewerPane({
  table,
  isSecondary = false,
  isSplitActive = false,
  onOpenSideBySide,
  onNavigateToTable,
  onCloseSecondary,
  onMaximizePane,
  onOpenGraphSideBySide,
  primaryTableName,
}: TableViewerPaneProps) {
  const [activeTab, setActiveTab] = useState<PaneTab>("columns");
  const [columnSearch, setColumnSearch] = useState("");
  const [columnTypeFilter, setColumnTypeFilter] = useState<ColumnCategoryFilter>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Mapeamento automático de colunas para tabelas relacionadas (FKs documentadas + heurísticas padrão RM)
  const columnToTargetTableMap = useMemo(() => {
    const map: Record<string, string> = {};

    // 1. Mapeamento via relacionamentos_saida documentados no RM
    (table.relacionamentos_saida || []).forEach((rel) => {
      if (!rel.chaves_ligacao) return;
      const parts = rel.chaves_ligacao.split("=");
      if (parts.length > 0) {
        const leftCols = parts[0].split(",").map((c) => c.trim().toUpperCase());
        leftCols.forEach((col) => {
          if (col && col !== "CODCOLIGADA" && !map[col]) {
            map[col] = rel.tabela_destino.toUpperCase();
          }
        });
      }
    });

    // 2. Heurísticas canônicas do ecossistema TOTVS RM
    const standardRmFkHeuristics: Record<string, string> = {
      CODCFO: "FCFO",
      IDMOV: "TMOV",
      NSEQITMMOV: "TITMMOV",
      IDLAN: "FLAN",
      CODFILIAL: "GFILIAL",
      CODCCUSTO: "GCCUSTO",
      CODVEN: "TVEN",
      CODVEN1: "TVEN",
      CODTDO: "FTDO",
      CODCPG: "TCPG",
      CODDEPTO: "GDEPTO",
      CHAPA: "PFUNC",
      CODSECAO: "PSECAO",
      CODCONTA: "CCONTA",
      IDHISTORICO: "FPARHIST",
      IDNAT: "DCFO",
      CODTB1FLA: "FTB1",
      CODTB2FLA: "FTB2",
      CODTB3FLA: "FTB3",
    };

    Object.entries(standardRmFkHeuristics).forEach(([col, dest]) => {
      if (!map[col] && dest !== table.tabela.toUpperCase()) {
        map[col] = dest;
      }
    });

    delete map[table.tabela.toUpperCase()];
    return map;
  }, [table]);

  // Módulo configurado
  const firstChar = table.tabela.charAt(0);
  const moduleConfig = RM_MODULES_CONFIG.find((m) => m.prefix === firstChar) || {
    label: table.Modulo || "Geral RM",
    shortLabel: table.Modulo?.replace("RM ", "") || "Geral",
    badgeClass: "bg-muted text-foreground border-border",
  };

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Garantir colunas únicas (sem repetições acidentais do dicionário RM)
  const uniqueColumns = useMemo(() => {
    const seen = new Set<string>();
    return (table.colunas || []).filter((col) => {
      if (!col || !col.nome) return false;
      const key = col.nome.toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [table.colunas]);

  // Filtragem e categorização de colunas
  const filteredColumns = useMemo(() => {
    return uniqueColumns.filter((col) => {
      // Filtro de busca de texto
      if (columnSearch.trim()) {
        const q = columnSearch.toLowerCase().trim();
        const matchesName = col.nome.toLowerCase().includes(q);
        const matchesDesc = (col.descricao || "").toLowerCase().includes(q);
        const matchesType = (col.tipo || "").toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesType) return false;
      }

      // Filtro por tipo/categoria
      if (columnTypeFilter === "all") return true;

      const t = col.tipo.toUpperCase();
      const n = col.nome.toUpperCase();

      if (columnTypeFilter === "keys") {
        return (
          n.startsWith("COD") ||
          n.startsWith("ID") ||
          n === "CHAPA" ||
          n.endsWith("_ID") ||
          n === "NSEQITMMOV"
        );
      }
      if (columnTypeFilter === "text") {
        return (
          t.includes("VARCHAR") ||
          t.includes("CHAR") ||
          t.includes("TEXT") ||
          t.includes("STRING")
        );
      }
      if (columnTypeFilter === "number") {
        return (
          t.includes("INT") ||
          t.includes("NUMERIC") ||
          t.includes("DECIMAL") ||
          t.includes("FLOAT") ||
          t.includes("MONEY")
        );
      }
      if (columnTypeFilter === "date") {
        return (
          t.includes("DATETIME") ||
          t.includes("DATE") ||
          t.includes("TIME")
        );
      }

      return true;
    });
  }, [uniqueColumns, columnSearch, columnTypeFilter]);

  // Contagem de colunas por categoria
  const categoryCounts = useMemo(() => {
    let keys = 0;
    let text = 0;
    let number = 0;
    let date = 0;

    uniqueColumns.forEach((c) => {
      const n = c.nome.toUpperCase();
      const t = c.tipo.toUpperCase();

      if (
        n.startsWith("COD") ||
        n.startsWith("ID") ||
        n === "CHAPA" ||
        n.endsWith("_ID") ||
        n === "NSEQITMMOV"
      ) {
        keys++;
      }
      if (t.includes("VARCHAR") || t.includes("CHAR") || t.includes("TEXT")) {
        text++;
      }
      if (
        t.includes("INT") ||
        t.includes("NUMERIC") ||
        t.includes("DECIMAL") ||
        t.includes("FLOAT") ||
        t.includes("MONEY")
      ) {
        number++;
      }
      if (t.includes("DATETIME") || t.includes("DATE") || t.includes("TIME")) {
        date++;
      }
    });

    return { total: uniqueColumns.length, keys, text, number, date };
  }, [uniqueColumns]);

  // Gerador de SQL
  const sqlSelectScript = useMemo(() => {
    const colList = table.colunas
      .slice(0, 15)
      .map((c) => `    ${c.nome}`)
      .join(",\n");
    const moreNotice =
      table.colunas.length > 15
        ? `\n    -- ... mais ${table.colunas.length - 15} colunas disponíveis\n`
        : "\n";

    return `-- Consulta rápida na tabela ${table.tabela} (${moduleConfig.label})
SELECT TOP 100
${colList}${moreNotice}FROM ${table.tabela} WITH (NOLOCK);`;
  }, [table, moduleConfig]);

  const sqlJoinTemplate = useMemo(() => {
    const rels = table.relacionamentos_saida || [];
    if (rels.length === 0) {
      return `-- Tabela ${table.tabela} não possui relacionamentos de saída documentados.
SELECT TOP 100 * FROM ${table.tabela} WITH (NOLOCK);`;
    }

    let script = `-- Consulta com JOINs automáticos para ${table.tabela}
SELECT TOP 100
    ${table.tabela}.*`;

    rels.slice(0, 3).forEach((r) => {
      script += `,\n    ${r.tabela_destino}.*`;
    });

    script += `\nFROM ${table.tabela} WITH (NOLOCK)\n`;

    rels.slice(0, 3).forEach((r) => {
      const parts = r.chaves_ligacao.split("=");
      let onClause = r.chaves_ligacao;
      if (parts.length === 2) {
        const left = parts[0].split(",").map((c) => c.trim());
        const right = parts[1].split(",").map((c) => c.trim());
        const n = Math.min(left.length, right.length);
        const conds: string[] = [];
        for (let i = 0; i < n; i++) {
          conds.push(`${table.tabela}.${left[i]} = ${r.tabela_destino}.${right[i]}`);
        }
        onClause = conds.join(" AND ");
      }
      script += `LEFT JOIN ${r.tabela_destino} WITH (NOLOCK) ON ${onClause}\n`;
    });

    return script;
  }, [table]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden border-border">
      {/* Se for a janela secundária: Banner contextual claro */}
      {isSecondary && (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary text-primary-foreground">
              Painel de Detalhamento
            </span>
            <span className="text-muted-foreground text-xs">
              {primaryTableName ? (
                <>
                  Inspecionando relação com <strong className="text-foreground font-mono">{primaryTableName}</strong>
                </>
              ) : (
                "Janela secundária para análise comparativa"
              )}
            </span>
          </div>

          {onCloseSecondary && (
            <button
              onClick={onCloseSecondary}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 hover:underline cursor-pointer"
              title="Fechar janela de detalhamento"
            >
              <span>Fechar</span>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Pane Top Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-muted/15 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Informações da tabela */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground">
                {table.tabela}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(table.tabela, "table_name")}
                title="Copiar nome da tabela"
              >
                {copiedKey === "table_name" ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${moduleConfig.badgeClass}`}
              >
                {moduleConfig.shortLabel}
              </span>

              {isSecondary && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Janela Secundária
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {table.descricao || "Tabela sem descrição catalogada"}
            </p>

            {/* Métricas rápidas */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-foreground" />
                <strong className="text-foreground">{table.colunas.length}</strong> colunas
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                <strong className="text-foreground">
                  {table.relacionamentos_saida?.length || 0}
                </strong>{" "}
                FKs saída
              </span>
              {table.relacionamentos_entrada && table.relacionamentos_entrada.length > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ArrowDownLeft className="h-3.5 w-3.5 text-indigo-500" />
                    <strong className="text-foreground">
                      {table.relacionamentos_entrada.length}
                    </strong>{" "}
                    FKs entrada
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ações superiores */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
            <Link
              href={`/totvs-rm?initialPrompt=${encodeURIComponent(
                `Explique como consultar a tabela ${table.tabela} (${table.descricao})`
              )}`}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-border hover:bg-muted font-medium"
                title="Consultar assistente de IA com esta tabela"
              >
                <Bot className="h-3.5 w-3.5 text-primary" />
                <span className="hidden md:inline">Perguntar no RM SQL AI</span>
                <span className="md:hidden">IA</span>
              </Button>
            </Link>

            {/* Botão de abrir Grafo na coluna da direita */}
            {onOpenGraphSideBySide && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenGraphSideBySide}
                className="h-8 gap-1.5 text-xs border-border hover:bg-muted font-medium"
                title="Abrir o Grafo de Relacionamentos na coluna da direita"
              >
                <Share2 className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Grafo na Direita</span>
              </Button>
            )}

            {/* Botão de abrir em tela cheia/lado a lado se modo split estiver desligado */}
            {!isSplitActive && onOpenSideBySide && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenSideBySide(table.tabela)}
                className="h-8 gap-1.5 text-xs border-border hover:bg-muted font-medium"
                title="Abrir outra tabela lado a lado para comparar esquemas"
              >
                <Columns2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Modo Lado a Lado</span>
              </Button>
            )}

            {/* Maximizar janela */}
            {isSplitActive && onMaximizePane && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMaximizePane}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Maximizar esta tabela em tela cheia"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Fechar janela secundária */}
            {isSecondary && onCloseSecondary && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseSecondary}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Fechar janela secundária"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs de navegação interna */}
      <div className="border-b border-border bg-background px-4 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0">
        <div className="flex items-center gap-1 py-1.5">
          <button
            onClick={() => setActiveTab("columns")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "columns"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Colunas</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20">
              {table.colunas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("graph")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "graph"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Grafo</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20">
              {(table.relacionamentos_saida?.length || 0) + (table.relacionamentos_entrada?.length || 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("outgoing")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "outgoing"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>FKs Saída</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20">
              {table.relacionamentos_saida?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("incoming")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "incoming"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            <span>FKs Entrada</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-background/20">
              {table.relacionamentos_entrada?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sql")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "sql"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>SQL T-SQL</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Tab */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* TAB GRAFO DE RELACIONAMENTOS */}
        {activeTab === "graph" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <TableRelationGraph
              rootTable={table}
              onSelectTable={onNavigateToTable}
              onOpenSideBySide={onOpenSideBySide}
              activeSecondaryTable={primaryTableName}
            />
          </div>
        )}

        {/* TAB 1: COLUNAS */}
        {activeTab === "columns" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Barra de Busca de Colunas & Filtro de Tipo */}
            <div className="p-3 border-b border-border bg-muted/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filtrar colunas desta tabela (ex: CODFILIAL, DATA)..."
                  value={columnSearch}
                  onChange={(e) => setColumnSearch(e.target.value)}
                  className="pl-8 h-8 text-xs font-mono bg-background"
                />
                {columnSearch && (
                  <button
                    onClick={() => setColumnSearch("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filtro por categoria com contagens */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-[11px]">
                <button
                  onClick={() => setColumnTypeFilter("all")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                    columnTypeFilter === "all"
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todas ({categoryCounts.total})
                </button>
                <button
                  onClick={() => setColumnTypeFilter("keys")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                    columnTypeFilter === "keys"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                  }`}
                >
                  <Key className="h-3 w-3" />
                  Chaves ({categoryCounts.keys})
                </button>
                <button
                  onClick={() => setColumnTypeFilter("text")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                    columnTypeFilter === "text"
                      ? "bg-sky-500 text-white"
                      : "bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20"
                  }`}
                >
                  Texto ({categoryCounts.text})
                </button>
                <button
                  onClick={() => setColumnTypeFilter("number")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                    columnTypeFilter === "number"
                      ? "bg-emerald-500 text-white"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  Números ({categoryCounts.number})
                </button>
                <button
                  onClick={() => setColumnTypeFilter("date")}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                    columnTypeFilter === "date"
                      ? "bg-purple-500 text-white"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
                  }`}
                >
                  Datas ({categoryCounts.date})
                </button>
              </div>
            </div>

            {/* Tabela de Colunas */}
            <div className="flex-1 overflow-y-auto">
              {filteredColumns.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <Filter className="h-6 w-6 text-muted-foreground/40" />
                  <span>Nenhum campo encontrado para o filtro aplicado.</span>
                  {columnSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setColumnSearch("")}
                      className="text-xs mt-1"
                    >
                      Limpar filtro de busca
                    </Button>
                  )}
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 sticky top-0 z-10 border-b border-border backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground w-[35%]">
                        Coluna
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-muted-foreground w-[25%]">
                        Tipo
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground">
                        Descrição
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredColumns.map((col: RMSemanticColumn, colIdx: number) => {
                      const isPk =
                        col.nome.startsWith("COD") ||
                        col.nome.startsWith("ID") ||
                        col.nome === "CHAPA" ||
                        col.nome === "NSEQITMMOV";

                      const typeColor = getColumnTypeBadge(col.tipo);

                      return (
                        <tr
                          key={`${col.nome}-${colIdx}`}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <td className="px-4 py-2.5 text-foreground font-mono font-semibold flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                              {isPk && (
                                <span title="Coluna de Chave Primária / Identificador">
                                  <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                </span>
                              )}
                              <span className="truncate">{col.nome}</span>

                              {/* Atalho direto para detalhar a tabela relacionada ao lado */}
                              {columnToTargetTableMap[col.nome.toUpperCase()] && onOpenSideBySide && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenSideBySide(columnToTargetTableMap[col.nome.toUpperCase()]);
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 transition-colors cursor-pointer"
                                  title={`Abrir ${columnToTargetTableMap[col.nome.toUpperCase()]} ao lado como detalhamento deste campo`}
                                >
                                  <span>➔ {columnToTargetTableMap[col.nome.toUpperCase()]}</span>
                                  <Columns2 className="h-2.5 w-2.5" />
                                </button>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0"
                              onClick={() => handleCopy(col.nome, `col_${col.nome}`)}
                              title="Copiar nome do campo"
                            >
                              {copiedKey === `col_${col.nome}` ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </td>

                          <td className="px-3 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[11px] font-medium border ${typeColor}`}
                            >
                              {col.tipo}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 text-muted-foreground text-xs leading-relaxed font-sans">
                            {col.descricao || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RELACIONAMENTOS DE SAÍDA (FKs) */}
        {activeTab === "outgoing" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>
                Tabelas referenciadas por <strong>{table.tabela}</strong> através de Chaves
                Estrangeiras (FKs):
              </span>
              <span className="font-mono text-[11px]">
                {table.relacionamentos_saida?.length || 0} conexões
              </span>
            </div>

            {!table.relacionamentos_saida || table.relacionamentos_saida.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border">
                Nenhum relacionamento de saída documentado para esta tabela.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {table.relacionamentos_saida.map(
                  (rel: RMSemanticRelationship, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-all space-y-2 shadow-xs group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="font-semibold text-muted-foreground">
                            {table.tabela}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <button
                            onClick={() =>
                              onNavigateToTable && onNavigateToTable(rel.tabela_destino)
                            }
                            className="font-bold text-primary hover:underline transition-colors"
                            title={`Navegar para ${rel.tabela_destino}`}
                          >
                            {rel.tabela_destino}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onOpenSideBySide && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onOpenSideBySide(rel.tabela_destino)}
                              className="h-7 px-2.5 text-xs gap-1 border-border hover:bg-muted"
                              title={`Abrir ${rel.tabela_destino} na janela ao lado para comparar`}
                            >
                              <Columns2 className="h-3 w-3" />
                              <span>Abrir ao Lado</span>
                            </Button>
                          )}

                          {onNavigateToTable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onNavigateToTable(rel.tabela_destino)}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                              title={`Ir para ${rel.tabela_destino}`}
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="p-2 rounded bg-muted/40 border border-border font-mono text-[11px] text-muted-foreground break-all flex items-center justify-between gap-2">
                        <span>
                          <strong className="text-foreground">ON</strong> {rel.chaves_ligacao}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                          onClick={() =>
                            handleCopy(`ON ${rel.chaves_ligacao}`, `rel_${idx}`)
                          }
                          title="Copiar cláusula ON"
                        >
                          {copiedKey === `rel_${idx}` ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RELACIONAMENTOS DE ENTRADA */}
        {activeTab === "incoming" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>
                Tabelas do TOTVS RM que apontam para <strong>{table.tabela}</strong>:
              </span>
              <span className="font-mono text-[11px]">
                {table.relacionamentos_entrada?.length || 0} conexões
              </span>
            </div>

            {!table.relacionamentos_entrada || table.relacionamentos_entrada.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border">
                Nenhuma tabela identificada referenciando {table.tabela} como destino.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {table.relacionamentos_entrada.map(
                  (rel: RMSemanticIncomingRelationship, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-border bg-card hover:border-indigo-500/40 transition-all space-y-2 shadow-xs group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <button
                            onClick={() =>
                              onNavigateToTable && onNavigateToTable(rel.tabela_origem)
                            }
                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
                            title={`Navegar para ${rel.tabela_origem}`}
                          >
                            {rel.tabela_origem}
                          </button>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-semibold text-muted-foreground">
                            {table.tabela}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onOpenSideBySide && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onOpenSideBySide(rel.tabela_origem)}
                              className="h-7 px-2.5 text-xs gap-1 border-border hover:bg-muted"
                              title={`Abrir ${rel.tabela_origem} na janela ao lado para comparar`}
                            >
                              <Columns2 className="h-3 w-3" />
                              <span>Abrir ao Lado</span>
                            </Button>
                          )}

                          {onNavigateToTable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onNavigateToTable(rel.tabela_origem)}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                              title={`Ir para ${rel.tabela_origem}`}
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="p-2 rounded bg-muted/40 border border-border font-mono text-[11px] text-muted-foreground break-all flex items-center justify-between gap-2">
                        <span>
                          <strong className="text-foreground">ON</strong> {rel.chaves_ligacao}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                          onClick={() =>
                            handleCopy(`ON ${rel.chaves_ligacao}`, `in_rel_${idx}`)
                          }
                          title="Copiar cláusula ON"
                        >
                          {copiedKey === `in_rel_${idx}` ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SQL GENERATOR */}
        {activeTab === "sql" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Script 1: SELECT TOP 100 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                  Template de Consulta SELECT (T-SQL)
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(sqlSelectScript, "sql_select")}
                  className="h-7 px-2.5 text-xs gap-1.5"
                >
                  {copiedKey === "sql_select" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar Script</span>
                    </>
                  )}
                </Button>
              </div>

              <pre className="p-3.5 rounded-lg border border-border bg-muted/20 font-mono text-xs text-foreground overflow-x-auto leading-relaxed">
                {sqlSelectScript}
              </pre>
            </div>

            {/* Script 2: Template com JOINs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  Template com JOINs Documentados
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(sqlJoinTemplate, "sql_join")}
                  className="h-7 px-2.5 text-xs gap-1.5"
                >
                  {copiedKey === "sql_join" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar JOINs</span>
                    </>
                  )}
                </Button>
              </div>

              <pre className="p-3.5 rounded-lg border border-border bg-muted/20 font-mono text-xs text-foreground overflow-x-auto leading-relaxed">
                {sqlJoinTemplate}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper para estilizar os tipos de coluna de forma visual e funcional
function getColumnTypeBadge(tipo: string): string {
  const t = tipo.toUpperCase();
  if (t.includes("VARCHAR") || t.includes("CHAR") || t.includes("TEXT")) {
    return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
  }
  if (
    t.includes("INT") ||
    t.includes("NUMERIC") ||
    t.includes("DECIMAL") ||
    t.includes("FLOAT") ||
    t.includes("MONEY")
  ) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  if (t.includes("DATETIME") || t.includes("DATE") || t.includes("TIME")) {
    return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  }
  return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
}
