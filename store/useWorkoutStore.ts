import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SetRecord {
  id: string;
  weight: number;
  reps: number;
  rir: number;
  isWarmup: boolean;
  completedAt: number;
}

export interface ExerciseSession {
  exerciseName: string;
  targetMuscles: string;
  expectedSets: number;
  sets: SetRecord[];
}

export interface WorkoutSession {
  id: string;
  letter: string;
  title: string;
  startTime: number;
  activeExerciseIndex: number;
  exercises: ExerciseSession[];
  isCompleted: boolean;
}

export interface RestTimerState {
  isActive: boolean;
  startTime: number | null; // Timestamp (Date.now())
  durationSeconds: number;
}

interface WorkoutStore {
  // Estado
  activeWorkout: WorkoutSession | null;
  restTimer: RestTimerState;
  completedWorkouts: WorkoutSession[];

  // Ações do Treino
  startWorkout: (workoutDef: any) => void;
  logSet: (weight: number, reps: number, rir: number, isWarmup: boolean) => void;
  nextExercise: () => void;
  finishWorkout: () => void;
  resetWorkout: () => void;

  // Ações do Temporizador
  startTimer: (durationSeconds?: number) => void;
  stopTimer: () => void;
  addTime: (seconds: number) => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      completedWorkouts: [],
      restTimer: {
        isActive: false,
        startTime: null,
        durationSeconds: 90,
      },

      startWorkout: (workoutDef) => {
        const exercises: ExerciseSession[] = workoutDef.exercises.map((exName: string) => ({
          exerciseName: exName,
          targetMuscles: workoutDef.focus, // Simplificação
          expectedSets: 4, // Padrão
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
          restTimer: { isActive: false, startTime: null, durationSeconds: 90 },
        });
      },

      logSet: (weight, reps, rir, isWarmup) => {
        const { activeWorkout } = get();
        if (!activeWorkout || weight <= 0 || reps <= 0) return;

        const currentExIndex = activeWorkout.activeExerciseIndex;
        const currentExercise = activeWorkout.exercises[currentExIndex];

        const newSet: SetRecord = {
          id: Date.now().toString(),
          weight,
          reps,
          rir,
          isWarmup,
          completedAt: Date.now(),
        };

        const updatedExercises = [...activeWorkout.exercises];
        updatedExercises[currentExIndex] = {
          ...currentExercise,
          sets: [...currentExercise.sets, newSet],
        };

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: updatedExercises,
          },
        });
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
            restTimer: { isActive: false, startTime: null, durationSeconds: 90 },
          });
        }
      },

      finishWorkout: () => {
        const { activeWorkout, completedWorkouts } = get();
        if (!activeWorkout) return;

        const finished = { ...activeWorkout, isCompleted: true };
        set({
          activeWorkout: null,
          restTimer: { isActive: false, startTime: null, durationSeconds: 90 },
          completedWorkouts: [finished, ...completedWorkouts],
        });
      },

      resetWorkout: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        
        // Limpa todas as séries e reseta o índice
        const resetExercises = activeWorkout.exercises.map(ex => ({ ...ex, sets: [] }));
        set({
          activeWorkout: {
            ...activeWorkout,
            activeExerciseIndex: 0,
            exercises: resetExercises,
          },
          restTimer: { isActive: false, startTime: null, durationSeconds: 90 },
        });
      },

      startTimer: (durationSeconds = 90) => {
        set((state) => ({
          restTimer: {
            isActive: true,
            startTime: Date.now(),
            durationSeconds,
          },
        }));
      },

      stopTimer: () => {
        set((state) => ({
          restTimer: {
            ...state.restTimer,
            isActive: false,
            startTime: null,
          },
        }));
      },

      addTime: (seconds) => {
        set((state) => ({
          restTimer: {
            ...state.restTimer,
            durationSeconds: state.restTimer.durationSeconds + seconds,
          },
        }));
      },
    }),
    {
      name: "camini-workout-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
