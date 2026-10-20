"use client";

import React, { useState } from "react";
import { Check, Edit3, BookOpen, ChevronRight } from "lucide-react";
import { NumberStepper } from "@/components/forca/number-stepper";
import { RirSelector } from "@/components/forca/rir-selector";
import { Badge } from "@/components/ui/badge";
import { SessionExercise, SetRecord } from "@/store/useWorkoutStore";

export interface ActiveSessionViewProps {
  workoutLetter: string;
  workoutTitle: string;
  exerciseIndex: number;
  totalExercises: number;
  currentExercise: SessionExercise;
  currentSetNumber: number;
  isExtra?: boolean;
  draftWeight: number;
  draftReps: number;
  draftRir?: number;
  draftIsWarmup: boolean;
  draftIsExtra: boolean;
  lastCompletedSet: SetRecord | null;
  onUpdateDraft: (updates: {
    weight?: number;
    reps?: number;
    rir?: number;
    isWarmup?: boolean;
    isExtra?: boolean;
  }) => void;
  onCompleteSet: (data: {
    weight: number;
    reps: number;
    rir?: number;
    isWarmup: boolean;
    isExtra: boolean;
  }) => void;
  onOpenSequence: () => void;
  onOpenLibrary: () => void;
  onEditPreviousSet: (setRecord: SetRecord) => void;
  onEarlyFinishRequest?: () => void;
}

