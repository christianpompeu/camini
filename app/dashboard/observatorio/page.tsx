import { IntelligenceDashboard } from "@/components/observatorio/intelligence-dashboard";
import { readAuthorizedObservatorioSnapshot } from "@/lib/observatorio/server";
import { ObservatorioAccessError } from "@/lib/observatorio/errors";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Observatório — Camini", description: "Inteligência editorial privada do Observatório." };

export default async function ObservatorioDashboardPage() {
  let snapshot;
  try {
    snapshot = await readAuthorizedObservatorioSnapshot({ limitPerTable: 1000 });
  } catch (error) {
    if (error instanceof ObservatorioAccessError) notFound();
    throw error;
  }
  return <IntelligenceDashboard snapshot={snapshot} />;
}
