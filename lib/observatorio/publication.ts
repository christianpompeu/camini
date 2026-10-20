import type { Edicao } from "./types.ts";

export function isPublicEdition(edition: Edicao): boolean {
  return edition.status === "publicada" &&
    edition.aprovada_em !== null &&
    edition.publicada_em !== null &&
    edition.snapshot !== null;
}

export function selectPublicEditions(editions: readonly Edicao[]): Edicao[] {
  return editions.filter(isPublicEdition);
}
