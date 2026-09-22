"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { usePathname } from "next/navigation";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Fecha a sidebar automaticamente ao mudar de rota
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Bloqueia scroll do body e trata tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-[#f8f9fa] dark:bg-[#090d16] text-gray-900 dark:text-gray-100 overflow-hidden transition-colors">
      <Sidebar 
        isOpenMobile={isSidebarOpen} 
        onCloseMobile={() => setIsSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <DashboardHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
