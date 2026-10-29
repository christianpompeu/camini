"use client";

import React from "react";
import {
  Receipt,
  Search,
  RotateCcw,
  ExternalLink,
  Code2,
  CreditCard,
  ShieldAlert,
  Link2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PUBLIC_REPORT_URL } from "@/lib/nfe-pag/data";

interface NfePagHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

export function NfePagHeader({
  searchQuery,
  onSearchChange,
  onResetFilters,
}: NfePagHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-[11px] px-2.5 py-0.5"
              >
                MOC 7.0 • IT 2024.002 v1.11 • NT 2025.001
              </Badge>
              <span className="text-xs text-muted-foreground">• Módulo DF-e Aberto</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Grupo &lt;pag&gt; NF-e & NFC-e
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Painel Técnico, Regras de Validação, Tabelas de Domínio e Simulador Interativo com Rastreabilidade
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              render={
                <a
                  href={PUBLIC_REPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir Relatório Fonte Original no Gemini"
                />
              }
              className="h-10 text-xs font-semibold gap-2 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Relatório Técnico Fonte</span>
            </Button>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar tag, erro ou norma..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-8 text-xs h-10 bg-background/80"
              />
              {searchQuery && (
                <button
                  onClick={onResetFilters}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-0.5"
                  title="Limpar busca"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-border/60">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/50 p-2.5">
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">18 Tags</div>
              <div className="text-[11px] text-muted-foreground">Mapeadas no Grupo YA</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/50 p-2.5">
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">23+ Meios</div>
              <div className="text-[11px] text-muted-foreground">Tabela Externa &lt;tPag&gt;</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/50 p-2.5">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">17 Regras</div>
              <div className="text-[11px] text-muted-foreground">Validações & Rejeições</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/50 p-2.5">
            <div className="p-2 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">100% Fontes</div>
              <div className="text-[11px] text-muted-foreground">Rastreabilidade Normativa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Transparency Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-950 dark:text-amber-200">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            Todas as tags, regras de validação (RVs), notas de condicionalidade e cenários deste utilitário possuem fundamentação nas Notas Técnicas da SEFAZ e no <strong>Relatório Técnico Original</strong>.
          </span>
        </div>
        <a
          href={PUBLIC_REPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
        >
          <span>Consultar Documento</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
