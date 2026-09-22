"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, ArrowLeft } from "lucide-react";

export interface DashboardHeaderProps {
  onOpenSidebar: () => void;
}

export function DashboardHeader({ onOpenSidebar }: DashboardHeaderProps) {
  return (
    <header className="h-16 shrink-0 border-b border-gray-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-md px-4 sm:px-6 md:px-8 flex items-center justify-between z-30 transition-colors sticky top-0">
      {/* Lado Esquerdo: Marca do Hub visível apenas no Mobile (no Desktop a Sidebar já exibe a marca) */}
      <div className="flex items-center">
        <Link href="/dashboard" className="flex md:hidden items-center gap-2.5 tap-effect">
          <div className="relative w-7 h-7">
            <Image 
              src="/icon_camini.png" 
              alt="Camini Icon" 
              fill 
              className="rounded-lg object-contain shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base sm:text-lg text-camini-navy dark:text-white">
              Hub Integrado
            </span>
            <span className="text-[10px] uppercase font-bold text-camini-indigo dark:text-camini-cyan bg-camini-indigo/10 dark:bg-camini-cyan/15 px-1.5 py-0.5 rounded">
              Painel
            </span>
          </div>
        </Link>
      </div>

      {/* Lado Direito: Botão Voltar ao Camini + Theme Toggle + Botão Hambúrguer Mobile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-camini shadow-md shadow-blue-500/25 hover:shadow-lg hover:brightness-105 active:scale-95 transition-all tap-effect"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Voltar ao Camini</span>
          <span className="sm:hidden">Camini</span>
        </Link>

        <ThemeToggle />

        {/* Botão Hambúrguer Mobile no LADO DIREITO */}
        <button
          onClick={onOpenSidebar}
          aria-label="Abrir menu do painel"
          className="md:hidden min-h-[40px] min-w-[40px] rounded-pill bg-surface-elevated border border-outline flex items-center justify-center text-text-primary hover:border-energy-blue/50 tap-effect cursor-pointer shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}


