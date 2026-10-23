import "server-only";

import { createHash } from "node:crypto";

import type { Json } from "@/lib/supabase/database.types";
import { readNotionEditions, type NotionEdition } from "./editorial.ts";

const NOTION_VERSION = "2026-03-11";
const MAX_BLOCKS_PER_EDITION = 10_000;
const KNOWN_BLOCK_TYPES = new Set([
  "audio", "bookmark", "breadcrumb", "bulleted_list_item", "callout",
  "child_database", "child_page", "code", "column", "column_list",
  "divider", "embed", "equation", "file", "heading_1", "heading_2",
  "heading_3", "image", "link_preview", "link_to_page", "numbered_list_item",
  "paragraph", "pdf", "quote", "synced_block", "table", "table_of_contents",
  "table_row", "template", "to_do", "toggle", "unsupported", "video",
]);

export interface NotionSnapshotBlock {
  id: string;
  type: string;
  data: Json;
  children: NotionSnapshotBlock[];
}

export interface EditorialSnapshot {
  schemaVersion: 1;
  source: {
    type: "notion";
    notionPageId: string;
    notionUrl: string | null;
    lastEditedTime: string | null;
  };
  edition: {
    identificador: string;
    canal: NotionEdition["canal"];
    titulo: string;
    resumo: string;
    criadaEm: string;
    publicadaEm: string | null;
    statusOriginal: string | null;
    revisaoOriginal: string | null;
    slug: string | null;
    declaredSupabaseId: string | null;
  };
  content: {
    complete: true;
    blocks: NotionSnapshotBlock[];
  };
  contentHash: string;
}

export type SnapshotReadResult =
  | { ok: true; edition: NotionEdition; snapshot: EditorialSnapshot; blockCount: number }
  | { ok: false; edition: NotionEdition; reason: string };

type NotionBlock = {
  id?: unknown;
  type?: unknown;
  has_children?: unknown;
  [key: string]: unknown;
};

function canonicalize(value: unknown): Json {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Snapshot contém número não finito.");
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return String(value);

  const source = value as Record<string, unknown>;
  const result: Record<string, Json | undefined> = {};
  for (const key of Object.keys(source).sort()) {
    if (key === "url" && typeof source.expiry_time === "string") continue;
    if (key === "expiry_time") continue;
    if (source[key] !== undefined) result[key] = canonicalize(source[key]);
  }
  return result;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function hashEditorialContent(value: unknown): string {
  return createHash("sha256").update(stableStringify(value), "utf8").digest("hex");
}

function requiredNotionToken(): string {
  const token = process.env.OBSERVATORIO_NOTION_TOKEN;
  if (!token) throw new Error("OBSERVATORIO_NOTION_TOKEN não configurado.");
  return token;
}

async function notionJson(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${requiredNotionToken()}`,
      "Notion-Version": NOTION_VERSION,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Notion respondeu HTTP ${response.status}.`);
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Notion retornou payload inválido.");
  }
  return payload as Record<string, unknown>;
}

async function readBlockChildren(blockId: string, counter: { value: number }): Promise<NotionSnapshotBlock[]> {
  const blocks: NotionSnapshotBlock[] = [];
  let cursor: string | undefined;
  do {
    const query = new URLSearchParams({ page_size: "100" });
    if (cursor) query.set("start_cursor", cursor);
    const payload = await notionJson(
      `https://api.notion.com/v1/blocks/${encodeURIComponent(blockId)}/children?${query}`
    );
    if (!Array.isArray(payload.results)) throw new Error("Lista de blocos do Notion inválida.");

    for (const candidate of payload.results as NotionBlock[]) {
      if (typeof candidate.id !== "string" || typeof candidate.type !== "string") {
        throw new Error("Bloco do Notion sem identidade ou tipo.");
      }
      if (!KNOWN_BLOCK_TYPES.has(candidate.type) || candidate.type === "unsupported") {
        throw new Error(`Tipo de bloco não suportado: ${candidate.type}.`);
      }
      counter.value += 1;
      if (counter.value > MAX_BLOCKS_PER_EDITION) {
        throw new Error(`Edição excede ${MAX_BLOCKS_PER_EDITION} blocos.`);
      }

      const rawData = candidate[candidate.type];
      const children = candidate.has_children === true
        ? await readBlockChildren(candidate.id, counter)
        : [];
      blocks.push({
        id: candidate.id,
        type: candidate.type,
        data: canonicalize(rawData ?? {}),
        children,
      });
    }

    cursor = payload.has_more === true && typeof payload.next_cursor === "string"
      ? payload.next_cursor
      : undefined;
    if (payload.has_more === true && !cursor) throw new Error("Paginação incompleta do Notion.");
  } while (cursor);
  return blocks;
}

export function buildEditorialSnapshot(
  edition: NotionEdition,
  blocks: NotionSnapshotBlock[]
): EditorialSnapshot {
  const source = {
    type: "notion" as const,
    notionPageId: edition.id,
    notionUrl: edition.notionUrl,
    lastEditedTime: edition.ultimaAlteracao,
  };
  const snapshotEdition = {
    identificador: edition.identificador,
    canal: edition.canal,
    titulo: edition.titulo,
    resumo: edition.resumo,
    criadaEm: edition.criadaEm,
    publicadaEm: edition.publicadaEm,
    statusOriginal: edition.statusOriginal,
    revisaoOriginal: edition.revisaoOriginal,
    slug: edition.slug,
    declaredSupabaseId: edition.supabaseId,
  };
  const content = { complete: true as const, blocks };
  const contentHash = hashEditorialContent({
    schemaVersion: 1,
    notionPageId: edition.id,
    edition: snapshotEdition,
    content,
  });
  return { schemaVersion: 1, source, edition: snapshotEdition, content, contentHash };
}

export async function readNotionEditorialSnapshots(): Promise<SnapshotReadResult[]> {
  const notion = await readNotionEditions();
  if (!notion.available) throw new Error(notion.notice ?? "Notion indisponível.");

  const results: SnapshotReadResult[] = [];
  for (const edition of notion.editions) {
    try {
      const counter = { value: 0 };
      const blocks = await readBlockChildren(edition.id, counter);
      results.push({ ok: true, edition, snapshot: buildEditorialSnapshot(edition, blocks), blockCount: counter.value });
    } catch (error) {
      results.push({
        ok: false,
        edition,
        reason: error instanceof Error ? error.message : "Falha desconhecida ao ler conteúdo.",
      });
    }
  }
  return results;
}
