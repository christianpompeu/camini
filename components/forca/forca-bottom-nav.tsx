"use client";

import { Dumbbell, History, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "treinos", label: "Treinos", icon: Dumbbell },
  { id: "exercicios", label: "Exercícios", icon: BookOpen },
  { id: "historico", label: "Histórico", icon: History },
  { id: "progresso", label: "Progresso", icon: TrendingUp },
] as const;

export type NavItemId = typeof NAV_ITEMS[number]["id"];

interface ForcaBottomNavProps {
  activeId: string;
  onChange: (id: NavItemId) => void;
  className?: string;
}

export function ForcaBottomNav({ activeId, onChange, className }: ForcaBottomNavProps) {
  return (
    <nav className={cn("fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white border border-slate-100 rounded-2xl p-2 shadow-xl shadow-slate-200/50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none z-50", className)}>
      <ul className="flex items-center justify-between gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          return (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => onChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 min-h-[56px] w-full py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <span className="tracking-tight text-[10px] sm:text-xs">
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
