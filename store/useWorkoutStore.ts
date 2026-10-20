import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

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
  type: "warmup" | "work" | "extra";
  isExtra?: boolean;
  weight: number; // zero is valid
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rir?: number; // 0, 1, 2, 3, 4+ or undefined
  completedAt: number;
  editedAt?: number;
  note?: string;
  side?: "left" | "right";
}

// Contexto tipado para edição de série (substitui o _sessionId improvisado)
export interface EditSetContext {
  mode: "active" | "history";
  sessionId: string;
  exerciseDefinitionId: string;
  exerciseName: string;
  setRecord: SetRecord;
  measurementType: MeasurementType;
  loadConvention: LoadConvention;
}

// Em progresso, mantemos os valores parciais.
export interface SetDraft {
  weight: number;
  reps?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rir?: number;
  isWarmup: boolean;
  isExtra?: boolean;
  side?: "left" | "right";
  note?: string;
}

export interface SessionExercise {
  occurrenceId?: string;
  definitionId: string;
  exerciseName: string;
  name?: string; // compatibilidade
  measurementType: MeasurementType;
  loadConvention: LoadConvention;
  targetMuscles: string;
  expectedSets: number;
  prescribedRestSeconds?: number;
  prescribedReps?: number;
  prescribedRepsMin?: number;
  prescribedRepsMax?: number;
  prescribedDurationSeconds?: number;
  prescribedDistanceMeters?: number;
  prescribedRir?: number;
  prescribedWeight?: number;
  prescribedLaterality?: "bilateral" | "unilateral";
  prescribedNotes?: string;
  mediaUrl?: string;
  mediaType?: "video" | "image";
  isSubstitute?: boolean;
  substitutionReason?: string;
  originalExerciseName?: string;
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
  durationMs?: number;
  activeExerciseIndex: number;
  exercises: SessionExercise[];
  isCompleted: boolean; // deprecated, use status
  status?: "completed" | "partial";
  observation?: string;
  schemaVersion?: number;
  localOrigin?: boolean;
  planId?: string;
  planName?: string;
  planVersion?: number;
  divisionId?: string;
}

export interface RestTimerState {
  status: "idle" | "running" | "paused" | "finished";
  endsAt: number | null; // Data limite em milissegundos
  remainingMsWhenPaused: number | null;
  durationMs: number;
}

export function generateSetId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function sanitizeSetRecord(
  measurementType: MeasurementType,
  set: Partial<SetRecord>
): { valid: boolean; sanitized?: Partial<SetRecord>; error?: string } {
  const result: Partial<SetRecord> = { ...set };

  if (set.weight !== undefined) {
    if (!Number.isFinite(set.weight) || set.weight < 0) {
      return { valid: false, error: "A carga deve ser um número maior ou igual a zero." };
    }
  }

  if (set.rir !== undefined) {
    if (!Number.isFinite(set.rir) || set.rir < 0) {
      return { valid: false, error: "O RIR informado é inválido." };
    }
  }

  if (measurementType === "reps") {
    if (set.reps !== undefined) {
      if (!Number.isInteger(set.reps) || set.reps <= 0) {
        return { valid: false, error: "Repetições devem ser um número inteiro positivo." };
      }
    }
    delete result.durationSeconds;
    delete result.distanceMeters;
  } else if (measurementType === "duration") {
    if (set.durationSeconds !== undefined) {
      if (!Number.isFinite(set.durationSeconds) || set.durationSeconds <= 0) {
        return { valid: false, error: "Duração em segundos deve ser maior que zero." };
      }
    }
    delete result.reps;
    delete result.distanceMeters;
  } else if (measurementType === "distance") {
    if (set.distanceMeters !== undefined) {
      if (!Number.isFinite(set.distanceMeters) || set.distanceMeters <= 0) {
        return { valid: false, error: "Distância em metros deve ser maior que zero." };
      }
    }
    delete result.reps;
    delete result.durationSeconds;
  }

  return { valid: true, sanitized: result };
}

