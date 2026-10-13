"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  TrendingUp,
  History,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Play,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkoutCard } from "@/components/workout/workout-card";
import { ActiveSetCard } from "@/components/workout/active-set-card";
import { RestTimer } from "@/components/workout/rest-timer";
import { ExerciseHero } from "@/components/workout/exercise-hero";
import { SetEditorDialog } from "@/components/workout/set-editor-dialog";
import { HistoryList } from "@/components/workout/history-list";
import { HistorySessionDetail } from "@/components/workout/history-session-detail";
import { ExportDataPanel } from "@/components/workout/export-data-panel";
import { BottomNavigation, NavItem } from "@/components/workout/bottom-navigation";
import { ExerciseCatalogView } from "@/components/catalog/exercise-catalog-view";
import { useWorkoutStore, SetRecord, EditSetContext } from "@/store/useWorkoutStore";

export interface WorkoutExerciseDef {
  id: string;
  name: string;
  measurementType: "reps" | "duration" | "distance";
  loadConvention: "total" | "per_implement" | "additional" | "bodyweight";
  expectedSets: number;
  targetMuscles: string;
}

export interface WorkoutDef {
  letter: "A" | "B" | "C" | "D" | "E";
  title: string;
  focus: string;
  exerciseCount: number;
  lastExecuted: string;
  estimatedMinutes: number;
  exercises: WorkoutExerciseDef[];
}

