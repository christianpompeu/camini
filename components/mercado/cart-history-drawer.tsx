"use client";

import React, { useState } from "react";
import {
  History,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Receipt,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MercadoCarrinho } from "@/types/mercado";
import { formatBRL, formatDateTime } from "@/lib/mercado/utils";
import { cn } from "@/lib/utils";

interface CartHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  carrinhos: MercadoCarrinho[];
  carrinhoAtivoId: string | null;
  onSelectCart: (id: string) => void;
  onCreateCart: (customName?: string) => void;
  onRenameCart: (id: string, newName: string) => void;
  onDeleteCart: (id: string) => void;
}

export function CartHistoryDrawer({
  isOpen,
  onClose,
  carrinhos,
  carrinhoAtivoId,
  onSelectCart,
  onCreateCart,
  onRenameCart,
  onDeleteCart,
}: CartHistoryDrawerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [previewCupom, setPreviewCupom] = useState<string | null>(null);
  const [cartToDelete, setCartToDelete] = useState<string | null>(null);

  const startRename = (c: MercadoCarrinho, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditName(c.nome);
  };

  const confirmRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      onRenameCart(id, editName.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCartToDelete(id);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg p-5 sm:p-6 bg-background rounded-3xl border border-border shadow-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="space-y-1.5 pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <History className="size-4" />
                <span>Histórico & Carrinhos</span>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">
                {carrinhos.length} {carrinhos.length === 1 ? "registro" : "registros"}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Seus Carrinhos de Mercado
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Alterne entre carrinhos em andamento ou consulte compras anteriores finalizadas com cupom fiscal.
            </DialogDescription>
          </DialogHeader>

          {/* Botão de Criação Rápida */}
          <div className="py-2 shrink-0">
            <Button
              type="button"
              onClick={() => {
                onCreateCart();
                onClose();
              }}
              className="w-full h-12 rounded-xl text-xs font-bold gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span>Iniciar Novo Carrinho</span>
            </Button>
          </div>

          {/* Lista Rolável de Carrinhos */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {carrinhos.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <ShoppingCart className="size-10 mx-auto text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Nenhum carrinho registrado.</p>
              </div>
            ) : (
              carrinhos.map((c) => {
                const isCurrent = c.id === carrinhoAtivoId;
                const isFinished = c.status === "finalizado";
                const totalUnits = c.itens.reduce((sum, it) => sum + it.quantidade, 0);
                const valorExibicao = isFinished && c.totalFinal ? c.totalFinal : c.totalEstimado;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCart(c.id);
                      onClose();
                    }}
                    className={cn(
                      "group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col gap-2.5",
                      isCurrent
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                        : "border-border/80 bg-card hover:border-border hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Nome do Carrinho (com renomeação in-place) */}
                      {editingId === c.id ? (
                        <div
                          className="flex items-center gap-1.5 flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") confirmRename(c.id, e as any);
                              if (e.key === "Escape") cancelRename(e as any);
                            }}
                            className="h-8 text-xs font-bold bg-background border border-primary rounded-lg px-2 flex-1 outline-none"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={(e) => confirmRename(c.id, e)}
                            className="size-7 text-emerald-600 hover:bg-emerald-50"
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={cancelRename}
                            className="size-7 text-muted-foreground hover:bg-muted"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate">
                            {c.nome}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => startRename(c, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity"
                            title="Renomear carrinho"
                          >
                            <Edit2 className="size-3" />
                          </button>
                        </div>
                      )}

                      {/* Status Badge */}
                      <Badge
                        variant={isFinished ? "secondary" : "default"}
                        className={cn(
                          "text-[10px] uppercase font-bold shrink-0",
                          isFinished
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        )}
                      >
                        {isFinished ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Finalizado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" /> Em Andamento
                          </span>
                        )}
                      </Badge>
                    </div>

                    {/* Meta info & Foto de Cupom */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <span>{formatDateTime(c.criadoEm)}</span>
                        <span>•</span>
                        <span>
                          {c.itens.length} {c.itens.length === 1 ? "item" : "itens"} ({totalUnits} un.)
                        </span>
                      </div>

                      {/* Miniatura do Cupom se houver */}
                      {c.fotoCupom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewCupom(c.fotoCupom || null);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                          title="Ver cupom fiscal"
                        >
                          <Receipt className="size-3.5" />
                          <span>Cupom</span>
                        </button>
                      )}
                    </div>

                    {/* Footer com Valor e Excluir */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {isFinished ? "Total da Compra:" : "Estimado:"}
                        </span>
                        <span className="text-base font-extrabold text-foreground">
                          {formatBRL(valorExibicao)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Ativo Agora
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(c.id, e)}
                          className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                          title="Excluir este carrinho"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Exibição do Cupom Fiscal */}
      {previewCupom && (
        <Dialog open={!!previewCupom} onOpenChange={() => setPreviewCupom(null)}>
          <DialogContent className="max-w-md p-4 bg-background/95 backdrop-blur-md rounded-2xl">
            <DialogTitle className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Receipt className="size-4 text-emerald-600" />
              <span>Cupom Fiscal da Compra</span>
            </DialogTitle>
            <div className="relative rounded-xl overflow-hidden border border-border max-h-[70vh] flex items-center justify-center bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewCupom}
                alt="Comprovante fiscal"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewCupom(null)}
              className="w-full mt-2 rounded-xl"
            >
              Fechar
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Confirmação para Excluir Carrinho */}
      <AlertDialog
        open={Boolean(cartToDelete)}
        onOpenChange={(open) => !open && setCartToDelete(null)}
      >
        <AlertDialogContent className="max-w-sm rounded-3xl p-6 bg-background border border-border shadow-2xl">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Excluir este carrinho?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Esta ação removerá este carrinho e todos os produtos registrados nele. Não é possível desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 pt-4">
            <AlertDialogCancel
              onClick={() => setCartToDelete(null)}
              className="rounded-xl"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cartToDelete) {
                  onDeleteCart(cartToDelete);
                  setCartToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-medium"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
