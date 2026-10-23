import { hashEditorialContent, type EditorialSnapshot } from "./editorial-snapshot.ts";
import type { CanalObservatorio, Edicao } from "./types.ts";

export const PUBLIC_EDITION_IDENTIFIER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidPublicEditionIdentifier(value: string): boolean {
  return value.length > 0 && value.length <= 160 && PUBLIC_EDITION_IDENTIFIER.test(value);
}

function hasValidBlockTree(value: unknown, counter = { count: 0 }): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const block = item as Record<string, unknown>;
    counter.count += 1;
    if (
      counter.count > 10_000 ||
      typeof block.id !== "string" ||
      block.id.length === 0 ||
      typeof block.type !== "string" ||
      block.type.length === 0 ||
      !block.data ||
      typeof block.data !== "object" ||
      Array.isArray(block.data) ||
      !Array.isArray(block.children)
    ) {
      return false;
    }
    if (block.children.length > 0 && !hasValidBlockTree(block.children, counter)) return false;
  }
  return true;
}

export function publicEditionSnapshot(
  edition: Edicao,
): EditorialSnapshot | null {
  const value = edition.snapshot;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const snapshot = value as unknown as Partial<EditorialSnapshot>;
  const snapshotEdition = snapshot.edition;
  const contentHash = snapshot.contentHash;
  const expectedHash = hashEditorialContent({
    schemaVersion: snapshot.schemaVersion,
    notionPageId: snapshot.source?.notionPageId,
    edition: snapshotEdition,
    content: snapshot.content,
  });
  if (
    snapshot.schemaVersion !== 1 ||
    snapshot.source?.type !== "notion" ||
    snapshot.content?.complete !== true ||
    !hasValidBlockTree(snapshot.content.blocks) ||
    !snapshotEdition ||
    snapshotEdition.identificador !== edition.identificador ||
    snapshotEdition.canal !== edition.canal ||
    snapshotEdition.titulo !== edition.titulo ||
    snapshotEdition.resumo !== edition.resumo ||
    snapshot.source?.notionPageId !== edition.notion_page_id ||
    snapshot.source?.notionUrl !== edition.notion_url ||
    typeof contentHash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(contentHash) ||
    contentHash.toLowerCase() !== expectedHash
  ) {
    return null;
  }

  return snapshot as EditorialSnapshot;
}

export function isPublicEdition(edition: Edicao): boolean {
  return edition.status === "publicada" &&
    edition.aprovada_em !== null &&
    edition.publicada_em !== null &&
    edition.snapshot !== null;
}

export function isPublicEditionForChannel(
  edition: Edicao,
  channel: CanalObservatorio,
): boolean {
  return edition.canal === channel &&
    isValidPublicEditionIdentifier(edition.identificador) &&
    isPublicEdition(edition) &&
    publicEditionSnapshot(edition) !== null;
}

export function selectPublicEditions(editions: readonly Edicao[]): Edicao[] {
  return editions.filter((edition) =>
    (edition.canal === "panorama" || edition.canal === "tech") &&
    isPublicEditionForChannel(edition, edition.canal)
  );
}
