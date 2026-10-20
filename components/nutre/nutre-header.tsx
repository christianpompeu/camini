"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Plus,
  Bell,
  Clock,
  ChevronDown,
  UserPlus,
  CalendarPlus,
  Home,
  ExternalLink,
} from "lucide-react";
import { NutreThemeToggle } from "./nutre-theme-toggle";
import { CommandSearchModal } from "./command-search-modal";
import { useNutreNavigation } from "./nutre-navigation-context";

interface NutreHeaderProps {
  onOpenMobileSidebar: () => void;
  isCollapsed?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function NutreHeader({
  onOpenMobileSidebar,
  isCollapsed = false,
  breadcrumbs = [],
}: NutreHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { resolveUrl } = useNutreNavigation();

  return (
    <>
      <header
        className={`fixed top-0 right-0 h-14 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#EAE5F2] shadow-[0_1px_8px_rgba(40,36,51,0.04)] z-40 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:left-[72px]" : "lg:left-[260px]"} left-0
        `}
      >
        {/* Left Section: Mobile menu button & Breadcrumbs */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            type="button"
            className="p-1.5 -ml-1 text-[#7A7483] hover:text-[#1D1928] hover:bg-[#F8F1FF] rounded-lg lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#494552] truncate">
            <Link
              href={resolveUrl("/nutre")}
              className="font-bold text-[#1D1928] hover:text-[#6846B5] transition-colors flex items-center gap-1"
            >
              <span>NUTRE</span>
              <span className="text-[#7A7483] font-normal">• Gestão Nutricional</span>
            </Link>

            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                <span className="text-[#CBC3D4]">/</span>
                {crumb.href && idx < breadcrumbs.length - 1 ? (
                  <Link
                    href={resolveUrl(crumb.href)}
                    className="text-[#494552] hover:text-[#6846B5] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#6846B5] font-semibold truncate">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Quick Search trigger button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="relative max-w-sm w-full hidden sm:flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-lg bg-[#F8F1FF] border border-[#EAE5F2] text-xs text-[#7A7483] hover:border-[#B8A1E3] hover:bg-[#FFFFFF] transition-all cursor-pointer text-left"
          >
            <Search className="w-4 h-4 text-[#7A7483]" />
            <span className="flex-1 truncate">
              Buscar paciente, plano ou prontuário...
            </span>
            <kbd className="px-1.5 py-0.5 rounded border border-[#CBC3D4] bg-[#FFFFFF] text-[10px] font-semibold text-[#6B6678]">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Section: Today status, "+ Novo", notifications, practitioner */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <NutreThemeToggle />
          {/* Mobile search trigger icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 text-[#7A7483] hover:text-[#1D1928] hover:bg-[#F8F1FF] rounded-lg"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Clinical Room Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F8F1FF] border border-[#EDE5FA] text-xs text-[#494552] font-tabular">
            <Clock className="w-3.5 h-3.5 text-[#6846B5]" />
            <span>Hoje: 14:30 | Consultório 2</span>
          </div>

          {/* Quick Action: "+ Novo" with dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              type="button"
              className="h-8 sm:h-9 px-3 rounded-lg bg-[#6846B5] hover:bg-[#57389B] text-[#FFFFFF] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isNewMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNewMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-[#FFFFFF] rounded-xl shadow-lg border border-[#EAE5F2] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <Link
                    href={resolveUrl("/nutre/pacientes/novo")}
                    onClick={() => setIsNewMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#1D1928] hover:bg-[#F8F1FF] hover:text-[#6846B5] transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-[#6846B5]" />
                    <span>+ Novo Paciente</span>
                  </Link>
                  <button
                    onClick={() => setIsNewMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#1D1928] hover:bg-[#F8F1FF] hover:text-[#6846B5] transition-colors text-left"
                  >
                    <CalendarPlus className="w-4 h-4 text-[#7A7483]" />
                    <span>Agendar Consulta</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative p-2 rounded-lg text-[#7A7483] hover:text-[#1D1928] hover:bg-[#F8F1FF] transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#BA1A1A] ring-2 ring-[#FFFFFF]" />
          </button>

          {/* Practitioner Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              type="button"
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#EDE5FA] text-left hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#EBDDFF] text-[#230E48] font-bold text-xs flex items-center justify-center ring-1 ring-[#6846B5]/20 shrink-0">
                CR
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-semibold text-[#1D1928] leading-tight">
                  Profissional de demonstração
                </span>
                <span className="text-[10px] text-[#7A7483] leading-tight">
                  Perfil genérico • Ambiente demo
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7A7483] hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] rounded-xl shadow-xl border border-[#EAE5F2] p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-[#F8F1FF]">
                    <div className="text-xs font-bold text-[#1D1928]">
                      Profissional de demonstração
                    </div>
                    <div className="text-[11px] text-[#6B6678]">
                      usuario.demo@example.invalid
                    </div>
                    <div className="text-[10px] text-[#93AA91] font-semibold mt-0.5">
                      Consultório 2 • Conectada
                    </div>
                  </div>

                  <div className="pt-1">
                    <Link
                      href={resolveUrl("/dashboard")}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#494552] hover:bg-[#F8F1FF] hover:text-[#6846B5] transition-colors"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Voltar ao Camini Hub</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Command Search Modal */}
      <CommandSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
