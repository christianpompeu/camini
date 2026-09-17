"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Home,
  Dumbbell,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const isHome = pathname === "/";
  const isForca = pathname.startsWith("/forca");
  const isPlayground = pathname.startsWith("/playground");

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden transition-[visibility] duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop escuro com blur com transição suave de opacidade */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer lateral deslizante vindo da direita com física suave Material 3 */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu de Navegação camini"
        className={`fixed inset-y-0 right-0 w-4/5 max-w-sm glass-surface bg-surface/95 border-l border-outline p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Cabeçalho da Sidebar */}
          <div className="flex items-center justify-between pb-6 border-b border-outline">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-2.5 tap-effect"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-energy flex items-center justify-center text-white font-black text-lg shadow-md shadow-energy-blue/20">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-text-primary">
                  camini
                </span>
                <span className="text-[10px] font-bold text-energy-blue tracking-wider uppercase">
                  Plataforma Integrada
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              aria-label="Fechar menu"
              className="w-11 h-11 rounded-pill bg-surface-elevated border border-outline flex items-center justify-center text-text-secondary hover:text-text-primary tap-effect"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links e Módulos */}
          <nav className="mt-6 space-y-4" aria-label="Aplicações camini">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-2 mb-2 block">
                Navegação
              </span>
              <Link
                href="/"
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all tap-effect min-h-[48px] ${
                  isHome
                    ? "bg-gradient-energy text-white font-bold shadow-md shadow-energy-blue/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                }`}
              >
                <Home className="w-5 h-5 shrink-0" />
                <span>Início (camini Hub)</span>
              </Link>
            </div>

            {/* Módulos do Ecossistema */}
            <div className="space-y-2 pt-2 border-t border-outline/50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary px-2 mb-2 block">
                Módulos & Aplicações
              </span>

              {/* Card / Link do App FORÇA */}
              <Link
                href="/forca"
                onClick={onClose}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all tap-effect min-h-[56px] ${
                  isForca
                    ? "bg-gradient-energy text-white font-bold border-transparent shadow-lg shadow-energy-blue/25"
                    : "bg-surface-elevated border-outline hover:border-energy-blue/40 text-text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-pill flex items-center justify-center shrink-0 ${
                      isForca
                        ? "bg-white/20 text-white"
                        : "bg-energy-blue/15 text-energy-blue"
                    }`}
                  >
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold block leading-tight">
                        App FORÇA
                      </span>
                      <span
                        className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-pill ${
                          isForca
                            ? "bg-white/25 text-white"
                            : "bg-energy-blue text-white"
                        }`}
                      >
                        Treino
                      </span>
                    </div>
                    <span
                      className={`text-xs block mt-0.5 ${
                        isForca ? "text-white/80" : "text-text-secondary"
                      }`}
                    >
                      Cargas, Séries & RIR
                    </span>
                  </div>
                </div>
                <ArrowRight
                  className={`w-4 h-4 shrink-0 ${
                    isForca ? "text-white" : "text-text-secondary"
                  }`}
                />
              </Link>

              {/* Card / Link do Design System Playground */}
              <Link
                href="/playground"
                onClick={onClose}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all tap-effect min-h-[56px] ${
                  isPlayground
                    ? "bg-gradient-energy text-white font-bold border-transparent shadow-lg shadow-energy-blue/25"
                    : "bg-surface-elevated border-energy-violet/30 hover:border-energy-violet text-text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-pill flex items-center justify-center shrink-0 ${
                      isPlayground
                        ? "bg-white/20 text-white"
                        : "bg-energy-violet/15 text-energy-violet"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block leading-tight">
                      Design System
                    </span>
                    <span
                      className={`text-xs ${
                        isPlayground ? "text-white/80" : "text-text-secondary"
                      }`}
                    >
                      Playground & Tokens
                    </span>
                  </div>
                </div>
                <ArrowRight
                  className={`w-4 h-4 shrink-0 ${
                    isPlayground ? "text-white" : "text-text-secondary"
                  }`}
                />
              </Link>
            </div>
          </nav>
        </div>

        {/* Rodapé da Sidebar com Tema */}
        <div className="pt-6 border-t border-outline flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-text-primary block">
              Tema da Interface
            </span>
            <span className="text-[11px] text-text-secondary">
              Claro ou Escuro
            </span>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </div>
  );
}
