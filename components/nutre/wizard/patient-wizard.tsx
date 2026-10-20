"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Info, Pencil, Save, ShieldAlert } from "lucide-react";
import type { WizardFormData } from "@/types/nutre";
import {
  DEMO_WIZARD_FIXTURE,
  NUTRE_DRAFT_STORAGE_KEY,
  demoPatientStorageKey,
  type StoredDemoPatient,
} from "@/lib/nutre/demo-patient";
import { useNutreNavigation } from "@/components/nutre/nutre-navigation-context";

const STEPS = [
  ["Identificação", "Dados e contatos"],
  ["Contexto", "Objetivo e vínculo"],
  ["Complementares", "Endereço e observações"],
  ["Preferências", "Canais e opcionais"],
  ["Revisão", "Conferência final"],
] as const;

const SERVICE_OPTIONS = ["Retorno estendido", "Análise de diário alimentar", "Encontro educativo"];
const PACKAGE_OPTIONS = ["Pacote de 3 retornos", "Pacote de acompanhamento trimestral"];
const CHANNEL_OPTIONS = ["E-mail", "Telefone", "WhatsApp"];

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      <span>{label}</span>
      {children}
      <span className={error ? "text-xs text-[#BA1A1A]" : "nutre-muted text-xs font-normal"}>{error || hint}</span>
    </label>
  );
}

function ToggleCard({ checked, label, description, onChange }: { checked: boolean; label: string; description?: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${checked ? "border-[#6846B5] bg-[#F8F1FF]" : "border-[#EAE5F2] hover:border-[#B8A1E3]"}`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${checked ? "border-[#6846B5] bg-[#6846B5] text-white" : "border-[#CBC3D4]"}`}>
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span><span className="block text-sm font-semibold">{label}</span>{description && <span className="nutre-muted mt-0.5 block text-xs font-normal">{description}</span>}</span>
    </button>
  );
}

