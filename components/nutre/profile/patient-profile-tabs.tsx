"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Activity,
  Utensils,
  BookOpen,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
  ArrowRight,
  Plus,
  Send,
  MessageSquare,
  FileCheck,
  LineChart,
} from "lucide-react";
import { PatientDetail } from "@/types/nutre";

interface PatientProfileTabsProps {
  patient: PatientDetail;
}

export function PatientProfileTabs({ patient }: PatientProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("tab-overview");
  const [replyMessage, setReplyMessage] = useState("");
  const [sentReply, setSentReply] = useState(false);

  const tabs = [
    { id: "tab-overview", label: "Visão Geral & Resumo", icon: LayoutDashboard },
    {
      id: "tab-history",
      label: "Histórico de Consultas",
      icon: ClipboardList,
      badge: "3",
    },
    { id: "tab-anamnese", label: "Anamnese & Hábitos", icon: FileText },
    {
      id: "tab-anthropometry",
      label: "Avaliações & Antropometria",
      icon: Activity,
    },
    {
      id: "tab-mealplans",
      label: "Planos Alimentares",
      icon: Utensils,
      badge: "Preliminar",
    },
    {
      id: "tab-diary",
      label: "Diário & Acompanhamento",
      icon: LineChart,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Navigation Tabs Bar */}
      <div className="w-full bg-[#FFFFFF] rounded-xl shadow-2xs p-1.5 border border-[#EAE5F2] overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#6846B5] text-[#FFFFFF] shadow-2xs"
                    : "text-[#494552] hover:text-[#1D1928] hover:bg-[#F8F1FF]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#FFFFFF]" : "text-[#7A7483]"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-[#EDE5FA] text-[#6846B5]"
                        : "bg-[#F3EAFF] text-[#685490]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== ABA 1: VISÃO GERAL & RESUMO ==================== */}
      {activeTab === "tab-overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Resumo Executivo */}
            <section className="bg-[#FFFFFF] rounded-xl shadow-2xs p-5 sm:p-6 space-y-4 border border-[#EAE5F2]">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EDE5FA]/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EBDDFF] text-[#230E48] flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-[#6846B5]" />
                  </div>
                  <div>
                    <h2 className="font-heading text-base sm:text-lg font-semibold text-[#1D1928]">
                      Resumo Executivo da Última Consulta
                    </h2>
                    <span className="text-xs text-[#7A7483]">
                      Registrada em {patient.executiveSummary.lastConductDate} • Dra. Camila Ramos
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#EBDDFF] text-[#230E48] text-xs font-semibold">
                  Síntese de Conduta
                </span>
              </div>

              {/* Conduta descrita */}
              <div className="p-4 rounded-xl bg-[#F8F1FF] border border-[#EDE5FA] space-y-1.5">
                <div className="flex items-center gap-2 text-[#6846B5] font-semibold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Última conduta registrada (Síntese demonstrativa)</span>
                </div>
                <p className="text-xs sm:text-sm text-[#494552] leading-relaxed italic pl-1">
                  &ldquo;{patient.executiveSummary.summaryText}&rdquo;
                </p>
              </div>

              {/* Próximos Passos */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7483]">
                    Próximos Passos Acordados com a Paciente
                  </span>
                  <span className="text-xs font-semibold text-[#6846B5]">Metas do período</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {patient.executiveSummary.agreedSteps.map((step) => (
                    <div
                      key={step.title}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-[#F8F1FF]/80 text-xs text-[#1D1928] border border-[#EDE5FA]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#93AA91] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs">{step.title}</div>
                        <span className="text-[#6B6678] text-[11px] leading-snug block mt-0.5">
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Snapshot Compacto de Contatos */}
            <section className="bg-[#FFFFFF] rounded-xl shadow-2xs p-5 space-y-3 border border-[#EAE5F2]">
              <div className="flex items-center justify-between pb-2 border-b border-[#EDE5FA]/70">
                <h3 className="font-heading text-sm font-semibold text-[#1D1928] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#6846B5]" />
                  <span>Dados Cadastrais &amp; Contato Demonstrativo</span>
                </h3>
                <span className="text-[11px] text-[#7A7483]">Fictício</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#F8F1FF] border border-[#EDE5FA]/60">
                  <span className="text-[10px] text-[#7A7483] font-semibold uppercase tracking-wider block">
                    Telefone / WhatsApp
                  </span>
                  <span className="font-semibold text-xs text-[#1D1928] block mt-1 font-tabular">
                    {patient.phone}
                  </span>
                  <span className="text-[10px] text-[#93AA91] font-semibold">Contato principal</span>
                </div>

                <div className="p-3 rounded-lg bg-[#F8F1FF] border border-[#EDE5FA]/60">
                  <span className="text-[10px] text-[#7A7483] font-semibold uppercase tracking-wider block">
                    E-mail Cadastrado
                  </span>
                  <span className="font-semibold text-xs text-[#1D1928] block mt-1 truncate">
                    {patient.email}
                  </span>
                  <span className="text-[10px] text-[#7A7483]">Recebe planos em PDF</span>
                </div>

                <div className="p-3 rounded-lg bg-[#F8F1FF] border border-[#EDE5FA]/60">
                  <span className="text-[10px] text-[#7A7483] font-semibold uppercase tracking-wider block">
                    Localização
                  </span>
                  <span className="font-semibold text-xs text-[#1D1928] block mt-1">
                    {patient.address.city} - {patient.address.state}
                  </span>
                  <span className="text-[10px] text-[#7A7483]">{patient.attendanceMode}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Próximo Agendamento */}
            {patient.nextAppointment && (
              <section className="bg-[#6846B5] text-[#FFFFFF] rounded-xl shadow-md p-5 space-y-3 relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/20 text-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider">
                      Próxima Consulta
                    </span>
                    <Clock className="w-4 h-4 text-[#E9DDFF]" />
                  </div>

                  <div>
                    <div className="font-heading text-2xl font-bold tracking-tight">
                      {patient.nextAppointment.time}
                    </div>
                    <p className="text-xs text-[#E9DDFF] opacity-90 mt-0.5">
                      {patient.nextAppointment.date} • {patient.nextAppointment.mode} • {patient.nextAppointment.room}
                    </p>
                  </div>

                  <p className="text-xs text-[#FFFFFF]/80 leading-relaxed">
                    {patient.nextAppointment.statusText}
                  </p>

                  <button
                    type="button"
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-[#FFFFFF] text-[#6846B5] hover:bg-[#F8F1FF] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>Abrir Ficha do Atendimento</span>
                  </button>
                </div>
              </section>
            )}

            {/* Card Síntese do Acompanhamento */}
            <section className="bg-[#FFFFFF] rounded-xl shadow-2xs p-5 space-y-3 border border-[#EAE5F2]">
              <div className="flex items-center justify-between border-b border-[#EDE5FA]/70 pb-2">
                <h3 className="font-heading text-sm font-semibold text-[#1D1928] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#6846B5]" />
                  <span>Indicadores Fictícios</span>
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#D1E9CE] text-[#0C200F] text-[10px] font-semibold">
                  Sem valor clínico
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F1FF] border border-[#EDE5FA]/60">
                  <span className="text-[#494552]">Adesão ao Diário</span>
                  <span className="font-bold text-[#1D1928] font-tabular">
                    {patient.metrics.diaryAdherence}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F1FF] border border-[#EDE5FA]/60">
                  <span className="text-[#494552]">Meta de Hidratação</span>
                  <span className="font-bold text-[#1D1928] font-tabular">
                    {patient.metrics.hydrationGoal}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F1FF] border border-[#EDE5FA]/60">
                  <span className="text-[#494552]">Atendimentos Realizados</span>
                  <span className="font-bold text-[#1D1928] font-tabular">
                    {patient.metrics.completedSessions}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ==================== ABA 2: HISTÓRICO DE CONSULTAS ==================== */}
      {activeTab === "tab-history" && (
        <section className="bg-[#FFFFFF] rounded-xl shadow-2xs p-5 sm:p-6 space-y-4 border border-[#EAE5F2] animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EDE5FA]/70">
            <div>
              <h2 className="font-heading text-base sm:text-lg font-semibold text-[#1D1928]">
                Histórico de Consultas Demonstrativas
              </h2>
              <span className="text-xs text-[#7A7483]">
                Registro cronológico fictício das consultas realizadas com {patient.name}
              </span>
            </div>

            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[#6846B5] text-[#FFFFFF] text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-[#57389B] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Nova Consulta</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#EDE5FA]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F1FF] font-semibold uppercase text-[10px] tracking-wider text-[#7A7483]">
                <tr>
                  <th className="py-2.5 px-3">Atendimento</th>
                  <th className="py-2.5 px-3">Data &amp; Hora</th>
                  <th className="py-2.5 px-3">Modalidade</th>
                  <th className="py-2.5 px-3">Profissional</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE5FA]/60">
                {patient.consultationHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8F1FF]/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#1D1928]">{item.title}</td>
                    <td className="py-3 px-3 text-[#494552] font-tabular">{item.dateTime}</td>
                    <td className="py-3 px-3 text-[#494552]">{item.mode}</td>
                    <td className="py-3 px-3 text-[#494552]">{item.practitioner}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#D1E9CE] text-[#0C200F] text-[10px] font-semibold">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        className="text-[#6846B5] hover:underline font-semibold"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ==================== ABA 3: ANAMNESE & HÁBITOS ==================== */}
      {activeTab === "tab-anamnese" && (
        <section className="bg-[#FFFFFF] rounded-xl shadow-2xs p-5 sm:p-6 space-y-4 border border-[#EAE5F2] animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EDE5FA]/70">
            <div>
              <h2 className="font-heading text-base sm:text-lg font-semibold text-[#1D1928]">
                Anamnese &amp; Hábitos Clínicos
              </h2>
              <span className="text-xs text-[#7A7483]">
                Mapeamento de histórico patológico, alimentar e rotina
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#F8F1FF] text-[#494552] text-xs font-semibold">
              Demonstrativo
            </span>
          </div>

          {/* Structured Pending Box */}
          <div className="p-8 sm:p-12 rounded-xl bg-[#F8F1FF] border border-dashed border-[#CBC3D4] flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EDE5FA] flex items-center justify-center text-[#6846B5]">
              <Clock className="w-6 h-6" />
            </div>

            <div className="max-w-md space-y-1">
              <h3 className="font-heading text-sm sm:text-base font-semibold text-[#1D1928]">
                Aguardando pesquisa de campo com a nutricionista
              </h3>
              <p className="text-xs text-[#6B6678] leading-relaxed">
                Os formulários específicos de anamnese alimentar, histórico familiar e rastreamento metabólico serão integrados na próxima iteração após alinhamento com a Dra. Camila Ramos.
              </p>
            </div>

            <button
              type="button"
              className="mt-2 px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#EDE5FA] text-[#6846B5] font-semibold text-xs border border-[#EAE5F2] shadow-2xs transition-colors"
            >
              Pré-visualizar Modelo Padrão de Formulário
            </button>
          </div>
        </section>
      )}

      {/* ==================== ABA 4: AVALIAÇÕES & ANTROPOMETRIA ==================== */}
      {activeTab === "tab-anthropometry" && (
        <section className="bg-[#FFFFFF] rounded-xl shadow-2xs p-5 sm:p-6 space-y-4 border border-[#EAE5F2] animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EDE5FA]/70">
            <div>
              <h2 className="font-heading text-base sm:text-lg font-semibold text-[#1D1928]">
                Avaliações &amp; Antropometria
              </h2>
              <span className="text-xs text-[#7A7483]">
                Curvas conceituais de acompanhamento antropométrico
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#FFDAD6] text-[#93000A] text-xs font-semibold">
              Sem simulação diagnóstica
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F1FF] border border-[#EDE5FA] text-xs text-[#6B6678] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#6846B5] shrink-0" />
            <span>
              Aviso: Gráficos e indicadores abaixo representam apenas placeholders conceituais de layout para prototipagem.
            </span>
          </div>

          {/* SVG Conceptual Trajectory Chart */}
          <div className="w-full bg-[#F8F1FF] p-5 rounded-xl space-y-3 border border-[#EDE5FA]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1D1928]">
                Placeholder de Trajetória Antropométrica
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-[#6846B5]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6846B5] inline-block" /> Parâmetro A (Conceitual)
                </span>
                <span className="flex items-center gap-1 font-semibold text-[#93AA91]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#93AA91] inline-block" /> Parâmetro B (Conceitual)
                </span>
              </div>
            </div>

            <div className="h-40 w-full flex items-end">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 540 140"
                fill="none"
                preserveAspectRatio="none"
              >
                <line x1="0" y1="20" x2="540" y2="20" stroke="#EDE5FA" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="540" y2="70" stroke="#EDE5FA" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="540" y2="120" stroke="#EDE5FA" strokeDasharray="3 3" />
                <path
                  d="M 40 95 C 150 82, 300 68, 490 35"
                  stroke="#6846B5"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-70"
                />
                <circle cx="40" cy="95" r="4" fill="#FFFFFF" stroke="#6846B5" strokeWidth="2" />
                <circle cx="270" cy="72" r="4" fill="#FFFFFF" stroke="#6846B5" strokeWidth="2" />
                <circle cx="490" cy="35" r="4" fill="#FFFFFF" stroke="#6846B5" strokeWidth="2" />

                <path
                  d="M 40 40 C 150 65, 300 85, 490 115"
                  stroke="#93AA91"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-70"
                />
                <circle cx="40" cy="40" r="4" fill="#FFFFFF" stroke="#93AA91" strokeWidth="2" />
                <circle cx="270" cy="78" r="4" fill="#FFFFFF" stroke="#93AA91" strokeWidth="2" />
                <circle cx="490" cy="115" r="4" fill="#FFFFFF" stroke="#93AA91" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex justify-between text-xs text-[#7A7483] font-tabular pt-1 border-t border-[#EDE5FA]">
              <span>Marco 01 (Demonstrativo)</span>
              <span>Marco 02 (Demonstrativo)</span>
              <span>Marco 03 (Demonstrativo)</span>
            </div>
          </div>
        </section>
      )}

      {/* ==================== ABA 5: PLANOS ALIMENTARES ==================== */}
      {activeTab === "tab-mealplans" && (
        <section className="bg-[#FFFFFF] rounded-xl shadow-2xs p-5 sm:p-6 space-y-4 border border-[#EAE5F2] animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EDE5FA]/70">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base sm:text-lg font-semibold text-[#1D1928]">
                  Planos Alimentares (Estrutura Preliminar)
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#F8F1FF] text-[#494552] text-[10px] font-semibold border border-[#EDE5FA]">
                  Sem prescrições médicas ativas
                </span>
              </div>
              <span className="text-xs text-[#7A7483]">
                Esboço demonstrativo da distribuição de horários e grupos alimentares
              </span>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 rounded-lg bg-[#F8F1FF] hover:bg-[#EDE5FA] text-[#6846B5] font-semibold text-xs border border-[#EAE5F2] transition-colors"
            >
              Criar Nova Versão de Plano
            </button>
          </div>

          <div className="space-y-2.5">
            {patient.mealPlan.map((meal) => (
              <div
                key={meal.id}
                className="p-4 rounded-xl bg-[#F8F1FF] flex flex-col md:flex-row md:items-center justify-between gap-3 border border-[#EDE5FA]/70"
              >
                <div className="flex items-start md:items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#EDE5FA] text-[#6846B5] flex items-center justify-center text-xs font-bold font-tabular shrink-0">
                    {meal.number}
                  </span>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-[#1D1928]">
                      {meal.time} • {meal.title}
                    </div>
                    <p className="text-xs text-[#494552] mt-0.5">{meal.description}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded bg-[#EDE5FA] text-[#230E48] text-xs font-semibold font-tabular self-start md:self-center shrink-0">
                  {meal.mealTag}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== ABA 6: DIÁRIO & ACOMPANHAMENTO ==================== */}
      {activeTab === "tab-diary" && (
        <section className="bg-[#FFFFFF] rounded-xl shadow-2xs p-5 sm:p-6 space-y-4 border border-[#EAE5F2] animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EDE5FA]/70">
            <div>
              <h2 className="font-heading text-base sm:text-lg font-semibold text-[#1D1928]">
                Diário &amp; Acompanhamento de Adesão
              </h2>
              <span className="text-xs text-[#7A7483]">
                Visualização demonstrativa de engajamento da paciente no app mobile Nutre
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#D1E9CE] text-[#0C200F] text-xs font-semibold">
              Adesão Registrada
            </span>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#F8F1FF] border border-[#EDE5FA]">
              <span className="text-[10px] uppercase tracking-wider text-[#7A7483] font-semibold">
                Frequência Semanal
              </span>
              <div className="font-heading text-xl font-bold text-[#1D1928] mt-1">
                {patient.diaryEngagement.weeklyFrequency}
              </div>
              <span className="text-[11px] text-[#93AA91] font-medium">Registro regular</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F1FF] border border-[#EDE5FA]">
              <span className="text-[10px] uppercase tracking-wider text-[#7A7483] font-semibold">
                Consumo Hídrico Estimado
              </span>
              <div className="font-heading text-xl font-bold text-[#1D1928] mt-1">
                {patient.diaryEngagement.hydrationRate}
              </div>
              <span className="text-[11px] text-[#6846B5] font-medium">Atinge meta clínica</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F1FF] border border-[#EDE5FA]">
              <span className="text-[10px] uppercase tracking-wider text-[#7A7483] font-semibold">
                Dúvidas ao Nutricionista
              </span>
              <div className="font-heading text-xl font-bold text-[#1D1928] mt-1">
                {patient.diaryEngagement.pendingDoubts} Pendente
              </div>
              <span className="text-[11px] text-[#7A7483]">Enviada via chat do app</span>
            </div>
          </div>

          {/* Chat message from patient */}
          <div className="p-4 rounded-xl bg-[#F3EAFF] border border-[#EDE5FA] space-y-2.5">
            <div className="flex items-center gap-2 text-[#6846B5] font-semibold text-xs">
              <MessageSquare className="w-4 h-4" />
              <span>Mensagem recente da paciente (Demonstração):</span>
            </div>

            <p className="text-xs sm:text-sm text-[#494552] italic pl-6 leading-relaxed">
              &ldquo;{patient.diaryEngagement.recentMessage}&rdquo;
            </p>

            <div className="pl-6 pt-1 space-y-2">
              {sentReply ? (
                <div className="p-2.5 rounded-lg bg-[#D1E9CE] text-[#0C200F] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#354935]" />
                  <span>Resposta simulada enviada com sucesso no ambiente demonstrativo!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 max-w-lg">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Digite uma orientação rápida..."
                    className="h-8 px-3 rounded-lg bg-[#FFFFFF] border border-[#CBC3D4] text-xs text-[#1D1928] flex-1 focus:outline-none focus:border-[#6846B5]"
                  />
                  <button
                    type="button"
                    onClick={() => setSentReply(true)}
                    className="h-8 px-3 rounded-lg bg-[#6846B5] hover:bg-[#57389B] text-[#FFFFFF] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
