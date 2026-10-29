"use client";

import React, { useState, useMemo } from "react";
import {
  Terminal,
  Copy,
  Stethoscope,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TPAG_DATA, PRESET_SCENARIOS, PUBLIC_REPORT_URL } from "@/lib/nfe-pag/data";
import {
  SimulatorParams,
  generatePagXmlSnippet,
  runSefazDiagnostics,
  isElectronicPayment,
} from "@/lib/nfe-pag/simulator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TabSimulator() {
  const [model, setModel] = useState<"55" | "65">("65");
  const [finNFe, setFinNFe] = useState<"1" | "3" | "4">("1");
  const [preset, setPreset] = useState<string>("custom");
  const [tPag, setTPag] = useState<string>("03");
  const [vNF, setVNF] = useState<number>(150.0);
  const [vPag, setVPag] = useState<number>(150.0);
  const [tpIntegra, setTpIntegra] = useState<"1" | "2">("1");
  const [xPag, setXPag] = useState<string>("Permuta de Mercadorias");

  const isElectronic = isElectronicPayment(tPag);

  const handlePresetChange = (presetId: string) => {
    setPreset(presetId);
    if (presetId === "custom") return;

    const target = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!target) return;

    setModel(target.model);
    setFinNFe(target.finNFe);
    setTPag(target.tPag);
    setVNF(target.vNF);
    setVPag(target.vPag);
    setTpIntegra(target.tpIntegra);
    if (target.xPag) setXPag(target.xPag);
  };

  const currentParams: SimulatorParams = useMemo(() => {
    return {
      model,
      finNFe,
      tPag,
      vNF: Number(vNF) || 0,
      vPag: Number(vPag) || 0,
      tpIntegra,
      xPag,
    };
  }, [model, finNFe, tPag, vNF, vPag, tpIntegra, xPag]);

  const xmlSnippet = useMemo(() => {
    return generatePagXmlSnippet(currentParams);
  }, [currentParams]);

  const diagnostics = useMemo(() => {
    return runSefazDiagnostics(currentParams);
  }, [currentParams]);

  const copyXmlSnippet = () => {
    navigator.clipboard.writeText(xmlSnippet).then(() => {
      toast.success("Trecho XML copiado com sucesso!");
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Simulador Interativo de Estruturação XML e Validador de Regras</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione os parâmetros da operação comercial para gerar o trecho XML do grupo <code className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">&lt;pag&gt;</code> em tempo real. O assistente analisará instantaneamente eventuais riscos de rejeição na SEFAZ.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={
            <a
              href={PUBLIC_REPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          className="h-8 text-xs font-semibold gap-1.5 shrink-0"
        >
          <span>Ver Casos no Relatório</span>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Grid: Configurator + XML Preview/Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configurator Panel */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <h3 className="font-bold text-foreground text-sm">
              Parâmetros da Operação
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              Schema 4.00
            </span>
          </div>

          {/* Preset Scenario Selector */}
          <div>
            <label className="block font-medium text-foreground mb-1 text-xs">
              Cenário Pré-configurado
            </label>
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 font-medium rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
            >
              <option value="custom">Personalizado / Manual...</option>
              {PRESET_SCENARIOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Document Model */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              Modelo do Documento Fiscal
            </label>
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value as "55" | "65");
                setPreset("custom");
              }}
              className="w-full bg-background border border-border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs text-foreground"
            >
              <option value="65">NFC-e (Modelo 65 - Varejo Presencial)</option>
              <option value="55">NF-e (Modelo 55 - Faturamento / B2B)</option>
            </select>
          </div>

          {/* Finalidade */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              Finalidade da Nota (&lt;finNFe&gt;)
            </label>
            <select
              value={finNFe}
              onChange={(e) => {
                setFinNFe(e.target.value as "1" | "3" | "4");
                setPreset("custom");
              }}
              className="w-full bg-background border border-border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs text-foreground"
            >
              <option value="1">1 - Normal</option>
              <option value="3">3 - Ajuste</option>
              <option value="4">4 - Devolução de Mercadoria</option>
            </select>
          </div>

          {/* Meio de Pagamento */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              Meio de Pagamento (&lt;tPag&gt;)
            </label>
            <select
              value={tPag}
              onChange={(e) => {
                setTPag(e.target.value);
                setPreset("custom");
              }}
              className="w-full bg-background border border-border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 text-xs text-foreground"
            >
              {TPAG_DATA.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.code} - {t.name} ({t.source})
                </option>
              ))}
            </select>
          </div>

          {/* Valor Pago & Valor da Nota */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-foreground mb-1">
                Valor Total Nota (&lt;vNF&gt;)
              </label>
              <Input
                type="number"
                step="0.01"
                value={vNF}
                onChange={(e) => {
                  setVNF(parseFloat(e.target.value) || 0);
                  setPreset("custom");
                }}
                className="text-xs h-9 bg-background"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">
                Valor Pago (&lt;vPag&gt;)
              </label>
              <Input
                type="number"
                step="0.01"
                value={vPag}
                onChange={(e) => {
                  setVPag(parseFloat(e.target.value) || 0);
                  setPreset("custom");
                }}
                className="text-xs h-9 bg-background"
              />
            </div>
          </div>

          {/* Tipo Integração */}
          <div className={cn(!isElectronic && "opacity-50 pointer-events-none")}>
            <label className="block font-medium text-foreground mb-1">
              Tipo de Integração (&lt;tpIntegra&gt;)
            </label>
            <select
              value={tpIntegra}
              onChange={(e) => {
                setTpIntegra(e.target.value as "1" | "2");
                setPreset("custom");
              }}
              disabled={!isElectronic}
              className="w-full bg-background border border-border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 text-xs text-foreground"
            >
              <option value="1">1 - Pagamento Integrado (TEF / POS Integrado)</option>
              <option value="2">2 - Pagamento Não Integrado (POS Simples)</option>
            </select>
          </div>

          {/* Description xPag (for 99) */}
          {tPag === "99" && (
            <div className="animate-in fade-in-50 duration-200">
              <label className="block font-medium text-foreground mb-1">
                Descrição do Meio (&lt;xPag&gt;)
              </label>
              <Input
                type="text"
                value={xPag}
                onChange={(e) => {
                  setXPag(e.target.value);
                  setPreset("custom");
                }}
                placeholder="Ex: Permuta de Mercadorias"
                className="text-xs h-9 bg-background"
              />
            </div>
          )}
        </div>

        {/* Right: Live XML Output & Diagnostics */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Live XML Output */}
          <div className="rounded-xl border border-border bg-zinc-950 p-4 shadow-sm flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Preview do Trecho XML (&lt;pag&gt;)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyXmlSnippet}
                className="text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 h-7 px-2.5 text-xs font-mono gap-1"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar XML</span>
              </Button>
            </div>
            <pre className="text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed p-1">
              <code>{xmlSnippet}</code>
            </pre>
          </div>

          {/* SEFAZ Diagnostic Engine Feedback */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-foreground">
                  Diagnóstico de Validação SEFAZ
                </h4>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                Análise em Tempo Real
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {diagnostics.map((diag, index) => {
                let badgeStyle = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
                let Icon = CheckCircle2;
                let iconColor = "text-emerald-600 dark:text-emerald-400";

                if (diag.type === "error") {
                  badgeStyle = "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 font-medium";
                  Icon = XCircle;
                  iconColor = "text-rose-600 dark:text-rose-400";
                } else if (diag.type === "warning") {
                  badgeStyle = "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20";
                  Icon = AlertTriangle;
                  iconColor = "text-amber-600 dark:text-amber-400";
                } else if (diag.type === "info") {
                  badgeStyle = "bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20";
                  Icon = Info;
                  iconColor = "text-sky-600 dark:text-sky-400";
                }

                return (
                  <div
                    key={index}
                    className={cn(
                      "p-2.5 rounded-lg border flex items-center justify-between gap-3 text-[11px]",
                      badgeStyle
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
                      <span>{diag.msg}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase shrink-0">
                      {diag.code}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
