import type { Metadata } from "next";
import { collectSnapshotLinks } from "./editorial-snapshot-render";
import { publicEditionSnapshot } from "./publication";
import type { CanalObservatorio, Edicao } from "./types";

const SITE_URL = "https://camini.dev.br";
const names = { panorama: "Panorama", tech: "Tech" } as const;

export function publicEditionMetadata(channel: CanalObservatorio, edition: Edicao | null): Metadata {
  if (!edition) {
    return {
      title: `Edição indisponível — Camini ${names[channel]}`,
      robots: { index: false, follow: false },
    };
  }
  const canonicalPath = `/${channel}/edicoes/${edition.identificador}`;
  const snapshot = publicEditionSnapshot(edition);
  const image = snapshot
    ? collectSnapshotLinks(snapshot.content.blocks.filter((block) => block.type === "image"))[0]
    : undefined;

  return {
    title: `${edition.titulo} — Camini ${names[channel]}`,
    description: edition.resumo,
    alternates: { canonical: `${SITE_URL}${canonicalPath}` },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url: `${SITE_URL}${canonicalPath}`,
      siteName: "Camini Observatório",
      title: edition.titulo,
      description: edition.resumo,
      publishedTime: edition.publicada_em ?? undefined,
      images: image ? [{ url: image }] : undefined,
    },
  };
}
