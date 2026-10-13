/**
 * CAMINI FORÇA — F2.2: Store Zustand de Fichas Individuais Versionadas
 * 
 * Gerencia a coleção de fichas (WorkoutPlan), controle de rascunhos,
 * versionamento imutável e ativação da ficha pessoal.
 */

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import {
  WorkoutPlan,
  WorkoutDivision,
  WorkoutPlanValidation,
  WorkoutPlanDiff,
  validateWorkoutPlanForActivation,
} from "@/types/workout-plan";
import { createBaselineWorkoutPlan, DEFAULT_OWNER_ID } from "@/data/default-workout-plan";

const dummyStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function generateId(prefix: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${Date.now()}_${randomSuffix}`;
}

export interface WorkoutPlanStore {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  plans: WorkoutPlan[];
  activePlanId: string | null;

  // Operações de Fichas
  getPlanById: (id: string) => WorkoutPlan | undefined;
  getActivePlan: () => WorkoutPlan | null;
  createEmptyPlan: (name?: string, goal?: string) => WorkoutPlan;
  importDraftFromBaseline: () => WorkoutPlan;
  savePlan: (plan: WorkoutPlan) => boolean;
  activatePlan: (
    planId: string,
    versionReason?: string
  ) => { success: boolean; validation: WorkoutPlanValidation };
  createNewVersionFromPlan: (planId: string) => WorkoutPlan | null;
  duplicatePlan: (planId: string, customName?: string) => WorkoutPlan | null;
  archivePlan: (planId: string) => boolean;
  restorePlan: (planId: string) => boolean;

  // Utilitários de Diff e Validação
  validatePlan: (planId: string) => WorkoutPlanValidation;
  getDiffWithPreviousVersion: (plan: WorkoutPlan) => WorkoutPlanDiff | null;
}

export const useWorkoutPlanStore = create<WorkoutPlanStore>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),

      plans: [],
      activePlanId: null,

      getPlanById: (id: string) => {
        return get().plans.find((p) => p.id === id);
      },

      getActivePlan: () => {
        const { plans, activePlanId } = get();
        if (!activePlanId) return null;
        return plans.find((p) => p.id === activePlanId && p.status === "active") || null;
      },

      createEmptyPlan: (name = "Minha Nova Ficha", goal = "Força e hipertrofia") => {
        const now = Date.now();
        const initialDivision: WorkoutDivision = {
          id: generateId("div"),
          name: "Treino A",
          letter: "A",
          order: 0,
          notes: "Primeira divisão de treino",
          prescribedExercises: [],
        };

        const newPlan: WorkoutPlan = {
          id: generateId("plan"),
          ownerId: DEFAULT_OWNER_ID,
          name,
          goal,
          status: "draft",
          version: 1,
          previousVersionId: null,
          createdAt: now,
          updatedAt: now,
          activatedAt: null,
          divisions: [initialDivision],
        };

        set((state) => ({
          plans: [newPlan, ...state.plans],
        }));

        return newPlan;
      },

      importDraftFromBaseline: () => {
        const { plans } = get();
        const existingDraft = plans.find(
          (p) => p.origin === "imported_from_baseline" && p.status === "draft"
        );
        if (existingDraft) {
          return existingDraft;
        }

        const baselineDraft = createBaselineWorkoutPlan("draft");
        baselineDraft.name = "Programa de Força A–E (Rascunho Importado)";
        baselineDraft.notes = "Rascunho criado a partir do programa base A–E sem máquinas.";
        baselineDraft.id = generateId("plan_imported_baseline");
        baselineDraft.createdAt = Date.now();
        baselineDraft.updatedAt = Date.now();

        set((state) => ({
          plans: [baselineDraft, ...state.plans],
        }));

        return baselineDraft;
      },

      savePlan: (updatedPlan: WorkoutPlan) => {
        const { plans } = get();
        const index = plans.findIndex((p) => p.id === updatedPlan.id);
        const now = Date.now();

        const planWithMeta: WorkoutPlan = {
          ...updatedPlan,
          updatedAt: now,
        };

        if (index === -1) {
          // Novo plano
          set({ plans: [planWithMeta, ...plans] });
        } else {
          // Atualiza existente
          const newPlans = [...plans];
          newPlans[index] = planWithMeta;
          set({ plans: newPlans });
        }

        return true;
      },

      activatePlan: (planId: string, versionReason?: string) => {
        const { plans, activePlanId } = get();
        const targetPlan = plans.find((p) => p.id === planId);

        if (!targetPlan) {
          return {
            success: false,
            validation: {
              canActivate: false,
              isValid: false,
              errors: ["Ficha não encontrada no armazenamento local."],
              warnings: [],
            },
          };
        }

        const validation = validateWorkoutPlanForActivation(targetPlan);
        if (!validation.canActivate) {
          return {
            success: false,
            validation,
          };
        }

        const now = Date.now();

        // 1. Arquiva a ficha atualmente ativa (se for diferente da alvo)
        const updatedPlans = plans.map((p) => {
          if (p.id === activePlanId && p.id !== planId) {
            return {
              ...p,
              status: "archived" as const,
              updatedAt: now,
            };
          }
          if (p.id === planId) {
            return {
              ...p,
              status: "active" as const,
              activatedAt: now,
              updatedAt: now,
              versionReason: versionReason || p.versionReason,
            };
          }
          return p;
        });

        set({
          plans: updatedPlans,
          activePlanId: planId,
        });

        return {
          success: true,
          validation,
        };
      },

      createNewVersionFromPlan: (planId: string) => {
        const { plans } = get();
        const sourcePlan = plans.find((p) => p.id === planId);
        if (!sourcePlan) return null;

        const now = Date.now();
        const newVersionNumber = (sourcePlan.version || 1) + 1;

        // Cria cópias profundas com novos IDs para ocorrências de exercícios prescritos
        const clonedDivisions: WorkoutDivision[] = sourcePlan.divisions.map((div, divIndex) => ({
          ...div,
          id: generateId(`div_v${newVersionNumber}_${divIndex}`),
          prescribedExercises: div.prescribedExercises.map((pex) => ({
            ...pex,
            id: generateId("pex"),
          })),
        }));

        const newVersionPlan: WorkoutPlan = {
          id: generateId(`plan_v${newVersionNumber}`),
          ownerId: sourcePlan.ownerId || DEFAULT_OWNER_ID,
          name: sourcePlan.name,
          goal: sourcePlan.goal,
          notes: sourcePlan.notes,
          status: "draft",
          version: newVersionNumber,
          previousVersionId: sourcePlan.id,
          versionReason: undefined,
          createdAt: now,
          updatedAt: now,
          activatedAt: null,
          divisions: clonedDivisions,
        };

        set((state) => ({
          plans: [newVersionPlan, ...state.plans],
        }));

        return newVersionPlan;
      },

      duplicatePlan: (planId: string, customName?: string) => {
        const { plans } = get();
        const source = plans.find((p) => p.id === planId);
        if (!source) return null;

        const now = Date.now();
        const clonedDivisions: WorkoutDivision[] = source.divisions.map((div, divIndex) => ({
          ...div,
          id: generateId(`div_dup_${divIndex}`),
          prescribedExercises: div.prescribedExercises.map((pex) => ({
            ...pex,
            id: generateId("pex"),
          })),
        }));

        const duplicated: WorkoutPlan = {
          id: generateId("plan_dup"),
          ownerId: source.ownerId || DEFAULT_OWNER_ID,
          name: customName || `${source.name} (Cópia)`,
          goal: source.goal,
          notes: source.notes,
          status: "draft",
          version: 1,
          previousVersionId: null,
          versionReason: undefined,
          createdAt: now,
          updatedAt: now,
          activatedAt: null,
          divisions: clonedDivisions,
        };

        set((state) => ({
          plans: [duplicated, ...state.plans],
        }));

        return duplicated;
      },

      archivePlan: (planId: string) => {
        const { plans, activePlanId } = get();
        const index = plans.findIndex((p) => p.id === planId);
        if (index === -1) return false;

        const target = plans[index];
        const updatedPlans = [...plans];
        updatedPlans[index] = {
          ...target,
          status: "archived",
          updatedAt: Date.now(),
        };

        set({
          plans: updatedPlans,
          activePlanId: activePlanId === planId ? null : activePlanId,
        });

        return true;
      },

      restorePlan: (planId: string) => {
        const { plans } = get();
        const index = plans.findIndex((p) => p.id === planId);
        if (index === -1) return false;

        const target = plans[index];
        const updatedPlans = [...plans];
        updatedPlans[index] = {
          ...target,
          status: "draft",
          updatedAt: Date.now(),
        };

        set({ plans: updatedPlans });
        return true;
      },

      validatePlan: (planId: string) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan) {
          return {
            canActivate: false,
            isValid: false,
            errors: ["Ficha não encontrada."],
            warnings: [],
          };
        }
        return validateWorkoutPlanForActivation(plan);
      },

      getDiffWithPreviousVersion: (currentPlan: WorkoutPlan): WorkoutPlanDiff | null => {
        if (!currentPlan.previousVersionId) return null;
        const oldPlan = get().plans.find((p) => p.id === currentPlan.previousVersionId);
        if (!oldPlan) return null;

        const oldDivisionsMap = new Map(oldPlan.divisions.map((d) => [d.name, d]));
        const newDivisionsMap = new Map(currentPlan.divisions.map((d) => [d.name, d]));

        const divisionsAdded = currentPlan.divisions
          .filter((d) => !oldDivisionsMap.has(d.name))
          .map((d) => d.name);

        const divisionsRemoved = oldPlan.divisions
          .filter((d) => !newDivisionsMap.has(d.name))
          .map((d) => d.name);

        const divisionsModified: WorkoutPlanDiff["divisionsModified"] = [];

        currentPlan.divisions.forEach((newDiv) => {
          const oldDiv = oldDivisionsMap.get(newDiv.name);
          if (!oldDiv) return;

          const oldExMap = new Map(oldDiv.prescribedExercises.map((e) => [e.exerciseId, e]));
          const newExMap = new Map(newDiv.prescribedExercises.map((e) => [e.exerciseId, e]));

          const exercisesAdded = newDiv.prescribedExercises
            .filter((e) => !oldExMap.has(e.exerciseId))
            .map((e) => e.exerciseId);

          const exercisesRemoved = oldDiv.prescribedExercises
            .filter((e) => !newExMap.has(e.exerciseId))
            .map((e) => e.exerciseId);

          const exercisesModified: { exerciseName: string; changes: string[] }[] = [];

          newDiv.prescribedExercises.forEach((newEx) => {
            const oldEx = oldExMap.get(newEx.exerciseId);
            if (!oldEx) return;

            const changes: string[] = [];
            if (oldEx.targetSets !== newEx.targetSets) {
              changes.push(`Séries: ${oldEx.targetSets} → ${newEx.targetSets}`);
            }
            if (oldEx.minReps !== newEx.minReps || oldEx.maxReps !== newEx.maxReps) {
              changes.push(`Repetições: ${oldEx.minReps || 0}-${oldEx.maxReps || 0} → ${newEx.minReps || 0}-${newEx.maxReps || 0}`);
            }
            if (oldEx.targetDurationSeconds !== newEx.targetDurationSeconds) {
              changes.push(`Duração: ${oldEx.targetDurationSeconds || 0}s → ${newEx.targetDurationSeconds || 0}s`);
            }
            if (oldEx.targetDistanceMeters !== newEx.targetDistanceMeters) {
              changes.push(`Distância: ${oldEx.targetDistanceMeters || 0}m → ${newEx.targetDistanceMeters || 0}m`);
            }
            if (oldEx.restSeconds !== newEx.restSeconds) {
              changes.push(`Descanso: ${oldEx.restSeconds}s → ${newEx.restSeconds}s`);
            }
            if (oldEx.targetWeight !== newEx.targetWeight) {
              changes.push(`Carga: ${oldEx.targetWeight || 0}kg → ${newEx.targetWeight || 0}kg`);
            }

            if (changes.length > 0) {
              exercisesModified.push({
                exerciseName: newEx.exerciseId,
                changes,
              });
            }
          });

          if (exercisesAdded.length > 0 || exercisesRemoved.length > 0 || exercisesModified.length > 0) {
            divisionsModified.push({
              divisionName: newDiv.name,
              exercisesAdded,
              exercisesRemoved,
              exercisesModified,
            });
          }
        });

        return {
          nameChanged: oldPlan.name !== currentPlan.name,
          oldName: oldPlan.name,
          newName: currentPlan.name,
          divisionsAdded,
          divisionsRemoved,
          divisionsModified,
        };
      },
    }),
    {
      name: "camini-workout-plan-storage",
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
        }
      },
    }
  )
);
