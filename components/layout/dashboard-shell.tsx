"use client";

import React from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