interface WorkoutStore {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  activeWorkout: WorkoutSession | null;
  restTimer: RestTimerState;
  completedWorkouts: WorkoutSession[];

  startWorkout: (workoutDef: {
    letter: string;
    title: string;
    focus: string;
    planId?: string;
    planName?: string;
    planVersion?: number;
    divisionId?: string;
    exercises: Array<{
      occurrenceId?: string;
      id: string;
      name: string;
      measurementType: MeasurementType;
      loadConvention: LoadConvention;
      expectedSets: number;
      targetMuscles: string;
      restSeconds?: number;
      reps?: number;
      repsMin?: number;
      repsMax?: number;
      durationSeconds?: number;
      distanceMeters?: number;
      targetRir?: number;
      initialWeight?: number;
      laterality?: "bilateral" | "unilateral";
      prescriptionNotes?: string;
      mediaUrl?: string;
      mediaType?: "video" | "image";
    }>;
  }) => void;
  logSet: (set: Partial<SetRecord> & { type: "warmup" | "work" | "extra", weight: number, isExtra?: boolean }) => boolean;
  updateSet: (setId: string, updates: Partial<SetRecord>) => boolean;
  deleteSet: (setId: string) => void;
  updateDraft: (draft: SetDraft) => void;
  updateHistoricalSet: (sessionId: string, setId: string, updates: Partial<SetRecord>) => boolean;
  deleteHistoricalSet: (sessionId: string, setId: string) => void;
  updateSessionObservation: (sessionId: string, observation: string) => void;
  
  nextExercise: () => void;
  setActiveExerciseIndex: (index: number) => void;
  replaceExerciseInActiveSession: (
    exerciseIndex: number,
    newExercise: {
      id: string;
      name: string;
      measurementType: MeasurementType;
      loadConvention: LoadConvention;
      targetMuscles: string;
      reason?: string;
    }
  ) => void;
  finishWorkout: (isPartial?: boolean) => boolean;
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

const dummyStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

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

      startWorkout: (workoutDef) => {
        const exercises: SessionExercise[] = workoutDef.exercises.map((ex) => ({
          occurrenceId: ex.occurrenceId,
          definitionId: ex.id,
          exerciseName: ex.name,
          name: ex.name,
          measurementType: ex.measurementType,
          loadConvention: ex.loadConvention,
          targetMuscles: ex.targetMuscles || workoutDef.focus,
          expectedSets: ex.expectedSets,
          prescribedRestSeconds: ex.restSeconds,
          prescribedReps: ex.reps,
          prescribedRepsMin: ex.repsMin,
          prescribedRepsMax: ex.repsMax,
          prescribedDurationSeconds: ex.durationSeconds,
          prescribedDistanceMeters: ex.distanceMeters,
          prescribedRir: ex.targetRir,
          prescribedWeight: ex.initialWeight,
          prescribedLaterality: ex.laterality,
          prescribedNotes: ex.prescriptionNotes,
          mediaUrl: ex.mediaUrl,
          mediaType: ex.mediaType,
          sets: [],
        }));

        const initialRestDurationMs =
          (exercises[0]?.prescribedRestSeconds || 90) * 1000;

        set({
          activeWorkout: {
            id: generateSetId(),
            letter: workoutDef.letter,
            title: workoutDef.title,
            planId: workoutDef.planId,
            planName: workoutDef.planName,
            planVersion: workoutDef.planVersion,
            divisionId: workoutDef.divisionId,
            startTime: Date.now(),
            activeExerciseIndex: 0,
            exercises,
            isCompleted: false,
            schemaVersion: 1,
            localOrigin: true,
          },
          restTimer: {
            status: "idle",
            endsAt: null,
            remainingMsWhenPaused: null,
            durationMs: initialRestDurationMs,
          },
        });
      },

