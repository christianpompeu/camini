import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CanalObservatorio, StatusEdicao } from "./types.ts";

export type ReconciliationState =
  | "only_notion"
  | "only_hml"
  | "confirmed_match"
  | "status_divergence"
  | "supabase_id_not_found"
  | "insufficient_information";

export interface EditorialEdition {
  id: string;
  identificador: string;
  titulo: string;
  canal: CanalObservatorio;
  resumo: string;
  status: StatusEdicao;
  statusOriginal: string | null;
  revisao: "pendente" | "em_revisao" | "concluida" | "indisponivel";
  revisaoOriginal: string | null;
  slug: string | null;
  supabaseId: string;
  origem: "Notion" | "Supabase HML";
  criadaEm: string;
  publicadaEm: string | null;
  notionUrl: string | null;
  ultimaAlteracao: string | null;
  reconciliacao: ReconciliationState;
}

export interface EditorialQueue {
  editions: EditorialEdition[];
  notionAvailable: boolean;
  hmlAvailable: boolean;
  notice: string | null;
}

const NOTION_VERSION = "2026-03-11";
const DEFAULT_DATA_SOURCE_ID = "469de5a5-6634-45eb-9d43-9019ac0f46eb";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function hmlClient() {
  const url = process.env.OBSERVATORIO_HML_SUPABASE_URL;
  const secret = process.env.OBSERVATORIO_HML_SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;
  try {
    if (new URL(url).hostname !== "hrpathjcxyzzwxgkhwnt.supabase.co") return null;
  } catch {
    return null;
  }
  return createClient<Database>(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

function property(properties: Record<string, unknown>, aliases: string[]) {
  const keys = aliases.map(normalize);
  const key = Object.keys(properties).find((candidate) => keys.includes(normalize(candidate)));
  return key ? properties[key] as Record<string, unknown> : undefined;
}

function plainText(value: Record<string, unknown> | undefined): string | null {
  const items = Array.isArray(value?.title) ? value.title : Array.isArray(value?.rich_text) ? value.rich_text : [];
  const text = items.map((item) => (item as { plain_text?: unknown }).plain_text).filter((item): item is string => typeof item === "string").join("").trim();
  return text || null;
}

function selectValue(value: Record<string, unknown> | undefined): string | null {
  const select = value?.select as { name?: unknown } | null | undefined;
  return typeof select?.name === "string" ? select.name : plainText(value);
}

function dateValue(value: Record<string, unknown> | undefined): string | null {
  const date = value?.date as { start?: unknown } | null | undefined;
  return typeof date?.start === "string" ? date.start : null;
}

function urlValue(value: Record<string, unknown> | undefined): string | null {
  return typeof value?.url === "string" ? value.url : null;
}

function textValue(value: Record<string, unknown> | undefined): string | null {
  return plainText(value) ?? selectValue(value) ?? urlValue(value);
}

function statusKey(value: string | null): StatusEdicao {
  const key = normalize(value ?? "");
  if (key.includes("public")) return "publicada";
  if (key.includes("aprov")) return "aprovada";
  if (key.includes("rejeit")) return "rejeitada";
  if (key.includes("arquiv")) return "arquivada";
  return "candidata";
}

function revisionKey(value: string | null): EditorialEdition["revisao"] {
  if (!value) return "indisponivel";
  const key = normalize(value);
  if (key.includes("pend")) return "pendente";
  if (key.includes("revis")) return "em_revisao";
  return "concluida";
}

type NotionPage = { id?: unknown; url?: unknown; last_edited_time?: unknown; properties?: unknown };
export type NotionEdition = Omit<EditorialEdition, "origem" | "reconciliacao" | "supabaseId"> & { origem: "Notion"; supabaseId: string | null };

function mapNotionPage(page: NotionPage): NotionEdition | null {
  if (!page.properties || typeof page.properties !== "object" || Array.isArray(page.properties)) return null;
  const properties = page.properties as Record<string, unknown>;
  const title = textValue(property(properties, ["Edição", "Edicao", "Título", "Titulo"]));
  const identificador = textValue(property(properties, ["Identificador", "ID"]));
  const canal = normalize(selectValue(property(properties, ["Canal"])) ?? "");
  if (!title || !identificador || (canal !== "panorama" && canal !== "tech")) return null;
  const statusOriginal = selectValue(property(properties, ["Status"]));
  const revisaoOriginal = selectValue(property(properties, ["Revisão", "Revisao"]));
  return {
    id: typeof page.id === "string" ? page.id : identificador,
    identificador, titulo: title, canal, resumo: textValue(property(properties, ["Resumo"])) ?? "Resumo não informado.",
    status: statusKey(statusOriginal), statusOriginal, revisao: revisionKey(revisaoOriginal), revisaoOriginal,
    slug: textValue(property(properties, ["Slug"])), supabaseId: textValue(property(properties, ["Supabase ID", "Supabase Id"])),
    origem: "Notion", criadaEm: dateValue(property(properties, ["Data da edição", "Data da edicao", "Data"])) ?? new Date(0).toISOString(),
    publicadaEm: dateValue(property(properties, ["Publicado em"])), notionUrl: typeof page.url === "string" ? page.url : null,
    ultimaAlteracao: typeof page.last_edited_time === "string" ? page.last_edited_time : null,
  };
}

export async function readNotionEditions() {
  const token = process.env.OBSERVATORIO_NOTION_TOKEN;
  const dataSourceId = process.env.OBSERVATORIO_NOTION_DATA_SOURCE_ID ?? DEFAULT_DATA_SOURCE_ID;
  if (!token) return { editions: [] as NotionEdition[], available: false, notice: "Integração Notion não configurada: provisione OBSERVATORIO_NOTION_TOKEN no ambiente server-only." };
  const editions: NotionEdition[] = [];
  let cursor: string | undefined;
  try {
    do {
      const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": NOTION_VERSION },
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }), cache: "no-store",
      });
      if (!response.ok) return { editions: [], available: false, notice: `Notion indisponível nesta sessão (HTTP ${response.status}).` };
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !Array.isArray((payload as { results?: unknown }).results)) return { editions: [], available: false, notice: "Resposta inválida da API do Notion." };
      for (const page of (payload as { results: NotionPage[] }).results) { const edition = mapNotionPage(page); if (edition) editions.push(edition); }
      cursor = typeof (payload as { next_cursor?: unknown }).next_cursor === "string" && (payload as { has_more?: unknown }).has_more ? (payload as { next_cursor: string }).next_cursor : undefined;
    } while (cursor);
    return { editions, available: true, notice: null };
  } catch {
    return { editions: [], available: false, notice: "Não foi possível consultar o Notion nesta sessão." };
  }
}

