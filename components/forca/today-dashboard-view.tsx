"use client";

import React from "react";
import { ArrowRight, Calendar, Layers, CheckCircle2, Flame, SlidersHorizontal, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkoutDef } from "@/app/forca/page";
import { WorkoutPlan } from "@/types/workout-plan";

export interface TodayDashboardViewProps {
  currentDateFormatted: string;
  activePlan: WorkoutPlan | null;
  suggestedWorkout: WorkoutDef;
  allWorkouts?: WorkoutDef[];
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
  onConfigureWorkout?: (workout: WorkoutDef) => void;
  onCreateNewPlanDraft?: () => void;
}

export function TodayDashboardView({
  currentDateFormatted,
  activePlan,
  suggestedWorkout,
  allWorkouts,
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
  onConfigureWorkout,
  onCreateNewPlanDraft,
}: TodayDashboardViewProps) {
  const displayWorkouts = allWorkouts && allWorkouts.length > 0 ? allWorkouts : [suggestedWorkout];

  return (
    <div className="space-y-4 max-w-md mx-auto w-full animate-in fade-in duration-200">
      {/* Top Application Bar Demarcation */}
      <header className="flex justify-between items-center pt-2 pb-1" data-purpose="header-navigation">
        <div className="flex items-center space-x-1.5 text-base tracking-tight font-medium">
          <span className="font-normal text-zinc-700 dark:text-zinc-300">camini</span>
          <span className="text-zinc-400 font-light">/</span>
          <span className="font-bold tracking-wide text-zinc-950 dark:text-white">FORÇA</span>
        </div>
        <div className="flex items-center gap-3">
          {onOpenDownloads && (
            <button
              onClick={onOpenDownloads}
              className="text-xs font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              type="button"
            >
              Offline
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer"
            data-purpose="settings-button"
            type="button"
          >
            Ajustes
          </button>
        </div>
      </header>

      {/* Date & Greeting Header */}
      <section className="pt-2 mb-1" data-purpose="header-section">
        <p className="text-[12px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase mb-1 select-none">
          {currentDateFormatted}
        </p>
        <h1 className="text-[28px] font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight">
          Vamos ao treino?
        </h1>
        <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">
          {activePlan ? `Ficha ativa: ${activePlan.name} (v${activePlan.version})` : "Programa de referência A–E"}
        </p>
      </section>

      {/* Status da Ficha & Configuração do Treino */}
      {activePlan ? (
        <section className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 border-emerald-500/40">
                Versão {activePlan.version} Ativa
              </Badge>
              <h3 className="font-bold text-sm text-zinc-950 dark:text-white">
                {activePlan.name}
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {activePlan.goal || "Prescrição personalizada"} · {activePlan.divisions.length} divisões
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenPlans}
              className="text-xs font-semibold h-8 rounded-xl border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-zinc-600 dark:text-zinc-300" />
              Configurar Ficha
            </Button>
          </div>
        </section>
      ) : (
        <section className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10">
                Treinos Provisórios A–E
              </Badge>
              <h3 className="font-bold text-sm text-zinc-950 dark:text-white">
                Prescrição de Referência
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Quer alterar exercícios, repetições ou descanso? Personalize sua própria ficha.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              size="sm"
              onClick={onCreateNewPlanDraft || onOpenPlans}
              className="text-xs font-semibold h-8 bg-zinc-950 hover:bg-black text-white dark:bg-white dark:text-zinc-950 rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Personalizar treinos
            </Button>
          </div>
        </section>
      )}

      {/* Banner Sessão Ativa (se houver treino em andamento) */}
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

      {/* Hero: Treino Sugerido para Hoje */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Treino Sugerido para Hoje
          </span>
          <span className="text-xs text-zinc-400">Próximo da sequência</span>
        </div>

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
      </section>

      {/* TODOS OS TREINOS DO SEU PROGRAMA (Aparecem todos os treinos da ficha!) */}
      <section className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-zinc-950 dark:text-white tracking-tight">
              Todos os Treinos da Ficha
            </h2>
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-semibold text-zinc-500 border-zinc-300 dark:border-zinc-700">
              {displayWorkouts.length} divisões
            </Badge>
          </div>
          <button
            type="button"
            onClick={onOpenPlans}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            Ver fichas
          </button>
        </div>

        <div className="space-y-2">
          {displayWorkouts.map((w) => {
            const isSuggested = w.letter === suggestedWorkout.letter;
            const isRunning = hasActiveSession && activeSessionLetter === w.letter;

            return (
              <article
                key={w.letter + (w.title || "")}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isRunning
                    ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : isSuggested
                    ? "border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40"
                    : "border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                }`}
              >
                <div
                  onClick={() => onOpenWorkoutPreview(w)}
                  className="flex items-start sm:items-center gap-3 flex-1 cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    {w.letter}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-bold text-zinc-950 dark:text-white">
                        Treino {w.letter}: {w.title}
                      </h3>
                      {isRunning && (
                        <Badge variant="outline" className="text-[9px] h-3.5 px-1 border-emerald-500 text-emerald-600 animate-pulse">
                          Ativo
                        </Badge>
                      )}
                      {isSuggested && !isRunning && (
                        <Badge variant="secondary" className="text-[9px] h-3.5 px-1 font-semibold">
                          Hoje
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {w.exerciseCount} exercícios · ~{w.estimatedMinutes} min · {w.focus}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0 justify-end">
                  {onConfigureWorkout && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onConfigureWorkout(w)}
                      className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white h-8 rounded-xl px-2.5"
                    >
                      Configurar
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenWorkoutPreview(w)}
                    className="text-xs font-semibold h-8 rounded-xl px-3 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Ver Treino
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Cards de Navegação Rápida (Minhas Fichas / Planejar Semana) */}
      <section className="grid grid-cols-2 gap-2.5 pt-1">
        <article
          onClick={onOpenPlans}
          className="border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 bg-white dark:bg-zinc-900 active:bg-zinc-50 dark:active:bg-zinc-800/60 transition-colors cursor-pointer flex flex-col justify-between space-y-2 group"
          data-purpose="action-card-routines"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Fichas</span>
            <Layers className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-zinc-950 dark:text-white tracking-tight">
              Minhas Fichas
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Criar, editar e versionar treinos
            </p>
          </div>
        </article>

        <article
          onClick={onOpenSchedule}
          className="border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 bg-white dark:bg-zinc-900 active:bg-zinc-50 dark:active:bg-zinc-800/60 transition-colors cursor-pointer flex flex-col justify-between space-y-2 group"
          data-purpose="action-card-plan"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Agenda</span>
            <Calendar className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-zinc-950 dark:text-white tracking-tight">
              Planejar Semana
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Distribuição semanal e descanso
            </p>
          </div>
        </article>
      </section>

      {/* Card de Evolução & Consistência */}
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

      {/* Ações Inferiores */}
      <section className="pt-2 space-y-2.5 pb-4" data-purpose="main-actions">
        <button
          onClick={() => onOpenWorkoutPreview(suggestedWorkout)}
          className="w-full bg-[#18181A] hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-[15px] py-3.5 px-4 rounded-xl text-center active:scale-[0.99] transition shadow-xs cursor-pointer select-none"
          data-purpose="start-workout-button"
          type="button"
        >
          Ver Treino {suggestedWorkout.letter}
        </button>

        <button
          onClick={onOpenPlans}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-[15px] py-3.5 px-4 rounded-xl text-center active:bg-zinc-50 dark:active:bg-zinc-800/80 active:scale-[0.99] transition cursor-pointer select-none"
          data-purpose="manage-plans-button"
          type="button"
        >
          Gerenciar e Criar Fichas
        </button>
      </section>
    </div>
  );
}
