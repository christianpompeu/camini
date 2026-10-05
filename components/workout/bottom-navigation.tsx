"use client";

import React from "react";
import { Dumbbell, History, BookOpen, TrendingUp } from "lucide-react";

export interface NavItem {
  id: "treinos" | "exercicios" | "historico" | "progresso";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const defaultNavItems: NavItem[] = [
  { id: "treinos", label: "Treinos", icon: Dumbbell },
  { id: "exercicios", label: "Exercícios", icon: BookOpen },
  { id: "historico", label: "Histórico", icon: History },
  { id: "progresso", label: "Progresso", icon: TrendingUp },
];

export interface BottomNavigationProps {
  activeId?: string;
  onChange?: (id: NavItem["id"]) => void;
  className?: string;
}

export function BottomNavigation({
  activeId = "treinos",
  onChange,
  className = "",
}: BottomNavigationProps) {
  const handleClick = (id: NavItem["id"]) => {
    if (onChange) onChange(id);
  };

  return (
    <nav
      aria-label="Navegação do módulo FORÇA"
      className={`bg-card/95 backdrop-blur-md border border-border rounded-xl p-1.5 max-w-md w-full shadow-lg ${className}`}
    >
      <ul className="flex items-center justify-around gap-1">
        {defaultNavItems.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => handleClick(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 w-full min-h-[46px] py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="tracking-tight text-[11px] sm:text-xs">
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
