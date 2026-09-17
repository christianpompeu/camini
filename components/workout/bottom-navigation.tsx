"use client";

import React, { useState } from "react";
import { Dumbbell, History, BookOpen, TrendingUp } from "lucide-react";

export interface NavItem {
  id: "treinos" | "historico" | "exercicios" | "progresso";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const defaultNavItems: NavItem[] = [
  { id: "treinos", label: "Treinos", icon: Dumbbell },
  { id: "historico", label: "Histórico", icon: History },
  { id: "exercicios", label: "Exercícios", icon: BookOpen },
  { id: "progresso", label: "Progresso", icon: TrendingUp },
];

export interface BottomNavigationProps {
  activeId?: NavItem["id"];
  onChange?: (id: NavItem["id"]) => void;
  className?: string;
}

export function BottomNavigation({
  activeId = "treinos",
  onChange,
  className = "",
}: BottomNavigationProps) {
  const [current, setCurrent] = useState<NavItem["id"]>(activeId);

  const handleClick = (id: NavItem["id"]) => {
    setCurrent(id);
    if (onChange) onChange(id);
  };

  return (
    <nav
      aria-label="Navegação principal"
      className={`glass-surface rounded-pill p-2 max-w-md w-full shadow-2xl ${className}`}
    >
      <ul className="flex items-center justify-around gap-1">
        {defaultNavItems.map((item) => {
          const isActive = current === item.id;
          const Icon = item.icon;

          return (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => handleClick(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-full min-h-[48px] py-1.5 px-3 rounded-pill text-xs font-semibold transition-all duration-200 tap-effect ${
                  isActive
                    ? "bg-gradient-energy text-white shadow-md shadow-energy-blue/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated/40"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
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
