import { Sidebar } from "@/components/layout/sidebar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Aqui podemos adicionar um Header (Topbar) comum a todas as telas do painel se necessário */}
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
