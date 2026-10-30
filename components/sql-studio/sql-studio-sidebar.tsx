"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Database,
  History,
  FileCode,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  Key,
  Cloud,
  CloudOff,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RMTableSummary } from "@/lib/totvs-rm/types";
import {
  SavedSqlQuery,
  SqlStudioSidebarTab,
  SQL_STUDIO_MODULES,
} from "./types";
import { SQL_STUDIO_TEMPLATES, SqlStudioTemplate } from "@/lib/totvs-rm/sql-studio-templates";
import type { CustomUserTemplate } from "@/lib/totvs-rm/templates-sync";

const LOCAL_STORAGE_SIDEBAR_WIDTH = "camini_sql_studio_sidebar_width";
const MIN_SIDEBAR_WIDTH = 260;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 320;

interface SqlStudioSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  // Catálogo
  catalogTables: RMTableSummary[];
  loadingCatalog: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedModule: string;
  onSelectModule: (modulePrefix: string) => void;
  onInsertTableToQuery: (tableName: string) => void;
  // Histórico
  savedQueries: SavedSqlQuery[];
  onSelectSavedQuery: (query: SavedSqlQuery) => void;
  onDeleteSavedQuery: (id: string) => void;
  onRenameSavedQuery: (id: string, newTitle: string) => void;
  // Modelos
  onSelectTemplate: (template: SqlStudioTemplate | CustomUserTemplate) => void;
  userTemplates?: CustomUserTemplate[];
  onDeleteUserTemplate?: (templateId: string) => void;
  isAuthenticated?: boolean;
}

