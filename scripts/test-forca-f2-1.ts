import { mockStorage } from "./mock-storage";
import { useExerciseCatalogStore } from "../store/useExerciseCatalogStore";
import { useWorkoutStore } from "../store/useWorkoutStore";
import { validateExerciseForPublication } from "../types/exercise";
import { formatWorkoutsAsJson } from "../components/workout/export-data-panel";
import { WORKOUT_PROGRAM } from "../app/forca/page";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    console.error(`❌ FAILED: ${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runForcaF21Tests() {
  console.log("=========================================================");
  console.log("   CAMINI FORÇA - F2.1 CATÁLOGO DE EXERCÍCIOS TESTS      ");
  console.log("=========================================================\n");

  const catalogStore = useExerciseCatalogStore.getState();
  const workoutStore = useWorkoutStore.getState();

  // Reset store to empty baseline
  useExerciseCatalogStore.setState({ exercises: [] });
  workoutStore.discardWorkout();
  useWorkoutStore.setState({ completedWorkouts: [] });

  // TEST 1: Inicialização / importação inicial idempotente do catálogo
  console.log("Test 1: Inicialização / importação inicial idempotente do catálogo");
  {
    catalogStore.initializeCatalog();
    const initialList = useExerciseCatalogStore.getState().exercises;
    assert(initialList.length >= 16, "Catálogo padrão deve conter pelo menos 16 exercícios canônicos");
    
    // Todos devem ser marcados como imported e pending review
    const sample = initialList.find(e => e.id === "agachamento_goblet");
    assert(Boolean(sample), "Agachamento Goblet deve estar presente");
    assertEqual(sample!.contentOrigin, "imported", "Origem deve ser 'imported'");
    assertEqual(sample!.reviewStatus, "pending", "Status de revisão deve ser 'pending'");
    assertEqual(sample!.status, "published", "Exercícios canônicos devem estar publicados para consulta");

    // Segunda chamada deve ser 100% idempotente (não duplicar)
    catalogStore.initializeCatalog();
    const listAfterSecondInit = useExerciseCatalogStore.getState().exercises;
    assertEqual(listAfterSecondInit.length, initialList.length, "Re-inicialização não deve duplicar exercícios");

    console.log("  ✅ PASS: Inicialização idempotente com origem 'imported' e revisão 'pending' comprovada.");
  }

  // TEST 2: Criar exercício como rascunho (draft)
  console.log("\nTest 2: Criar novo exercício como rascunho");
  {
    const created = catalogStore.createExercise({
      name: "Crucifixo Reto no Solo",
      alternativeNames: ["Floor Fly", "Abertura com Halteres"],
      description: "Variação de crucifixo deitado no solo com segurança para a articulação do ombro.",
      status: "draft",
      movementPattern: "isolation",
      laterality: "bilateral",
      primaryMuscles: ["Peitoral"],
      secondaryMuscles: ["Deltoide Anterior"],
      equipment: ["dumbbell"],
      measurementType: "reps",
      loadConvention: "per_implement",
      instructions: ["Deite no solo com halteres acima do peito.", "Abra os braços controladamente até tocar o solo."],
      media: [],
      contentOrigin: "user_created",
      reviewStatus: "reviewed",
    });

    assert(Boolean(created.id), "Exercício deve ter ID gerado");
    assertEqual(created.status, "draft", "Status inicial deve ser rascunho");
    assertEqual(created.version, 1, "Versão inicial deve ser 1");
    assertEqual(created.contentOrigin, "user_created", "Origem deve ser 'user_created'");

    const found = catalogStore.getExerciseById(created.id);
    assert(Boolean(found), "Exercício deve ser localizável por getExerciseById");
    assertEqual(found!.name, "Crucifixo Reto no Solo", "Nome coincide");

    console.log("  ✅ PASS: Criação de rascunho com metadados corretos comprovada.");
  }

  // TEST 3: Editar exercício preservando ID e incrementando versão
  console.log("\nTest 3: Editar exercício preservando ID estável e incrementando versão");
  {
    const exercise = useExerciseCatalogStore.getState().exercises[0];
    const originalId = exercise.id;
    const originalCreatedAt = exercise.createdAt;
    const originalVersion = exercise.version;

    // Atualiza o nome e adiciona cue
    const updated = catalogStore.updateExercise(originalId, {
      name: `${exercise.name} (Revisado)`,
      cues: ["Foco na respiração e cadência."],
    });
    assert(updated, "updateExercise deve retornar true");

    const reloaded = catalogStore.getExerciseById(originalId)!;
    assertEqual(reloaded.id, originalId, "ID estável deve ser estritamente preservado");
    assertEqual(reloaded.createdAt, originalCreatedAt, "Data de criação deve ser preservada");
    assertEqual(reloaded.version, originalVersion + 1, "Versão deve ser incrementada em 1");
    assert(reloaded.updatedAt >= reloaded.createdAt, "updatedAt deve ser atualizado");
    assertEqual(reloaded.name, `${exercise.name} (Revisado)`, "Nome deve ser atualizado");

    console.log("  ✅ PASS: Edição preserva ID e data de criação enquanto versiona o registro.");
  }

  // TEST 4: Não sobrescrever edições do usuário ao re-inicializar
  console.log("\nTest 4: Não sobrescrever registros editados pelo usuário ao re-inicializar");
  {
    const customDescription = "Descrição personalizada editada pelo usuário Christian.";
    catalogStore.updateExercise("agachamento_goblet", { description: customDescription });

    // Executa initializeCatalog novamente
    catalogStore.initializeCatalog();

    const afterInit = catalogStore.getExerciseById("agachamento_goblet")!;
    assertEqual(afterInit.description, customDescription, "Edição do usuário NÃO pode ser sobrescrita pela semente canônica");

    console.log("  ✅ PASS: Edições do usuário são blindadas contra sobrescrita por semente.");
  }

  // TEST 5: Validação rigorosa para publicação de exercício
  console.log("\nTest 5: Validação rigorosa dos campos mínimos para publicação");
  {
    // Exercício incompleto (sem instruções e sem equipamento)
    const incomplete = validateExerciseForPublication({
      name: "Ab", // muito curto
      measurementType: "reps",
      loadConvention: "total",
      laterality: "bilateral",
      equipment: [], // vazio
      primaryMuscles: [], // vazio
      instructions: [], // vazio
    });

    assertEqual(incomplete.canPublish, false, "Exercício incompleto NÃO deve poder ser publicado");
    assert(incomplete.errors.length >= 4, "Deve acusar múltiplos erros de validação");

    // Exercício completo (mesmo sem mídias)
    const complete = validateExerciseForPublication({
      name: "Supino Inclinado com Halteres",
      measurementType: "reps",
      loadConvention: "per_implement",
      laterality: "bilateral",
      equipment: ["dumbbell", "bench"],
      primaryMuscles: ["Peitoral"],
      instructions: ["Posicione o banco a 30 graus e empurre os halteres verticalmente."],
      media: [], // sem mídia
    });

    assertEqual(complete.canPublish, true, "Exercício completo deve poder ser publicado");
    assertEqual(complete.errors.length, 0, "Zero erros impeditivos");
    assert(complete.warnings.length > 0, "Mídia ausente deve gerar apenas aviso informativo, sem bloquear publicação");

    console.log("  ✅ PASS: Critérios de publicação e aviso de mídia pendente validados com precisão.");
  }

  // TEST 6: Publicar exercício através do store
  console.log("\nTest 6: Publicar exercício através do store");
  {
    const draftEx = catalogStore.createExercise({
      name: "Elevação Pélvica com Barra",
      measurementType: "reps",
      loadConvention: "total",
      laterality: "bilateral",
      equipment: ["barbell", "bench"],
      primaryMuscles: ["Glúteos"],
      instructions: ["Apoie as escápulas no banco e empurre a barra até a extensão total do quadril."],
      status: "draft",
    });

    assertEqual(draftEx.status, "draft", "Criado como rascunho");

    const publishResult = catalogStore.publishExercise(draftEx.id);
    assertEqual(publishResult.success, true, "Publicação deve ser bem-sucedida");

    const published = catalogStore.getExerciseById(draftEx.id)!;
    assertEqual(published.status, "published", "Status atualizado para 'published'");
    assertEqual(published.reviewStatus, "reviewed", "Revisão atualizada para 'reviewed'");

    console.log("  ✅ PASS: Fluxo de publicação no store concluído com sucesso.");
  }

  // TEST 7: Arquivar e restaurar exercício
  console.log("\nTest 7: Arquivar e restaurar exercício com preservação de integridade");
  {
    const target = useExerciseCatalogStore.getState().exercises.find(e => e.status === "published")!;
    const targetId = target.id;

    // Arquivar
    const archived = catalogStore.archiveExercise(targetId);
    assertEqual(archived, true, "archiveExercise deve retornar true");
    assertEqual(catalogStore.getExerciseById(targetId)!.status, "archived", "Status deve ser 'archived'");

    // Restaurar
    const restored = catalogStore.restoreExercise(targetId);
    assertEqual(restored, true, "restoreExercise deve retornar true");
    assertEqual(catalogStore.getExerciseById(targetId)!.status, "published", "Status deve retornar a 'published'");

    console.log("  ✅ PASS: Arquivamento e restauração preservam o exercício sem exclusão destrutiva.");
  }

  // TEST 8: Aviso de nomes duplicados sem bloquear variantes legítimas
  console.log("\nTest 8: Detecção de nomes duplicados com permissão para variantes");
  {
    // Verifica duplicidade para nome existente "Agachamento Goblet"
    const duplicates = catalogStore.checkDuplicateName("Agachamento Goblet");
    assert(duplicates.length > 0, "Deve detectar exercício com nome idêntico ou similar");

    // Excluindo o próprio ID (em edição) não deve acusar a si mesmo
    const selfCheck = catalogStore.checkDuplicateName("Agachamento Goblet", duplicates[0].id);
    assertEqual(selfCheck.length, 0, "Não deve reportar o próprio registro como duplicado");

    // Criação de variante legítima permitida
    const variant = catalogStore.createExercise({
      name: "Agachamento Goblet com Pausa",
      parentExerciseId: duplicates[0].id,
      variantNotes: "Variação com pausa isométrica de 3s no ponto de maior profundidade.",
      measurementType: "reps",
      loadConvention: "total",
      laterality: "bilateral",
      equipment: ["dumbbell"],
      primaryMuscles: ["Quadríceps"],
      instructions: ["Agache e segure por 3 segundos no fundo."],
    });

    assert(Boolean(variant.id), "Variante legítima deve ser criada com ID próprio");
    assertEqual(variant.parentExerciseId, duplicates[0].id, "Relação de parentesco preservada");

    console.log("  ✅ PASS: Detecção de duplicados alerta sem bloquear variantes legítimas.");
  }

  // TEST 9: Preservar sessão ativa e histórico após mutações no catálogo
  console.log("\nTest 9: Preservar sessão ativa e histórico após mutações no catálogo");
  {
    // Inicia treino ativo A no workout store
    workoutStore.startWorkout(WORKOUT_PROGRAM[0]);
    workoutStore.logSet({ reps: 10, weight: 40, type: "work" });

    const activeBefore = JSON.parse(JSON.stringify(useWorkoutStore.getState().activeWorkout!));

    // Modifica nome e classificação do exercício no catálogo
    catalogStore.updateExercise("agachamento_goblet", {
      name: "Nome Alterado Radicalmente no Catálogo",
      primaryMuscles: ["Músculos Diferentes"],
    });

    // Finaliza treino e valida histórico
    workoutStore.finishWorkout(false);
    const completedSession = useWorkoutStore.getState().completedWorkouts[0];

    // O snapshot da sessão preserva seu próprio nome e dados imutáveis
    assertEqual(activeBefore.exercises[0].exerciseName, "Agachamento Goblet", "Sessão ativa mantinha snapshot original");
    assertEqual(completedSession.exercises[0].exerciseName, "Agachamento Goblet", "Histórico preserva snapshot de quando foi executado");

    console.log("  ✅ PASS: Snapshots de sessão ativa e histórico são 100% independentes do catálogo.");
  }

  // TEST 10: Persistência e recuperação no localStorage
  console.log("\nTest 10: Persistência e recuperação do catálogo no localStorage");
  {
    const serialized = mockStorage.getItem("camini-exercise-catalog-storage");
    assert(Boolean(serialized), "localStorage deve conter 'camini-exercise-catalog-storage'");

    const parsed = JSON.parse(serialized!);
    assert(Boolean(parsed.state), "JSON persistido deve conter campo state");
    assert(parsed.state.exercises.length > 0, "Array de exercícios deve estar persistido");

    console.log("  ✅ PASS: Serialização e hidratação do catálogo em armazenamento local confirmadas.");
  }

  // TEST 11: Exportação JSON unificada incluindo catálogo versionado
  console.log("\nTest 11: Exportação JSON versionada incluindo catálogo sem quebra de compatibilidade");
  {
    const history = useWorkoutStore.getState().completedWorkouts;
    const catalog = useExerciseCatalogStore.getState().exercises;

    const exportedJsonStr = formatWorkoutsAsJson(history, catalog);
    const parsed = JSON.parse(exportedJsonStr);

    assertEqual(parsed.app, "Camini FORÇA", "Identificador do app no JSON");
    assert(parsed.schemaVersion >= 1, "Versão de esquema deve ser >= 1");
    assertEqual(parsed.totalSessions, 1, "totalSessions preservado");
    assert(Array.isArray(parsed.sessions), "Array sessions preservado");
    assert(Array.isArray(parsed.catalog), "Array catalog presente no envelope");
    assert(parsed.catalog.length >= 16, "Catálogo completo exportado no backup");

    console.log("  ✅ PASS: Envelope de backup exporta catálogo de forma compatível e versionada.");
  }

  // TEST 12: Mídias semânticas: presença de referências locais e fallbacks
  console.log("\nTest 12: Mídias semânticas, referências locais e status de disponibilidade");
  {
    const goblet = catalogStore.getExerciseById("agachamento_goblet")!;
    assert(goblet.media.length >= 8, "Goblet deve ter 8 mídias catalogadas");
    const availableMedia = goblet.media.filter(m => m.availability === "available");
    assert(availableMedia.length >= 8, "Todas as 8 mídias de agachamento goblet devem estar com disponibilidade 'available'");

    const stiff = catalogStore.getExerciseById("stiff_levantamento_romeno_com_barra")!;
    assert(stiff.media.length > 0, "Stiff deve ter referência de mídia");
    assertEqual(stiff.media[0].availability, "pending_download", "Mídia não baixada deve ter status 'pending_download'");

    console.log("  ✅ PASS: Mapeamento semântico de mídias e fallbacks funcionando com exatidão.");
  }

  console.log("\n=========================================================");
  console.log("🎉 ALL 12 F2.1 CATALOG AUDIT TESTS PASSED SUCCESSFULLY!");
  console.log("=========================================================\n");
}

runForcaF21Tests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
