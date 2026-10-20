"use client";

import React from "react";
import { Dumbbell, Layers, History, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const FORCA_NAV_ITEMS = [
  { id: "hoje", label: "Treinos", icon: Dumbbell },
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
    <div
      className={cn(
        "fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 px-3 flex justify-center pointer-events-none transition-all",
        className
      )}
    >
      <nav
        aria-label="Navegação do módulo FORÇA"
        data-purpose="bottom-tab-bar"
        className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] rounded-2xl sm:rounded-full p-1.5 transition-all"
      >
        <div className="grid grid-cols-5 items-center gap-1">
          {FORCA_NAV_ITEMS.map((item) => {
            const isActive =
              activeId === item.id ||
              (item.id === "hoje" && (activeId === "treinos" || activeId === "dashboard"));
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-1 min-h-[44px] rounded-xl sm:rounded-full text-[10px] sm:text-[11px] font-medium tracking-tight transition-all duration-150 select-none cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-white",
                  isActive
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm font-semibold"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/70"
                )}
              >
                <div className="relative mb-0.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isActive ? "text-white dark:text-zinc-950 scale-105" : "text-zinc-500 dark:text-zinc-400"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.id === "hoje" && hasActiveSession && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
                  )}
                </div>
                <span className={cn(
                  "leading-none transition-colors",
                  isActive ? "text-white dark:text-zinc-950" : "text-zinc-600 dark:text-zinc-400"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}


