/**
 * CAMINI FORÇA — F2.2: Fichas Individuais Versionadas
 * 
 * Separa a ficha pessoal (WorkoutPlan), divisões de treino (WorkoutDivision),
 * e exercícios prescritos (PrescribedExercise) da definição canônica do catálogo
 * e da execução em sessão.
 */

import { MeasurementType, LoadConvention } from "@/store/useWorkoutStore";
import { Laterality } from "@/types/exercise";

export type { MeasurementType, LoadConvention, Laterality };

export type WorkoutPlanStatus = "draft" | "active" | "archived";

/**
 * Ocorrência de um exercício prescrito dentro de uma divisão de treino.
 * Possui ID próprio da ocorrência para permitir que o mesmo exercício do catálogo
 * seja prescrito mais de uma vez em um mesmo treino sem colisão de identificadores.
 */
export interface PrescribedExercise {
  id: string; // ID único e estável da ocorrência (ex: "pex_abc123")
  exerciseId: string; // Referência estável ao ID do catálogo (ex: "agachamento_goblet")
  exerciseDefinitionVersion?: number; // Versão da definição utilizada
  order: number; // Posição de execução na divisão (0, 1, 2...)

  // Prescrição de séries e metas
  targetSets: number; // Séries de trabalho planejadas (inteiro positivo >= 1)
  measurementType: MeasurementType; // "reps" | "duration" | "distance"

  // Metas específicas conforme a medida
  minReps?: number;
  maxReps?: number;
  targetReps?: number; // Usado quando não for faixa
  targetDurationSeconds?: number;
  targetDistanceMeters?: number;

  // Parâmetros de execução
  restSeconds: number; // Tempo de descanso entre séries (segundos, >= 0)
  targetRir?: number; // RIR-alvo opcional (0 a 10), undefined se não informado
  targetWeight?: number; // Carga inicial sugerida opcional (>= 0)
  loadConvention: LoadConvention; // "total" | "per_implement" | "additional" | "bodyweight"
  laterality?: Laterality; // "bilateral" | "unilateral" | "alternating" | "not_applicable"
  notes?: string; // Observações da prescrição (ex: "Pausa de 2s no fundo")
}

/**
 * Divisão de treino dentro de uma ficha (ex: "A - Pernas e Core", "B - Empurrar").
 * Permite qualquer quantidade e nome de treinos (não apenas A–E).
 */
export interface WorkoutDivision {
  id: string; // ID estável da divisão (ex: "div_pernas_core")
  name: string; // Nome da divisão (ex: "Pernas e Core", "Full Body")
  letter?: string; // Letra opcional para identificação rápida (ex: "A", "B", "C")
  order: number; // Ordem da divisão na ficha
  notes?: string; // Foco ou observações (ex: "Foco em quadríceps e estabilidade")
  estimatedMinutes?: number; // Duração estimada em minutos
  prescribedExercises: PrescribedExercise[]; // Exercícios prescritos ordenados
}

/**
 * Programa pessoal de treino (Ficha).
 * Pode existir como rascunho editável ou versão ativada imutável.
 */
export interface WorkoutPlan {
  id: string; // ID estável do programa
  ownerId: string; // Identificador estável do proprietário (ex: "user_local_christian")
  name: string; // Nome da ficha (ex: "Programa de Força A–E")
  goal?: string; // Objetivo principal (ex: "Força", "Hipertrofia", "Condicionamento")
  notes?: string; // Observações gerais da ficha
  status: WorkoutPlanStatus; // "draft" | "active" | "archived"
  version: number; // Versão (1, 2, 3...)
  previousVersionId?: string | null; // ID da versão da qual esta se originou
  versionReason?: string; // Motivo da revisão (ex: "Ajuste de cargas pós-ciclo")
  createdAt: number; // Timestamp de criação
  updatedAt: number; // Timestamp da última atualização
  activatedAt?: number | null; // Timestamp em que esta versão foi ativada
  origin?: "created" | "imported_from_baseline" | "duplicated";
  reviewStatus?: "pending" | "reviewed";
  divisions: WorkoutDivision[]; // Divisões de treino ordenadas
}

/**
 * Validação rigorosa dos campos mínimos para ativação de uma ficha.
 */
