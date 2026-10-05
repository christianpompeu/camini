"use client";

import React from "react";
import { SkipForward, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FloatingWorkoutBarProps {
  currentExercise?: string;
  currentSet?: string;
  timerFormatted?: string;
  onNextAction?: () => void;
  className?: string;
}

export function FloatingWorkoutBar({
  currentExercise = "Supino Inclinado Halteres",
  currentSet = "Série 2/4",
  timerFormatted = "01:15",
  onNextAction,
  className = "",
}: FloatingWorkoutBarProps) {
  return (
    <aside
      aria-label="Barra de treino ativa"
      className={`bg-card/95 backdrop-blur-md border border-border shadow-md rounded-xl p-3.5 flex items-center justify-between gap-4 max-w-lg w-full ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Timer className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-foreground tracking-tight">
              {timerFormatted}
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold">
              {currentSet}
            </Badge>
          </div>
          <p className="text-xs font-medium text-muted-foreground truncate mt-0.5 max-w-[170px] sm:max-w-xs">
            {currentExercise}
          </p>
        </div>
      </div>

      <Button
        variant="default"
        size="sm"
        onClick={onNextAction}
        className="shrink-0 gap-1.5 h-8 text-xs font-semibold"
      >
        <SkipForward className="w-3.5 h-3.5" />
        <span>Próxima Ação</span>
      </Button>
    </aside>
  );
}
