import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { Json } from "@/lib/supabase/database.types";
import type { NotionEdition } from "../editorial.ts";
import {
  buildEditorialSnapshot,
  hashEditorialContent,
  type SnapshotReadResult,
} from "../editorial-snapshot.ts";
import { planEditorialSync } from "../editorial-sync.ts";
import type { Edicao } from "../types.ts";

function notionEdition(overrides: Partial<NotionEdition> = {}): NotionEdition {
  return {
    id: "notion-page-1",
    identificador: "2026-10-22-tech-test",
    titulo: "Edição de teste",
    canal: "tech",
    resumo: "Resumo completo",
    status: "candidata",
    statusOriginal: "Candidata",
    revisao: "pendente",
    revisaoOriginal: "Pendente",
    slug: "edicao-de-teste",
    supabaseId: "11111111-1111-4111-8111-111111111111",
    origem: "Notion",
    criadaEm: "2026-10-22T10:00:00.000Z",
    publicadaEm: null,
    notionUrl: "https://notion.so/notion-page-1",
    ultimaAlteracao: "2026-10-22T11:00:00.000Z",
    ...overrides,
  };
}

function snapshotResult(overrides: Partial<NotionEdition> = {}): Extract<SnapshotReadResult, { ok: true }> {
  const edition = notionEdition(overrides);
  const snapshot = buildEditorialSnapshot(edition, [{
    id: "block-1",
    type: "paragraph",
    data: { rich_text: [{ plain_text: "Conteúdo integral" }] },
    children: [],
  }]);
  return { ok: true, edition, snapshot, blockCount: 1 };
}

function hmlEdition(
  result: Extract<SnapshotReadResult, { ok: true }>,
  overrides: Partial<Edicao> = {}
): Edicao {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    identificador: result.edition.identificador,
    canal: result.edition.canal,
    rodada_id: null,
    titulo: result.edition.titulo,
    resumo: result.edition.resumo,
    status: "candidata",
    notion_page_id: result.edition.id,
    notion_url: result.edition.notionUrl,
    snapshot: result.snapshot as unknown as Json,
    versao: 1,
    criada_em: "2026-10-22T12:00:00.000Z",
    aprovada_em: null,
    publicada_em: null,
    ...overrides,
  };
}

test("hash canônico independe da ordem das chaves", () => {
  assert.equal(
    hashEditorialContent({ a: 1, nested: { z: 2, b: 3 } }),
    hashEditorialContent({ nested: { b: 3, z: 2 }, a: 1 })
  );
});

test("planeja insert sem adotar UUID declarado inexistente", () => {
  const result = snapshotResult();
  const plan = planEditorialSync([result], [], "2026-10-22T12:00:00.000Z");
  assert.equal(plan.items[0].action, "insert");
  assert.equal(plan.items[0].existingSupabaseId, null);
  assert.deepEqual(plan.items[0].warnings, ["declared_supabase_id_not_found"]);
  assert.equal(plan.items[0].plannedVersion, 1);
});

test("bloqueia status aprovado do Notion para revisão humana", () => {
  const result = snapshotResult({ status: "aprovada", statusOriginal: "Aprovada", revisao: "concluida" });
  const plan = planEditorialSync([result], []);
  assert.equal(plan.items[0].action, "conflict");
  assert.equal(plan.items[0].reason, "notion_approved_requires_human_review");
});

test("replay idempotente mantém versão e não planeja auditoria", () => {
  const result = snapshotResult();
  const existing = hmlEdition(result, { id: result.edition.supabaseId! });
  const plan = planEditorialSync([result], [existing]);
  assert.equal(plan.items[0].action, "unchanged");
  assert.equal(plan.items[0].plannedVersion, 1);
  assert.deepEqual(plan.items[0].changedFields, []);
});

test("mudança material incrementa exatamente uma versão", () => {
  const result = snapshotResult();
  const previous = structuredClone(result.snapshot) as typeof result.snapshot;
  previous.contentHash = "0".repeat(64);
  const existing = hmlEdition(result, {
    id: result.edition.supabaseId!,
    snapshot: previous as unknown as Json,
    versao: 4,
  });
  const plan = planEditorialSync([result], [existing]);
  assert.equal(plan.items[0].action, "update");
  assert.equal(plan.items[0].plannedVersion, 5);
  assert.deepEqual(plan.items[0].changedFields, ["snapshot"]);
});

test("bloqueia colisão entre identificador, page ID e UUID", () => {
  const result = snapshotResult();
  const byIdentifier = hmlEdition(result, {
    id: "22222222-2222-4222-8222-222222222222",
    notion_page_id: "other-page",
  });
  const byPage = hmlEdition(result, {
    id: "33333333-3333-4333-8333-333333333333",
    identificador: "other-identifier",
  });
  const plan = planEditorialSync([result], [byIdentifier, byPage]);
  assert.equal(plan.items[0].action, "conflict");
  assert.equal(plan.items[0].reason, "identity_collision");
});

test("ignora snapshot incompleto e protege estados editoriais HML", () => {
  const complete = snapshotResult();
  const incomplete: SnapshotReadResult = {
    ok: false,
    edition: notionEdition({ id: "page-incomplete", identificador: "incomplete" }),
    reason: "Tipo de bloco não suportado: unsupported.",
  };
  const existing = hmlEdition(complete, {
    id: complete.edition.supabaseId!,
    status: "publicada",
    aprovada_em: "2026-10-22T12:00:00.000Z",
    publicada_em: "2026-10-22T13:00:00.000Z",
  });
  const plan = planEditorialSync([incomplete, complete], [existing]);
  assert.equal(plan.items[0].action, "ignored");
  assert.equal(plan.items[1].action, "conflict");
  assert.equal(plan.items[1].reason, "protected_hml_editorial_state");
});

test("bloqueia snapshot do Notion mais antigo", () => {
  const result = snapshotResult({ ultimaAlteracao: "2026-10-21T10:00:00.000Z" });
  const existing = hmlEdition(result, { id: result.edition.supabaseId! });
  const stored = structuredClone(result.snapshot) as typeof result.snapshot;
  stored.source.lastEditedTime = "2026-10-22T10:00:00.000Z";
  stored.contentHash = "0".repeat(64);
  existing.snapshot = stored as unknown as Json;
  const plan = planEditorialSync([result], [existing]);
  assert.equal(plan.items[0].action, "conflict");
  assert.equal(plan.items[0].reason, "stale_notion_version");
});

test("migration proposta exige lote unitário, lock, precondições e auditoria", () => {
  const migration = readFileSync(
    new URL("../../../supabase/migrations/20261023012749_observatorio_c3_sync_editorial.sql", import.meta.url),
    "utf8"
  );
  assert.match(migration, /jsonb_array_length\(p_edicoes\) <> 1/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /for update/);
  assert.match(migration, /edicao alterada desde o dry-run/);
  assert.match(migration, /observatorio_edicoes_decisao_audit/);
  assert.match(migration, /status,\s+notion_page_id[\s\S]+?'candidata'/);
  assert.doesNotMatch(migration, /security definer/i);
});
