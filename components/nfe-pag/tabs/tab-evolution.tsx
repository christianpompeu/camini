"use client";

import React from "react";
import {
  Bookmark,
  ExternalLink,
  Link2,
  Clock,
  PieChart,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TIMELINE_DATA } from "@/lib/nfe-pag/data";

interface TabEvolutionProps {
  onOpenSourceModal: (title: string, desc: string) => void;
}

export function TabEvolution({ onOpenSourceModal }: TabEvolutionProps) {
  // Chart 1 Distribution Data
  const paymentBreakdown = [
    { label: "Benefícios & Convênios", count: 8, pct: "35%", color: "bg-sky-500", barColor: "#0284c7" },
    { label: "Cartões & TEF", count: 7, pct: "30%", color: "bg-emerald-500", barColor: "#10b981" },
    { label: "PIX (17, 20, 23)", count: 3, pct: "13%", color: "bg-emerald-400", barColor: "#34d399" },
    { label: "Especiais (90, 91, 99)", count: 3, pct: "13%", color: "bg-indigo-500", barColor: "#6366f1" },
    { label: "Espécie & Cártula (01, 02)", count: 2, pct: "9%", color: "bg-amber-500", barColor: "#f59e0b" },
  ];

  // Chart 2 Strictness Comparison Data
  const strictnessData = [
    {
      metric: "Bloqueio Ativo (Rejeição)",
      nfc: { value: 15, max: 18, color: "bg-emerald-600 dark:bg-emerald-500" },
      nfe: { value: 11, max: 18, color: "bg-sky-600 dark:bg-sky-500" },
    },
    {
      metric: "Restrições Específicas do Modelo",
      nfc: { value: 3, max: 18, color: "bg-emerald-600 dark:bg-emerald-500" },
      nfe: { value: 2, max: 18, color: "bg-sky-600 dark:bg-sky-500" },
    },
    {
      metric: "Impl. Futura / B2B (NT 2025.001)",
      nfc: { value: 0, max: 18, color: "bg-emerald-600 dark:bg-emerald-500" },
      nfe: { value: 2, max: 18, color: "bg-sky-600 dark:bg-sky-500" },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Context Card */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-foreground space-y-4">
        <div className="flex items-center gap-2 font-bold text-base text-foreground">
          <Bookmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Contexto e Rastreabilidade das Legislações</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Esta seção apresenta a evolução histórica e técnica das Notas Técnicas (NTs) e Informes Técnicos (ITs) que transformaram o grupo{" "}
          <code className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">&lt;pag&gt;</code> de um mero registro informativo em um instrumento central de conciliação financeira eletrônica e cruzamento fiscal. Clique em qualquer marco legislativo para inspecionar os detalhes no relatório normativo.
        </p>

        <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onOpenSourceModal(
                "NT 2020.006 v1.20",
                "Desacoplamento XSD das tabelas tPag/tBand, introdução da tag descritiva xPag para pagamentos 99-Outros e obrigatoriedade de identificação de intermediadores/marketplaces."
              )
            }
            className="text-xs h-8 gap-1.5 bg-background hover:bg-emerald-500/10 hover:text-emerald-600 border-border"
          >
            <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            NT 2020.006: Desacoplamento & xPag
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onOpenSourceModal(
                "NT 2023.004 v1.20",
                "Ampliação do campo cAut para até 128 posições, inclusão de 5 novas tags de estabelecimento (dPag, CNPJPag, UFPag, CNPJReceb, idTermPag) e instituição do limite máximo de troco (RV YA09-20)."
              )
            }
            className="text-xs h-8 gap-1.5 bg-background hover:bg-emerald-500/10 hover:text-emerald-600 border-border"
          >
            <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            NT 2023.004: Novas Tags & Limite de Troco
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onOpenSourceModal(
                "IT 2024.002 v1.11",
                "Inclusão das modalidades PIX Dinâmico (17), PIX Estático (20), Crédito em Loja (21), Pagamento Posterior (91), PIX Automático (23) e Book Transfer (24) no Portal Nacional da NF-e."
              )
            }
            className="text-xs h-8 gap-1.5 bg-background hover:bg-emerald-500/10 hover:text-emerald-600 border-border"
          >
            <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            IT 2024.002 v1.11: Novos Meios de Pagamento
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onOpenSourceModal(
                "NT 2025.001",
                "Ajuste das regras de validação do grupo de pagamentos na NF-e (Modelo 55), flexibilizando travas no B2B e alinhando os registros para suporte ao Split Payment da Reforma Tributária (IBS/CBS)."
              )
            }
            className="text-xs h-8 gap-1.5 bg-background hover:bg-emerald-500/10 hover:text-emerald-600 border-border"
          >
            <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            NT 2025.001: Calibração Modelo 55 & Reforma
          </Button>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distribution of tPag */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <PieChart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Distribuição dos Meios de Pagamento (&lt;tPag&gt;)</span>
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                23 Códigos
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Proporção por categoria operacional e exigência de grupo de cartões / integração.
            </p>
          </div>

          {/* Clean Segment Bar & Legend */}
          <div className="space-y-4 my-2">
            {/* Multi-segment Progress Bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted/60 p-0.5 border border-border/60">
              {paymentBreakdown.map((item, i) => (
                <div
                  key={i}
                  style={{ width: item.pct }}
                  className={`${item.color} h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:brightness-110`}
                  title={`${item.label}: ${item.count} códigos (${item.pct})`}
                />
              ))}
            </div>

            {/* Legend list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
              {paymentBreakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-foreground text-[11px] font-medium">{item.label}</span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-muted-foreground">
                    {item.count} <span className="opacity-70">({item.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Fonte: IT 2024.002 v1.11 (Vigência 2024–2026)</span>
            <button
              onClick={() =>
                onOpenSourceModal(
                  "IT 2024.002 v1.11",
                  "Tabela oficial de Meios de Pagamento atualizada pelo Informe Técnico 2024.002 v1.11 publicada no Portal Nacional da Nota Fiscal Eletrônica."
                )
              }
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>Ver detalhes</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Chart 2: Validation Strictness NF-e vs NFC-e */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>Rigor de Validação SEFAZ: NF-e (55) vs NFC-e (65)</span>
              </h3>
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                NT 2025.001
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Comparativo das regras de bloqueio ativo e postergações para suporte à Reforma Tributária.
            </p>
          </div>

          <div className="space-y-4 my-2 text-xs">
            {strictnessData.map((item, idx) => (
              <div key={idx} className="space-y-1.5 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                <div className="flex items-center justify-between font-medium text-foreground text-[11px]">
                  <span>{item.metric}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      NFC-e: {item.nfc.value}
                    </span>
                    <span className="text-sky-600 dark:text-sky-400 font-semibold">
                      NF-e: {item.nfe.value}
                    </span>
                  </div>
                </div>

                {/* Double Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(item.nfc.value / item.nfc.max) * 100}%` }}
                      className={`h-full ${item.nfc.color} transition-all duration-300 rounded-full`}
                    />
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(item.nfe.value / item.nfe.max) * 100}%` }}
                      className={`h-full ${item.nfe.color} transition-all duration-300 rounded-full`}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-center gap-6 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                <span className="text-muted-foreground font-medium">NFC-e (Modelo 65 - Varejo)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-600 dark:bg-sky-500" />
                <span className="text-muted-foreground font-medium">NF-e (Modelo 55 - B2B)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Fonte: NT 2025.001 (Ajuste das Regras do Grupo YA)</span>
            <button
              onClick={() =>
                onOpenSourceModal(
                  "NT 2025.001",
                  "Regras de validação do grupo de pagamentos flexibilizadas para NF-e modelo 55 visando manter fluidez na emissão B2B e transição para o Split Payment."
                )
              }
              className="text-sky-600 dark:text-sky-400 hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>Ver detalhes</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Historical Timeline Cards */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-foreground">
              Linha do Tempo e Principais Notas Técnicas Aplicáveis ao Grupo YA
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            5 Marcos Regulatórios
          </span>
        </div>

        <div className="relative border-l-2 border-border ml-3 sm:ml-4 space-y-6">
          {TIMELINE_DATA.map((milestone, idx) => (
            <div key={idx} className="relative pl-6 group">
              <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-emerald-500 group-hover:scale-110 transition-transform" />

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-foreground font-mono">
                  {milestone.nt}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${milestone.badgeColor || "bg-muted text-foreground"}`}>
                  {milestone.badge}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenSourceModal(milestone.nt, milestone.sourceDetail)}
                  className="h-6 px-2 text-[10px] text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 gap-1"
                >
                  <Link2 className="h-3 w-3" />
                  Fonte
                </Button>
              </div>

              <h4 className="text-xs font-semibold text-foreground mt-1">
                {milestone.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {milestone.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
