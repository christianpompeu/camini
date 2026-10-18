"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  Activity,
  Utensils,
  BookOpen,
  LineChart,
  FileSpreadsheet,
  CreditCard,
  Library,
  MessageSquare,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Sparkles,
} from "lucide-react";

interface NutreSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function NutreSidebar({
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: NutreSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (path: string) => {
    if (path === "/nutre") {
      return pathname === "/nutre";
    }
    return pathname.startsWith(path);
  };

  const navGroups = [
    {
      title: "Clínico",
      items: [
        { label: "Dashboard", href: "/nutre", icon: LayoutDashboard },
        { label: "Agenda", href: "/nutre#agenda", icon: Calendar, badge: null },
        { label: "Pacientes", href: "/nutre/pacientes", icon: Users, badge: "148" },
        { label: "Atendimentos", href: "/nutre#atendimentos", icon: ClipboardList, badge: null },
      ],
    },
    {
      title: "Condutas & Evolução",
      items: [
        { label: "Avaliações", href: "/nutre#avaliacoes", icon: Activity },
        { label: "Planos Alimentares", href: "/nutre#planos-alimentares", icon: Utensils },
        { label: "Diário Alimentar", href: "/nutre#diario-alimentar", icon: BookOpen },
        { label: "Acompanhamentos", href: "/nutre#acompanhamentos", icon: LineChart },
      ],
    },
    {
      title: "Gestão & Recursos",
      items: [
        { label: "Formulários", href: "/nutre#formularios", icon: FileSpreadsheet },
        { label: "Financeiro", href: "/nutre#financeiro", icon: CreditCard },
        { label: "Biblioteca", href: "/nutre#biblioteca", icon: Library },
        { label: "Comunicação", href: "/nutre#comunicacao", icon: MessageSquare },
      ],
    },
    {
      title: "Sistema",
      items: [
        { label: "Ferramentas", href: "/nutre#ferramentas", icon: Wrench },
        { label: "Configurações", href: "/nutre#configuracoes", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#1E1B26]/50 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-[#FFFFFF] border-r border-[#EAE5F2] shadow-[0_1px_8px_rgba(40,36,51,0.04)] z-50 flex flex-col justify-between transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-[72px]" : "w-[260px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header Brand */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-[#EDE5FA]/70 shrink-0">
            <Link
              href="/nutre"
              className="flex items-center gap-2.5 overflow-hidden group"
              onClick={onCloseMobile}
            >
              <div className="w-8 h-8 rounded-lg bg-[#6846B5] flex items-center justify-center text-[#FFFFFF] font-bold shadow-xs shrink-0 group-hover:bg-[#57389B] transition-colors">
                <Sparkles className="w-4 h-4 text-[#EBDDFF]" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[15px] tracking-tight text-[#1D1928] leading-none">
                      NUTRE
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#EDE5FA] text-[#6846B5] uppercase tracking-wider">
                      Clínico
                    </span>
                  </div>
                  <span className="text-[10px] text-[#7A7483] font-medium tracking-wide mt-0.5 truncate">
                    Gestão Nutricional
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-[#7A7483] hover:text-[#1D1928] lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <div className="py-3 px-2 space-y-4">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 pb-1 text-[11px] font-semibold text-[#7A7483] uppercase tracking-wider">
                    {group.title}
                  </div>
                )}
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isLinkActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onCloseMobile}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? "bg-[#6846B5] text-[#FFFFFF] shadow-2xs font-semibold"
                            : "text-[#494552] hover:bg-[#F8F1FF] hover:text-[#1D1928]"
                        } ${isCollapsed ? "justify-center px-0" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-[18px] h-[18px] shrink-0 ${
                              active ? "text-[#FFFFFF]" : "text-[#7A7483]"
                            }`}
                          />
                          {!isCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isCollapsed && item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              active
                                ? "bg-[#EDE5FA] text-[#6846B5]"
                                : "bg-[#EBDDFF] text-[#230E48]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[#EDE5FA]/70 space-y-2 shrink-0 bg-[#FFFFFF]">
          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-[#F8F1FF] border border-[#EDE5FA] space-y-1">
              <div className="flex items-center gap-1.5 text-[#6846B5] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protótipo Demonstrativo</span>
              </div>
              <p className="text-[11px] text-[#494552] leading-tight">
                Ambiente conceitual para validação clínica. Sem diagnósticos reais.
              </p>
              <span className="inline-block mt-1 text-[10px] font-medium text-[#7A7483] bg-[#EDE5FA] px-1.5 py-0.5 rounded">
                Versão Protótipo 2.0
              </span>
            </div>
          )}

          {/* Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              type="button"
              className="w-full hidden lg:flex items-center justify-center gap-2 py-1.5 text-xs text-[#7A7483] hover:text-[#1D1928] hover:bg-[#F8F1FF] rounded-lg transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Recolher menu</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
