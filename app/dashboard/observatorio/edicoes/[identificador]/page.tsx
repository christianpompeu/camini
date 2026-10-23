import Link from "next/link";
import { ArrowLeft, ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditorialSnapshotView } from "@/components/observatorio/editorial-snapshot-view";
import { readAuthorizedObservatorioEdition } from "@/lib/observatorio/server";
import { ObservatorioAccessError } from "@/lib/observatorio/errors";
import type { EditorialSnapshot } from "@/lib/observatorio/editorial-snapshot";
import { safeExternalHref } from "@/lib/observatorio/editorial-snapshot-safety";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Revisão editorial — Observatório" };

function snapshotOf(value: unknown): EditorialSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const snapshot = value as Partial<EditorialSnapshot>;
  if (snapshot.schemaVersion !== 1 || !snapshot.content || snapshot.content.complete !== true || !Array.isArray(snapshot.content.blocks)) return null;
  return value as EditorialSnapshot;
}

export default async function ObservatorioEditionPage({ params }: { params: Promise<{ identificador: string }> }) {
  const { identificador } = await params;
  let edition;
  try {
    edition = await readAuthorizedObservatorioEdition(decodeURIComponent(identificador));
  } catch (error) {
    if (error instanceof ObservatorioAccessError) notFound();
    throw error;
  }
  if (!edition) notFound();
  const snapshot = snapshotOf(edition.snapshot);
  const notionHref = safeExternalHref(edition.notion_url);
  return <div className="space-y-6">
    <Link href="/dashboard/observatorio/edicoes" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-4" />Voltar para a fila</Link>
    <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><span>Observatório / revisão privada</span><Badge variant="outline"><LockKeyhole className="size-3" />Somente leitura</Badge></div><h1 className="text-3xl font-semibold tracking-tight">{edition.titulo}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{edition.resumo}</p></div><div className="flex flex-wrap items-center gap-2"><Badge variant="warning">{edition.status}</Badge><Badge variant="outline">{edition.canal}</Badge></div></header>
    <Card variant="elevated"><CardContent className="grid gap-4 p-5 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Identificador</p><p className="mt-1 break-all font-medium">{edition.identificador}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Versão</p><p className="mt-1 font-medium">{edition.versao}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Origem</p><p className="mt-1 font-medium">{snapshot?.source.type ?? "Snapshot indisponível"}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Hash</p><p className="mt-1 break-all font-mono text-xs">{snapshot?.contentHash ?? "Não informado"}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Status original Notion</p><p className="mt-1 font-medium">{snapshot?.edition.statusOriginal ?? "Não informado"}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Revisão original Notion</p><p className="mt-1 font-medium">{snapshot?.edition.revisaoOriginal ?? "Não informada"}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Criada em</p><p className="mt-1 font-medium">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(edition.criada_em))}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Governança</p><p className="mt-1 inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300"><ShieldCheck className="size-4" />Decisão não habilitada</p></div></CardContent></Card>
    {notionHref && <Link href={notionHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">Abrir edição original no Notion <ExternalLink className="size-4" /></Link>}
    {snapshot ? <EditorialSnapshotView snapshot={snapshot} /> : <Card variant="outline"><CardHeader><CardTitle>Snapshot indisponível</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">O registro existe, mas seu snapshot não atende ao contrato de conteúdo completo. Nenhuma decisão editorial pode ser tomada.</p></CardContent></Card>}
    <Card variant="outline"><CardContent className="flex items-start gap-3 p-5 text-sm"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="font-medium">Revisão humana preparada, ainda sem decisão persistente</p><p className="mt-1 text-muted-foreground">Aprovar, rejeitar e publicar não estão habilitados nesta etapa. A identidade autenticada e o contrato de decisão serão definidos no próximo gate.</p></div></CardContent></Card>
  </div>;
}