export interface WorkoutPlanValidation {
  canActivate: boolean;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Diferença estruturada entre duas versões de uma ficha para a tela de revisão.
 */
export interface WorkoutPlanDiff {
  nameChanged: boolean;
  oldName?: string;
  newName?: string;
  divisionsAdded: string[];
  divisionsRemoved: string[];
  divisionsModified: {
    divisionName: string;
    exercisesAdded: string[];
    exercisesRemoved: string[];
    exercisesModified: {
      exerciseName: string;
      changes: string[];
    }[];
  }[];
}

/**
 * Função pura para validar se uma ficha está apta para ativação.
 */
export function validateWorkoutPlanForActivation(
  plan: WorkoutPlan,
  catalogExerciseIds?: Set<string>
): WorkoutPlanValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Nome da ficha
  if (!plan.name || plan.name.trim().length < 3) {
    errors.push("O nome da ficha deve ter pelo menos 3 caracteres.");
  }

  // 2. Divisões de treino
  if (!plan.divisions || plan.divisions.length === 0) {
    errors.push("A ficha deve conter pelo menos uma divisão de treino.");
    return { canActivate: false, isValid: false, errors, warnings };
  }

  plan.divisions.forEach((div, divIndex) => {
    const divLabel = div.letter ? `Treino ${div.letter} (${div.name})` : div.name || `Treino #${divIndex + 1}`;

    if (!div.name || div.name.trim().length < 2) {
      errors.push(`O ${divLabel} deve possuir um nome válido.`);
    }

    if (!div.prescribedExercises || div.prescribedExercises.length === 0) {
      errors.push(`O ${divLabel} não possui nenhum exercício prescrito.`);
      return;
    }

    div.prescribedExercises.forEach((pex, pexIndex) => {
      const pexLabel = `${divLabel} · Exercício #${pexIndex + 1}`;

      // Valida referência do catálogo
      if (!pex.exerciseId) {
        errors.push(`${pexLabel}: Não possui exercício do catálogo vinculado.`);
      } else if (catalogExerciseIds && !catalogExerciseIds.has(pex.exerciseId)) {
        warnings.push(`${pexLabel}: O exercício referenciado ('${pex.exerciseId}') não foi localizado no catálogo local.`);
      }

      // Séries de trabalho
      if (!Number.isInteger(pex.targetSets) || pex.targetSets < 1) {
        errors.push(`${pexLabel}: Quantidade de séries de trabalho deve ser um número inteiro positivo.`);
      }

      // Descanso
      if (!Number.isFinite(pex.restSeconds) || pex.restSeconds < 0) {
        errors.push(`${pexLabel}: O tempo de descanso deve ser maior ou igual a zero.`);
      }

      // Carga inicial
      if (pex.targetWeight !== undefined) {
        if (!Number.isFinite(pex.targetWeight) || pex.targetWeight < 0) {
          errors.push(`${pexLabel}: Carga inicial deve ser maior ou igual a zero.`);
        }
      }

      // RIR alvo
      if (pex.targetRir !== undefined) {
        if (!Number.isFinite(pex.targetRir) || pex.targetRir < 0 || pex.targetRir > 10) {
          errors.push(`${pexLabel}: RIR alvo deve estar entre 0 e 10.`);
        }
      }

      // Validação por tipo de medida
      if (pex.measurementType === "reps") {
        const hasRange = pex.minReps !== undefined && pex.maxReps !== undefined;
        const hasFixed = pex.targetReps !== undefined;

        if (!hasRange && !hasFixed) {
          errors.push(`${pexLabel}: Deve informar a meta de repetições (fixa ou faixa mínimo-máximo).`);
        }

        if (hasRange) {
          if (!Number.isInteger(pex.minReps!) || pex.minReps! <= 0) {
            errors.push(`${pexLabel}: Repetições mínimas devem ser um número inteiro positivo.`);
          }
          if (!Number.isInteger(pex.maxReps!) || pex.maxReps! <= 0) {
            errors.push(`${pexLabel}: Repetições máximas devem ser um número inteiro positivo.`);
          }
          if (pex.minReps! > pex.maxReps!) {
            errors.push(`${pexLabel}: Repetição mínima (${pex.minReps}) deve ser menor ou igual à máxima (${pex.maxReps}).`);
          }
        }
      } else if (pex.measurementType === "duration") {
        if (!pex.targetDurationSeconds || !Number.isFinite(pex.targetDurationSeconds) || pex.targetDurationSeconds <= 0) {
          errors.push(`${pexLabel}: Duração em segundos deve ser maior que zero.`);
        }
      } else if (pex.measurementType === "distance") {
        if (!pex.targetDistanceMeters || !Number.isFinite(pex.targetDistanceMeters) || pex.targetDistanceMeters <= 0) {
          errors.push(`${pexLabel}: Distância em metros deve ser maior que zero.`);
        }
      }
    });
  });

  const isValid = errors.length === 0;

  return {
    canActivate: isValid,
    isValid,
    errors,
    warnings,
  };
}
