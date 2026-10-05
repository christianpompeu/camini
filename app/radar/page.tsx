import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Radio, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { getPublishedRadarEditions, getLatestRadarEdition } from "@/lib/radar";
import { LatestEditionCard } from "@/components/radar/latest-edition-card";
import { EditionCard } from "@/components/radar/edition-card";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Radar da Reforma Tributária | Camini",
  description:
    "Monitoramento técnico e fiscal da Reforma Tributária brasileira: IBS, CBS, NFS-e, NF-e, CGIBS, Receita Federal e Simples Nacional.",
  openGraph: {
    title: "Radar da Reforma Tributária | Camini",
    description:
      "Monitoramento técnico e fiscal da Reforma Tributária brasileira: IBS, CBS, NFS-e, NF-e, CGIBS, Receita Federal e Simples Nacional.",
    type: "website",
  },
};

export default async function RadarLandingPage() {
  const [latestEdition, allEditions] = await Promise.all([
    getLatestRadarEdition(),
    getPublishedRadarEditions(),
  ]);

  // Edições recentes excluindo a em destaque
  const recentEditions = latestEdition
    ? allEditions.filter((e) => e.id !== latestEdition.id).slice(0, 6)
    : allEditions.slice(0, 6);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-1">
        {/* CABEÇALHO EDITORIAL */}
        <section className="border-b border-border/60 bg-muted/20 py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-6 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary shadow-2xs">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>Publicação Técnica & Regulatória</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Radar da Reforma Tributária
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Monitoramento técnico, normativo e operacional da Reforma Tributária
              brasileira. Análises com foco em IBS, CBS, documentos fiscais (NFS-e,
              NF-e), Simples Nacional, CGIBS e Receita Federal.
            </p>
          </div>
        </section>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="mx-auto max-w-5xl px-6 py-10 sm:py-12 space-y-14">
          {/* EDIÇÃO MAIS RECENTE EM DESTAQUE */}
          {latestEdition ? (
            <section aria-label="Edição em Destaque">
              <LatestEditionCard edition={latestEdition} />
            </section>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-16 px-4 text-center">
              <p className="text-muted-foreground">
                Nenhuma edição publicada no momento.
              </p>
            </div>
          )}

          {/* ÚLTIMAS EDIÇÕES PUBLICADAS */}
          {recentEditions.length > 0 && (
            <section className="space-y-6" aria-label="Últimas Edições">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-border/60">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Publicações Recentes
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Acompanhe as análises das rodadas normativas e novidades operacionais.
                  </p>
                </div>

                <Link
                  href="/radar/edicoes"
                  className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  <span>Ver arquivo completo ({allEditions.length})</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentEditions.map((edition) => (
                  <EditionCard key={edition.id} edition={edition} />
                ))}
              </div>

              <div className="pt-4 text-center">
                <Link href="/radar/edicoes">
                  <Button variant="outline" size="lg" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Explorar todas as {allEditions.length} edições no arquivo</span>
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 md:py-12 mt-auto">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="font-bold text-xl tracking-tight">Camini</span>
            <span className="text-muted-foreground text-sm">
              Radar da Reforma Tributária • © 2026.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <Link href="/radar/edicoes" className="hover:text-foreground transition-colors">
              Arquivo
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
