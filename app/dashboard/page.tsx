import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, BookPlus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCtcStats } from "./ctc/actions";

export default async function DashboardHomePage() {
  const stats = await getCtcStats();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Compacto */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
        <div>
          <div className="inline-block px-2.5 py-1 bg-camini-cyan/10 rounded-md text-[10px] font-bold tracking-wider mb-3 text-camini-cobalt dark:text-camini-cyan border border-camini-cyan/20 uppercase">
            Portal Administrativo
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Central de Operações
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mt-1">
            Gerencie os módulos do sistema e acesse rapidamente as informações importantes.
          </p>
        </div>
        <Link href="/dashboard/ctc">
          <Button variant="camini" className="shadow-md">
            Acessar Gestão CTC <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Módulos & Resumo */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Resumo do Módulo CTC
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Professores */}
          <Link href="/dashboard/ctc/professores" className="group">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:border-camini-cyan/50 hover:shadow-md transition-all flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-camini-cobalt dark:group-hover:text-camini-cyan transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.professores}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Professores</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto">Corpo docente cadastrado no sistema.</p>
            </div>
          </Link>

          {/* Disciplinas */}
          <Link href="/dashboard/ctc/disciplinas" className="group">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:border-camini-cyan/50 hover:shadow-md transition-all flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-camini-cobalt dark:group-hover:text-camini-cyan transition-colors">
                  <BookPlus className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.disciplinas}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Disciplinas</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto">Grade curricular e ementas estruturadas.</p>
            </div>
          </Link>

          {/* Aulas */}
          <Link href="/dashboard/ctc/aulas" className="group">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm hover:border-camini-cyan/50 hover:shadow-md transition-all flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-camini-cobalt dark:group-hover:text-camini-cyan transition-colors">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.aulas}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Aulas</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto">Aulas programadas no calendário.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
