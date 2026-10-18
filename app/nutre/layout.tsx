import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./nutre.css";
import { NutreShell } from "@/components/nutre/nutre-shell";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nutre — Gestão Nutricional Clínica | Camini",
  description:
    "Plataforma profissional de gestão nutricional clínica com prontuários, planos alimentares e acompanhamento de pacientes.",
};

export default function NutreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${plusJakartaSans.variable} font-sans`}>
      <NutreShell>{children}</NutreShell>
    </div>
  );
}
