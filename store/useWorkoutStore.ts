import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type MeasurementType = "reps" | "duration" | "distance";
export type LoadConvention = "total" | "per_implement" | "additional" | "bodyweight";

export interface ExerciseDefinition {
  id: string;
  name: string;
  measurementType: MeasurementType;
  loadConvention: LoadConvention;
  targetMuscles: string;
}

export interface SetRecord {
  id: string;
  type: "warmup" | "work";
  weight: number; // zero is valid
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rir?: number; // 0, 1, 2, 3, 4+ or undefined
  completedAt: number;
}

// Em progresso, mantemos os valores parciais.
export interface SetDraft {
  weight: number;
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rir?: number;
  isWarmup: boolean;
}

export interface SessionExercise {
  definitionId: string;
  exerciseName: string;
  measurementType: MeasurementType;
  loadConvention: LoadConvention;
  targetMuscles: string;
  expectedSets: number;
  sets: SetRecord[];
  draft?: SetDraft; // preserva digitado não concluído
}

export interface WorkoutVersionSnapshot {
  versionId: string;
  // Outros metadados do snapshot
}

export interface WorkoutSession {
  id: string;
  letter: string;
  title: string;
  startTime: number;
  endedAt?: number;
  activeExerciseIndex: number;
  exercises: SessionExercise[];
  isCompleted: boolean;
}

export interface RestTimerState {
  status: "idle" | "running" | "paused" | "finished";
  endsAt: number | null; // Data limite em milissegundos
  remainingMsWhenPaused: number | null;
  durationMs: number;
}

interface WorkoutStore {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  activeWorkout: WorkoutSession | null;
  restTimer: RestTimerState;
  completedWorkouts: WorkoutSession[];

  startWorkout: (workoutDef: { letter: string; title: string; focus: string; exercises: Array<{ name: string, measurementType: MeasurementType, loadConvention: LoadConvention, expectedSets: number, targetMuscles: string }> }) => void;
  logSet: (set: Partial<SetRecord> & { type: "warmup" | "work", weight: number }) => void;
  updateSet: (setId: string, updates: Partial<SetRecord>) => void;
  deleteSet: (setId: string) => void;
  updateDraft: (draft: SetDraft) => void;
  
  nextExercise: () => void;
  finishWorkout: (isPartial?: boolean) => void;
  discardWorkout: () => void;

  // Controle de Tempo
  startTimer: (durationSeconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  skipTimer: () => void;
  resetTimer: () => void;
  addTime: (seconds: number) => void;
  recalculateTimer: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),

      activeWorkout: null,
      completedWorkouts: [],
      restTimer: {
        status: "idle",
        endsAt: null,
        remainingMsWhenPaused: null,
        durationMs: 90000,
      },

      startWorkout: (workoutDef: { letter: string; title: string; focus: string; exercises: Array<{ name: string, measurementType: MeasurementType, loadConvention: LoadConvention, expectedSets: number, targetMuscles: string }> }) => {
        const exercises: SessionExercise[] = workoutDef.exercises.map((ex, idx) => ({
          definitionId: `ex-${idx}`,
          exerciseName: ex.name,
          measurementType: ex.measurementType,
          loadConvention: ex.loadConvention,
          targetMuscles: ex.targetMuscles || workoutDef.focus,
          expectedSets: ex.expectedSets,
          sets: [],
        }));

        set({
          activeWorkout: {
            id: Date.now().toString(),
            letter: workoutDef.letter,
            title: workoutDef.title,
            startTime: Date.now(),
            activeExerciseIndex: 0,
            exercises,
            isCompleted: false,
          },
          restTimer: { status: "idle", endsAt: null, remainingMsWhenPaused: null, durationMs: 90000 },
        });
      },

