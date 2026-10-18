import React from "react";
import Link from "next/link";
import { Calendar, Users, Send, CheckCircle2 } from "lucide-react";

export function DashboardMetricsCards() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Stat 1: Consultas Hoje */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs flex flex-col justify-between hover:border-[#B8A1E3] transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483]">
              Consultas Hoje
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-3xl text-[#1D1928] font-bold leading-none font-tabular">
                6
              </span>
              <span className="text-xs text-[#494552]">agendadas</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F8F1FF] flex items-center justify-center text-[#6846B5]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-2 flex items-center justify-between text-xs border-t border-[#EDE5FA]/60">
          <span className="text-[#93AA91] font-semibold">2 finalizadas</span>
          <span className="text-[#6846B5] font-semibold">1 em espera</span>
          <span className="text-[#7A7483]">3 restantes</span>
        </div>
      </div>

      {/* Stat 2: Pacientes Ativos */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs flex flex-col justify-between hover:border-[#B8A1E3] transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483]">
              Pacientes Ativos
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-3xl text-[#1D1928] font-bold leading-none font-tabular">
                84
              </span>
              <span className="text-[11px] text-[#93AA91] font-semibold bg-[#D1E9CE]/50 px-1.5 py-0.5 rounded">
                +6 este mês
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F8F1FF] flex items-center justify-center text-[#6846B5]">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-[#494552] border-t border-[#EDE5FA]/60">
          <span>Planos em acompanhamento</span>
          <span className="font-semibold text-[#1D1928]">100% em dia</span>
        </div>
      </div>

      {/* Stat 3: Retornos Pendentes */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs flex flex-col justify-between hover:border-[#B8A1E3] transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483]">
              Retornos Pendentes
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-3xl text-[#6846B5] font-bold leading-none font-tabular">
                5
              </span>
              <span className="text-xs text-[#685490] font-semibold">a contatar</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F8F1FF] flex items-center justify-center text-[#6846B5]">
            <Send className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-[#494552] border-t border-[#EDE5FA]/60">
          <span>Janela de 30 a 45 dias</span>
          <Link
            href="/nutre/pacientes"
            className="text-[#6846B5] hover:underline font-semibold"
          >
            Ver lista
          </Link>
        </div>
      </div>

      {/* Stat 4: Adesão Média */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs flex flex-col justify-between hover:border-[#B8A1E3] transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483]">
              Adesão Média
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-3xl text-[#1D1928] font-bold leading-none font-tabular">
                88%
              </span>
              <span className="text-xs text-[#93AA91] font-semibold">ao plano</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#D1E9CE]/40 flex items-center justify-center text-[#93AA91]">
            <CheckCircle2 className="w-5 h-5 text-[#354935]" />
          </div>
        </div>
        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-[#494552] border-t border-[#EDE5FA]/60">
          <span>Diários e hidratação</span>
          <span className="font-semibold text-[#1D1928]">78 registros hoje</span>
        </div>
      </div>
    </section>
  );
}
