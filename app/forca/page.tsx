"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Componentes da Linha Stitch Monochrome Discipline
import { TodayDashboardView } from "@/components/forca/today-dashboard-view";
import { WorkoutPreviewView } from "@/components/forca/workout-preview-view";
import { ActiveSessionView } from "@/components/forca/active-session-view";
import { RestScreenView } from "@/components/forca/rest-screen-view";
import { WorkoutSequenceModal } from "@/components/forca/workout-sequence-modal";
import { ExerciseReplacerDialog } from "@/components/forca/exercise-replacer-dialog";
import { EarlyFinishDialog } from "@/components/forca/early-finish-dialog";
import { SessionSummaryView } from "@/components/forca/session-summary-view";
import { SettingsDialog } from "@/components/forca/settings-dialog";
import { ForcaBottomNav, ForcaNavItemId } from "@/components/forca/forca-bottom-nav";
import { FloatingWorkoutBar } from "@/components/workout/floating-workout-bar";

// Componentes de Apoio e Gestão
import { SetEditorDialog } from "@/components/workout/set-editor-dialog";
import { HistoryList } from "@/components/workout/history-list";
import { HistorySessionDetail } from "@/components/workout/history-session-detail";
import { ExportDataPanel } from "@/components/workout/export-data-panel";
import { ExerciseCatalogView } from "@/components/catalog/exercise-catalog-view";
import { WorkoutPlanListView } from "@/components/plans/workout-plan-list-view";
import { WorkoutPlanEditorView } from "@/components/plans/workout-plan-editor-view";
import { WorkoutPlanReviewView } from "@/components/plans/workout-plan-review-view";
import { WorkoutDivisionDetailView } from "@/components/plans/workout-division-detail-view";

// Stores & Hooks
import { useWorkoutStore, SetRecord, EditSetContext, SessionExercise } from "@/store/useWorkoutStore";
import { useWorkoutPlanStore } from "@/store/useWorkoutPlanStore";
import { useExerciseCatalogStore } from "@/store/useExerciseCatalogStore";
import { useRestCountdown } from "@/hooks/useRestCountdown";
import { WorkoutPlan, WorkoutDivision } from "@/types/workout-plan";

export interface WorkoutExerciseDef {
  id: string;
  name: string;
  measurementType: "reps" | "duration" | "distance";
  loadConvention: "total" | "per_implement" | "additional" | "bodyweight";
  expectedSets: number;
  targetMuscles: string;
}

