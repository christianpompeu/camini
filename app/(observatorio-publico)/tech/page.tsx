import type { Metadata } from "next";
import { PublicProductPage } from "@/components/observatorio-public/public-product-page";
import { publicProducts } from "@/lib/observatorio/public-content";
import { readPublicEditions } from "@/lib/observatorio/public";

export const metadata: Metadata = { title: "Tech | Camini Observatório", description: publicProducts.tech.description };
export const revalidate = 300;

export default async function TechPage() {
  const editions = await readPublicEditions("tech");
  return <PublicProductPage product={publicProducts.tech} editions={editions} />;
}
