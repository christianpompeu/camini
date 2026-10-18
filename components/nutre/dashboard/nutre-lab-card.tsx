import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

export function DashboardNutreLabCard() {
  return (
    <section className="rounded-xl bg-gradient-to-br from-[#F3EAFF] via-[#EDE5FA] to-[#E7DFF4] shadow-2xs p-5 relative overflow-hidden group border border-[#EDE5FA]">
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-[#6846B5] text-[10px] font-bold tracking-wider uppercase shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#6846B5]" />
            Protótipo Demonstrativo
          </span>
          <span className="text-[11px] text-[#494552] font-semibold">Nutre Lab</span>
        </div>

        <div className="space-y-1">
          <h3 className="font-heading text-base text-[#1D1928] font-bold leading-tight">
            Registro &amp; Evolução Corporal
          </h3>
          <p className="text-xs text-[#494552] leading-relaxed">
            Interface conceitual para organização de fotos de evolução e acompanhamento de medidas sem diagnósticos automatizados.
          </p>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            className="h-8 px-3.5 rounded-lg bg-[#6846B5] text-[#FFFFFF] hover:bg-[#57389B] text-xs font-semibold transition-all duration-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explorar Interface</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-[#7A7483]">Sem fins diagnósticos</span>
        </div>
      </div>

      {/* Decorative gradient ambient circle */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#6846B5]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
    </section>
  );
}
