"use client";

import React from "react";
import { ArrowRight, Calendar, Layers, CheckCircle2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkoutDef } from "@/app/forca/page";
import { WorkoutPlan } from "@/types/workout-plan";

export interface TodayDashboardViewProps {
  currentDateFormatted: string;
  activePlan: WorkoutPlan | null;
  suggestedWorkout: WorkoutDef;
  hasActiveSession: boolean;
  activeSessionLetter?: string;
  activeSessionTitle?: string;
  totalCompletedWorkouts: number;
  lastCompletedDate?: string;
  onOpenWorkoutPreview: (workout: WorkoutDef) => void;
  onResumeSession: () => void;
  onOpenPlans: () => void;
  onOpenSchedule: () => void;
  onOpenDownloads: () => void;
  onOpenSettings: () => void;
}

export function TodayDashboardView({
  currentDateFormatted,
  activePlan,
  suggestedWorkout,
  hasActiveSession,
  activeSessionLetter,
  activeSessionTitle,
  totalCompletedWorkouts,
  lastCompletedDate,
  onOpenWorkoutPreview,
  onResumeSession,
  onOpenPlans,
  onOpenSchedule,
  onOpenDownloads,
  onOpenSettings,
}: TodayDashboardViewProps) {
  return (
    <div className="space-y-4 max-w-md mx-auto w-full animate-in fade-in duration-200">
      {/* Top Application Bar Demarcation */}
      <header className="flex justify-between items-center pt-2 pb-1" data-purpose="header-navigation">
        <div className="flex items-center space-x-1.5 text-base tracking-tight font-medium">
          <span className="font-normal text-zinc-700 dark:text-zinc-300">camini</span>
          <span className="text-zinc-400 font-light">/</span>
          <span className="font-bold tracking-wide text-zinc-950 dark:text-white">FORÇA</span>
        </div>
        <button
          onClick={onOpenSettings}
          className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer"
          data-purpose="settings-button"
          type="button"
        >
          Ajustes
        </button>
      </header>

      {/* Date & Greeting Header */}
      <section className="pt-2 mb-2" data-purpose="header-section">
        <p className="text-[12px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase mb-1 select-none">
          {currentDateFormatted}
        </p>
        <h1 className="text-[28px] font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight">
          Vamos ao treino?
        </h1>
        <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
          Seu programa de força · {activePlan ? activePlan.name : "A–E"}
        </p>
      </section>

      {/* Banner Seção Ativa (se houver treino em andamento) */}
      {hasActiveSession && (
        <article
          onClick={onResumeSession}
          className="bg-emerald-600 text-white rounded-2xl p-4 transition-transform active:scale-[0.99] cursor-pointer shadow-sm relative overflow-hidden flex items-center justify-between"
          data-purpose="active-session-resumption-banner"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <p className="text-[11px] font-bold tracking-wider uppercase opacity-90">Sessão em andamento</p>
            </div>
            <h2 className="text-[17px] font-bold tracking-tight">
              Treino {activeSessionLetter}: {activeSessionTitle}
            </h2>
            <p className="text-[12px] opacity-85">Toque para continuar registrando suas séries</p>
          </div>
          <Button size="sm" variant="secondary" className="rounded-xl font-semibold text-xs h-8 bg-white text-emerald-800 hover:bg-emerald-50">
            Continuar
          </Button>
        </article>
      )}

      {/* Card 1: Light Gray Info (Seu ritmo, sua sequência) */}
      <article
        className="bg-[#F5F5F7] dark:bg-zinc-900 border border-transparent dark:border-zinc-800/80 rounded-2xl p-4 transition-colors"
        data-purpose="routine-info-card"
      >
        <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Seu ritmo, sua sequência
        </h2>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
          A/B/C principais · D técnico · E complementar
        </p>
      </article>

      {/* Card 2: Featured Dark Hero (Treino Sugerido do Ciclo) */}
      <article
        onClick={() => onOpenWorkoutPreview(suggestedWorkout)}
        className="bg-[#18181A] text-white rounded-2xl p-5 relative overflow-hidden shadow-sm active:scale-[0.99] transition-transform cursor-pointer group"
        data-purpose="featured-workout-card"
      >
        <div className="relative z-10 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tighter text-white inline-block">
                {suggestedWorkout.letter}
              </span>
              <span className="text-[19px] font-bold tracking-tight text-white">
                {suggestedWorkout.title}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
          </div>
          <p className="text-[13px] text-zinc-300 font-normal">
            {suggestedWorkout.exerciseCount} exercícios · {suggestedWorkout.estimatedMinutes} min estimado
          </p>
          <p className="text-[12px] text-zinc-400 font-normal pt-1">
            Foco: {suggestedWorkout.focus}
          </p>
        </div>
      </article>

      {/* Card 3: Planejar a semana (Bordered) */}
      <article
        onClick={onOpenSchedule}
        className="border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 active:bg-zinc-50 dark:active:bg-zinc-800/60 transition-colors cursor-pointer flex items-center justify-between"
        data-purpose="action-card-plan"
      >
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Planejar a semana
          </h2>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
            Distribua sessões e dias de descanso.
          </p>
        </div>
        <Calendar className="w-5 h-5 text-zinc-400 shrink-0 ml-2" />
      </article>

      {/* Card 4: Minhas fichas (Bordered) */}
      <article
        onClick={onOpenPlans}
        className="border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 active:bg-zinc-50 dark:active:bg-zinc-800/60 transition-colors cursor-pointer flex items-center justify-between"
        data-purpose="action-card-routines"
      >
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Minhas fichas
          </h2>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
            Revise o programa A–E e suas versões.
          </p>
        </div>
        <Layers className="w-5 h-5 text-zinc-400 shrink-0 ml-2" />
      </article>

      {/* Card 5: Sua evolução (Light Gray) */}
      <article
        className="bg-[#F5F5F7] dark:bg-zinc-900 border border-transparent dark:border-zinc-800/80 rounded-2xl p-4"
        data-purpose="evolution-info-card"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {totalCompletedWorkouts > 0 ? "Sua consistência" : "Sua evolução começa aqui"}
            </h2>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
              {totalCompletedWorkouts > 0
                ? `${totalCompletedWorkouts} sessões registradas com sucesso${lastCompletedDate ? ` · Última: ${lastCompletedDate}` : ""}.`
                : "Nenhuma sessão real registrada ainda neste aparelho."}
            </p>
          </div>
          {totalCompletedWorkouts > 0 ? (
            <Flame className="w-5 h-5 text-amber-500 shrink-0 ml-2" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-zinc-400 shrink-0 ml-2" />
          )}
        </div>
      </article>

      {/* Main Actions Section */}
      <section className="pt-2 space-y-2.5 pb-4" data-purpose="main-actions">
        {/* Primary Action Button */}
        <button
          onClick={() => onOpenWorkoutPreview(suggestedWorkout)}
          className="w-full bg-[#18181A] hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-[15px] py-3.5 px-4 rounded-xl text-center active:scale-[0.99] transition shadow-xs cursor-pointer select-none"
          data-purpose="start-workout-button"
          type="button"
        >
          Ver Treino {suggestedWorkout.letter}
        </button>

        {/* Secondary Action Button */}
        <button
          onClick={onOpenDownloads}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-[15px] py-3.5 px-4 rounded-xl text-center active:bg-zinc-50 dark:active:bg-zinc-800/80 active:scale-[0.99] transition cursor-pointer select-none"
          data-purpose="downloads-button"
          type="button"
        >
          Offline e downloads
        </button>
      </section>
    </div>
  );
}
