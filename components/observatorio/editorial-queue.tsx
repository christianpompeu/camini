"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Filter, Inbox, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { EditorialEdition } from "@/lib/observatorio/editorial";
import { EditionStatus, ReconciliationStatus } from "./editorial-status";

const channelLabels = { panorama: "Panorama", tech: "Tech" } as const;

export function EditorialQueue({ editions, notice }: { editions: EditorialEdition[]; notice: string | null }) {
  const [channel, setChannel] = useState<"todos" | EditorialEdition["canal"]>("todos");
  const [status, setStatus] = useState<"todos" | EditorialEdition["status"]>("todos");
  const filtered = useMemo(() => editions.filter((edition) =>
    (channel === "todos" || edition.canal === channel) &&
    (status === "todos" || edition.status === status)
  ), [channel, status, editions]);

  return <div className="space-y-5">
    {notice && <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200"><ShieldAlert className="mt-0.5 size-4 shrink-0" /><span>{notice}</span></div>}
    <Card variant="glass" className="border-border/70"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="flex items-center gap-2 text-sm font-medium"><Filter className="size-4 text-primary" />Filtros da fila</div><select aria-label="Filtrar por canal" value={channel} onChange={(event) => setChannel(event.target.value as typeof channel)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="todos">Todos os canais</option><option value="panorama">Panorama</option><option value="tech">Tech</option></select><select aria-label="Filtrar por status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="todos">Todos os status</option><option value="candidata">Candidata</option><option value="aprovada">Aprovada</option><option value="publicada">Publicada</option><option value="rejeitada">Rejeitada</option><option value="arquivada">Arquivada</option></select><span className="text-xs text-muted-foreground sm:ml-auto">{filtered.length} de {editions.length} edições</span></CardContent></Card>
    {filtered.length === 0 ? <Card variant="outline"><CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center"><Inbox className="mb-3 size-9 text-muted-foreground/50" /><h2 className="text-base font-semibold">Nenhuma edição disponível</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">A fila representa somente registros existentes no Supabase HML. Não há fixtures ou publicação automática nesta sprint.</p></CardContent></Card> : <div className="grid gap-4">{filtered.map((edition) => <EditionRow key={edition.id} edition={edition} />)}</div>}
  </div>;
}

function EditionRow({ edition }: { edition: EditorialEdition }) {
  return <Card variant="elevated" className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"><CardContent className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 space-y-2"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-medium uppercase tracking-[0.16em] text-primary">{channelLabels[edition.canal]}</span><EditionStatus status={edition.status} /><ReconciliationStatus state={edition.reconciliacao} /></div><Link href={`/dashboard/observatorio/edicoes/${encodeURIComponent(edition.identificador)}`} className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight hover:text-primary">{edition.titulo}<ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" /></Link><p className="max-w-3xl text-sm leading-6 text-muted-foreground">{edition.resumo}</p></div><div className="flex shrink-0 flex-col items-start gap-2 text-xs text-muted-foreground lg:items-end"><span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(edition.criadaEm))}</span>{edition.notionUrl ? <Link href={edition.notionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">Abrir no Notion <ExternalLink className="size-3" /></Link> : <span>Notion URL não informada</span>}</div></div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/70 pt-3 text-xs text-muted-foreground"><span><strong className="font-medium text-foreground">ID:</strong> {edition.identificador}</span><span><strong className="font-medium text-foreground">Origem:</strong> {edition.origem}</span><span><strong className="font-medium text-foreground">Status original:</strong> {edition.statusOriginal ?? "Não informado"}</span><span><strong className="font-medium text-foreground">Revisão:</strong> {edition.revisaoOriginal ?? "Não informada"}</span></div></CardContent></Card>;
}
