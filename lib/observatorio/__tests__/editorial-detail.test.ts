import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { safeExternalHref } from "../editorial-snapshot-safety.ts";

test("renderização privada aceita somente links http/https", () => {
  assert.equal(safeExternalHref("https://example.com/source"), "https://example.com/source");
  assert.equal(safeExternalHref("http://example.com/source"), "http://example.com/source");
  assert.equal(safeExternalHref("javascript:alert(1)"), null);
  assert.equal(safeExternalHref("data:text/html,<script>alert(1)</script>"), null);
  assert.equal(safeExternalHref("not-a-url"), null);
});

test("rota privada preserva autorização de sessão e não oferece decisão persistente", () => {
  const server = readFileSync(new URL("../server.ts", import.meta.url), "utf8");
  const page = readFileSync(new URL("../../../app/dashboard/observatorio/edicoes/[identificador]/page.tsx", import.meta.url), "utf8");
  assert.match(server, /auth\.getUser\(\)/);
  assert.match(server, /allowed_routes/);
  assert.match(server, /\/dashboard\/observatorio/);
  const repository = readFileSync(new URL("../supabase-read-repository.ts", import.meta.url), "utf8");
  assert.match(repository, /OBSERVATORIO_HML_SUPABASE_URL/);
  assert.match(repository, /hrpathjcxyzzwxgkhwnt\.supabase\.co/);
  assert.doesNotMatch(page, /<button[^>]*>(Aprovar|Rejeitar|Publicar)/i);
  assert.match(page, /Decisão não habilitada/);
});

test("snapshot de detalhe mantém blocos aninhados no contrato", () => {
  const snapshot = {
    schemaVersion: 1,
    source: { type: "notion", notionPageId: "page", notionUrl: "https://notion.so/page", lastEditedTime: null },
    edition: { identificador: "id", canal: "tech", titulo: "Título", resumo: "Resumo", criadaEm: "2026-01-01", publicadaEm: null, statusOriginal: "Candidata", revisaoOriginal: "Pendente", slug: null, declaredSupabaseId: null },
    content: { complete: true, blocks: [{ id: "root", type: "toggle", data: {}, children: [{ id: "child", type: "paragraph", data: { rich_text: [{ plain_text: "Texto" }] }, children: [] }] }] },
    contentHash: "hash",
  };
  assert.equal(snapshot.content.blocks[0].children.length, 1);
  assert.equal(snapshot.content.blocks[0].children[0].data.rich_text[0].plain_text, "Texto");
});
