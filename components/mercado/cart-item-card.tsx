"use client";

import React, { useState } from "react";
import { Plus, Minus, Trash2, ShoppingBag, Eye } from "lucide-react";
import { MercadoItem } from "@/types/mercado";
import { formatBRL } from "@/lib/mercado/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CartItemCardProps {
  item: MercadoItem;
  onUpdateQuantity: (newQty: number) => void;
  onDeleteItem: () => void;
  isReadOnly?: boolean;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onDeleteItem,
  isReadOnly = false,
}: CartItemCardProps) {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isEditingQty, setIsEditingQty] = useState(false);
  const [rawQtyInput, setRawQtyInput] = useState(item.quantidade.toString());

  const handleStepMinus = () => {
    if (isReadOnly) return;
    if (item.quantidade > 1) {
      onUpdateQuantity(item.quantidade - 1);
    } else {
      // Se já está em 1 e aperta menos, remove o item
      onDeleteItem();
    }
  };

  const handleStepPlus = () => {
    if (isReadOnly) return;
    onUpdateQuantity(item.quantidade + 1);
  };

  const handleQtyBlur = () => {
    setIsEditingQty(false);
    const parsed = parseFloat(rawQtyInput.replace(",", "."));
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateQuantity(parsed);
    } else {
      setRawQtyInput(item.quantidade.toString());
    }
  };

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all duration-200">
      <div className="flex items-start gap-3">
        {/* Foto do produto ou ícone padrão */}
        {item.fotoProduto ? (
          <button
            type="button"
            onClick={() => setIsPhotoOpen(true)}
            className="relative size-14 sm:size-16 rounded-xl overflow-hidden border border-border/80 bg-muted shrink-0 group/photo shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Ver foto do produto"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.fotoProduto}
              alt={item.nome}
              className="w-full h-full object-cover transition-transform duration-200 group-hover/photo:scale-110"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
              <Eye className="size-4 text-white" />
            </div>
          </button>
        ) : (
          <div className="size-14 sm:size-16 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="size-6 opacity-80" />
          </div>
        )}

        {/* Informações centrais */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm sm:text-base text-foreground tracking-tight leading-snug line-clamp-2">
              {item.nome}
            </h4>
            {!isReadOnly && (
              <button
                type="button"
                onClick={onDeleteItem}
                className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors shrink-0"
                title="Excluir item do carrinho"
                aria-label={`Excluir ${item.nome}`}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>

          {/* Preço Unitário */}
          <div className="mt-1 flex items-baseline gap-1 text-xs text-muted-foreground">
            <span>Unitário:</span>
            <span className="font-medium text-foreground">
              {formatBRL(item.precoUnitario)}
            </span>
          </div>

          {/* Controles de Quantidade e Subtotal */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/50">
            {/* Stepper de Quantidade com edição direta */}
            {!isReadOnly ? (
              <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1 border border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleStepMinus}
                  className="size-7 rounded-lg text-foreground hover:bg-background shadow-2xs"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="size-3.5" />
                </Button>

                {isEditingQty ? (
                  <input
                    type="number"
                    step="1"
                    min="1"
                    autoFocus
                    value={rawQtyInput}
                    onChange={(e) => setRawQtyInput(e.target.value)}
                    onBlur={handleQtyBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQtyBlur();
                    }}
                    className="w-10 text-center text-xs font-bold bg-background rounded-md border border-primary/50 py-0.5 outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRawQtyInput(item.quantidade.toString());
                      setIsEditingQty(true);
                    }}
                    className="min-w-8 px-1 text-center text-xs font-bold text-foreground hover:text-primary transition-colors cursor-text"
                    title="Toque para digitar quantidade"
                  >
                    {item.quantidade}
                  </button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleStepPlus}
                  className="size-7 rounded-lg text-foreground hover:bg-background shadow-2xs"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="text-xs font-medium text-muted-foreground">
                Qtd: <strong className="text-foreground">{item.quantidade}</strong>
              </div>
            )}

            {/* Subtotal do Item */}
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Subtotal
              </span>
              <span className="text-sm sm:text-base font-bold text-foreground">
                {formatBRL(item.precoTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal da Foto do Produto */}
      {item.fotoProduto && (
        <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
          <DialogContent className="max-w-md p-4 bg-background/95 backdrop-blur-md rounded-2xl">
            <DialogTitle className="text-sm font-semibold truncate mb-2">
              {item.nome}
            </DialogTitle>
            <div className="relative rounded-xl overflow-hidden border border-border max-h-[70vh] flex items-center justify-center bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.fotoProduto}
                alt={item.nome}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPhotoOpen(false)}
              className="w-full mt-2 rounded-xl"
            >
              Fechar foto
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
