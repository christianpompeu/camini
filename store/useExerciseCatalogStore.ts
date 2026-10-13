import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import {
  CatalogExercise,
  validateExerciseForPublication,
  ExercisePublicationValidation,
  CreateExerciseInput,
} from "@/types/exercise";
import { DEFAULT_CATALOG_EXERCISES } from "@/data/default-exercises";

const dummyStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function generateExerciseId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return slug ? `${slug}_${randomSuffix}` : `ex_${Date.now()}_${randomSuffix}`;
}

export interface ExerciseFilters {
  searchQuery?: string;
  equipment?: string;
  muscleGroup?: string;
  movementPattern?: string;
  status?: "all" | "published" | "draft" | "archived";
}

interface ExerciseCatalogStore {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  exercises: CatalogExercise[];

  // Operações do Catálogo
  initializeCatalog: () => void;
  createExercise: (data: CreateExerciseInput) => CatalogExercise;
  updateExercise: (id: string, updates: Partial<CatalogExercise>) => boolean;
  publishExercise: (id: string) => { success: boolean; validation: ExercisePublicationValidation };
  archiveExercise: (id: string) => boolean;
  restoreExercise: (id: string) => boolean;

  // Consultas
  getExerciseById: (id: string) => CatalogExercise | undefined;
  checkDuplicateName: (name: string, excludeId?: string) => CatalogExercise[];
  filterExercises: (filters: ExerciseFilters) => CatalogExercise[];
}

export const useExerciseCatalogStore = create<ExerciseCatalogStore>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
      exercises: [],

      initializeCatalog: () => {
        const { exercises } = get();

        // Se vazio, popula com os exercícios canônicos padrão
        if (exercises.length === 0) {
          set({ exercises: DEFAULT_CATALOG_EXERCISES });
          return;
        }

        // Se já existem registros, executa merge idempotente:
        // Apenas insere novos exercícios do catálogo padrão que não existam no store.
        // NUNCA sobrescreve edições feitas pelo usuário nos exercícios existentes.
        const existingIds = new Set(exercises.map((e) => e.id));
        const newDefaults = DEFAULT_CATALOG_EXERCISES.filter((d) => !existingIds.has(d.id));

        if (newDefaults.length > 0) {
          set({ exercises: [...exercises, ...newDefaults] });
        }
      },

      createExercise: (data) => {
        const id = data.customId?.trim() || generateExerciseId(data.name);
        const now = Date.now();

        const newExercise: CatalogExercise = {
          ...data,
          id,
          version: 1,
          createdAt: now,
          updatedAt: now,
          contentOrigin: data.contentOrigin || "user_created",
          reviewStatus: data.reviewStatus || "reviewed",
          status: data.status || "draft",
          media: data.media || [],
          primaryMuscles: data.primaryMuscles || [],
          secondaryMuscles: data.secondaryMuscles || [],
          equipment: data.equipment || [],
          targetMuscles: data.primaryMuscles?.join(", ") || data.targetMuscles || "",
        };

        set((state) => ({
          exercises: [newExercise, ...state.exercises],
        }));

        return newExercise;
      },

      updateExercise: (id, updates) => {
        const { exercises } = get();
        const index = exercises.findIndex((e) => e.id === id);
        if (index === -1) return false;

        const current = exercises[index];
        const updated: CatalogExercise = {
          ...current,
          ...updates,
          id: current.id, // ID estritamente preservado
          createdAt: current.createdAt, // Data de criação preservada
          version: (current.version || 1) + 1,
          updatedAt: Date.now(),
          targetMuscles:
            updates.primaryMuscles?.join(", ") || current.targetMuscles || current.primaryMuscles.join(", "),
        };

        const newExercises = [...exercises];
        newExercises[index] = updated;

        set({ exercises: newExercises });
        return true;
      },

      publishExercise: (id) => {
        const { exercises, updateExercise } = get();
        const exercise = exercises.find((e) => e.id === id);

        if (!exercise) {
          return {
            success: false,
            validation: {
              canPublish: false,
              errors: ["Exercício não encontrado."],
              warnings: [],
            },
          };
        }

        const validation = validateExerciseForPublication(exercise);
        if (!validation.canPublish) {
          return { success: false, validation };
        }

        updateExercise(id, {
          status: "published",
          reviewStatus: "reviewed",
        });

        return { success: true, validation };
      },

      archiveExercise: (id) => {
        const { exercises, updateExercise } = get();
        const exercise = exercises.find((e) => e.id === id);
        if (!exercise) return false;

        return updateExercise(id, { status: "archived" });
      },

      restoreExercise: (id) => {
        const { exercises, updateExercise } = get();
        const exercise = exercises.find((e) => e.id === id);
        if (!exercise) return false;

        return updateExercise(id, { status: "published" });
      },

      getExerciseById: (id) => {
        const { exercises } = get();
        return exercises.find((e) => e.id === id);
      },

      checkDuplicateName: (name, excludeId) => {
        const { exercises } = get();
        const normalized = name.trim().toLowerCase();
        if (!normalized) return [];

        return exercises.filter((e) => {
          if (excludeId && e.id === excludeId) return false;
          const matchPrimary = e.name.trim().toLowerCase() === normalized;
          const matchAlt = e.alternativeNames?.some((alt) => alt.trim().toLowerCase() === normalized);
          return matchPrimary || matchAlt;
        });
      },

      filterExercises: (filters) => {
        const { exercises } = get();
        return exercises.filter((ex) => {
          // Filtro por estado
          if (filters.status && filters.status !== "all") {
            if (ex.status !== filters.status) return false;
          }

          // Filtro por equipamento
          if (filters.equipment && filters.equipment !== "all") {
            if (!ex.equipment.includes(filters.equipment as import("@/types/exercise").Equipment)) return false;
          }

          // Filtro por padrão de movimento
          if (filters.movementPattern && filters.movementPattern !== "all") {
            if (ex.movementPattern !== filters.movementPattern) return false;
          }

          // Filtro por grupo muscular
          if (filters.muscleGroup && filters.muscleGroup !== "all") {
            const hasPrimary = ex.primaryMuscles.some((m) =>
              m.toLowerCase().includes(filters.muscleGroup!.toLowerCase())
            );
            const hasSecondary = ex.secondaryMuscles?.some((m) =>
              m.toLowerCase().includes(filters.muscleGroup!.toLowerCase())
            );
            if (!hasPrimary && !hasSecondary) return false;
          }

          // Busca textual (nome, sinônimos, músculos, descrição)
          if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
            const q = filters.searchQuery.trim().toLowerCase();
            const matchName = ex.name.toLowerCase().includes(q);
            const matchAlt = ex.alternativeNames?.some((a) => a.toLowerCase().includes(q));
            const matchDesc = ex.description?.toLowerCase().includes(q);
            const matchMuscles = ex.primaryMuscles.some((m) => m.toLowerCase().includes(q));
            if (!matchName && !matchAlt && !matchDesc && !matchMuscles) return false;
          }

          return true;
        });
      },
    }),
    {
      name: "camini-exercise-catalog-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
        if (typeof globalThis !== "undefined" && "localStorage" in globalThis && globalThis.localStorage) {
          return globalThis.localStorage as StateStorage;
        }
        return dummyStorage;
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          state.initializeCatalog();
        }
      },
    }
  )
);
