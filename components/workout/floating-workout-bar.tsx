"use client";

import React from "react";
import { ArrowRight, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingWorkoutBarProps {
  workoutLetter?: string;
  currentExercise?: string;
  currentSet?: string;
  timerFormatted?: string;
  isTimerRunning?: boolean;
  onReturnToWorkout?: () => void;
  className?: string;
}

export function FloatingWorkoutBar({
  workoutLetter,
  currentExercise = "Agachamento Goblet",
  currentSet = "Série 2/4",
  timerFormatted = "01:15",
  isTimerRunning = false,
  onReturnToWorkout,
  className = "",
}: FloatingWorkoutBarProps) {
  return (
    <aside
      aria-label="Barra de treino ativa"
      onClick={onReturnToWorkout}
      className={cn(
        "fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm sm:max-w-md bg-[#18181A] text-white rounded-2xl p-3.5 shadow-xl border border-zinc-800/90 z-30 flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-all select-none",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-zinc-800 text-white flex items-center justify-center shrink-0">
          <Timer className={cn("w-4 h-4", isTimerRunning && "text-emerald-400 animate-pulse")} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-white tracking-tight tabular-nums">
              {isTimerRunning ? `Descanso: ${timerFormatted}` : timerFormatted}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 font-semibold text-zinc-300">
              {currentSet}
            </span>
          </div>
          <p className="text-xs text-zinc-400 truncate mt-0.5 max-w-[190px] sm:max-w-xs">
            {workoutLetter ? `Treino ${workoutLetter} · ` : ""}
            {currentExercise}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReturnToWorkout?.();
        }}
        className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-xs transition-colors"
      >
        <span>Treino</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}

