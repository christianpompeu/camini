"use client";

import React, { useState } from "react";
import { ArrowLeftRight, Check, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionExercise } from "@/store/useWorkoutStore";
import { useExerciseCatalogStore } from "@/store/useExerciseCatalogStore";

export interface ExerciseReplacerDialogProps {
  isOpen: boolean;
  targetExercise: SessionExercise | null;
  onClose: () => void;
  onConfirmReplacement: (
    oldExercise: SessionExercise,
    newExercise: {
      id: string;
      name: string;
      measurementType: "reps" | "duration" | "distance";
      loadConvention: "total" | "per_implement" | "additional" | "bodyweight";
      targetMuscles: string;
      reason: string;
    }
  ) => void;
}

const REPLACEMENT_REASONS = [
  "Equipamento ocupado",
  "Desconforto físico",
  "Variação de estímulo",
  "Sem equipamento disponível",
];

export function ExerciseReplacerDialog({
  isOpen,
  targetExercise,
  onClose,
  onConfirmReplacement,
}: ExerciseReplacerDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>(REPLACEMENT_REASONS[0]);
  const [selectedReplacementId, setSelectedReplacementId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { exercises } = useExerciseCatalogStore();

  if (!targetExercise) return null;

  // Filtrar alternativas compatíveis no catálogo (excluindo o atual)
  const candidateExercises = exercises
    .filter((ex) => ex.id !== targetExercise.definitionId)
    .filter((ex) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.targetMuscles?.toLowerCase().includes(q) ||
        ex.equipment.some((eq) => eq.toLowerCase().includes(q))
      );
    });

  const selectedExercise = candidateExercises.find((e) => e.id === selectedReplacementId);

  const handleConfirm = () => {
    if (!selectedExercise) return;
    onConfirmReplacement(targetExercise, {
      id: selectedExercise.id,
      name: selectedExercise.name,
      measurementType: selectedExercise.measurementType,
      loadConvention: selectedExercise.loadConvention,
      targetMuscles: selectedExercise.targetMuscles || selectedExercise.primaryMuscles?.join(", ") || "",
      reason: selectedReason,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95vw] rounded-2xl p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="text-left pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <ArrowLeftRight className="w-4 h-4 text-zinc-950 dark:text-white" />
            <span>Substituição Pontual</span>
          </div>
          <DialogTitle className="text-xl font-bold text-zinc-950 dark:text-white pt-0.5">
            Trocar exercício hoje
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Substitua <strong className="text-zinc-900 dark:text-white">{targetExercise.name}</strong> apenas na sessão atual. Sua ficha de referência não será alterada.
          </DialogDescription>
        </DialogHeader>

        {/* Motivo da Substituição */}
        <section className="space-y-1.5 pt-2">
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Motivo da substituição
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {REPLACEMENT_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={`py-2 px-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                  selectedReason === reason
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-2xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </section>

        {/* Busca e Lista de Exercícios Alternativos */}
        <section className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Selecione o exercício substituto
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar exercício alternativo..."
              className="pl-9 h-9 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/60"
            />
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {candidateExercises.slice(0, 15).map((cand) => {
              const isSelected = cand.id === selectedReplacementId;

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedReplacementId(cand.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-50 dark:border-white dark:bg-zinc-800"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div>
                    <h5 className="font-semibold text-zinc-900 dark:text-white">{cand.name}</h5>
                    <p className="text-[11px] text-zinc-500">{cand.targetMuscles || cand.equipment.join(", ")}</p>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Rodapé com Ações */}
        <div className="pt-2 flex flex-col gap-2">
          <Button
            type="button"
            disabled={!selectedReplacementId}
            onClick={handleConfirm}
            className="w-full bg-zinc-950 hover:bg-black text-white dark:bg-white dark:text-zinc-950 font-semibold rounded-xl h-11"
          >
            Confirmar Substituição
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full text-xs text-zinc-500 h-8"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
