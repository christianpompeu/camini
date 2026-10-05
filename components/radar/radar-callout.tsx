import React from "react";
import { Radio, Info, AlertTriangle } from "lucide-react";

export interface RadarCalloutProps {
  color?: string;
  icon?: string;
  children: React.ReactNode;
}

export function RadarCallout({ color, children }: RadarCalloutProps) {
  const isBlue = color?.includes("blue");
  const isYellow = color?.includes("yellow");

  if (isBlue) {
    return (
      <div
        role="region"
        aria-label="Destaque do Radar"
        className="my-6 rounded-lg border border-primary/25 bg-primary/5 p-4 sm:p-5 text-foreground transition-colors dark:border-primary/30 dark:bg-primary/10"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-primary/20">
            <Radio className="h-4 w-4" />
          </div>
          <div className="space-y-1 text-sm leading-relaxed sm:text-[15px]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-primary">
              Destaque do Radar
            </span>
            <div className="text-foreground/90 font-medium">{children}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isYellow) {
    return (
      <div
        role="region"
        aria-label="Nota de Migração"
        className="my-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 text-foreground transition-colors dark:border-amber-500/40 dark:bg-amber-500/10"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="space-y-1 text-sm leading-relaxed sm:text-[15px]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Aviso Histórico
            </span>
            <div className="text-foreground/90">{children}</div>
          </div>
        </div>
      </div>
    );
  }

  // Padrão: gray_bg ou nota informativa
  return (
    <div
      role="region"
      aria-label="Conteúdo Informativo"
      className="my-6 rounded-lg border border-border bg-muted/40 p-4 sm:p-5 text-foreground transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Info className="h-4 w-4" />
        </div>
        <div className="space-y-1 text-sm leading-relaxed sm:text-[15px]">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Nota Informativa
          </span>
          <div className="text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