      logSet: (setRecord) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return false;

        const currentExIndex = activeWorkout.activeExerciseIndex;
        const currentExercise = activeWorkout.exercises[currentExIndex];
        if (!currentExercise) return false;

        // Validação de número finito e >= 0 para peso (zero é permitido)
        if (!Number.isFinite(setRecord.weight) || setRecord.weight < 0) return false;

        // Validação conforme tipo de medida
        if (currentExercise.measurementType === "reps") {
          if (!setRecord.reps || !Number.isInteger(setRecord.reps) || setRecord.reps <= 0) return false;
        } else if (currentExercise.measurementType === "duration") {
          if (!setRecord.durationSeconds || !Number.isFinite(setRecord.durationSeconds) || setRecord.durationSeconds <= 0) return false;
        } else if (currentExercise.measurementType === "distance") {
          if (!setRecord.distanceMeters || !Number.isFinite(setRecord.distanceMeters) || setRecord.distanceMeters <= 0) return false;
        }

        // Prevenção contra duplo toque rápido (debounce de 300ms com parâmetros idênticos)
        const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
        const now = Date.now();
        if (lastSet && (now - lastSet.completedAt < 300)) {
          const sameWeight = lastSet.weight === setRecord.weight;
          const sameReps = lastSet.reps === setRecord.reps;
          const sameDur = lastSet.durationSeconds === setRecord.durationSeconds;
          const sameDist = lastSet.distanceMeters === setRecord.distanceMeters;
          if (sameWeight && sameReps && sameDur && sameDist) {
            return false;
          }
        }

        const isExtra = Boolean(setRecord.isExtra || setRecord.type === "extra");
        const finalType: "warmup" | "work" = setRecord.type === "warmup" ? "warmup" : "work";