      logSet: (setRecord) => {
        const { activeWorkout } = get();
        // Não rejeita weight <= 0. Zero é válido para bodyweight, por exemplo.
        // Apenas recusa valores não numéricos.
        if (!activeWorkout || Number.isNaN(setRecord.weight)) return;
        
        // Verifica as medidas obrigatórias do tipo
        const currentExIndex = activeWorkout.activeExerciseIndex;
        const currentExercise = activeWorkout.exercises[currentExIndex];

        if (currentExercise.measurementType === "reps" && (!setRecord.reps || setRecord.reps <= 0)) return;
        if (currentExercise.measurementType === "duration" && (!setRecord.durationSeconds || setRecord.durationSeconds <= 0)) return;
        if (currentExercise.measurementType === "distance" && (!setRecord.distanceMeters || setRecord.distanceMeters <= 0)) return;

        const newSet: SetRecord = {
          id: Date.now().toString(),
          type: setRecord.type,
          weight: setRecord.weight,
          reps: setRecord.reps,
          durationSeconds: setRecord.durationSeconds,
          distanceMeters: setRecord.distanceMeters,
          rir: setRecord.rir,
          completedAt: Date.now(),
        };

        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[currentExIndex] = {
          ...currentExercise,
          sets: [...currentExercise.sets, newSet],
          draft: undefined, // limpa rascunho
        };

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: updatedExercises,
          },
        });
      },

      updateSet: (setId, updates) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        
        const currentExIndex = activeWorkout.activeExerciseIndex;
        const currentExercise = activeWorkout.exercises[currentExIndex];

        const updatedSets = currentExercise.sets.map(s => s.id === setId ? { ...s, ...updates } : s);
        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[currentExIndex] = { ...currentExercise, sets: updatedSets };

        set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } });
      },

      deleteSet: (setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        
        const currentExIndex = activeWorkout.activeExerciseIndex;
        const currentExercise = activeWorkout.exercises[currentExIndex];

        const updatedSets = currentExercise.sets.filter(s => s.id !== setId);
        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[currentExIndex] = { ...currentExercise, sets: updatedSets };

        set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } });
      },

      updateDraft: (draft) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        
        const currentExIndex = activeWorkout.activeExerciseIndex;
        const currentExercise = activeWorkout.exercises[currentExIndex];

        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[currentExIndex] = { ...currentExercise, draft };
        set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } });
      },

      nextExercise: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        if (activeWorkout.activeExerciseIndex < activeWorkout.exercises.length - 1) {
          set({
            activeWorkout: {
              ...activeWorkout,
              activeExerciseIndex: activeWorkout.activeExerciseIndex + 1,
            },
            restTimer: { status: "idle", endsAt: null, remainingMsWhenPaused: null, durationMs: 90000 },
          });
        }
      },

      finishWorkout: (isPartial = false) => {
        const { activeWorkout, completedWorkouts } = get();
        if (!activeWorkout) return;

        const finished = { 
          ...activeWorkout, 
          isCompleted: !isPartial, 
          endedAt: Date.now() 
        };
        set({
          activeWorkout: null,
          restTimer: { status: "idle", endsAt: null, remainingMsWhenPaused: null, durationMs: 90000 },
          completedWorkouts: [finished, ...completedWorkouts],
        });
      },

      discardWorkout: () => {
        // Exige confirmação na UI antes de chamar.
        set({
          activeWorkout: null,
          restTimer: { status: "idle", endsAt: null, remainingMsWhenPaused: null, durationMs: 90000 },
        });
      },

      startTimer: (durationSeconds = 90) => {
        const durationMs = durationSeconds * 1000;
        set({
          restTimer: {
            status: "running",
            endsAt: Date.now() + durationMs,
            remainingMsWhenPaused: null,
            durationMs,
          },
        });
      },

      pauseTimer: () => {
        const { restTimer } = get();
        if (restTimer.status !== "running" || !restTimer.endsAt) return;
        
        const remainingMs = Math.max(0, restTimer.endsAt - Date.now());
        set({
          restTimer: {
            ...restTimer,
            status: "paused",
            remainingMsWhenPaused: remainingMs,
            endsAt: null,
          }
        });
      },

      resumeTimer: () => {
        const { restTimer } = get();
        if (restTimer.status !== "paused" || restTimer.remainingMsWhenPaused === null) return;
        
        set({
          restTimer: {
            ...restTimer,
            status: "running",
            endsAt: Date.now() + restTimer.remainingMsWhenPaused,
            remainingMsWhenPaused: null,
          }
        });
      },

      skipTimer: () => {
        set((state) => ({
          restTimer: {
            ...state.restTimer,
            status: "finished",
            endsAt: Date.now(),
            remainingMsWhenPaused: null,
          },
        }));
      },

      resetTimer: () => {
        set((state) => ({
          restTimer: {
            status: "idle",
            endsAt: null,
            remainingMsWhenPaused: null,
            durationMs: state.restTimer.durationMs,
          },
        }));
      },

      addTime: (seconds) => {
        const ms = seconds * 1000;
        const { restTimer } = get();
        
        if (restTimer.status === "running" && restTimer.endsAt) {
          set({ restTimer: { ...restTimer, endsAt: restTimer.endsAt + ms }});
        } else if (restTimer.status === "paused" && restTimer.remainingMsWhenPaused !== null) {
          set({ restTimer: { ...restTimer, remainingMsWhenPaused: restTimer.remainingMsWhenPaused + ms }});
        } else if (restTimer.status === "finished") {
          // Volta a rodar adicionando ao tempo atual
          set({ restTimer: { ...restTimer, status: "running", endsAt: Date.now() + ms }});
        }
      },

      recalculateTimer: () => {
        // UI can call this on visibilitychange to trigger state updates if it reached zero
        const { restTimer } = get();
        if (restTimer.status === "running" && restTimer.endsAt && Date.now() >= restTimer.endsAt) {
          set({ restTimer: { ...restTimer, status: "finished" }});
        }
      },
    }),
    {
      name: "camini-workout-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1, // introduz schemaVersion validada
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const state = persistedState as any;
          // Migração de estado legado para versão 1
          if (state.activeWorkout) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            state.activeWorkout.exercises = state.activeWorkout.exercises.map((ex: any) => ({
              ...ex,
              definitionId: ex.definitionId || 'legacy',
              measurementType: 'reps',
              loadConvention: 'total',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sets: ex.sets.map((s: any) => ({
                ...s,
                type: s.isWarmup ? "warmup" : "work",
                // Remover isWarmup em favor de type no modelo novo, se preferir
              }))
            }));
          }
          if (state.restTimer) {
             state.restTimer.status = state.restTimer.isActive ? "running" : "idle";
             state.restTimer.endsAt = state.restTimer.startTime ? state.restTimer.startTime + (state.restTimer.durationSeconds * 1000) : null;
             state.restTimer.durationMs = (state.restTimer.durationSeconds || 90) * 1000;
          }
          return state;
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
