/**
 * CAMINI FORÇA — F2.1: Tipos do Catálogo Independente de Exercícios
 * 
 * Separa a definição do exercício da prescrição e execução.
 * Compatível com o ExerciseDefinition existente do store de treinos.
 */

import { MeasurementType, LoadConvention } from "@/store/useWorkoutStore";

export type { MeasurementType, LoadConvention };

export type ExerciseStatus = "draft" | "published" | "archived";

export type MovementPattern =
  | "squat" // Agachamento (joelho dominante)
  | "hinge" // Dobradiça de quadril (quadril dominante)
  | "horizontal_push" // Empurrar horizontal (supinos)
  | "vertical_push" // Empurrar vertical (desenvolvimento)
  | "horizontal_pull" // Puxar horizontal (remadas)
  | "vertical_pull" // Puxar vertical (puxadas/barra)
  | "lunge" // Afundo / Avanço (unilateral de perna)
  | "carry" // Transporte / Carregamento (Farmer's Walk)
  | "isolation" // Isolamento monoarticular
  | "core" // Estabilidade de tronco / core
  | "other"; // Outros padrões

export type Laterality = "bilateral" | "unilateral" | "alternating" | "not_applicable";

export type Equipment =
  | "barbell" // Barra
  | "dumbbell" // Halteres
  | "kettlebell" // Kettlebell
  | "cable" // Polia / Cabo
  | "machine" // Máquina
  | "bodyweight" // Peso corporal / Sem equipamento
  | "band" // Elástico
  | "bench" // Banco
  | "plate" // Anilha
  | "other"; // Outro

export type MuscleGroup =
  | "Quadríceps"
  | "Posteriores de Coxa"
  | "Glúteos"
  | "Panturrilhas"
  | "Peitoral"
  | "Costas"
  | "Dorsais"
  | "Deltoides"
  | "Deltoide Anterior"
  | "Deltoide Lateral"
  | "Deltoide Posterior"
  | "Trapézio"
  | "Bíceps"
  | "Tríceps"
  | "Antebraço"
  | "Core"
  | "Abdômen"
  | "Lombar";

export type MediaRole =
  | "execution_start"
  | "execution_end"
  | "execution_start_female"
  | "execution_end_female"
  | "muscle_map"
  | "muscle_map_female"
  | "instruction_card"
  | "instruction_card_female"
  | "video"
  | "thumbnail";

export type MediaAvailability = "available" | "pending_download" | "missing";

export interface ExerciseMediaItem {
  id: string;
  role: MediaRole;
  url?: string;
  thumbnailUrl?: string;
  label?: string;
  modelVariant?: "male" | "female" | "unspecified";
  availability: MediaAvailability;
  driveFileId?: string;
  sourceSlot?: number;
  orderIndex: number;
}

export type ContentOrigin = "imported" | "user_created";
export type ReviewStatus = "pending" | "reviewed";

/**
 * Definição completa do exercício no catálogo independente.
 * Estende os campos básicos já esperados pelo ExerciseDefinition original:
 * id, name, measurementType, loadConvention, targetMuscles.
 */
export interface CatalogExercise {
  // Identificação estável independente do nome
  id: string;
  name: string;
  alternativeNames?: string[]; // sinônimos / apelidos para busca
  description?: string;

  // Ciclo de vida e versionamento
  status: ExerciseStatus;
  version: number;
  createdAt: number;
  updatedAt: number;

  // Classificação biomecânica e anatômica
  movementPattern?: MovementPattern;
  primaryMuscles: string[]; // músculos principais
  secondaryMuscles?: string[]; // músculos secundários / sinergistas
  laterality: Laterality;

  // Equipamentos necessários (inclusive "bodyweight" / sem carga externa)
  equipment: Equipment[];

  // Modalidade e convenções de sobrecarga compatíveis
  measurementType: MeasurementType;
  loadConvention: LoadConvention;
  allowedLoadConventions?: LoadConvention[];

  // Instruções e orientações técnicas
  instructions?: string[];
  commonErrors?: string[];
  cues?: string[]; // dicas rápidas de execução

  // Mídias semânticas estruturadas
  media: ExerciseMediaItem[];

  // Governança e revisão de conteúdo
  contentOrigin: ContentOrigin;
  reviewStatus: ReviewStatus;

  // Variantes
  parentExerciseId?: string;
  variantNotes?: string;

  // Campo de compatibilidade com SessionExercise
  targetMuscles?: string;
}

export type CreateExerciseInput = Omit<
  CatalogExercise,
  "id" | "version" | "createdAt" | "updatedAt" | "status" | "media" | "contentOrigin" | "reviewStatus"
> & {
  status?: ExerciseStatus;
  media?: ExerciseMediaItem[];
  contentOrigin?: ContentOrigin;
  reviewStatus?: ReviewStatus;
  customId?: string;
};

/**
 * Validação dos campos mínimos para publicação de um exercício.
 */
export interface ExercisePublicationValidation {
  canPublish: boolean;
  errors: string[];
  warnings: string[];
}

export function validateExerciseForPublication(
  exercise: Partial<CatalogExercise>
): ExercisePublicationValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Nome obrigatório (mínimo 3 caracteres)
  if (!exercise.name || exercise.name.trim().length < 3) {
    errors.push("O nome do exercício deve ter pelo menos 3 caracteres.");
  }

  // 2. Tipo de medida obrigatório
  if (!exercise.measurementType || !["reps", "duration", "distance"].includes(exercise.measurementType)) {
    errors.push("O tipo de medida (repetições, duração ou distância) deve ser selecionado.");
  }

  // 3. Convenção de carga obrigatória
  if (
    !exercise.loadConvention ||
    !["total", "per_implement", "additional", "bodyweight"].includes(exercise.loadConvention)
  ) {
    errors.push("A convenção de carga deve ser selecionada.");
  }

  // 4. Lateralidade
  if (!exercise.laterality || !["bilateral", "unilateral", "alternating", "not_applicable"].includes(exercise.laterality)) {
    errors.push("A lateralidade do movimento deve ser definida.");
  }

  // 5. Equipamentos explicitados (inclusive "bodyweight")
  if (!exercise.equipment || exercise.equipment.length === 0) {
    errors.push("Pelo menos um equipamento deve ser selecionado (ou selecione 'Peso corporal / Sem equipamento').");
  }

  // 6. Músculos principais
  if (!exercise.primaryMuscles || exercise.primaryMuscles.length === 0) {
    errors.push("Selecione pelo menos um músculo ou grupo muscular principal.");
  }

  // 7. Instruções básicas
  const hasValidInstruction =
    (exercise.instructions && exercise.instructions.some((i) => i.trim().length > 0)) ||
    (exercise.description && exercise.description.trim().length >= 10);

  if (!hasValidInstruction) {
    errors.push("Forneça pelo menos uma instrução de execução ou descrição básica revisada.");
  }

  // Coerência entre equipamento e convenção de carga
  if (exercise.loadConvention === "bodyweight" && exercise.equipment && !exercise.equipment.includes("bodyweight")) {
    warnings.push("A convenção é peso corporal, mas o equipamento 'bodyweight' não foi marcado.");
  }

  // Mídia ausente não impede publicação (gera apenas aviso informativo)
  const hasMedia = exercise.media && exercise.media.some((m) => m.availability === "available");
  if (!hasMedia) {
    warnings.push("Este exercício não possui mídias locais disponíveis. Ele será publicado com indicador de mídia pendente.");
  }

  return {
    canPublish: errors.length === 0,
    errors,
    warnings,
  };
}