export function ActiveSessionView({
  workoutLetter,
  workoutTitle,
  exerciseIndex,
  totalExercises,
  currentExercise,
  currentSetNumber,
  draftWeight,
  draftReps,
  draftRir,
  draftIsWarmup,
  draftIsExtra,
  lastCompletedSet,
  onUpdateDraft,
  onCompleteSet,
  onOpenSequence,
  onOpenLibrary,
  onEditPreviousSet,
  onEarlyFinishRequest,
}: ActiveSessionViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      onCompleteSet({
        weight: draftWeight,
        reps: draftReps,
        rir: draftRir,
        isWarmup: draftIsWarmup,
        isExtra: draftIsExtra,
      });
    } finally {
      setTimeout(() => setIsSubmitting(false), 350);
    }
  };

  const isDuration = currentExercise.measurementType === "duration";
  const isDistance = currentExercise.measurementType === "distance";
  const isBodyweight = currentExercise.loadConvention === "bodyweight";

  const loadLabel =
    currentExercise.loadConvention === "per_implement"
      ? "Carga (por halter)"
      : currentExercise.loadConvention === "additional"
      ? "Carga adicional"
      : "Carga total";

  const repsLabel = isDuration
    ? "Tempo (segundos)"
    : isDistance
    ? "Distância (metros)"
    : "Repetições";

  const repsUnit = isDuration ? "s" : isDistance ? "m" : "reps";

  return (
    <div className="space-y-4 max-w-md mx-auto w-full pb-20 animate-in fade-in duration-200">
      {/* Exercise Header Meta */}
      <section className="space-y-1 pt-1" data-purpose="exercise-meta">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase select-none truncate max-w-[220px]">
            TREINO {workoutLetter}{workoutTitle ? ` · ${workoutTitle}` : ""} · {exerciseIndex + 1}/{totalExercises}
          </p>
          <div className="flex items-center gap-3">
            {onEarlyFinishRequest && (
              <button
                type="button"
                onClick={onEarlyFinishRequest}
                className="text-[11px] font-medium text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                Encerrar
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSequence}
              className="text-[12px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Ver sequência</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-zinc-950 dark:text-white">
          {currentExercise.name}
        </h1>

        <div className="flex items-center gap-2 pt-0.5">
          <p className="text-[15px] font-semibold text-zinc-700 dark:text-zinc-300">
            {draftIsExtra
              ? `Série extra #${currentSetNumber}`
              : draftIsWarmup
              ? `Série de aquecimento (${currentSetNumber} de ${currentExercise.expectedSets})`
              : `Série de trabalho ${currentSetNumber} de ${currentExercise.expectedSets}`}
          </p>
          {draftIsExtra && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-zinc-400 text-zinc-800 dark:text-zinc-200">
              Extra
            </Badge>
          )}
        </div>

        {lastCompletedSet && (
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 pt-0.5">
            Última série: {lastCompletedSet.weight} kg ×{" "}
            {lastCompletedSet.reps || lastCompletedSet.durationSeconds || lastCompletedSet.distanceMeters || 0}{" "}
            {repsUnit}
            {lastCompletedSet.rir !== undefined ? ` · RIR ${lastCompletedSet.rir}` : ""}
          </p>
        )}
      </section>

      {/* Stepper de Carga (se não for peso corporal puro) */}
      {!isBodyweight && (
        <NumberStepper
          label={loadLabel}
          value={draftWeight}
          unit="kg"
          min={0}
          onDecrement={() => onUpdateDraft({ weight: Math.max(0, draftWeight - 1) })}
          onIncrement={() => onUpdateDraft({ weight: draftWeight + 1 })}
        />
      )}

      {/* Stepper de Repetições / Tempo / Distância */}
      <NumberStepper
        label={repsLabel}
        value={draftReps}
        unit={repsUnit}
        min={1}
        onDecrement={() =>
          onUpdateDraft({
            reps: Math.max(
              1,
              isDuration ? draftReps - 5 : isDistance ? draftReps - 5 : draftReps - 1
            ),
          })
        }
        onIncrement={() =>
          onUpdateDraft({
            reps: isDuration ? draftReps + 5 : isDistance ? draftReps + 5 : draftReps + 1,
          })
        }
      />

      {/* Seletor de RIR com 6 opções */}
      <RirSelector
        value={draftRir}
        onChange={(val) => onUpdateDraft({ rir: val })}
      />

      {/* Classificação de Série: Trabalho vs Aquecimento vs Série Extra */}
      <section
        className="flex items-center justify-between pt-1 pb-1 text-[13px] text-zinc-700 dark:text-zinc-300 font-medium px-1"
        data-purpose="set-classification"
      >
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onUpdateDraft({ isWarmup: false })}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer select-none"
          >
            <span className={!draftIsWarmup ? "font-bold text-zinc-950 dark:text-white" : "text-zinc-500"}>
              Trabalho
            </span>
            <span className="text-xs font-bold">{!draftIsWarmup ? "✓" : "○"}</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateDraft({ isWarmup: true })}
            className="flex items-center gap-1.5 focus:outline-none cursor-pointer select-none"
          >
            <span className={draftIsWarmup ? "font-bold text-zinc-950 dark:text-white" : "text-zinc-500"}>
              Aquecimento
            </span>
            <span className="text-xs font-bold">{draftIsWarmup ? "✓" : "○"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onUpdateDraft({ isExtra: !draftIsExtra })}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {draftIsExtra ? "Remover Extra" : "+ Série Extra"}
        </button>
      </section>

      {/* Banner de Consulta à Biblioteca */}
      <section
        onClick={onOpenLibrary}
        className="border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 active:bg-zinc-50 dark:active:bg-zinc-800/60 transition-colors cursor-pointer flex items-center justify-between"
        data-purpose="library-banner"
      >
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-950 dark:text-white tracking-tight leading-snug">
            Consultar biblioteca
          </h3>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
            Dicas e mídias de execução do exercício.
          </p>
        </div>
        <BookOpen className="w-5 h-5 text-zinc-400 shrink-0 ml-2" />
      </section>

      {/* Resumo da Série Anterior com Ação Direta de Edição */}
      {lastCompletedSet && (
        <section
          className="flex items-center justify-between text-[13px] text-zinc-700 dark:text-zinc-300 px-2 py-1 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60"
          data-purpose="previous-set-summary"
        >
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-zinc-400">
              #{currentExercise.sets.length}
            </span>
            <span className="font-semibold text-zinc-900 dark:text-white">
              {lastCompletedSet.weight} kg
            </span>
            <span>
              {lastCompletedSet.reps || lastCompletedSet.durationSeconds || lastCompletedSet.distanceMeters}{" "}
              {repsUnit}
            </span>
            {lastCompletedSet.rir !== undefined && (
              <span className="text-zinc-500 text-xs">RIR {lastCompletedSet.rir}</span>
            )}
            {lastCompletedSet.type === "warmup" && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0">
                Aquec.
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={() => onEditPreviousSet(lastCompletedSet)}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </section>
      )}

      {/* Sticky Bottom Actions */}
      <div className="pt-3 space-y-2.5">
        <button
          type="button"
          onClick={handleComplete}
          disabled={isSubmitting}
          className="w-full py-4 bg-zinc-900 hover:bg-black active:bg-black text-white font-semibold rounded-2xl text-[16px] shadow-sm transition-all duration-150 text-center active:scale-[0.99] cursor-pointer select-none flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Concluir série</span>
        </button>

        <button
          type="button"
          onClick={onOpenSequence}
          className="w-full py-3.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-zinc-900 dark:text-zinc-100 font-medium rounded-2xl text-[15px] transition-colors text-center active:bg-zinc-50 dark:active:bg-zinc-800 cursor-pointer select-none"
        >
          Ver sequência / finalizar
        </button>
      </div>
    </div>
  );
}
