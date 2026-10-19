"use client";

import React from "react";
import { Users, ArrowRight } from "lucide-react";
import { MOCK_PATIENTS } from "@/data/nutre/mock-patients";
import { NutreLink } from "@/components/nutre/nutre-navigation-context";

export function DashboardRecentPatientsTable() {
  const recentPatients = MOCK_PATIENTS.slice(0, 4);

  return (
    <section className="rounded-xl bg-[#FFFFFF] shadow-2xs p-5 sm:p-6 border border-[#EAE5F2]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDE5FA]/70">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6846B5]" />
            <h2 className="font-heading text-lg font-semibold text-[#1D1928]">
              Pacientes Recentes &amp; Prontuários
            </h2>
          </div>
          <p className="text-xs text-[#6B6678] mt-0.5">
            Histórico imediato com atalho direto para consulta do prontuário do paciente.
          </p>
        </div>

        <NutreLink
          href="/pacientes"
          className="text-xs sm:text-sm font-semibold text-[#6846B5] hover:text-[#57389B] flex items-center gap-1 transition-colors"
        >
          <span>Ver todos (148)</span>
          <ArrowRight className="w-4 h-4" />
        </NutreLink>
      </div>

      {/* Table */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F1FF] text-[#7A7483] text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3 rounded-l-lg">Paciente</th>
              <th className="py-2.5 px-3">Objetivo Clínico</th>
              <th className="py-2.5 px-3">Última Consulta</th>
              <th className="py-2.5 px-3">Adesão Registrada</th>
              <th className="py-2.5 px-3 text-right rounded-r-lg">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE5FA]/50 text-xs">
            {recentPatients.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-[#F8F1FF]/60 transition-colors group"
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#EBDDFF] text-[#230E48] flex items-center justify-center font-bold text-xs shrink-0">
                      {patient.avatarInitials}
                    </div>
                    <div>
                      <NutreLink
                        href={`/pacientes/${patient.id}`}
                        className="font-semibold text-sm text-[#1D1928] group-hover:text-[#6846B5] transition-colors block"
                      >
                        {patient.name}
                      </NutreLink>
                      <span className="text-[11px] text-[#7A7483]">
                        {patient.code} • {patient.age} anos
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3 text-[#494552]">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#F5F1FC] text-[#6846B5] font-medium text-[11px] border border-[#EAE5F2]">
                    {patient.clinicalGoal}
                  </span>
                </td>

                <td className="py-3 px-3 font-tabular text-[#494552]">
                  <div>{patient.lastConsultation}</div>
                  <div className="text-[10px] text-[#7A7483]">
                    {patient.lastConsultationRelative}
                  </div>
                </td>

                <td className="py-3 px-3 font-tabular">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#354935] bg-[#D1E9CE]/50 px-2 py-0.5 rounded-full text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#93AA91]" />
                    {patient.adherence}%
                  </span>
                </td>

                <td className="py-3 px-3 text-right">
                  <NutreLink
                    href={`/pacientes/${patient.id}`}
                    className="px-2.5 py-1.5 rounded-md bg-[#6846B5]/10 hover:bg-[#6846B5] hover:text-[#FFFFFF] text-[#6846B5] text-xs font-semibold transition-all inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span>Ver Prontuário</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NutreLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
