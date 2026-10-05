"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Tag as TagIcon, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditionCard } from "./edition-card";
import type { RadarEdition } from "@/lib/radar/types";

export interface ArchiveFilterProps {
  initialEditions: RadarEdition[];
  allTags: { tag: string; count: number }[];
}

export function ArchiveFilter({
  initialEditions,
  allTags,
}: ArchiveFilterProps) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredEditions = useMemo(() => {
    return initialEditions.filter((ed) => {
      // Filtro por tag
      if (selectedTag) {
        if (!Array.isArray(ed.tags) || !ed.tags.includes(selectedTag)) {
          return false;
        }
      }

      // Filtro por busca textual
      const term = search.toLowerCase().trim();
      if (!term) return true;

      const titleMatch = ed.titulo?.toLowerCase().includes(term);
      const subtitleMatch = ed.subtitulo?.toLowerCase().includes(term);
      const resumoMatch = ed.resumo?.toLowerCase().includes(term);
      const numberMatch = String(ed.numero).includes(term);
      const tagMatch =
        Array.isArray(ed.tags) &&
        ed.tags.some((t) => t.toLowerCase().includes(term));

      return titleMatch || subtitleMatch || resumoMatch || numberMatch || tagMatch;
    });
  }, [initialEditions, search, selectedTag]);

  const clearFilters = () => {
    setSearch("");
    setSelectedTag(null);
  };

  return (
    <div className="space-y-8">
      {/* Barra de Busca e Filtros de Tag */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Campo de Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por termo, número da edição ou assunto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-10 text-sm bg-background"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Contador de Resultados */}
          <div className="text-xs text-muted-foreground sm:text-right">
            <span>
              Mostrando <strong className="text-foreground">{filteredEditions.length}</strong> de{" "}
              {initialEditions.length} edições publicadas
            </span>
          </div>
        </div>

        {/* Nuvem de Tags Mais Frequentes */}
        {allTags.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2.5">
              <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Filtrar por tema
              </span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-primary hover:underline ml-auto font-medium"
                >
                  Limpar tema
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  selectedTag === null
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                Todas ({initialEditions.length})
              </button>

              {allTags.slice(0, 16).map(({ tag, count }) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                        : "bg-muted/40 text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {tag} <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid de Edições */}
      {filteredEditions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 px-4 text-center flex flex-col items-center justify-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            Nenhuma edição encontrada
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Não foram encontradas edições com os critérios pesquisados. Tente
            remover filtros ou buscar por outro termo.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="mt-4"
          >
            Limpar todos os filtros
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEditions.map((edition) => (
            <EditionCard key={edition.id} edition={edition} />
          ))}
        </div>
      )}
    </div>
  );
}
