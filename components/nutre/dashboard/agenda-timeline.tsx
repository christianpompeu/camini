import React from "react";
import Link from "next/link";
import {
  Calendar,
  Filter,
  Check,
  CheckCircle2,
  FileText,
  Activity,
  FolderOpen,
  Scale,
  Play,
  ArrowRight,
} from "lucide-react";
import { MOCK_TODAY_AGENDA } from "@/data/nutre/mock-agenda";

export function DashboardAgendaTimeline() {
  return (
    <section className="rounded-xl bg-[#FFFFFF] shadow-2xs p-5 sm:p-6 border border-[#EAE5F2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EDE5FA]/70 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#6846B5]" />
            <h2 className="font-heading text-lg font-semibold text-[#1D1928]">
              Agenda do Dia &amp; Atendimentos
            </h2>
          </div>
          <p className="text-xs text-[#6B6678] mt-0.5">
            Sequência cronológica com status visual e chamada rápida de atendimento.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            className="px-2.5 py-1 rounded-md bg-[#F8F1FF] hover:bg-[#F3EAFF] text-[#494552] text-xs font-medium flex items-center gap-1 transition-colors border border-[#EDE5FA]"
          >
            <Filter className="w-3.5 h-3.5 text-[#7A7483]" />
            <span>Filtrar</span>
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded-md bg-[#EBDDFF] hover:bg-[#D3BBFF] text-[#230E48] text-xs font-semibold transition-colors"
          >
            Ver Semana
          </button>
        </div>
      </div>

      {/* Timeline Items */}
      <div className="space-y-3 pt-4">
        {MOCK_TODAY_AGENDA.map((item) => {
          if (item.isNextInLine) {
            // Highlighted "Paciente da Vez" (Beatriz Nogueira)
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#F8F1FF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden border-2 border-[#6846B5]/40"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#6846B5]" />
                <div className="flex items-start md:items-center gap-3 pl-1">
                  <span className="font-tabular font-bold text-[#6846B5] w-12 pt-0.5 md:pt-0 text-sm">
                    {item.time}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-[#EBDDFF] text-[#230E48] flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-[#6846B5]">
                    {item.patientInitials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/nutre/pacientes/${item.patientId}`}
                        className="font-bold text-sm text-[#1D1928] hover:text-[#6846B5] transition-colors"
                      >
                        {item.patientName}
                      </Link>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBDDFF] text-[#230E48] text-[11px] font-semibold shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-[#6846B5] animate-ping" />
                        Em espera na recepção ({item.waitTime})
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#E9DDFF] text-[#23005C] font-semibold">
                        Paciente da Vez
                      </span>
                    </div>
                    <p className="text-xs text-[#494552] mt-0.5">
                      {item.type} • {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <Link
                    href={`/nutre/pacientes/${item.patientId}`}
                    className="h-10 px-4 rounded-lg bg-[#6846B5] hover:bg-[#57389B] text-[#FFFFFF] text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Iniciar Atendimento</span>
                  </Link>
                </div>
              </div>
            );
          }

          const isCompleted = item.status === "concluida";

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F8F1FF]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 border border-[#EAE5F2]"
            >
              <div className="flex items-start md:items-center gap-3">
                <span
                  className={`font-tabular text-xs font-semibold w-12 pt-0.5 md:pt-0 ${
                    isCompleted ? "text-[#7A7483]" : "text-[#1D1928]"
                  }`}
                >
                  {item.time}
                </span>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCompleted
                      ? "bg-[#D1E9CE] text-[#0C200F]"
                      : "bg-[#F3EAFF] text-[#6846B5]"
                  }`}
                >
                  {item.patientInitials}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/nutre/pacientes/${item.patientId}`}
                      className="font-semibold text-sm text-[#1D1928] hover:text-[#6846B5] transition-colors"
                    >
                      {item.patientName}
                    </Link>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D1E9CE] text-[#0C200F] text-[10px] font-semibold">
                        <Check className="w-3 h-3 text-[#354935]" /> Concluída
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EDE5FA] text-[#494552] text-[10px] font-medium">
                        <CheckCircle2 className="w-3 h-3 text-[#93AA91]" /> Confirmado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B6678]">
                    {item.type} • {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <Link
                  href={`/nutre/pacientes/${item.patientId}`}
                  className="h-8 px-2.5 rounded-md bg-[#F8F1FF] hover:bg-[#EDE5FA] text-[#1D1928] text-xs font-medium flex items-center gap-1.5 transition-colors border border-[#EAE5F2]"
                >
                  {item.actionIcon === "FileText" && <FileText className="w-3.5 h-3.5 text-[#6846B5]" />}
                  {item.actionIcon === "Activity" && <Activity className="w-3.5 h-3.5 text-[#93AA91]" />}
                  {item.actionIcon === "FolderOpen" && <FolderOpen className="w-3.5 h-3.5 text-[#7A7483]" />}
                  {item.actionIcon === "Scale" && <Scale className="w-3.5 h-3.5 text-[#6846B5]" />}
                  <span>{item.actionLabel}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
