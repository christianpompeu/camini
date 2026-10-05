import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  ChevronRight,
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getRadarEditionBySlug,
  getRadarEditionNavigation,
  getPublishedRadarEditions,
} from "@/lib/radar";
import { formatRadarDate } from "@/lib/radar/date";
import { RadarContentRenderer } from "@/components/radar/radar-content-renderer";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pré-renderização opcional dos slugs existentes para otimização estática
 */
export async function generateStaticParams() {
  const editions = await getPublishedRadarEditions();
  return editions.map((ed) => ({
    slug: ed.slug,
  }));
}

/**
 * Geração dinâmica de Metadata SEO
 */
export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const edition = await getRadarEditionBySlug(slug);

  if (!edition) {
    return {
      title: "Edição não encontrada | Radar da Reforma Tributária | Camini",
    };
  }

  const title = `${edition.titulo} | Radar da Reforma Tributária`;
  const description =
    edition.resumo ||
    edition.subtitulo ||
    "Análise técnica da Reforma Tributária no Camini.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: edition.published_at || undefined,
      tags: edition.tags || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RadarEditionDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const edition = await getRadarEditionBySlug(slug);

  // Se não existir, ou se for candidate/rejected/archived/is_test, aciona 404 estrito
  if (!edition) {
    notFound();
  }

  const { previous, next } = await getRadarEditionNavigation(edition.numero);

  const dateFormatted = formatRadarDate(edition.published_at);
  const readingTime = edition.reading_minutes || 5;
  const markdownContent = edition.snapshot?.editorial?.markdown || "";

  // Verifica se existe imagem de destaque válida externa (ex: Unsplash)
  // Ignora links relativos locais inexistentes do site legado
  const hasValidHeroImage =
    edition.hero_image?.src &&
    edition.hero_image.src.startsWith("http");

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground font-sans">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* CABEÇALHO DO ARTIGO / BREADCRUMB */}
        <section className="border-b border-border/60 bg-muted/15 py-8 sm:py-12">
          <div className="mx-auto max-w-3xl px-6 space-y-6">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link href="/" className="hover:text-foreground transition-colors">
                Início
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link href="/radar" className="hover:text-foreground transition-colors">
                Radar
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link
                href="/radar/edicoes"
                className="hover:text-foreground transition-colors"
              >
                Edições
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="text-foreground font-medium truncate max-w-[200px]">
                Edição {edition.numero}
              </span>
            </nav>

            {/* Metadados: Número da Edição, Data e Duração */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
              <span className="font-bold tracking-wider uppercase text-primary text-xs bg-primary/10 px-2.5 py-0.5 rounded-full">
                Edição {edition.numero}
              </span>

              {dateFormatted && (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {dateFormatted}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} min de leitura
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {edition.titulo}
            </h1>

            {/* Subtítulo / Resumo */}
            {edition.subtitulo && (
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal">
                {edition.subtitulo}
              </p>
            )}

            {/* Tags da Edição */}
            {Array.isArray(edition.tags) && edition.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {edition.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs font-normal px-2.5 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CONTAINER EDITORIAL DO ARTIGO */}
        <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
          {/* Imagem de Capa (se houver imagem externa válida) */}
          {hasValidHeroImage && (
            <div className="mb-10 overflow-hidden rounded-xl border border-border shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={edition.hero_image!.src}
                alt={edition.hero_image?.alt || edition.titulo}
                className="w-full h-auto max-h-[460px] object-cover"
              />
              {edition.hero_image?.caption && (
                <p className="p-3 text-xs text-muted-foreground bg-muted/30 border-t border-border italic text-center">
                  {edition.hero_image.caption}
                </p>
              )}
            </div>
          )}

          {/* RENDERER DO CONTEÚDO EDITORIAL */}
          <RadarContentRenderer markdown={markdownContent} />

          {/* NAVEGAÇÃO ENTRE EDIÇÕES */}
          <div className="mt-14 pt-8 border-t border-border space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {previous ? (
                <Link
                  href={`/radar/edicoes/${previous.slug}`}
                  className="group block p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all text-left"
                >
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1 font-medium">
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    Edição anterior
                  </span>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {previous.titulo}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {next && (
                <Link
                  href={`/radar/edicoes/${next.slug}`}
                  className="group block p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all text-right sm:ml-auto w-full"
                >
                  <span className="text-xs text-muted-foreground flex items-center justify-end gap-1 mb-1 font-medium">
                    Próxima edição
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {next.titulo}
                  </span>
                </Link>
              )}
            </div>

            <div className="pt-2 text-center">
              <Link href="/radar/edicoes">
                <Button variant="outline" size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Voltar para o arquivo de edições</span>
                </Button>
              </Link>
            </div>
          </div>
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
            <Link href="/radar/edicoes" className="hover:text-foreground transition-colors">
              Arquivo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
