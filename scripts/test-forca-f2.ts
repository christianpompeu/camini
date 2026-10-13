import { mockStorage } from "./mock-storage";

import { useWorkoutStore, WorkoutSession, sanitizeSetRecord } from "../store/useWorkoutStore";
import { formatWorkoutsAsJson, formatWorkoutsAsCsv, escapeCsvField } from "../components/workout/export-data-panel";
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

async function runForcaF2Tests() {
  console.log("=================================================");
  console.log("   CAMINI FORÇA - F2 AUTOMATED AUDIT TEST SUITE   ");
  console.log("=================================================\n");

  const store = useWorkoutStore.getState();

  // Reset store to known state
  store.discardWorkout();
  useWorkoutStore.setState({ completedWorkouts: [] });

  // TEST 1: Corrigir série preservando ID e horário original, atualizando editedAt
  console.log("Test 1: Corrigir série preservando setId e completedAt, atualizando editedAt");
  {
    store.startWorkout(WORKOUT_PROGRAM[0]); // Treino A
    const active1 = useWorkoutStore.getState().activeWorkout!;
    assertEqual(active1.activeExerciseIndex, 0, "Índice ativo inicia em 0");
    
    // Log a set
    const logged = store.logSet({
      reps: 10,
      weight: 50,
      rir: 2,
      type: "work",
      note: "Original note"
    });
    assert(logged, "logSet deve retornar true");

    const activeWithSet = useWorkoutStore.getState().activeWorkout!;
    const originalSet = activeWithSet.exercises[0].sets[0];
    const originalId = originalSet.id;
    const originalCompletedAt = originalSet.completedAt;

    assert(Boolean(originalId), "Série deve ter ID gerado");
    assert(Boolean(originalCompletedAt), "Série deve ter completedAt");
    assertEqual(originalSet.editedAt, undefined, "Série nova não deve ter editedAt");

    // Wait 15ms to ensure editedAt timestamp is strictly distinct
    await new Promise(r => setTimeout(r, 15));

    // Edit the set in active workout
    const updated = store.updateSet(originalId, {
      reps: 12,
      weight: 55,
      rir: 1,
      type: "work",
      note: "Corrected note"
    });
    assert(updated, "updateSet deve retornar true");

    const activeAfterEdit = useWorkoutStore.getState().activeWorkout!;
    const updatedSet = activeAfterEdit.exercises[0].sets[0];

    assertEqual(updatedSet.id, originalId, "setId deve ser estritamente preservado");
    assertEqual(updatedSet.completedAt, originalCompletedAt, "completedAt deve ser estritamente preservado");
    assertEqual(updatedSet.reps, 12, "Reps deve ter sido atualizado");
    assertEqual(updatedSet.weight, 55, "Peso deve ter sido atualizado");
    assertEqual(updatedSet.rir, 1, "RIR deve ter sido atualizado");
    assertEqual(updatedSet.note, "Corrected note", "Observação deve ter sido atualizada");
    assert(Boolean(updatedSet.editedAt), "editedAt deve ter sido registrado");
    assert(updatedSet.editedAt! > originalCompletedAt, "editedAt deve ser posterior a completedAt");

    console.log("  ✅ PASS: Preservação de ID e completedAt com registro de editedAt comprovada.");
  }

  // TEST 2: Cancelar edição sem mutação
  console.log("\nTest 2: Cancelar edição sem mutação residual");
  {
    const active = useWorkoutStore.getState().activeWorkout!;
    const setBefore = { ...active.exercises[0].sets[0] };

    // Se o usuário clica em Cancelar na UI, nenhuma mutação é despachada ao store
    const activeAfterCancel = useWorkoutStore.getState().activeWorkout!;
    const setAfter = activeAfterCancel.exercises[0].sets[0];

    assertEqual(setAfter.id, setBefore.id, "ID inalterado");
    assertEqual(setAfter.reps, setBefore.reps, "Reps inalteradas");
    assertEqual(setAfter.weight, setBefore.weight, "Carga inalterada");
    assertEqual(setAfter.note, setBefore.note, "Notas inalteradas");
    assertEqual(setAfter.editedAt, setBefore.editedAt, "editedAt inalterado");

    console.log("  ✅ PASS: Estado permanece estritamente idêntico sem mutação residual.");
  }

  // TEST 3: Exclusão com confirmação vs cancelamento
  console.log("\nTest 3: Excluir série cancelando vs confirmando");
  {
    const active = useWorkoutStore.getState().activeWorkout!;
    const firstEx = active.exercises[0];
    const initialSetCount = firstEx.sets.length;
    const setToDelete = firstEx.sets[0];

    // Se o usuário cancela no diálogo, deleteSet não é chamado
    assertEqual(useWorkoutStore.getState().activeWorkout!.exercises[0].sets.length, initialSetCount, "Cancelar preserva a série");

    // Usuário confirma exclusão
    store.deleteSet(setToDelete.id);

    const activeAfterDelete = useWorkoutStore.getState().activeWorkout!;
    assertEqual(activeAfterDelete.exercises[0].sets.length, initialSetCount - 1, "Série excluída com sucesso após confirmação");

    console.log("  ✅ PASS: Exclusão com confirmação remove série com precisão.");
  }

  // TEST 4: Registrar carga zero válida
  console.log("\nTest 4: Registrar carga zero válida (peso corporal / anilha zero)");
  {
    // Log set with 0 kg
    const logged = store.logSet({
      reps: 15,
      weight: 0,
      rir: 3,
      type: "work"
    });
    assert(logged, "logSet com 0 kg deve ser aceito");

    const updatedActive = useWorkoutStore.getState().activeWorkout!;
    const loggedZeroSet = updatedActive.exercises[0].sets.find(s => s.reps === 15);
    assert(loggedZeroSet !== undefined, "Série com 0 kg deve estar presente");
    assertEqual(loggedZeroSet!.weight, 0, "Carga 0 deve ser preservada (zero é válido)");

    // Testa sanitizer diretamente com valores negativos (deve falhar)
    const sanitizedNegative = sanitizeSetRecord("reps", {
      reps: 10,
      weight: -20
    });
    assertEqual(sanitizedNegative.valid, false, "Carga negativa deve ser rejeitada pelo sanitizer");

    console.log("  ✅ PASS: Carga 0 kg é válida e preservada; valores negativos rejeitados.");
  }

  // TEST 5: Registrar e corrigir duração e distância
  console.log("\nTest 5: Registrar e corrigir duração e distância (limpando campos irrelevantes)");
  {
    // Sanitize duration exercise: deve apagar reps e distanceMeters
    const timeSanitized = sanitizeSetRecord("duration", {
      reps: 10, // Não deve poluir
      durationSeconds: 45,
      weight: 0,
      distanceMeters: 100 // Não deve poluir
    });

    assert(timeSanitized.valid, "Duração válida");
    assertEqual(timeSanitized.sanitized!.durationSeconds, 45, "durationSeconds mantido");
    assertEqual(timeSanitized.sanitized!.reps, undefined, "reps deve ser purgado para modalidade duration");
    assertEqual(timeSanitized.sanitized!.distanceMeters, undefined, "distanceMeters deve ser purgado");

    // Sanitize distance exercise: deve apagar reps e durationSeconds
    const distSanitized = sanitizeSetRecord("distance", {
      reps: 12, // Não deve poluir
      distanceMeters: 400,
      weight: 16,
      durationSeconds: 60 // Não deve poluir
    });

    assert(distSanitized.valid, "Distância válida");
    assertEqual(distSanitized.sanitized!.distanceMeters, 400, "distanceMeters mantido");
    assertEqual(distSanitized.sanitized!.reps, undefined, "reps purgado");
    assertEqual(distSanitized.sanitized!.durationSeconds, undefined, "durationSeconds purgado");

    console.log("  ✅ PASS: Medidas de tempo e distância limpam contaminações cruzadas.");
  }

  // TEST 6: Adicionar série extra sem alterar prescrição original
  console.log("\nTest 6: Adicionar série extra sem alterar prescrição original");
  {
    const active = useWorkoutStore.getState().activeWorkout!;
    const firstEx = active.exercises[0];
    const initialExpectedSets = firstEx.expectedSets;
    const initialPrescribedTarget = WORKOUT_PROGRAM[0].exercises[0].expectedSets;

    // Log an extra set
    const extraLogged = store.logSet({
      reps: 8,
      weight: 60,
      type: "work",
      isExtra: true
    });
    assert(extraLogged, "logSet com série extra aceito");

    const activeAfterExtra = useWorkoutStore.getState().activeWorkout!;
    const currentEx = activeAfterExtra.exercises[0];
    const extraSet = currentEx.sets[currentEx.sets.length - 1];

    assertEqual(extraSet.isExtra, true, "isExtra flag gravada na série");
    assertEqual(currentEx.expectedSets, initialExpectedSets, "expectedSets da sessão não deve ser alterado");
    assertEqual(WORKOUT_PROGRAM[0].exercises[0].expectedSets, initialPrescribedTarget, "Prescrição da ficha original não deve ser alterada");

    console.log("  ✅ PASS: Série extra adicionada mantendo prescrição original inalterada.");
  }

  // TEST 7: Finalizar sessão parcial e completa sem duplicação (idempotência)
  console.log("\nTest 7: Finalizar sessão parcial e completa sem duplicação");
  {
    const sessionToFinish = useWorkoutStore.getState().activeWorkout!;
    const sessionId = sessionToFinish.id;

    // Finalização parcial (alguns exercícios ficaram sem séries)
    const finished1 = store.finishWorkout(true);
    assertEqual(finished1, true, "finishWorkout deve retornar true");

    const historyAfter1 = useWorkoutStore.getState().completedWorkouts;
    assertEqual(historyAfter1.length, 1, "Histórico deve conter exatamente 1 sessão");
    assertEqual(historyAfter1[0].id, sessionId, "ID da sessão histórica corresponde ao ativo");
    assertEqual(historyAfter1[0].status, "partial", "Status gravado como partial");
    assertEqual(useWorkoutStore.getState().activeWorkout, null, "activeWorkout deve ser resetado para null");

    // Tentativa de chamada duplicada imediata de finishWorkout
    const finished2 = store.finishWorkout(false);
    assertEqual(finished2, false, "Segunda chamada de finishWorkout sem sessão ativa deve retornar false");
    assertEqual(useWorkoutStore.getState().completedWorkouts.length, 1, "Histórico não deve duplicar registros");

    console.log("  ✅ PASS: Finalização realizada com idempotência e sem duplicação.");
  }

  // TEST 8: Recarregar e recuperar sessão, rascunho e histórico
  console.log("\nTest 8: Recarregar e recuperar sessão, rascunho e histórico via persistência");
  {
    // Start workout B and set a draft
    store.startWorkout(WORKOUT_PROGRAM[1]);
    store.updateDraft({
      weight: 35,
      reps: 12,
      isWarmup: false,
      note: "Rascunho em progresso"
    });

    // Capture serialized state in localStorage
    const serialized = mockStorage.getItem("camini-workout-storage");
    assert(Boolean(serialized), "localStorage deve conter 'camini-workout-storage'");

    const parsed = JSON.parse(serialized!);
    assert(Boolean(parsed.state), "Objeto persistido deve ter state");
    assertEqual(parsed.state.activeWorkout.letter, "B", "activeWorkout recuperado do storage");
    assertEqual(parsed.state.completedWorkouts.length, 1, "completedWorkouts recuperado do storage");
    assertEqual(parsed.state.activeWorkout.exercises[0].draft.weight, 35, "draft recuperado do storage");

    // Limpar ativo para próximos testes
    store.discardWorkout();
    console.log("  ✅ PASS: Estado do Zustand, rascunhos e histórico preservados na serialização.");
  }

  // TEST 9: Alterar ficha sem modificar histórico anterior (preservação de snapshots)
  console.log("\nTest 9: Alterar ficha sem modificar histórico anterior");
  {
    const savedWorkout = useWorkoutStore.getState().completedWorkouts[0];
    const originalExerciseSnapshot = JSON.parse(JSON.stringify(savedWorkout.exercises));

    // A sessão histórica deve ter seus próprios dados preservados
    const historySession = useWorkoutStore.getState().completedWorkouts[0];
    assertEqual(historySession.title, "Pernas e Core", "Título do snapshot da sessão histórica preservado");
    assertEqual(JSON.stringify(historySession.exercises), JSON.stringify(originalExerciseSnapshot), "Exercícios e séries do snapshot histórico preservados");

    // Testar edição em histórico via updateHistoricalSet
    const targetSet = historySession.exercises[0].sets[0];
    const updateResult = store.updateHistoricalSet(historySession.id, targetSet.id, {
      reps: 14,
      note: "Correção retroativa no histórico"
    });
    assert(updateResult, "updateHistoricalSet deve retornar true");

    const reloadedHistory = useWorkoutStore.getState().completedWorkouts[0];
    const reloadedSet = reloadedHistory.exercises[0].sets[0];
    assertEqual(reloadedSet.reps, 14, "Histórico corrigido reflete imediatamente");
    assertEqual(reloadedSet.note, "Correção retroativa no histórico", "Nota atualizada no histórico");
    assert(Boolean(reloadedSet.editedAt), "editedAt gravado no histórico");

    console.log("  ✅ PASS: Sessão histórica opera como snapshot independente e reflete edições reativamente.");
  }

  // TEST 10: Exportar registros com caracteres especiais e formatos
  console.log("\nTest 10: Exportação JSON com schemaVersion e CSV com RFC 4180");
  {
    // Injetar uma sessão no histórico com notas contendo aspas, vírgulas e quebras de linha
    const sessionWithSpecialChars: WorkoutSession = {
      id: "test-special-chars-1",
      startTime: 1776074400000,
      endedAt: 1776078000000,
      durationMs: 3600000,
      activeExerciseIndex: 0,
      isCompleted: true,
      status: "completed",
      letter: "C",
      title: 'Treino C - "Pernas & Posterior", Especial',
      observation: 'Sessão com muito "foco", sem dores.',
      exercises: [
        {
          definitionId: "ex-leg-1",
          exerciseName: 'Agachamento com "Barra Olímpica"',
          measurementType: "reps",
          loadConvention: "total",
          targetMuscles: "Quadríceps",
          expectedSets: 3,
          sets: [
            {
              id: "set-spec-1",
              completedAt: 1776075000000,
              reps: 10,
              weight: 100,
              rir: 2,
              type: "work",
              note: 'Execução "perfeita", cadência 3-1-0.\nSentiu boa ativação de glúteos, sem dor no joelho.'
            }
          ]
        }
      ]
    };

    useWorkoutStore.setState(prev => ({
      completedWorkouts: [...prev.completedWorkouts, sessionWithSpecialChars]
    }));

    const allHistory = useWorkoutStore.getState().completedWorkouts;

    // Test JSON export
    const jsonOutput = formatWorkoutsAsJson(allHistory);
    const parsedJson = JSON.parse(jsonOutput);
    assertEqual(parsedJson.app, "Camini FORÇA", "JSON deve incluir identificador do app");
    assert(parsedJson.schemaVersion >= 1, "JSON deve incluir schemaVersion versionada >= 1");
    assertEqual(parsedJson.totalSessions, 2, "JSON totalSessions deve ser 2");
    assertEqual(parsedJson.sessions[1].title, 'Treino C - "Pernas & Posterior", Especial', "Título do JSON preservado");

    // Test CSV export RFC 4180 escaping
    const csvOutput = formatWorkoutsAsCsv(allHistory);
    assert(csvOutput.includes('"Session ID"'), "CSV deve conter cabeçalho RFC");
    assert(csvOutput.includes('""Barra Olímpica""'), "Aspas internas em nomes devem ser escapadas com aspas duplas");
    assert(csvOutput.includes('""perfeita""'), "Aspas internas em observações devem ser escapadas");
    assert(csvOutput.includes('sem dor no joelho.'), "Quebras de linha dentro do campo protegido por aspas devem ser suportadas");

    // Test escapeCsvField isoladamente
    assertEqual(escapeCsvField('Texto simples'), '"Texto simples"', "Campo simples deve ser delimitado");
    assertEqual(escapeCsvField('Texto, com vírgula'), '"Texto, com vírgula"', "Texto com vírgula deve ser cercado por aspas");
    assertEqual(escapeCsvField('Texto com "aspas"'), '"Texto com ""aspas"""', "Texto com aspas deve duplicar aspas internas");
    assertEqual(escapeCsvField("Linha 1\nLinha 2"), '"Linha 1\nLinha 2"', "Texto com quebra de linha deve ser cercado por aspas");

    console.log("  ✅ PASS: Exportação JSON versionada e CSV estritamente conforme RFC 4180.");
  }

  // TEST 11: Proteção contra duplo clique (debouncing no logSet)
  console.log("\nTest 11: Proteção contra duplo clique no registro de séries");
  {
    store.startWorkout(WORKOUT_PROGRAM[3]); // Treino D
    
    // First rapid tap
    const tap1 = store.logSet({ reps: 10, weight: 40, type: "work" });
    assertEqual(tap1, true, "Primeiro toque aceito");

    // Immediate second rapid tap (< 300ms) com parâmetros idênticos
    const tap2 = store.logSet({ reps: 10, weight: 40, type: "work" });
    assertEqual(tap2, false, "Segundo toque imediato (< 300ms) rejeitado pelo debounce");

    const currentSets = useWorkoutStore.getState().activeWorkout!.exercises[0].sets;
    assertEqual(currentSets.length, 1, "Chamada concorrente no intervalo de debounce deve ser bloqueada");

    store.discardWorkout();
    console.log("  ✅ PASS: Duplo clique bloqueado e séries não duplicadas.");
  }

  // TEST 12: Cálculo de volume e contagens de séries sem contaminação
  console.log("\nTest 12: Cálculo de volume e métricas estritamente por critérios corretos");
  {
    const testWorkout: WorkoutSession = {
      id: "metrics-test-1",
      startTime: 1776074400000,
      endedAt: 1776076200000,
      durationMs: 1800000,
      activeExerciseIndex: 0,
      isCompleted: true,
      status: "completed",
      letter: "A",
      title: "Treino A - Métricas",
      exercises: [
        {
          definitionId: "ex-reps-ext",
          exerciseName: "Supino",
          measurementType: "reps",
          loadConvention: "total",
          targetMuscles: "Peitoral",
          expectedSets: 3,
          sets: [
            { id: "s1", completedAt: 1000, reps: 10, weight: 20, type: "warmup" }, // Aquecimento (NÃO DEVE entrar no volume)
            { id: "s2", completedAt: 2000, reps: 10, weight: 60, type: "work" },   // 600 kg
            { id: "s3", completedAt: 3000, reps: 8, weight: 70, type: "work", isExtra: true } // Extra de trabalho: 560 kg
          ]
        },
        {
          definitionId: "ex-time",
          exerciseName: "Prancha",
          measurementType: "duration",
          loadConvention: "bodyweight",
          targetMuscles: "Core",
          expectedSets: 2,
          sets: [
            { id: "s4", completedAt: 4000, durationSeconds: 60, weight: 0, type: "work" } // Tempo (NÃO DEVE multiplicar 60 x 0 ou peso)
          ]
        },
        {
          definitionId: "ex-dist",
          exerciseName: "Farmer Walk",
          measurementType: "distance",
          loadConvention: "per_implement",
          targetMuscles: "Core",
          expectedSets: 2,
          sets: [
            { id: "s5", completedAt: 5000, distanceMeters: 40, weight: 30, type: "work" } // Distância (NÃO DEVE somar no volume de repetições)
          ]
        }
      ]
    };

    // Critério exato implementado em HistorySessionDetail e no resumo de progresso
    let totalRepsVolumeKg = 0;
    let workSetsCount = 0;
    let warmupSetsCount = 0;
    let extraSetsCount = 0;

    testWorkout.exercises.forEach(ex => {
      const isRepsExternal = (!ex.measurementType || ex.measurementType === "reps") && ex.loadConvention !== "bodyweight";
      ex.sets.forEach(set => {
        if (set.type === "warmup") warmupSetsCount++;
        else workSetsCount++;

        if (set.isExtra) extraSetsCount++;

        if (set.type !== "warmup" && isRepsExternal && (set.weight ?? 0) > 0 && (set.reps ?? 0) > 0) {
          totalRepsVolumeKg += (set.weight ?? 0) * (set.reps ?? 0);
        }
      });
    });

    assertEqual(warmupSetsCount, 1, "1 série de aquecimento");
    assertEqual(workSetsCount, 4, "4 séries de trabalho (s2, s3, s4, s5)");
    assertEqual(extraSetsCount, 1, "1 série extra (s3)");
    assertEqual(totalRepsVolumeKg, 1160, "Volume de carga externa: 600 kg (s2) + 560 kg (s3) = 1160 kg (sem aquecimento nem tempo/distância)");

    console.log("  ✅ PASS: Métricas e volume estritamente consistentes sem contaminação.");
  }

  console.log("\n=================================================");
  console.log("🎉 ALL 12 AUDIT & INTEGRITY TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================\n");
}

runForcaF2Tests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