export function SqlStudioSidebar({
  isOpen,
  onToggleOpen,
  catalogTables,
  loadingCatalog,
  searchTerm,
  onSearchChange,
  selectedModule,
  onSelectModule,
  onInsertTableToQuery,
  savedQueries,
  onSelectSavedQuery,
  onDeleteSavedQuery,
  onRenameSavedQuery,
  onSelectTemplate,
  userTemplates = [],
  onDeleteUserTemplate,
  isAuthenticated = false,
}: SqlStudioSidebarProps) {
  const [activeTab, setActiveTab] = useState<SqlStudioSidebarTab>("catalog");
  const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Largura redimensionável
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SIDEBAR_WIDTH);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= MIN_SIDEBAR_WIDTH && val <= MAX_SIDEBAR_WIDTH) {
          setSidebarWidth(val);
        }
      }
    } catch {
      // Ignora erro de localStorage
    }
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return;
      const newWidth = e.clientX;
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      try {
        localStorage.setItem(LOCAL_STORAGE_SIDEBAR_WIDTH, sidebarWidth.toString());
      } catch {
        // Ignora erro de localStorage
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  if (!isOpen) {
    return (
      <aside className="w-12 border-r border-border bg-card/60 flex flex-col items-center py-3 gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOpen}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Abrir painel lateral do SQL Studio"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
        <div className="w-6 h-px bg-border my-1" />
        <button
          onClick={() => {
            setActiveTab("catalog");
            onToggleOpen();
          }}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
          title="Catálogo de Tabelas RM"
        >
          <Database className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setActiveTab("history");
            onToggleOpen();
          }}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground relative"
          title="Histórico de Consultas"
        >
          <History className="h-4 w-4" />
          {savedQueries.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("templates");
            onToggleOpen();
          }}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
          title="Modelos Corporativos RM"
        >
          <FileCode className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className="border-r border-border bg-card flex flex-col h-full min-h-0 select-none relative shrink-0"
    >
      {/* Top Header */}
      <div className="p-3 border-b border-border flex items-center justify-between gap-2 shrink-0 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primary/10 text-primary">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-foreground leading-none">SQL Studio RM</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Editor & Criador Inteligente</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleOpen}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          title="Recolher painel lateral"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-3 pt-2 pb-1 border-b border-border flex items-center gap-1 shrink-0 bg-muted/10 text-xs">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "catalog"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Tabelas</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-colors relative ${
            activeTab === "history"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Histórico</span>
          {savedQueries.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-primary/15 text-primary font-mono font-bold leading-none">
              {savedQueries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex-1 py-1.5 px-2 rounded-md font-medium text-xs flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === "templates"
              ? "bg-background text-foreground shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>Modelos</span>
        </button>
      </div>

      {/* Tab Content: CATÁLOGO DE TABELAS */}
      {activeTab === "catalog" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Busca */}
          <div className="p-3 pb-2 space-y-2 shrink-0 border-b border-border/60">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar tabela ou campo (ex: FLAN, IDMOV)..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-8 text-xs font-mono bg-background"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Pílulas de Módulo */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
              {SQL_STUDIO_MODULES.map((m) => (
                <button
                  key={m.prefix}
                  onClick={() => onSelectModule(m.prefix)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-medium transition-colors whitespace-nowrap ${
                    selectedModule === m.prefix
                      ? "bg-foreground text-background font-semibold shadow-2xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Tabelas */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingCatalog ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <div className="inline-block animate-spin mb-2">⟳</div>
                <p>Carregando catálogo TOTVS RM...</p>
              </div>
            ) : catalogTables.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Nenhuma tabela encontrada para &quot;{searchTerm}&quot;.
              </div>
            ) : (
              catalogTables.map((t) => {
                const firstChar = t.tabela.charAt(0);
                const modCfg = SQL_STUDIO_MODULES.find((m) => m.prefix === firstChar) || {
                  shortLabel: "Geral",
                  colorClass: "bg-muted text-foreground",
                };

                return (
                  <div
                    key={t.tabela}
                    className="p-2 rounded-lg border border-border/60 bg-card hover:bg-muted/40 transition-colors group flex items-start justify-between gap-1.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {t.tabela}
                        </span>
                        <span
                          className={`text-[9.5px] px-1 py-0.2 rounded font-medium ${modCfg.colorClass}`}
                        >
                          {modCfg.shortLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {t.descricao || "Sem descrição"}
                      </p>
                      {t.matchedColumn && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                          <Key className="h-2.5 w-2.5" />
                          <span>Campo: {t.matchedColumn}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-1.5 text-[10.5px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => onInsertTableToQuery(t.tabela)}
                      title={`Inserir ${t.tabela} na consulta ativa`}
                    >
                      <Plus className="h-3 w-3 mr-0.5" />
                      <span>Inserir</span>
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab Content: HISTÓRICO */}
      {activeTab === "history" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-border/60 shrink-0 text-xs text-muted-foreground flex items-center justify-between">
            <span>Consultas Salvas ({savedQueries.length})</span>
            <span className="text-[10px]">Armazenado localmente</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {savedQueries.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <History className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p>Nenhuma consulta salva ainda.</p>
                <p className="text-[11px] mt-1 text-muted-foreground/80">
                  Ao criar consultas, use o botão &quot;Salvar&quot; no editor para guardá-las aqui.
                </p>
              </div>
            ) : (
              savedQueries.map((q) => (
                <div
                  key={q.id}
                  className="p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/40 transition-colors group space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    {editingQueryId === q.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-6 text-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            if (editTitle.trim()) {
                              onRenameSavedQuery(q.id, editTitle.trim());
                            }
                            setEditingQueryId(null);
                          }}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingQueryId(null)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4
                          onClick={() => onSelectSavedQuery(q)}
                          className="font-semibold text-xs text-foreground truncate cursor-pointer hover:underline"
                          title={q.title}
                        >
                          {q.title}
                        </h4>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => {
                              setEditingQueryId(q.id);
                              setEditTitle(q.title);
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground rounded"
                            title="Renomear"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onDeleteSavedQuery(q.id)}
                            className="p-1 text-muted-foreground hover:text-destructive rounded"
                            title="Excluir"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {q.tablesUsed && q.tablesUsed.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {q.tablesUsed.map((tbl) => (
                        <span
                          key={tbl}
                          className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-muted font-bold text-muted-foreground"
                        >
                          {tbl}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>{new Date(q.updatedAt).toLocaleDateString("pt-BR")}</span>
                    <button
                      onClick={() => onSelectSavedQuery(q)}
                      className="text-primary hover:underline font-medium"
                    >
                      Abrir no Editor ➔
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Content: MODELOS RM */}
      {activeTab === "templates" && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-border/60 shrink-0 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <FileCode className="h-3.5 w-3.5 text-primary" />
              <span>Modelos de Consulta</span>
            </div>
            {isAuthenticated ? (
              <span
                className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium"
                title="Sincronizado automaticamente com sua conta no Supabase"
              >
                <Cloud className="h-3 w-3" />
                <span>Supabase</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                title="Armazenado em cookies/localStorage. Conecte sua conta para salvar na nuvem."
              >
                <CloudOff className="h-3 w-3" />
                <span>Modo Local</span>
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {/* SEÇÃO 1: MODELOS SALVOS PELO USUÁRIO */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Meus Modelos ({userTemplates.length})
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isAuthenticated ? "Nuvem & Local" : "Offline / Cache"}
                </span>
              </div>

              {userTemplates.length === 0 ? (
                <div className="p-3.5 rounded-lg border border-dashed border-border/80 bg-muted/20 text-center space-y-1.5">
                  <BookmarkCheck className="h-5 w-5 mx-auto text-muted-foreground/60" />
                  <p className="text-xs font-medium text-foreground">Nenhum modelo salvo ainda</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Crie sua query no editor e clique no botão{" "}
                    <strong className="text-foreground">&quot;Salvar Modelo&quot;</strong> para guardar aqui
                    {isAuthenticated ? " e sincronizar na sua conta." : " e reutilizar depois."}
                  </p>
                </div>
              ) : (
                userTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/40 transition-colors space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/10 text-primary truncate">
                          {tmpl.moduleLabel || "Personalizado"}
                        </span>
                        {tmpl.isSyncedWithSupabase ? (
                          <span
                            className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0"
                            title="Sincronizado na nuvem (Supabase)"
                          >
                            <Cloud className="h-2.5 w-2.5" />
                            <span>Supabase</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded font-semibold bg-muted text-muted-foreground border border-border shrink-0"
                            title="Salvo localmente"
                          >
                            <CloudOff className="h-2.5 w-2.5" />
                            <span>Local</span>
                          </span>
                        )}
                      </div>

                      {onDeleteUserTemplate && (
                        <button
                          onClick={() => onDeleteUserTemplate(tmpl.id)}
                          className="p-1 text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          title="Excluir este modelo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-foreground truncate" title={tmpl.title}>
                        {tmpl.title}
                      </h4>
                      {tmpl.description && (
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                          {tmpl.description}
                        </p>
                      )}
                    </div>

                    {tmpl.mainTables && tmpl.mainTables.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        {tmpl.mainTables.map((tbl) => (
                          <span
                            key={tbl}
                            className="px-1 py-0.2 rounded font-mono text-[9px] bg-muted font-bold text-muted-foreground"
                          >
                            {tbl}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-6 text-[11px] font-medium mt-1"
                      onClick={() => onSelectTemplate(tmpl)}
                    >
                      <FileCode className="h-3 w-3 mr-1 text-primary" />
                      <span>Carregar no Editor</span>
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* SEÇÃO 2: MODELOS OFICIAIS TOTVS RM */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Modelos Oficiais RM
                </span>
                <span className="text-[10px] text-muted-foreground">T-SQL Corporativo</span>
              </div>

              {SQL_STUDIO_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/40 transition-colors space-y-1.5 group"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                      {tmpl.moduleLabel}
                    </span>
                    <div className="flex items-center gap-1">
                      {tmpl.mainTables.map((tbl) => (
                        <span
                          key={tbl}
                          className="px-1 py-0.2 rounded font-mono text-[9px] bg-muted font-bold text-muted-foreground"
                        >
                          {tbl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-foreground">{tmpl.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                      {tmpl.description}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-6 text-[11px] font-medium"
                    onClick={() => onSelectTemplate(tmpl)}
                  >
                    <FileCode className="h-3 w-3 mr-1 text-primary" />
                    <span>Carregar no Editor</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drag handle para redimensionar */}
      <div
        onMouseDown={startResizing}
        className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors ${
          isResizing ? "bg-primary" : "bg-transparent"
        }`}
        title="Arraste para redimensionar o painel"
      />
    </aside>
  );
}
