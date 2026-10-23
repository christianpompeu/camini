import "server-only";

import { createClient, type PostgrestResponse } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ObservatorioRepositoryError } from "./errors.ts";

const OBSERVATORIO_HML_HOST = "hrpathjcxyzzwxgkhwnt.supabase.co";

function createPrivateClient() {
  return createObservatorioHmlClient();
}

function unwrap<T>(operation: string, response: PostgrestResponse<T>): T[] {
  if (response.error) {
    throw new ObservatorioRepositoryError(operation, { cause: response.error });
  }
  return response.data ?? [];
}

export interface PrivateSnapshotOptions {
  limitPerTable?: number;
}

export type PrivateObservatorioSnapshot = Awaited<ReturnType<typeof readPrivateObservatorioSnapshot>>;

export async function readPrivateObservatorioSnapshot(
  options: PrivateSnapshotOptions = {}
) {
  const limit = options.limitPerTable ?? 500;
  if (!Number.isInteger(limit) || limit < 1 || limit > 1_000) {
    throw new ObservatorioRepositoryError("validar limite de leitura");
  }

  const supabase = createPrivateClient();
  const [
    roundsResponse,
    sourcesResponse,
    articlesResponse,
    eventsResponse,
    linksResponse,
    relationsResponse,
    evidencesResponse,
    trendsResponse,
    trendEventsResponse,
    editionsResponse,
  ] = await Promise.all([
    supabase
      .from("observatorio_rodadas")
      .select("id,run_key,canal,origem,status,janela_inicio,janela_fim,iniciado_em,concluido_em,resumo,diagnostico")
      .order("iniciado_em", { ascending: false })
      .limit(limit),
    supabase
      .from("observatorio_fontes")
      .select("id,nome,dominio,tipo,notas,criado_em")
      .order("dominio")
      .limit(limit),
    supabase
      .from("observatorio_materias")
      .select("id,fonte_id,rodada_id,url_canonica,titulo,resumo,idioma,formato,status_verificacao,revisao_por_pares,publicado_em,coletado_em,metadados")
      .order("coletado_em", { ascending: false })
      .limit(limit),
    supabase
      .from("observatorio_eventos")
      .select("id,chave,titulo,descricao,categoria,data_evento,data_evento_precisao,status_verificacao,status_sanitizacao,evento_canonico_id,notion_page_id,visto_primeiro_em,visto_ultimo_em,dados")
      .order("visto_ultimo_em", { ascending: false })
      .limit(limit),
    supabase
      .from("observatorio_eventos_materias")
      .select("evento_id,materia_id,papel,criado_em")
      .order("criado_em", { ascending: false })
      .limit(limit),
    supabase
      .from("observatorio_relacoes")
      .select("id,origem_id,destino_id,tipo,evidencia_status,justificativa,confianca,revisao,notion_page_id,criado_em,revisado_em")
      .order("criado_em", { ascending: false })
      .limit(limit),
    supabase
      .from("observatorio_relacoes_evidencias")
      .select("relacao_id,materia_id,papel,justificativa")
      .limit(limit),
    supabase
      .from("observatorio_tendencias")
      .select("id,slug,titulo,descricao,estado,metodo,janela_inicio,janela_fim,score,base_amostral,notion_page_id,atualizado_em,metadados")
      .order("atualizado_em", { ascending: false })
      .limit(limit),
    supabase
      .from("observatorio_tendencias_eventos")
      .select("tendencia_id,evento_id,ligado_em")
      .order("ligado_em", { ascending: false })
      .limit(limit),
    supabase
      .from("observatorio_edicoes")
      .select("id,identificador,canal,rodada_id,titulo,resumo,status,notion_page_id,notion_url,snapshot,versao,criada_em,aprovada_em,publicada_em")
      .order("criada_em", { ascending: false })
      .limit(limit),
  ]);

  return {
    rodadas: unwrap("ler rodadas", roundsResponse),
    fontes: unwrap("ler fontes", sourcesResponse),
    materias: unwrap("ler materias", articlesResponse),
    eventos: unwrap("ler eventos", eventsResponse),
    eventosMaterias: unwrap("ler vinculos materia-evento", linksResponse),
    relacoes: unwrap("ler relacoes", relationsResponse),
    relacoesEvidencias: unwrap("ler evidencias", evidencesResponse),
    tendencias: unwrap("ler tendencias", trendsResponse),
    tendenciasEventos: unwrap("ler vinculos tendencia-evento", trendEventsResponse),
    edicoes: unwrap("ler edicoes", editionsResponse),
  };
}

export async function readPrivateObservatorioGraph(limit = 500) {
  const snapshot = await readPrivateObservatorioSnapshot({ limitPerTable: limit });
  return {
    nodes: snapshot.eventos,
    edges: snapshot.relacoes,
    evidences: snapshot.relacoesEvidencias,
    articles: snapshot.materias,
  };
}

function createObservatorioHmlClient() {
  const url = process.env.OBSERVATORIO_HML_SUPABASE_URL;
  const secret = process.env.OBSERVATORIO_HML_SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new ObservatorioRepositoryError("configurar credencial HML server-only");
  try {
    if (new URL(url).hostname !== "hrpathjcxyzzwxgkhwnt.supabase.co") {
      throw new ObservatorioRepositoryError("validar projeto HML do Observatório");
    }
  } catch (error) {
    if (error instanceof ObservatorioRepositoryError) throw error;
    throw new ObservatorioRepositoryError("validar URL HML do Observatório");
  }
  return createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export function createObservatorioHmlActionClient(accessToken: string) {
  const url = process.env.OBSERVATORIO_HML_SUPABASE_URL;
  const secret = process.env.OBSERVATORIO_HML_SUPABASE_SECRET_KEY;
  if (!url || !secret || !accessToken) throw new ObservatorioRepositoryError("configurar sessão HML server-only");
  try {
    if (new URL(url).hostname !== OBSERVATORIO_HML_HOST) {
      throw new ObservatorioRepositoryError("validar projeto HML do Observatório");
    }
  } catch (error) {
    if (error instanceof ObservatorioRepositoryError) throw error;
    throw new ObservatorioRepositoryError("validar URL HML do Observatório");
  }
  return createClient<Database>(url, secret, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function readPrivateObservatorioEdition(identifier: string) {
  const normalized = identifier.trim();
  if (!normalized || normalized.length > 160) {
    throw new ObservatorioRepositoryError("validar identificador da edição");
  }
  const response = await createObservatorioHmlClient()
    .from("observatorio_edicoes")
    .select("id,identificador,canal,rodada_id,titulo,resumo,status,notion_page_id,notion_url,snapshot,versao,criada_em,aprovada_em,publicada_em")
    .eq("identificador", normalized)
    .maybeSingle();
  if (response.error) {
    throw new ObservatorioRepositoryError("ler edição privada", { cause: response.error });
  }
  return response.data;
}
