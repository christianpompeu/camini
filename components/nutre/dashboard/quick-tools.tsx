import React from "react";
import { Zap, BookOpen, Calculator, Copy, Pill } from "lucide-react";

export function DashboardQuickTools() {
  const tools = [
    {
      title: "Tabela TACO",
      desc: "5.900+ alimentos",
      icon: BookOpen,
      href: "#tabela-taco",
    },
    {
      title: "DRI / TMB",
      desc: "Cálculos nutricionais",
      icon: Calculator,
      href: "#calculadora-dri",
    },
    {
      title: "Modelos Salvos",
      desc: "14 templates clínicos",
      icon: Copy,
      href: "#modelos-dietas",
    },
    {
      title: "Fitoterapia",
      desc: "Fórmulas e minerais",
      icon: Pill,
      href: "#prescricoes",
    },
  ];

  return (
    <section className="rounded-xl bg-[#FFFFFF] shadow-2xs p-5 sm:p-6 border border-[#EAE5F2] space-y-4">
      <div className="flex items-center justify-between border-b border-[#EDE5FA]/70 pb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483]">
          Ferramentas do Consultório
        </span>
        <Zap className="w-4 h-4 text-[#7A7483]" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.title}
              className="p-3 rounded-xl bg-[#F8F1FF] hover:bg-[#F3EAFF] text-left transition-all group border border-[#EDE5FA]/60 cursor-pointer"
            >
              <Icon className="w-5 h-5 text-[#6846B5] mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-xs text-[#1D1928]">
                {tool.title}
              </div>
              <div className="text-[10px] text-[#7A7483] mt-0.5">
                {tool.desc}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
