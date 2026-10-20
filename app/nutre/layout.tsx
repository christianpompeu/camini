import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./nutre.css";
import { NutreShell } from "@/components/nutre/nutre-shell";
import { NutreNavigationProvider } from "@/components/nutre/nutre-navigation-context";
import { NutreThemeProvider } from "@/components/nutre/nutre-theme-provider";
import { isNutreHost } from "@/lib/nutre/navigation";

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

export default async function NutreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ||
    headerList.get("host") ||
    "";
  const isNutreSubdomain = isNutreHost(host);

  return (
    <>
      <script
        id="nutre-theme-initializer"
        dangerouslySetInnerHTML={{
          __html: `try{const p=localStorage.getItem('nutre-theme')||'system';const d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.nutreTheme=d?'dark':'light'}catch(e){}`,
        }}
      />
      <NutreThemeProvider>
        <NutreNavigationProvider initialIsSubdomain={isNutreSubdomain}>
          <div className={`${plusJakartaSans.variable} font-sans`}>
            <NutreShell>{children}</NutreShell>
          </div>
        </NutreNavigationProvider>
      </NutreThemeProvider>
    </>
  );
}
