"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Home,
  Dumbbell,
  ArrowRight,
  LayoutGrid,
  Database,
  CalendarDays,
  Palette,
  Radio,
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
  const isDashboard = pathname.startsWith("/dashboard");
  const isRadar = pathname.startsWith("/radar");
  const isPlayground = pathname.startsWith("/playground");
  const isForca = pathname.startsWith("/forca");
  const isTotvsRm = pathname.startsWith("/totvs-rm");
  const isCalendario = pathname.startsWith("/ctc/calendario");

  const modules = [
    {
      href: "/dashboard",
      title: "Dashboard Central",
      subtitle: "Portal Administrativo",
      badge: "Portal",
      icon: LayoutGrid,
      isActive: isDashboard,
    },
    {
      href: "/radar",
      title: "Radar Tributário",
      subtitle: "Reforma Tributária IBS/CBS",
      badge: "Editorial",
      icon: Radio,
      isActive: isRadar,
    },
    {
      href: "/totvs-rm",
      title: "RM SQL AI",
      subtitle: "Consultas & Dicionário",
      badge: "TOTVS RM",
      icon: Database,
      isActive: isTotvsRm,
    },
    {
      href: "/forca",
      title: "App FORÇA",
      subtitle: "Cargas, Séries & RIR",
      badge: "Treino",
      icon: Dumbbell,
      isActive: isForca,
    },
    {
      href: "/ctc/calendario",
      title: "Calendário Público",
      subtitle: "Grade de Aulas CTC",
      badge: "CTC",
      icon: CalendarDays,
      isActive: isCalendario,
    },
    {
      href: "/playground",
      title: "Design System",
      subtitle: "Playground & Tokens",
      badge: "Catálogo",
      icon: Palette,
      isActive: isPlayground,
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden transition-[visibility] duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop escuro com blur */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer lateral deslizante */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu de Navegação Camini"
        className={`fixed inset-y-0 right-0 w-4/5 max-w-sm bg-background border-l border-border p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Cabeçalho da Sidebar */}
          <div className="flex items-center justify-between pb-5 border-b border-border">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-2.5"
            >
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-tight">
                  Camini
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                  Studio Admin
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              aria-label="Fechar menu"
              className="h-9 w-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Links Principais */}
          <nav className="space-y-4" aria-label="Navegação Principal">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2 block">
                Navegação
              </span>
              <Link
                href="/"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isHome
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Início (Hub Camini)</span>
              </Link>
            </div>

            {/* Módulos do Ecossistema */}
            <div className="space-y-2 pt-3 border-t border-border">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2 block">
                Módulos & Aplicações
              </span>

              {modules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    onClick={onClose}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                      mod.isActive
                        ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                        : "bg-card border-border hover:border-primary/40 hover:bg-muted/30 text-card-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                          mod.isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm leading-tight">
                            {mod.title}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              mod.isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {mod.badge}
                          </span>
                        </div>
                        <span
                          className={`text-xs mt-0.5 ${
                            mod.isActive
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {mod.subtitle}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 ${
                        mod.isActive ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Rodapé da Sidebar com Tema */}
        <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-foreground block">
              Tema da Interface
            </span>
            <span className="text-[11px] text-muted-foreground">
              Alternar claro ou escuro
            </span>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </div>
  );
}
