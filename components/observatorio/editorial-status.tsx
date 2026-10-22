import { Badge } from "@/components/ui/badge";
import type { EditorialEdition, ReconciliationState } from "@/lib/observatorio/editorial";

const statusLabels: Record<EditorialEdition["status"], string> = {
  candidata: "Candidata",
  aprovada: "Aprovada no HML",
  publicada: "Publicada",
  rejeitada: "Rejeitada",
  arquivada: "Arquivada",
};

const reconciliationLabels: Record<ReconciliationState, string> = {
  only_notion: "Somente no Notion",
  only_hml: "Somente no HML",
  confirmed_match: "Correspondência confirmada",
  status_divergence: "Divergência de status",
  supabase_id_not_found: "ID Supabase não encontrado",
  insufficient_information: "Informação insuficiente",
};

export function EditionStatus({ status }: { status: EditorialEdition["status"] }) {
  const variant = status === "publicada" ? "success" : status === "aprovada" ? "active" : status === "candidata" ? "warning" : "outline";
  return <Badge variant={variant}>{statusLabels[status]}</Badge>;
}

export function ReconciliationStatus({ state }: { state: ReconciliationState }) {
  return <Badge variant={state === "insufficient_information" || state === "supabase_id_not_found" ? "warning" : state === "status_divergence" ? "destructive" : "outline"}>{reconciliationLabels[state]}</Badge>;
}
