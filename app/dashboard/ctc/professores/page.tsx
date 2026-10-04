import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProfessores } from "../actions";
import { ProfessoresList, NovoProfessorDialog } from "./client-components";

export const metadata = {
  title: "Professores — Gestão CTC — Camini",
  description: "Gerenciamento do corpo docente do Curso de Teologia Cristã.",
};

export default async function ProfessoresPage() {
  const professores = await getProfessores();

  return (
    <div className="space-y-6">
      {/* Header com Breadcrumb e Ação Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Painel
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/dashboard/ctc" className="hover:text-foreground transition-colors">
              Gestão CTC
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Professores</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Professores
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cadastro e gerenciamento do corpo docente do CTC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NovoProfessorDialog />
        </div>
      </div>

      {/* Lista com Toolbar e Tabela */}
      <ProfessoresList professores={professores} />
    </div>
  );
}