        const newSet: SetRecord = {
          id: generateSetId(),
          type: finalType,
          isExtra,
          weight: setRecord.weight,
          reps: currentExercise.measurementType === "reps" ? setRecord.reps : undefined,
          durationSeconds: currentExercise.measurementType === "duration" ? setRecord.durationSeconds : undefined,
          distanceMeters: currentExercise.measurementType === "distance" ? setRecord.distanceMeters : undefined,
          rir: setRecord.rir !== undefined ? setRecord.rir : undefined,
          completedAt: now,
          side: setRecord.side,
          note: setRecord.note?.trim() || undefined,
        };

        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[currentExIndex] = {
          ...currentExercise,
          sets: [...currentExercise.sets, newSet],
          draft: undefined, // Limpa o rascunho ao registrar a série
        };

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: updatedExercises,
          },
        });
        return true;
      },

      updateSet: (setId, updates) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return false;

        const currentExIndex = activeWorkout.activeExerciseIndex;
        const currentExercise = activeWorkout.exercises[currentExIndex];
        if (!currentExercise) return false;

        const targetSet = currentExercise.sets.find((s) => s.id === setId);
        if (!targetSet) return false;

        const validation = sanitizeSetRecord(currentExercise.measurementType, updates);
        if (!validation.valid || !validation.sanitized) return false;

        const cleanedUpdates = validation.sanitized;

        const updatedSets = currentExercise.sets.map((s) => {
          if (s.id !== setId) return s;
          return {
            ...s,
            ...cleanedUpdates,
            id: s.id, // Preserva o ID original inalterado
            completedAt: s.completedAt, // Preserva horário original de conclusão
            editedAt: Date.now(), // Atualiza editedAt
          };
        });

        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[currentExIndex] = { ...currentExercise, sets: updatedSets };

        set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } });
        return true;
      },

      deleteSet: (setId) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const currentExIndex = activeWorkout.activeExerciseIndex;
        const currentExercise = activeWorkout.exercises[currentExIndex];
        if (!currentExercise) return;

        const updatedSets = currentExercise.sets.filter((s) => s.id !== setId);
        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[currentExIndex] = { ...currentExercise, sets: updatedSets };

        set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } });
      },

      updateDraft: (draft) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const currentExIndex = activeWorkout.activeExerciseIndex;
        const currentExercise = activeWorkout.exercises[currentExIndex];
        if (!currentExercise) return;

        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[currentExIndex] = { ...currentExercise, draft };
        set({ activeWorkout: { ...activeWorkout, exercises: updatedExercises } });
      },

      updateHistoricalSet: (sessionId, setId, updates) => {
        const { completedWorkouts } = get();
        const workout = completedWorkouts.find((w) => w.id === sessionId);
        if (!workout) return false;

        // Localiza o exercício que possui esta série
        let foundExercise: SessionExercise | undefined;
        for (const ex of workout.exercises) {
          if (ex.sets.some((s) => s.id === setId)) {
            foundExercise = ex;
            break;
          }
        }
        if (!foundExercise) return false;

        const validation = sanitizeSetRecord(foundExercise.measurementType, updates);
        if (!validation.valid || !validation.sanitized) return false;

        const cleanedUpdates = validation.sanitized;

        const updatedWorkouts = completedWorkouts.map((w) => {
          if (w.id !== sessionId) return w;
          const updatedExercises = w.exercises.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) => {
              if (s.id !== setId) return s;
              return {
                ...s,
                ...cleanedUpdates,
                id: s.id, // Preserva ID original
                completedAt: s.completedAt, // Preserva completedAt original
                editedAt: Date.now(), // Atualiza editedAt
              };
            }),
          }));
          return { ...w, exercises: updatedExercises };
        });

        set({ completedWorkouts: updatedWorkouts });
        return true;
      },

      deleteHistoricalSet: (sessionId, setId) => {
        const { completedWorkouts } = get();
        const updatedWorkouts = completedWorkouts.map((workout) => {
          if (workout.id !== sessionId) return workout;
          const updatedExercises = workout.exercises.map((ex) => ({
            ...ex,
            sets: ex.sets.filter((s) => s.id !== setId),
          }));
          return { ...workout, exercises: updatedExercises };
        });
        set({ completedWorkouts: updatedWorkouts });
      },

      updateSessionObservation: (sessionId, observation) => {
        const { activeWorkout, completedWorkouts } = get();
        if (activeWorkout && activeWorkout.id === sessionId) {
          set({ activeWorkout: { ...activeWorkout, observation } });
        } else {
          set({
            completedWorkouts: completedWorkouts.map((w) =>
              w.id === sessionId ? { ...w, observation } : w
            ),
          });
        }
      },

      nextExercise: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        if (activeWorkout.activeExerciseIndex < activeWorkout.exercises.length - 1) {
          const nextIndex = activeWorkout.activeExerciseIndex + 1;
          const nextEx = activeWorkout.exercises[nextIndex];
          const nextRestMs = (nextEx?.prescribedRestSeconds || 90) * 1000;

          set({
            activeWorkout: {
              ...activeWorkout,
              activeExerciseIndex: nextIndex,
            },
            restTimer: {
              status: "idle",
              endsAt: null,
              remainingMsWhenPaused: null,
              durationMs: nextRestMs,
            },
          });
        }
      },

      setActiveExerciseIndex: (index: number) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        if (index >= 0 && index < activeWorkout.exercises.length) {
          const targetEx = activeWorkout.exercises[index];
          const restMs = (targetEx?.prescribedRestSeconds || 90) * 1000;
          set({
            activeWorkout: {
              ...activeWorkout,
              activeExerciseIndex: index,
            },
            restTimer: {
              status: "idle",
              endsAt: null,
              remainingMsWhenPaused: null,
              durationMs: restMs,
            },
          });
        }
      },

      replaceExerciseInActiveSession: (exerciseIndex, newExercise) => {
        const { activeWorkout } = get();
        if (!activeWorkout || !activeWorkout.exercises[exerciseIndex]) return;

        const currentEx = activeWorkout.exercises[exerciseIndex];
        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[exerciseIndex] = {
          ...currentEx,
          definitionId: newExercise.id,
          exerciseName: newExercise.name,
          name: newExercise.name,
          measurementType: newExercise.measurementType,
          loadConvention: newExercise.loadConvention,
          targetMuscles: newExercise.targetMuscles,
          isSubstitute: true,
          substitutionReason: newExercise.reason,
          originalExerciseName: currentEx.originalExerciseName || currentEx.exerciseName,
          draft: undefined,
        };

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: updatedExercises,
          },
        });
      },

      finishWorkout: (isPartial = false) => {
        const { activeWorkout, completedWorkouts } = get();
        if (!activeWorkout) return false;

        // Prevenção contra duplicação (se este ID de sessão já tiver sido salvo)
        if (completedWorkouts.some((w) => w.id === activeWorkout.id)) {
          return false;
        }

        const endedAt = Date.now();
        const durationMs = endedAt - activeWorkout.startTime;

        const finished: WorkoutSession = {
          ...activeWorkout,
          status: isPartial ? "partial" : "completed",
          isCompleted: !isPartial, // compatibilidade
          endedAt,
          durationMs,
          localOrigin: true,
          schemaVersion: 1,
        };

        set({
          activeWorkout: null,
          restTimer: { status: "idle", endsAt: null, remainingMsWhenPaused: null, durationMs: 90000 },
          completedWorkouts: [finished, ...completedWorkouts],
        });
        return true;
      },

      discardWorkout: () => {
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
          },
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
          },
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
          set({ restTimer: { ...restTimer, endsAt: restTimer.endsAt + ms } });
        } else if (restTimer.status === "paused" && restTimer.remainingMsWhenPaused !== null) {
          set({ restTimer: { ...restTimer, remainingMsWhenPaused: restTimer.remainingMsWhenPaused + ms } });
        } else if (restTimer.status === "finished") {
          set({ restTimer: { ...restTimer, status: "running", endsAt: Date.now() + ms } });
        }
      },

      recalculateTimer: () => {
        const { restTimer } = get();
        if (restTimer.status === "running" && restTimer.endsAt && Date.now() >= restTimer.endsAt) {
          set({ restTimer: { ...restTimer, status: "finished" } });
        }
      },
    }),
    {
      name: "camini-workout-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
        if (typeof globalThis !== "undefined" && "localStorage" in globalThis && globalThis.localStorage) {
          return globalThis.localStorage as StateStorage;
        }
        return dummyStorage;
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const state = persistedState as any;
          if (state.activeWorkout) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            state.activeWorkout.exercises = state.activeWorkout.exercises.map((ex: any) => ({
              ...ex,
              definitionId: ex.definitionId || "legacy",
              measurementType: ex.measurementType || "reps",
              loadConvention: ex.loadConvention || "total",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sets: ex.sets.map((s: any) => ({
                ...s,
                type: s.isWarmup ? "warmup" : "work",
                isExtra: Boolean(s.isExtra || s.type === "extra"),
              })),
            }));
          }
          if (state.completedWorkouts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            state.completedWorkouts = state.completedWorkouts.map((w: any) => ({
              ...w,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              exercises: w.exercises.map((ex: any) => ({
                ...ex,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sets: ex.sets.map((s: any) => ({
                  ...s,
                  type: s.type === "warmup" ? "warmup" : "work",
                  isExtra: Boolean(s.isExtra || s.type === "extra"),
                })),
              })),
            }));
          }
          if (state.restTimer) {
            state.restTimer.status = state.restTimer.isActive ? "running" : "idle";
            state.restTimer.endsAt = state.restTimer.startTime
              ? state.restTimer.startTime + (state.restTimer.durationSeconds * 1000)
              : null;
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
