import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, Globe2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { readAuthorizedObservatorioEditorialQueue } from "@/lib/observatorio/server";
import { ObservatorioAccessError } from "@/lib/observatorio/errors";
import { notFound } from "next/navigation";

export const metadata = { title: "Observatório — Camini", description: "Visão privada da fila editorial do Observatório." };

export default async function ObservatorioDashboardPage() {
  let queue;
  try {
    queue = await readAuthorizedObservatorioEditorialQueue();
  } catch (error) {
    if (error instanceof ObservatorioAccessError) notFound();
    throw error;
  }
  const editions = queue.editions;
  const stats = [
    ["Total de edições", editions.length, FileText],
    ["Candidatas", editions.filter((item) => item.status === "candidata").length, Clock3],
    ["Em revisão", editions.filter((item) => item.revisao === "em_revisao").length, ShieldAlert],
    ["Aprovadas", editions.filter((item) => item.status === "aprovada").length, CheckCircle2],
    ["Publicadas", editions.filter((item) => item.status === "publicada").length, Globe2],
    ["Reconciliação pendente", editions.filter((item) => item.reconciliacao === "informacao_insuficiente" || item.reconciliacao === "divergencia_status").length, ShieldAlert],
  ] as const;

  return <div className="space-y-8"><header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Camini / Observatório <Badge variant="outline">Privado</Badge></div><h1 className="text-3xl font-semibold tracking-tight">Fila editorial</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Leitura operacional das edições no HML, com estados de reconciliação explícitos e sem ações de aprovação ou publicação.</p></div><Link href="/dashboard/observatorio/edicoes" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90">Abrir fila <ArrowRight className="size-4" /></Link></header>
    {!queue.hmlAvailable && <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">{queue.notice}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map(([label, value, Icon]) => <Card key={label} variant="elevated"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle><Icon className="size-4 text-primary" /></CardHeader><CardContent><div className="text-3xl font-semibold tracking-tight">{value}</div><p className="mt-1 text-xs text-muted-foreground">{queue.hmlAvailable ? "Dados reais do HML" : "Indisponível sem fonte autorizada"}</p></CardContent></Card>)}</div>
    <Card variant="outline"><CardContent className="flex flex-col gap-3 p-5 text-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">Fonte canônica: Notion</p><p className="mt-1 text-muted-foreground">{queue.notionAvailable ? "Reconciliação conectada." : "Integração Notion não configurada server-side; nenhuma edição foi inventada."}</p></div><Badge variant={queue.notionAvailable ? "success" : "warning"}>{queue.notionAvailable ? "Conectado" : "Dependência operacional"}</Badge></CardContent></Card>
  </div>;
}
