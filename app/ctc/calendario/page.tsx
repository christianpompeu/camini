import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarioPublicoPage() {
  return (
    <div className="min-h-screen bg-camini-softgray dark:bg-[#0c1017] flex flex-col">
      {/* Header */}
      <header className="bg-camini-navy border-b border-white/10 py-4 px-4 sm:px-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/icon_camini.png" alt="Camini Icon" width={32} height={32} className="rounded-lg shadow-sm" />
            <h1 className="text-xl font-bold text-white tracking-tight">Calendário CTC</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 hidden sm:flex">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto py-12 px-4 sm:px-8 flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-camini-cyan/20 blur-2xl rounded-full" />
          <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-gray-100 dark:border-slate-800">
            <CalendarDays className="w-10 h-10 text-camini-cobalt dark:text-camini-cyan stroke-[1.5]" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-camini-navy dark:text-white mb-3">
          Sincronização em Preparação
        </h2>
        
        <p className="text-base sm:text-lg text-camini-graphite/70 dark:text-gray-400 max-w-lg mb-8 leading-relaxed">
          A visualização pública do calendário de turmas e horários está sendo integrada ao sistema de gestão. 
          Em breve, você poderá consultar as próximas aulas do curso diretamente aqui.
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-camini-graphite/50 dark:text-gray-500 bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-800">
          <Clock className="w-4 h-4" />
          <span>Módulo em desenvolvimento</span>
        </div>
      </main>
    </div>
  );
}
