import React from "react";
import { Card } from "@/components/ui/card";
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
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">
            <Link href="/dashboard" className="hover:text-energy-blue transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Gestão CTC</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-camini text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Gestão CTC</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Visão geral do Curso de Teologia Cristã</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 flex flex-col justify-between bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Professores</h3>
            <div className="w-8 h-8 rounded-lg bg-gradient-camini text-white flex items-center justify-center shadow-xs">
              <Users className="h-4 w-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.professores}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Professores cadastrados</p>
            <div className="mt-4">
              <Link href="/dashboard/ctc/professores">
                <Button variant="camini" className="w-full">Gerenciar</Button>
              </Link>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 flex flex-col justify-between bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Disciplinas</h3>
            <div className="w-8 h-8 rounded-lg bg-gradient-camini text-white flex items-center justify-center shadow-xs">
              <BookOpen className="h-4 w-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.disciplinas}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Disciplinas na grade</p>
            <div className="mt-4">
              <Link href="/dashboard/ctc/disciplinas">
                <Button variant="camini" className="w-full">Gerenciar</Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Aulas Programadas</h3>
            <div className="w-8 h-8 rounded-lg bg-gradient-camini text-white flex items-center justify-center shadow-xs">
              <CalendarDays className="h-4 w-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.aulas}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aulas agendadas no sistema</p>
            <div className="mt-4">
              <Link href="/dashboard/ctc/aulas">
                <Button variant="camini" className="w-full">Gerenciar</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
