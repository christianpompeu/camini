import React from "react";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  CalendarDays, 
  Calendar,
  ArrowRight, 
  Plus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCtcStats } from "./actions";

export const metadata = {
  title: "Gestão CTC — Camini",
  description: "Visão geral e administração do módulo acadêmico CTC.",
};

export default async function CTCPage() {
  const stats = await getCtcStats();

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestão CTC
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Administração do Curso de Teologia Cristã: professores, grade curricular e calendário de aulas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ctc/calendario">
            <Button variant="outline" className="h-9 gap-1.5 shadow-xs">
              <Calendar className="h-4 w-4" />
              Calendário Público
            </Button>
          </Link>
          <Link href="/dashboard/ctc/aulas">
            <Button className="h-9 gap-1.5 shadow-xs">
              <Plus className="h-4 w-4" />
              Agendar Aula
            </Button>
          </Link>
        </div>
      </div>

      {/* Cartões dos 3 Pilares do CTC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Professores */}
        <Card className="flex flex-col justify-between shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Professores</CardTitle>
              <div className="p-2 rounded-md bg-muted text-foreground">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <CardDescription className="text-xs">
              Corpo docente responsável pelas disciplinas do curso.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="mb-4">
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {stats.professores}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.professores === 1 ? "Professor registrado" : "Professores registrados"}
              </p>
            </div>
            <Link href="/dashboard/ctc/professores" className="block">
              <Button variant="outline" className="w-full justify-between h-9 text-xs">
                <span>Gerenciar Professores</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Disciplinas */}
        <Card className="flex flex-col justify-between shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Disciplinas</CardTitle>
              <div className="p-2 rounded-md bg-muted text-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <CardDescription className="text-xs">
              Matérias e ementas que compõem a grade teológica.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="mb-4">
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {stats.disciplinas}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.disciplinas === 1 ? "Disciplina na grade" : "Disciplinas na grade"}
              </p>
            </div>
            <Link href="/dashboard/ctc/disciplinas" className="block">
              <Button variant="outline" className="w-full justify-between h-9 text-xs">
                <span>Gerenciar Grade</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Aulas */}
        <Card className="flex flex-col justify-between shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Aulas Programadas</CardTitle>
              <div className="p-2 rounded-md bg-muted text-foreground">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <CardDescription className="text-xs">
              Sessões agendadas com professores alocados.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="mb-4">
              <div className="text-3xl font-bold tracking-tight text-foreground">
                {stats.aulas}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.aulas === 1 ? "Aula agendada" : "Aulas agendadas"}
              </p>
            </div>
            <Link href="/dashboard/ctc/aulas" className="block">
              <Button variant="outline" className="w-full justify-between h-9 text-xs">
                <span>Gerenciar Aulas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Orientações e Integração */}
      <Card className="shadow-xs bg-muted/20 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Fluxo Operacional CTC</CardTitle>
          <CardDescription className="text-xs">
            Como os registros deste módulo se integram à aplicação
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
            <span className="font-semibold text-foreground block">1. Cadastro de Docentes</span>
            <p>Registre os professores com informações de contato para permitir a vinculação nas aulas.</p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
            <span className="font-semibold text-foreground block">2. Estrutura Curricular</span>
            <p>Cadastre disciplinas e cargas horárias para compor a ementa pedagógica do curso.</p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1">
            <span className="font-semibold text-foreground block">3. Agenda & Publicação</span>
            <p>Programe horários e durações. As aulas agendadas alimentam automaticamente o calendário público.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
