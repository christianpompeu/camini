"use client";

import React, { useState } from "react";
import { Plus, Minus, Check, ArrowRight, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "./currency-input";
import { CameraCaptureButton } from "./camera-capture-button";
import { formatBRL } from "@/lib/mercado/utils";
import { CreateItemPayload } from "@/types/mercado";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (payload: CreateItemPayload) => void;
}

export function AddItemModal({ isOpen, onClose, onAddItem }: AddItemModalProps) {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState(0);
  const [fotoProduto, setFotoProduto] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setNome("");
    setQuantidade(1);
    setPrecoUnitario(0);
    setFotoProduto(undefined);
    setError(null);
  };

  const handleSave = (continueAdding = false) => {
    const trimmedNome = nome.trim();
    if (!trimmedNome) {
      setError("Informe o nome ou descrição curta do produto.");
      return;
    }

    if (quantidade <= 0) {
      setError("A quantidade deve ser de no mínimo 1.");
      return;
    }

    onAddItem({
      nome: trimmedNome,
      quantidade,
      precoUnitario,
      fotoProduto,
    });

    if (continueAdding) {
      resetForm();
    } else {
      resetForm();
      onClose();
    }
  };

  const subtotal = Number((quantidade * precoUnitario).toFixed(2));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6 bg-background rounded-3xl border border-border shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <ShoppingCart className="size-4" />
            <span>Colocar no Carrinho</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Novo Produto
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registre o item, valor e quantidade conforme coloca no carrinho do mercado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Nome curto do item */}
          <div className="space-y-1.5">
            <label htmlFor="item-nome" className="text-xs font-semibold text-foreground">
              Nome Curto do Item <span className="text-destructive">*</span>
            </label>
            <input
              id="item-nome"
              type="text"
              autoFocus
              value={nome}
              placeholder="Ex: Arroz 5kg, Leite, Café..."
              onChange={(e) => {
                setNome(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave(false);
              }}
              className="h-12 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Grid de Quantidade e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Quantidade com Stepper */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Quantidade
              </label>
              <div className="flex items-center justify-between h-12 w-full rounded-xl border border-input bg-background px-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantidade((prev) => Math.max(1, prev - 1))}
                  className="size-8 rounded-lg text-foreground hover:bg-muted"
                >
                  <Minus className="size-4" />
                </Button>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantidade}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setQuantidade(isNaN(v) || v < 1 ? 1 : v);
                  }}
                  className="w-14 text-center font-bold text-base bg-transparent border-none outline-none"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantidade((prev) => prev + 1)}
                  className="size-8 rounded-lg text-foreground hover:bg-muted"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {/* Valor Unitário com Máscara Automática */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Preço Unitário (R$)
              </label>
              <CurrencyInput
                value={precoUnitario}
                onChange={setPrecoUnitario}
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Foto Opcional do Produto */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-foreground">
              Foto do Produto (Opcional)
            </label>
            <CameraCaptureButton
              photoBase64={fotoProduto}
              onPhotoCaptured={setFotoProduto}
              label="Tirar Foto do Produto"
              helperText="Tire a foto da embalagem ou da etiqueta de preço"
            />
          </div>

          {/* Prévia do Subtotal */}
          <div className="rounded-xl bg-muted/40 border border-border/60 p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Subtotal deste item ({quantidade}x):
            </span>
            <span className="text-base font-bold text-foreground">
              {formatBRL(subtotal)}
            </span>
          </div>

          {error && (
            <p className="text-xs font-semibold text-destructive px-1 animate-pulse">
              {error}
            </p>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave(true)}
            className="flex-1 h-12 rounded-xl text-xs font-bold gap-1.5 order-2 sm:order-1"
          >
            <span>Salvar e Próximo</span>
            <ArrowRight className="size-4" />
          </Button>

          <Button
            type="button"
            onClick={() => handleSave(false)}
            className="flex-1 h-12 rounded-xl text-xs font-bold gap-1.5 order-1 sm:order-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Check className="size-4" />
            <span>Adicionar ao Carrinho</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
