"use client";

import React, { useState, useMemo } from "react";
import {
  GitFork,
  ExternalLink,
  Code2,
  FileCode2,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TAGS_DATA } from "@/lib/nfe-pag/data";
import { TagInfo } from "@/lib/nfe-pag/types";
import { cn } from "@/lib/utils";

interface TabStructureProps {
  searchQuery: string;
  onOpenSourceModal: (title: string, desc: string) => void;
}

export function TabStructure({
  searchQuery,
  onOpenSourceModal,
}: TabStructureProps) {
  const [selectedTagId, setSelectedTagId] = useState<string>("YA01");

  const filteredTags = useMemo(() => {
    if (!searchQuery) return TAGS_DATA;
    const q = searchQuery.toLowerCase().trim();
    return TAGS_DATA.filter(
      (t) =>
        t.tag.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.rejections.some((r) => r.includes(q))
    );
  }, [searchQuery]);

  const activeTag = useMemo(() => {
    return TAGS_DATA.find((t) => t.id === selectedTagId) || TAGS_DATA[0];
  }, [selectedTagId]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Overview Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <GitFork className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Arquitetura do Grupo YA (&lt;pag&gt;) no MOC 7.0</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Explore a hierarquia técnica das 18 tags do grupo de pagamento. Clique em qualquer elemento para examinar sua regra de condicionalidade, tipo de dado e fonte normativa.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/60 p-2 rounded-lg border border-border text-[11px] shrink-0 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Obrigatório</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Condicional</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <span>Opcional</span>
          </div>
        </div>
      </div>

      {/* Grid: Tag Tree / List + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Tree List */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-2">
            <span className="text-xs font-bold text-foreground">
              Hierarquia XML (Nível infNFe)
            </span>
            <span className="text-[11px] text-muted-foreground">
              {filteredTags.length} de {TAGS_DATA.length} tags
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {filteredTags.map((item) => {
              const isSelected = item.id === activeTag.id;

              let indentClass = "pl-2";
              if (item.parent === "<detPag>") indentClass = "pl-6";
              if (item.parent.includes("Seq") || item.parent === "<card>") indentClass = "pl-10";

              let badgeVariant = "bg-muted text-muted-foreground";
              if (item.cond === "Obrigatório") {
                badgeVariant = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
              } else if (item.cond === "Condicional") {
                badgeVariant = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
              }

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTagId(item.id)}
                  className={cn(
                    "p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between border-l-2",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 shadow-2xs text-foreground font-semibold"
                      : "border-transparent hover:bg-muted/50 text-foreground/80",
                    indentClass
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.tag}</span>
                    <span className="text-[10px] text-muted-foreground font-sans">
                      ({item.id})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-sans hidden sm:inline text-muted-foreground bg-muted/60 border border-border/50">
                      {item.source.split(" - ")[0]}
                    </span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded font-sans font-medium", badgeVariant)}>
                      {item.cond}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Tag Inspector Card */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between sticky top-28 h-fit">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-mono font-bold bg-muted text-foreground px-2 py-0.5 rounded border border-border">
                ID: {activeTag.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Ocorrência: {activeTag.occurrences}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold font-mono text-foreground">
                {activeTag.tag}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeTag.notes.split(".")[0]}.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                  Tag Pai
                </span>
                <span className="font-mono bg-muted/50 text-foreground px-2 py-1 rounded border border-border inline-block mt-0.5">
                  {activeTag.parent}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                  Tipo & Tamanho
                </span>
                <span className="text-foreground font-medium mt-0.5 block">
                  {activeTag.type}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                  Regra de Condicionalidade
                </span>
                <p className="text-foreground leading-relaxed mt-0.5">
                  Status: <strong>{activeTag.cond}</strong>.
                </p>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                  Fonte Normativa Oficial
                </span>
                <div className="mt-1 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-foreground">
                  <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                    {activeTag.source}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onOpenSourceModal(
                        `${activeTag.tag} (${activeTag.id})`,
                        `${activeTag.notes} Especificação técnica documentada em: ${activeTag.source}.`
                      )
                    }
                    className="h-6 px-2 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline gap-1 font-semibold"
                  >
                    <span>Ver no Relatório</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                  Diretriz Técnica / Observação
                </span>
                <p className="text-muted-foreground leading-relaxed mt-0.5 bg-muted/40 p-2.5 rounded-lg border border-border/60">
                  {activeTag.notes}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Validações & Rejeições Vinculadas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeTag.rejections.length > 0 ? (
                    activeTag.rejections.map((rej) => (
                      <span
                        key={rej}
                        className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                      >
                        Rejeição {rej}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-[11px]">
                      Nenhuma rejeição direta cadastrada
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Padrão MOC 7.0 / NT 2023.004</span>
            <Code2 className="h-4 w-4 text-muted-foreground/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