export async function readEditorialQueue(): Promise<EditorialQueue> {
  const client = hmlClient();
  if (!client) return { editions: [], notionAvailable: false, hmlAvailable: false, notice: "A configuração server-only do HML está indisponível para esta sessão." };
  const [{ data, error }, notion] = await Promise.all([
    client.from("observatorio_edicoes").select("id,identificador,canal,titulo,resumo,status,criada_em,publicada_em,notion_url").order("criada_em", { ascending: false }),
    readNotionEditions(),
  ]);
  if (error) return { editions: notion.editions.map((edition) => ({ ...edition, supabaseId: edition.supabaseId ?? "Não declarado", reconciliacao: "insufficient_information" })), notionAvailable: notion.available, hmlAvailable: false, notice: "Não foi possível ler as edições do HML nesta sessão." };

  const hml: EditorialEdition[] = (data ?? []).map((edition) => ({
    id: edition.id, identificador: edition.identificador, titulo: edition.titulo, canal: edition.canal as CanalObservatorio, resumo: edition.resumo,
    status: edition.status as StatusEdicao, statusOriginal: edition.status, revisao: "indisponivel", revisaoOriginal: null, slug: null, supabaseId: edition.id,
    origem: "Supabase HML", criadaEm: edition.criada_em, publicadaEm: edition.publicada_em, notionUrl: edition.notion_url, ultimaAlteracao: null, reconciliacao: "only_hml",
  }));
  const byId = new Map(hml.map((edition) => [edition.id, edition]));
  const notionRows: EditorialEdition[] = notion.editions.map((edition) => {
    const match = edition.supabaseId ? byId.get(edition.supabaseId) : undefined;
    const reconciliation: ReconciliationState = match ? (match.status === edition.status ? "confirmed_match" : "status_divergence") : edition.supabaseId ? "supabase_id_not_found" : "insufficient_information";
    return { ...edition, supabaseId: edition.supabaseId ?? "Não declarado", reconciliacao: reconciliation };
  });
  const notionIds = new Set(notionRows.map((edition) => edition.supabaseId));
  return { editions: [...notionRows, ...hml.filter((edition) => !notionIds.has(edition.id))], notionAvailable: notion.available, hmlAvailable: true, notice: notion.notice ?? "Notion conectado; reconciliação somente leitura." };
}
