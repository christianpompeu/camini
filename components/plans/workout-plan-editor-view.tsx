"use client";

import React, { useState } from "react";
import {
  WorkoutPlan,
  WorkoutDivision,
  PrescribedExercise,
  MeasurementType,
  LoadConvention,
} from "@/types/workout-plan";
import { useExerciseCatalogStore } from "@/store/useExerciseCatalogStore";
import { CatalogExercise } from "@/types/exercise";
import { ExercisePickerDialog } from "./exercise-picker-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Dumbbell,
  Save,
  ChevronRight,
} from "lucide-react";

interface WorkoutPlanEditorViewProps {
  initialPlan: WorkoutPlan;
  onSaveDraft: (plan: WorkoutPlan) => void;
  onReview: (plan: WorkoutPlan) => void;
  onCancel: () => void;
}

export function WorkoutPlanEditorView({
  initialPlan,
  onSaveDraft,
  onReview,
  onCancel,
}: WorkoutPlanEditorViewProps) {
  const { exercises: catalogExercises } = useExerciseCatalogStore();

  // Estado do plano em edição
  const [plan, setPlan] = useState<WorkoutPlan>(JSON.parse(JSON.stringify(initialPlan)));
  const [activeDivisionIndex, setActiveDivisionIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // Estados de modais
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showDeleteDivisionConfirm, setShowDeleteDivisionConfirm] = useState<number | null>(null);
  const [pickerMode, setPickerMode] = useState<{ mode: "add" | "replace"; targetExerciseIndex?: number } | null>(null);

  const markDirty = () => setIsDirty(true);

  const activeDivision = plan.divisions[activeDivisionIndex] || plan.divisions[0];

  // Resolução de nomes do catálogo
  const getCatalogExercise = (exerciseId: string): CatalogExercise | undefined => {
    return catalogExercises.find((e) => e.id === exerciseId);
  };

  // 1. MANIPULAÇÃO DE DIVISÕES
  const handleAddDivision = () => {
    markDirty();
    const nextOrder = plan.divisions.length;
    const letter = String.fromCharCode(65 + nextOrder); // A, B, C, D...
    const newDivision: WorkoutDivision = {
      id: `div_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `Treino ${letter}`,
      letter,
      order: nextOrder,
      prescribedExercises: [],
    };

    setPlan((prev) => ({
      ...prev,
      divisions: [...prev.divisions, newDivision],
    }));
    setActiveDivisionIndex(plan.divisions.length);
  };

  const handleUpdateDivisionField = (field: keyof WorkoutDivision, value: unknown) => {
    markDirty();
    setPlan((prev) => {
      const newDivisions = [...prev.divisions];
      newDivisions[activeDivisionIndex] = {
        ...newDivisions[activeDivisionIndex],
        [field]: value,
      };
      return { ...prev, divisions: newDivisions };
    });
  };

  const handleMoveDivision = (direction: "up" | "down") => {
    if (
      (direction === "up" && activeDivisionIndex === 0) ||
      (direction === "down" && activeDivisionIndex === plan.divisions.length - 1)
    ) {
      return;
    }

    markDirty();
    const targetIndex = direction === "up" ? activeDivisionIndex - 1 : activeDivisionIndex + 1;
    setPlan((prev) => {
      const newDivisions = [...prev.divisions];
      const temp = newDivisions[activeDivisionIndex];
      newDivisions[activeDivisionIndex] = newDivisions[targetIndex];
      newDivisions[targetIndex] = temp;

      // Re-indexa orders
      newDivisions.forEach((d, i) => {
        d.order = i;
      });

      return { ...prev, divisions: newDivisions };
    });
    setActiveDivisionIndex(targetIndex);
  };

  const handleConfirmDeleteDivision = (indexToDelete: number) => {
    if (plan.divisions.length <= 1) return; // Mínimo 1 divisão obrigatória
    markDirty();
    setPlan((prev) => {
      const newDivisions = prev.divisions.filter((_, i) => i !== indexToDelete);
      newDivisions.forEach((d, i) => {
        d.order = i;
      });
      return { ...prev, divisions: newDivisions };
    });

    setShowDeleteDivisionConfirm(null);
    setActiveDivisionIndex(Math.max(0, indexToDelete - 1));
  };

  // 2. MANIPULAÇÃO DE EXERCÍCIOS PRESCRITOS
  const handleSelectCatalogExercise = (catalogEx: CatalogExercise) => {
    markDirty();
    if (!pickerMode) return;

    if (pickerMode.mode === "add") {
      const newPrescribedExercise: PrescribedExercise = {
        id: `pex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        exerciseId: catalogEx.id,
        exerciseDefinitionVersion: catalogEx.version,
        order: activeDivision.prescribedExercises.length,
        targetSets: 3,
        measurementType: catalogEx.measurementType,
        minReps: catalogEx.measurementType === "reps" ? 6 : undefined,
        maxReps: catalogEx.measurementType === "reps" ? 10 : undefined,
        targetDurationSeconds: catalogEx.measurementType === "duration" ? 60 : undefined,
        targetDistanceMeters: catalogEx.measurementType === "distance" ? 30 : undefined,
        restSeconds: 90,
        loadConvention: catalogEx.loadConvention,
        laterality: catalogEx.laterality,
      };

      setPlan((prev) => {
        const newDivisions = [...prev.divisions];
        newDivisions[activeDivisionIndex] = {
          ...newDivisions[activeDivisionIndex],
          prescribedExercises: [
            ...newDivisions[activeDivisionIndex].prescribedExercises,
            newPrescribedExercise,
          ],
        };
        return { ...prev, divisions: newDivisions };
      });
    } else if (pickerMode.mode === "replace" && pickerMode.targetExerciseIndex !== undefined) {
      setPlan((prev) => {
        const newDivisions = [...prev.divisions];
        const newExercises = [...newDivisions[activeDivisionIndex].prescribedExercises];
        const currentPex = newExercises[pickerMode.targetExerciseIndex!];

        newExercises[pickerMode.targetExerciseIndex!] = {
          ...currentPex,
          exerciseId: catalogEx.id,
          exerciseDefinitionVersion: catalogEx.version,
          measurementType: catalogEx.measurementType,
          loadConvention: catalogEx.loadConvention,
          laterality: catalogEx.laterality,
        };

        newDivisions[activeDivisionIndex] = {
          ...newDivisions[activeDivisionIndex],
          prescribedExercises: newExercises,
        };
        return { ...prev, divisions: newDivisions };
      });
    }

    setPickerMode(null);
  };

  const handleUpdatePrescription = (
    exerciseIndex: number,
    field: keyof PrescribedExercise,
    value: unknown
  ) => {
    markDirty();
    setPlan((prev) => {
      const newDivisions = [...prev.divisions];
      const newExercises = [...newDivisions[activeDivisionIndex].prescribedExercises];
      newExercises[exerciseIndex] = {
        ...newExercises[exerciseIndex],
        [field]: value,
      };
      newDivisions[activeDivisionIndex] = {
        ...newDivisions[activeDivisionIndex],
        prescribedExercises: newExercises,
      };
      return { ...prev, divisions: newDivisions };
    });
  };

  const handleMoveExercise = (exerciseIndex: number, direction: "up" | "down") => {
    if (
      (direction === "up" && exerciseIndex === 0) ||
      (direction === "down" && exerciseIndex === activeDivision.prescribedExercises.length - 1)
    ) {
      return;
    }

    markDirty();
    const targetIndex = direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;
    setPlan((prev) => {
      const newDivisions = [...prev.divisions];
      const newExercises = [...newDivisions[activeDivisionIndex].prescribedExercises];
      const temp = newExercises[exerciseIndex];
      newExercises[exerciseIndex] = newExercises[targetIndex];
      newExercises[targetIndex] = temp;

      // Re-indexa orders
      newExercises.forEach((e, idx) => {
        e.order = idx;
      });

      newDivisions[activeDivisionIndex] = {
        ...newDivisions[activeDivisionIndex],
        prescribedExercises: newExercises,
      };
      return { ...prev, divisions: newDivisions };
    });
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    markDirty();
    setPlan((prev) => {
      const newDivisions = [...prev.divisions];
      const newExercises = newDivisions[activeDivisionIndex].prescribedExercises
        .filter((_, idx) => idx !== exerciseIndex)
        .map((e, idx) => ({ ...e, order: idx }));

      newDivisions[activeDivisionIndex] = {
        ...newDivisions[activeDivisionIndex],
        prescribedExercises: newExercises,
      };
      return { ...prev, divisions: newDivisions };
    });
  };

  const handleSaveDraftClick = () => {
    onSaveDraft(plan);
    setIsDirty(false);
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onCancel();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200 pb-20">
      {/* Barra de Ações Superior */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCancelClick}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancelar</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraftClick}
            className="text-xs gap-1.5 h-8 font-medium"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Rascunho</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onReview(plan)}
            className="text-xs gap-1.5 h-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <span>Revisar Versão</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Seção 1: Identificação da Ficha */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          1. Identidade da Ficha
        </span>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="planName" className="text-xs font-semibold">
              Nome da Ficha *
            </Label>
            <Input
              id="planName"
              value={plan.name}
              onChange={(e) => {
                markDirty();
                setPlan((prev) => ({ ...prev, name: e.target.value }));
              }}
              placeholder="Ex: Programa de Força A–E, Treino de Hipertrofia..."
              className="text-sm font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="planGoal" className="text-xs font-semibold">
                Objetivo Principal
              </Label>
              <Input
                id="planGoal"
                value={plan.goal || ""}
                onChange={(e) => {
                  markDirty();
                  setPlan((prev) => ({ ...prev, goal: e.target.value }));
                }}
                placeholder="Ex: Força, Hipertrofia, Manutenção"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="planNotes" className="text-xs font-semibold">
                Observações Gerais
              </Label>
              <Input
                id="planNotes"
                value={plan.notes || ""}
                onChange={(e) => {
                  markDirty();
                  setPlan((prev) => ({ ...prev, notes: e.target.value }));
                }}
                placeholder="Ex: Sem máquinas, foco em halteres e barras"
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Divisões de Treino */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Divisões de Treino ({plan.divisions.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alterne entre as divisões para configurar os exercícios prescritos.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddDivision}
            className="text-xs gap-1.5 h-8 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Divisão</span>
          </Button>
        </div>

        {/* Abas Horizontais das Divisões */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {plan.divisions.map((div, idx) => (
            <button
              key={div.id}
              type="button"
              onClick={() => setActiveDivisionIndex(idx)}
              className={`text-xs py-2 px-3.5 rounded-xl font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                activeDivisionIndex === idx
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{div.letter || `#${idx + 1}`}</span>
              <span className="truncate max-w-[120px]">{div.name}</span>
            </button>
          ))}
        </div>

        {/* Painel da Divisão Selecionada */}
        {activeDivision && (
          <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card space-y-5">
            {/* Cabeçalho da Divisão em Edição */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Identificador</Label>
                  <Input
                    value={activeDivision.letter || ""}
                    onChange={(e) => handleUpdateDivisionField("letter", e.target.value.toUpperCase())}
                    placeholder="Ex: A, B"
                    maxLength={3}
                    className="text-xs font-bold uppercase"
                  />
                </div>
                <div className="sm:col-span-9 space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">Nome da Divisão *</Label>
                  <Input
                    value={activeDivision.name}
                    onChange={(e) => handleUpdateDivisionField("name", e.target.value)}
                    placeholder="Ex: Pernas e Core, Empurrar, Puxar..."
                    className="text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Botões de Ordem e Exclusão da Divisão */}
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={activeDivisionIndex === 0}
                  onClick={() => handleMoveDivision("up")}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Mover divisão para cima"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={activeDivisionIndex === plan.divisions.length - 1}
                  onClick={() => handleMoveDivision("down")}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Mover divisão para baixo"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>

                {plan.divisions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteDivisionConfirm(activeDivisionIndex)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    title="Excluir esta divisão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Lista dos Exercícios Prescritos nesta Divisão */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Exercícios Prescritos ({activeDivision.prescribedExercises.length})
                </span>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setPickerMode({ mode: "add" })}
                  className="text-xs gap-1.5 h-8 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Exercício</span>
                </Button>
              </div>

              {activeDivision.prescribedExercises.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
                  <Dumbbell className="w-8 h-8 mx-auto text-muted-foreground/40" />
                  <p>Nenhum exercício prescrito nesta divisão.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerMode({ mode: "add" })}
                    className="text-xs gap-1.5"
                  >
                    <Plus className="w-3 h-3" />
                    Selecionar do Catálogo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeDivision.prescribedExercises.map((pex, exIdx) => {
                    const catalogEx = getCatalogExercise(pex.exerciseId);
                    const exerciseName = catalogEx ? catalogEx.name : pex.exerciseId.replace(/_/g, " ");

                    return (
                      <div
                        key={pex.id}
                        className="p-4 rounded-xl border border-border bg-card space-y-3.5 shadow-xs"
                      >
                        {/* Linha 1: Cabeçalho do Exercício e Ações de Ordenação */}
                        <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-mono font-bold text-muted-foreground bg-muted w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                              {exIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-foreground truncate">
                                {exerciseName}
                              </h4>
                              {catalogEx?.primaryMuscles && (
                                <p className="text-[11px] text-muted-foreground">
                                  {catalogEx.primaryMuscles.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={exIdx === 0}
                              onClick={() => handleMoveExercise(exIdx, "up")}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Subir na ordem"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={exIdx === activeDivision.prescribedExercises.length - 1}
                              onClick={() => handleMoveExercise(exIdx, "down")}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Descer na ordem"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setPickerMode({
                                  mode: "replace",
                                  targetExerciseIndex: exIdx,
                                })
                              }
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Substituir por outro exercício"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveExercise(exIdx)}
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              title="Remover exercício"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Linha 2: Campos de Prescrição */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          {/* Séries de Trabalho */}
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-muted-foreground">
                              Séries de Trabalho
                            </Label>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              value={pex.targetSets}
                              onChange={(e) =>
                                handleUpdatePrescription(
                                  exIdx,
                                  "targetSets",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="text-xs h-8 font-semibold"
                            />
                          </div>

                          {/* Tipo de Medida */}
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-muted-foreground">
                              Medida
                            </Label>
                            <Select
                              value={pex.measurementType}
                              onValueChange={(val) => {
                                if (val) {
                                  handleUpdatePrescription(
                                    exIdx,
                                    "measurementType",
                                    val as MeasurementType
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reps">Repetições</SelectItem>
                                <SelectItem value="duration">Duração (s)</SelectItem>
                                <SelectItem value="distance">Distância (m)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Metas Conforme a Medida */}
                          {pex.measurementType === "reps" ? (
                            <>
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground">
                                  Reps Mínimas
                                </Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={pex.minReps ?? pex.targetReps ?? 6}
                                  onChange={(e) =>
                                    handleUpdatePrescription(
                                      exIdx,
                                      "minReps",
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="text-xs h-8"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-muted-foreground">
                                  Reps Máximas
                                </Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={pex.maxReps ?? pex.targetReps ?? 10}
                                  onChange={(e) =>
                                    handleUpdatePrescription(
                                      exIdx,
                                      "maxReps",
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="text-xs h-8"
                                />
                              </div>
                            </>
                          ) : pex.measurementType === "duration" ? (
                            <div className="space-y-1 col-span-2">
                              <Label className="text-[11px] font-semibold text-muted-foreground">
                                Duração Alvo (segundos)
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                value={pex.targetDurationSeconds ?? 60}
                                onChange={(e) =>
                                  handleUpdatePrescription(
                                    exIdx,
                                    "targetDurationSeconds",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="text-xs h-8"
                              />
                            </div>
                          ) : (
                            <div className="space-y-1 col-span-2">
                              <Label className="text-[11px] font-semibold text-muted-foreground">
                                Distância Alvo (metros)
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                value={pex.targetDistanceMeters ?? 30}
                                onChange={(e) =>
                                  handleUpdatePrescription(
                                    exIdx,
                                    "targetDistanceMeters",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="text-xs h-8"
                              />
                            </div>
                          )}

                          {/* Descanso entre Séries */}
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-muted-foreground">
                              Descanso (s)
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              step={15}
                              value={pex.restSeconds}
                              onChange={(e) =>
                                handleUpdatePrescription(
                                  exIdx,
                                  "restSeconds",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="text-xs h-8"
                            />
                          </div>

                          {/* Convenção de Carga */}
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-muted-foreground">
                              Convenção de Carga
                            </Label>
                            <Select
                              value={pex.loadConvention}
                              onValueChange={(val) => {
                                if (val) {
                                  handleUpdatePrescription(
                                    exIdx,
                                    "loadConvention",
                                    val as LoadConvention
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className="text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="total">Carga Total</SelectItem>
                                <SelectItem value="per_implement">Por Implemento</SelectItem>
                                <SelectItem value="additional">Carga Adicional</SelectItem>
                                <SelectItem value="bodyweight">Peso Corporal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Carga Inicial Sugerida (Opcional) */}
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-muted-foreground">
                              Carga Inicial (kg)
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              value={pex.targetWeight ?? ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                handleUpdatePrescription(exIdx, "targetWeight", val);
                              }}
                              placeholder="Opcional"
                              className="text-xs h-8"
                            />
                          </div>

                          {/* RIR Alvo (Opcional) */}
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold text-muted-foreground">
                              RIR Alvo
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={pex.targetRir ?? ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                                handleUpdatePrescription(exIdx, "targetRir", val);
                              }}
                              placeholder="Opcional (ex: 2)"
                              className="text-xs h-8"
                            />
                          </div>
                        </div>

                        {/* Observações da Prescrição */}
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold text-muted-foreground">
                            Observações de Execução (Opcional)
                          </Label>
                          <Input
                            value={pex.notes || ""}
                            onChange={(e) => handleUpdatePrescription(exIdx, "notes", e.target.value)}
                            placeholder="Ex: Pausa de 2s no ponto mais baixo; apoio seguro..."
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Seletor de Exercício do Catálogo */}
      <ExercisePickerDialog
        open={Boolean(pickerMode)}
        onOpenChange={(open) => !open && setPickerMode(null)}
        onSelectExercise={handleSelectCatalogExercise}
        title={pickerMode?.mode === "replace" ? "Substituir Exercício Prescrito" : "Adicionar Exercício à Divisão"}
      />

      {/* Diálogo de Confirmação: Descarte de Alterações */}
      <Dialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Descartar alterações não salvas?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              Você possui edições na ficha que ainda não foram salvas como rascunho ou versão. Deseja sair e perder essas modificações?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDiscardConfirm(false)}
              className="text-xs"
            >
              Continuar editando
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setShowDiscardConfirm(false);
                onCancel();
              }}
              className="text-xs font-semibold"
            >
              Sim, descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação: Exclusão de Divisão */}
      <Dialog
        open={showDeleteDivisionConfirm !== null}
        onOpenChange={(open) => !open && setShowDeleteDivisionConfirm(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Excluir divisão de treino?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              Tem certeza de que deseja remover esta divisão e todos os seus exercícios prescritos?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDivisionConfirm(null)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (showDeleteDivisionConfirm !== null) {
                  handleConfirmDeleteDivision(showDeleteDivisionConfirm);
                }
              }}
              className="text-xs font-semibold"
            >
              Sim, excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
