"use client";

import React from "react";
import { CatalogExercise } from "@/types/exercise";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Image as ImageIcon, AlertTriangle, Archive, FileEdit } from "lucide-react";

interface ExerciseCardProps {
  exercise: CatalogExercise;
  onClick: () => void;
}

export function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  const primaryMuscle = exercise.primaryMuscles[0] || "Geral";
  const hasAvailableMedia = exercise.media.some((m) => m.availability === "available");
  
  const lateralityLabel =
    exercise.laterality === "unilateral"
      ? "unilateral"
      : exercise.laterality === "bilateral"
      ? "bilateral"
      : exercise.laterality === "alternating"
      ? "alternado"
      : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 sm:p-5 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all duration-150 flex items-center justify-between gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
            {exercise.name}
          </h3>

          {exercise.status === "draft" && (
            <Badge variant="secondary" className="text-[10px] gap-1 py-0 px-1.5">
              <FileEdit className="w-2.5 h-2.5" />
              Rascunho
            </Badge>
          )}

          {exercise.status === "archived" && (
            <Badge variant="outline" className="text-[10px] gap-1 py-0 px-1.5 text-muted-foreground border-dashed">
              <Archive className="w-2.5 h-2.5" />
              Arquivado
            </Badge>
          )}

          {exercise.reviewStatus === "pending" && (
            <Badge variant="outline" className="text-[10px] gap-1 py-0 px-1.5 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700">
              <AlertTriangle className="w-2.5 h-2.5" />
              Pendente de conciliação
            </Badge>
          )}
        </div>

        {/* Linha de Metadados Inspirada no Figma 11-biblioteca */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span>{primaryMuscle}</span>
          {lateralityLabel && (
            <>
              <span>·</span>
              <span>{lateralityLabel}</span>
            </>
          )}
          <span>·</span>
          {hasAvailableMedia ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ImageIcon className="w-3 h-3" />
              mídia disponível
            </span>
          ) : (
            <span className="text-muted-foreground/80">mídia pendente</span>
          )}
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}
