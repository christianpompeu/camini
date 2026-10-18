"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  Share2,
  Stethoscope,
  CalendarPlus,
  ChevronDown,
  Printer,
  Smartphone,
  FileDown,
  Info,
  ShieldCheck,
} from "lucide-react";
import { PatientDetail } from "@/types/nutre";

interface PatientProfileHeaderProps {
  patient: PatientDetail;
}

export function PatientProfileHeader({ patient }: PatientProfileHeaderProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showActionToast, setShowActionToast] = useState<string | null>(null);

  const handleActionClick = (msg: string) => {
    setIsActionsOpen(false);
    setShowActionToast(msg);
    setTimeout(() => setShowActionToast(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Action Toast */}
      {showActionToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-[#6846B5] text-[#FFFFFF] shadow-xl border border-[#EBDDFF] text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          {showActionToast}
        </div>
      )}

      {/* Demonstrative Environment Notice */}
      <div className="px-4 py-2.5 rounded-xl bg-[#EDE5FA]/70 border border-[#CBC3D4]/60 flex items-center justify-between gap-3 text-[#1D1928]">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#6846B5] shrink-0" />
          <span className="text-xs text-[#494552]">
            <strong className="font-semibold text-[#1D1928]">Ambiente de Prototipagem:</strong>{" "}
            Dados fictícios para estruturação e validação de interface — Sem condutas ou diagnósticos clínicos reais.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFFFFF] text-[#7A7483] border border-[#EDE5FA] shrink-0 hidden sm:inline-block">
          Modo Demonstração
        </span>
      </div>

      {/* Breadcrumbs & Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-[#6B6678]">
          <Link
            href="/nutre/pacientes"
            className="hover:text-[#6846B5] transition-colors flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pacientes</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#CBC3D4]" />
          <span className="text-[#1D1928] font-semibold">{patient.name}</span>
          <span className="px-1.5 py-0.5 rounded bg-[#F8F1FF] text-[#685490] font-tabular font-semibold text-[11px] border border-[#EDE5FA]">
            ID #{patient.code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D1E9CE] text-[#0C200F] text-xs font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#93AA91]" />
            Prontuário Ativo (Demonstrativo)
          </span>

          <button
            type="button"
            onClick={() => handleActionClick("Link de compartilhamento copiado (Demonstrativo)!")}
            className="px-2.5 py-1 rounded-lg bg-[#F8F1FF] text-[#494552] hover:text-[#1D1928] hover:bg-[#EDE5FA] transition-colors text-xs font-medium flex items-center gap-1 border border-[#EAE5F2] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Refined Patient Card */}
      <section className="w-full bg-[#FFFFFF] rounded-xl shadow-2xs p-5 sm:p-6 flex flex-col gap-4 border border-[#EAE5F2]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EBDDFF] text-[#230E48] font-heading text-xl sm:text-2xl flex items-center justify-center font-bold tracking-tight shadow-inner">
                {patient.avatarInitials}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#D1E9CE] text-[#0C200F] text-[9px] font-bold tracking-wider uppercase border border-[#B5CDB2]">
                Ativo
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-xl sm:text-2xl text-[#1D1928] font-bold tracking-tight">
                  {patient.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#D1E9CE] text-[#0C200F] text-xs font-semibold">
                  Em acompanhamento
                </span>
                <span className="px-2 py-0.5 rounded bg-[#F8F1FF] text-[#685490] font-tabular text-[11px] font-semibold border border-[#EDE5FA]">
                  ID #{patient.code}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B6678]">
                <span>
                  {patient.age} anos ({patient.birthDate})
                </span>
                <span className="text-[#CBC3D4]">•</span>
                <span>{patient.occupation}</span>
                <span className="text-[#CBC3D4]">•</span>
                <span>Última consulta: {patient.lastConsultation}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={() => handleActionClick("Atendimento demonstrativo iniciado!")}
              className="px-4 py-2 rounded-lg bg-[#6846B5] hover:bg-[#57389B] text-[#FFFFFF] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Iniciar Atendimento Demonstrativo</span>
            </button>

            <button
              type="button"
              onClick={() => handleActionClick("Janela de agendamento aberta (Demonstrativo)!")}
              className="px-3.5 py-2 rounded-lg bg-[#F8F1FF] hover:bg-[#EDE5FA] text-[#1D1928] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors border border-[#EAE5F2] cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4 text-[#6846B5]" />
              <span>Agendar Consulta</span>
            </button>

            {/* Dropdown Mais Opções */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="px-3 py-2 rounded-lg bg-[#F8F1FF] hover:bg-[#EDE5FA] text-[#494552] text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors border border-[#EAE5F2] cursor-pointer"
              >
                <span>Mais Opções</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#7A7483]" />
              </button>

              {isActionsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsActionsOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-52 bg-[#FFFFFF] rounded-xl shadow-lg border border-[#EAE5F2] p-1.5 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => handleActionClick("Comando de impressão enviado.")}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#1D1928] hover:bg-[#F8F1FF] font-medium transition-colors text-left cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-[#7A7483]" />
                      <span>Imprimir prontuário</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionClick("Convite do app reenviado.")}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#1D1928] hover:bg-[#F8F1FF] font-medium transition-colors text-left cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-[#7A7483]" />
                      <span>Enviar link do app</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionClick("Download do PDF demonstrativo iniciado.")}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#1D1928] hover:bg-[#F8F1FF] font-medium transition-colors text-left cursor-pointer"
                    >
                      <FileDown className="w-4 h-4 text-[#7A7483]" />
                      <span>Exportar PDF demonstrativo</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
