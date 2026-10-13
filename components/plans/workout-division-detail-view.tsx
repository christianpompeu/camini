"use client";

import React from "react";
import { WorkoutPlan, WorkoutDivision } from "@/types/workout-plan";
import { useExerciseCatalogStore } from "@/store/useExerciseCatalogStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Edit,
  Clock,
  Dumbbell,
  Timer,
  Info,
} from "lucide-react";

interface WorkoutDivisionDetailViewProps {
  plan: WorkoutPlan;
  division: WorkoutDivision;
  onBack: () => void;
  onStartSession: (plan: WorkoutPlan, division: WorkoutDivision) => void;
  onEditPlan?: (plan: WorkoutPlan) => void;
}

export function WorkoutDivisionDetailView({
  plan,
  division,
  onBack,
  onStartSession,
  onEditPlan,
}: WorkoutDivisionDetailViewProps) {
  const { exercises: catalogExercises } = useExerciseCatalogStore();

  const getExerciseName = (exerciseId: string) => {
    const found = catalogExercises.find((e) => e.id === exerciseId);
    return found ? found.name : exerciseId.replace(/_/g, " ");
  };

  const getExerciseMuscles = (exerciseId: string) => {
    const found = catalogExercises.find((e) => e.id === exerciseId);
    return found ? found.primaryMuscles.join(", ") : "";
  };

  const formatPrescriptionSummary = (pex: import("@/types/workout-plan").PrescribedExercise) => {
    const sets = `${pex.targetSets} ×`;

    let target = "";
    if (pex.measurementType === "reps") {
      if (pex.minReps && pex.maxReps) {
        target = `${pex.minReps}–${pex.maxReps} reps`;
      } else {
        target = `${pex.targetReps || 8} reps`;
      }
    } else if (pex.measurementType === "duration") {
      target = `${pex.targetDurationSeconds || 60} segundos`;
    } else if (pex.measurementType === "distance") {
      target = `${pex.targetDistanceMeters || 20} metros`;
    }

    let loadInfo = "";
    if (pex.loadConvention === "total") loadInfo = "carga total";
    else if (pex.loadConvention === "per_implement") loadInfo = "por implemento";
    else if (pex.loadConvention === "additional") loadInfo = "carga adicional";
    else if (pex.loadConvention === "bodyweight") loadInfo = "peso corporal";

    return `${sets} ${target} · ${loadInfo}`;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200 pb-12">
      {/* Barra Superior de Navegação */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Minhas Fichas</span>
        </Button>

        {onEditPlan && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEditPlan(plan)}
            className="gap-1.5 text-xs h-8"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Editar Ficha</span>
          </Button>
        )}
      </div>

      {/* Cabeçalho da Divisão (Figma Tela 03) */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Dumbbell className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {plan.name} {division.letter ? `/ ${division.letter}` : ""}
          </span>
          {plan.status === "active" && (
            <Badge className="bg-emerald-600 text-white text-[10px] ml-auto">
              Ficha Ativa
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {division.name}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {division.notes || "Ficha de referência · confira a prescrição antes de iniciar"}
        </p>

        {division.estimatedMinutes && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Duração estimada: ~{division.estimatedMinutes} minutos</span>
          </div>
        )}
      </div>

      {/* Lista de Exercícios Prescritos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="font-semibold uppercase tracking-wider">
            Sequência Prescrita ({division.prescribedExercises.length} exercícios)
          </span>
        </div>

        {division.prescribedExercises.map((pex, index) => {
          const exerciseName = getExerciseName(pex.exerciseId);
          const muscleGroup = getExerciseMuscles(pex.exerciseId);

          return (
            <div
              key={pex.id}
              className="p-4 rounded-xl border border-border bg-card text-card-foreground shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-muted-foreground bg-muted w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                      {exerciseName}
                    </h3>
                  </div>
                  {muscleGroup && (
                    <p className="text-[11px] text-muted-foreground pl-7">
                      {muscleGroup}
                    </p>
                  )}
                </div>

                <Badge variant="secondary" className="text-xs shrink-0 font-medium">
                  {pex.targetSets} {pex.targetSets === 1 ? "série" : "séries"}
                </Badge>
              </div>

              {/* Linha de Metas e Descanso */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-border/50 text-muted-foreground pl-7">
                <div className="font-semibold text-foreground">
                  {formatPrescriptionSummary(pex)}
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  <Timer className="w-3 h-3 text-muted-foreground" />
                  <span>Descanso: {pex.restSeconds}s</span>
                </div>
              </div>

              {/* Observação da prescrição se houver */}
              {pex.notes && (
                <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-lg ml-7 mt-1">
                  <Info className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  <span>{pex.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botões de Ação Inferiores (Figma Tela 03) */}
      <div className="space-y-2 pt-4">
        <Button
          type="button"
          size="lg"
          onClick={() => onStartSession(plan, division)}
          className="w-full gap-2 font-bold text-sm h-12 shadow-sm"
        >
          <Play className="w-4 h-4 fill-current" />
          Iniciar treino
        </Button>

        {onEditPlan && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => onEditPlan(plan)}
            className="w-full font-semibold text-xs h-11"
          >
            Editar ficha
          </Button>
        )}
      </div>
    </div>
  );
}
