import { Metadata } from "next";
import { SqlStudioClient } from "@/components/sql-studio/sql-studio-client";

export const metadata: Metadata = {
  title: "SQL Studio RM | Camini",
  description:
    "Editor e Criador Inteligente de Consultas T-SQL para TOTVS RM com autocompletar de JOINs, catálogo semântico e inspeção de relacionamentos.",
};

export default function SqlStudioPage() {
  return <SqlStudioClient />;
}
