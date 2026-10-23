import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicEditionPage } from "@/components/observatorio/public-edition-page";
import { publicEditionMetadata } from "@/lib/observatorio/public-metadata";
import { loadPublicEdition, readPublicEditions } from "@/lib/observatorio/public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ identificador: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { identificador } = await params;
  const edition = await loadPublicEdition("tech", identificador);
  return publicEditionMetadata("tech", edition);
}

export default async function TechEditionRoute({ params }: Props) {
  const { identificador } = await params;
  const [edition, recentEditions] = await Promise.all([
    loadPublicEdition("tech", identificador),
    readPublicEditions("tech"),
  ]);
  if (!edition) notFound();
  return <PublicEditionPage channel="tech" edition={edition} recentEditions={recentEditions} />;
}
