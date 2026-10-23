import type { Metadata } from "next";
import { SignupPage } from "@/components/observatorio-public/signup-page";
import { publicProducts } from "@/lib/observatorio/public-content";

export const metadata: Metadata = { title: "Acompanhe o Tech | Camini", description: publicProducts.tech.subscribeDescription };
export default function TechSignupPage() { return <SignupPage product={publicProducts.tech} />; }
