"use client";

import React, { useState, useMemo } from "react";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REJECTIONS_DATA } from "@/lib/nfe-pag/data";
import { cn } from "@/lib/utils";

interface TabValidationsProps {
  searchQuery: string;
  onOpenSourceModal: (title: string, desc: string) => void;
}

export function TabValidations({
  searchQuery,
  onOpenSourceModal,
}: TabValidationsProps) {
  const [modelFilter, setModelFilter] = useState<"all" | "65" | "55" | "future">("all");

  const filteredRejections = useMemo(() => {
    let list = REJECTIONS_DATA;

    if (modelFilter === "65") {
      list = list.filter((r) => r.model === "65" || r.model === "Ambos");
    } else if (modelFilter === "55") {
      list = list.filter((r) => r.model === "55" || r.model === "Ambos" || r.model === "Future55");
    } else if (modelFilter === "future") {
      list = list.filter((r) => r.model === "Future55");
    }

    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (r) =>
        r.cStat.toLowerCase().includes(q) ||
        r.rule.toLowerCase().includes(q) ||
        r.msg.toLowerCase().includes(q) ||
        r.trigger.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q)
    );
  }, [modelFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Matriz de Regras de Validação (RV) e Rejeições SEFAZ</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Consulte os códigos de status de erro (cStat), gatilhos lógicos de rejeição e o diferimento de regras pela NT 2025.001.
            </p>
          </div>

          {/* Model Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <Button
              variant={modelFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setModelFilter("all")}
              className="h-8 text-xs font-medium"
            >
              Todas ({REJECTIONS_DATA.length})
            </Button>
            <Button
              variant={modelFilter === "65" ? "default" : "outline"}
              size="sm"
              onClick={() => setModelFilter("65")}
              className="h-8 text-xs font-medium"
            >
              Apenas NFC-e (65)
            </Button>
            <Button
              variant={modelFilter === "55" ? "default" : "outline"}
              size="sm"
              onClick={() => setModelFilter("55")}
              className="h-8 text-xs font-medium"
            >
              Apenas NF-e (55)
            </Button>
            <Button
              variant={modelFilter === "future" ? "default" : "outline"}
              size="sm"
              onClick={() => setModelFilter("future")}
              className={cn(
                "h-8 text-xs font-medium",
                modelFilter === "future"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "border-purple-500/30 text-purple-600 hover:bg-purple-500/10 dark:text-purple-400"
              )}
            >
              Impl. Futura Mod 55
            </Button>
          </div>
        </div>

        {/* Rejections Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Regra (ID)</th>
                <th className="py-2.5 px-3">Modelo</th>
                <th className="py-2.5 px-3">Código Error</th>
                <th className="py-2.5 px-3">Mensagem Oficial da SEFAZ</th>
                <th className="py-2.5 px-3">Condição Lógica & Fonte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRejections.map((item) => {
                let modelBadge = "bg-muted text-muted-foreground";
                let modelLabel: string = item.model;
                if (item.model === "65") {
                  modelBadge = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold";
                } else if (item.model === "55") {
                  modelBadge = "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold";
                } else if (item.model === "Future55") {
                  modelBadge = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold";
                  modelLabel = "NF-e Impl. Futura";
                }

                return (
                  <tr key={item.rule + item.cStat} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground text-xs">
                      {item.rule}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={cn("px-2 py-0.5 rounded text-[10px]", modelBadge)}>
                        {modelLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
                      {item.cStat}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground text-[11px] max-w-sm">
                      {item.msg}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-muted-foreground leading-relaxed">
                      <div>{item.trigger}</div>
                      <button
                        onClick={() =>
                          onOpenSourceModal(
                            `Regra ${item.rule} (Rejeição ${item.cStat})`,
                            `${item.msg} Gatilho operacional: ${item.trigger}. Base regulatória: ${item.source}.`
                          )
                        }
                        className="text-emerald-600 dark:text-emerald-400 hover:underline text-[10px] font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Fonte: {item.source}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
