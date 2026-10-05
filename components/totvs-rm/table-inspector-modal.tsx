"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Database,
  ArrowRight,
  Layers,
  Key,
  Link2,
  Copy,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import {
  RMSemanticTableWithKey,
  RMTableSummary,
  RMSemanticColumn,
  RMSemanticRelationship,
} from "@/lib/totvs-rm/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TableInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTable?: string;
  onSelectTable?: (tableName: string) => void;
}

export function TableInspectorModal({
  isOpen,
  onClose,
  initialTable,
  onSelectTable,
}: TableInspectorModalProps) {
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
        const res = await fetch(
          `/api/totvs-rm/tables?table=${encodeURIComponent(activeTable)}`
        );
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
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 w-[96vw] sm:max-w-5xl md:max-w-6xl h-[88vh] max-h-[840px] flex flex-col overflow-hidden ring-1 ring-border shadow-2xl"
      >
        <DialogHeader className="p-4 border-b border-border bg-muted/30 shrink-0 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <span>Dicionário de Dados TOTVS RM</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  9.400+ Tabelas
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Consulte esquemas, campos, tipos e relacionamentos de chave estrangeira
              </DialogDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Fechar"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Esquerda: Busca e Lista */}
          <div className="w-full md:w-80 border-r border-border flex flex-col bg-muted/10 shrink-0 h-48 md:h-full">
            <div className="p-3 border-b border-border space-y-3 shrink-0">
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
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Carregando catálogo...
                </div>
              ) : tables.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Nenhuma tabela encontrada.
                </div>
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
                    <span className="text-[11px] truncate w-full block">
                      {t.descricao || "Sem descrição"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Direita: Detalhes */}
          <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
            {loadingDetails ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Carregando campos...
              </div>
            ) : !tableDetails ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                Selecione uma tabela
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-border bg-muted/10 flex items-center justify-between shrink-0">
                  <div className="min-w-0 flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold font-mono truncate">
                        {tableDetails.tabela}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleCopy(tableDetails.tabela)}
                        title="Copiar nome da tabela"
                      >
                        {copiedText === tableDetails.tabela ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                      {tableDetails.descricao || "Tabela do RM"} •{" "}
                      {tableDetails.colunas.length} colunas
                    </p>
                  </div>

                  {onSelectTable && (
                    <Button
                      onClick={() => {
                        onSelectTable(tableDetails.tabela);
                        onClose();
                      }}
                      size="sm"
                      className="gap-2 shrink-0 h-9"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Inserir no Chat</span>
                      <span className="sm:hidden">Inserir</span>
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Colunas & Tipos
                    </h4>

                    <div className="rounded-md border border-border overflow-hidden bg-background">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-muted/60 border-b border-border">
                          <tr>
                            <th className="px-4 py-2.5 font-semibold text-muted-foreground w-1/3">
                              Coluna
                            </th>
                            <th className="px-4 py-2.5 font-semibold text-muted-foreground w-1/4">
                              Tipo
                            </th>
                            <th className="px-4 py-2.5 font-semibold text-muted-foreground">
                              Descrição
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {tableDetails.colunas.map((col: RMSemanticColumn) => {
                            const isPk =
                              col.nome.startsWith("COD") ||
                              col.nome.startsWith("ID") ||
                              col.nome === "CHAPA";
                            return (
                              <tr
                                key={col.nome}
                                className="hover:bg-muted/40 transition-colors font-mono"
                              >
                                <td className="px-4 py-2.5 text-foreground font-semibold flex items-center gap-2">
                                  {isPk && (
                                    <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  )}
                                  <span className="truncate">{col.nome}</span>
                                </td>
                                <td className="px-4 py-2.5 text-sky-500 dark:text-sky-400 font-mono text-xs">
                                  {col.tipo}
                                </td>
                                <td className="px-4 py-2.5 text-muted-foreground text-xs font-sans">
                                  {col.descricao || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {tableDetails.relacionamentos_saida &&
                    tableDetails.relacionamentos_saida.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          Relacionamentos de Saída (
                          {tableDetails.relacionamentos_saida.length})
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {tableDetails.relacionamentos_saida.map(
                            (rel: RMSemanticRelationship, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 rounded-md border border-border bg-muted/20 text-xs space-y-1.5 hover:border-border/80 transition-colors"
                              >
                                <div className="flex items-center gap-2 font-mono font-semibold">
                                  <span>{tableDetails.tabela}</span>
                                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-primary font-bold">
                                    {rel.tabela_destino}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono text-muted-foreground break-all">
                                  ON {rel.chaves_ligacao}
                                </div>
                              </div>
                            )
                          )}
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
