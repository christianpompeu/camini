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
    criada_em: "2026-10-23T02:32:42Z",
    aprovada_em: "2026-10-23T03:00:00.000Z",
    publicada_em: "2026-10-23T04:00:00.000Z",
    snapshot: {
      schemaVersion: 1,
      source: { type: "notion", notionPageId: "page", notionUrl: null, lastEditedTime: null },
      edition: {
        identificador: "edicao-teste",
        canal: "panorama",
        titulo: "Edição de teste",
        resumo: "Resumo",
        criadaEm: "2026-10-22",
        publicadaEm: null,
        statusOriginal: "publicada",
        revisaoOriginal: null,
        slug: "edicao-teste",
        declaredSupabaseId: null,
      },
      content: { complete: true, blocks: [{ id: "one", type: "paragraph", data: {}, children: [] }] },
      contentHash: "",
    },
  });
  const storedSnapshot = published.snapshot as unknown as EditorialSnapshot;
  storedSnapshot.contentHash = hashEditorialContent({
    schemaVersion: 1,
    notionPageId: "page",
    edition: storedSnapshot.edition,
    content: storedSnapshot.content,
  });
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

test("ecosystem navigation integrates Panorama and Tech across Home, Navbar, Mobile Sidebar, and Headers", async () => {
  const [home, navbar, mobileSidebar, publicHeader, editionShell, middleware] = await Promise.all([
    read("app/page.tsx"),
    read("components/layout/navbar.tsx"),
    read("components/layout/mobile-sidebar.tsx"),
    read("components/observatorio-public/public-header.tsx"),
    read("components/observatorio/public-edition-shell.tsx"),
    read("lib/supabase/middleware.ts"),
  ]);

  // 1. Home page integrates Observatório with Panorama and Tech cards
  assert.match(home, /Camini Observatório/);
  assert.match(home, /href="\/panorama"/);
  assert.match(home, /href="\/tech"/);
  assert.match(home, /href="\/panorama#edicoes"/);
  assert.match(home, /href="\/tech#edicoes"/);

  // 2. Navbar provides grouped Observatório dropdown with Panorama and Tech
  assert.match(navbar, /DropdownMenu/);
  assert.match(navbar, /Observatório/);
  assert.match(navbar, /href="\/panorama"/);
  assert.match(navbar, /href="\/tech"/);

  // 3. Mobile sidebar includes dedicated Publicações section
  assert.match(mobileSidebar, /Publicações/);
  assert.match(mobileSidebar, /href:\s*"\/panorama"/);
  assert.match(mobileSidebar, /href:\s*"\/tech"/);
  assert.match(mobileSidebar, /isPanorama/);
  assert.match(mobileSidebar, /isTech/);

  // 4. Public headers provide channel editions anchor and subscription
  assert.match(publicHeader, /href=\{`\/\$\{channel\}#edicoes`\}/);
  assert.match(publicHeader, /href=\{`\/\$\{channel\}\/assinar`\}/);
  assert.match(editionShell, /href="\/panorama"/);
  assert.match(editionShell, /href="\/tech"/);
  assert.match(editionShell, /href=\{`\/\$\{channel\}#edicoes`\}/);
  assert.match(editionShell, /href=\{`\/\$\{channel\}\/assinar`\}/);

  // 5. Middleware whitelists /panorama and /tech as public prefixes
  assert.match(middleware, /"\/panorama"/);
  assert.match(middleware, /"\/tech"/);
});

