import { ObservatorioRepositoryError } from "./errors.ts";
import type {
  ContagemOperacoes,
  LoteIngestaoInput,
  OperacaoPersistencia,
  ResultadoIngestao,
} from "./types.ts";
import type {
  ObservatorioIngestionRepository,
  ObservatorioTransaction,
} from "./repository.ts";
import { validateAndNormalizeBatch } from "./validation.ts";

function emptyCounter(): ContagemOperacoes {
  return { inseridos: 0, atualizados: 0, inalterados: 0 };
}

function count(counter: ContagemOperacoes, operation: OperacaoPersistencia) {
  if (operation === "inserido") counter.inseridos += 1;
  if (operation === "atualizado") counter.atualizados += 1;
  if (operation === "inalterado") counter.inalterados += 1;
}

function resultFor(runKey: string): ResultadoIngestao {
  return {
    runKey,
    rodadas: emptyCounter(),
    fontes: emptyCounter(),
    materias: emptyCounter(),
    eventos: emptyCounter(),
    vinculos: emptyCounter(),
    relacoes: emptyCounter(),
    evidencias: emptyCounter(),
  };
}

async function processTransaction(
  transaction: ObservatorioTransaction,
  input: ReturnType<typeof validateAndNormalizeBatch>
): Promise<ResultadoIngestao> {
  const result = resultFor(input.rodada.run_key);
  const round = await transaction.upsertRodada(input.rodada);
  count(result.rodadas, round.operation);

  for (const item of input.itens) {
    const source = await transaction.upsertFonte(item.fonte);
    count(result.fontes, source.operation);

    const article = await transaction.upsertMateria({
      ...item.materia,
      fonte_id: source.record.id,
      rodada_id: round.record.id,
    });
    count(result.materias, article.operation);

    for (const link of item.eventos) {
      const event = await transaction.upsertEvento({
        ...link.evento,
        observado_em: item.materia.coletado_em,
      });
      count(result.eventos, event.operation);

      const eventArticle = await transaction.upsertVinculo({
        evento_id: event.record.id,
        materia_id: article.record.id,
        papel: link.papel,
        criado_em: item.materia.coletado_em,
      });
      count(result.vinculos, eventArticle.operation);
    }
  }

  for (const relationInput of input.relacoes) {
    const [origin, target] = await Promise.all([
      transaction.findEventoByKey(relationInput.evento_origem_chave),
      transaction.findEventoByKey(relationInput.evento_destino_chave),
    ]);
    if (!origin || !target) {
      throw new ObservatorioRepositoryError("resolver eventos da relacao");
    }

    const relation = await transaction.upsertRelacao({
      origem_id: origin.id,
      destino_id: target.id,
      tipo: relationInput.tipo,
      evidencia_status: relationInput.evidencia_status,
      justificativa: relationInput.base_causal
        ? `${relationInput.justificativa}\n\nBase causal: ${relationInput.base_causal}`
        : relationInput.justificativa,
      confianca: relationInput.confianca,
      revisao: relationInput.revisao,
    });
    count(result.relacoes, relation.operation);

    for (const evidenceInput of relationInput.evidencias) {
      const article = await transaction.findMateriaByCanonicalUrl(
        evidenceInput.materia_url_canonica
      );
      if (!article) {
        throw new ObservatorioRepositoryError("resolver materia da evidencia");
      }
      const evidence = await transaction.upsertEvidencia({
        relacao_id: relation.record.id,
        materia_id: article.id,
        papel: evidenceInput.papel,
        justificativa: evidenceInput.justificativa,
      });
      count(result.evidencias, evidence.operation);
    }
  }

  return result;
}

export async function ingestObservatorioBatch(
  repository: ObservatorioIngestionRepository,
  rawInput: LoteIngestaoInput | unknown
): Promise<ResultadoIngestao> {
  const input = validateAndNormalizeBatch(rawInput);
  return repository.transaction((transaction) => processTransaction(transaction, input));
}
