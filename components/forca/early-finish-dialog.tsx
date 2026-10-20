"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SessionExercise } from "@/store/useWorkoutStore";

export interface EarlyFinishDialogProps {
  isOpen: boolean;
  workoutLetter: string;
  workoutTitle: string;
  exercises: SessionExercise[];
  onClose: () => void;
  onConfirmSavePartial: () => void;
  onConfirmSaveComplete?: () => void;
  onConfirmDiscard: () => void;
}

export function EarlyFinishDialog({
  isOpen,
  workoutLetter,
  workoutTitle,
  exercises,
  onClose,
  onConfirmSavePartial,
  onConfirmSaveComplete,
  onConfirmDiscard,
}: EarlyFinishDialogProps) {
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  // Calcular totais
  let totalSetsLogged = 0;
  let totalSetsExpected = 0;
  const pendingExercises: Array<{ name: string; pendingSets: number }> = [];

  exercises.forEach((ex) => {
    const logged = ex.sets?.length || 0;
    totalSetsLogged += logged;
    totalSetsExpected += ex.expectedSets;
    if (logged < ex.expectedSets) {
      pendingExercises.push({
        name: ex.exerciseName || ex.name || "Exercício",
        pendingSets: ex.expectedSets - logged,
      });
    }
  });

  const isAllComplete = pendingExercises.length === 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsConfirmingDiscard(false);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md w-[95vw] rounded-2xl p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="text-left pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              isAllComplete
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-500"
            }`}
          >
            {isAllComplete ? "Meta Concluída" : "Encerramento Antecipado"}
          </span>
          <DialogTitle className="text-xl font-bold text-zinc-950 dark:text-white pt-0.5">
            {isAllComplete ? "Concluir treino?" : "Finalizar por hoje?"}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Treino {workoutLetter} · {workoutTitle}
          </DialogDescription>
        </DialogHeader>

        {isConfirmingDiscard ? (
          <div className="space-y-4 py-3 animate-in fade-in">
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs space-y-1">
              <p className="font-bold">Atenção: Ação irreversível!</p>
              <p>Todas as {totalSetsLogged} séries registradas nesta sessão serão permanentemente descartadas.</p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={onConfirmDiscard}
                className="w-full h-11 rounded-xl font-semibold"
              >
                Sim, descartar este treino
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmingDiscard(false)}
                className="w-full h-10 rounded-xl text-xs"
              >
                Voltar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-3">
            {/* Box com Métricas de Conclusão */}
            <div className="bg-[#F5F5F7] dark:bg-zinc-800/60 rounded-2xl p-4 text-center space-y-1">
              <div className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                {totalSetsLogged} de {totalSetsExpected}
              </div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                séries concluídas nesta sessão
              </p>
            </div>

            {/* Lista de Pendências */}
            {pendingExercises.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Exercícios ainda não concluídos:
                </span>
                <ul className="space-y-1 text-zinc-500 dark:text-zinc-400 pl-1">
                  {pendingExercises.map((p, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <span>
                        {p.name} ({p.pendingSets} {p.pendingSets === 1 ? "série restante" : "séries restantes"})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {isAllComplete
                ? "Todas as séries foram concluídas. A sessão será salva com status completo no seu histórico."
                : "Ao salvar, a sessão ficará registrada no seu histórico com a indicação Treino Parcial, mantendo íntegro todo o seu progresso."}
            </p>

            {/* Ações */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="button"
                onClick={isAllComplete ? (onConfirmSaveComplete || onConfirmSavePartial) : onConfirmSavePartial}
                className="w-full bg-zinc-950 hover:bg-black text-white dark:bg-white dark:text-zinc-950 font-semibold rounded-xl h-11"
              >
                {isAllComplete ? "Salvar treino concluído" : "Salvar como treino parcial"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full rounded-xl h-10 text-xs font-semibold"
              >
                Continuar treinando
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsConfirmingDiscard(true)}
                className="w-full text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 h-8 mt-1"
              >
                Descartar treino...
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
