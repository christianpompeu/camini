"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout/navbar";
import { SqlStudioSidebar } from "./sql-studio-sidebar";
import { SmartSqlEditor } from "./smart-sql-editor";
import { QueryInspectorPane } from "./query-inspector-pane";
import {
  extractTablesFromQuery,
  extractColumnsFromSelect,
  validateRmSqlQuery,
  findAvailableJoins,
  appendColumnToSelect,
} from "@/lib/totvs-rm/query-parser";
import { formatRmJoinSnippet, formatRmSqlQuery } from "@/lib/totvs-rm/sql-format";
import { RMTableSummary, RMSemanticTableWithKey } from "@/lib/totvs-rm/types";
import { SavedSqlQuery } from "./types";
import { SQL_STUDIO_TEMPLATES, SqlStudioTemplate } from "@/lib/totvs-rm/sql-studio-templates";
import {
  loadAllStudioTemplates,
  saveStudioTemplate,
  deleteStudioTemplate,
  type CustomUserTemplate,
} from "@/lib/totvs-rm/templates-sync";

const LOCAL_STORAGE_SAVED_QUERIES = "camini_sql_studio_saved_queries";
const LOCAL_STORAGE_LAST_QUERY = "camini_sql_studio_last_active_query";

export function SqlStudioClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // SQL State
  const [sql, setSql] = useState<string>(() => {
    return SQL_STUDIO_TEMPLATES[0].sql;
  });

  // Catálogo de Tabelas
  const [catalogTables, setCatalogTables] = useState<RMTableSummary[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("");

  // Cache de Detalhes de Tabelas conhecidas no Studio
  const [tableDetailsMap, setTableDetailsMap] = useState<Record<string, RMSemanticTableWithKey>>({});

  // Consultas Salvas
  const [savedQueries, setSavedQueries] = useState<SavedSqlQuery[]>([]);

  // Modelos Salvos pelo Usuário (Supabase + Local)
  const [userTemplates, setUserTemplates] = useState<CustomUserTemplate[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setUserEmail] = useState<string | undefined>(undefined);

  // Carrega histórico local e modelos sincronizados
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SAVED_QUERIES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedQueries(parsed);
        }
      }

      const last = localStorage.getItem(LOCAL_STORAGE_LAST_QUERY);
      if (last && last.trim().length > 10) {
        setSql(last);
      }
    } catch {
      // Ignora erro de localStorage
    }

    // Carrega modelos de consulta (local + Supabase se autenticado)
    loadAllStudioTemplates().then((res) => {
      setUserTemplates(res.userTemplates);
      setIsAuthenticated(res.isAuthenticated);
      setUserEmail(res.userEmail);
    });
  }, []);

  // Persiste a última query editada
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LAST_QUERY, sql);
    } catch {
      // Ignora erro
    }
  }, [sql]);

  // Carregamento de catálogo via API
  const fetchCatalog = useCallback(async (query: string, modulePrefix: string) => {
    try {
      setLoadingCatalog(true);
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (modulePrefix) params.set("module", modulePrefix);
      params.set("limit", "120");

      const res = await fetch(`/api/totvs-rm/tables?${params.toString()}`);
      if (!res.ok) throw new Error("Falha ao buscar catálogo");
      const data = await res.json();
      setCatalogTables(data.tables || []);
    } catch (err) {
      console.error("Erro ao carregar catálogo RM:", err);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog(searchTerm, selectedModule);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedModule, fetchCatalog]);

  // Análise em tempo real das tabelas presentes na query
  const tablesInQuery = useMemo(() => {
    return extractTablesFromQuery(sql);
  }, [sql]);

  // Carrega detalhes semânticos (colunas + FKs) para cada tabela na query se ainda não estiver em cache
  useEffect(() => {
    tablesInQuery.forEach(async (t) => {
      const name = t.tableName.toUpperCase();
      if (!tableDetailsMap[name]) {
        try {
          const res = await fetch(`/api/totvs-rm/tables?table=${encodeURIComponent(name)}`);
          if (res.ok) {
            const data: RMSemanticTableWithKey = await res.json();
            setTableDetailsMap((prev) => ({
              ...prev,
              [name]: data,
            }));
          }
        } catch (err) {
          console.error(`Erro ao buscar detalhes da tabela ${name}:`, err);
        }
      }
    });
  }, [tablesInQuery, tableDetailsMap]);

  // Campos selecionados
  const selectedColumns = useMemo(() => {
    return extractColumnsFromSelect(sql);
  }, [sql]);

  // Oportunidades de JOIN calculadas pelo Grafo Semântico
  const joinOpportunities = useMemo(() => {
    return findAvailableJoins(tablesInQuery, tableDetailsMap);
  }, [tablesInQuery, tableDetailsMap]);

  // Validação de Qualidade T-SQL RM
  const qualityChecks = useMemo(() => {
    return validateRmSqlQuery(sql);
  }, [sql]);

  // Formatação automática no padrão estrito TOTVS RM
  const handleFormatSql = useCallback(() => {
    if (!sql.trim()) return;
    const formatted = formatRmSqlQuery(sql);
    setSql(formatted);
  }, [sql]);

  // Inserção de tabela do catálogo para a query ativa
  const handleInsertTableToQuery = (tableName: string) => {
    const cleanTable = tableName.toUpperCase().trim();
    if (tablesInQuery.length === 0 || !sql.trim()) {
      // Inicia nova consulta padrão com esta tabela
      const initial = `/* Consulta TOTVS RM: ${cleanTable} */
SELECT
        ${cleanTable}.CODCOLIGADA               AS [CODCOLIGADA]
FROM
    CORPORE.DBO.${cleanTable} AS ${cleanTable} WITH (NOLOCK)
WHERE
    ${cleanTable}.CODCOLIGADA = 1;`;
      setSql(initial);
      return;
    }

    // Se já existem tabelas na query, verifica se há relação direta
    const existingTable = tablesInQuery[0].tableName;
    const details = tableDetailsMap[existingTable];
    const rel = (details?.relacionamentos_saida || []).find(
      (r) => r.tabela_destino.toUpperCase() === cleanTable
    );

    if (rel) {
      const joinSnippet = formatRmJoinSnippet(existingTable, cleanTable, rel.chaves_ligacao, {
        joinType: "INNER JOIN",
      });
      const whereIdx = sql.search(/\bWHERE\b/i);
      if (whereIdx !== -1) {
        const before = sql.slice(0, whereIdx).trimEnd();
        const after = sql.slice(whereIdx);
        setSql(`${before}\n${joinSnippet}\n${after}`);
      } else {
        setSql(`${sql.trimEnd()}\n${joinSnippet}`);
      }
    } else {
      // Adiciona como LEFT JOIN genérico
      const genericJoin = ` INNER JOIN CORPORE.DBO.${cleanTable} AS ${cleanTable} WITH (NOLOCK)
         ON ${existingTable}.CODCOLIGADA = ${cleanTable}.CODCOLIGADA`;
      const whereIdx = sql.search(/\bWHERE\b/i);
      if (whereIdx !== -1) {
        const before = sql.slice(0, whereIdx).trimEnd();
        const after = sql.slice(whereIdx);
        setSql(`${before}\n${genericJoin}\n${after}`);
      } else {
        setSql(`${sql.trimEnd()}\n${genericJoin}`);
      }
    }
  };

  // Salvar no histórico local
  const handleSaveQuery = () => {
    const promptTitle = window.prompt("Nome identificador para esta consulta:", `Consulta ${tablesInQuery.map(t => t.tableName).join(" + ") || "T-SQL"}`);
    if (!promptTitle) return;

    const newQuery: SavedSqlQuery = {
      id: `query_${Date.now()}`,
      title: promptTitle.trim(),
      sql,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tablesUsed: tablesInQuery.map((t) => t.tableName),
    };

    const updated = [newQuery, ...savedQueries];
    setSavedQueries(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_QUERIES, JSON.stringify(updated));
    } catch {
      // Ignora erro
    }
  };

  const handleDeleteSavedQuery = (id: string) => {
    const updated = savedQueries.filter((q) => q.id !== id);
    setSavedQueries(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_QUERIES, JSON.stringify(updated));
    } catch {
      // Ignora erro
    }
  };

  const handleRenameSavedQuery = (id: string, newTitle: string) => {
    const updated = savedQueries.map((q) => (q.id === id ? { ...q, title: newTitle, updatedAt: Date.now() } : q));
    setSavedQueries(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_QUERIES, JSON.stringify(updated));
    } catch {
      // Ignora erro
    }
  };

  const handleSelectSavedQuery = (saved: SavedSqlQuery) => {
    setSql(saved.sql);
  };

  const handleSelectTemplate = (template: SqlStudioTemplate | CustomUserTemplate) => {
    setSql(template.sql);
  };

  // Salvar como Modelo (Sincronizado Supabase / Local)
  const handleSaveAsTemplate = async (params: {
    title: string;
    description: string;
    moduleLabel: string;
  }) => {
    try {
      const saved = await saveStudioTemplate({
        title: params.title,
        description: params.description,
        moduleLabel: params.moduleLabel,
        mainTables: tablesInQuery.map((t) => t.tableName),
        sql,
      });

      setUserTemplates((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
    } catch (err) {
      console.error("Erro ao salvar modelo de consulta:", err);
    }
  };

  // Excluir Modelo
  const handleDeleteUserTemplate = async (templateId: string) => {
    try {
      await deleteStudioTemplate(templateId);
      setUserTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (err) {
      console.error("Erro ao excluir modelo de consulta:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Navbar Superior Global */}
      <Navbar />

      {/* Workspace Principal do SQL Studio */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Painel Lateral (Sidebar) */}
        <SqlStudioSidebar
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
          catalogTables={catalogTables}
          loadingCatalog={loadingCatalog}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedModule={selectedModule}
          onSelectModule={setSelectedModule}
          onInsertTableToQuery={handleInsertTableToQuery}
          savedQueries={savedQueries}
          onSelectSavedQuery={handleSelectSavedQuery}
          onDeleteSavedQuery={handleDeleteSavedQuery}
          onRenameSavedQuery={handleRenameSavedQuery}
          onSelectTemplate={handleSelectTemplate}
          userTemplates={userTemplates}
          onDeleteUserTemplate={handleDeleteUserTemplate}
          isAuthenticated={isAuthenticated}
        />

        {/* Centro: Editor Inteligente */}
        <SmartSqlEditor
          sql={sql}
          onChangeSql={setSql}
          onFormatSql={handleFormatSql}
          tablesInQuery={tablesInQuery}
          tableDetailsMap={tableDetailsMap}
          joinOpportunities={joinOpportunities}
          qualityChecks={qualityChecks}
          onSaveQuery={handleSaveQuery}
          onSaveAsTemplate={handleSaveAsTemplate}
          isAuthenticated={isAuthenticated}
        />

        {/* Painel Direito: Inspetor de Tabelas e Campos */}
        <QueryInspectorPane
          isOpen={isInspectorOpen}
          onToggleOpen={() => setIsInspectorOpen(!isInspectorOpen)}
          tablesInQuery={tablesInQuery}
          tableDetailsMap={tableDetailsMap}
          selectedColumns={selectedColumns}
          onInsertColumn={(expr) => setSql((curr) => appendColumnToSelect(curr, expr))}
        />
      </div>
    </div>
  );
}
