import React from "react";
import Link from "next/link";
import {
  UserPlus,
  ClipboardList,
  CalendarPlus,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { DashboardMetricsCards } from "@/components/nutre/dashboard/metrics-cards";
import { DashboardAgendaTimeline } from "@/components/nutre/dashboard/agenda-timeline";
import { DashboardRecentPatientsTable } from "@/components/nutre/dashboard/recent-patients-table";
import { DashboardClinicalAlerts } from "@/components/nutre/dashboard/clinical-alerts";
import { DashboardNutreLabCard } from "@/components/nutre/dashboard/nutre-lab-card";
import { DashboardQuickTools } from "@/components/nutre/dashboard/quick-tools";

export default function NutreDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Clinical Greeting & 3 Actions */}
      <section className="py-2 sm:py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EDE5FA] text-[#6846B5] text-[11px] font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6846B5] animate-pulse" />
              Consultório Ativo • Consultório 2
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[#7A7483] border border-[#EDE5FA] text-[11px]">
              <Info className="w-3 h-3 text-[#6846B5]" />
              Protótipo Demonstrativo
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl text-[#1D1928] font-bold tracking-tight">
            Bom dia, Dra. Camila Pompeu
          </h1>

          <p className="text-xs sm:text-sm text-[#494552] flex flex-wrap items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#7A7483]" />
            <span>Hoje, Quinta-feira, 24 de Outubro</span>
            <span className="text-[#CBC3D4]">•</span>
            <span className="font-semibold text-[#6846B5]">6 consultas agendadas</span>
            <span className="text-[#7A7483] font-normal">
              (1 paciente aguardando na recepção)
            </span>
          </p>
        </div>

        {/* 3 Prominent Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 xl:pt-0">
          <Link
            href="/nutre/pacientes/novo"
            className="h-10 px-4 rounded-lg bg-[#6846B5] hover:bg-[#57389B] text-[#FFFFFF] text-sm font-semibold flex items-center gap-2 shadow-2xs transition-all hover:scale-[1.01] active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Novo Paciente</span>
          </Link>

          <button
            type="button"
            className="h-10 px-3.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F8F1FF] text-[#6846B5] border border-[#6846B5]/30 text-sm font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>+ Novo Atendimento</span>
          </button>

          <button
            type="button"
            className="h-10 px-3.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F8F1FF] text-[#1D1928] border border-[#EAE5F2] text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4 text-[#7A7483]" />
            <span>Agendar Consulta</span>
          </button>
        </div>
      </section>

      {/* 4 Supporting Metric Cards */}
      <DashboardMetricsCards />

      {/* Main 2-Column Grid (8 / 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Agenda timeline & Recent patients */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardAgendaTimeline />
          <DashboardRecentPatientsTable />
        </div>

        {/* Right Column (4 cols): Alerts, Nutre Lab & Quick tools */}
        <div className="lg:col-span-4 space-y-6">
          <DashboardClinicalAlerts />
          <DashboardNutreLabCard />
          <DashboardQuickTools />
        </div>
      </div>
    </div>
  );
}
