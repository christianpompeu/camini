import React from "react";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  CalendarDays, 
  ArrowRight, 
  GraduationCap, 
  Database, 
  Dumbbell, 
  Calendar,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCtcStats, getAulas } from "./ctc/actions";

export const metadata = {
  title: "Visão Geral — Camini",
  description: "Painel de controle e monitoramento das operações acadêmicas e aplicações integradas.",
};

export default async function DashboardPage() {
  const [stats, aulas] = await Promise.all([
    getCtcStats(),
    getAulas(),
  ]);

  // Próximas aulas ordenadas por data/hora
  const proximasAulas = aulas.slice(0, 5);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho Operacional Studio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Visão geral
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitoramento das operações acadêmicas e acesso rápido aos módulos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/ctc">
            <Button className="h-9 gap-1.5 shadow-xs">
              <GraduationCap className="h-4 w-4" />
              Gestão CTC
            </Button>
          </Link>
        </div>
      </div>

      {/* Grade de 3 Indicadores Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Professores */}
        <Link href="/dashboard/ctc/professores" className="group">
          <Card className="hover:border-primary/50 transition-colors shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Professores Cadastrados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.professores}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Corpo docente ativo no CTC
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Disciplinas */}
        <Link href="/dashboard/ctc/disciplinas" className="group">
          <Card className="hover:border-primary/50 transition-colors shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Disciplinas na Grade
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.disciplinas}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Estrutura curricular cadastrada
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Aulas Programadas */}
        <Link href="/dashboard/ctc/aulas" className="group">
          <Card className="hover:border-primary/50 transition-colors shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aulas Programadas
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {stats.aulas}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sessões de aula agendadas
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Composição Principal: Próximas Aulas (2/3) + Atalhos e Aplicações (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área Principal: Próximas Aulas Reais */}
        <div className="lg:col-span-2">
          <Card className="shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Próximas Aulas Agendadas
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Horários e docentes designados no sistema
                  </CardDescription>
                </div>
                <Link href="/dashboard/ctc/aulas">
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                    Ver todas
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1">
              {proximasAulas.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Nenhuma aula programada
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Não há sessões de aula agendadas no momento. Acesse a gestão de aulas para definir o cronograma.
                  </p>
                  <Link href="/dashboard/ctc/aulas" className="mt-4">
                    <Button size="sm">Agendar Primeira Aula</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {proximasAulas.map((aula) => (
                    <div
                      key={aula.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">
                            {aula.disciplina?.nome || "Disciplina não especificada"}
                          </span>
                          <Badge variant="outline" className="text-[11px] h-5 py-0 px-2 font-normal">
                            {aula.duracao_minutos} min
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {aula.professor?.nome || "Professor a definir"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground shrink-0 bg-muted/50 px-2.5 py-1.5 rounded-md border border-border/50">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(aula.data_hora)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex justify-between items-center rounded-b-xl">
              <span>Exibindo as 5 próximas aulas agendadas</span>
              <Link
                href="/dashboard/ctc/aulas"
                className="hover:text-foreground font-medium transition-colors"
              >
                Gerenciar cronograma &rarr;
              </Link>
            </div>
          </Card>
        </div>

        {/* Área Complementar: Aplicações e Atalhos */}
        <div className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold">
                Módulos do Sistema
              </CardTitle>
              <CardDescription className="text-xs">
                Acesso direto aos recursos ativos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {/* Gestão CTC */}
              <Link
                href="/dashboard/ctc"
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">Gestão CTC</h4>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    Controle de professores, disciplinas e cronograma
                  </p>
                </div>
              </Link>

              {/* RM SQL AI */}
              <Link
                href="/totvs-rm"
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Database className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">RM SQL AI</h4>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    Assistente inteligente para consultas e queries
                  </p>
                </div>
              </Link>

              {/* App FORÇA */}
              <Link
                href="/forca"
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">App FORÇA</h4>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    Acompanhamento e registro de treinos
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Card Calendário Público */}
          <Card className="shadow-xs bg-muted/30 border-dashed">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Calendário Público CTC
                </span>
                <p className="text-xs text-muted-foreground">
                  Visualização da grade aberta aos alunos
                </p>
              </div>
              <Link href="/ctc/calendario">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Acessar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
