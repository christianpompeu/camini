import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RadarEdition } from "@/lib/radar/types";
import { formatRadarDate } from "@/lib/radar/date";

export interface LatestEditionCardProps {
  edition: RadarEdition;
}

export function LatestEditionCard({ edition }: LatestEditionCardProps) {
  const dateFormatted = formatRadarDate(edition.published_at);
  const readingTime = edition.reading_minutes || 5;
  const description = edition.subtitulo || edition.resumo || "";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-card/60 p-6 sm:p-8 md:p-10 shadow-sm transition-all hover:border-primary/40">
      {/* Elemento de fundo sutil */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Metadados Superiores */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary text-xs tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Edição em Destaque • Nº {edition.numero}
            </span>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground text-xs sm:text-sm font-medium">
            {dateFormatted && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {dateFormatted}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} min de leitura
            </span>
          </div>
        </div>

        {/* Título Principal */}
        <div className="space-y-3">
          <Link
            href={`/radar/edicoes/${edition.slug}`}
            className="group block"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
              {edition.titulo}
            </h2>
          </Link>
          {description && (
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {/* Tags */}
        {Array.isArray(edition.tags) && edition.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {edition.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal px-2.5 py-0.5 border-border/80 bg-muted/30"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Botão de Ação */}
        <div className="pt-2">
          <Link href={`/radar/edicoes/${edition.slug}`}>
            <Button size="lg" className="gap-2 h-11 px-6 font-semibold shadow-xs">
              <span>Ler edição completa</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
