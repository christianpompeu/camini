"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Database,
  Trash2,
  Edit2,
  Check,
  X,
  Pin,
  Clock,
  Columns2,
  Layers,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  Sparkles,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RMTableSummary } from "@/lib/totvs-rm/types";
import {
  DictSearchSession,
  RM_MODULES_CONFIG,
  POPULAR_RM_TABLES,
} from "./types";

const LOCAL_STORAGE_SIDEBAR_WIDTH = "camini_dict_sidebar_width";
const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 320;

interface DicionarioSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  sessions: DictSearchSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  // Catálogo de tabelas
  catalogTables: RMTableSummary[];
  loadingCatalog: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedModule: string;
  onSelectModule: (modulePrefix: string) => void;
  onSelectTable: (tableName: string) => void;
  onOpenSideBySide?: (tableName: string) => void;
  activePrimaryTable: string | null;
  activeSecondaryTable: string | null;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  totalMatches?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function DicionarioSidebar({
  isOpen,
  onToggleOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  catalogTables,
  loadingCatalog,
  searchTerm,
  onSearchChange,
  selectedModule,
  onSelectModule,
  onSelectTable,
  onOpenSideBySide,
  activePrimaryTable,
  activeSecondaryTable,
  inputRef,
  totalMatches,
  onLoadMore,
  hasMore,
}: DicionarioSidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"catalog" | "history">("catalog");

  // Largura redimensionável
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SIDEBAR_WIDTH);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          setSidebarWidth(parsed);
        }
      }
    } catch {}
  }, []);

  // Lógica de drag para redimensionar a sidebar
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Clamping dentro dos limites definidos
      const newWidth = Math.min(Math.max(e.clientX, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      try {
        localStorage.setItem(LOCAL_STORAGE_SIDEBAR_WIDTH, sidebarWidth.toString());
      } catch {}
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const startRename = (session: DictSearchSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
  };

  // Agrupamento temporal do histórico (estilo ChatGPT)
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * ONE_DAY;

  const pinnedSessions = sessions.filter((s) => s.pinned);
  const unpinnedSessions = sessions.filter((s) => !s.pinned);

  const todaySessions = unpinnedSessions.filter(
    (s) => now - s.updatedAt < ONE_DAY
  );
  const yesterdaySessions = unpinnedSessions.filter(
    (s) => now - s.updatedAt >= ONE_DAY && now - s.updatedAt < 2 * ONE_DAY
  );
  const last7DaysSessions = unpinnedSessions.filter(
    (s) => now - s.updatedAt >= 2 * ONE_DAY && now - s.updatedAt < SEVEN_DAYS
  );
  const olderSessions = unpinnedSessions.filter(
    (s) => now - s.updatedAt >= SEVEN_DAYS
  );

  const hasCatalogFilter = searchTerm.trim().length > 0 || selectedModule !== "";

  // 1. VERSÃO MINIMIZADA (RAIL ESTREITO COM ÍCONES) QUANDO RECOLHIDA NO DESKTOP
  if (!isOpen) {
    return (
      <aside className="w-14 h-full min-h-0 bg-background border-r border-border hidden md:flex flex-col items-center py-3.5 gap-3 shrink-0 z-30 select-none">
        {/* Botão de Expandir */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOpen}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
          title="Expandir catálogo e histórico"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>

        {/* Botão de Nova Pesquisa */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            onNewSession();
            setSidebarTab("catalog");
            onToggleOpen();
          }}
          className="h-9 w-9 text-foreground bg-background hover:bg-muted border-border cursor-pointer"
          title="Nova Pesquisa"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Botão de Foco na Busca / Catálogo */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSidebarTab("catalog");
            onToggleOpen();
            setTimeout(() => inputRef?.current?.focus(), 100);
          }}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          title="Catálogo de tabelas (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
        </Button>

        <div className="w-6 h-px bg-border/60 my-1" />

        {/* Atalho de Histórico Recente */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSidebarTab("history");
            onToggleOpen();
          }}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted relative cursor-pointer"
          title={`Histórico (${sessions.length} pesquisas)`}
        >
          <Clock className="h-4 w-4" />
          {sessions.length > 0 && (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </Button>

        {/* Atalho para Módulos Rápidos */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSidebarTab("catalog");
            onToggleOpen();
          }}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          title="Módulos TOTVS RM"
        >
          <Layers className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {/* Link para o RM SQL AI */}
        <Link
          href="/totvs-rm"
          className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Ir para RM SQL AI"
        >
          <Bot className="h-4 w-4 text-primary" />
        </Link>
      </aside>
    );
  }

  // 2. VERSÃO EXPANDIDA DA SIDEBAR (REDIMENSIONÁVEL COM SEPARADORES SUTIS)
  return (
    <>
      <aside
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className="fixed md:static inset-y-0 left-0 z-40 h-full min-h-0 bg-background border-r border-border flex flex-col shrink-0 relative transition-none select-auto"
      >
        {/* Top Header com Botão + Nova Pesquisa */}
        <div className="p-3 border-b border-border flex items-center justify-between gap-2 shrink-0 h-14 bg-muted/15">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Database className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs truncate block leading-tight text-foreground">
                Dicionário RM
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                9.400+ tabelas catalogadas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onNewSession();
                setSidebarTab("catalog");
              }}
              className="h-8 px-2.5 text-xs gap-1.5 font-medium shadow-xs cursor-pointer"
              title="Iniciar nova pesquisa limpa"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nova</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleOpen}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Recolher para modo estreito"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Campo de Busca & Filtros Rápidos */}
        <div className="p-3 border-b border-border space-y-2 shrink-0 bg-muted/10">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar tabela, campo ou descrição (ex: TMOV, CODFILIAL, nota)..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (sidebarTab !== "catalog") {
                  setSidebarTab("catalog");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && catalogTables.length > 0) {
                  e.preventDefault();
                  onSelectTable(catalogTables[0].tabela);
                }
              }}
              className="pl-8 pr-7 h-8 text-xs font-mono bg-background"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  onSearchChange("");
                  setSidebarTab("catalog");
                  inputRef?.current?.focus();
                }}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                title="Limpar busca e exibir todas as tabelas"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Módulos TOTVS RM em pills horizontais */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
            {RM_MODULES_CONFIG.slice(0, 7).map((mod) => (
              <button
                key={mod.prefix}
                onClick={() => {
                  onSelectModule(selectedModule === mod.prefix ? "" : mod.prefix);
                  if (sidebarTab !== "catalog") {
                    setSidebarTab("catalog");
                  }
                }}
                className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors font-medium border text-[11px] cursor-pointer ${
                  selectedModule === mod.prefix
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                }`}
                title={mod.label}
              >
                {mod.shortLabel}
              </button>
            ))}
          </div>

          {/* Indicador de filtro de módulo ativo com atalho para limpar */}
          {selectedModule && (
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>
                Módulo ativo:{" "}
                <strong className="text-foreground">
                  {RM_MODULES_CONFIG.find((m) => m.prefix === selectedModule)?.shortLabel || selectedModule}
                </strong>
              </span>
              <button
                onClick={() => onSelectModule("")}
                className="text-primary hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
              >
                <span>Mostrar todas</span>
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Seletor Segmentado: TABELAS vs HISTÓRICO */}
        <div className="px-3 pt-2 pb-1 bg-background shrink-0">
          <div className="flex items-center p-1 bg-muted/40 rounded-lg border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setSidebarTab("catalog")}
              className={`flex-1 py-1 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === "catalog"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Tabelas</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                ({catalogTables.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarTab("history")}
              className={`flex-1 py-1 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === "history"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Histórico</span>
              {sessions.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-mono font-bold">
                  {sessions.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conteúdo Dinâmico: Catálogo de Tabelas ou Histórico estilo ChatGPT */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {sidebarTab === "catalog" ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground flex items-center justify-between border-b border-border/40 pb-1.5 mb-1">
                <span>
                  {searchTerm.trim()
                    ? "Resultados da Busca"
                    : selectedModule
                    ? `Tabelas do Módulo ${selectedModule}`
                    : "Todas as Tabelas"}
                </span>
                <span className="font-mono text-[10px]">
                  {searchTerm.trim()
                    ? `${catalogTables.length} encontradas`
                    : totalMatches
                    ? `${catalogTables.length} de ${totalMatches.toLocaleString("pt-BR")}`
                    : `${catalogTables.length} tabelas`}
                </span>
              </div>

              {loadingCatalog && catalogTables.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Consultando catálogo de tabelas...
                </div>
              ) : catalogTables.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                  <div>Nenhuma tabela encontrada{searchTerm ? ` para "${searchTerm}"` : ""}.</div>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSearchChange("")}
                      className="text-xs h-7 cursor-pointer"
                    >
                      Limpar busca e ver todas
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border/40">
                    {catalogTables.map((t) => {
                      const isPrimary = activePrimaryTable === t.tabela;
                      const isSecondary = activeSecondaryTable === t.tabela;

                      return (
                        <div
                          key={t.tabela}
                          onClick={() => onSelectTable(t.tabela)}
                          className={`group w-full text-left px-2.5 py-2.5 transition-all text-xs cursor-pointer flex flex-col gap-1 ${
                            isPrimary
                              ? "bg-primary/10 text-primary font-medium"
                              : isSecondary
                              ? "bg-amber-500/10 text-foreground"
                              : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5 w-full">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-foreground">
                                {t.tabela}
                              </span>
                              {isPrimary && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary text-primary-foreground">
                                  Ativa
                                </span>
                              )}
                              {isSecondary && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                  Ao lado
                                </span>
                              )}
                              {t.matchedColumn && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
                                  <Key className="h-2.5 w-2.5" />
                                  <span>{t.matchedColumn}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted border border-border text-muted-foreground font-mono">
                                {t.sistema.replace("RM ", "")}
                              </span>

                              {onOpenSideBySide && !isPrimary && !isSecondary && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenSideBySide(t.tabela);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-opacity cursor-pointer"
                                  title="Abrir ao lado para comparar"
                                >
                                  <Columns2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          <span className="text-[11px] truncate w-full text-muted-foreground group-hover:text-foreground leading-normal">
                            {t.descricao || "Sem descrição"}
                          </span>

                          {t.matchedColumn && t.matchedColumnDesc && (
                            <span className="text-[10px] truncate w-full text-sky-600 dark:text-sky-400 font-mono">
                              ↳ Campo: <strong>{t.matchedColumn}</strong> — {t.matchedColumnDesc}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {hasMore && onLoadMore && (
                    <div className="pt-2 pb-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onLoadMore}
                        className="w-full text-xs h-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Carregar mais tabelas (+100)...
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* SE ESTIVER NA ABA DE HISTÓRICO: Exibir Sessões estilo ChatGPT com divisores sutis */
            <div className="space-y-4">
              {/* Sessões Fixadas */}
              {pinnedSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/40 pb-1 mb-1">
                    <Pin className="h-3 w-3 text-amber-500" />
                    <span>Fixados</span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {pinnedSessions.map((session) => (
                      <HistorySessionItem
                        key={session.id}
                        session={session}
                        isActive={activeSessionId === session.id}
                        editingId={editingSessionId}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        onSelect={() => onSelectSession(session.id)}
                        onStartRename={(e) => startRename(session, e)}
                        onSaveRename={(e) => saveRename(session.id, e)}
                        onCancelRename={cancelRename}
                        onDelete={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        onTogglePin={(e) => {
                          e.stopPropagation();
                          onTogglePinSession(session.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Hoje */}
              {todaySessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/40 pb-1 mb-1">
                    <Clock className="h-3 w-3" />
                    <span>Hoje</span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {todaySessions.map((session) => (
                      <HistorySessionItem
                        key={session.id}
                        session={session}
                        isActive={activeSessionId === session.id}
                        editingId={editingSessionId}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        onSelect={() => onSelectSession(session.id)}
                        onStartRename={(e) => startRename(session, e)}
                        onSaveRename={(e) => saveRename(session.id, e)}
                        onCancelRename={cancelRename}
                        onDelete={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        onTogglePin={(e) => {
                          e.stopPropagation();
                          onTogglePinSession(session.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Ontem */}
              {yesterdaySessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1 mb-1">
                    Ontem
                  </div>
                  <div className="divide-y divide-border/40">
                    {yesterdaySessions.map((session) => (
                      <HistorySessionItem
                        key={session.id}
                        session={session}
                        isActive={activeSessionId === session.id}
                        editingId={editingSessionId}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        onSelect={() => onSelectSession(session.id)}
                        onStartRename={(e) => startRename(session, e)}
                        onSaveRename={(e) => saveRename(session.id, e)}
                        onCancelRename={cancelRename}
                        onDelete={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        onTogglePin={(e) => {
                          e.stopPropagation();
                          onTogglePinSession(session.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Últimos 7 dias */}
              {last7DaysSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1 mb-1">
                    Últimos 7 dias
                  </div>
                  <div className="divide-y divide-border/40">
                    {last7DaysSessions.map((session) => (
                      <HistorySessionItem
                        key={session.id}
                        session={session}
                        isActive={activeSessionId === session.id}
                        editingId={editingSessionId}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        onSelect={() => onSelectSession(session.id)}
                        onStartRename={(e) => startRename(session, e)}
                        onSaveRename={(e) => saveRename(session.id, e)}
                        onCancelRename={cancelRename}
                        onDelete={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        onTogglePin={(e) => {
                          e.stopPropagation();
                          onTogglePinSession(session.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Mais antigos */}
              {olderSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1 mb-1">
                    Mais antigos
                  </div>
                  <div className="divide-y divide-border/40">
                    {olderSessions.map((session) => (
                      <HistorySessionItem
                        key={session.id}
                        session={session}
                        isActive={activeSessionId === session.id}
                        editingId={editingSessionId}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        onSelect={() => onSelectSession(session.id)}
                        onStartRename={(e) => startRename(session, e)}
                        onSaveRename={(e) => saveRename(session.id, e)}
                        onCancelRename={cancelRename}
                        onDelete={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        onTogglePin={(e) => {
                          e.stopPropagation();
                          onTogglePinSession(session.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Se o histórico estiver vazio */}
              {sessions.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground space-y-3">
                  <div className="h-10 w-10 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>Nenhuma pesquisa anterior no histórico.</div>
                  <p className="text-[11px] text-muted-foreground">
                    Suas consultas de tabelas e comparações ficam salvas automaticamente aqui.
                  </p>
                </div>
              )}

              {/* Atalhos Rápidos para Tabelas Populares */}
              <div className="pt-2 border-t border-border/80 space-y-2">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3 w-3" />
                  <span>Acesso Rápido</span>
                </div>
                <div className="flex flex-wrap gap-1 px-1">
                  {POPULAR_RM_TABLES.slice(0, 8).map((p) => (
                    <button
                      key={p.table}
                      onClick={() => onSelectTable(p.table)}
                      className="px-2 py-1 rounded bg-muted/70 hover:bg-muted text-[11px] font-mono font-medium text-foreground border border-border/70 hover:border-border transition-colors"
                      title={`${p.table} - ${p.name}`}
                    >
                      {p.table}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between gap-2 shrink-0 text-xs">
          <Link
            href="/totvs-rm"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <Bot className="h-3.5 w-3.5 text-primary" />
            <span>Ir para RM SQL AI</span>
          </Link>

          <span className="text-[10px] text-muted-foreground font-mono">v1.0 Pública</span>
        </div>

        {/* Barra de Arraste (Resize Drag Handle) na borda direita */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors z-50 group hidden md:block ${
            isResizing ? "bg-primary" : "bg-transparent"
          }`}
          title="Clique e arraste para redimensionar a barra lateral"
        >
          <div className="w-0.5 h-8 bg-muted-foreground/30 rounded-full mx-auto my-auto relative top-1/2 -translate-y-1/2 group-hover:bg-primary" />
        </div>
      </aside>
    </>
  );
}

// Sub-componente de item de sessão no histórico (com visual limpo, sem repetições de texto)
interface HistorySessionItemProps {
  session: DictSearchSession;
  isActive: boolean;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSelect: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: (e: React.MouseEvent) => void;
  onCancelRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
}

function HistorySessionItem({
  session,
  isActive,
  editingId,
  editTitle,
  setEditTitle,
  onSelect,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onDelete,
  onTogglePin,
}: HistorySessionItemProps) {
  const isEditing = editingId === session.id;

  if (isEditing) {
    return (
      <div className="px-2.5 py-2 bg-background flex items-center gap-1 border border-primary rounded-md">
        <Input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="h-7 text-xs px-2"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveRename(e as unknown as React.MouseEvent);
            if (e.key === "Escape") onCancelRename(e as unknown as React.MouseEvent);
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-emerald-500 hover:text-emerald-600 shrink-0"
          onClick={onSaveRename}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
          onClick={onCancelRename}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  // Verificar se o título é customizado pelo usuário ou gerado automaticamente
  const isCustomTitle =
    session.title &&
    !session.title.startsWith("Tabela: ") &&
    !session.title.includes(" ⟷ ") &&
    session.title !== "Exploração do Dicionário" &&
    session.title !== "Nova Pesquisa";

  const isComparison = Boolean(session.secondaryTable);

  return (
    <div
      onClick={onSelect}
      className={`group w-full text-left px-2.5 py-2.5 transition-all text-xs cursor-pointer flex items-center justify-between gap-1.5 ${
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      }`}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        {/* Se tiver título customizado, exibi-lo no topo */}
        {isCustomTitle ? (
          <div className="truncate text-xs font-semibold text-foreground">
            {session.title}
          </div>
        ) : null}

        {/* Badges de tabela limpos sem o texto redundante "Tabela: " */}
        {isComparison ? (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="font-bold text-foreground bg-muted/80 px-1.5 py-0.2 rounded border border-border">
              {session.primaryTable}
            </span>
            <span className="text-[10px] text-muted-foreground">⟷</span>
            <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
              {session.secondaryTable}
            </span>
          </div>
        ) : session.primaryTable ? (
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
            <span className="truncate">{session.primaryTable}</span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic truncate">
            {session.title || "Nova Pesquisa"}
          </div>
        )}
      </div>

      {/* Ações ao passar o mouse */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onTogglePin}
          className={`p-1 rounded hover:bg-muted ${
            session.pinned ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
          }`}
          title={session.pinned ? "Desafixar" : "Fixar no topo"}
        >
          <Pin className="h-3 w-3" />
        </button>

        <button
          onClick={onStartRename}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
          title="Renomear pesquisa"
        >
          <Edit2 className="h-3 w-3" />
        </button>

        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
          title="Excluir do histórico"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

