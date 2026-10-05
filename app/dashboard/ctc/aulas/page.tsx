import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAulas, getDisciplinas, getProfessores } from "../actions";
import { AulasList, NovaAulaDialog } from "./client-components";

export const metadata = {
  title: "Aulas Programadas — Gestão CTC — Camini",
  description: "Programação e agendamento de aulas do Curso de Teologia Cristã.",
};

export default async function AulasPage(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const initialSearch = searchParams?.q || "";

  const [aulas, disciplinas, professores] = await Promise.all([
    getAulas(),
    getDisciplinas(),
    getProfessores(),
  ]);

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
            <span className="text-foreground font-medium">Aulas Programadas</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Aulas Programadas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Programação de horários, alocação de docentes e controle de sessões.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NovaAulaDialog disciplinas={disciplinas} professores={professores} />
        </div>
      </div>

      {/* Lista com Toolbar, Filtros e Tabela */}
      <AulasList
        aulas={aulas}
        disciplinas={disciplinas}
        professores={professores}
        initialSearch={initialSearch}
      />
    </div>
  );
}
