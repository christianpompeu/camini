"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, Home, Layers, Dumbbell, Database } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isPlayground = pathname.startsWith("/playground");
  const isForca = pathname.startsWith("/forca");
  const isTotvsRm = pathname.startsWith("/totvs-rm");

  const navItems = [
    {
      href: "/",
      label: "Início",
      icon: Home,
      isActive: isHome && !isDashboard, // Avoid highlighting Home when in dashboard
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Layers,
      isActive: isDashboard,
    },
    {
      href: "/totvs-rm",
      label: "RM SQL AI",
      icon: Database,
      isActive: isTotvsRm,
    },
    {
      href: "/forca",
      label: "App FORÇA",
      icon: Dumbbell,
      isActive: isForca,
    },
    {
      href: "/playground",
      label: "Design System",
      icon: Sparkles,
      isActive: isPlayground,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-surface border-b border-outline px-4 sm:px-8 py-2 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* LADO ESQUERDO: SEMPRE O LOGO E NOME 'camini' PADRONIZADO */}
          <Link
            href="/"
            className="flex items-center tap-effect group shrink-0"
            aria-label="camini Início"
          >
            <div className="relative w-48 sm:w-60 h-12 sm:h-14 hover:opacity-85 transition-opacity">
              <Image 
                src="/logo_camini_light.png" 
                alt="Camini Logo" 
                fill 
                className="object-contain object-left camini-logo-light dark:hidden" 
                priority
              />
              <Image 
                src="/logo_camini_dark.png" 
                alt="Camini Logo Dark" 
                fill 
                className="object-contain object-left camini-logo-dark hidden dark:block" 
                priority
              />
            </div>
          </Link>

          {/* LADO DIREITO: MENUS DE NAVEGAÇÃO COM O ATIVO EM GRADIENTE + THEME TOGGLE */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Menus Desktop (à direita) */}
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Menu principal">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-pill text-sm transition-all duration-150 tap-effect select-none ${
                      item.isActive
                        ? "bg-gradient-energy text-white font-bold shadow-md shadow-energy-blue/25 hover:brightness-105"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated font-medium"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        item.isActive ? "stroke-[2.5]" : "text-text-secondary"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Separador sutil desktop */}
            <div className="hidden md:block w-px h-6 bg-outline mx-1" />

            {/* Alternador de Tema Claro / Escuro */}
            <ThemeToggle />

            {/* Botão Hambúrguer Mobile (Touch Target >= 44px) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir menu de navegação"
              className="md:hidden min-h-[44px] min-w-[44px] rounded-pill bg-surface-elevated border border-outline flex items-center justify-center text-text-primary hover:border-energy-blue/50 tap-effect"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Mobile Drawer Padronizada */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
