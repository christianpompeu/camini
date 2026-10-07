"use client";

import React, { useState } from "react";
import { Check, Flame, RotateCcw, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NumberStepper } from "@/components/forca/number-stepper";
import { RirSelector } from "@/components/forca/rir-selector";

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
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isCompleted
          ? "bg-muted/30 border-primary/40 shadow-sm"
          : "bg-card border-border shadow-sm"
      } ${className}`}
    >
      {/* Top Banner de destaque de série */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
            Série {currentSet} de {totalSets}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight mt-0.5">
            {exerciseName}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{targetMuscles}</p>
        </div>

        <Badge
          variant={isCompleted ? "default" : "secondary"}
          className="font-semibold text-xs"
        >
          {isCompleted ? "Concluída" : "Ativa"}
        </Badge>
      </div>

      {/* Grid de Métricas Principais - Otimizado para Leitura Rápida */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Carga */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col items-center justify-center">
            <NumberStepper
              label="Carga"
              value={weight}
              unit="kg"
              onDecrement={() => setWeight((w) => Math.max(0, w - 2))}
              onIncrement={() => setWeight((w) => w + 2)}
            />
          </div>

          {/* Repetições */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col items-center justify-center">
            <NumberStepper
              label="Repetições"
              value={reps}
              unit="reps"
              onDecrement={() => setReps((r) => Math.max(1, r - 1))}
              onIncrement={() => setReps((r) => r + 1)}
            />
          </div>
        </div>

        {/* Seletor RIR (Reps in Reserve / Esforço) */}
        <RirSelector
          value={rir}
          onChange={setRir}
        />

        {/* Ação Concluir Série */}
        <div className="pt-1">
          {!isCompleted ? (
            <Button
              variant="default"
              size="lg"
              onClick={handleComplete}
              className="w-full font-bold tracking-wide h-12 gap-2 text-sm shadow-xs"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              Concluir série {currentSet}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-12 px-4 rounded-md bg-primary/10 border border-primary/20 text-foreground font-semibold flex items-center justify-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary stroke-[3]" />
                Série {currentSet} Registrada!
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                aria-label="Reabrir série"
                className="h-12 w-12 shrink-0"
                title="Reabrir série"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
