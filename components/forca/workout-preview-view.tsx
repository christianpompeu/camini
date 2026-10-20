"use client";

import React from "react";
import { ArrowLeft, Clock, Dumbbell, Play, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WorkoutDef } from "@/app/forca/page";

export interface WorkoutPreviewViewProps {
  workout: WorkoutDef;
  onBack: () => void;
  onStart: (workout: WorkoutDef) => void;
  onViewExerciseDetails?: (exerciseId: string) => void;
  onConfigure?: (workout: WorkoutDef) => void;
}

export function WorkoutPreviewView({
  workout,
  onBack,
  onStart,
  onViewExerciseDetails,
  onConfigure,
}: WorkoutPreviewViewProps) {
  return (
    <div className="space-y-4 max-w-md mx-auto w-full pb-8 animate-in fade-in duration-200">
      {/* Top Bar with Back Button */}
      <header className="flex items-center gap-3 pt-2 pb-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar para Hoje"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Ficha de Referência
          </p>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Treino {workout.letter} · {workout.title}
          </h1>
        </div>
      </header>

      {/* Hero Card da Divisão */}
      <section className="bg-[#18181A] text-white rounded-2xl p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold tracking-tighter text-white">
            {workout.letter}
          </span>
          <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-300">
            {workout.exerciseCount} exercícios
          </Badge>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white">{workout.title}</h2>
        <p className="text-xs text-zinc-300">{workout.focus}</p>
        <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>~{workout.estimatedMinutes} minutos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Foco Força e Core</span>
          </div>
        </div>
      </section>

      {/* Lista de Exercícios Prescritos */}
      <section className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Sequência prescrita
          </h3>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Toque no exercício para dicas
          </span>
        </div>

        <div className="space-y-2">
          {workout.exercises.map((ex, idx) => (
            <article
              key={ex.id || idx}
              onClick={() => onViewExerciseDetails?.(ex.id)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="space-y-0.5">
                  <h4 className="text-[14px] font-semibold text-zinc-950 dark:text-white group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                    {ex.name}
                  </h4>
                  <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
                    {ex.expectedSets} séries ·{" "}
                    {ex.measurementType === "duration"
                      ? "45–90s por série"
                      : ex.measurementType === "distance"
                      ? "20–40m por série"
                      : "5–8 repetições"}
                  </p>
                </div>
              </div>
              <Info className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 shrink-0 ml-2" />
            </article>
          ))}
        </div>
      </section>

      {/* Botão de Iniciar Treino Fixo */}
      <div className="pt-4 sticky bottom-16 sm:bottom-20 z-20 space-y-2">
        <button
          type="button"
          onClick={() => onStart(workout)}
          className="w-full bg-[#18181A] hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-[16px] py-4 px-6 rounded-2xl text-center active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Iniciar Treino {workout.letter}</span>
        </button>

        {onConfigure && (
          <button
            type="button"
            onClick={() => onConfigure(workout)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-xs py-2.5 px-4 rounded-xl text-center transition cursor-pointer select-none"
          >
            Configurar ou alterar exercícios desta ficha
          </button>
        )}
      </div>
    </div>
  );
}
