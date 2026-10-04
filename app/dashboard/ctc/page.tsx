import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CalendarDays, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCtcStats } from "./actions";

export default async function CTCPage() {
  const stats = await getCtcStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Gestão CTC</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestão CTC</h1>
              <p className="text-muted-foreground text-sm">Visão geral do Curso de Teologia Cristã</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Professores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.professores}</div>
            <p className="text-xs text-muted-foreground mt-1">Professores cadastrados</p>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/ctc/professores">Gerenciar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disciplinas}</div>
            <p className="text-xs text-muted-foreground mt-1">Disciplinas na grade</p>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/ctc/disciplinas">Gerenciar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Aulas Programadas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aulas}</div>
            <p className="text-xs text-muted-foreground mt-1">Aulas agendadas no sistema</p>
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/ctc/aulas">Gerenciar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
