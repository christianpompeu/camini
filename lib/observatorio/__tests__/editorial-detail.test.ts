import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { safeExternalHref } from "../editorial-snapshot-safety.ts";
import { blockDisplayText, collectSnapshotLinks, countSnapshotBlocks, richTextSegments } from "../editorial-snapshot-render.ts";

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

test("rich_text preserva ordem, hyperlinks seguros e anotações", () => {
  const segments = richTextSegments([
    { plain_text: "Fonte ", href: null, annotations: { bold: false } },
    { plain_text: "principal", href: "https://example.com/a", annotations: { bold: true } },
    { plain_text: " insegura", href: "javascript:alert(1)", annotations: { italic: true } },
    { plain_text: " e link interno", link: { url: "https://example.com/b" }, annotations: { code: true } },
  ]);
  assert.deepEqual(segments.map(({ text, href, bold }) => ({ text, href, bold })), [
    { text: "Fonte ", href: null, bold: false },
    { text: "principal", href: "https://example.com/a", bold: true },
    { text: " insegura", href: null, bold: false },
    { text: " e link interno", href: "https://example.com/b", bold: false },
  ]);
  assert.equal(segments[3].code, true);
});

test("coleta referências de blocos e rich_text com deduplicação", () => {
  const blocks = [
    { id: "one", type: "paragraph", data: { rich_text: [{ plain_text: "A", href: "https://example.com/ref" }, { plain_text: "B", link: { url: "https://example.com/other" } }] }, children: [] },
    { id: "two", type: "bookmark", data: { url: "https://example.com/ref" }, children: [{ id: "three", type: "paragraph", data: { rich_text: [{ plain_text: "C", href: "javascript:bad" }] }, children: [] }] },
  ];
  assert.deepEqual(collectSnapshotLinks(blocks), ["https://example.com/ref", "https://example.com/other"]);
});

test("child_page usa title e preserva filhos aninhados", () => {
  const childPage = { id: "page", type: "child_page", data: { title: "Seção filha" }, children: [{ id: "nested", type: "paragraph", data: { rich_text: [{ plain_text: "Conteúdo" }] }, children: [] }] };
  assert.equal(blockDisplayText(childPage), "Seção filha");
  assert.equal(countSnapshotBlocks([childPage]), 2);
});
