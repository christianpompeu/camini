"use client";

import React from "react";
import { CheckCircle2, Circle, ArrowLeftRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionExercise } from "@/store/useWorkoutStore";

export interface WorkoutSequenceModalProps {
  isOpen: boolean;
  workoutLetter: string;
  workoutTitle: string;
  exercises: SessionExercise[];
  activeIndex: number;
  onClose: () => void;
  onSelectExercise: (index: number) => void;
  onRequestReplaceExercise: (exercise: SessionExercise) => void;
  onRequestFinish: () => void;
}

export function WorkoutSequenceModal({
  isOpen,
  workoutLetter,
  workoutTitle,
  exercises,
  activeIndex,
  onClose,
  onSelectExercise,
  onRequestReplaceExercise,
  onRequestFinish,
}: WorkoutSequenceModalProps) {
  const totalExercises = exercises.length;
  const completedExercisesCount = exercises.filter(
    (e) => (e.sets?.length || 0) >= e.expectedSets
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95vw] rounded-2xl p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="text-left pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Sequência da Sessão
            </span>
            <Badge variant="outline" className="text-xs font-semibold">
              {completedExercisesCount}/{totalExercises} concluídos
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-zinc-950 dark:text-white pt-1">
            Treino {workoutLetter} · {workoutTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Acompanhe o andamento ou substitua exercícios desta sessão.
          </DialogDescription>
        </DialogHeader>

        {/* Lista de Exercícios na Sessão */}
        <div className="space-y-2 py-3 max-h-[50vh] overflow-y-auto pr-1">
          {exercises.map((ex, idx) => {
            const isCurrent = idx === activeIndex;
            const completedSets = ex.sets?.length || 0;
            const isCompleted = completedSets >= ex.expectedSets;
            const isNext = idx === activeIndex + 1;

            return (
              <div
                key={ex.occurrenceId || ex.definitionId || idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? "border-zinc-950 bg-zinc-50/80 dark:border-white dark:bg-zinc-800/80"
                    : isCompleted
                    ? "border-zinc-200/80 bg-zinc-50/40 dark:border-zinc-800/60 dark:bg-zinc-900/40"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => {
                      onSelectExercise(idx);
                      onClose();
                    }}
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                  >
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="w-5 h-5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px] font-semibold text-zinc-950 dark:text-white">
                          {ex.name}
                        </h4>
                        {ex.isSubstitute && (
                          <Badge variant="secondary" className="text-[9px] h-3.5 px-1">
                            Substituto
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {isCompleted
                          ? `${completedSets} séries concluídas`
                          : isCurrent
                          ? `Em andamento · ${completedSets}/${ex.expectedSets} séries`
                          : isNext
                          ? `A seguir · ${ex.expectedSets} séries`
                          : `Pendente · ${ex.expectedSets} séries`}
                      </p>
                    </div>
                  </div>

                  {/* Ação de Substituição de Exercício */}
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => onRequestReplaceExercise(ex)}
                      title="Substituir exercício nesta sessão"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé do Modal */}
        <div className="pt-2 flex flex-col gap-2">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-zinc-950 hover:bg-black text-white dark:bg-white dark:text-zinc-950 font-semibold rounded-xl h-11"
          >
            Voltar para a série ativa
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onClose();
              onRequestFinish();
            }}
            className="w-full text-xs text-zinc-500 hover:text-rose-600 h-9"
          >
            Encerrar treino agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
