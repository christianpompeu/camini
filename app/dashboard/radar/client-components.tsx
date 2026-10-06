"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Archive, Clock, Radio, Search } from "lucide-react";
import { toast } from "sonner";
import { enqueueRadarAction, type RadarAdminAcao } from "./actions";
import type { RadarEdition } from "@/lib/radar/types";

type FilaClientProps = {
  edicoes: RadarEdition[];
  filaAcoes: RadarAdminAcao[];
};

export function FilaRadarClient({ edicoes, filaAcoes }: FilaClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "candidate" | "published" | "rejected" | "archived">("all");
  const [showTests, setShowTests] = useState(false);
  
  const [selectedEdicao, setSelectedEdicao] = useState<RadarEdition | null>(null);
  const [actionType, setActionType] = useState<"aprovar" | "rejeitar" | "arquivar" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = edicoes.filter((e) => {
    // Busca
    const matchesSearch = e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.identificador.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Filtro Testes
    if (!showTests && e.is_test) return false;

    // Filtro Status
    if (statusFilter !== "all" && e.status !== statusFilter) return false;

    return true;
  });

  const pendingAcoes = filaAcoes.filter((a) => a.status === "pendente");

  const handleActionClick = (edicao: RadarEdition, acao: "aprovar" | "rejeitar" | "arquivar") => {
    setSelectedEdicao(edicao);
    setActionType(acao);
    setMotivo("");
  };

  const handleConfirmAction = async () => {
    if (!selectedEdicao || !actionType) return;
    setIsSubmitting(true);

    const result = await enqueueRadarAction(selectedEdicao.id, actionType, motivo);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Ação enviada para a fila de processamento.");
      setSelectedEdicao(null);
      setActionType(null);
    }
    setIsSubmitting(false);
  };

  // Ajuda a saber se a edicao já tem uma ação pendente na fila
  const getPendingActionForEdition = (id: string) => {
    return pendingAcoes.find((a) => a.edicao_id === id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de Edições para Revisão */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Painel de Revisão Editorial
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Edições sincronizadas do Notion aguardando aprovação ou arquivamento.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <select 
                  className="h-9 px-3 py-1 text-sm rounded-md border border-input bg-background"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "candidate" | "published" | "rejected" | "archived")}
                >
                  <option value="all">Todas as edições</option>
                  <option value="candidate">Candidatas</option>
                  <option value="published">Publicadas</option>
                  <option value="rejected">Rejeitadas</option>
                  <option value="archived">Arquivadas</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none border border-input h-9 px-3 rounded-md bg-background hover:bg-muted/50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={showTests} 
                    onChange={(e) => setShowTests(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  Mostrar testes
                </label>
              </div>
            </div>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <Radio className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium text-foreground">Nenhuma edição encontrada</p>
                </div>
              ) : (
                filtered.map((edicao) => {
                  const pendingAction = getPendingActionForEdition(edicao.id);
                  const isLocked = !!pendingAction;
                  const canApprove = edicao.status === 'candidate' && !isLocked;
                  const canReject = edicao.status === 'candidate' && !isLocked;
                  const canArchive = (edicao.status === 'published' || edicao.status === 'rejected') && !isLocked;

                  return (
                    <div
                      key={edicao.id}
                      className="p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors flex flex-col gap-3 justify-between"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {edicao.titulo}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-normal px-1.5 h-5">
                              Nº {edicao.numero}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] font-normal px-1.5 h-5 capitalize ${
                                edicao.status === 'candidate' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                edicao.status === 'published' ? 'bg-green-100 text-green-800 border-green-200' : 
                                edicao.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''
                              }`}
                            >
                              {edicao.status}
                            </Badge>
                            {edicao.is_test && (
                              <Badge variant="outline" className="text-[10px] font-normal px-1.5 h-5 bg-purple-50 text-purple-700 border-purple-200">
                                Teste
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {edicao.resumo || "Sem resumo disponível."}
                          </p>
                          <div className="text-[10px] text-muted-foreground flex gap-3 pt-1">
                            <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">ID: {edicao.identificador}</span>
                            <span className="flex items-center">Criado: {new Date(edicao.created_at).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                          {isLocked && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200 mb-1 w-full sm:w-auto justify-center">
                              <Clock className="h-3.5 w-3.5 animate-pulse" />
                              {pendingAction.acao === 'aprovar' ? 'Aprovação pendente' :
                               pendingAction.acao === 'rejeitar' ? 'Rejeição pendente' :
                               'Arquivamento pendente'}
                            </div>
                          )}
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canApprove}
                              className="h-8 text-xs gap-1 flex-1 sm:flex-auto hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                              onClick={() => handleActionClick(edicao, "aprovar")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canReject}
                              className="h-8 text-xs gap-1 flex-1 sm:flex-auto hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                              onClick={() => handleActionClick(edicao, "rejeitar")}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Rejeitar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={!canArchive}
                              className="h-8 text-xs gap-1 flex-1 sm:flex-auto text-muted-foreground"
                              onClick={() => handleActionClick(edicao, "arquivar")}
                            >
                              <Archive className="h-3.5 w-3.5" />
                              Arquivar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico/Fila Recente */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Fila de Ações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filaAcoes.slice(0, 8).map((acao) => (
                <div key={acao.id} className="p-3 text-xs space-y-1 hover:bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{acao.acao}</span>
                    <Badge variant="secondary" className="text-[9px] px-1 h-4">
                      {acao.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground truncate" title={acao.edicao_id}>
                    ID: {acao.edicao_id.substring(0, 15)}...
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 flex justify-between">
                    <span>{acao.realizado_por}</span>
                    <span>{new Date(acao.created_at).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))}
              {filaAcoes.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Nenhuma ação na fila.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Confirmação */}
      <Dialog open={!!selectedEdicao} onOpenChange={(open) => !open && setSelectedEdicao(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">Confirmar Ação: {actionType}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Você está prestes a enviar a ação de <strong>{actionType}</strong> para a edição{" "}
              <span className="text-foreground font-medium">{selectedEdicao?.titulo}</span>.
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              Lembre-se: Esta ação irá para a fila <code>radar_admin_acoes</code> e será sincronizada com o Notion de forma segura.
            </p>

            {(actionType === "rejeitar" || actionType === "arquivar") && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Motivo (Opcional mas recomendado)</label>
                <Input
                  placeholder="Explique o motivo..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEdicao(null)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmAction} disabled={isSubmitting}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
