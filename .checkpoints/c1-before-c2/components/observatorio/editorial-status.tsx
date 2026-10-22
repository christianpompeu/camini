import { Badge } from "@/components/ui/badge";
import type { EditorialEdition, ReconciliaçãoEstado } from "@/lib/observatorio/editorial";

const statusLabels: Record<EditorialEdition["status"], string> = {
  candidata: "Candidata",
  aprovada: "Aprovada no HML",
  publicada: "Publicada",
  rejeitada: "Rejeitada",
  arquivada: "Arquivada",
};

const reconciliationLabels: Record<ReconciliaçãoEstado, string> = {
  somente_hml: "Somente no HML",
  correspondencia_confirmada: "Correspondência confirmada",
  divergencia_status: "Divergência de status",
  identificador_nao_confirmado: "ID não confirmado",
  informacao_insuficiente: "Reconciliação insuficiente",
};

export function EditionStatus({ status }: { status: EditorialEdition["status"] }) {
  const variant = status === "publicada" ? "success" : status === "aprovada" ? "active" : status === "candidata" ? "warning" : "outline";
  return <Badge variant={variant}>{statusLabels[status]}</Badge>;
}

export function ReconciliationStatus({ state }: { state: ReconciliaçãoEstado }) {
  return <Badge variant={state === "informacao_insuficiente" ? "warning" : "outline"}>{reconciliationLabels[state]}</Badge>;
}
