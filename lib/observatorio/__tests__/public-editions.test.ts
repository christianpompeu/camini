import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { EditorialSnapshot, NotionSnapshotBlock } from "../editorial-snapshot.ts";
import { collectSnapshotLinks, countSnapshotBlocks } from "../editorial-snapshot-render.ts";
import {
  isPublicEdition,
  isPublicEditionForChannel,
  isValidPublicEditionIdentifier,
  publicEditionSnapshot,
} from "../publication.ts";
import type { Edicao } from "../types.ts";

function snapshot(overrides: Partial<EditorialSnapshot> = {}): EditorialSnapshot {
  return {
    schemaVersion: 1,
    source: { type: "notion", notionPageId: "notion-1", notionUrl: null, lastEditedTime: null },
    edition: {
      identificador: "2026-10-23-panorama",
      canal: "panorama",
      titulo: "Edição de teste",
      resumo: "Resumo verificável.",
      criadaEm: "2026-10-23T10:00:00.000Z",
      publicadaEm: "2026-10-23T12:00:00.000Z",
      statusOriginal: "Publicada",
      revisaoOriginal: "Aprovada",
      slug: null,
      declaredSupabaseId: null,
    },
    content: {
      complete: true,
      blocks: [{ id: "root", type: "paragraph", data: { rich_text: [{ plain_text: "Conteúdo" }] }, children: [] }],
    },
    contentHash: "a".repeat(64),
    ...overrides,
  };
}

function edition(overrides: Partial<Edicao> = {}): Edicao {
  return {
    id: "edition-1",
    identificador: "2026-10-23-panorama",
    canal: "panorama",
    rodada_id: null,
    titulo: "Edição de teste",
    resumo: "Resumo verificável.",
    status: "publicada",
    notion_page_id: "notion-1",
    notion_url: null,
    snapshot: snapshot() as never,
    versao: 1,
    criada_em: "2026-10-23T10:00:00.000Z",
    aprovada_em: "2026-10-23T11:00:00.000Z",
    publicada_em: "2026-10-23T12:00:00.000Z",
    ...overrides,
  };
}

test("aceita somente edição integralmente publicada", () => {
  assert.equal(isPublicEdition(edition()), true);
  assert.equal(isPublicEdition(edition({ status: "candidata" })), false);
  assert.equal(isPublicEdition(edition({ status: "aprovada" })), false);
  assert.equal(isPublicEdition(edition({ status: "rejeitada" })), false);
  assert.equal(isPublicEdition(edition({ aprovada_em: null })), false);
  assert.equal(isPublicEdition(edition({ publicada_em: null })), false);
  assert.equal(isPublicEdition(edition({ snapshot: null })), false);
});

test("nega snapshot incompleto, divergente ou sem integridade", () => {
  const empty = edition({ snapshot: snapshot({ content: { complete: true, blocks: [] } }) as never });
  assert.equal(publicEditionSnapshot(empty), null);
  const wrongChannel = edition({ snapshot: snapshot({ edition: { ...snapshot().edition, canal: "tech" } }) as never });
  assert.equal(publicEditionSnapshot(wrongChannel), null);
  const badHash = edition({ snapshot: snapshot({ contentHash: "invalido" }) as never });
  assert.equal(publicEditionSnapshot(badHash), null);
});

test("nega canal divergente e identificadores manipulados", () => {
  assert.equal(isPublicEditionForChannel(edition(), "panorama"), true);
  assert.equal(isPublicEditionForChannel(edition(), "tech"), false);
  assert.equal(isValidPublicEditionIdentifier("2026-10-23-tech"), true);
  assert.equal(isValidPublicEditionIdentifier("../segredo"), false);
  assert.equal(isValidPublicEditionIdentifier("TECH?preview=1"), false);
  assert.equal(isValidPublicEditionIdentifier(""), false);
});

test("preserva blocos aninhados e descarta referências inseguras", () => {
  const blocks: NotionSnapshotBlock[] = [{
    id: "root",
    type: "child_page",
    data: { title: "Seção" },
    children: [{ id: "nested", type: "paragraph", data: { rich_text: [{ plain_text: "Fonte", href: "https://example.com/ref" }, { plain_text: "Ataque", href: "javascript:alert(1)" }] }, children: [] }],
  }];
  assert.equal(countSnapshotBlocks(blocks), 2);
  assert.deepEqual(collectSnapshotLinks(blocks), ["https://example.com/ref"]);
});

test("repositório público filtra elegibilidade no servidor e não cria API de snapshot", () => {
  const repository = readFileSync(new URL("../public.ts", import.meta.url), "utf8");
  assert.match(repository, /\.eq\("status", "publicada"\)/);
  assert.match(repository, /\.not\("aprovada_em", "is", null\)/);
  assert.match(repository, /\.not\("publicada_em", "is", null\)/);
  assert.match(repository, /\.eq\("canal", channel\)/);
  assert.match(repository, /\.eq\("identificador", identifier\)/);
  assert.match(repository, /hrpathjcxyzzwxgkhwnt\.supabase\.co/);
  assert.doesNotMatch(repository, /NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE_ROLE)/);
});

test("rotas são server components responsivas e metadata nega indexação indisponível", () => {
  const panorama = readFileSync(new URL("../../../app/panorama/edicoes/[identificador]/page.tsx", import.meta.url), "utf8");
  const tech = readFileSync(new URL("../../../app/tech/edicoes/[identificador]/page.tsx", import.meta.url), "utf8");
  const view = readFileSync(new URL("../../../components/observatorio/public-edition-page.tsx", import.meta.url), "utf8");
  const metadata = readFileSync(new URL("../public-metadata.ts", import.meta.url), "utf8");
  assert.doesNotMatch(panorama + tech + view, /["']use client["']/);
  assert.match(view, /lg:grid-cols/);
  assert.match(view, /min-w-0/);
  assert.match(metadata, /index: false/);
  assert.match(metadata, /alternates: \{ canonical:/);
});
