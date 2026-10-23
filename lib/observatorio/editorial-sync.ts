import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database.types";
import type { Edicao } from "./types.ts";
import {
  readNotionEditorialSnapshots,
  type EditorialSnapshot,
  type SnapshotReadResult,
} from "./editorial-snapshot.ts";

export type EditorialSyncAction = "insert" | "update" | "unchanged" | "conflict" | "ignored";

export interface EditorialSyncPlanItem {
  identificador: string;
  notionPageId: string;
  declaredSupabaseId: string | null;
  existingSupabaseId: string | null;
  action: EditorialSyncAction;
  reason: string;
  warnings: string[];
  changedFields: string[];
  currentVersion: number | null;
  plannedVersion: number | null;
  currentContentHash: string | null;
  contentHash: string | null;
  blockCount: number | null;
  snapshot: EditorialSnapshot | null;
}

export interface EditorialSyncPlan {
  mode: "dry-run";
  generatedAt: string;
  hmlProject: "hrpathjcxyzzwxgkhwnt";
  items: EditorialSyncPlanItem[];
  counts: Record<EditorialSyncAction, number>;
}

type HmlEdition = Edicao;

function requiredHmlClient() {
  const url = process.env.OBSERVATORIO_HML_SUPABASE_URL;
  const secret = process.env.OBSERVATORIO_HML_SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Configuração HML do Observatório ausente.");
  if (new URL(url).hostname !== "hrpathjcxyzzwxgkhwnt.supabase.co") {
    throw new Error("A sincronização aceita exclusivamente o projeto HML do Observatório.");
  }
  return createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function readHmlEditions(): Promise<HmlEdition[]> {
  const { data, error } = await requiredHmlClient()
    .from("observatorio_edicoes")
    .select("id,identificador,canal,rodada_id,titulo,resumo,status,notion_page_id,notion_url,snapshot,versao,criada_em,aprovada_em,publicada_em")
    .order("criada_em", { ascending: true });
  if (error) throw new Error(`Falha ao ler observatorio_edicoes no HML (${error.code}).`);
  return (data ?? []) as HmlEdition[];
}

function existingHash(edition: HmlEdition): string | null {
  if (!edition.snapshot || typeof edition.snapshot !== "object" || Array.isArray(edition.snapshot)) return null;
  return typeof edition.snapshot.contentHash === "string" ? edition.snapshot.contentHash : null;
}

function existingLastEditedTime(edition: HmlEdition): string | null {
  if (!edition.snapshot || typeof edition.snapshot !== "object" || Array.isArray(edition.snapshot)) return null;
  const source = edition.snapshot.source;
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  return typeof source.lastEditedTime === "string" ? source.lastEditedTime : null;
}

function isOlder(incoming: string | null, current: string | null): boolean {
  if (!incoming || !current) return false;
  const incomingTime = Date.parse(incoming);
  const currentTime = Date.parse(current);
  return Number.isFinite(incomingTime) && Number.isFinite(currentTime) && incomingTime < currentTime;
}

function changedFields(snapshot: EditorialSnapshot, existing: HmlEdition): string[] {
  const changed: string[] = [];
  if (existing.titulo !== snapshot.edition.titulo) changed.push("titulo");
  if (existing.resumo !== snapshot.edition.resumo) changed.push("resumo");
  if (existing.canal !== snapshot.edition.canal) changed.push("canal");
  if (existing.notion_page_id !== snapshot.source.notionPageId) changed.push("notion_page_id");
  if (existing.notion_url !== snapshot.source.notionUrl) changed.push("notion_url");
  if (existingHash(existing) !== snapshot.contentHash) changed.push("snapshot");
  return changed;
}

function conflictItem(
  result: Extract<SnapshotReadResult, { ok: true }>,
  reason: string,
  existing: HmlEdition | null,
  warnings: string[] = []
): EditorialSyncPlanItem {
  return {
    identificador: result.edition.identificador,
    notionPageId: result.edition.id,
    declaredSupabaseId: result.edition.supabaseId,
    existingSupabaseId: existing?.id ?? null,
    action: "conflict",
    reason,
    warnings,
    changedFields: existing ? changedFields(result.snapshot, existing) : [],
    currentVersion: existing?.versao ?? null,
    plannedVersion: null,
    currentContentHash: existing ? existingHash(existing) : null,
    contentHash: result.snapshot.contentHash,
    blockCount: result.blockCount,
    snapshot: result.snapshot,
  };
}

export function planEditorialSync(
  snapshots: SnapshotReadResult[],
  hmlEditions: HmlEdition[],
  generatedAt = new Date().toISOString()
): EditorialSyncPlan {
  const byId = new Map(hmlEditions.map((edition) => [edition.id, edition]));
  const byIdentifier = new Map(hmlEditions.map((edition) => [edition.identificador, edition]));
  const byNotionPage = new Map(
    hmlEditions.filter((edition) => edition.notion_page_id).map((edition) => [edition.notion_page_id!, edition])
  );
  const seenIdentifiers = new Set<string>();
  const seenPages = new Set<string>();
  const items: EditorialSyncPlanItem[] = [];

  for (const result of snapshots) {
    if (!result.ok) {
      items.push({
        identificador: result.edition.identificador,
        notionPageId: result.edition.id,
        declaredSupabaseId: result.edition.supabaseId,
        existingSupabaseId: null,
        action: "ignored",
        reason: `snapshot_incomplete: ${result.reason}`,
        warnings: [], changedFields: [], currentVersion: null, plannedVersion: null,
        currentContentHash: null,
        contentHash: null, blockCount: null, snapshot: null,
      });
      continue;
    }

    if (seenIdentifiers.has(result.edition.identificador) || seenPages.has(result.edition.id)) {
      items.push(conflictItem(result, "duplicate_source_identity", null));
      continue;
    }
    seenIdentifiers.add(result.edition.identificador);
    seenPages.add(result.edition.id);

    const byPage = byNotionPage.get(result.edition.id);
    const byKey = byIdentifier.get(result.edition.identificador);
    const byDeclared = result.edition.supabaseId ? byId.get(result.edition.supabaseId) : undefined;
    const matches = [...new Set([byPage, byKey, byDeclared].filter(Boolean))] as HmlEdition[];
    if (matches.length > 1) {
      items.push(conflictItem(result, "identity_collision", null));
      continue;
    }
    const existing = matches[0] ?? null;
    const warnings = result.edition.supabaseId && !byDeclared
      ? ["declared_supabase_id_not_found"]
      : [];

    if (existing && (
      existing.identificador !== result.edition.identificador ||
      (existing.notion_page_id !== null && existing.notion_page_id !== result.edition.id) ||
      (byDeclared !== undefined && byDeclared.id !== existing.id)
    )) {
      items.push(conflictItem(result, "identity_mismatch", existing, warnings));
      continue;
    }

    if (result.edition.statusOriginal?.toLowerCase().includes("aprov")) {
      items.push(conflictItem(result, "notion_approved_requires_human_review", existing, warnings));
      continue;
    }

    if (!existing) {
      items.push({
        identificador: result.edition.identificador,
        notionPageId: result.edition.id,
        declaredSupabaseId: result.edition.supabaseId,
        existingSupabaseId: null,
        action: "insert",
        reason: "new_notion_edition",
        warnings,
        changedFields: ["titulo", "resumo", "canal", "notion_page_id", "notion_url", "snapshot"],
        currentVersion: null,
        plannedVersion: 1,
        currentContentHash: null,
        contentHash: result.snapshot.contentHash,
        blockCount: result.blockCount,
        snapshot: result.snapshot,
      });
      continue;
    }

    if (existing.status !== "candidata" || existing.aprovada_em || existing.publicada_em) {
      items.push(conflictItem(result, "protected_hml_editorial_state", existing, warnings));
      continue;
    }
    if (isOlder(result.snapshot.source.lastEditedTime, existingLastEditedTime(existing))) {
      items.push(conflictItem(result, "stale_notion_version", existing, warnings));
      continue;
    }
    const fields = changedFields(result.snapshot, existing);
    if (existingHash(existing) === result.snapshot.contentHash && fields.length === 0) {
      items.push({
        identificador: result.edition.identificador,
        notionPageId: result.edition.id,
        declaredSupabaseId: result.edition.supabaseId,
        existingSupabaseId: existing.id,
        action: "unchanged",
        reason: "content_hash_match",
        warnings, changedFields: [], currentVersion: existing.versao,
        plannedVersion: existing.versao, contentHash: result.snapshot.contentHash,
        currentContentHash: existingHash(existing),
        blockCount: result.blockCount, snapshot: result.snapshot,
      });
      continue;
    }
    items.push({
      identificador: result.edition.identificador,
      notionPageId: result.edition.id,
      declaredSupabaseId: result.edition.supabaseId,
      existingSupabaseId: existing.id,
      action: "update",
      reason: "material_content_change",
      warnings,
      changedFields: fields,
      currentVersion: existing.versao,
      plannedVersion: existing.versao + 1,
      currentContentHash: existingHash(existing),
      contentHash: result.snapshot.contentHash,
      blockCount: result.blockCount,
      snapshot: result.snapshot,
    });
  }

  const counts = { insert: 0, update: 0, unchanged: 0, conflict: 0, ignored: 0 };
  for (const item of items) counts[item.action] += 1;
  return { mode: "dry-run", generatedAt, hmlProject: "hrpathjcxyzzwxgkhwnt", items, counts };
}

export async function dryRunEditorialSync(): Promise<EditorialSyncPlan> {
  const [snapshots, hml] = await Promise.all([
    readNotionEditorialSnapshots(),
    readHmlEditions(),
  ]);
  return planEditorialSync(snapshots, hml);
}

export function toApplyPayload(item: EditorialSyncPlanItem): Json {
  if ((item.action !== "insert" && item.action !== "update") || !item.snapshot) {
    throw new Error("Somente planos de insert/update completos podem ser aplicados.");
  }
  return {
    operation: item.action,
    existing_id: item.existingSupabaseId,
    expected_version: item.currentVersion,
    expected_previous_hash: item.currentContentHash,
    snapshot: item.snapshot as unknown as Json,
  };
}

export async function applySingleEditorialPlan(
  plan: EditorialSyncPlan,
  identifier: string,
  runKey: string
): Promise<Json> {
  const item = plan.items.find((candidate) => candidate.identificador === identifier);
  if (!item) throw new Error("Edição selecionada não existe no dry-run.");
  const client = requiredHmlClient();
  const { data, error } = await client.rpc("observatorio_sync_edicoes", {
    p_run_key: runKey,
    p_edicoes: [toApplyPayload(item)],
  });
  if (error) throw new Error(`Apply HML recusado (${error.code}).`);
  return data;
}
