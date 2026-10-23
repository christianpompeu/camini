import { readAuthorizedObservatorioEditorialQueue } from "@/lib/observatorio/server";
import { EditorialQueue } from "@/components/observatorio/editorial-queue";
import { ObservatorioAccessError } from "@/lib/observatorio/errors";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edições & Fila — Observatório" };

export default async function ObservatorioEditionsPage() {
  let queue;
  try { queue = await readAuthorizedObservatorioEditorialQueue(); }
  catch (error) { if (error instanceof ObservatorioAccessError) notFound(); throw error; }
  return <div className="space-y-6"><header className="border-b border-border pb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Observatório / fila editorial</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Edições & Fila</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Abra uma candidata para examinar o snapshot completo, registrar uma decisão humana e publicar explicitamente uma edição aprovada.</p></header><EditorialQueue editions={queue.editions} notice={queue.notice} /></div>;
}
