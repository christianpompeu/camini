"use client";

import React, { useState } from "react";
import { Check, Flame, RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

export interface ActiveSetCardProps {
  exerciseName?: string;
  targetMuscles?: string;
  currentSet?: number;
  totalSets?: number;
  initialWeight?: number;
  initialReps?: number;
  initialRir?: number;
  onCompleteSet?: (data: { weight: number; reps: number; rir: number }) => void;
  className?: string;
}

export function ActiveSetCard({
  exerciseName = "Supino Inclinado com Halteres",
  targetMuscles = "Peitoral Superior & Deltoide Anterior",
  currentSet = 2,
  totalSets = 4,
  initialWeight = 32,
  initialReps = 8,
  initialRir = 2,
  onCompleteSet,
  className = "",
}: ActiveSetCardProps) {
  const [weight, setWeight] = useState(initialWeight);
  const [reps, setReps] = useState(initialReps);
  const [rir, setRir] = useState(initialRir);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    if (onCompleteSet) {
      onCompleteSet({ weight, reps, rir });
    }
  };

  const handleReset = () => {
    setIsCompleted(false);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        isCompleted
          ? "bg-energy-green/5 border-energy-green/40 shadow-lg shadow-energy-green/5"
          : "bg-surface-elevated border-outline shadow-xl shadow-surface-dark/5"
      } ${className}`}
    >
      {/* Top Banner de destaque de série */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline/50 bg-surface/40">
        <div>
          <span className="text-xs font-black tracking-wider uppercase text-energy-blue">
            SÉRIE {currentSet} DE {totalSets}
          </span>
          <h2 className="text-xl font-bold text-text-primary tracking-tight mt-0.5">
            {exerciseName}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">{targetMuscles}</p>
        </div>

        <Chip
          variant={isCompleted ? "success" : "energy"}
          size="sm"
          className="font-bold uppercase tracking-wider text-[11px]"
        >
          {isCompleted ? "Concluída" : "Ativa"}
        </Chip>
      </div>

      {/* Grid de Métricas Gigantes - Essencial para Legibilidade Durante Treino */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Carga */}
          <div className="p-4 rounded-lg bg-surface border border-outline/80 flex flex-col items-center justify-center relative">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Carga
            </span>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                {weight}
              </span>
              <span className="text-base font-semibold text-text-secondary">
                kg
              </span>
            </div>
            {/* Ajustes rápidos */}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setWeight((w) => Math.max(0, w - 2))}
                aria-label="Diminuir 2 kg"
                className="w-8 h-8 rounded-pill bg-surface-elevated border border-outline flex items-center justify-center text-text-primary hover:border-energy-blue tap-effect"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setWeight((w) => w + 2)}
                aria-label="Aumentar 2 kg"
                className="w-8 h-8 rounded-pill bg-surface-elevated border border-outline flex items-center justify-center text-text-primary hover:border-energy-blue tap-effect"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Repetições */}
          <div className="p-4 rounded-lg bg-surface border border-outline/80 flex flex-col items-center justify-center relative">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Repetições
            </span>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                {reps}
              </span>
              <span className="text-base font-semibold text-text-secondary">
                reps
              </span>
            </div>
            {/* Ajustes rápidos */}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setReps((r) => Math.max(1, r - 1))}
                aria-label="Diminuir 1 repetição"
                className="w-8 h-8 rounded-pill bg-surface-elevated border border-outline flex items-center justify-center text-text-primary hover:border-energy-blue tap-effect"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReps((r) => r + 1)}
                aria-label="Aumentar 1 repetição"
                className="w-8 h-8 rounded-pill bg-surface-elevated border border-outline flex items-center justify-center text-text-primary hover:border-energy-blue tap-effect"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Seletor RIR (Reps in Reserve / Esforço) */}
        <div className="mt-5 p-3.5 rounded-lg bg-surface/50 border border-outline/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-energy-coral" />
            <span className="text-xs font-semibold text-text-primary">
              RIR (Repetições na reserva):
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((val) => (
              <button
                key={val}
                onClick={() => setRir(val)}
                className={`w-9 h-9 rounded-pill font-bold text-xs transition-all tap-effect ${
                  rir === val
                    ? "bg-gradient-effort text-white shadow-sm scale-105"
                    : "bg-surface border border-outline text-text-secondary hover:text-text-primary"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Ação Concluir Série com Micro-Animação */}
        <div className="mt-6">
          {!isCompleted ? (
            <Button
              variant="energy"
              size="lg"
              fullWidth
              onClick={handleComplete}
              className="relative overflow-hidden font-bold tracking-wide shadow-xl shadow-energy-blue/25"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              Concluir série {currentSet}
            </Button>
          ) : (
            <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex-1 min-h-[56px] px-6 rounded-lg bg-energy-green/20 border border-energy-green/40 text-energy-green font-bold flex items-center justify-center gap-2">
                <Check className="w-5 h-5 stroke-[3]" />
                Série {currentSet} Registrada!
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleReset}
                aria-label="Reabrir série"
                className="min-w-[56px] px-3"
              >
                <RotateCcw className="w-5 h-5 text-text-secondary" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
