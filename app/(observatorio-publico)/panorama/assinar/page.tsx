import type { Metadata } from "next";
import { SignupPage } from "@/components/observatorio-public/signup-page";
import { publicProducts } from "@/lib/observatorio/public-content";

export const metadata: Metadata = { title: "Acompanhe o Panorama | Camini", description: publicProducts.panorama.subscribeDescription };
export default function PanoramaSignupPage() { return <SignupPage product={publicProducts.panorama} />; }
