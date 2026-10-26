import { Suspense } from "react";
import { Metadata } from "next";
import { DicionarioClient } from "@/components/dicionario-rm/dicionario-client";

export const metadata: Metadata = {
  title: "Dicionário de Dados TOTVS RM | Camini",
  description:
    "Catálogo e dicionário semântico com mais de 9.400 tabelas do TOTVS Corpore RM. Consulte colunas, tipos, chaves estrangeiras, compare tabelas lado a lado e gere scripts SQL.",
  openGraph: {
    title: "Dicionário de Dados TOTVS RM | Camini",
    description:
      "Consulte esquemas, campos, chaves primárias e relacionamentos de saída/entrada das tabelas do TOTVS RM com visualização lado a lado.",
    type: "website",
  },
};

export default function DicionarioRmPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Carregando Dicionário de Dados TOTVS RM...</span>
          </div>
        </div>
      }
    >
      <DicionarioClient />
    </Suspense>
  );
}
