"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Database, ArrowRight, Layers, Key, Link2, Copy, Check, Sparkles } from "lucide-react";
import { RMTable, RMTableSummary } from "@/lib/totvs-rm/types";

interface TableInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTable?: string;
  onSelectTable?: (tableName: string) => void;
}

export function TableInspectorModal({ isOpen, onClose, initialTable, onSelectTable }: TableInspectorModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [tables, setTables] = useState<RMTableSummary[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [activeTable, setActiveTable] = useState<string | null>(initialTable || null);
  const [tableDetails, setTableDetails] = useState<RMTable | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Carrega lista ao abrir ou filtrar
  useEffect(() => {
    if (!isOpen) return;

    const fetchTables = async () => {
      setLoadingList(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set("q", searchTerm);
        if (selectedModule) params.set("module", selectedModule);

        const res = await fetch(`/api/totvs-rm/tables?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTables(data.tables || []);
          if (!activeTable && data.tables?.length > 0) {
            setActiveTable(data.tables[0].tabela);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar tabelas RM:", err);
      } finally {
        setLoadingList(false);
      }
    };

    const timer = setTimeout(fetchTables, 250);
    return () => clearTimeout(timer);
  }, [isOpen, searchTerm, selectedModule]);

  // Carrega detalhes da tabela ativa
  useEffect(() => {
    if (!isOpen || !activeTable) return;

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await fetch(`/api/totvs-rm/tables?table=${encodeURIComponent(activeTable)}`);
        if (res.ok) {
          const data: RMTable = await res.json();
          setTableDetails(data);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes da tabela:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [isOpen, activeTable]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl h-[85vh] max-h-[780px] rounded-2xl border border-outline glass-surface bg-surface-elevated/95 flex flex-col shadow-2xl overflow-hidden text-text-primary"
        role="dialog"
        aria-modal="true"
      >
        {/* Barra de Título Superior */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/60 bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-energy-blue/15 text-energy-blue flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Dicionário de Dados TOTVS Corpore RM</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-pill bg-energy-blue/15 text-energy-blue">
                  9.400+ Tabelas
                </span>
              </h2>
              <p className="text-xs text-text-secondary">
                Consulte esquemas, campos, tipos e relacionamentos de chave estrangeira
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Principal Dividido em Duas Colunas */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* COLUNA ESQUERDA: Busca e Lista de Tabelas */}
          <div className="w-full md:w-80 border-r border-outline/60 flex flex-col bg-surface/30 shrink-0">
            {/* Filtros de Busca */}
            <div className="p-3 border-b border-outline/60 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar tabela ou termo (ex: FLAN, nota...)"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-outline bg-surface text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-energy-blue font-mono"
                />
              </div>

              {/* Filtro por Módulo */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                {[
                  { label: "Todos", value: "" },
                  { label: "Fluxus (F)", value: "F" },
                  { label: "Nucleus (T)", value: "T" },
                  { label: "Labore (P)", value: "P" },
                  { label: "Saldus (C)", value: "C" },
                  { label: "Global (G)", value: "G" },
                ].map((mod) => (
                  <button
                    key={mod.value}
                    onClick={() => setSelectedModule(mod.value)}
                    className={`px-2.5 py-1 rounded-pill whitespace-nowrap transition-colors font-medium ${
                      selectedModule === mod.value
                        ? "bg-energy-blue text-white"
                        : "bg-surface-elevated text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {mod.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Tabelas Encontradas */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingList ? (
                <div className="p-6 text-center text-xs text-text-secondary">Carregando catálogo...</div>
              ) : tables.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-secondary">Nenhuma tabela encontrada.</div>
              ) : (
                tables.map((t) => (
                  <button
                    key={t.tabela}
                    onClick={() => setActiveTable(t.tabela)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col gap-0.5 ${
                      activeTable === t.tabela
                        ? "border-energy-blue bg-energy-blue/15 text-text-primary shadow-sm"
                        : "border-transparent hover:bg-surface text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-text-primary">{t.tabela}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-pill bg-surface border border-outline">
                        {t.sistema.replace("RM ", "")}
                      </span>
                    </div>
                    <span className="text-[11px] truncate opacity-80">{t.descricao || "Sem descrição"}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: Detalhes da Tabela Selecionada */}
          <div className="flex-1 flex flex-col overflow-hidden bg-surface-elevated/40">
            {loadingDetails ? (
              <div className="flex-1 flex items-center justify-center text-xs text-text-secondary">
                Carregando campos e relacionamentos...
              </div>
            ) : !tableDetails ? (
              <div className="flex-1 flex items-center justify-center text-xs text-text-secondary">
                Selecione uma tabela na lista ao lado para ver a estrutura.
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Cabeçalho da Tabela Ativa */}
                <div className="p-5 border-b border-outline/60 flex items-center justify-between bg-surface/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black font-mono text-text-primary">{tableDetails.Tabela}</h3>
                      <button
                        onClick={() => handleCopy(tableDetails.Tabela)}
                        className="text-text-secondary hover:text-energy-blue p-1"
                        title="Copiar nome da tabela"
                      >
                        {copiedText === tableDetails.Tabela ? (
                          <Check className="w-4 h-4 text-energy-green" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {tableDetails.Descricao || "Tabela do banco de dados TOTVS RM"} • {tableDetails.Colunas.length} colunas
                    </p>
                  </div>

                  {onSelectTable && (
                    <button
                      onClick={() => {
                        onSelectTable(tableDetails.Tabela);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-energy text-white text-xs font-bold shadow-sm hover:brightness-105"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Inserir no Chat</span>
                    </button>
                  )}
                </div>

                {/* Lista de Colunas e Relacionamentos */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* Tabela de Colunas */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-energy-blue" />
                      Colunas & Tipos de Dados
                    </h4>

                    <div className="rounded-xl border border-outline overflow-hidden bg-surface">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-outline bg-surface-elevated text-text-secondary font-semibold">
                            <th className="py-2.5 px-3">Coluna</th>
                            <th className="py-2.5 px-3">Tipo</th>
                            <th className="py-2.5 px-3">Nulo</th>
                            <th className="py-2.5 px-3">Descrição RM</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline/50 font-mono">
                          {tableDetails.Colunas.map((col) => {
                            const hasFk = col.RelacionamentosRM && col.RelacionamentosRM.length > 0;
                            const isPk = col.Coluna.startsWith("COD") || col.Coluna.startsWith("ID") || col.Coluna === "CHAPA";

                            return (
                              <tr key={col.Coluna} className="hover:bg-surface-elevated/70 transition-colors">
                                <td className="py-2 px-3 font-bold text-text-primary flex items-center gap-1.5">
                                  {isPk && <Key className="w-3 h-3 text-energy-amber shrink-0" />}
                                  {hasFk && <Link2 className="w-3 h-3 text-energy-blue shrink-0" />}
                                  <span>{col.Coluna}</span>
                                </td>
                                <td className="py-2 px-3 text-[#38BDF8]">
                                  {col.Tipo}
                                  {col.TamanhoBytes ? `(${col.TamanhoBytes})` : ""}
                                </td>
                                <td className="py-2 px-3 text-text-secondary text-[11px]">
                                  {col.PermiteNulo === "N" ? "NÃO" : "SIM"}
                                </td>
                                <td className="py-2 px-3 font-sans text-text-secondary text-[11px]">
                                  {col.Descricao || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Relacionamentos (Chaves Estrangeiras) */}
                  {tableDetails.Colunas.some((c) => c.RelacionamentosRM && c.RelacionamentosRM.length > 0) && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-energy-violet" />
                        Relacionamentos Canônicos do RM (Chaves Estrangeiras)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {tableDetails.Colunas.flatMap((c) => c.RelacionamentosRM || []).map((rel, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-outline bg-surface text-xs space-y-1"
                          >
                            <div className="flex items-center gap-1.5 text-text-primary font-bold font-mono">
                              <span>{tableDetails.Tabela}</span>
                              <ArrowRight className="w-3 h-3 text-energy-blue" />
                              <span className="text-energy-blue">{rel.TabelaDestino}</span>
                            </div>
                            <div className="text-[11px] font-mono text-text-secondary break-all">
                              {tableDetails.Tabela}.{rel.ChaveLogicaComposta} = {rel.TabelaDestino}.{rel.CamposDestino}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
