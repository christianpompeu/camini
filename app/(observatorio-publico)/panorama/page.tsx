import type { Metadata } from "next";
import { PublicProductPage } from "@/components/observatorio-public/public-product-page";
import { publicProducts } from "@/lib/observatorio/public-content";
import { readPublicEditions } from "@/lib/observatorio/public";

export const metadata: Metadata = { title: "Panorama | Camini Observatório", description: publicProducts.panorama.description };
export const revalidate = 300;

export default async function PanoramaPage() {
  const editions = await readPublicEditions("panorama");
  return <PublicProductPage product={publicProducts.panorama} editions={editions} />;
}
