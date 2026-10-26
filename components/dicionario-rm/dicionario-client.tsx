"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Database,
  Columns2,
  Square,
  Share2,
  Bot,
  PanelLeftClose,
  PanelLeft,
  ArrowRightLeft,
  Copy,
  Check,
  Search,
  Sparkles,
  X,
  Plus,
  Maximize2,
  ArrowRight,
} from "lucide-react";
import {
  RMSemanticTableWithKey,
  RMTableSummary,
} from "@/lib/totvs-rm/types";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { DicionarioSidebar } from "./dicionario-sidebar";
import { TableViewerPane } from "./table-viewer-pane";
import { TableRelationGraph } from "./table-relation-graph";
import { CommonColumnsBar } from "./common-columns-bar";
import { DicionarioEmptyState } from "./dicionario-empty-state";
import {
  DictSearchSession,
  TableDetailsCache,
} from "./types";

const LOCAL_STORAGE_HISTORY = "camini_dicionario_history_v1";

export function DicionarioClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados de layout e sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Catálogo de tabelas
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [catalogTables, setCatalogTables] = useState<RMTableSummary[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const [catalogLimit, setCatalogLimit] = useState(100);

  // Histórico de sessões
  const [sessions, setSessions] = useState<DictSearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Tabelas ativas & Gestão de painéis/tabelas abertas ao lado
  const [primaryTable, setPrimaryTable] = useState<string | null>(null);
  const [secondaryTable, setSecondaryTable] = useState<string | null>(null);
  const [sidePanels, setSidePanels] = useState<string[]>([]);
  const [activeSideTab, setActiveSideTab] = useState<string>("graph"); // 'graph' | tableName | '__PICKER__'
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [secondaryViewMode, setSecondaryViewMode] = useState<"table" | "graph">("graph");

  // Cache de tabelas carregadas
  const [detailsCache, setDetailsCache] = useState<TableDetailsCache>({});
  const [loadingPrimary, setLoadingPrimary] = useState(false);
  const [loadingSecondary, setLoadingSecondary] = useState(false);

  const [linkCopied, setLinkCopied] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInitializedRef = useRef(false);

  // 1. Carregar histórico do localStorage e verificar query params iniciais
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    let initialSessions: DictSearchSession[] = [];
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialSessions = parsed;
        }
      }
    } catch (err) {
      console.error("Erro ao carregar histórico do dicionário:", err);
    }

    // Verificar se a URL contém parâmetros específicos
    const paramTable = searchParams.get("table")?.toUpperCase().trim();
    const paramSplit = searchParams.get("split")?.toUpperCase().trim();
    const paramGraph = searchParams.get("graph")?.toLowerCase().trim();

    if (paramTable) {
      const initialSplits = paramSplit
        ? paramSplit.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
        : [];

      // Criar ou ativar uma sessão com a tabela solicitada
      const newSession: DictSearchSession = {
        id: "session_" + Date.now(),
        title: paramSplit ? `${paramTable} ⟷ ${paramSplit}` : `Tabela: ${paramTable}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        primaryTable: paramTable,
        secondaryTable: initialSplits[0] || null,
        sidePanels: initialSplits,
        activeSideTab: paramGraph === "true" ? "graph" : (initialSplits[0] || "graph"),
        isSplitView: Boolean(paramSplit || paramGraph === "true"),
      };

      const updated = [newSession, ...initialSessions];
      setSessions(updated);
      setActiveSessionId(newSession.id);
      setPrimaryTable(paramTable);
      if (initialSplits.length > 0) {
        setSidePanels(initialSplits);
        setSecondaryTable(initialSplits[0]);
        setActiveSideTab(paramGraph === "true" ? "graph" : initialSplits[0]);
        setSecondaryViewMode(paramGraph === "true" ? "graph" : "table");
        setIsSplitView(true);
      } else if (paramGraph === "true") {
        setSidePanels([]);
        setActiveSideTab("graph");
        setIsSplitView(true);
        setSecondaryViewMode("graph");
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    } else if (initialSessions.length > 0) {
      setSessions(initialSessions);
      const first = initialSessions[0];
      setActiveSessionId(first.id);
      setPrimaryTable(first.primaryTable);

      const loadedSidePanels = first.sidePanels && first.sidePanels.length > 0
        ? first.sidePanels
        : first.secondaryTable
        ? [first.secondaryTable]
        : [];

      setSidePanels(loadedSidePanels);
      setSecondaryTable(first.secondaryTable || (loadedSidePanels[0] || null));
      const chosenSideTab = first.activeSideTab || (first.secondaryTable || "graph");
      setActiveSideTab(chosenSideTab);
      setSecondaryViewMode(chosenSideTab === "graph" ? "graph" : "table");
      setIsSplitView(first.isSplitView || false);

      if (first.searchQuery) setSearchTerm(first.searchQuery);
      if (first.selectedModule) setSelectedModule(first.selectedModule);
    } else {
      // Criar primeira sessão limpa
      const defaultSession: DictSearchSession = {
        id: "session_" + Date.now(),
        title: "Exploração do Dicionário",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        primaryTable: "TMOV",
        secondaryTable: "TITMMOV",
        sidePanels: ["TITMMOV"],
        activeSideTab: "TITMMOV",
        isSplitView: true,
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
      setPrimaryTable("TMOV");
      setSecondaryTable("TITMMOV");
      setSidePanels(["TITMMOV"]);
      setActiveSideTab("TITMMOV");
      setSecondaryViewMode("table");
      setIsSplitView(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify([defaultSession]));
      } catch (e) {
        console.error(e);
      }
    }
  }, [searchParams]);

  // 2. Persistir sessões
  const persistSessions = useCallback((newSessions: DictSearchSession[]) => {
    setSessions(newSessions);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(newSessions));
    } catch (err) {
      console.error("Erro ao salvar histórico do dicionário:", err);
    }
  }, []);

  // 3. Buscar catálogo com debounce
  useEffect(() => {
    let isCancelled = false;

    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set("q", searchTerm);
        if (selectedModule) params.set("module", selectedModule);
        params.set("limit", catalogLimit.toString());

        const res = await fetch(`/api/totvs-rm/tables?${params.toString()}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          setCatalogTables(data.tables || []);
          setTotalMatches(data.totalMatches || (data.tables ? data.tables.length : 0));
        }
      } catch (err) {
        console.error("Erro ao carregar catálogo:", err);
      } finally {
        if (!isCancelled) setLoadingCatalog(false);
      }
    };

    const timer = setTimeout(fetchCatalog, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedModule, catalogLimit]);

  // 4. Buscar detalhes da Tabela Primária
  useEffect(() => {
    if (!primaryTable) return;
    if (detailsCache[primaryTable]) return;

    let isCancelled = false;
    const fetchPrimary = async () => {
      setLoadingPrimary(true);
      try {
        const res = await fetch(
          `/api/totvs-rm/tables?table=${encodeURIComponent(primaryTable)}`
        );
        if (res.ok && !isCancelled) {
          const data: RMSemanticTableWithKey = await res.json();
          setDetailsCache((prev) => ({ ...prev, [primaryTable]: data }));
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes da tabela primária:", err);
      } finally {
        if (!isCancelled) setLoadingPrimary(false);
      }
    };

    fetchPrimary();
    return () => {
      isCancelled = true;
    };
  }, [primaryTable, detailsCache]);

  // 5. Buscar detalhes das tabelas abertas ao lado (em lote / sob demanda)
  useEffect(() => {
    if (!isSplitView) return;

    const tablesToFetch = new Set<string>();
    if (secondaryTable) tablesToFetch.add(secondaryTable);
    if (activeSideTab && activeSideTab !== "graph" && activeSideTab !== "__PICKER__") {
      tablesToFetch.add(activeSideTab);
    }
    sidePanels.forEach((t) => tablesToFetch.add(t));

    tablesToFetch.forEach((tbl) => {
      if (detailsCache[tbl]) return;
      fetch(`/api/totvs-rm/tables?table=${encodeURIComponent(tbl)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: RMSemanticTableWithKey | null) => {
          if (data) {
            setDetailsCache((prev) => ({ ...prev, [tbl]: data }));
          }
        })
        .catch((err) => console.error("Erro ao carregar detalhes lateral:", err));
    });
  }, [secondaryTable, activeSideTab, sidePanels, isSplitView, detailsCache]);

  // 6. Atualizar URL quando o estado mudar
  useEffect(() => {
    const params = new URLSearchParams();
    if (primaryTable) params.set("table", primaryTable);
    if (isSplitView) {
      if (activeSideTab === "graph") {
        params.set("graph", "true");
        if (sidePanels.length > 0) params.set("split", sidePanels.join(","));
      } else if (sidePanels.length > 0) {
        params.set("split", sidePanels.join(","));
        if (activeSideTab && activeSideTab !== sidePanels[0]) {
          params.set("activeSide", activeSideTab);
        }
      } else if (secondaryTable) {
        params.set("split", secondaryTable);
      }
    }

    const query = params.toString();
    const newPath = query ? `/dicionario-rm?${query}` : `/dicionario-rm`;
    window.history.replaceState(null, "", newPath);
  }, [primaryTable, secondaryTable, isSplitView, activeSideTab, sidePanels]);

  // Atualizar sessão atual no histórico
  const updateCurrentSession = useCallback(
    (updates: Partial<DictSearchSession>) => {
      if (!activeSessionId) return;

      const updated = sessions.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            ...updates,
            updatedAt: Date.now(),
          };
        }
        return s;
      });

      persistSessions(updated);
    },
    [activeSessionId, sessions, persistSessions]
  );

  // Ação: Selecionar tabela primária
  const handleSelectPrimaryTable = useCallback(
    (tableName: string) => {
      setPrimaryTable(tableName);
      updateCurrentSession({
        primaryTable: tableName,
        title: secondaryTable && isSplitView ? `${tableName} ⟷ ${secondaryTable}` : `Tabela: ${tableName}`,
      });
    },
    [secondaryTable, isSplitView, updateCurrentSession]
  );

  // Ação: Abrir tabela na coluna ao lado (adiciona à lista de abas e ativa)
  const handleOpenSideBySide = useCallback(
    (targetTable: string) => {
      const tableUpper = targetTable.toUpperCase().trim();
      if (!primaryTable) {
        setPrimaryTable(tableUpper);
        return;
      }
      setSidePanels((prev) => {
        const next = prev.includes(tableUpper) ? prev : [...prev, tableUpper];
        return next;
      });
      setSecondaryTable(tableUpper);
      setActiveSideTab(tableUpper);
      setSecondaryViewMode("table");
      setIsSplitView(true);
      updateCurrentSession({
        secondaryTable: tableUpper,
        sidePanels: sidePanels.includes(tableUpper) ? sidePanels : [...sidePanels, tableUpper],
        activeSideTab: tableUpper,
        isSplitView: true,
        title: `${primaryTable} ⟷ ${tableUpper}`,
      });
    },
    [primaryTable, sidePanels, updateCurrentSession]
  );

  // Ação: Fechar uma aba da lista de tabelas abertas ao lado
  const handleCloseSideTab = useCallback(
    (tableToClose: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setSidePanels((prev) => {
        const next = prev.filter((t) => t !== tableToClose);
        let nextActive = activeSideTab;
        let nextSec = secondaryTable;

        if (activeSideTab === tableToClose) {
          if (next.length > 0) {
            nextActive = next[next.length - 1];
            nextSec = nextActive;
            setSecondaryViewMode("table");
          } else {
            nextActive = "graph";
            nextSec = null;
            setSecondaryViewMode("graph");
          }
        }
        setActiveSideTab(nextActive);
        setSecondaryTable(nextSec);

        updateCurrentSession({
          sidePanels: next,
          secondaryTable: nextSec,
          activeSideTab: nextActive,
        });

        return next;
      });
    },
    [activeSideTab, secondaryTable, updateCurrentSession]
  );

  // Ação: Limpar todas as tabelas abertas ao lado
  const handleClearAllSideTabs = useCallback(() => {
    setSidePanels([]);
    setActiveSideTab("graph");
    setSecondaryTable(null);
    setSecondaryViewMode("graph");
    updateCurrentSession({
      sidePanels: [],
      secondaryTable: null,
      activeSideTab: "graph",
    });
  }, [updateCurrentSession]);

  // Ação: Inverter tabelas (Swap)
  const handleSwapTables = useCallback(() => {
    if (!primaryTable || !secondaryTable) return;
    const temp = primaryTable;
    setPrimaryTable(secondaryTable);
    setSecondaryTable(temp);
    updateCurrentSession({
      primaryTable: secondaryTable,
      secondaryTable: temp,
      title: `${secondaryTable} ⟷ ${temp}`,
    });
  }, [primaryTable, secondaryTable, updateCurrentSession]);

  // Ação: Criar Nova Sessão de Pesquisa (estilo ChatGPT)
  const handleNewSession = useCallback(() => {
    const freshSession: DictSearchSession = {
      id: "session_" + Date.now(),
      title: "Nova Pesquisa",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      primaryTable: null,
      secondaryTable: null,
      sidePanels: [],
      activeSideTab: "graph",
      isSplitView: false,
    };

    const updated = [freshSession, ...sessions];
    persistSessions(updated);
    setActiveSessionId(freshSession.id);
    setPrimaryTable(null);
    setSecondaryTable(null);
    setSidePanels([]);
    setActiveSideTab("graph");
    setIsSplitView(false);
    setSearchTerm("");
    setSelectedModule("");
  }, [sessions, persistSessions]);

  // Ação: Selecionar sessão do histórico
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      const target = sessions.find((s) => s.id === sessionId);
      if (!target) return;

      setActiveSessionId(target.id);
      setPrimaryTable(target.primaryTable);

      const loadedSidePanels = target.sidePanels && target.sidePanels.length > 0
        ? target.sidePanels
        : target.secondaryTable
        ? [target.secondaryTable]
        : [];

      setSidePanels(loadedSidePanels);
      setSecondaryTable(target.secondaryTable || (loadedSidePanels[0] || null));
      const chosenSideTab = target.activeSideTab || (target.secondaryTable || "graph");
      setActiveSideTab(chosenSideTab);
      setSecondaryViewMode(chosenSideTab === "graph" ? "graph" : "table");
      setIsSplitView(target.isSplitView || false);

      if (target.searchQuery !== undefined) setSearchTerm(target.searchQuery);
      if (target.selectedModule !== undefined) setSelectedModule(target.selectedModule);
    },
    [sessions]
  );

  // Ação: Deletar sessão
  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh: DictSearchSession = {
          id: "session_" + Date.now(),
          title: "Nova Pesquisa",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          primaryTable: null,
        };
        persistSessions([fresh]);
        setActiveSessionId(fresh.id);
        setPrimaryTable(null);
        setSecondaryTable(null);
        setIsSplitView(false);
      } else {
        persistSessions(remaining);
        if (activeSessionId === sessionId) {
          const next = remaining[0];
          setActiveSessionId(next.id);
          setPrimaryTable(next.primaryTable);
          setSecondaryTable(next.secondaryTable || null);
          setIsSplitView(next.isSplitView || false);
        }
      }
    },
    [sessions, activeSessionId, persistSessions]
  );

  // Ação: Renomear sessão
  const handleRenameSession = useCallback(
    (sessionId: string, newTitle: string) => {
      const updated = sessions.map((s) =>
        s.id === sessionId ? { ...s, title: newTitle, updatedAt: Date.now() } : s
      );
      persistSessions(updated);
    },
    [sessions, persistSessions]
  );

  // Ação: Fixar/desafixar sessão (Pin)
  const handleTogglePinSession = useCallback(
    (sessionId: string) => {
      const updated = sessions.map((s) =>
        s.id === sessionId ? { ...s, pinned: !s.pinned } : s
      );
      persistSessions(updated);
    },
    [sessions, persistSessions]
  );

  // Ação: Copiar link de compartilhamento
  const handleShareLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K para focar busca
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSidebarOpen(true);
        searchInputRef.current?.focus();
      }
      // Alt+S para alternar Split View
      if (e.altKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        if (primaryTable) {
          setIsSplitView((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [primaryTable]);

  const primaryDetails = primaryTable ? detailsCache[primaryTable] : null;
  const activeSideTabDetails =
    activeSideTab && activeSideTab !== "graph" && activeSideTab !== "__PICKER__"
      ? detailsCache[activeSideTab]
      : null;
  const secondaryDetails = secondaryTable && isSplitView ? detailsCache[secondaryTable] : null;

  return (
    <div className="h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* 1. Header Global do Camini */}
      <div className="shrink-0">
        <Navbar />
      </div>

      {/* 2. Sub-Header de Controle do Dicionário */}
      <div className="h-13 border-b border-border bg-muted/20 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hidden md:flex"
            title={isSidebarOpen ? "Recolher catálogo" : "Expandir catálogo"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>

          <div className="h-4 w-px bg-border mx-1 hidden md:block" />

          {/* Status / Tabela(s) ativa(s) */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-xs text-muted-foreground hidden sm:inline">
              Dicionário RM:
            </span>

            {primaryTable ? (
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold truncate">
                <span className="text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                  {primaryTable}
                </span>

                {isSplitView && (
                  <>
                    <span className="text-muted-foreground">⟷</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {activeSideTab === "graph" ? "Grafo de Relações" : (activeSideTab || "Painel ao Lado")}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic truncate">
                Nenhuma tabela selecionada
              </span>
            )}
          </div>
        </div>

        {/* Controles de Visualização & Ações Globais */}
        <div className="flex items-center gap-2">
          {/* Seletor de Modo: Painel Único vs Lado a Lado vs Grafo ao Lado */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setIsSplitView(false)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                !isSplitView
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title="Visualização em Painel Único"
            >
              <Square className="h-3 w-3" />
              <span className="hidden sm:inline">Painel Único</span>
            </button>

            <button
              onClick={() => {
                if (sidePanels.length === 0 && primaryTable) {
                  const firstOutgoing = primaryDetails?.relacionamentos_saida?.[0]?.tabela_destino;
                  const suggested = firstOutgoing || (primaryTable === "TMOV" ? "TITMMOV" : primaryTable === "FLAN" ? "FCFO" : "TMOV");
                  setSidePanels([suggested]);
                  setSecondaryTable(suggested);
                  setActiveSideTab(suggested);
                } else if (sidePanels.length > 0) {
                  const target = sidePanels[sidePanels.length - 1];
                  setSecondaryTable(target);
                  setActiveSideTab(target);
                }
                setSecondaryViewMode("table");
                setIsSplitView(true);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSplitView && activeSideTab !== "graph"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title="Comparar tabelas abertas ao lado"
            >
              <Columns2 className="h-3 w-3" />
              <span className="hidden sm:inline">
                Tabelas Lado a Lado {sidePanels.length > 0 && `(${sidePanels.length})`}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveSideTab("graph");
                setSecondaryViewMode("graph");
                setIsSplitView(true);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSplitView && activeSideTab === "graph"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title="Visualizar Grafo de Relacionamentos na coluna da direita"
            >
              <Share2 className="h-3 w-3 text-primary" />
              <span className="hidden sm:inline">Grafo na Direita</span>
            </button>
          </div>

          {/* Botão de Compartilhar Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLink}
            className="h-8 gap-1.5 text-xs border-border bg-background hover:bg-muted"
            title="Copiar link com a tabela e comparação atuais"
          >
            {linkCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold hidden md:inline">
                  Link Copiado!
                </span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Compartilhar</span>
              </>
            )}
          </Button>

          {/* Link para o Assistente RM SQL AI */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const prompt = primaryTable
                ? `Explique os detalhes e melhores práticas para consultar a tabela ${primaryTable}`
                : "";
              router.push(
                prompt
                  ? `/totvs-rm?initialPrompt=${encodeURIComponent(prompt)}`
                  : `/totvs-rm`
              );
            }}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Abrir no RM SQL AI"
          >
            <Bot className="h-3.5 w-3.5 text-primary" />
            <span className="hidden lg:inline">RM SQL AI</span>
          </Button>
        </div>
      </div>

      {/* 3. Corpo Principal com Sidebar e Área de Conteúdo */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Sidebar Filha (Estilo ChatGPT / Catálogo / Histórico) */}
        <DicionarioSidebar
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onTogglePinSession={handleTogglePinSession}
          catalogTables={catalogTables}
          loadingCatalog={loadingCatalog}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedModule={selectedModule}
          onSelectModule={setSelectedModule}
          onSelectTable={handleSelectPrimaryTable}
          onOpenSideBySide={handleOpenSideBySide}
          activePrimaryTable={primaryTable}
          activeSecondaryTable={secondaryTable}
          inputRef={searchInputRef}
          totalMatches={totalMatches}
          onLoadMore={() => setCatalogLimit((prev) => Math.min(prev + 100, 500))}
          hasMore={catalogTables.length < totalMatches && catalogLimit < 500}
        />

        {/* Área Central de Visualização */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-background overflow-hidden">
          {/* Se nenhuma tabela selecionada: Exibir Welcome / Empty State */}
          {!primaryTable ? (
            <DicionarioEmptyState
              onSelectTable={handleSelectPrimaryTable}
              onOpenSideBySide={(tableA, tableB) => {
                setPrimaryTable(tableA);
                setSecondaryTable(tableB);
                setIsSplitView(true);
                updateCurrentSession({
                  primaryTable: tableA,
                  secondaryTable: tableB,
                  isSplitView: true,
                  title: `${tableA} ⟷ ${tableB}`,
                });
              }}
              onSelectModule={(prefix) => {
                setSelectedModule(prefix);
                setIsSidebarOpen(true);
              }}
              onFocusSearch={() => {
                setIsSidebarOpen(true);
                searchInputRef.current?.focus();
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Barra de Colunas em Comum e Comparação (se Split View no modo tabela e ambas as tabelas carregadas) */}
              {isSplitView && activeSideTabDetails && primaryDetails && (
                <CommonColumnsBar
                  tableA={primaryDetails}
                  tableB={activeSideTabDetails}
                  onSwapTables={handleSwapTables}
                />
              )}

              {/* Modo de Visualização: 1 Painel ou 2 Painéis Lado a Lado */}
              {!isSplitView ? (
                /* PAINEL ÚNICO */
                loadingPrimary && !primaryDetails ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                    Carregando tabela {primaryTable}...
                  </div>
                ) : primaryDetails ? (
                  <TableViewerPane
                    table={primaryDetails}
                    isSecondary={false}
                    isSplitActive={false}
                    onOpenSideBySide={handleOpenSideBySide}
                    onNavigateToTable={handleSelectPrimaryTable}
                    onOpenGraphSideBySide={() => {
                      setActiveSideTab("graph");
                      setSecondaryViewMode("graph");
                      setIsSplitView(true);
                    }}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                    Tabela {primaryTable} não encontrada.
                  </div>
                )
              ) : (
                /* MODO LADO A LADO (SPLIT VIEW) */
                <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border">
                  {/* Janela 1: Tabela Primária (Coluna da Esquerda em Destaque) */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {loadingPrimary && !primaryDetails ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                        Carregando {primaryTable}...
                      </div>
                    ) : primaryDetails ? (
                      <TableViewerPane
                        table={primaryDetails}
                        isSecondary={false}
                        isSplitActive={true}
                        onOpenSideBySide={handleOpenSideBySide}
                        onNavigateToTable={handleSelectPrimaryTable}
                        onOpenGraphSideBySide={() => {
                          setActiveSideTab("graph");
                          setSecondaryViewMode("graph");
                          setIsSplitView(true);
                        }}
                        onMaximizePane={() => setIsSplitView(false)}
                      />
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                        Tabela {primaryTable} não encontrada.
                      </div>
                    )}
                  </div>

                  {/* Janela 2: Coluna da Direita (Gestão de Abas: Grafo e Tabelas Abertas ao Lado) */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
                    {/* Header de Gestão das Colunas/Tabelas Abertas ao Lado */}
                    <div className="border-b border-border bg-muted/20 flex flex-col shrink-0">
                      {/* Linha superior: Título descritivo e Ações da Janela */}
                      <div className="px-3 py-1.5 flex items-center justify-between gap-2 border-b border-border/50 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                            <Columns2 className="h-3 w-3" />
                            <span>Coluna ao Lado</span>
                          </span>
                          <span className="text-muted-foreground text-xs hidden sm:inline">
                            {sidePanels.length === 0
                              ? "Exibindo grafo de relações"
                              : `${sidePanels.length} ${sidePanels.length === 1 ? "tabela aberta" : "tabelas abertas"} para consulta`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {sidePanels.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={handleClearAllSideTabs}
                              title="Fechar todas as tabelas abertas ao lado"
                            >
                              Limpar lista
                            </Button>
                          )}

                          {/* Maximizar janela */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => {
                              if (activeSideTab !== "graph" && activeSideTab !== "__PICKER__" && activeSideTab) {
                                setPrimaryTable(activeSideTab);
                                setIsSplitView(false);
                              } else {
                                setIsSplitView(false);
                              }
                            }}
                            title="Maximizar esta tabela em tela cheia"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </Button>

                          {/* Fechar coluna ao lado */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            onClick={() => setIsSplitView(false)}
                            title="Fechar coluna ao lado"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Linha inferior: BARRA DE ABAS DAS TABELAS ABERTAS AO LADO */}
                      <div className="px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-background">
                        {/* 1. Aba Grafo de Relacionamentos */}
                        <button
                          onClick={() => {
                            setActiveSideTab("graph");
                            setSecondaryViewMode("graph");
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            activeSideTab === "graph"
                              ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                          title={`Visualizar Grafo de Relacionamentos de ${primaryTable}`}
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Grafo ({primaryTable})</span>
                        </button>

                        <div className="h-4 w-px bg-border shrink-0 mx-0.5" />

                        {/* 2. Abas das Tabelas Abertas ao Lado */}
                        {sidePanels.map((tableName) => {
                          const isActive = activeSideTab === tableName;
                          const details = detailsCache[tableName];
                          const colCount = details?.colunas?.length;

                          return (
                            <div
                              key={tableName}
                              onClick={() => {
                                setActiveSideTab(tableName);
                                setSecondaryTable(tableName);
                                setSecondaryViewMode("table");
                              }}
                              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all shrink-0 cursor-pointer border ${
                                isActive
                                  ? "bg-foreground text-background border-foreground shadow-xs font-bold"
                                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                              }`}
                              title={`Inspecionar tabela ${tableName} (${colCount ? `${colCount} colunas` : "carregando..."})`}
                            >
                              <span>{tableName}</span>
                              {colCount !== undefined && (
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-sans ${
                                    isActive
                                      ? "bg-background/25 text-background font-semibold"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {colCount}
                                </span>
                              )}
                              <button
                                onClick={(e) => handleCloseSideTab(tableName, e)}
                                className={`p-0.5 rounded hover:bg-destructive/20 hover:text-destructive transition-colors ${
                                  isActive
                                    ? "text-background/70 hover:text-background"
                                    : "text-muted-foreground/60 hover:text-foreground"
                                }`}
                                title={`Fechar aba ${tableName}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}

                        {/* 3. Botão + Nova Tabela */}
                        <button
                          onClick={() => {
                            setActiveSideTab("__PICKER__");
                            setSecondaryViewMode("table");
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 shrink-0 transition-colors cursor-pointer border ${
                            activeSideTab === "__PICKER__"
                              ? "bg-foreground text-background border-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted border-dashed border-border"
                          }`}
                          title="Escolher outra tabela para abrir ao lado"
                        >
                          <Plus className="h-3 w-3" />
                          <span>+ Nova</span>
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo da Coluna da Direita */}
                    {activeSideTab === "graph" ? (
                      /* MODO 1: GRAFO DE RELACIONAMENTOS INTERATIVO */
                      loadingPrimary && !primaryDetails ? (
                        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                          Carregando grafo de {primaryTable}...
                        </div>
                      ) : primaryDetails ? (
                        <TableRelationGraph
                          rootTable={primaryDetails}
                          compact={true}
                          onSelectTable={handleSelectPrimaryTable}
                          onOpenSideBySide={handleOpenSideBySide}
                          activeSecondaryTable={secondaryTable}
                        />
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                          Tabela {primaryTable} não encontrada.
                        </div>
                      )
                    ) : activeSideTab === "__PICKER__" || (!activeSideTabDetails && !loadingSecondary) ? (
                      /* MODO 2: SELETOR DE NOVA TABELA PARA ABRIR AO LADO */
                      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 space-y-5">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Columns2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">
                              Abrir Tabela ao Lado para Comparação
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Selecione qualquer tabela relacionada com{" "}
                              <strong className="text-foreground font-mono">{primaryTable}</strong> para
                              inspecionar colunas e comparar esquemas lado a lado.
                            </p>
                          </div>
                        </div>

                        {/* Botão de Atalho para o Grafo */}
                        <div
                          onClick={() => {
                            setActiveSideTab("graph");
                            setSecondaryViewMode("graph");
                          }}
                          className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Share2 className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                Ver Grafo Interativo de {primaryTable}
                              </h5>
                              <p className="text-[11px] text-muted-foreground">
                                Diagrama visual em rede com todas as tabelas conectadas por FKs de entrada e saída.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Abrir Grafo →
                          </span>
                        </div>

                        {/* 1. Tabelas com relacionamento documentado no RM */}
                        {primaryDetails && (
                          <div className="space-y-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                              Tabelas Relacionadas com {primaryTable}
                            </span>

                            {primaryDetails.relacionamentos_saida &&
                            primaryDetails.relacionamentos_saida.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {primaryDetails.relacionamentos_saida.slice(0, 10).map((rel, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleOpenSideBySide(rel.tabela_destino)}
                                    className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all text-left flex flex-col gap-1 group shadow-xs cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono font-bold text-xs text-primary group-hover:underline">
                                        {rel.tabela_destino}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-medium">
                                        FK Saída
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground font-mono truncate">
                                      {rel.chaves_ligacao}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 rounded-lg border border-dashed border-border text-xs text-muted-foreground text-center">
                                Nenhum relacionamento direto pré-documentado para {primaryTable}.
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. Atalhos para tabelas populares do RM */}
                        <div className="space-y-2 pt-2 border-t border-border">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Ou escolha uma tabela comum para comparar
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {["TITMMOV", "FCFO", "FLAN", "TPRD", "GCCUSTO", "GFILIAL", "GCOLIGADA"].map(
                              (tbl) => (
                                <button
                                  key={tbl}
                                  onClick={() => handleOpenSideBySide(tbl)}
                                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-mono font-medium text-foreground border border-border transition-colors cursor-pointer"
                                >
                                  + {tbl}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ) : !activeSideTabDetails ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                        Carregando {activeSideTab}...
                      </div>
                    ) : (
                      <TableViewerPane
                        table={activeSideTabDetails}
                        isSecondary={true}
                        isSplitActive={true}
                        primaryTableName={primaryTable || undefined}
                        onOpenSideBySide={handleOpenSideBySide}
                        onNavigateToTable={handleOpenSideBySide}
                        onCloseSecondary={() => handleCloseSideTab(activeSideTab)}
                        onMaximizePane={() => {
                          setPrimaryTable(activeSideTab);
                          setIsSplitView(false);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
