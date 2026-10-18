"use client";

import React from "react";
import { Info, ShieldAlert } from "lucide-react";

interface NutreDemoBadgeProps {
  className?: string;
  variant?: "top-banner" | "subtle-pill";
}

export function NutreDemoBadge({ className = "", variant = "subtle-pill" }: NutreDemoBadgeProps) {
  if (variant === "top-banner") {
    return (
      <aside
        aria-label="Aviso de ambiente de demonstração"
        className={`w-full py-1.5 px-4 bg-[#EDE5FA]/80 border-b border-[#CBC3D4]/50 flex items-center justify-between text-xs text-[#494552] backdrop-blur-xs ${className}`}
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#6846B5] shrink-0" />
            <span className="font-medium text-[#282433]">
              Ambiente de demonstração — não inserir dados reais.
            </span>
            <span className="hidden sm:inline text-[#6B6678]">
              Versão navegável preliminar do Nutre (Camini).
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#FFFFFF] text-[#6846B5] border border-[#EAE5F2] shrink-0">
            Marco 01
          </span>
        </div>
      </aside>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs text-[#6B6678] text-xs font-medium ${className}`}
    >
      <ShieldAlert className="w-3.5 h-3.5 text-[#6846B5]" />
      <span>Ambiente de demonstração — não inserir dados reais</span>
    </div>
  );
}
