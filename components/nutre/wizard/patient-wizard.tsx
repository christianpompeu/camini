"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  X,
  Badge,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  MapPin,
  Building2,
  Video,
  Edit,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { WizardFormData } from "@/types/nutre";
import { useNutreNavigation } from "@/components/nutre/nutre-navigation-context";

export function PatientWizard() {
  const router = useRouter();
  const { resolveUrl, push } = useNutreNavigation();
  const [, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const [formData, setFormData] = useState<WizardFormData>({
    fullName: "Beatriz Helena Nogueira",
    preferredName: "Bia Nogueira",
    birthDate: "1995-05-14",
    biologicalSex: "Feminino",
    cpf: "342.891.208-11",
    occupation: "Arquiteta e Urbanista • Modelo Híbrido",
    maritalStatus: "Solteira (Mora sozinha)",
    phone: "(11) 98721-4321",
    whatsappAuto: true,
    email: "beatriz.nogueira@exemplo.com.br",
    patientApp: true,
    cep: "04538-132",
    street: "Rua Joaquim Floriano",
    number: "820, Apto 114",
    neighborhood: "Itaim Bibi",
    city: "São Paulo",
    state: "SP",
    attendanceMode: "Presencial no Consultório",
    primaryGoal: "Emagrecimento & Definição Corporal",
    referralSource: "Indicação de outro paciente (Boca a boca)",
    adminNotes:
      "Paciente relata que já realizou dietas restritivas no passado e prefere prescrições sem contagem obsessiva de gramas na primeira fase. Solicita recibo discriminado para reembolso.",
  });

  // Calculate age dynamically
  const calculateAge = (dateStr: string) => {
    if (!dateStr) return { age: 29, label: "29 anos • Adulto Jovem" };
    const birth = new Date(dateStr);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return {
      age,
      label: `${age} anos • ${age < 18 ? "Menor de idade" : age < 60 ? "Adulto" : "Idoso"}`,
    };
  };

  const computedAge = calculateAge(formData.birthDate);

  const handleInputChange = (
    field: keyof WizardFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const simulateCepLookup = () => {
    setFormData((prev) => ({
      ...prev,
      street: "Rua Joaquim Floriano",
      neighborhood: "Itaim Bibi",
      city: "São Paulo",
      state: "SP",
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Nome completo é obrigatório.";
      }
      if (!formData.birthDate) {
        newErrors.birthDate = "Data de nascimento é obrigatória.";
      }
      if (!formData.cpf.trim()) {
        newErrors.cpf = "CPF é obrigatório.";
      }
    } else if (step === 2) {
      if (!formData.phone.trim()) {
        newErrors.phone = "Telefone celular é obrigatório.";
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        newErrors.email = "E-mail válido é obrigatório.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdvance = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Step 4 final action - Show explicit demonstrative completion dialog
      setShowFinishModal(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      startTransition(() => {
        push("/pacientes");
      });
    }
  };

  const handleDraftClick = () => {
    setShowDraftToast(true);
    setTimeout(() => setShowDraftToast(false), 3000);
  };

  const stepMeta = [
    { num: 1, title: "1. Dados Pessoais", sub: "Identificação e bio" },
    { num: 2, title: "2. Contatos & Canais", sub: "WhatsApp, e-mail e endereço" },
    { num: 3, title: "3. Info de Entrada", sub: "Modalidade e objetivo" },
    { num: 4, title: "4. Revisão & Confirmação", sub: "Resumo demonstrativo" },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification */}
      {showDraftToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-[#6846B5] text-[#FFFFFF] shadow-xl border border-[#EBDDFF] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Bookmark className="w-5 h-5 text-[#EBDDFF]" />
          <div className="text-xs">
            <div className="font-bold">Rascunho Demonstrativo Salvo</div>
            <div className="text-[#EDE5FA]">Os dados preenchidos foram preservados na sessão.</div>
          </div>
        </div>
      )}

      {/* Header & Meta */}
      <section className="py-2 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6B6678]">
            <Link href={resolveUrl("/nutre/pacientes")} className="hover:text-[#6846B5] transition-colors">
              Pacientes
            </Link>
            <span className="text-[#CBC3D4]">/</span>
            <span className="text-[#1D1928] font-semibold">Novo Cadastro</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBDDFF] text-[#230E48] text-[11px] font-bold tracking-wide uppercase">
              ETAPA {currentStep} DE 4 — {stepMeta[currentStep - 1].title.toUpperCase().replace(/^\d+\.\s*/, "")}
            </span>
            <span className="text-xs text-[#7A7483] flex items-center gap-1 bg-[#FFFFFF] px-2.5 py-0.5 rounded-full border border-[#EAE5F2]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#6846B5]" />
              Protótipo Demonstrativo — Sem persistência real de dados
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl text-[#1D1928] font-bold tracking-tight">
            Cadastrar Novo Paciente
          </h1>

          <p className="text-xs sm:text-sm text-[#494552] max-w-3xl leading-relaxed">
            Preencha os dados cadastrais para abrir o prontuário eletrônico. A anamnese clínica detalhada e o plano alimentar serão consolidados durante a consulta inicial.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start lg:self-center">
          <button
            type="button"
            onClick={handleDraftClick}
            className="h-9 px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F8F1FF] text-[#494552] hover:text-[#1D1928] text-xs font-semibold flex items-center gap-1.5 border border-[#EAE5F2] shadow-2xs transition-all cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#6846B5]" />
            <span>Salvar Rascunho</span>
          </button>

          <Link
            href={resolveUrl("/nutre/pacientes")}
            className="h-9 px-3 rounded-lg text-[#7A7483] hover:text-[#1D1928] hover:bg-[#F8F1FF] text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Cancelar e voltar</span>
          </Link>
        </div>
      </section>

      {/* Visual Stepper Tabs */}
      <section className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE5F2] shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stepMeta.map((step) => {
            const isCurrent = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  if (step.num < currentStep || validateStep(currentStep)) {
                    setCurrentStep(step.num);
                  }
                }}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer border ${isCurrent
                    ? "bg-[#F8F1FF] border-[#B8A1E3] shadow-2xs"
                    : "border-transparent hover:bg-[#F8F1FF]/50"
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-tabular text-xs font-bold shrink-0 transition-colors ${isCurrent
                      ? "bg-[#6846B5] text-[#FFFFFF]"
                      : isCompleted
                        ? "bg-[#D1E9CE] text-[#0C200F]"
                        : "bg-[#F3EAFF] text-[#7A7483]"
                    }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-[#354935]" /> : step.num}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-semibold truncate ${isCurrent ? "text-[#6846B5]" : "text-[#1D1928]"
                      }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11px] text-[#7A7483] truncate">{step.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-[#F3EAFF] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#6846B5] h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </section>

      {/* ==================== ETAPA 1: DADOS PESSOAIS ==================== */}
      {currentStep === 1 && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-xl bg-[#FFFFFF] p-5 sm:p-7 shadow-2xs border border-[#EAE5F2] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-[#EDE5FA]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBDDFF] flex items-center justify-center text-[#230E48] font-bold text-xs">
                  01
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-[#1D1928]">
                    Etapa 1: Dados Pessoais
                  </h2>
                  <p className="text-xs text-[#6B6678]">
                    Parâmetros essenciais para o prontuário eletrônico e relatórios clínicos.
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-[#6846B5] bg-[#F8F1FF] px-2.5 py-1 rounded-full border border-[#EDE5FA]">
                Ambiente de demonstração • Dados fictícios
              </span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Nome Completo */}
              <div className="md:col-span-7 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="fullName">
                  Nome Completo do(a) Paciente <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Ex: Beatriz Helena Nogueira"
                  className={`h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border ${errors.fullName ? "border-[#BA1A1A] ring-1 ring-[#BA1A1A]" : "border-[#EAE5F2]"
                    } focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] transition-all`}
                />
                {errors.fullName ? (
                  <span className="text-[11px] text-[#BA1A1A] font-medium">{errors.fullName}</span>
                ) : (
                  <span className="text-[11px] text-[#7A7483]">
                    Conforme documento oficial para prescrições e atestados.
                  </span>
                )}
              </div>

              {/* Nome Social */}
              <div className="md:col-span-5 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="preferredName">
                  Como prefere ser chamado(a) <span className="text-[#7A7483] font-normal">(Opcional)</span>
                </label>
                <input
                  id="preferredName"
                  type="text"
                  value={formData.preferredName}
                  onChange={(e) => handleInputChange("preferredName", e.target.value)}
                  placeholder="Ex: Bia"
                  className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] transition-all"
                />
                <span className="text-[11px] text-[#7A7483]">
                  Será utilizado na comunicação pelo WhatsApp e no aplicativo.
                </span>
              </div>

              {/* Data de Nascimento */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="birthDate">
                  Data de Nascimento <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  className={`h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] font-tabular border ${errors.birthDate ? "border-[#BA1A1A] ring-1 ring-[#BA1A1A]" : "border-[#EAE5F2]"
                    } focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] transition-all`}
                />
                <div className="flex items-center gap-1.5 text-xs text-[#6846B5] font-semibold font-tabular">
                  <span>{computedAge.label}</span>
                </div>
              </div>

              {/* Sexo Biológico */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]">
                  Gênero / Sexo Biológico <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="flex items-center gap-1 h-10 p-1 rounded-lg bg-[#F8F1FF] border border-[#EAE5F2]">
                  {(["Feminino", "Masculino", "Outro"] as const).map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      onClick={() => handleInputChange("biologicalSex", sex)}
                      className={`flex-1 h-full rounded-md text-xs font-semibold transition-all cursor-pointer ${formData.biologicalSex === sex
                          ? "bg-[#FFFFFF] text-[#6846B5] shadow-2xs border border-[#EDE5FA]"
                          : "text-[#7A7483] hover:text-[#1D1928]"
                        }`}
                    >
                      {sex}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-[#7A7483]">
                  Utilizado para cálculo da taxa metabólica basal.
                </span>
              </div>

              {/* CPF */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="cpf">
                  CPF <span className="text-[#BA1A1A]">*</span>
                </label>
                <input
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  className={`h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] font-tabular border ${errors.cpf ? "border-[#BA1A1A] ring-1 ring-[#BA1A1A]" : "border-[#EAE5F2]"
                    } focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] transition-all`}
                />
                <span className="text-[11px] text-[#7A7483]">
                  Utilizado para emissão de recibos e notas fiscais de saúde.
                </span>
              </div>

              {/* Profissão */}
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="occupation">
                  Profissão / Atividade Principal
                </label>
                <input
                  id="occupation"
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  placeholder="Ex: Arquiteta e Urbanista"
                  className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] transition-all"
                />
                <span className="text-[11px] text-[#7A7483]">
                  Relevante para estimativa do fator de atividade física diária (PAL).
                </span>
              </div>

              {/* Estado Civil */}
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="maritalStatus">
                  Estado Civil / Rotina Familiar
                </label>
                <select
                  id="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] cursor-pointer transition-all"
                >
                  <option value="Solteira (Mora sozinha)">Solteira (Mora sozinha / Cozinha suas refeições)</option>
                  <option value="Casada / União Estável">Casada / União Estável (Refeições compartilhadas)</option>
                  <option value="Com filhos na rotina doméstica">Com filhos na rotina doméstica</option>
                  <option value="Outro perfil familiar">Outro perfil domiciliar</option>
                </select>
                <span className="text-[11px] text-[#7A7483]">
                  Ajuda na personalização das porções para a despensa da paciente.
                </span>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-4 rounded-xl bg-[#F8F1FF] border-l-4 border-l-[#6846B5] border border-[#EDE5FA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#6846B5] shadow-2xs shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1D1928]">Identificação Unívoca da Paciente</h4>
                <p className="text-[11px] text-[#6B6678]">
                  Os dados são protegidos por criptografia e isolamento modular.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FFFFFF] text-[#6846B5] font-tabular text-xs font-bold shadow-2xs border border-[#EDE5FA] shrink-0">
              Prontuário #NUT-2024-0189
            </span>
          </div>
        </section>
      )}

      {/* ==================== ETAPA 2: CONTATOS & NOTIFICAÇÕES ==================== */}
      {currentStep === 2 && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-xl bg-[#FFFFFF] p-5 sm:p-7 shadow-2xs border border-[#EAE5F2] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-[#EDE5FA]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBDDFF] flex items-center justify-center text-[#230E48] font-bold text-xs">
                  02
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-[#1D1928]">
                    Etapa 2: Contatos &amp; Canais
                  </h2>
                  <p className="text-xs text-[#6B6678]">
                    Canais de contato, preferências e endereço residencial demonstrativo.
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-[#93AA91] bg-[#D1E9CE]/50 px-2.5 py-1 rounded-full font-semibold">
                Preferências ativas
              </span>
            </div>

            {/* Contacts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* WhatsApp */}
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="phone">
                  WhatsApp / Celular Principal <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#93AA91]" />
                  <input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 90000-0000"
                    className={`h-10 pl-9 pr-3 w-full rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] font-tabular border ${errors.phone ? "border-[#BA1A1A] ring-1 ring-[#BA1A1A]" : "border-[#EAE5F2]"
                      } focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] transition-all`}
                  />
                </div>
                {errors.phone && (
                  <span className="text-[11px] text-[#BA1A1A] font-medium">{errors.phone}</span>
                )}

                {/* Auto WhatsApp Toggle */}
                <div className="mt-2 p-3 rounded-lg bg-[#F8F1FF] flex items-start gap-2.5 border border-[#EDE5FA]/60">
                  <input
                    id="whatsappAuto"
                    type="checkbox"
                    checked={formData.whatsappAuto}
                    onChange={(e) => handleInputChange("whatsappAuto", e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#6846B5] accent-[#6846B5] cursor-pointer"
                  />
                  <label htmlFor="whatsappAuto" className="text-xs cursor-pointer select-none">
                    <span className="font-semibold text-[#1D1928] block">
                      Lembretes automáticos via WhatsApp
                    </span>
                    <span className="text-[11px] text-[#6B6678]">
                      Enviar confirmação de consulta 24h antes e avisos de ingestão de água.
                    </span>
                  </label>
                </div>
              </div>

              {/* E-mail */}
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="email">
                  E-mail para Envio de Planos &amp; Relatórios <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7483]" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="paciente@exemplo.com.br"
                    className={`h-10 pl-9 pr-3 w-full rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border ${errors.email ? "border-[#BA1A1A] ring-1 ring-[#BA1A1A]" : "border-[#EAE5F2]"
                      } focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] transition-all`}
                  />
                </div>
                {errors.email && (
                  <span className="text-[11px] text-[#BA1A1A] font-medium">{errors.email}</span>
                )}

                {/* App Portal Access */}
                <div className="mt-2 p-3 rounded-lg bg-[#F8F1FF] flex items-start gap-2.5 border border-[#EDE5FA]/60">
                  <input
                    id="patientApp"
                    type="checkbox"
                    checked={formData.patientApp}
                    onChange={(e) => handleInputChange("patientApp", e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#6846B5] accent-[#6846B5] cursor-pointer"
                  />
                  <label htmlFor="patientApp" className="text-xs cursor-pointer select-none">
                    <span className="font-semibold text-[#1D1928] block">
                      Convidar para o App Nutre do Paciente
                    </span>
                    <span className="text-[11px] text-[#6B6678]">
                      Libera acesso ao diário fotográfico, lista de compras e metas.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Endereço Residencial */}
            <div className="pt-2 border-t border-[#EDE5FA]/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#1D1928] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#6846B5]" />
                  Endereço Residencial (Demonstrativo)
                </h3>
                <span className="text-[11px] text-[#7A7483]">Preenchimento automático via CEP</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-xs text-[#494552] font-medium" htmlFor="cep">
                    CEP
                  </label>
                  <div className="relative">
                    <input
                      id="cep"
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      className="h-10 px-3 w-full rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] font-tabular border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5]"
                    />
                    <button
                      type="button"
                      onClick={simulateCepLookup}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6846B5] hover:text-[#57389B] p-1 cursor-pointer"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-xs text-[#494552] font-medium" htmlFor="street">
                    Logradouro / Rua
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5]"
                  />
                </div>

                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-xs text-[#494552] font-medium" htmlFor="number">
                    Número &amp; Compl.
                  </label>
                  <input
                    id="number"
                    type="text"
                    value={formData.number}
                    onChange={(e) => handleInputChange("number", e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5]"
                  />
                </div>

                <div className="md:col-span-4 flex flex-col gap-1">
                  <label className="text-xs text-[#494552] font-medium" htmlFor="neighborhood">
                    Bairro
                  </label>
                  <input
                    id="neighborhood"
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5]"
                  />
                </div>

                <div className="md:col-span-5 flex flex-col gap-1">
                  <label className="text-xs text-[#494552] font-medium" htmlFor="city">
                    Cidade
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5]"
                  />
                </div>

                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-xs text-[#494552] font-medium" htmlFor="state">
                    Estado / UF
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] font-tabular border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== ETAPA 3: INFORMAÇÕES DE ENTRADA ==================== */}
      {currentStep === 3 && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-xl bg-[#FFFFFF] p-5 sm:p-7 shadow-2xs border border-[#EAE5F2] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-[#EDE5FA]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBDDFF] flex items-center justify-center text-[#230E48] font-bold text-xs">
                  03
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-[#1D1928]">
                    Etapa 3: Informações de Entrada
                  </h2>
                  <p className="text-xs text-[#6B6678]">
                    Classificação de entrada clínica para guiar o prontuário e as metas.
                  </p>
                </div>
              </div>
            </div>

            {/* Attendance Mode Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1D1928]">
                Modalidade Preferencial de Atendimento <span className="text-[#BA1A1A]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("attendanceMode", "Presencial no Consultório")
                  }
                  className={`p-4 rounded-xl text-left transition-all border-2 cursor-pointer relative ${formData.attendanceMode === "Presencial no Consultório"
                      ? "bg-[#F8F1FF] border-[#6846B5] shadow-xs"
                      : "bg-[#FFFFFF] border-[#EAE5F2] hover:border-[#B8A1E3]"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#6846B5]" />
                    <span className="font-bold text-sm text-[#1D1928]">
                      Presencial no Consultório
                    </span>
                  </div>
                  <p className="text-xs text-[#494552] mt-1.5">
                    Inclui bioimpedância InBody 770 e avaliação de dobras cutâneas no local.
                  </p>
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#E9DDFF] text-[#23005C] text-[10px] font-bold">
                    Recomendado
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleInputChange("attendanceMode", "Teleconsulta / Online")
                  }
                  className={`p-4 rounded-xl text-left transition-all border-2 cursor-pointer relative ${formData.attendanceMode === "Teleconsulta / Online"
                      ? "bg-[#F8F1FF] border-[#6846B5] shadow-xs"
                      : "bg-[#FFFFFF] border-[#EAE5F2] hover:border-[#B8A1E3]"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#685490]" />
                    <span className="font-bold text-sm text-[#1D1928]">
                      Teleconsulta / Online
                    </span>
                  </div>
                  <p className="text-xs text-[#494552] mt-1.5">
                    Atendimento remoto com envio prévio de fotos guiadas para o Body Scan.
                  </p>
                </button>
              </div>
            </div>

            {/* Goals & Referral */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="primaryGoal">
                  Objetivo Principal Inicial <span className="text-[#BA1A1A]">*</span>
                </label>
                <select
                  id="primaryGoal"
                  value={formData.primaryGoal}
                  onChange={(e) => handleInputChange("primaryGoal", e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] cursor-pointer"
                >
                  <option value="Emagrecimento & Definição Corporal">Emagrecimento &amp; Definição Corporal</option>
                  <option value="Hipertrofia & Desempenho Esportivo">Hipertrofia &amp; Desempenho Esportivo</option>
                  <option value="Saúde Geral, Longevidade & Imunidade">Saúde Geral, Longevidade &amp; Imunidade</option>
                  <option value="SOP & Equilíbrio Hormonal">SOP &amp; Equilíbrio Hormonal</option>
                  <option value="Nutrição Gestacional / Lactação">Nutrição Gestacional / Lactação</option>
                </select>
              </div>

              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="referralSource">
                  Como conheceu o consultório?
                </label>
                <select
                  id="referralSource"
                  value={formData.referralSource}
                  onChange={(e) => handleInputChange("referralSource", e.target.value)}
                  className="h-10 px-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] cursor-pointer"
                >
                  <option value="Indicação de outro paciente (Boca a boca)">Indicação de outro paciente (Boca a boca)</option>
                  <option value="Instagram da Dra. Camila Pompeu (@dranutri)">Instagram da Dra. Camila Pompeu (@dranutri)</option>
                  <option value="Indicação Médica (Ginecologista / Endocrino)">Indicação Médica</option>
                  <option value="Busca Google / Maps">Busca Google / Maps</option>
                </select>
              </div>

              {/* Administrative Notes */}
              <div className="md:col-span-12 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1D1928]" htmlFor="adminNotes">
                  Notas Administrativas Internas &amp; Restrições Iniciais
                </label>
                <textarea
                  id="adminNotes"
                  rows={3}
                  value={formData.adminNotes}
                  onChange={(e) => handleInputChange("adminNotes", e.target.value)}
                  className="p-3 rounded-lg bg-[#F8F1FF] text-sm text-[#1D1928] border border-[#EAE5F2] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#6846B5] transition-all resize-y"
                  placeholder="Observações da recepção ou restrições alimentares informadas no primeiro contato..."
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== ETAPA 4: REVISÃO & CONFIRMAÇÃO ==================== */}
      {currentStep === 4 && (
        <section className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-xl bg-[#FFFFFF] p-5 sm:p-7 shadow-2xs border border-[#EAE5F2] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-[#EDE5FA]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBDDFF] flex items-center justify-center text-[#230E48] font-bold text-xs">
                  04
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-[#1D1928]">
                    Etapa 4: Revisão &amp; Confirmação
                  </h2>
                  <p className="text-xs text-[#6B6678]">
                    Confira o resumo geral dos dados antes de inicializar o prontuário no sistema Nutre.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#E9DDFF] text-[#23005C] text-xs font-semibold">
                Resumo Consolidado
              </span>
            </div>

            {/* 3 Review Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded-xl bg-[#F8F1FF] border border-[#EDE5FA] flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#6846B5] uppercase tracking-wider">
                      1. Dados Pessoais
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-[#93AA91]" />
                  </div>
                  <div className="font-bold text-sm text-[#1D1928]">{formData.fullName}</div>
                  <div className="text-xs text-[#494552]">
                    Nome Social: {formData.preferredName || "Não informado"}
                  </div>
                  <div className="text-xs text-[#7A7483]">
                    {computedAge.label} • Sexo: {formData.biologicalSex}
                  </div>
                  <div className="text-xs text-[#7A7483]">CPF: {formData.cpf}</div>
                  <div className="text-xs text-[#7A7483]">{formData.occupation}</div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg border border-[#6846B5]/30 bg-[#FFFFFF] text-[#6846B5] hover:bg-[#6846B5] hover:text-[#FFFFFF] text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Dados Pessoais</span>
                </button>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-xl bg-[#F8F1FF] border border-[#EDE5FA] flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#685490] uppercase tracking-wider">
                      2. Contatos &amp; Endereço
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-[#93AA91]" />
                  </div>
                  <div className="font-bold text-sm text-[#1D1928]">{formData.phone}</div>
                  <div className="text-xs text-[#494552] truncate">{formData.email}</div>
                  <div className="text-xs text-[#7A7483]">
                    {formData.street}, {formData.number}
                  </div>
                  <div className="text-xs text-[#7A7483]">
                    {formData.neighborhood} • {formData.city} - {formData.state}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {formData.whatsappAuto && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#D1E9CE] text-[#0C200F]">
                        WhatsApp Ativo
                      </span>
                    )}
                    {formData.patientApp && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EBDDFF] text-[#230E48]">
                        App Convidado
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg border border-[#685490]/30 bg-[#FFFFFF] text-[#685490] hover:bg-[#685490] hover:text-[#FFFFFF] text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Contatos</span>
                </button>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-xl bg-[#F8F1FF] border border-[#EDE5FA] flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#6846B5] uppercase tracking-wider">
                      3. Entrada &amp; Modalidade
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-[#93AA91]" />
                  </div>
                  <div className="font-bold text-sm text-[#6846B5]">
                    {formData.attendanceMode}
                  </div>
                  <div className="text-xs text-[#1D1928] font-medium">{formData.primaryGoal}</div>
                  <div className="text-xs text-[#7A7483]">{formData.referralSource}</div>
                  <p className="text-[11px] text-[#7A7483] italic line-clamp-2 mt-1">
                    &ldquo;{formData.adminNotes}&rdquo;
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg border border-[#6846B5]/30 bg-[#FFFFFF] text-[#6846B5] hover:bg-[#6846B5] hover:text-[#FFFFFF] text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Informações</span>
                </button>
              </div>
            </div>

            {/* Mandatory Demonstration Notice */}
            <div className="p-4 rounded-xl bg-[#EDE5FA]/70 border border-[#B8A1E3]/40 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#6846B5] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-[#1D1928]">
                  Ambiente de demonstração — sem persistência em banco de dados
                </h4>
                <p className="text-[#494552] leading-relaxed">
                  Conforme as diretrizes do projeto Nutre (Marco 01), os cadastros não são gravados no banco de dados nem em tabelas externas. Ao clicar em finalizar, você receberá a confirmação de validação da interface.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sticky Bottom Floating Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 bg-[#FFFFFF]/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(40,36,51,0.06)] z-30 px-4 sm:px-6 py-3 border-t border-[#EAE5F2]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              id="btn-back"
              type="button"
              onClick={handleBack}
              className="h-9 px-3 rounded-lg bg-[#F8F1FF] hover:bg-[#EDE5FA] text-[#1D1928] text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#EAE5F2]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep === 1 ? "Voltar para Lista" : "Etapa Anterior"}</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE5FA] text-[#6846B5] text-xs font-semibold">
              <span>Etapa {currentStep} de 4</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDraftClick}
              className="h-9 px-3 rounded-lg bg-[#F8F1FF] hover:bg-[#EDE5FA] text-[#494552] text-xs font-medium transition-colors border border-[#EAE5F2] hidden sm:block"
            >
              Salvar Rascunho
            </button>

            <button
              id="btn-advance"
              type="button"
              onClick={handleAdvance}
              className="h-10 px-5 rounded-lg bg-[#6846B5] hover:bg-[#57389B] text-[#FFFFFF] text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
            >
              <span>
                {currentStep === 4
                  ? "Finalizar Cadastro Demonstrativo"
                  : `Avançar para ${stepMeta[currentStep].title.replace(/^\d+\.\s*/, "")}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Completion Modal - Explicit Demonstration Notice */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1E1B26]/50 backdrop-blur-xs"
            onClick={() => setShowFinishModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#EAE5F2] p-6 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-[#D1E9CE] text-[#0C200F] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-[#354935]" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-heading text-lg font-bold text-[#1D1928]">
                Fluxo de Cadastro Validado com Sucesso!
              </h3>
              <p className="text-xs sm:text-sm text-[#494552] leading-relaxed">
                As 4 etapas do wizard foram concluídas e validadas perfeitamente.
              </p>
              <div className="p-3 bg-[#F8F1FF] rounded-xl border border-[#EDE5FA] text-xs text-[#6B6678] text-left">
                <strong>Importante:</strong> Este é um <em>ambiente de demonstração (Marco 01)</em>. Nenhum dado foi persistido no banco de dados e nenhuma integração de backend foi realizada, conforme as diretrizes arquiteturais.
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowFinishModal(false);
                  startTransition(() => {
                    push("/pacientes");
                  });
                }}
                className="w-full sm:w-auto h-9 px-4 rounded-lg bg-[#F8F1FF] hover:bg-[#EDE5FA] text-[#1D1928] text-xs font-semibold border border-[#EAE5F2] transition-colors"
              >
                Ir para Lista de Pacientes
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFinishModal(false);
                  startTransition(() => {
                    push("/pacientes/beatriz-nogueira");
                  });
                }}
                className="w-full sm:w-auto h-9 px-4 rounded-lg bg-[#6846B5] hover:bg-[#57389B] text-[#FFFFFF] text-xs font-semibold shadow-2xs transition-colors"
              >
                Ver Prontuário Demonstrativo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
