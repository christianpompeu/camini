import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hashEditorialContent, type EditorialSnapshot, type NotionSnapshotBlock } from "../editorial-snapshot.ts";
import { collectSnapshotLinks, countSnapshotBlocks } from "../editorial-snapshot-render.ts";
import {
  isPublicEdition,
  isPublicEditionForChannel,
  isValidPublicEditionIdentifier,
  publicEditionSnapshot,
} from "../publication.ts";
import type { Edicao } from "../types.ts";

function snapshot(overrides: Partial<EditorialSnapshot> = {}): EditorialSnapshot {
  const value: EditorialSnapshot = {
    schemaVersion: 1,
    source: { type: "notion", notionPageId: "notion-1", notionUrl: null, lastEditedTime: null },
    edition: {
      identificador: "2026-10-23-panorama",
      canal: "panorama",
      titulo: "Edição de teste",
      resumo: "Resumo verificável.",
      criadaEm: "2026-10-22",
      publicadaEm: null,
      statusOriginal: "Publicada",
      revisaoOriginal: "Aprovada",
      slug: null,
      declaredSupabaseId: null,
    },
    content: {
      complete: true,
      blocks: [{ id: "root", type: "paragraph", data: { rich_text: [{ plain_text: "Conteúdo" }] }, children: [] }],
    },
    contentHash: "",
    ...overrides,
  };
  if (overrides.contentHash === undefined) {
    value.contentHash = hashEditorialContent({
      schemaVersion: value.schemaVersion,
      notionPageId: value.source.notionPageId,
      edition: value.edition,
      content: value.content,
    });
  }
  return value;
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
    criada_em: "2026-10-23T02:32:42Z",
    aprovada_em: "2026-10-23T03:00:00Z",
    publicada_em: "2026-10-23T04:00:00Z",
    ...overrides,
  };
}

test("aceita cenário positivo simulado com formato real do HML e timestamps desacoplados", () => {
  const validEdition = edition();
  assert.equal(isPublicEdition(validEdition), true);
  assert.equal(isPublicEditionForChannel(validEdition, "panorama"), true);
  const validSnapshot = publicEditionSnapshot(validEdition);
  assert.notEqual(validSnapshot, null);
  assert.equal(validSnapshot?.edition.criadaEm, "2026-10-22");
  assert.equal(validSnapshot?.edition.publicadaEm, null);
  assert.equal(validEdition.criada_em, "2026-10-23T02:32:42Z");
  assert.equal(validEdition.publicada_em, "2026-10-23T04:00:00Z");
  assert.notEqual(validEdition.aprovada_em, null);
  assert.equal(validEdition.status, "publicada");
});

test("rejeita cenários negativos de publicação e autorização operacional", () => {
  // Candidata com snapshot válido
  assert.equal(isPublicEdition(edition({ status: "candidata" })), false);
  assert.equal(isPublicEditionForChannel(edition({ status: "candidata" }), "panorama"), false);

  // Aprovada sem publicação
  assert.equal(isPublicEdition(edition({ status: "aprovada" })), false);
  assert.equal(isPublicEditionForChannel(edition({ status: "aprovada" }), "panorama"), false);

  // Rejeitada
  assert.equal(isPublicEdition(edition({ status: "rejeitada" })), false);

  // Publicada sem aprovada_em
  assert.equal(isPublicEdition(edition({ aprovada_em: null })), false);

  // Publicada sem publicada_em
  assert.equal(isPublicEdition(edition({ publicada_em: null })), false);

  // Sem snapshot
  assert.equal(isPublicEdition(edition({ snapshot: null })), false);
});

test("nega snapshot incompleto, adulterado ou com divergência de identidade/origem", () => {
  // Snapshot incompleto (complete = false)
  const incomplete = edition({
    snapshot: snapshot({ content: { complete: false as never, blocks: [{ id: "root", type: "paragraph", data: {}, children: [] }] } }) as never,
  });
  assert.equal(publicEditionSnapshot(incomplete), null);

  // Snapshot incompleto (blocos vazios)
  const empty = edition({
    snapshot: snapshot({ content: { complete: true, blocks: [] } }) as never,
  });
  assert.equal(publicEditionSnapshot(empty), null);

  // Canal divergente no snapshot
  const wrongChannel = edition({
    snapshot: snapshot({ edition: { ...snapshot().edition, canal: "tech" } }) as never,
  });
  assert.equal(publicEditionSnapshot(wrongChannel), null);

  // Identificador divergente no snapshot
  const wrongIdentifier = edition({
    snapshot: snapshot({ edition: { ...snapshot().edition, identificador: "outro-identificador" } }) as never,
  });
  assert.equal(publicEditionSnapshot(wrongIdentifier), null);

  // Página de origem divergente (notion_page_id diferente na edição)
  const wrongPageId = edition({ notion_page_id: "notion-outro" });
  assert.equal(publicEditionSnapshot(wrongPageId), null);

  // Página de origem divergente (notionPageId diferente no snapshot)
  const wrongSnapshotPageId = edition({
    snapshot: snapshot({ source: { type: "notion", notionPageId: "notion-outro", notionUrl: null, lastEditedTime: null } }) as never,
  });
  assert.equal(publicEditionSnapshot(wrongSnapshotPageId), null);

  // Hash adulterado
  const badHash = edition({
    snapshot: snapshot({ contentHash: "a".repeat(64) }) as never,
  });
  assert.equal(publicEditionSnapshot(badHash), null);

  // Conteúdo adulterado sem atualização do hash
  const valid = snapshot();
  const changed = edition({
    snapshot: {
      ...valid,
      content: {
        ...valid.content,
        blocks: [{ ...valid.content.blocks[0], data: { rich_text: [{ plain_text: "alterado" }] } }],
      },
    } as never,
  });
  assert.equal(publicEditionSnapshot(changed), null);
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
