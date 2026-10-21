import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database.types";
import { ObservatorioRepositoryError } from "./errors.ts";
import type { LoteIngestaoInput } from "./types.ts";
import { validateAndNormalizeBatch } from "./validation.ts";

const HML_PROJECT_REF = "hrpathjcxyzzwxgkhwnt";

export interface ResultadoIngestaoSupabase {
  runKey: string;
  roundId: string;
  inseridos: {
    fontes: number;
    materias: number;
    eventos: number;
    relacoes: number;
    evidencias: number;
  };
}

type RpcClient = Pick<ReturnType<typeof createClient<Database>>, "rpc">;

function requiredHmlConfiguration() {
  const url = process.env.OBSERVATORIO_HML_SUPABASE_URL;
  const secret = process.env.OBSERVATORIO_HML_SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new ObservatorioRepositoryError("configurar a ingestao HML");
  }

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    throw new ObservatorioRepositoryError("validar a URL da ingestao HML");
  }
  if (hostname !== `${HML_PROJECT_REF}.supabase.co`) {
    throw new ObservatorioRepositoryError("confirmar o projeto HML da ingestao");
  }

  return { url, secret };
}

function rpcPayload(rawInput: unknown): Json {
  const input = validateAndNormalizeBatch(rawInput);
  const sources = new Map<string, Record<string, Json>>();

  for (const item of input.itens) {
    const existing = sources.get(item.fonte.dominio);
    const articles = (existing?.articles as Json[] | undefined) ?? [];
    articles.push({
      ...item.materia,
      events: item.eventos.map(({ evento, papel }) => ({ ...evento, papel })),
    });
    sources.set(item.fonte.dominio, {
      ...item.fonte,
      articles,
    });
  }

  return {
    round: input.rodada,
    sources: [...sources.values()],
    relations: input.relacoes.map((relation) => ({
      origem_chave: relation.evento_origem_chave,
      destino_chave: relation.evento_destino_chave,
      tipo: relation.tipo,
      evidencia_status: relation.evidencia_status,
      justificativa: relation.base_causal
        ? `${relation.justificativa}\n\nBase causal: ${relation.base_causal}`
        : relation.justificativa,
      confianca: relation.confianca,
      revisao: relation.revisao,
      evidencias: relation.evidencias.map((evidence) => ({
        url_canonica: evidence.materia_url_canonica,
        papel: evidence.papel,
        justificativa: evidence.justificativa,
      })),
    })),
  } as unknown as Json;
}

function parseResult(value: Json): ResultadoIngestaoSupabase {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ObservatorioRepositoryError("validar a resposta da ingestao");
  }
  const inserted = value.inserted;
  if (!inserted || typeof inserted !== "object" || Array.isArray(inserted)) {
    throw new ObservatorioRepositoryError("validar as contagens da ingestao");
  }

  const count = (key: string) => {
    const candidate = inserted[key];
    if (typeof candidate !== "number" || !Number.isInteger(candidate) || candidate < 0) {
      throw new ObservatorioRepositoryError("validar as contagens da ingestao");
    }
    return candidate;
  };
  if (typeof value.run_key !== "string" || typeof value.round_id !== "string") {
    throw new ObservatorioRepositoryError("validar a identidade da ingestao");
  }

  return {
    runKey: value.run_key,
    roundId: value.round_id,
    inseridos: {
      fontes: count("sources"),
      materias: count("articles"),
      eventos: count("events"),
      relacoes: count("relations"),
      evidencias: count("evidences"),
    },
  };
}

export async function executeObservatorioIngestion(
  client: RpcClient,
  rawInput: LoteIngestaoInput | unknown
): Promise<ResultadoIngestaoSupabase> {
  const payload = rpcPayload(rawInput);
  const { data, error } = await client.rpc("observatorio_ingest_lote", {
    p_payload: payload,
  });

  if (error || data === null) {
    console.error("Falha na RPC de ingestao do Observatorio.", {
      code: error?.code ?? "EMPTY_RESPONSE",
      runKey: (payload as { round?: { run_key?: string } }).round?.run_key,
    });
    throw new ObservatorioRepositoryError("executar a ingestao HML");
  }

  return parseResult(data);
}

export async function ingestObservatorioBatchInHml(
  rawInput: LoteIngestaoInput | unknown
): Promise<ResultadoIngestaoSupabase> {
  const { url, secret } = requiredHmlConfiguration();
  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return executeObservatorioIngestion(client, rawInput);
}
