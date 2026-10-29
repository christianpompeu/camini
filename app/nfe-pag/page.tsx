import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { NfePagClientShell } from "@/components/nfe-pag/nfe-pag-client-shell";
import { PUBLIC_REPORT_URL } from "@/lib/nfe-pag/data";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Guia Interativo XML NF-e & NFC-e Grupo <pag> | Camini",
  description:
    "Guia técnico, regras de validação SEFAZ, tabelas externas de domínio e simulador interativo de XML para o Grupo <pag> da NF-e e NFC-e.",
  openGraph: {
    title: "Guia Interativo XML NF-e & NFC-e Grupo <pag> | Camini",
    description:
      "Guia técnico, regras de validação SEFAZ, tabelas externas de domínio e simulador interativo de XML para o Grupo <pag> da NF-e e NFC-e.",
    type: "website",
  },
};

export default function NfePagPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="flex-1 w-full mx-auto max-w-5xl px-6 py-8 sm:py-10">
        <NfePagClientShell />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-6 text-xs text-muted-foreground mt-auto">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="font-semibold text-foreground">
              Base Normativa: MOC 7.0 • NT 2020.006 • NT 2023.004 v1.20 • IT 2024.002 v1.11 • NT 2025.001
            </p>
            <p className="text-[11px] text-muted-foreground">
              Desenvolvido como utilitário técnico integrado ao ecossistema Camini, fundamentado no{" "}
              <a
                href={PUBLIC_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Relatório Técnico do Grupo &lt;pag&gt;</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-muted px-2.5 py-1 rounded border border-border">
              v2026.2
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
