import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { isPublicEdition, selectPublicEditions } from "../publication.ts";
import { hashEditorialContent } from "../editorial-snapshot.ts";
import type { EditorialSnapshot } from "../editorial-snapshot.ts";
import type { Edicao } from "../types.ts";

const root = process.cwd();
const read = (path: string) => readFile(join(root, path), "utf8");

function edition(overrides: Partial<Edicao> = {}): Edicao {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    identificador: "edicao-teste",
    canal: "panorama",
    rodada_id: null,
    titulo: "Edição de teste",
    resumo: "Resumo",
    status: "candidata",
    notion_page_id: null,
    notion_url: null,
    snapshot: null,
    versao: 1,
    criada_em: "2026-10-23T00:00:00.000Z",
    aprovada_em: null,
    publicada_em: null,
    ...overrides,
  };
}

test("publication policy excludes every incomplete editorial state", () => {
  assert.equal(isPublicEdition(edition()), false);
  assert.equal(isPublicEdition(edition({ status: "aprovada", aprovada_em: "2026-10-23T01:00:00.000Z" })), false);
  assert.equal(isPublicEdition(edition({ status: "publicada", aprovada_em: "2026-10-23T01:00:00.000Z", publicada_em: "2026-10-23T02:00:00.000Z" })), false);
});

test("only a complete published snapshot reaches the public list", () => {
  const published = edition({
    status: "publicada",
    aprovada_em: "2026-10-23T01:00:00.000Z",
    publicada_em: "2026-10-23T02:00:00.000Z",
    snapshot: {
      schemaVersion: 1,
      source: { type: "notion", notionPageId: "page", notionUrl: null, lastEditedTime: null },
      edition: { identificador: "edicao-teste", canal: "panorama", titulo: "Edição de teste", resumo: "Resumo", criadaEm: "2026-10-23T00:00:00.000Z", publicadaEm: "2026-10-23T02:00:00.000Z", statusOriginal: "publicada", revisaoOriginal: null, slug: "edicao-teste", declaredSupabaseId: null },
      content: { complete: true, blocks: [{ id: "one", type: "paragraph", data: {}, children: [] }] },
      contentHash: "",
    },
  });
  const storedSnapshot = published.snapshot as unknown as EditorialSnapshot;
  storedSnapshot.contentHash = hashEditorialContent({ schemaVersion: 1, notionPageId: "page", edition: storedSnapshot.edition, content: storedSnapshot.content });
  published.notion_page_id = "page";
  assert.deepEqual(selectPublicEditions([edition(), published]), [published]);
});

test("all public routes exist and use shared product components", async () => {
  const pages = await Promise.all([
    read("app/(observatorio-publico)/panorama/page.tsx"),
    read("app/(observatorio-publico)/panorama/assinar/page.tsx"),
    read("app/(observatorio-publico)/tech/page.tsx"),
    read("app/(observatorio-publico)/tech/assinar/page.tsx"),
  ]);
  assert.match(pages[0], /PublicProductPage/);
  assert.match(pages[1], /SignupPage/);
  assert.match(pages[2], /PublicProductPage/);
  assert.match(pages[3], /SignupPage/);
});

test("navigation uses internal safe URLs and form does not fake persistence", async () => {
  const [header, form] = await Promise.all([
    read("components/observatorio-public/public-header.tsx"),
    read("components/observatorio-public/newsletter-signup-form.tsx"),
  ]);
  assert.match(header, /href=\{`\/\$\{item\}`\}/);
  assert.doesNotMatch(header, /target=|javascript:/i);
  assert.match(form, /Nenhum dado foi armazenado/);
  assert.doesNotMatch(form, /supabase|fetch\(|success/i);
  assert.match(form, /name="consent"/);
});
