"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Layers,
  Lightbulb,
  ExternalLink,
  Check,
  FileCode,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TPAG_DATA, TBAND_DATA } from "@/lib/nfe-pag/data";
import { PaymentCategory } from "@/lib/nfe-pag/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TabDomainsProps {
  searchQuery: string;
  onOpenSourceModal: (title: string, desc: string) => void;
}

export function TabDomains({
  searchQuery,
  onOpenSourceModal,
}: TabDomainsProps) {
  const [activeSection, setActiveSection] = useState<"tpag" | "tband" | "pag91">("tpag");
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory>("all");

  const filteredTPag = useMemo(() => {
    let list = TPAG_DATA;
    if (selectedCategory !== "all") {
      if (selectedCategory === "pix") {
        list = list.filter((item) => ["17", "20", "23"].includes(item.code));
      } else if (selectedCategory === "cards") {
        list = list.filter((item) => ["03", "04", "05", "24"].includes(item.code));
      } else if (selectedCategory === "new") {
        list = list.filter((item) => ["17", "20", "21", "22", "23", "24", "91"].includes(item.code));
      } else {
        list = list.filter((item) => item.category === selectedCategory);
      }
    }

    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
    );
  }, [selectedCategory, searchQuery]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success("Código XML copiado para a área de transferência!");
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Banner & Sub-tab Toggles */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tabelas de Domínio Externas (&lt;tPag&gt; e &lt;tBand&gt;)</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Desde a NT 2020.006, os meios de pagamento e bandeiras são geridos em tabelas fora do esquema XSD. Cada código possui respaldo normativo oficial.
            </p>
          </div>

          {/* Subtab Toggle Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/60 border border-border shrink-0 text-xs">
            <button
              onClick={() => setActiveSection("tpag")}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer",
                activeSection === "tpag"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Meios &lt;tPag&gt;
            </button>
            <button
              onClick={() => setActiveSection("tband")}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer",
                activeSection === "tband"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Bandeiras &lt;tBand&gt;
            </button>
            <button
              onClick={() => setActiveSection("pag91")}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5",
                activeSection === "pag91"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lightbulb className="h-3 w-3" />
              <span>Destaque: Código 91</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: tPag Table */}
        {activeSection === "tpag" && (
          <div className="space-y-4 pt-2">
            {/* Category filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="h-7 text-xs"
              >
                Todos ({TPAG_DATA.length})
              </Button>
              <Button
                variant={selectedCategory === "pix" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("pix")}
                className="h-7 text-xs"
              >
                PIX (17, 20, 23)
              </Button>
              <Button
                variant={selectedCategory === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("cards")}
                className="h-7 text-xs"
              >
                Cartões / TEF
              </Button>
              <Button
                variant={selectedCategory === "new" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("new")}
                className="h-7 text-xs"
              >
                Novos IT 2024.002
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs text-foreground">
                <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Descrição Oficial</th>
                    <th className="py-2.5 px-3">Vigência / Fonte</th>
                    <th className="py-2.5 px-3">Grupo &lt;card&gt;</th>
                    <th className="py-2.5 px-3">Diretrizes & Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-sans">
                  {filteredTPag.map((item) => {
                    let cardBadge = "bg-muted text-muted-foreground";
                    if (item.card === "Obrigatório") {
                      cardBadge = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold";
                    } else if (item.card === "Permitido" || item.card === "Facultativo") {
                      cardBadge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
                    }

                    return (
                      <tr key={item.code} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {item.code}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                          <button
                            onClick={() =>
                              onOpenSourceModal(
                                `Código ${item.code} - ${item.name}`,
                                `${item.notes} Base legal: ${item.source}. Publicada no Portal Nacional da NF-e.`
                              )
                            }
                            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{item.source}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={cn("px-2 py-0.5 rounded text-[10px]", cardBadge)}>
                            {item.card}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-muted-foreground leading-relaxed">
                          {item.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 2: tBand Grid */}
        {activeSection === "tband" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Códigos de bandeiras aceitos na tag <code className="font-mono text-emerald-600 dark:text-emerald-400">&lt;tBand&gt;</code> (YA06) quando informados pagamentos via cartão/TEF.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onOpenSourceModal(
                    "Tabela Externa de Bandeiras de Cartão",
                    "Tabela oficial de bandeiras de cartão mantida no Portal Nacional da Nota Fiscal Eletrônica e desacoplada do schema XSD pela NT 2020.006."
                  )
                }
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold h-7 gap-1"
              >
                <span>Fonte Oficial tBand</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {TBAND_DATA.map((brand) => (
                <div
                  key={brand.code}
                  className="p-3 bg-muted/40 border border-border rounded-xl text-center font-mono text-xs hover:border-emerald-500/40 hover:bg-muted/70 transition-all"
                >
                  <span className="block font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {brand.code}
                  </span>
                  <span className="font-sans text-[11px] text-foreground font-medium mt-0.5 block truncate" title={brand.name}>
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: Deep Dive Código 91 */}
        {activeSection === "pag91" && (
          <div className="space-y-5 pt-2">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-2 text-amber-950 dark:text-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                  <Lightbulb className="h-4 w-4" />
                  <span>Regra de Ouro do Código tPag=91 (Pagamento Posterior)</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onOpenSourceModal(
                      "IT 2024.002 v1.10 - Código 91",
                      "Publicado no Informe Técnico 2024.002 v1.10 para padronizar vendas a prazo no faturamento corporativo (B2B) e evitar a incidência da Rejeição 865 na NF-e modelo 55."
                    )
                  }
                  className="h-7 text-xs bg-background hover:bg-amber-500/20 border-amber-500/30 text-amber-800 dark:text-amber-300 gap-1 font-semibold"
                >
                  <span>Fonte: IT 2024.002 v1.10</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              <p className="leading-relaxed">
                Introduzido pelo IT 2024.002 v1.10, o código <strong>91</strong> veio resolver a distorção do uso incorreto de <em>99-Outros</em> ou <em>90-Sem Pagamento</em> para vendas a prazo. Quando o pagamento ocorrer em momento futuro (sem quitação no ato), o XML deve conter obrigatoriamente <code className="font-mono font-bold">&lt;tPag&gt;91&lt;/tPag&gt;</code> e <code className="font-mono font-bold">&lt;vPag&gt;0.00&lt;/vPag&gt;</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Scenario A */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="bg-foreground text-background text-[10px] px-2 py-0.5 rounded font-mono">
                      Cenário A
                    </span>
                    <span>Venda 100% a Prazo (R$ 179,95)</span>
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyCode(`<pag>\n  <detPag>\n    <indPag>1</indPag>\n    <tPag>91</tPag>\n    <vPag>0.00</vPag>\n  </detPag>\n</pag>`)
                    }
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copiar
                  </Button>
                </div>

                <pre className="rounded-lg bg-zinc-950 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed border border-border/40">
                  <code>{`<pag>
  <detPag>
    <indPag>1</indPag>
    <tPag>91</tPag>
    <vPag>0.00</vPag>
  </detPag>
</pag>`}</code>
                </pre>

                <p className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Aprovado sem Rejeição 865. Indica formalmente que todo o valor será liquidado em data posterior.</span>
                </p>
              </div>

              {/* Scenario B */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <span className="bg-foreground text-background text-[10px] px-2 py-0.5 rounded font-mono">
                      Cenário B
                    </span>
                    <span>Entrada (R$ 100) + Restante a Prazo</span>
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyCode(`<pag>\n  <detPag>\n    <indPag>0</indPag>\n    <tPag>04</tPag>\n    <vPag>100.00</vPag>\n    <card>...</card>\n  </detPag>\n  <detPag>\n    <indPag>1</indPag>\n    <tPag>91</tPag>\n    <vPag>0.00</vPag>\n  </detPag>\n</pag>`)
                    }
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copiar
                  </Button>
                </div>

                <pre className="rounded-lg bg-zinc-950 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed border border-border/40">
                  <code>{`<pag>
  <detPag>
    <indPag>0</indPag>
    <tPag>04</tPag>
    <vPag>100.00</vPag>
    <card>...</card>
  </detPag>
  <detPag>
    <indPag>1</indPag>
    <tPag>91</tPag>
    <vPag>0.00</vPag>
  </detPag>
</pag>`}</code>
                </pre>

                <p className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Registra a quitação imediata da entrada no cartão e posterga o saldo remanescente com o código 91.</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
