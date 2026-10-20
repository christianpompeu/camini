"use client";

import { useEffect, useState } from "react";
import { Archive, CalendarClock, ClipboardList, MapPin, ShieldAlert, UserRound } from "lucide-react";
import type { PatientDetail } from "@/types/nutre";
import { demoPatientStorageKey, type StoredDemoPatient } from "@/lib/nutre/demo-patient";
import { PatientProfileHeader } from "./patient-profile-header";
import { PatientProfileTabs } from "./patient-profile-tabs";
import { useNutreNavigation } from "../nutre-navigation-context";

export function PatientProfilePageClient({ id, patient }: { id: string; patient?: PatientDetail }) {
  const [demo, setDemo] = useState<StoredDemoPatient | null | undefined>(undefined);
  const { push } = useNutreNavigation();

  useEffect(() => {
    if (!id.startsWith("demo-")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDemo(null);
      return;
    }
    try {
      const stored = sessionStorage.getItem(demoPatientStorageKey(id));
      // Reading sessionStorage is necessarily a post-hydration client sync.
      setDemo(stored ? JSON.parse(stored) : null);
    } catch {
      setDemo(null);
    }
  }, [id]);

  if (patient) return <div className="space-y-6"><PatientProfileHeader patient={patient} /><PatientProfileTabs patient={patient} /></div>;
  if (demo === undefined) return <div className="nutre-card animate-pulse rounded-2xl p-8 text-sm">Carregando perfil temporário…</div>;
  if (!demo) return <div className="nutre-card mx-auto max-w-xl rounded-2xl p-8 text-center"><Archive className="mx-auto h-10 w-10 text-[#6846B5]" /><h1 className="mt-4 text-xl font-bold">Perfil temporário indisponível</h1><p className="nutre-muted mt-2 text-sm">Este ID não existe nesta sessão. Perfis demonstrativos são removidos quando a sessão do navegador termina.</p><button onClick={() => push("/pacientes/novo")} className="mt-5 rounded-xl bg-[#6846B5] px-5 py-3 text-sm font-bold text-white">Iniciar nova simulação</button></div>;

  const { data } = demo;
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#B8A1E3] bg-[#F8F1FF] p-3 text-sm"><ShieldAlert className="mr-2 inline h-4 w-4 text-[#6846B5]" /><strong>Perfil temporário:</strong> dados fictícios no <code>sessionStorage</code>, associados ao ID {id}. Nenhum registro em banco.</div>
      <header className="nutre-card rounded-2xl p-5 shadow-sm sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EDE5FA] text-[#6846B5]"><UserRound className="h-8 w-8" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">{data.fullName}</h1><span className="rounded-full bg-[#D1E9CE] px-2.5 py-1 text-[11px] font-bold text-[#354935]">DEMO TEMPORÁRIO</span></div><p className="nutre-muted mt-1 text-sm">{data.preferredName || "Sem nome preferido"} • {data.email} • {data.phone}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-lg bg-[#F8F1FF] px-3 py-1.5 font-semibold">Objetivo: {data.primaryGoal}</span><span className="rounded-lg bg-[#F8F1FF] px-3 py-1.5 font-semibold"><MapPin className="mr-1 inline h-3.5 w-3.5" />{data.attendanceLocation}</span></div></div></div></header>
      <section className="grid gap-4 lg:grid-cols-3"><div className="nutre-card rounded-2xl p-5 lg:col-span-2"><h2 className="font-bold">Resumo cadastral</h2><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><Info label="Nascimento" value={data.birthDate} /><Info label="Endereço" value={`${data.street}, ${data.number} — ${data.city}/${data.state}`} /><Info label="Tratamento/protocolo" value={data.associatedTreatment || "Não associado"} /><Info label="Situação" value={data.treatmentStatus} /><Info label="Tags" value={data.tags.join(", ") || "Nenhuma"} /><Info label="Plano alimentar clínico" value="Não definido" /></dl></div><div className="nutre-card rounded-2xl p-5"><h2 className="font-bold">Opcionais demonstrativos</h2><p className="nutre-muted mt-3 text-sm">Serviços: {data.optionalServices.join(", ") || "nenhum"}.</p><p className="nutre-muted mt-2 text-sm">Pacotes: {data.optionalPackages.join(", ") || "nenhum"}.</p><p className="mt-4 rounded-lg bg-[#FEF3C7] p-3 text-xs text-[#6B4300]">Sem cobrança, contrato ou integração financeira.</p></div></section>
      <section className="grid gap-4 md:grid-cols-3"><EmptyState icon={ClipboardList} title="Avaliação nutricional" text="Não iniciada. Anamnese, antropometria e bioquímica pertencem a ciclos futuros." /><EmptyState icon={CalendarClock} title="Atendimentos" text="Nenhuma consulta ou acompanhamento foi criado neste cadastro." /><EmptyState icon={Archive} title="Prescrição e plano" text="Nenhuma prescrição ou plano alimentar clínico foi definido." /></section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="nutre-muted text-xs">{label}</dt><dd className="mt-0.5 font-semibold">{value}</dd></div>; }
function EmptyState({ icon: Icon, title, text }: { icon: typeof Archive; title: string; text: string }) { return <article className="nutre-card rounded-2xl p-5"><Icon className="h-5 w-5 text-[#6846B5]" /><h2 className="mt-3 font-bold">{title}</h2><p className="nutre-muted mt-2 text-xs leading-relaxed">{text}</p><span className="mt-4 inline-block rounded-lg bg-[#F8F1FF] px-2.5 py-1 text-[11px] font-bold text-[#6846B5]">Estado vazio</span></article>; }
