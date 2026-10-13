"use client";

import React, { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { NumberStepper } from "@/components/forca/number-stepper";
import { RirSelector } from "@/components/forca/rir-selector";

export interface ActiveSetCardProps {
  exerciseName?: string;
  targetMuscles?: string;
  currentSet?: number;
  totalSets?: number;
  weight?: number;
  reps?: number;
  rir?: number;
  isWarmup?: boolean;
  isExtra?: boolean;
  onDraftChange?: (draft: {
    weight: number;
    reps: number;
    rir?: number;
    isWarmup: boolean;
    isExtra?: boolean;
  }) => void;
  onCompleteSet?: (data: {
    weight: number;
    reps: number;
    rir?: number;
    isWarmup: boolean;
    isExtra?: boolean;
  }) => void;
  className?: string;
  measurementType?: "reps" | "duration" | "distance";
  loadConvention?: "total" | "per_implement" | "additional" | "bodyweight";
}

export function ActiveSetCard({
  exerciseName = "Supino Inclinado com Halteres",
  targetMuscles = "Peitoral Superior & Deltoide Anterior",
  currentSet = 2,
  totalSets = 4,
  weight = 32,
  reps = 8,
  rir,
  isWarmup = false,
  isExtra = false,
  onDraftChange,
  onCompleteSet,
  className = "",
  measurementType = "reps",
  loadConvention = "total",
}: ActiveSetCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = (
    updates: Partial<{
      weight: number;
      reps: number;
      rir?: number;
      isWarmup: boolean;
      isExtra: boolean;
    }>
  ) => {
    if (onDraftChange) {
      onDraftChange({
        weight,
        reps,
        rir,
        isWarmup,
        isExtra,
        ...updates,
      });
    }
  };

  const handleComplete = () => {
    if (isCompleted || isSubmitting) return;
    setIsSubmitting(true);
    setIsCompleted(true);
    try {
      if (onCompleteSet) {
        onCompleteSet({ weight, reps, rir, isWarmup, isExtra });
      }
    } finally {
      setTimeout(() => setIsSubmitting(false), 300);
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
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
              {isExtra ? `Série Extra #${currentSet}` : `Série ${currentSet} de ${totalSets}`}
            </span>
            {isExtra && (
              <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/40 text-primary">
                Extra
              </Badge>
            )}
          </div>
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

      {/* Grid de Métricas Principais */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className={`grid grid-cols-1 ${loadConvention !== "bodyweight" ? "sm:grid-cols-2" : ""} gap-4`}>
          {/* Carga */}
          {loadConvention !== "bodyweight" && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col items-center justify-center">
              <NumberStepper
                label={
                  loadConvention === "per_implement"
                    ? "Carga (Halter)"
                    : loadConvention === "additional"
                    ? "Carga Adicional"
                    : "Carga Total"
                }
                value={weight}
                unit="kg"
                onDecrement={() => handleUpdate({ weight: Math.max(0, weight - 1) })}
                onIncrement={() => handleUpdate({ weight: weight + 1 })}
              />
            </div>
          )}

          {/* Repetições, Duração ou Distância */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border flex flex-col items-center justify-center">
            <NumberStepper
              label={
                measurementType === "duration"
                  ? "Tempo (segundos)"
                  : measurementType === "distance"
                  ? "Distância (metros)"
                  : "Repetições"
              }
              value={reps}
              unit={measurementType === "duration" ? "seg" : measurementType === "distance" ? "m" : "reps"}
              onDecrement={() =>
                handleUpdate({
                  reps: Math.max(
                    1,
                    measurementType === "duration"
                      ? reps - 5
                      : measurementType === "distance"
                      ? reps - 5
                      : reps - 1
                  ),
                })
              }
              onIncrement={() =>
                handleUpdate({
                  reps:
                    measurementType === "duration"
                      ? reps + 5
                      : measurementType === "distance"
                      ? reps + 5
                      : reps + 1,
                })
              }
            />
          </div>
        </div>

        {/* Tipo de Série & Seletor RIR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Série de Aquecimento?</span>
              <span className="text-[11px] text-muted-foreground">Não soma no volume total de trabalho</span>
            </div>
            <Switch
              checked={isWarmup}
              onCheckedChange={(checked) => handleUpdate({ isWarmup: checked })}
              aria-label="Alternar aquecimento"
            />
          </div>

          <div className="flex items-center justify-between px-1 pt-1 border-t border-border/40">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Marcar como Série Extra?</span>
              <span className="text-[11px] text-muted-foreground">Não altera a prescrição original da ficha</span>
            </div>
            <Switch
              checked={isExtra}
              onCheckedChange={(checked) => handleUpdate({ isExtra: checked })}
              aria-label="Alternar série extra"
            />
          </div>

          {!isWarmup && (
            <RirSelector
              value={rir}
              onChange={(newRir) => handleUpdate({ rir: newRir })}
            />
          )}
        </div>

        {/* Ação Concluir Série */}
        <div className="pt-1">
          {!isCompleted ? (
            <Button
              variant={isExtra ? "secondary" : "default"}
              size="lg"
              disabled={isSubmitting}
              onClick={handleComplete}
              className="w-full font-bold tracking-wide h-12 gap-2 text-sm shadow-xs"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              {isSubmitting
                ? "Registrando..."
                : isExtra
                ? `Concluir série extra (#${currentSet})`
                : `Concluir série ${currentSet}`}
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