export function PatientWizard() {
  const { push } = useNutreNavigation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardFormData>(DEMO_WIZARD_FIXTURE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [completedId, setCompletedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(NUTRE_DRAFT_STORAGE_KEY);
      // Drafts are client-only and must be reconciled after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setData({ ...DEMO_WIZARD_FIXTURE, ...JSON.parse(stored) });
    } catch { /* sessão indisponível: o formulário continua somente em memória */ }
  }, []);

  const age = useMemo(() => {
    if (!data.birthDate) return null;
    const birth = new Date(`${data.birthDate}T12:00:00`);
    const today = new Date();
    let value = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) value--;
    return value;
  }, [data.birthDate]);

  const update = <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
    setErrors((current) => { const next = { ...current }; delete next[key]; return next; });
  };

  const toggleList = (key: "tags" | "preferredChannels" | "optionalServices" | "optionalPackages", value: string) => {
    update(key, data[key].includes(value) ? data[key].filter((item) => item !== value) : [...data[key], value]);
  };

  const validate = (target = step) => {
    const next: Record<string, string> = {};
    if (target === 1) {
      if (!data.fullName.trim()) next.fullName = "Informe um nome para continuar.";
      if (!data.birthDate) next.birthDate = "Informe a data de nascimento.";
      if (!data.phone.trim()) next.phone = "Informe um telefone de demonstração.";
      if (!data.email.includes("@")) next.email = "Informe um e-mail válido.";
    }
    if (target === 2) {
      if (!data.primaryGoal) next.primaryGoal = "Selecione um objetivo cadastral.";
      if (!data.attendanceLocation) next.attendanceLocation = "Selecione o local de atendimento.";
    }
    if (target === 4 && data.preferredChannels.length === 0) next.preferredChannels = "Selecione ao menos um canal.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goTo = (target: number) => {
    if (target > step && !validate()) return;
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDraft = () => {
    try {
      sessionStorage.setItem(NUTRE_DRAFT_STORAGE_KEY, JSON.stringify(data));
      setMessage("Rascunho temporário salvo somente nesta sessão do navegador.");
    } catch { setMessage("Não foi possível usar o armazenamento temporário nesta sessão."); }
  };

  const finish = () => {
    const id = `demo-${crypto.randomUUID()}`;
    const record: StoredDemoPatient = { id, createdAt: new Date().toISOString(), temporary: true, data };
    try {
      sessionStorage.setItem(demoPatientStorageKey(id), JSON.stringify(record));
      sessionStorage.removeItem(NUTRE_DRAFT_STORAGE_KEY);
      setCompletedId(id);
    } catch { setMessage("O navegador bloqueou o armazenamento temporário. O perfil não foi criado."); }
  };

  if (completedId) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center py-10">
        <div className="nutre-card w-full rounded-3xl p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D1E9CE] text-[#354935]"><CheckCircle2 className="h-8 w-8" /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-[#6846B5]">Demonstração concluída</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Fluxo demonstrativo concluído</h1>
          <p className="nutre-muted mx-auto mt-3 max-w-lg text-sm leading-relaxed">Nenhum dado foi enviado para banco, contrato, cobrança ou integração. Este perfil fictício existe apenas no <code>sessionStorage</code> desta aba e está associado ao ID <strong>{completedId}</strong>.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => push(`/pacientes/${completedId}`)} className="rounded-xl bg-[#6846B5] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#57389B]">Abrir perfil demo</button>
            <button type="button" onClick={() => { setCompletedId(null); setStep(1); setData(DEMO_WIZARD_FIXTURE); }} className="nutre-card rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-[#F8F1FF]">Novo cadastro</button>
            <button type="button" onClick={() => push("/pacientes")} className="rounded-xl px-4 py-3 text-sm font-bold text-[#6846B5] transition-all hover:bg-[#F8F1FF]">Voltar a pacientes</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-28">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full bg-[#EDE5FA] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6846B5]">Etapa {step} de 5</span><span className="nutre-card rounded-full px-3 py-1 text-[11px] font-semibold"><ShieldAlert className="mr-1 inline h-3.5 w-3.5 text-[#6846B5]" />Somente dados fictícios</span></div>
          <h1 className="text-2xl font-bold sm:text-3xl">Cadastrar paciente</h1>
          <p className="nutre-muted mt-1 max-w-2xl text-sm">Cadastro administrativo demonstrativo. Avaliação clínica, anamnese, antropometria, bioquímica, prescrição e acompanhamento não fazem parte deste fluxo.</p>
        </div>
        <button type="button" onClick={saveDraft} className="nutre-card inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-all hover:bg-[#F8F1FF]"><Save className="h-4 w-4 text-[#6846B5]" />Salvar rascunho temporário</button>
      </header>

      {message && <div role="status" className="rounded-xl border border-[#B8A1E3] bg-[#F8F1FF] p-3 text-sm"><Info className="mr-2 inline h-4 w-4 text-[#6846B5]" />{message}</div>}

      <nav aria-label="Etapas do cadastro" className="nutre-card rounded-2xl p-3 shadow-sm">
        <ol className="grid grid-cols-5 gap-2">
          {STEPS.map(([title, subtitle], index) => { const number = index + 1; const active = number === step; return (
            <li key={title}><button type="button" onClick={() => goTo(number)} aria-current={active ? "step" : undefined} className={`flex w-full items-center gap-2 rounded-xl p-2 text-left transition-all ${active ? "bg-[#6846B5] text-white" : "hover:bg-[#F8F1FF]"}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? "bg-white/20" : number < step ? "bg-[#D1E9CE] text-[#354935]" : "bg-[#EDE5FA] text-[#6846B5]"}`}>{number < step ? <Check className="h-4 w-4" /> : number}</span><span className="hidden min-w-0 lg:block"><strong className="block truncate text-xs">{title}</strong><small className={active ? "text-white/75" : "nutre-muted"}>{subtitle}</small></span></button></li>
          ); })}
        </ol>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EDE5FA]"><div className="h-full rounded-full bg-[#6846B5] transition-all" style={{ width: `${step * 20}%` }} /></div>
      </nav>

      <section className="nutre-card rounded-2xl p-5 shadow-sm sm:p-7">
        {step === 1 && <div className="space-y-6"><SectionTitle number="01" title="Identificação e contatos" subtitle="Somente dados cadastrais necessários ao fluxo demonstrativo." /><div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome completo *" error={errors.fullName}><input className="nutre-input" aria-invalid={!!errors.fullName} value={data.fullName} onChange={(e) => update("fullName", e.target.value)} /></Field>
          <Field label="Nome preferido"><input className="nutre-input" value={data.preferredName} onChange={(e) => update("preferredName", e.target.value)} /></Field>
          <Field label="Data de nascimento *" hint={age === null ? "A idade será calculada a partir da data." : `${age} anos na data atual.`} error={errors.birthDate}><input type="date" className="nutre-input" aria-invalid={!!errors.birthDate} value={data.birthDate} onChange={(e) => update("birthDate", e.target.value)} /></Field>
          <Field label="Sexo informado"><select className="nutre-input" value={data.biologicalSex} onChange={(e) => update("biologicalSex", e.target.value as WizardFormData["biologicalSex"])}><option>Feminino</option><option>Masculino</option><option>Outro</option></select></Field>
          <Field label="CPF" hint="Use apenas o placeholder fictício nesta demonstração."><input className="nutre-input" value={data.cpf} onChange={(e) => update("cpf", e.target.value)} /></Field>
          <Field label="Telefone *" error={errors.phone}><input className="nutre-input" aria-invalid={!!errors.phone} value={data.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
          <Field label="E-mail *" error={errors.email}><input type="email" className="nutre-input" aria-invalid={!!errors.email} value={data.email} onChange={(e) => update("email", e.target.value)} /></Field>
          <div className="grid gap-4 rounded-xl border border-dashed border-[#CBC3D4] p-4 md:col-span-2 md:grid-cols-2"><Field label="Responsável (quando aplicável)"><input className="nutre-input" value={data.responsibleName} onChange={(e) => update("responsibleName", e.target.value)} placeholder="Não informado" /></Field><Field label="CPF do responsável"><input className="nutre-input" value={data.responsibleCpf} onChange={(e) => update("responsibleCpf", e.target.value)} placeholder="000.000.000-00" /></Field></div>
        </div></div>}

        {step === 2 && <div className="space-y-6"><SectionTitle number="02" title="Contexto e vínculo de atendimento" subtitle="Objetivo cadastral, tratamentos/protocolos associados, tags e local." /><div className="grid gap-4 md:grid-cols-2">
          <Field label="Objetivo principal *" error={errors.primaryGoal}><select className="nutre-input" value={data.primaryGoal} onChange={(e) => update("primaryGoal", e.target.value)}><option value="">Selecione</option><option>Organização da rotina alimentar</option><option>Educação alimentar</option><option>Acompanhamento nutricional geral</option></select></Field>
          <Field label="Local de atendimento *" error={errors.attendanceLocation}><select className="nutre-input" value={data.attendanceLocation} onChange={(e) => update("attendanceLocation", e.target.value)}><option value="">Nenhum local selecionado</option><option>Unidade demonstrativa</option><option>Atendimento online demonstrativo</option></select></Field>
          <Field label="Tratamento ou protocolo associado" hint="Vínculo administrativo; não equivale a prescrição clínica."><input className="nutre-input" value={data.associatedTreatment} onChange={(e) => update("associatedTreatment", e.target.value)} /></Field>
          <Field label="Situação do tratamento"><select className="nutre-input" value={data.treatmentStatus} onChange={(e) => update("treatmentStatus", e.target.value as WizardFormData["treatmentStatus"])}><option>Não contratado</option><option>Proposta demonstrativa</option><option>Contratado (demonstração)</option></select></Field>
          <Field label="Condições relatadas" hint="Relato cadastral; não representa diagnóstico confirmado."><textarea className="nutre-input min-h-24" value={data.reportedConditions} onChange={(e) => update("reportedConditions", e.target.value)} /></Field>
          <div><span className="mb-2 block text-sm font-semibold">Tags</span><div className="grid gap-2"><ToggleCard checked={data.tags.includes("Primeiro atendimento")} label="Primeiro atendimento" onChange={() => toggleList("tags", "Primeiro atendimento")} /><ToggleCard checked={data.tags.includes("Demonstração")} label="Demonstração" onChange={() => toggleList("tags", "Demonstração")} /></div></div>
        </div><div className="rounded-xl border border-[#B8A1E3] bg-[#F8F1FF] p-4"><strong className="text-sm">Plano alimentar clínico</strong><p className="nutre-muted mt-1 text-xs">Não definido. Planos alimentares são separados de tratamentos contratados e serão criados somente no módulo clínico futuro.</p></div></div>}

        {step === 3 && <div className="space-y-6"><SectionTitle number="03" title="Endereço, foto e observações" subtitle="Informações complementares; nenhum dado de avaliação nutricional." /><div className="grid gap-4 md:grid-cols-6">
          <div className="md:col-span-2"><Field label="CEP"><input className="nutre-input" value={data.cep} onChange={(e) => update("cep", e.target.value)} /></Field></div><div className="md:col-span-4"><Field label="Rua"><input className="nutre-input" value={data.street} onChange={(e) => update("street", e.target.value)} /></Field></div>
          <div className="md:col-span-2"><Field label="Número"><input className="nutre-input" value={data.number} onChange={(e) => update("number", e.target.value)} /></Field></div><div className="md:col-span-4"><Field label="Complemento"><input className="nutre-input" value={data.complement} onChange={(e) => update("complement", e.target.value)} /></Field></div>
          <div className="md:col-span-3"><Field label="Bairro"><input className="nutre-input" value={data.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} /></Field></div><div className="md:col-span-2"><Field label="Cidade"><input className="nutre-input" value={data.city} onChange={(e) => update("city", e.target.value)} /></Field></div><div><Field label="UF"><input className="nutre-input" maxLength={2} value={data.state} onChange={(e) => update("state", e.target.value.toUpperCase())} /></Field></div>
          <div className="md:col-span-3"><Field label="Foto opcional" hint="O arquivo não será enviado; apenas o nome é exibido nesta sessão."><input type="file" accept="image/*" className="nutre-input text-xs" onChange={(e) => update("photoName", e.target.files?.[0]?.name || "")} /></Field></div><div className="md:col-span-3"><Field label="Observações cadastrais" hint="Não inclua anamnese ou informação clínica real."><textarea className="nutre-input min-h-24" value={data.adminNotes} onChange={(e) => update("adminNotes", e.target.value)} /></Field></div>
        </div></div>}

        {step === 4 && <div className="space-y-6"><SectionTitle number="04" title="Preferências e serviços opcionais" subtitle="Representação de opções; sem cobrança, contrato ou integração financeira." /><div><h3 className="text-sm font-bold">Canais preferidos *</h3><p className="nutre-muted mb-3 text-xs">A preferência não representa consentimento genérico de privacidade.</p><div className="grid gap-2 sm:grid-cols-3">{CHANNEL_OPTIONS.map((item) => <ToggleCard key={item} checked={data.preferredChannels.includes(item)} label={item} onChange={() => toggleList("preferredChannels", item)} />)}</div>{errors.preferredChannels && <p className="mt-2 text-xs text-[#BA1A1A]">{errors.preferredChannels}</p>}</div>
          <ToggleCard checked={data.appointmentReminders} label="Lembretes de agendamento" description="Preferência demonstrativa; nenhuma mensagem será enviada." onChange={() => update("appointmentReminders", !data.appointmentReminders)} />
          <div className="grid gap-5 md:grid-cols-2"><div><h3 className="mb-2 text-sm font-bold">Serviços opcionais</h3><div className="space-y-2">{SERVICE_OPTIONS.map((item) => <ToggleCard key={item} checked={data.optionalServices.includes(item)} label={item} onChange={() => toggleList("optionalServices", item)} />)}</div></div><div><h3 className="mb-2 text-sm font-bold">Pacotes opcionais</h3><div className="space-y-2">{PACKAGE_OPTIONS.map((item) => <ToggleCard key={item} checked={data.optionalPackages.includes(item)} label={item} onChange={() => toggleList("optionalPackages", item)} />)}</div></div></div>
          <div className="rounded-xl border border-[#DCA76B] bg-[#FEF3C7] p-4 text-sm text-[#6B4300]"><Info className="mr-2 inline h-4 w-4" />As seleções são apenas ilustrativas. Não geram preço, cobrança, contrato, recibo ou integração financeira.</div>
        </div>}

        {step === 5 && <div className="space-y-6"><SectionTitle number="05" title="Revisão" subtitle="Confira somente as informações coletadas nas etapas anteriores." /><div className="grid gap-4 md:grid-cols-2">
          <ReviewCard title="Identificação" onEdit={() => setStep(1)} rows={[["Nome", data.fullName], ["Nascimento", data.birthDate], ["Contato", `${data.phone} • ${data.email}`], ["Responsável", data.responsibleName || "Não informado"]]} />
          <ReviewCard title="Contexto e vínculo" onEdit={() => setStep(2)} rows={[["Objetivo", data.primaryGoal], ["Tratamento/protocolo", data.associatedTreatment || "Não associado"], ["Situação", data.treatmentStatus], ["Local", data.attendanceLocation], ["Plano alimentar clínico", "Não definido"]]} />
          <ReviewCard title="Complementares" onEdit={() => setStep(3)} rows={[["Endereço", `${data.street}, ${data.number} — ${data.city}/${data.state}`], ["Foto", data.photoName || "Não adicionada"], ["Observações", data.adminNotes || "Não informadas"]]} />
          <ReviewCard title="Preferências e opcionais" onEdit={() => setStep(4)} rows={[["Canais", data.preferredChannels.join(", ")], ["Serviços", data.optionalServices.join(", ") || "Nenhum"], ["Pacotes", data.optionalPackages.join(", ") || "Nenhum"], ["Financeiro", "Não criado"]]} />
        </div><div className="rounded-xl bg-[#F8F1FF] p-4 text-sm"><ShieldAlert className="mr-2 inline h-4 w-4 text-[#6846B5]" />Ao concluir, será criado apenas um perfil temporário associado a um ID de demonstração nesta sessão.</div></div>}
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EAE5F2] bg-[var(--nutre-card)]/95 p-3 backdrop-blur-md lg:left-[260px]"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><button type="button" onClick={() => step === 1 ? push("/pacientes") : goTo(step - 1)} className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all hover:bg-[#F8F1FF]"><ArrowLeft className="h-4 w-4" />{step === 1 ? "Voltar" : "Etapa anterior"}</button><span className="nutre-muted hidden text-xs sm:block">Etapa {step} de 5</span><button type="button" onClick={() => step === 5 ? finish() : goTo(step + 1)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#6846B5] px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#57389B] active:scale-95">{step === 5 ? "Concluir simulação" : "Continuar"}{step < 5 && <ArrowRight className="h-4 w-4" />}</button></div></footer>
    </div>
  );
}

function SectionTitle({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return <div className="flex items-start gap-3 border-b border-[#EAE5F2] pb-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDE5FA] text-xs font-extrabold text-[#6846B5]">{number}</span><div><h2 className="text-lg font-bold">{title}</h2><p className="nutre-muted text-xs">{subtitle}</p></div></div>;
}

function ReviewCard({ title, rows, onEdit }: { title: string; rows: string[][]; onEdit: () => void }) {
  return <article className="rounded-xl border border-[#EAE5F2] p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">{title}</h3><button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-bold text-[#6846B5] hover:underline"><Pencil className="h-3.5 w-3.5" />Editar</button></div><dl className="space-y-2">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[8rem_1fr] gap-2 text-xs"><dt className="nutre-muted">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl></article>;
}
