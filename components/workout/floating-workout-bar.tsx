"use client";

import React from "react";
import { Play, SkipForward, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className={`glass-surface rounded-xl p-3.5 flex items-center justify-between gap-4 max-w-lg w-full tap-effect ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-pill bg-energy-blue/15 border border-energy-blue/30 flex items-center justify-center shrink-0">
          <Timer className="w-5 h-5 text-energy-blue" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-text-primary tracking-tight">
              {timerFormatted}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-pill bg-energy-blue text-white">
              {currentSet}
            </span>
          </div>
          <p className="text-xs font-medium text-text-secondary truncate mt-0.5 max-w-[170px] sm:max-w-xs">
            {currentExercise}
          </p>
        </div>
      </div>

      <Button
        variant="energy"
        size="sm"
        onClick={onNextAction}
        className="shrink-0 shadow-sm"
      >
        <SkipForward className="w-4 h-4" />
        <span className="hidden sm:inline">Próxima</span> Ação
      </Button>
    </aside>
  );
}
