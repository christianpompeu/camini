import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { getPublishedRadarEditions, extractUniqueTags } from "@/lib/radar";
import { ArchiveFilter } from "@/components/radar/archive-filter";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Arquivo de Edições | Radar da Reforma Tributária | Camini",
  description:
    "Acervo completo das publicações do Radar da Reforma Tributária. Pesquise por tema, número da edição ou termos técnicos.",
  openGraph: {
    title: "Arquivo de Edições | Radar da Reforma Tributária | Camini",
    description:
      "Acervo completo das publicações do Radar da Reforma Tributária. Pesquise por tema, número da edição ou termos técnicos.",
    type: "website",
  },
};

export default async function RadarEdicoesPage() {
  const editions = await getPublishedRadarEditions();
  const allTags = extractUniqueTags(editions);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-1">
        {/* CABEÇALHO COM BREADCRUMB */}
        <section className="border-b border-border/60 bg-muted/20 py-10 md:py-14">
          <div className="mx-auto max-w-5xl px-6 space-y-3">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground transition-colors">
                Início
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/radar" className="hover:text-foreground transition-colors">
                Radar da Reforma
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Arquivo de Edições</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Arquivo de Edições
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Consulte todo o acervo histórico e recente de análises do Radar da
              Reforma Tributária. Utilize a busca e as categorias temáticas para
              localizar decisões, balanços e impactos operacionais.
            </p>
          </div>
        </section>

        {/* LISTAGEM COM BUSCA E FILTROS */}
        <div className="mx-auto max-w-5xl px-6 py-8 sm:py-12">
          <ArchiveFilter initialEditions={editions} allTags={allTags} />
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
            <Link href="/radar" className="hover:text-foreground transition-colors">
              Radar
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