export interface WorkoutDef {
  letter: string;
  title: string;
  focus: string;
  exerciseCount: number;
  lastExecuted: string;
  estimatedMinutes: number;
  exercises: WorkoutExerciseDef[];
  planId?: string;
  divisionId?: string;
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
    lastExecuted: "-",
    estimatedMinutes: 45,
    exercises: [
      { id: "levantamento_terra", name: "Levantamento Terra convencional", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Cadeia Posterior" },
      { id: "remada_curvada_com_barra", name: "Remada curvada com barra", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Dorsais" },
      { id: "remada_unilateral_com_halter", name: "Remada unilateral com halter", measurementType: "reps", loadConvention: "per_implement", expectedSets: 3, targetMuscles: "Dorsais" },
      { id: "crucifixo_inverso_inclinado_com_halteres", name: "Crucifixo inverso inclinado com halteres", measurementType: "reps", loadConvention: "per_implement", expectedSets: 2, targetMuscles: "Deltoide Posterior" },
      { id: "rosca_direta_com_barra", name: "Rosca direta com barra", measurementType: "reps", loadConvention: "total", expectedSets: 3, targetMuscles: "Bíceps" },
    ],
  },
  {
    letter: "D",
    title: "Full Body Técnico",
    focus: "Técnico e Equilíbrio",
    exerciseCount: 5,
    lastExecuted: "-",
    estimatedMinutes: 40,
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
  const [activeTab, setActiveTab] = useState<ForcaNavItemId>("hoje");
  const [todaySubView, setTodaySubView] = useState<"dashboard" | "preview" | "active-session" | "rest" | "summary">("dashboard");
  const [selectedPreviewWorkout, setSelectedPreviewWorkout] = useState<WorkoutDef>(WORKOUT_PROGRAM[0]);
  
  // Modais de Sessão
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [replacingExercise, setReplacingExercise] = useState<SessionExercise | null>(null);
  const [isEarlyFinishDialogOpen, setIsEarlyFinishDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(90);

  // Histórico & Edição
  const [editingContext, setEditingContext] = useState<EditSetContext | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [summarySessionId, setSummarySessionId] = useState<string | null>(null);

  // Gestão de Fichas (F2.2)
  const [planViewMode, setPlanViewMode] = useState<"list" | "editor" | "review" | "division-detail">("list");
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<WorkoutDivision | null>(null);

  // Confirmação para troca de treino ativo
  const [pendingSwitchWorkout, setPendingSwitchWorkout] = useState<{
    letter: string;
    title: string;
    onConfirm: () => void;
  } | null>(null);

  const {
    hasHydrated,
    activeWorkout,
    completedWorkouts,
    startWorkout,
    logSet,
    setActiveExerciseIndex,
    replaceExerciseInActiveSession,
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

  const {
    getActivePlan,
    importDraftFromBaseline,
    createNewVersionFromPlan,
    createEmptyPlan,
    savePlan,
    hasHydrated: plansHydrated,
  } = useWorkoutPlanStore();

  const { getExerciseById } = useExerciseCatalogStore();
  const restCountdown = useRestCountdown();
  const activePlan = getActivePlan();

  // Conversão de divisões de WorkoutPlan personalizado para WorkoutDef unificado
  const divisionToWorkoutDef = React.useCallback(
    (plan: WorkoutPlan, division: WorkoutDivision): WorkoutDef => {
      const exercises: WorkoutExerciseDef[] = division.prescribedExercises.map((pEx) => {
        const cat = getExerciseById(pEx.exerciseId);
        return {
          id: pEx.exerciseId,
          name: cat?.name || pEx.exerciseId,
          measurementType: pEx.measurementType || cat?.measurementType || "reps",
          loadConvention: pEx.loadConvention || cat?.loadConvention || "total",
          expectedSets: pEx.targetSets,
          targetMuscles: cat?.targetMuscles || cat?.primaryMuscles?.join(", ") || "",
        };
      });

      return {
        letter: division.letter || division.name.charAt(0) || "A",
        title: division.name,
        focus: division.notes || `${division.prescribedExercises.length} exercícios prescritos`,
        exerciseCount: division.prescribedExercises.length,
        lastExecuted: "-",
        estimatedMinutes: division.estimatedMinutes || Math.max(30, division.prescribedExercises.length * 9),
        exercises,
        planId: plan.id,
        divisionId: division.id,
      };
    },
    [getExerciseById]
  );

  const allAvailableWorkouts: WorkoutDef[] = React.useMemo(() => {
    if (activePlan && activePlan.divisions && activePlan.divisions.length > 0) {
      return activePlan.divisions.map((div) => divisionToWorkoutDef(activePlan, div));
    }
    return WORKOUT_PROGRAM;
  }, [activePlan, divisionToWorkoutDef]);

  const suggestedWorkout: WorkoutDef = React.useMemo(() => {
    if (activeWorkout && !activeWorkout.isCompleted) {
      const current = allAvailableWorkouts.find((w) => w.letter === activeWorkout.letter);
      if (current) return current;
    }
    return allAvailableWorkouts[0] || WORKOUT_PROGRAM[0];
  }, [activeWorkout, allAvailableWorkouts]);

  // Data formatada para a aba Hoje
  const currentDateFormatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date()).toUpperCase();

  // Se houver treino ativo e o usuário estiver na aba Hoje no modo dashboard,
  // ajusta o subview automaticamente caso o cronômetro esteja correndo
  useEffect(() => {
    if (activeWorkout && !activeWorkout.isCompleted) {
      if (restCountdown.isTimerRunning && todaySubView === "dashboard") {
        // mantém no dashboard ou exibe dock
      }
    }
  }, [activeWorkout, restCountdown.isTimerRunning, todaySubView]);

  if (!hasHydrated || !plansHydrated) return null;

  const currentExerciseIndex = activeWorkout?.activeExerciseIndex || 0;
  const currentExercise = activeWorkout?.exercises[currentExerciseIndex];
  const currentSetNumber = (currentExercise?.sets?.length || 0) + 1;
  const lastSet = currentExercise?.sets?.length
    ? currentExercise.sets[currentExercise.sets.length - 1]
    : null;

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

  // Configurar treino / divisão (editar fichas)
  const handleConfigureWorkout = (workout: WorkoutDef) => {
    if (workout.planId && workout.divisionId && activePlan) {
      const div = activePlan.divisions.find((d) => d.id === workout.divisionId);
      if (div) {
        setSelectedPlan(activePlan);
        setSelectedDivision(div);
        setPlanViewMode("division-detail");
        setActiveTab("fichas");
        return;
      }
    }

    const draft = importDraftFromBaseline();
    savePlan(draft);
    setSelectedPlan(draft);
    const targetDiv = draft.divisions.find((d) => d.letter === workout.letter);
    if (targetDiv) {
      setSelectedDivision(targetDiv);
      setPlanViewMode("division-detail");
    } else {
      setPlanViewMode("editor");
    }
    setActiveTab("fichas");
  };

  // Criar novo rascunho de ficha a partir dos treinos provisórios
  const handleCreateNewPlanDraft = () => {
    const draft = importDraftFromBaseline();
    savePlan(draft);
    setSelectedPlan(draft);
    setPlanViewMode("editor");
    setActiveTab("fichas");
  };

  // Iniciar treino (seja da ficha ativa ou provisório A–E)
  const handleStartWorkout = (workout: WorkoutDef) => {
    if (workout.planId && workout.divisionId && activePlan) {
      const div = activePlan.divisions.find((d) => d.id === workout.divisionId);
      if (div) {
        handleStartPlanDivision(activePlan, div);
        return;
      }
    }

    if (activeWorkout && activeWorkout.letter === workout.letter && !activeWorkout.isCompleted) {
      setTodaySubView("active-session");
      setActiveTab("hoje");
      return;
    }

    if (activeWorkout && !activeWorkout.isCompleted) {
      setPendingSwitchWorkout({
        letter: workout.letter,
        title: workout.title,
        onConfirm: () => {
          startWorkout(workout);
          setTodaySubView("active-session");
          setActiveTab("hoje");
        },
      });
      return;
    }

    startWorkout(workout);
    setTodaySubView("active-session");
    setActiveTab("hoje");
  };

  // Iniciar divisão de plano personalizado
  const handleStartPlanDivision = (plan: WorkoutPlan, division: WorkoutDivision) => {
    const isSameSession =
      activeWorkout &&
      !activeWorkout.isCompleted &&
      ((activeWorkout.divisionId && activeWorkout.divisionId === division.id) ||
        activeWorkout.letter === (division.letter || division.name.charAt(0)));

    if (isSameSession) {
      setTodaySubView("active-session");
      setActiveTab("hoje");
      return;
    }

    const startFn = () => {
      const sessionExercises = division.prescribedExercises.map((pEx) => {
        const catEx = getExerciseById(pEx.exerciseId);
        const primaryCatMedia = catEx?.media?.find((m) => m.role === "execution_start" || m.url)?.url;
        const isVideo = Boolean(catEx?.media?.some((m) => m.role === "video"));
        const targetMuscles = catEx?.targetMuscles || catEx?.primaryMuscles?.join(", ") || "";

        return {
          occurrenceId: pEx.id,
          id: pEx.exerciseId,
          name: catEx?.name || pEx.exerciseId,
          measurementType: pEx.measurementType || catEx?.measurementType || "reps",
          loadConvention: pEx.loadConvention || catEx?.loadConvention || "total",
          expectedSets: pEx.targetSets,
          targetMuscles,
          restSeconds: pEx.restSeconds,
          reps: pEx.targetReps || pEx.minReps,
          repsMin: pEx.minReps,
          repsMax: pEx.maxReps,
          durationSeconds: pEx.targetDurationSeconds,
          distanceMeters: pEx.targetDistanceMeters,
          targetRir: pEx.targetRir,
          initialWeight: pEx.targetWeight,
          laterality: (pEx.laterality || catEx?.laterality || "bilateral") as "bilateral" | "unilateral",
          prescriptionNotes: pEx.notes,
          mediaUrl: primaryCatMedia,
          mediaType: (isVideo ? "video" : "image") as "video" | "image",
        };
      });

      startWorkout({
        letter: division.letter || division.name.charAt(0),
        title: division.name,
        focus: division.notes || division.name,
        planId: plan.id,
        planName: plan.name,
        planVersion: plan.version,
        divisionId: division.id,
        exercises: sessionExercises,
      });
      setTodaySubView("active-session");
      setActiveTab("hoje");
    };

    if (activeWorkout && !activeWorkout.isCompleted) {
      setPendingSwitchWorkout({
        letter: division.letter || division.name.charAt(0),
        title: division.name,
        onConfirm: startFn,
      });
      return;
    }

    startFn();
  };

  // Concluir série na sessão ativa
  const handleCompleteActiveSet = (data: {
    weight: number;
    reps: number;
    rir?: number;
    isWarmup: boolean;
    isExtra: boolean;
  }) => {
    if (!currentExercise) return;
    const type = data.isWarmup ? "warmup" : "work";
    const setPayload: Partial<SetRecord> & { type: "warmup" | "work"; weight: number; isExtra?: boolean } = {
      weight: data.weight,
      type,
      isExtra: data.isExtra,
      rir: data.rir,
    };

    if (currentExercise.measurementType === "reps") {
      setPayload.reps = data.reps;
    } else if (currentExercise.measurementType === "duration") {
      setPayload.durationSeconds = data.reps;
    } else if (currentExercise.measurementType === "distance") {
      setPayload.distanceMeters = data.reps;
    }

    const success = logSet(setPayload);
    if (success) {
      startTimer(defaultRestSeconds);
      // Avança para tela de descanso
      setTodaySubView("rest");
    }
  };

  // Salvar treino parcial
  const handleConfirmSavePartial = () => {
    if (!activeWorkout) return;
    const currentId = activeWorkout.id;
    const ok = finishWorkout(true);
    if (ok) {
      setSummarySessionId(currentId);
      setTodaySubView("summary");
    }
    setIsEarlyFinishDialogOpen(false);
  };

  // Salvar treino completo
  const handleFinishCompleteWorkout = () => {
    if (!activeWorkout) return;
    const currentId = activeWorkout.id;
    const ok = finishWorkout(false);
    if (ok) {
      setSummarySessionId(currentId);
      setTodaySubView("summary");
    }
    setIsEarlyFinishDialogOpen(false);
  };

  // Descartar treino ativo
  const handleConfirmDiscardSession = () => {
    discardWorkout();
    setIsEarlyFinishDialogOpen(false);
    setTodaySubView("dashboard");
  };

  // Encontrar sessão histórica selecionada
  const activeDetailSession =
    (selectedSessionId && completedWorkouts.find((w) => w.id === selectedSessionId)) ||
    (summarySessionId && completedWorkouts.find((w) => w.id === summarySessionId)) ||
    null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Barra de Navegação Superior Global do Camini Hub */}
      <Navbar />

      {/* Sub-header de identificação */}
      <div className="border-b border-border/80 bg-muted/15 px-4 sm:px-6 py-2">
        <div className="max-w-md mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Camini</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground tracking-tight">FORÇA</span>
          </div>

          <div className="flex items-center gap-2">
            {activeWorkout && !activeWorkout.isCompleted && (
              <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Treino {activeWorkout.letter}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <main className={`flex-1 w-full mx-auto px-4 pt-3 pb-28 sm:pb-32 space-y-4 ${
        activeTab === "fichas" || activeTab === "exercicios" ? "max-w-4xl" : "max-w-md"
      }`}>
        {/* ============================================================== */}
        {/* ABA: HOJE (STITCH MONOCHROME DISCIPLINE CORE)                   */}
        {/* ============================================================== */}
        {activeTab === "hoje" && (
          <div className="space-y-4">
            {/* SUB-VIEW: DASHBOARD HOJE (Tela 02) */}
            {todaySubView === "dashboard" && (
              <TodayDashboardView
                currentDateFormatted={currentDateFormatted}
                activePlan={activePlan}
                suggestedWorkout={suggestedWorkout}
                allWorkouts={allAvailableWorkouts}
                hasActiveSession={Boolean(activeWorkout && !activeWorkout.isCompleted)}
                activeSessionLetter={activeWorkout?.letter}
                activeSessionTitle={activeWorkout?.title}
                totalCompletedWorkouts={completedWorkouts.length}
                lastCompletedDate={
                  completedWorkouts.length > 0
                    ? new Date(completedWorkouts[0].startTime).toLocaleDateString("pt-BR")
                    : undefined
                }
                onOpenWorkoutPreview={(w) => {
                  setSelectedPreviewWorkout(w);
                  setTodaySubView("preview");
                }}
                onResumeSession={() => setTodaySubView("active-session")}
                onOpenPlans={() => {
                  setPlanViewMode("list");
                  setActiveTab("fichas");
                }}
                onOpenSchedule={() => {
                  setPlanViewMode("list");
                  setActiveTab("fichas");
                }}
                onOpenDownloads={() => setIsSettingsOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onConfigureWorkout={handleConfigureWorkout}
                onCreateNewPlanDraft={handleCreateNewPlanDraft}
              />
            )}

            {/* SUB-VIEW: PRÉ-VISUALIZAÇÃO DA FICHA (Tela 03) */}
            {todaySubView === "preview" && (
              <WorkoutPreviewView
                workout={selectedPreviewWorkout}
                onBack={() => setTodaySubView("dashboard")}
                onStart={handleStartWorkout}
                onViewExerciseDetails={() => {
                  setActiveTab("exercicios");
                }}
                onConfigure={handleConfigureWorkout}
              />
            )}

            {/* SUB-VIEW: SESSÃO ATIVA (Tela 04) */}
            {todaySubView === "active-session" && activeWorkout && currentExercise && (
              <ActiveSessionView
                workoutLetter={activeWorkout.letter}
                workoutTitle={activeWorkout.title}
                exerciseIndex={currentExerciseIndex}
                totalExercises={activeWorkout.exercises.length}
                currentExercise={currentExercise}
                currentSetNumber={currentSetNumber}
                isExtra={Boolean(currentDraft.isExtra)}
                draftWeight={currentDraft.weight ?? 0}
                draftReps={currentDraft.reps ?? 8}
                draftRir={currentDraft.rir}
                draftIsWarmup={Boolean(currentDraft.isWarmup)}
                draftIsExtra={Boolean(currentDraft.isExtra)}
                lastCompletedSet={lastSet}
                onUpdateDraft={(updates) =>
                  updateDraft({
                    ...currentDraft,
                    ...updates,
                    weight: updates.weight ?? currentDraft.weight ?? 0,
                    reps: updates.reps ?? currentDraft.reps ?? 8,
                    isWarmup: updates.isWarmup ?? Boolean(currentDraft.isWarmup),
                  })
                }
                onCompleteSet={handleCompleteActiveSet}
                onOpenSequence={() => setIsSequenceModalOpen(true)}
                onOpenLibrary={() => setActiveTab("exercicios")}
                onEditPreviousSet={(s) => {
                  setEditingContext({
                    mode: "active",
                    sessionId: activeWorkout.id,
                    exerciseDefinitionId: currentExercise.definitionId,
                    exerciseName: currentExercise.exerciseName,
                    setRecord: s,
                    measurementType: currentExercise.measurementType,
                    loadConvention: currentExercise.loadConvention,
                  });
                }}
                onEarlyFinishRequest={() => setIsEarlyFinishDialogOpen(true)}
              />
            )}

            {/* SUB-VIEW: DESCANSO (Telas 05 e 33) */}
            {todaySubView === "rest" && activeWorkout && currentExercise && (
              <RestScreenView
                exerciseName={currentExercise.exerciseName}
                nextSetNumber={currentSetNumber}
                totalSets={currentExercise.expectedSets}
                plannedWeight={currentDraft.weight ?? 0}
                plannedReps={currentDraft.reps ?? 8}
                measurementType={currentExercise.measurementType}
                timeRemainingFormatted={restCountdown.formattedTime}
                isPaused={restCountdown.isPaused}
                onTogglePause={restCountdown.togglePause}
                onAdd30s={restCountdown.add30Seconds}
                onSkipRest={() => {
                  restCountdown.skipRest();
                  setTodaySubView("active-session");
                }}
                onOpenSequence={() => setIsSequenceModalOpen(true)}
                onOpenLibrary={() => setActiveTab("exercicios")}
              />
            )}

            {/* SUB-VIEW: RESUMO PÓS-TREINO (Telas 10 e 32) */}
            {todaySubView === "summary" && activeDetailSession && (
              <SessionSummaryView
                session={activeDetailSession}
                onSaveObservation={(obs) => {
                  updateSessionObservation(activeDetailSession.id, obs);
                }}
                onGoToHistory={(sId) => {
                  setSelectedSessionId(sId);
                  setActiveTab("historico");
                }}
                onGoHome={() => {
                  setSummarySessionId(null);
                  setTodaySubView("dashboard");
                }}
              />
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA: EXERCÍCIOS (BIBLIOTECA & DETALHE F2.1)                    */}
        {/* ============================================================== */}
        {activeTab === "exercicios" && (
          <div className="pb-16 animate-in fade-in duration-200">
            <ExerciseCatalogView
              onGoToSession={() => {
                setActiveTab("hoje");
                if (activeWorkout) {
                  setTodaySubView("active-session");
                }
              }}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA: HISTÓRICO                                                 */}
        {/* ============================================================== */}
        {activeTab === "historico" && (
          <div className="space-y-4 pb-16 animate-in fade-in duration-200">
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Histórico
              </span>
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Sessões Anteriores
              </h1>
            </div>
            <HistoryList
              onSessionClick={(session) => setSelectedSessionId(session.id)}
              onGoToWorkout={() => setActiveTab("hoje")}
              onGoToPlans={() => {
                setPlanViewMode("list");
                setActiveTab("fichas");
              }}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA: PROGRESSO                                                 */}
        {/* ============================================================== */}
        {activeTab === "progresso" && (
          <div className="space-y-4 pb-16 animate-in fade-in duration-200">
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Progresso
              </span>
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Consistência & Cargas
              </h1>
            </div>

            {/* Cards de Métricas de Progresso */}
            {(() => {
              const totalSessions = completedWorkouts.length;
              let totalVolume = 0;
              let totalWorkSets = 0;

              completedWorkouts.forEach((w) => {
                w.exercises.forEach((ex) => {
                  ex.sets.forEach((s) => {
                    if (s.type !== "warmup") {
                      totalWorkSets++;
                      if (ex.measurementType === "reps" && ex.loadConvention !== "bodyweight") {
                        totalVolume += (s.weight || 0) * (s.reps || 0);
                      }
                    }
                  });
                });
              });

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#F5F5F7] dark:bg-zinc-900 rounded-2xl p-3 text-center border border-transparent dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Sessões</span>
                      <span className="text-xl font-extrabold text-zinc-950 dark:text-white">{totalSessions}</span>
                    </div>
                    <div className="bg-[#F5F5F7] dark:bg-zinc-900 rounded-2xl p-3 text-center border border-transparent dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Séries</span>
                      <span className="text-xl font-extrabold text-zinc-950 dark:text-white">{totalWorkSets}</span>
                    </div>
                    <div className="bg-[#F5F5F7] dark:bg-zinc-900 rounded-2xl p-3 text-center border border-transparent dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Volume</span>
                      <span className="text-xl font-extrabold text-zinc-950 dark:text-white">
                        {totalVolume > 0 ? `${Math.round(totalVolume / 1000)}k` : "—"}
                      </span>
                    </div>
                  </div>

                  <ExportDataPanel />
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODO SUB-TELA: FICHAS E PROGRAMAS (F2.2)                        */}
        {/* ============================================================== */}
        {activeTab === "fichas" && (
          <div className="space-y-4 pb-16 animate-in fade-in duration-200">
            <header className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("hoje")}
                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-lg font-bold text-zinc-950 dark:text-white">Minhas Fichas</h1>
            </header>

            {planViewMode === "list" && (
              <WorkoutPlanListView
                onCreateNewPlan={() => {
                  const newPlan = createEmptyPlan("Minha Nova Ficha", "Hipertrofia e força");
                  setSelectedPlan(newPlan);
                  setPlanViewMode("editor");
                }}
                onEditPlan={(plan) => {
                  if (plan.status === "draft") {
                    setSelectedPlan(plan);
                    setPlanViewMode("editor");
                  } else {
                    const newDraft = createNewVersionFromPlan(plan.id);
                    if (newDraft) {
                      setSelectedPlan(newDraft);
                      setPlanViewMode("editor");
                    }
                  }
                }}
                onSelectDivision={(plan, division) => {
                  setSelectedPlan(plan);
                  setSelectedDivision(division);
                  setPlanViewMode("division-detail");
                }}
                onImportBaseline={() => {
                  const draft = importDraftFromBaseline();
                  setSelectedPlan(draft);
                  setPlanViewMode("editor");
                }}
                onGoToCatalog={() => setActiveTab("exercicios")}
              />
            )}

            {planViewMode === "editor" && selectedPlan && (
              <WorkoutPlanEditorView
                initialPlan={selectedPlan}
                onSaveDraft={(savedPlan) => {
                  savePlan(savedPlan);
                  setSelectedPlan(savedPlan);
                }}
                onReview={(revPlan) => {
                  savePlan(revPlan);
                  setSelectedPlan(revPlan);
                  setPlanViewMode("review");
                }}
                onCancel={() => setPlanViewMode("list")}
              />
            )}

            {planViewMode === "review" && selectedPlan && (
              <WorkoutPlanReviewView
                plan={selectedPlan}
                onBack={() => setPlanViewMode("editor")}
                onActivateSuccess={(activated) => {
                  setSelectedPlan(activated);
                  setPlanViewMode("list");
                  setActiveTab("hoje");
                }}
              />
            )}

            {planViewMode === "division-detail" && selectedPlan && selectedDivision && (
              <WorkoutDivisionDetailView
                plan={selectedPlan}
                division={selectedDivision}
                onBack={() => setPlanViewMode("list")}
                onEditPlan={(plan) => {
                  if (plan.status === "draft") {
                    setSelectedPlan(plan);
                    setPlanViewMode("editor");
                  } else {
                    const newDraft = createNewVersionFromPlan(plan.id);
                    if (newDraft) {
                      setSelectedPlan(newDraft);
                      setPlanViewMode("editor");
                    }
                  }
                }}
                onStartSession={(plan, division) => {
                  handleStartPlanDivision(plan, division);
                }}
              />
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAIS E DIÁLOGOS DA SESSÃO ATIVA                              */}
        {/* ============================================================== */}

        {/* Tela 06: Sequência do Treino */}
        {activeWorkout && (
          <WorkoutSequenceModal
            isOpen={isSequenceModalOpen}
            workoutLetter={activeWorkout.letter}
            workoutTitle={activeWorkout.title}
            exercises={activeWorkout.exercises}
            activeIndex={currentExerciseIndex}
            onClose={() => setIsSequenceModalOpen(false)}
            onSelectExercise={(idx) => {
              setActiveExerciseIndex(idx);
              setTodaySubView("active-session");
            }}
            onRequestReplaceExercise={(ex) => setReplacingExercise(ex)}
            onRequestFinish={() => {
              const allDone = activeWorkout.exercises.every(
                (e) => (e.sets?.length || 0) >= e.expectedSets
              );
              if (allDone) {
                handleFinishCompleteWorkout();
              } else {
                setIsEarlyFinishDialogOpen(true);
              }
            }}
          />
        )}

        {/* Tela 08: Substituição Pontual de Exercício */}
        {replacingExercise && (
          <ExerciseReplacerDialog
            isOpen={Boolean(replacingExercise)}
            targetExercise={replacingExercise}
            onClose={() => setReplacingExercise(null)}
            onConfirmReplacement={(oldEx, newEx) => {
              const targetIdx = activeWorkout?.exercises.findIndex(
                (e) => (e.occurrenceId && e.occurrenceId === oldEx.occurrenceId) || e.definitionId === oldEx.definitionId
              );
              if (targetIdx !== undefined && targetIdx >= 0) {
                replaceExerciseInActiveSession(targetIdx, {
                  id: newEx.id,
                  name: newEx.name,
                  measurementType: newEx.measurementType,
                  loadConvention: newEx.loadConvention,
                  targetMuscles: newEx.targetMuscles,
                  reason: newEx.reason,
                });
              }
              setReplacingExercise(null);
            }}
          />
        )}

        {/* Tela 09: Finalização Antecipada / Parcial */}
        {activeWorkout && (
          <EarlyFinishDialog
            isOpen={isEarlyFinishDialogOpen}
            workoutLetter={activeWorkout.letter}
            workoutTitle={activeWorkout.title}
            exercises={activeWorkout.exercises}
            onClose={() => setIsEarlyFinishDialogOpen(false)}
            onConfirmSavePartial={handleConfirmSavePartial}
            onConfirmSaveComplete={handleFinishCompleteWorkout}
            onConfirmDiscard={handleConfirmDiscardSession}
          />
        )}

        {/* Tela 07: Editor de Séries Concluídas */}
        {editingContext && (
          <SetEditorDialog
            open={Boolean(editingContext)}
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

        {/* Detalhe da Sessão no Histórico */}
        {activeDetailSession && todaySubView !== "summary" && (
          <HistorySessionDetail
            session={activeDetailSession}
            open={Boolean(activeDetailSession)}
            onOpenChange={(open) => {
              if (!open) setSelectedSessionId(null);
            }}
            onEditSet={(ctx) => setEditingContext(ctx)}
            onUpdateObservation={(sessionId, obs) => {
              updateSessionObservation(sessionId, obs);
            }}
          />
        )}

        {/* Modal de Ajustes / Configurações */}
        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          defaultRestSeconds={defaultRestSeconds}
          onUpdateDefaultRest={(sec) => setDefaultRestSeconds(sec)}
        />

        {/* Diálogo de Confirmação para Trocar Treino Ativo */}
        <Dialog
          open={Boolean(pendingSwitchWorkout)}
          onOpenChange={(open) => !open && setPendingSwitchWorkout(null)}
        >
          <DialogContent className="max-w-md w-[95vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Trocar de treino em andamento?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1 leading-relaxed">
                Você já possui o <strong>Treino {activeWorkout?.letter}</strong> em andamento. Iniciar o <strong>Treino {pendingSwitchWorkout?.letter}</strong> irá descartar o progresso atual.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPendingSwitchWorkout(null)}
                className="text-xs rounded-xl"
              >
                Continuar Treino {activeWorkout?.letter}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  discardWorkout();
                  pendingSwitchWorkout?.onConfirm();
                  setPendingSwitchWorkout(null);
                }}
                className="text-xs rounded-xl font-semibold"
              >
                Encerrar e Iniciar Novo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      {/* Dock Flutuante do Treino Ativo (Tela 31 - quando navegando fora da sessão ativa) */}
      {activeWorkout && !activeWorkout.isCompleted && (activeTab !== "hoje" || todaySubView === "dashboard") && (
        <FloatingWorkoutBar
          workoutLetter={activeWorkout.letter}
          currentExercise={currentExercise?.exerciseName}
          currentSet={`Série ${currentSetNumber}/${currentExercise?.expectedSets || 4}`}
          timerFormatted={restCountdown.formattedTime}
          isTimerRunning={restCountdown.isTimerRunning}
          onReturnToWorkout={() => {
            setActiveTab("hoje");
            setTodaySubView(restCountdown.isTimerRunning ? "rest" : "active-session");
          }}
        />
      )}

      {/* Barra de Navegação Inferior Canônica com 5 Abas do FORÇA (oculta na sessão ativa para foco total nos controles de treino) */}
      {!(activeTab === "hoje" && (todaySubView === "active-session" || todaySubView === "rest")) && (
        <ForcaBottomNav
          activeId={activeTab}
          onChange={(tabId) => {
            setActiveTab(tabId);
            if (tabId === "fichas") {
              setPlanViewMode("list");
            }
            if (tabId === "hoje" && todaySubView === "summary") {
              setTodaySubView("dashboard");
            }
          }}
          hasActiveSession={Boolean(activeWorkout && !activeWorkout.isCompleted)}
        />
      )}
    </div>
  );
}
