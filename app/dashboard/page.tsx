import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardHomePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-camini-navy text-white shadow-xl">
        <div className="absolute right-0 top-0 h-full w-2/3 md:w-1/2 opacity-30 md:opacity-100 pointer-events-none">
          <Image 
            src="/doodle_camini_2.png" 
            alt="Camini Doodle" 
            fill 
            className="object-cover object-left"
            priority
          />
        </div>
        <div className="relative z-10 p-8 md:p-12 md:w-2/3">
          <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider mb-6 border border-white/20 text-camini-cyan">
            PORTAL ADMINISTRATIVO
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Bem-vindo ao <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-camini-cyan to-white">Hub Integrado</span>
          </h1>
          <p className="text-camini-softgray text-base md:text-lg max-w-lg mb-8 leading-relaxed">
            Sua central de operações. Gerencie módulos, acesse estatísticas e acompanhe o fluxo da sua instituição de forma unificada.
          </p>
          <Link href="/dashboard/ctc">
            <Button variant="camini" size="lg" className="shadow-xl px-6 py-6 text-base font-semibold">
              Acessar Módulo CTC <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Modules Shortcuts */}
      <div>
        <h2 className="text-xl font-bold text-camini-graphite dark:text-white mb-6 flex items-center gap-2">
          Módulos Ativos
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/ctc" className="group">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-camini-cyan/30 transition-all">
              <div className="w-12 h-12 bg-gradient-camini text-white rounded-xl flex items-center justify-center mb-4 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
                <BookOpen className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-camini-graphite dark:text-white mb-2">Gestão CTC</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Curso de Teologia Cristã. Controle de professores, disciplinas e calendário de aulas.
              </p>
            </div>
          </Link>

          <Link href="#" className="group pointer-events-none opacity-60">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm transition-all relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">Em breve</div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <UserCircle2 className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-2">Recursos Humanos</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Gestão de funcionários, folha de pagamento e benefícios.
              </p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}
