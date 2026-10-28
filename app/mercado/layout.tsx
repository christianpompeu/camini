import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Mercado & Carrinho de Compras | Camini",
  description:
    "Registro inteligente de compras de supermercado em tempo real, cálculo automático de totais, fotos de produtos e cupom fiscal. 100% offline-first com sincronização na nuvem.",
  openGraph: {
    title: "Mercado & Carrinho de Compras | Camini",
    description:
      "Controle seus gastos de supermercado em tempo real direto no carrinho. Totalmente offline-first.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function MercadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-full flex flex-col">{children}</div>;
}
