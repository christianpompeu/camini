"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Hexagon } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-14 shrink-0 border-b border-border bg-background px-4 flex items-center justify-between z-30 sticky top-0 transition-colors">
      {/* Lado Esquerdo: Sidebar Trigger + Marca (Mobile) */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        
        <Link href="/dashboard" className="flex md:hidden items-center gap-2">
          <Hexagon className="w-5 h-5" />
          <span className="font-semibold tracking-tight text-foreground">
            Camini
          </span>
        </Link>
      </div>

      {/* Lado Direito: Theme Toggle */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}


