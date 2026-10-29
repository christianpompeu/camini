"use client";

import React from "react";
import {
  History,
  GitFork,
  CreditCard,
  ShieldAlert,
  Terminal,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey =
  | "evolution"
  | "structure"
  | "domains"
  | "validations"
  | "simulator"
  | "guidelines";

interface NfePagTabsNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function NfePagTabsNav({ activeTab, onTabChange }: NfePagTabsNavProps) {
  const tabs = [
    {
      key: "evolution" as TabKey,
      label: "Evolução Normativa",
      icon: History,
    },
    {
      key: "structure" as TabKey,
      label: "Estrutura & Tags XML",
      icon: GitFork,
    },
    {
      key: "domains" as TabKey,
      label: "Meios & Bandeiras",
      icon: CreditCard,
    },
    {
      key: "validations" as TabKey,
      label: "Validações & Rejeições",
      icon: ShieldAlert,
    },
    {
      key: "simulator" as TabKey,
      label: "Simulador XML",
      icon: Terminal,
    },
    {
      key: "guidelines" as TabKey,
      label: "Diretrizes de ERP",
      icon: Settings2,
    },
  ];

  return (
    <div className="w-full border-b border-border bg-card/50 backdrop-blur-sm sticky top-14 z-30 py-1">
      <div className="flex space-x-1 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs border border-emerald-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
