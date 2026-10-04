import React from "react";
import Link from "next/link";
import { ArrowRight, Users, BookPlus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCtcStats } from "./ctc/actions";

export default async function DashboardHomePage() {
  const stats = await getCtcStats();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Central de Operações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os módulos do sistema e acesse rapidamente as informações importantes.
          </p>
        </div>
        <Link href="/dashboard/ctc">
          <Button className="shadow-sm">
            Acessar Gestão CTC <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Módulos & Resumo */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Resumo do Módulo CTC
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Professores */}
          <Link href="/dashboard/ctc/professores" className="group">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Professores</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.professores}</div>
                <p className="text-xs text-muted-foreground mt-1">Corpo docente cadastrado.</p>
              </CardContent>
            </Card>
          </Link>

          {/* Disciplinas */}
          <Link href="/dashboard/ctc/disciplinas" className="group">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
                <BookPlus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.disciplinas}</div>
                <p className="text-xs text-muted-foreground mt-1">Grade curricular estruturada.</p>
              </CardContent>
            </Card>
          </Link>

          {/* Aulas */}
          <Link href="/dashboard/ctc/aulas" className="group">
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Aulas</CardTitle>
                <CalendarDays className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.aulas}</div>
                <p className="text-xs text-muted-foreground mt-1">Aulas programadas.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
