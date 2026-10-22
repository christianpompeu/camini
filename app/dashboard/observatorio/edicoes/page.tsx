import { readAuthorizedObservatorioEditorialQueue } from "@/lib/observatorio/server";
import { EditorialQueue } from "@/components/observatorio/editorial-queue";
import { ObservatorioAccessError } from "@/lib/observatorio/errors";
import { notFound } from "next/navigation";

export const metadata = { title: "Edições do Observatório — Camini" };

export default async function ObservatorioEditionsPage() {
  let queue;
  try {
    queue = await readAuthorizedObservatorioEditorialQueue();
  } catch (error) {
    if (error instanceof ObservatorioAccessError) notFound();
    throw error;
  }
  return <div className="space-y-6"><header className="border-b border-border pb-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Observatório / fila</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Edições editoriais</h1><p className="mt-2 text-sm text-muted-foreground">Somente leitura. Aprovação, rejeição e publicação não fazem parte da Sprint C1.</p></header><EditorialQueue editions={queue.editions} notice={queue.notice} /></div>;
}
