import React from "react";
import Link from "next/link";
import { ChevronRight, CalendarDays, BookOpen, Users, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAulas, getDisciplinas, getProfessores } from "@/app/dashboard/ctc/actions";
import { CalendarioPublicoList } from "./client-components";

export const metadata = {
  title: "Calendário de Aulas — Curso de Teologia Cristã (CTC) — Camini",
  description:
    "Consulte as datas, horários e professores responsáveis pelas aulas do Curso de Teologia Cristã.",
};

export default async function CalendarioPublicoPage() {
  const [aulas, disciplinas, professores] = await Promise.all([
    getAulas(),
    getDisciplinas(),
    getProfessores(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Barra de Navegação Pública OpenDocs */}
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Breadcrumb e Cabeçalho */}
        <div className="space-y-3 pb-6 border-b border-border">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-muted-foreground">CTC</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Calendário de Aulas</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-normal">
                  Público • Consulta Aberta
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Calendário Acadêmico CTC
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Cronograma completo de sessões presenciais e remotas do Curso de Teologia Cristã.
                Consulte as datas, disciplinas e professores responsáveis.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                render={
                  <Link href="/dashboard/ctc" />
                }
              >
                <span>Área Administrativa</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Cards Rápidos de Resumo */}
          <div className="grid grid-cols-3 gap-3 pt-3">
            <div className="rounded-lg border border-border bg-card p-3 shadow-xs flex items-center gap-3">
              <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground truncate">Total de Aulas</div>
                <div className="text-base font-bold text-foreground">{aulas.length}</div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 shadow-xs flex items-center gap-3">
              <div className="size-8 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground truncate">Disciplinas</div>
                <div className="text-base font-bold text-foreground">{disciplinas.length}</div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 shadow-xs flex items-center gap-3">
              <div className="size-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground truncate">Docentes</div>
                <div className="text-base font-bold text-foreground">{professores.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Listagem Interativa de Aulas */}
        <CalendarioPublicoList
          aulas={aulas}
          disciplinas={disciplinas}
        />
      </main>

      {/* Rodapé OpenDocs Padronizado */}
      <footer className="border-t border-border py-6 px-4 sm:px-6 bg-muted/20 text-xs text-muted-foreground mt-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Camini</span>
            <span>•</span>
            <span>Curso de Teologia Cristã (CTC)</span>
            <span>•</span>
            <span>Consulta Pública de Cronograma</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Painel
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Acesso Restrito
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
