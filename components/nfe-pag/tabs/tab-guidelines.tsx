"use client";

import React from "react";
import {
  Settings2,
  ExternalLink,
  Broom,
  QrCode,
  Ban,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERP_GUIDELINES, PUBLIC_REPORT_URL } from "@/lib/nfe-pag/data";

interface TabGuidelinesProps {
  onOpenSourceModal: (title: string, desc: string) => void;
}

export function TabGuidelines({ onOpenSourceModal }: TabGuidelinesProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Broom":
        return <Broom className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "QrCode":
        return <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "Ban":
        return <Ban className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
      case "Calculator":
        return <Calculator className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Settings2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Diretrizes de Implementação e Impactos na Arquitetura de ERPs</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Recomendações técnicas extraídas das Notas Técnicas para motores de emissão e conciliação financeira.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            render={
              <a
                href={PUBLIC_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold h-7 gap-1 shrink-0"
          >
            <span>Relatório na Íntegra</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          A adequação dos sistemas de gestão e emissão fiscal exige lógica sanitizadora na geração do XML para evitar rejeições sistemáticas no ambiente autorizador da SEFAZ. Confira o checklist de boas práticas técnicas:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
          {ERP_GUIDELINES.map((guide) => (
            <div
              key={guide.id}
              className="p-5 rounded-xl border border-border bg-muted/20 hover:border-emerald-500/30 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-card border border-border/60 shadow-2xs">
                      {getIcon(guide.iconName)}
                    </div>
                    <h3 className="font-bold text-foreground text-xs leading-tight">
                      {guide.title}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenSourceModal(guide.title, guide.sourceDetail)}
                    className="h-6 px-2 text-[10px] text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 gap-1"
                  >
                    <span>Fonte</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Button>
                </div>

                <p className="text-muted-foreground leading-relaxed pt-1">
                  {guide.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
                Referência: {guide.sourceText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
