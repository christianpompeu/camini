import React from "react";
import Link from "next/link";
import { Download, SlidersHorizontal, UserPlus } from "lucide-react";
import { PatientMetricsStrip } from "@/components/nutre/patients/patient-metrics-strip";
import { PatientTable } from "@/components/nutre/patients/patient-table";

export default function NutrePatientsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="py-2 sm:py-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#7A7483] text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#6846B5] animate-pulse" />
            <span>Gestão Clínica de Prontuários</span>
            <span className="text-[#CBC3D4]">•</span>
            <span className="text-[#6846B5]">Base Ativa 2024.2</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl text-[#1D1928] font-bold tracking-tight">
            Pacientes
          </h1>

          <p className="text-xs sm:text-sm text-[#494552] max-w-2xl leading-relaxed">
            Gerencie o prontuário, evolução antropométrica, planos alimentares e contatos dos 84 pacientes ativos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            className="h-9 px-3.5 rounded-lg bg-[#FFFFFF] border border-[#EAE5F2] hover:bg-[#F8F1FF] text-[#1D1928] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#7A7483]" />
            <span>Exportar Lista</span>
          </button>

          <Link
            href="/nutre/pacientes/novo"
            className="h-9 px-4 rounded-lg bg-[#6846B5] hover:bg-[#57389B] text-[#FFFFFF] text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-2xs hover:scale-[1.01] active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Novo Paciente</span>
          </Link>
        </div>
      </section>

      {/* Quick Metrics Strip */}
      <PatientMetricsStrip />

      {/* Main Table with Filters */}
      <PatientTable />
    </div>
  );
}
