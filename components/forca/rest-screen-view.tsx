"use client";

import React from "react";
import { Play, Pause, Plus, ArrowRight, ShieldCheck, Copy, ListOrdered, BookOpen } from "lucide-react";

export interface RestScreenViewProps {
  exerciseName: string;
  nextSetNumber: number;
  totalSets: number;
  plannedWeight: number;
  plannedReps: number;
  measurementType?: "reps" | "duration" | "distance";
  timeRemainingFormatted: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onAdd30s: () => void;
  onSkipRest: () => void;
  onOpenSequence: () => void;
  onOpenLibrary: () => void;
}

export function RestScreenView({
  exerciseName,
  nextSetNumber,
  totalSets,
  plannedWeight,
  plannedReps,
  measurementType = "reps",
  timeRemainingFormatted,
  isPaused,
  onTogglePause,
  onAdd30s,
  onSkipRest,
  onOpenSequence,
  onOpenLibrary,
}: RestScreenViewProps) {
  const repsUnit = measurementType === "duration" ? "seg" : measurementType === "distance" ? "m" : "reps";

  return (
    <div className="space-y-4 max-w-md mx-auto w-full pb-20 animate-in fade-in duration-200">
      {/* Top Eyebrow & Status */}
      <section className="space-y-1 pt-1" data-purpose="rest-header">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-[11px] font-bold tracking-wider uppercase select-none">
            SÉRIE SALVA NESTE APARELHO
          </p>
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
          Respire. Recupere.
        </h1>
        <p className="text-[14px] text-zinc-600 dark:text-zinc-400">
          Próxima: série {nextSetNumber} de {totalSets} · {exerciseName}
        </p>
      </section>

      {/* Giant Countdown Clock Card */}
      <section
        className="bg-[#18181A] text-white rounded-3xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden"
        data-purpose="countdown-clock"
      >
        <div className="flex items-center justify-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {isPaused ? "Descanso Pausado" : "Descanso Ativo"}
          </span>
        </div>

        <div className="text-[64px] font-black tracking-tighter leading-none tabular-nums font-mono py-1 select-none">
          {timeRemainingFormatted}
        </div>

        {/* Controles de Cronômetro */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onTogglePause}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-all active:scale-95 cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            <span>{isPaused ? "Retomar" : "Pausar"}</span>
          </button>

          <button
            type="button"
            onClick={onAdd30s}
            className="flex items-center justify-center gap-1 px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>30s</span>
          </button>
        </div>
      </section>

      {/* 4 Cards Contextuais Durante o Descanso */}
      <section className="space-y-2.5 pt-1" data-purpose="rest-context-cards">
        {/* Card 1: A sessão continua salva */}
        <article className="bg-[#F5F5F7] dark:bg-zinc-900 border border-transparent dark:border-zinc-800/80 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
              A sessão continua salva
            </h3>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
              Você pode consultar a biblioteca ou histórico sem perder seu tempo.
            </p>
          </div>
        </article>

        {/* Card 2: Próxima série pré-carregada */}
        <article className="border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 flex items-start gap-3">
          <Copy className="w-5 h-5 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
              Próxima série pré-configurada
            </h3>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
              {plannedWeight} kg × {plannedReps} {repsUnit} · valores preservados da série anterior.
            </p>
          </div>
        </article>

        {/* Card 3: Sequência do treino */}
        <article
          onClick={onOpenSequence}
          className="border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <ListOrdered className="w-5 h-5 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <div>
              <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
                Sequência do treino
              </h3>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Veja os exercícios que vêm a seguir.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
        </article>

        {/* Card 4: Consultar um exercício */}
        <article
          onClick={onOpenLibrary}
          className="border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-zinc-500 dark:text-zinc-400 shrink-0" />
            <div>
              <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
                Consultar um exercício
              </h3>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Abra a biblioteca sem encerrar o descanso.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
        </article>
      </section>

      {/* Primary Action Button */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onSkipRest}
          className="w-full py-4 bg-zinc-900 hover:bg-black active:bg-black text-white font-semibold rounded-2xl text-[16px] shadow-sm transition-all duration-150 text-center active:scale-[0.99] cursor-pointer select-none flex items-center justify-center gap-2"
        >
          <span>Ir para próxima série</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
