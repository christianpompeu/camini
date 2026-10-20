import type { CanalObservatorio, CategoriaEvento } from "./types.ts";
import { normalizeTimestamp, slugify } from "./normalization.ts";

function fnv1a(value: string, seed = 0x811c9dc5): number {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function shortFingerprint(value: string): string {
  return fnv1a(value).toString(16).padStart(8, "0");
}

export function buildRunKey(
  canal: CanalObservatorio,
  iniciadoEm: string | Date,
  sufixo?: string
): string {
  const date = normalizeTimestamp(iniciadoEm, "rodada.iniciadoEm").slice(0, 10);
  const suffix = sufixo ? `-${slugify(sufixo)}` : "";
  return `observatorio-${canal}-${date}${suffix}`;
}

export function buildEventKey(input: {
  titulo: string;
  categoria: CategoriaEvento;
  dataEvento: string | null;
}): string {
  const title = slugify(input.titulo).slice(0, 72) || "evento";
  const date = input.dataEvento?.slice(0, 10) ?? "sem-data";
  const fingerprint = shortFingerprint(
    `${input.categoria}|${date}|${slugify(input.titulo)}`
  );
  return `${title}-${date}-${fingerprint}`;
}

export function stableUuid(namespace: string, key: string): string {
  const source = `${namespace}:${key}`;
  const hex = [
    fnv1a(source, 0x811c9dc5),
    fnv1a(source, 0x9e3779b1),
    fnv1a(source, 0x85ebca6b),
    fnv1a(source, 0xc2b2ae35),
  ]
    .map((part) => part.toString(16).padStart(8, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
