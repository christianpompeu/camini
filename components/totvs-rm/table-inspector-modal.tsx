"use client";

import React, { useState, useEffect } from "react";
import { Search, Database, ArrowRight, Layers, Key, Link2, Copy, Check, Sparkles } from "lucide-react";
import { RMSemanticTableWithKey, RMTableSummary, RMSemanticColumn, RMSemanticRelationship } from "@/lib/totvs-rm/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [tableDetails, setTableDetails] = useState<RMSemanticTableWithKey | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
  }, [isOpen, searchTerm, selectedModule, activeTable]);

  useEffect(() => {
    if (!isOpen || !activeTable) return;

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await fetch(`/api/totvs-rm/tables?table=${encodeURIComponent(activeTable)}`);
        if (res.ok) {
          const data: RMSemanticTableWithKey = await res.json();
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <DialogTitle className="flex items-center gap-2 text-base">
                Dicionário de Dados TOTVS RM
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  9.400+ Tabelas
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Consulte esquemas, campos, tipos e relacionamentos
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Esquerda: Busca e Lista */}
          <div className="w-full md:w-80 border-r border-border flex flex-col bg-muted/10 shrink-0">
            <div className="p-3 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar tabela..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {[
                  { label: "Todos", value: "" },
                  { label: "Fluxus", value: "F" },
                  { label: "Nucleus", value: "T" },
                  { label: "Labore", value: "P" },
                  { label: "Saldus", value: "C" },
                ].map((mod) => (
                  <button
                    key={mod.value}
                    onClick={() => setSelectedModule(mod.value)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium border ${
                      selectedModule === mod.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {mod.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingList ? (
                <div className="p-6 text-center text-xs text-muted-foreground">Carregando catálogo...</div>
              ) : tables.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">Nenhuma tabela encontrada.</div>
              ) : (
                tables.map((t) => (
                  <button
                    key={t.tabela}
                    onClick={() => setActiveTable(t.tabela)}
                    className={`w-full text-left px-3 py-2 rounded-md border transition-colors text-xs flex flex-col gap-1 ${
                      activeTable === t.tabela
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold font-mono">{t.tabela}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted border border-border text-muted-foreground">
                        {t.sistema.replace("RM ", "")}
                      </span>
                    </div>
                    <span className="text-[11px] truncate w-full block">{t.descricao || "Sem descrição"}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Direita: Detalhes */}
          <div className="flex-1 flex flex-col min-h-0 bg-background">
            {loadingDetails ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Carregando campos...
              </div>
            ) : !tableDetails ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Selecione uma tabela
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-5 border-b border-border bg-muted/10 flex items-center justify-between shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold font-mono">{tableDetails.tabela}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopy(tableDetails.tabela)}
                      >
                        {copiedText === tableDetails.tabela ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tableDetails.descricao || "Tabela do RM"} • {tableDetails.colunas.length} colunas
                    </p>
                  </div>

                  {onSelectTable && (
                    <Button
                      onClick={() => {
                        onSelectTable(tableDetails.tabela);
                        onClose();
                      }}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Inserir no Chat
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Colunas & Tipos
                    </h4>

                    <div className="rounded-md border border-border overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 font-medium text-muted-foreground">Coluna</th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                            <th className="px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                          {tableDetails.colunas.map((col: RMSemanticColumn) => {
                            const isPk = col.nome.startsWith("COD") || col.nome.startsWith("ID") || col.nome === "CHAPA";
                            return (
                              <tr key={col.nome} className="hover:bg-muted/50 transition-colors font-mono">
                                <td className="px-4 py-3 text-foreground font-semibold flex items-center gap-2">
                                  {isPk && <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                  {col.nome}
                                </td>
                                <td className="px-4 py-3 text-sky-500">{col.tipo}</td>
                                <td className="px-4 py-3 text-muted-foreground text-xs font-sans">
                                  {col.descricao || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {tableDetails.relacionamentos_saida && tableDetails.relacionamentos_saida.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Relacionamentos de Saída
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tableDetails.relacionamentos_saida.map((rel: RMSemanticRelationship, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-md border border-border bg-muted/20 text-sm space-y-1.5"
                          >
                            <div className="flex items-center gap-2 font-mono font-semibold">
                              <span>{tableDetails.tabela}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-primary">{rel.tabela_destino}</span>
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">
                              ON {rel.chaves_ligacao}
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
      </DialogContent>
    </Dialog>
  );
}
