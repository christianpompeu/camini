"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  TrendingUp,
  History,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
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
import { useWorkoutStore } from "@/store/useWorkoutStore";

export interface WorkoutExerciseDef {
  id: string;
  name: string;
  measurementType: "reps" | "duration" | "distance";
  loadConvention: "total" | "per_implement" | "additional" | "bodyweight";
  expectedSets: number;
  targetMuscles: string;
}

interface WorkoutDef {
  letter: "A" | "B" | "C" | "D" | "E";
  title: string;
  focus: string;
  exerciseCount: number;
  lastExecuted: string;
  estimatedMinutes: number;
  exercises: WorkoutExerciseDef[];
}

const WORKOUT_PROGRAM: WorkoutDef[] = [
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
  const [editingSet, setEditingSet] = useState<(SetRecord & { _sessionId?: string }) | null>(null);
  const [selectedHistorySession, setSelectedHistorySession] = useState<WorkoutSession | null>(null);
  const [lastFinishedId, setLastFinishedId] = useState<string | null>(null);

  const {
    hasHydrated,
    activeWorkout,
    startWorkout,
    logSet,
    nextExercise,
    finishWorkout,
    discardWorkout,
    startTimer,
    updateDraft,
    updateSet,
    deleteSet,
  } = useWorkoutStore();

  const handleStartWorkoutSession = (workout: WorkoutDef) => {
    startWorkout(workout);
    setActiveTab("treinos");
  };

  const handleCompleteSet = ({ weight, reps, rir, isWarmup, isExtra }: { weight: number, reps: number, rir: number, isWarmup: boolean, isExtra?: boolean }) => {
    const type = isExtra ? "extra" : (isWarmup ? "warmup" : "work");
    logSet({ weight, reps, rir, type });
    startTimer(90);
  };

  const currentExerciseIndex = activeWorkout?.activeExerciseIndex || 0;
  const currentExercise = activeWorkout?.exercises[currentExerciseIndex];
  const currentSetNumber = (currentExercise?.sets?.length || 0) + 1;
  const isSessionCompleted = activeWorkout?.isCompleted;

  const lastSet = currentExercise?.sets?.length ? currentExercise.sets[currentExercise.sets.length - 1] : null;
  const currentDraft = currentExercise?.draft || {
    weight: lastSet ? lastSet.weight : 30,
    reps: lastSet ? (lastSet.reps || 10) : 10,
    rir: 2,
    isWarmup: currentSetNumber === 1,
  };

  if (!hasHydrated) return null; // Hydration step before render

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

            {/* Grid dos Cards de Treino (Apenas se não houver treino ativo) */}
            {!activeWorkout && (
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
                    onStart={() => handleStartWorkoutSession(workout)}
                  />
                ))}
              </div>
            )}

            {/* Sessão em Andamento do Treino Selecionado */}
            {activeWorkout && (
            <div className="pt-4 border-t border-border space-y-6">
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
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Séries Registradas</h3>
                        {currentExercise.sets.map((setRecord, idx) => (
                          <div key={setRecord.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="w-16 justify-center">Série {idx + 1}</Badge>
                              <span className="text-sm font-semibold">
                                {currentExercise.loadConvention !== "bodyweight" ? `${setRecord.weight} kg x ` : ""}
                                {currentExercise.measurementType === "duration" ? `${setRecord.durationSeconds || setRecord.reps} seg` : 
                                 currentExercise.measurementType === "distance" ? `${setRecord.distanceMeters || setRecord.reps} m` : 
                                 `${setRecord.reps} reps`}
                              </span>
                              {setRecord.type === "warmup" && <Badge variant="secondary" className="text-[10px]">Aquec</Badge>}
                              {setRecord.type === "extra" && <Badge variant="default" className="text-[10px]">Extra</Badge>}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setEditingSet(setRecord)}>
                                Corrigir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulário da Série Ativa */}
                      <ActiveSetCard
                        key={`set-${currentExerciseIndex}-${currentSetNumber}`} // Força re-render limpo a cada nova série/exercício
                        exerciseName={currentExercise?.exerciseName}
                        targetMuscles={currentExercise?.targetMuscles}
                        currentSet={currentSetNumber}
                        totalSets={currentExercise?.expectedSets || 4}
                        weight={currentDraft.weight}
                        reps={currentDraft.reps}
                        rir={currentDraft.rir}
                        isWarmup={currentDraft.isWarmup}
                        isExtra={currentSetNumber > (currentExercise?.expectedSets || 4)}
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
                                finishWorkout(false); // finish completo
                                setLastFinishedId(currentId);
                              }
                            }}
                            className="gap-1.5 h-9 font-semibold"
                          >
                            <span>{currentExerciseIndex < activeWorkout.exercises.length - 1 ? "Próximo Exercício" : "Finalizar Treino"}</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>

                          {currentExerciseIndex < activeWorkout.exercises.length - 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (window.confirm("Deseja finalizar o treino antecipadamente? O histórico será salvo.")) {
                                  const currentId = activeWorkout.id;
                                  finishWorkout(true);
                                  setLastFinishedId(currentId);
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

        {/* ABA: EXERCÍCIOS (CONSULTA E INSTRUÇÕES) */}
        {activeTab === "exercicios" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-border pb-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Biblioteca de Execução
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Instruções dos Exercícios
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Consulte a mecânica exata, músculos ativados e pontos de atenção para cada movimento.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-12 text-center border border-border rounded-xl bg-muted/10 text-muted-foreground flex flex-col items-center">
                <Dumbbell className="w-10 h-10 mb-3 opacity-50" />
                <h3 className="font-semibold text-foreground mb-1">Catálogo de Exercícios</h3>
                <p className="text-xs max-w-sm">
                  O guia completo de execução e vídeos estará disponível em atualizações futuras.
                </p>
              </div>
            </div>
          </div>
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
              <HistoryList onSessionClick={(session) => setSelectedHistorySession(session)} />
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(() => {
                const now = new Date();
                const thisMonthWorkouts = useWorkoutStore.getState().completedWorkouts.filter(w => new Date(w.startTime).getMonth() === now.getMonth() && new Date(w.startTime).getFullYear() === now.getFullYear());
                const totalSets = thisMonthWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => exAcc + ex.sets.filter(s => s.type !== "warmup").length, 0), 0);
                const workoutsWithDuration = thisMonthWorkouts.filter(w => w.durationMs && w.durationMs > 0);
                const avgDuration = workoutsWithDuration.length > 0 
                  ? workoutsWithDuration.reduce((acc, w) => acc + (w.durationMs || 0), 0) / workoutsWithDuration.length 
                  : 0;

                return (
                  <>
                    <div className="p-6 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-extrabold text-primary mb-2">{thisMonthWorkouts.length}</span>
                      <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sessões</span>
                    </div>
                    <div className="p-6 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-extrabold text-primary mb-2">{totalSets}</span>
                      <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Séries (Trabalho)</span>
                    </div>
                    <div className="p-6 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-extrabold text-primary mb-2">
                        {avgDuration > 0 ? `${Math.floor(avgDuration / 60000)}m` : "-"}
                      </span>
                      <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Duração Média</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <ExportDataPanel />
          </div>
        )}

        {/* Editor de Séries (Usado no Treino Ativo e no Histórico) */}
        {editingSet && (
          <SetEditorDialog
            open={!!editingSet}
            onOpenChange={(open) => !open && setEditingSet(null)}
            setRecord={editingSet}
            measurementType={
              // Descobre o measurementType buscando o exercício correspondente na sessão ativa ou no histórico
              (activeWorkout?.exercises.find(e => e.sets.some(s => s.id === editingSet.id))?.measurementType) || 
              "reps"
            }
            onSave={(setId, updates) => {
              if (editingSet._sessionId) {
                useWorkoutStore.getState().updateHistoricalSet(editingSet._sessionId, setId, updates);
                // Also update the local state so the dialog immediately reflects the change
                setSelectedHistorySession((prev: WorkoutSession | null) => {
                  if (!prev) return prev;
                  const updatedExercises = prev.exercises.map(ex => ({
                    ...ex,
                    sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates, editedAt: Date.now() } : s)
                  }));
                  return { ...prev, exercises: updatedExercises };
                });
              } else {
                updateSet(setId, updates);
              }
              setEditingSet(null);
            }}
            onDelete={(setId) => {
              if (editingSet._sessionId) {
                useWorkoutStore.getState().deleteHistoricalSet(editingSet._sessionId, setId);
                // Atualiza também o estado local
                setSelectedHistorySession((prev: WorkoutSession | null) => {
                  if (!prev) return prev;
                  const updatedExercises = prev.exercises.map(ex => ({
                    ...ex,
                    sets: ex.sets.filter(s => s.id !== setId)
                  }));
                  return { ...prev, exercises: updatedExercises };
                });
              } else {
                deleteSet(setId);
              }
              setEditingSet(null);
            }}
          />
        )}

        {/* Detalhe da Sessão Histórica ou Resumo Final */}
        {(selectedHistorySession || lastFinishedId) && (
          <HistorySessionDetail
            session={selectedHistorySession || useWorkoutStore.getState().completedWorkouts.find(w => w.id === lastFinishedId) || null}
            open={!!selectedHistorySession || !!lastFinishedId}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedHistorySession(null);
                setLastFinishedId(null);
              }
            }}
            onEditSet={(set, measurementType, sessionId) => {
              setEditingSet({ ...set, _sessionId: sessionId }); // pass along session id for history editing
            }}
            onUpdateObservation={(sessionId, obs) => {
              useWorkoutStore.getState().updateSessionObservation(sessionId, obs);
              if (selectedHistorySession) {
                setSelectedHistorySession((prev: WorkoutSession | null) => (prev ? { ...prev, observation: obs } : prev));
              }
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
