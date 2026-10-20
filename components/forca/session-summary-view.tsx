"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, History, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { WorkoutSession, SessionExercise, SetRecord } from "@/store/useWorkoutStore";

export interface SessionSummaryViewProps {
  session: WorkoutSession;
  onSaveObservation: (observation: string) => void;
  onGoToHistory: (sessionId: string) => void;
  onGoHome: () => void;
}

export function SessionSummaryView({
  session,
  onSaveObservation,
  onGoToHistory,
  onGoHome,
}: SessionSummaryViewProps) {
  const [observation, setObservation] = useState(session.observation || "");
  const isComplete = session.status === "completed";

  // Calcular métricas
  const durationMinutes = session.durationMs ? Math.round(session.durationMs / 60000) : 40;
  
  let totalWorkSets = 0;
  let totalVolumeKg = 0;

  session.exercises.forEach((ex: SessionExercise) => {
    ex.sets.forEach((set: SetRecord) => {
      if (set.type !== "warmup") {
        totalWorkSets += 1;
        if (ex.measurementType === "reps" && ex.loadConvention !== "bodyweight") {
          totalVolumeKg += (set.weight || 0) * (set.reps || 0);
        }
      }
    });
  });

  const handleBlurObservation = () => {
    onSaveObservation(observation);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto w-full pb-20 animate-in fade-in duration-200">
      {/* Top Banner de Sucesso */}
      <section className="text-center pt-3 space-y-1.5" data-purpose="summary-header">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>{isComplete ? "Treino Completo" : "Treino Parcial Salvo"}</span>
        </div>

        <h1 className="text-[28px] font-extrabold tracking-tight text-zinc-950 dark:text-white leading-tight">
          Treino registrado.
        </h1>
        <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
          Treino {session.letter} · {session.title}
        </p>
      </section>

      {/* Grid de Métricas Principais */}
      <section className="grid grid-cols-3 gap-2 py-2" data-purpose="metrics-grid">
        <div className="bg-[#F5F5F7] dark:bg-zinc-900 rounded-2xl p-3 text-center border border-transparent dark:border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
            Duração
          </span>
          <span className="text-xl font-extrabold text-zinc-950 dark:text-white tabular-nums">
            {durationMinutes} min
          </span>
        </div>

        <div className="bg-[#F5F5F7] dark:bg-zinc-900 rounded-2xl p-3 text-center border border-transparent dark:border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
            Séries
          </span>
          <span className="text-xl font-extrabold text-zinc-950 dark:text-white tabular-nums">
            {totalWorkSets}
          </span>
        </div>

        <div className="bg-[#F5F5F7] dark:bg-zinc-900 rounded-2xl p-3 text-center border border-transparent dark:border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
            Volume Total
          </span>
          <span className="text-xl font-extrabold text-zinc-950 dark:text-white tabular-nums">
            {totalVolumeKg > 0 ? `${totalVolumeKg.toLocaleString("pt-BR")} kg` : "—"}
          </span>
        </div>
      </section>

      {/* Indicador de Persistência Local */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-[13px] font-semibold text-zinc-950 dark:text-white">
              Salvo neste aparelho
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Persistência local segura · Histórico atualizado
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-medium border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
          Offline-first
        </Badge>
      </section>

      {/* Campo de Observações do Treino */}
      <section className="space-y-1.5 pt-1">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Como foi o treino de hoje? (Opcional)
        </label>
        <Textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          onBlur={handleBlurObservation}
          placeholder="Ex: Carga do agachamento confortável, atenção à pegada no levantamento romeno..."
          className="rounded-xl resize-none text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 min-h-[80px]"
        />
      </section>

      {/* Ações Principais */}
      <section className="pt-3 space-y-2.5">
        <button
          type="button"
          onClick={() => onGoToHistory(session.id)}
          className="w-full py-4 bg-zinc-900 hover:bg-black active:bg-black text-white font-semibold rounded-2xl text-[15px] shadow-sm transition-all duration-150 text-center active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
        >
          <History className="w-4 h-4" />
          <span>Ver detalhes no histórico</span>
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="w-full py-3.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-900 dark:text-zinc-100 font-medium rounded-2xl text-[15px] transition-colors text-center active:bg-zinc-50 dark:active:bg-zinc-800 cursor-pointer flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Voltar ao início</span>
        </button>
      </section>
    </div>
  );
}
