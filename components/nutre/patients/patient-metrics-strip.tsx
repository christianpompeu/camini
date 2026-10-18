import React from "react";
import { Users, CheckCircle2, Calendar, Clock } from "lucide-react";

export function PatientMetricsStrip() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Cadastrados */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483] block">
            Total Cadastrados
          </span>
          <span className="font-heading text-2xl font-bold text-[#1D1928] font-tabular mt-0.5 block">
            148
          </span>
        </div>
        <div className="p-2 rounded-lg bg-[#F8F1FF] text-[#6846B5]">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Ativos com Plano */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483] block">
            Ativos com Plano
          </span>
          <span className="font-heading text-2xl font-bold text-[#1D1928] font-tabular mt-0.5 block">
            84
          </span>
        </div>
        <div className="p-2 rounded-lg bg-[#D1E9CE] text-[#354935]">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Consultas Hoje */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483] block">
            Consultas Hoje
          </span>
          <span className="font-heading text-2xl font-bold text-[#6846B5] font-tabular mt-0.5 block">
            2
          </span>
        </div>
        <div className="p-2 rounded-lg bg-[#E9DDFF] text-[#6846B5]">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Aguardando Retorno */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483] block">
            Aguardando Retorno
          </span>
          <span className="font-heading text-2xl font-bold text-[#685490] font-tabular mt-0.5 block">
            19
          </span>
        </div>
        <div className="p-2 rounded-lg bg-[#F8F1FF] text-[#685490]">
          <Clock className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