export const WORKOUT_PROGRAM: WorkoutDef[] = [
  {
    letter: "A",
    title: "Pernas e Core",
    focus: "Quadríceps, Glúteos, Posteriores",
    exerciseCount: 5,
    lastExecuted: "Segunda-feira",
    estimatedMinutes: 45,
    exercises: [
      { id: "agachamento_goblet", name: "Agachamento Goblet", measurementType: "reps", loadConvention: "total", expectedSets: 4, targetMuscles: "Quadríceps" },
      { id: "stiff_levantamento_romeno_com_barra", name: "Stiff/Levantamento Romeno com barra", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Posteriores da Coxa" },
      { id: "avanco_reverso", name: "Avanço reverso", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Quadríceps e Glúteos" },
      { id: "panturrilha_em_pe", name: "Panturrilha em pé", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Panturrilhas" },
      { id: "prancha", name: "Prancha", measurementType: "duration", loadConvention: "bodyweight", expectedSets: 2, targetMuscles: "Core" },
    ],
  },
  {
    letter: "B",
    title: "Empurrar",
    focus: "Peito, Ombros, Tríceps",
    exerciseCount: 5,
    lastExecuted: "Ontem",
    estimatedMinutes: 45,
    exercises: [
      { id: "supino_no_chao_com_halteres", name: "Supino no chão com halteres", measurementType: "reps", loadConvention: "per_implement", expectedSets: 4, targetMuscles: "Peitoral" },
      { id: "desenvolvimento_militar_com_barra", name: "Desenvolvimento militar em pé com barra", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Ombros" },
      { id: "flexao_de_bracos", name: "Flexão de braços", measurementType: "reps", loadConvention: "bodyweight", expectedSets: 3, targetMuscles: "Peitoral e Tríceps" },
      { id: "elevacao_lateral_com_halteres", name: "Elevação lateral com halteres", measurementType: "reps", loadConvention: "per_implement", expectedSets: 2, targetMuscles: "Deltoide Lateral" },
      { id: "prancha", name: "Prancha", measurementType: "duration", loadConvention: "bodyweight", expectedSets: 2, targetMuscles: "Core" },
    ],
  },
  {
    letter: "C",
    title: "Puxar",
    focus: "Costas, Bíceps",
    exerciseCount: 5,
    lastExecuted: "Há 4 dias",
    estimatedMinutes: 50,
    exercises: [
      { id: "levantamento_terra_com_barra", name: "Levantamento terra com barra", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Costas e Posteriores" },
      { id: "remada_curvada_com_barra", name: "Remada curvada com barra", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Dorsais" },
      { id: "remada_unilateral_com_halter", name: "Remada unilateral com halter", measurementType: "reps", loadConvention: "per_implement", expectedSets: 3, targetMuscles: "Dorsais" },
      { id: "crucifixo_inverso_inclinado_com_halteres", name: "Crucifixo inverso inclinado com halteres", measurementType: "reps", loadConvention: "per_implement", expectedSets: 2, targetMuscles: "Deltoide Posterior" },
      { id: "rosca_direta_com_barra", name: "Rosca direta com barra", measurementType: "reps", loadConvention: "total", expectedSets: 2, targetMuscles: "Bíceps" },
    ],
  },
  {
    letter: "D",
    title: "Full Body",
    focus: "Técnico e Moderado",
    exerciseCount: 5,
    lastExecuted: "-",
    estimatedMinutes: 45,
    exercises: [
      { id: "agachamento_goblet", name: "Agachamento Goblet", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Quadríceps" },
      { id: "supino_no_chao_com_halteres", name: "Supino no chão com halteres", measurementType: "reps", loadConvention: "per_implement", expectedSets: 3, targetMuscles: "Peitoral" },
      { id: "remada_curvada_com_barra", name: "Remada curvada com barra", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Dorsais" },
      { id: "elevacao_lateral_com_halteres", name: "Elevação lateral com halteres", measurementType: "reps", loadConvention: "per_implement", expectedSets: 2, targetMuscles: "Deltoide Lateral" },
      { id: "panturrilha_em_pe", name: "Panturrilha em pé", measurementType: "reps", loadConvention: "total", expectedSets: 2, targetMuscles: "Panturrilhas" },
    ],
  },
  {
    letter: "E",
    title: "Complementar",
    focus: "Acessórios e Core",
    exerciseCount: 5,
    lastExecuted: "-",
    estimatedMinutes: 40,
    exercises: [
      { id: "desenvolvimento_com_halteres", name: "Desenvolvimento com halteres", measurementType: "reps", loadConvention: "per_implement", expectedSets: 3, targetMuscles: "Ombros" },
      { id: "remada_unilateral_com_halter", name: "Remada unilateral com halter", measurementType: "reps", loadConvention: "per_implement", expectedSets: 3, targetMuscles: "Dorsais" },
      { id: "stiff_levantamento_romeno_com_barra", name: "Stiff/Levantamento Romeno com barra", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Posteriores da Coxa" },
      { id: "crucifixo_inverso_inclinado_com_halteres", name: "Crucifixo inverso inclinado com halteres", measurementType: "reps", loadConvention: "per_implement", expectedSets: 2, targetMuscles: "Deltoide Posterior" },
      { id: "farmers_walk", name: "Farmer's Walk", measurementType: "distance", loadConvention: "per_implement", expectedSets: 2, targetMuscles: "Core e Pegada" },
    ],
  },
];

export default function ForcaAppPage() {
  const [activeTab, setActiveTab] = useState<NavItem["id"]>("treinos");
  const [editingContext, setEditingContext] = useState<EditSetContext | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [lastFinishedId, setLastFinishedId] = useState<string | null>(null);
  const [isSessionMinimized, setIsSessionMinimized] = useState(false);

  const {
    hasHydrated,
    activeWorkout,
    completedWorkouts,
    startWorkout,
    logSet,
    nextExercise,
    finishWorkout,
    discardWorkout,
    startTimer,
    updateDraft,
    updateSet,
    deleteSet,
    updateHistoricalSet,
    deleteHistoricalSet,
    updateSessionObservation,
  } = useWorkoutStore();

  const handleStartWorkoutSession = (workout: WorkoutDef) => {
    // Se clicar no mesmo treino já ativo, apenas restaura a tela de execução
    if (activeWorkout && activeWorkout.letter === workout.letter) {
      setIsSessionMinimized(false);
      setActiveTab("treinos");
      return;
    }

    // Se já houver outro treino ativo, pede confirmação antes de descartar
    if (activeWorkout && activeWorkout.letter !== workout.letter) {
      const confirmSwitch = window.confirm(
        `Você já possui uma sessão ativa do Treino ${activeWorkout.letter} em andamento. Deseja descartá-la para iniciar o Treino ${workout.letter}?`
      );
      if (!confirmSwitch) return;
    }

    startWorkout(workout);
    setIsSessionMinimized(false);
    setActiveTab("treinos");
  };

  const currentExerciseIndex = activeWorkout?.activeExerciseIndex || 0;
  const currentExercise = activeWorkout?.exercises[currentExerciseIndex];
  const currentSetNumber = (currentExercise?.sets?.length || 0) + 1;
  const isSessionCompleted = activeWorkout?.isCompleted;

  const handleCompleteSet = ({
    weight,
    reps,
    rir,
    isWarmup,
    isExtra,
  }: {
    weight: number;
    reps: number;
    rir?: number;
    isWarmup: boolean;
    isExtra?: boolean;
  }) => {
    if (!currentExercise) return;
    const type = isWarmup ? "warmup" : "work";
    const setPayload: Partial<SetRecord> & { type: "warmup" | "work"; weight: number; isExtra?: boolean } = {
      weight,
      type,
      isExtra,
      rir,
    };
    if (currentExercise.measurementType === "reps") {
      setPayload.reps = reps;
    } else if (currentExercise.measurementType === "duration") {
      setPayload.durationSeconds = reps;
    } else if (currentExercise.measurementType === "distance") {
      setPayload.distanceMeters = reps;
    }
    logSet(setPayload);
    startTimer(90);
  };

  const lastSet = currentExercise?.sets?.length ? currentExercise.sets[currentExercise.sets.length - 1] : null;
  const currentDraft = currentExercise?.draft || {
    weight: lastSet
      ? lastSet.weight
      : currentExercise?.loadConvention === "bodyweight"
      ? 0
      : 20,
    reps: lastSet
      ? (lastSet.reps || lastSet.durationSeconds || lastSet.distanceMeters || 8)
      : currentExercise?.measurementType === "duration"
      ? 60
      : currentExercise?.measurementType === "distance"
      ? 20
      : 8,
    rir: undefined,
    isWarmup: currentSetNumber === 1 && currentExercise?.loadConvention !== "bodyweight",
    isExtra: currentSetNumber > (currentExercise?.expectedSets || 4),
  };

  if (!hasHydrated) return null; // Aguarda hidratação do storage

  const activeDetailSession =
    (selectedSessionId && completedWorkouts.find((w) => w.id === selectedSessionId)) ||
    (lastFinishedId && completedWorkouts.find((w) => w.id === lastFinishedId)) ||
    null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-28">
      {/* Barra de Navegação Superior Global */}
      <Navbar />

      {/* Sub-header Contextual do Módulo */}
      <div className="border-b border-border bg-muted/20 px-4 sm:px-8 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Camini Hub</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">FORÇA</span>
          </div>

          <div className="flex items-center gap-2">
            {activeWorkout && !isSessionCompleted && (
              <Badge variant="outline" className="text-[11px] gap-1.5 hidden sm:flex">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Treino Ativo: Treino {activeWorkout.letter}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        {/* ABA: TREINOS (SELEÇÃO E EXECUÇÃO) */}
        {activeTab === "treinos" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header da Seção de Treinos */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Programa Atual
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Fichas de Treino A-E
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Selecione o treino do dia ou continue a sessão ativa:
                </span>
              </div>
            </div>

            {/* Banner de Sessão Ativa em Andamento (quando minimizada) */}
            {activeWorkout && isSessionMinimized && (
              <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-sm text-foreground">
                      Sessão em andamento: Treino {activeWorkout.letter}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {activeWorkout.title}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exercício {currentExerciseIndex + 1} de {activeWorkout.exercises.length}:{" "}
                    <strong className="text-foreground">{currentExercise?.exerciseName}</strong>. Suas séries e rascunhos continuam salvos.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setIsSessionMinimized(false)}
                    className="text-xs font-semibold gap-1.5 h-9 shrink-0 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Retomar treino em andamento
                  </Button>
                </div>
              </div>
            )}

            {/* Grid dos Cards de Treino (Exibido se não houver sessão ativa ou se estiver minimizada) */}
            {(!activeWorkout || isSessionMinimized) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {WORKOUT_PROGRAM.map((workout) => (
                  <WorkoutCard
                    key={workout.letter}
                    letter={workout.letter}
                    title={workout.title}
                    focus={workout.focus}
                    exerciseCount={workout.exerciseCount}
                    lastExecuted={workout.lastExecuted}
                    estimatedMinutes={workout.estimatedMinutes}
                    isActiveSession={Boolean(activeWorkout && activeWorkout.letter === workout.letter)}
                    onStart={() => handleStartWorkoutSession(workout)}
                  />
                ))}
              </div>
            )}

            {/* Sessão em Andamento do Treino Selecionado */}
            {activeWorkout && !isSessionMinimized && (
            <div className="pt-2 border-t border-border space-y-6">
              {/* Barra de Retorno: Minimizar / Ver todas as fichas */}
              <div className="flex items-center justify-between pb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSessionMinimized(true)}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2 h-8"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ver todas as fichas (minimizar treino)</span>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Sessão Ativa: Treino {activeWorkout.letter}
                    </h2>
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {activeWorkout.title}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Exercício {currentExerciseIndex + 1} de {activeWorkout.exercises.length}:{" "}
                    <strong className="text-foreground">
                      {currentExercise?.exerciseName}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("Deseja realmente descartar o progresso desta sessão?")) {
                        discardWorkout();
                        setIsSessionMinimized(false);
                      }
                    }}
                    className="gap-1.5 text-xs h-9 text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Descartar Sessão
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Coluna Principal: Registro de Cargas e Séries */}
                <div className="lg:col-span-7 space-y-4">
                    {currentExercise && (
                      <ExerciseHero
                        exerciseId={currentExercise.definitionId}
                        name={currentExercise.exerciseName}
                        category={currentExercise.targetMuscles}
                        sets={`${currentExercise.expectedSets} Séries`}
                        reps="Conforme Prescrição"
                        className="mb-4"
                      />
                    )}

                    {/* Lista de Séries Concluídas (Permite Correção) */}
                    {currentExercise && currentExercise.sets.length > 0 && (
                      <div className="space-y-2 mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                          Séries Registradas
                        </h3>
                        {currentExercise.sets.map((setRecord, idx) => {
                          const isExtra = Boolean(setRecord.isExtra || setRecord.type === "extra");
                          const isWarmup = setRecord.type === "warmup";
                          return (
                            <div
                              key={setRecord.id}
                              className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="w-16 justify-center">
                                  Série {idx + 1}
                                </Badge>
                                <span className="text-sm font-semibold">
                                  {currentExercise.loadConvention !== "bodyweight"
                                    ? `${setRecord.weight} kg x `
                                    : setRecord.weight > 0
                                    ? `+${setRecord.weight} kg x `
                                    : ""}
                                  {currentExercise.measurementType === "duration"
                                    ? `${setRecord.durationSeconds || setRecord.reps} seg`
                                    : currentExercise.measurementType === "distance"
                                    ? `${setRecord.distanceMeters || setRecord.reps} m`
                                    : `${setRecord.reps} reps`}
                                </span>
                                {isWarmup && (
                                  <Badge variant="secondary" className="text-[10px] text-amber-600 bg-amber-500/10">
                                    Aquec
                                  </Badge>
                                )}
                                {isExtra && (
                                  <Badge variant="default" className="text-[10px]">
                                    Extra
                                  </Badge>
                                )}
                                {setRecord.editedAt && (
                                  <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-500/40">
                                    C
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() =>
                                    setEditingContext({
                                      mode: "active",
                                      sessionId: activeWorkout.id,
                                      exerciseDefinitionId: currentExercise.definitionId,
                                      exerciseName: currentExercise.exerciseName,
                                      setRecord,
                                      measurementType: currentExercise.measurementType,
                                      loadConvention: currentExercise.loadConvention,
                                    })
                                  }
                                >
                                  Corrigir
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Formulário da Série Ativa */}
                    <ActiveSetCard
                      key={`set-${currentExerciseIndex}-${currentSetNumber}`}
                      exerciseName={currentExercise?.exerciseName}
                      targetMuscles={currentExercise?.targetMuscles}
                      currentSet={currentSetNumber}
                      totalSets={currentExercise?.expectedSets || 4}
                      weight={currentDraft.weight}
                      reps={currentDraft.reps}
                      rir={currentDraft.rir}
                      isWarmup={currentDraft.isWarmup}
                      isExtra={currentDraft.isExtra}
                      measurementType={currentExercise?.measurementType || "reps"}
                      loadConvention={currentExercise?.loadConvention || "total"}
                      onDraftChange={updateDraft}
                      onCompleteSet={handleCompleteSet}
                    />

                    {/* Botão de Avançar Exercício */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div className="text-xs text-muted-foreground">
                        <span>Próximo exercício: </span>
                        <span className="font-semibold text-foreground">
                          {activeWorkout.exercises[currentExerciseIndex + 1]?.exerciseName || "Conclusão do Treino"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            if (currentExerciseIndex < activeWorkout.exercises.length - 1) {
                              nextExercise();
                            } else {
                              const currentId = activeWorkout.id;
                              const ok = finishWorkout(false);
                              if (ok) {
                                setLastFinishedId(currentId);
                                setIsSessionMinimized(false);
                              }
                            }
                          }}
                          className="gap-1.5 h-9 font-semibold"
                        >
                          <span>
                            {currentExerciseIndex < activeWorkout.exercises.length - 1
                              ? "Próximo Exercício"
                              : "Finalizar Treino"}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>

                        {currentExerciseIndex < activeWorkout.exercises.length - 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("Deseja finalizar o treino antecipadamente? O histórico será salvo.")) {
                                const currentId = activeWorkout.id;
                                const ok = finishWorkout(true);
                                if (ok) {
                                  setLastFinishedId(currentId);
                                  setIsSessionMinimized(false);
                                }
                              }
                            }}
                            className="text-xs text-muted-foreground underline underline-offset-2"
                          >
                            Finalizar Incompleto
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Coluna Secundária: Descanso com Temporizador */}
                  <div className="lg:col-span-5 space-y-4">
                    <RestTimer />

                    {/* Lista Rápida dos Exercícios da Sessão */}
                    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Sequência do Treino {activeWorkout.letter}
                      </h3>
                      <ul className="space-y-1.5 text-xs">
                        {activeWorkout.exercises.map((ex, idx) => {
                          const isCurrent = idx === currentExerciseIndex;
                          const isDone = idx < currentExerciseIndex;
                          return (
                            <li
                              key={ex.exerciseName}
                              className={`p-2.5 rounded-lg flex items-center justify-between transition-colors ${
                                isCurrent
                                  ? "bg-primary text-primary-foreground font-semibold"
                                  : isDone
                                  ? "text-muted-foreground line-through bg-muted/30"
                                  : "text-foreground bg-muted/10"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate mr-2">
                                <span className="font-mono text-[11px] opacity-70">
                                  #{idx + 1}
                                </span>
                                <span className="truncate">{ex.exerciseName}</span>
                              </div>
                              {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA: EXERCÍCIOS (CATÁLOGO INDEPENDENTE F2.1) */}
        {activeTab === "exercicios" && (
          <ExerciseCatalogView onGoToSession={() => setActiveTab("treinos")} />
        )}

        {/* ABA: HISTÓRICO */}
        {activeTab === "historico" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <History className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Histórico de Execuções
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Treinos Anteriores
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Registros dos treinos e sobrecargas consolidadas.
              </p>
            </div>

            <div className="space-y-3">
              <HistoryList onSessionClick={(session) => setSelectedSessionId(session.id)} />
            </div>
          </div>
        )}

        {/* ABA: PROGRESSO */}
        {activeTab === "progresso" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Métricas Locais
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Progresso do Mês
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Métricas calculadas a partir das sessões armazenadas localmente.
              </p>
            </div>

            {(() => {
              const now = new Date();
              const thisMonthWorkouts = completedWorkouts.filter(
                (w) =>
                  new Date(w.startTime).getMonth() === now.getMonth() &&
                  new Date(w.startTime).getFullYear() === now.getFullYear()
              );
              const completedCount = thisMonthWorkouts.filter((w) => w.status !== "partial").length;
              const partialCount = thisMonthWorkouts.filter((w) => w.status === "partial").length;

              let totalWorkSets = 0;
              let totalWarmupSets = 0;
              let totalExtraSets = 0;
              let totalTonnage = 0;

              thisMonthWorkouts.forEach((w) => {
                w.exercises.forEach((ex) => {
                  ex.sets.forEach((s) => {
                    const isWarmup = s.type === "warmup";
                    const isExtra = Boolean(s.isExtra || s.type === "extra");
                    if (isWarmup) totalWarmupSets++;
                    else totalWorkSets++;
                    if (isExtra) totalExtraSets++;

                    if (!isWarmup && ex.measurementType === "reps" && ex.loadConvention !== "bodyweight") {
                      const mult = ex.loadConvention === "per_implement" ? 2 : 1;
                      totalTonnage += (s.weight || 0) * mult * (s.reps || 0);
                    }
                  });
                });
              });

              const workoutsWithDuration = thisMonthWorkouts.filter((w) => w.durationMs && w.durationMs > 0);
              const avgDuration =
                workoutsWithDuration.length > 0
                  ? workoutsWithDuration.reduce((acc, w) => acc + (w.durationMs || 0), 0) /
                    workoutsWithDuration.length
                  : 0;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-center">
                      <span className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">
                        {thisMonthWorkouts.length}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Sessões Totais
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        {completedCount} completas · {partialCount} parciais
                      </span>
                    </div>

                    <div className="p-5 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-center">
                      <span className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">
                        {totalWorkSets}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Séries de Trabalho
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        +{totalWarmupSets} aquec. · {totalExtraSets} extras
                      </span>
                    </div>

                    <div className="p-5 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-center">
                      <span className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">
                        {totalTonnage > 0 ? `${Math.round(totalTonnage)} kg` : "0 kg"}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Volume Externo
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Apenas trabalho com reps
                      </span>
                    </div>

                    <div className="p-5 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-center">
                      <span className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">
                        {avgDuration > 0 ? `${Math.floor(avgDuration / 60000)}m` : "-"}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Duração Média
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Tempo de sessão ativa
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <ExportDataPanel />
          </div>
        )}

        {/* Editor de Séries (Usado no Treino Ativo e no Histórico) */}
        {editingContext && (
          <SetEditorDialog
            open={!!editingContext}
            onOpenChange={(open) => !open && setEditingContext(null)}
            context={editingContext}
            onSave={(ctx, updates) => {
              if (ctx.mode === "history") {
                updateHistoricalSet(ctx.sessionId, ctx.setRecord.id, updates);
              } else {
                updateSet(ctx.setRecord.id, updates);
              }
              setEditingContext(null);
            }}
            onDelete={(ctx) => {
              if (ctx.mode === "history") {
                deleteHistoricalSet(ctx.sessionId, ctx.setRecord.id);
              } else {
                deleteSet(ctx.setRecord.id);
              }
              setEditingContext(null);
            }}
          />
        )}

        {/* Detalhe da Sessão Histórica ou Resumo Final */}
        {activeDetailSession && (
          <HistorySessionDetail
            session={activeDetailSession}
            open={!!activeDetailSession}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedSessionId(null);
                setLastFinishedId(null);
              }
            }}
            onEditSet={(ctx) => {
              setEditingContext(ctx);
            }}
            onUpdateObservation={(sessionId, obs) => {
              updateSessionObservation(sessionId, obs);
            }}
          />
        )}
      </main>

      {/* Barra de Navegação Inferior Flutuante Fixa */}
      <div className="fixed bottom-4 sm:bottom-6 inset-x-0 px-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNavigation
            activeId={activeTab}
            onChange={(id) => setActiveTab(id)}
          />
        </div>
      </div>
    </div>
  );
}
