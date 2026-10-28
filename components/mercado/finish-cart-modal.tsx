"use client";

import React, { useState } from "react";
import { Receipt, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CameraCaptureButton } from "./camera-capture-button";
import { CurrencyInput } from "./currency-input";
import { formatBRL } from "@/lib/mercado/utils";
import { MercadoCarrinho } from "@/types/mercado";

interface FinishCartModalProps {
  carrinho: MercadoCarrinho;
  isOpen: boolean;
  onClose: () => void;
  onConfirmFinish: (payload: { totalFinal: number; fotoCupom?: string }) => void;
}

export function FinishCartModal({
  carrinho,
  isOpen,
  onClose,
  onConfirmFinish,
}: FinishCartModalProps) {
  const [totalFinal, setTotalFinal] = useState<number>(carrinho.totalEstimado);
  const [fotoCupom, setFotoCupom] = useState<string | undefined>(carrinho.fotoCupom || undefined);

  // Total de unidades calculadas
  const totalUnidades = carrinho.itens.reduce((sum, it) => sum + it.quantidade, 0);

  const handleFinish = () => {
    onConfirmFinish({
      totalFinal: totalFinal > 0 ? totalFinal : carrinho.totalEstimado,
      fotoCupom,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6 bg-background rounded-3xl border border-border shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Receipt className="size-4" />
            <span>Fechamento no Caixa</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Finalizar Compra
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Confirme os valores finais e fotografe o cupom fiscal para arquivar no histórico.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Resumo da Compra */}
          <div className="rounded-2xl bg-muted/40 border border-border/60 p-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Produtos registrados:</span>
              <span className="font-semibold text-foreground">
                {carrinho.itens.length} {carrinho.itens.length === 1 ? "item" : "itens"} ({totalUnidades} un.)
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-1 border-t border-border/40">
              <span className="text-xs font-semibold text-muted-foreground">
                Total Estimado no Carrinho:
              </span>
              <span className="text-lg font-bold text-foreground">
                {formatBRL(carrinho.totalEstimado)}
              </span>
            </div>
          </div>

          {/* Ajuste do Total Pago no Caixa */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Valor Total do Caixa (R$)
              </label>
              <span className="text-[11px] text-muted-foreground">
                Edite se houve desconto ou arredondamento
              </span>
            </div>
            <CurrencyInput
              value={totalFinal}
              onChange={setTotalFinal}
              placeholder={formatBRL(carrinho.totalEstimado)}
            />
          </div>

          {/* Foto do Cupom Fiscal */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Foto do Cupom Fiscal
              </label>
              <span className="text-[11px] text-muted-foreground">
                Recomendado
              </span>
            </div>
            <CameraCaptureButton
              photoBase64={fotoCupom}
              onPhotoCaptured={setFotoCupom}
              label="Tirar Foto do Cupom Fiscal"
              helperText="Enquadre o comprovante impresso pelo caixa para auditoria"
            />
          </div>

          {carrinho.itens.length === 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>Atenção: Este carrinho ainda não possui itens adicionados.</span>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl text-xs font-semibold"
          >
            Voltar ao Carrinho
          </Button>

          <Button
            type="button"
            onClick={handleFinish}
            className="flex-1 h-12 rounded-xl text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <CheckCircle2 className="size-4" />
            <span>Concluir e Arquivar</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
