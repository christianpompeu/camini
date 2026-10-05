import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RadarEdition } from "@/lib/radar/types";
import { formatRadarShortDate } from "@/lib/radar/date";

export interface EditionCardProps {
  edition: RadarEdition;
}

export function EditionCard({ edition }: EditionCardProps) {
  const dateFormatted = formatRadarShortDate(edition.published_at);
  const readingTime = edition.reading_minutes || 5;
  const description = edition.subtitulo || edition.resumo || "";

  return (
    <Link
      href={`/radar/edicoes/${edition.slug}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="h-full flex flex-col justify-between border-border bg-card transition-all duration-200 hover:border-primary/40 hover:bg-muted/20 hover:shadow-sm">
        <CardHeader className="space-y-3 pb-3">
          {/* Metadados: Edição, Data e Leitura */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-bold tracking-wider uppercase text-primary text-[11px] bg-primary/10 px-2 py-0.5 rounded">
              Edição {edition.numero}
            </span>
            <div className="flex items-center gap-3">
              {dateFormatted && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {dateFormatted}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime} min
              </span>
            </div>
          </div>

          {/* Título Principal */}
          <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors">
            {edition.titulo}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 pb-4">
          {description && (
            <CardDescription className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {description}
            </CardDescription>
          )}

          {/* Tags */}
          {Array.isArray(edition.tags) && edition.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {edition.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[11px] font-normal px-2 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
              {edition.tags.length > 3 && (
                <span className="text-[11px] text-muted-foreground font-medium self-center pl-1">
                  +{edition.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 border-t border-border/50 text-xs font-medium text-primary flex items-center justify-between mt-auto">
          <span>Ler edição</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </CardFooter>
      </Card>
    </Link>
  );
}
