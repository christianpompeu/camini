"use client";

import React from "react";
import { Dumbbell, Layers, History, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const FORCA_NAV_ITEMS = [
  { id: "hoje", label: "Hoje", icon: Dumbbell },
  { id: "fichas", label: "Fichas", icon: Layers },
  { id: "exercicios", label: "Exercícios", icon: BookOpen },
  { id: "historico", label: "Histórico", icon: History },
  { id: "progresso", label: "Progresso", icon: TrendingUp },
] as const;

export type ForcaNavItemId = (typeof FORCA_NAV_ITEMS)[number]["id"];

interface ForcaBottomNavProps {
  activeId: string;
  onChange: (id: ForcaNavItemId) => void;
  hasActiveSession?: boolean;
  className?: string;
}

export function ForcaBottomNav({
  activeId,
  onChange,
  hasActiveSession = false,
  className,
}: ForcaBottomNavProps) {
  return (
    <nav
      aria-label="Navegação do módulo FORÇA"
      className={cn(
        "fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-zinc-200/90 dark:bg-zinc-950/95 dark:border-zinc-800/90 px-2 py-1.5 z-40 transition-all",
        className
      )}
      data-purpose="bottom-tab-bar"
    >
      <div className="grid grid-cols-5 items-center gap-0.5">
        {FORCA_NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id || (item.id === "hoje" && activeId === "treinos");
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-xl font-medium text-xs tracking-tight transition-all duration-150 select-none cursor-pointer relative",
                isActive
                  ? "bg-zinc-100 text-zinc-950 font-semibold dark:bg-zinc-800 dark:text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900"
              )}
            >
              <div className="relative">
                <Icon className="w-4 h-4 mb-0.5" strokeWidth={isActive ? 2.5 : 2} />
                {item.id === "hoje" && hasActiveSession && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
                )}
              </div>
              <span className="text-[11px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

