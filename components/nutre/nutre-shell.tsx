"use client";

import React, { useState } from "react";
import { NutreSidebar } from "./nutre-sidebar";
import { NutreHeader } from "./nutre-header";

interface NutreShellProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function NutreShell({ children, breadcrumbs = [] }: NutreShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="nutre-theme min-h-screen bg-[#FDF7FF] text-[#1D1928] flex flex-col antialiased selection:bg-[#EBDDFF] selection:text-[#23005C]">
      {/* Main Structural Layout */}
      <div className="flex-1 flex w-full relative">
        {/* Nutre Sidebar */}
        <NutreSidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Content Shell (with responsive margin for sidebar) */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
          }`}
        >
          {/* Nutre Top Header */}
          <NutreHeader
            onOpenMobileSidebar={() => setIsMobileOpen(true)}
            isCollapsed={isCollapsed}
            breadcrumbs={breadcrumbs}
          />

          {/* Main Workspace Canvas */}
          <main className="flex-1 pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
