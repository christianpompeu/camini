"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, CheckCircle2 } from "lucide-react";
import { PUBLIC_REPORT_URL } from "@/lib/nfe-pag/data";

interface SourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function SourceModal({
  isOpen,
  onClose,
  title,
  description,
}: SourceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-6 bg-card border-border">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {title || "Detalhes da Fonte Normativa"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Documento Oficial & Relatório Técnico SEFAZ
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 my-2 text-xs">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Contexto & Fundamentação Normativa
            </span>
            <div className="rounded-lg border border-border bg-muted/40 p-3 leading-relaxed text-foreground">
              {description}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-950 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Relatório Técnico Completo</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              O estudo normativo integral e os pareceres de engenharia de software estão disponíveis publicamente no relatório de referência:
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Fechar
          </Button>
          <Button
            size="sm"
            render={
              <a
                href={PUBLIC_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Abrir Relatório Fonte
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
