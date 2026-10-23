"use client";

import { useActionState, useState } from "react";
import { Check, Globe2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { approveAndPublishEditorialEdition, decideEditorialEdition, publishEditorialEdition, type ActionResult } from "@/app/dashboard/observatorio/actions";

const initial: ActionResult | null = null;

function key(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function Result({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return <div role="status" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>{result.ok ? result.message : result.error}</div>;
}

export function EditorialDecisionPanel({
  editionId, identifier, channel, version, contentHash, status,
}: {
  editionId: string; identifier: string; channel: string; version: number; contentHash: string; status: string;
}) {
  const [decisionResult, decisionAction, decisionPending] = useActionState(async (_: ActionResult | null, formData: FormData) => decideEditorialEdition(formData), initial);
  const [publishResult, publishAction, publishPending] = useActionState(async (_: ActionResult | null, formData: FormData) => publishEditorialEdition(formData), initial);
  const [combinedResult, combinedAction, combinedPending] = useActionState(async (_: ActionResult | null, formData: FormData) => approveAndPublishEditorialEdition(formData), initial);
  const [justification, setJustification] = useState("");
  const isCandidate = status === "candidata";
  const isApproved = status === "aprovada";
  const fields = (idempotencyKey: string) => <>
    <input type="hidden" name="edition_id" value={editionId} />
    <input type="hidden" name="identifier" value={identifier} />
    <input type="hidden" name="channel" value={channel} />
    <input type="hidden" name="version" value={version} />
    <input type="hidden" name="content_hash" value={contentHash} />
    <input type="hidden" name="idempotency_key" value={idempotencyKey} />
  </>;

  return <Card variant="elevated" className="border-primary/20"><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Decisão editorial</CardTitle><Badge variant={isCandidate ? "warning" : isApproved ? "success" : "outline"}>{status}</Badge></div></CardHeader><CardContent className="space-y-4">
    {isCandidate && <>
      <label className="block text-sm font-medium">Justificativa <span className="font-normal text-muted-foreground">(mínimo de 10 caracteres)</span><textarea name="justification" required minLength={10} value={justification} onChange={(event) => setJustification(event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Registre o fundamento editorial da decisão." /></label>
      <div className="flex flex-wrap gap-2">
        <form action={decisionAction} onSubmit={(event) => { if (!window.confirm("Confirmar aprovação desta edição?")) event.preventDefault(); }}>
          {fields(key("approval"))}<input type="hidden" name="decision" value="aprovar" /><input type="hidden" name="justification" value={justification} /><Button type="submit" disabled={decisionPending || combinedPending}><Check className="size-4" />{decisionPending ? "Aprovando…" : "Aprovar"}</Button>
        </form>
        <form action={decisionAction} onSubmit={(event) => { if (!window.confirm("Confirmar rejeição desta edição?")) event.preventDefault(); }}>
          {fields(key("rejection"))}<input type="hidden" name="decision" value="rejeitar" /><input type="hidden" name="justification" value={justification} /><Button type="submit" variant="destructive" disabled={decisionPending || combinedPending}><X className="size-4" />{decisionPending ? "Salvando…" : "Rejeitar"}</Button>
        </form>
        <form action={combinedAction} onSubmit={(event) => { if (!window.confirm("Aprovar e publicar esta edição agora? Esta ação executa duas operações auditáveis.")) event.preventDefault(); }}>
          {fields(key("approval-publication"))}<input type="hidden" name="decision" value="aprovar" /><input type="hidden" name="justification" value={justification} /><Button type="submit" variant="camini" disabled={combinedPending || decisionPending}><Globe2 className="size-4" />{combinedPending ? "Processando…" : "Aprovar e publicar"}</Button>
        </form>
      </div>
      <Result result={decisionResult} /><Result result={combinedResult} />
    </>}
    {isApproved && <>
      <p className="text-sm leading-6 text-muted-foreground">A edição está aprovada. A publicação é uma operação explícita e separada, com nova chave de idempotência, timestamp e auditoria.</p>
      <form action={publishAction} onSubmit={(event) => { if (!window.confirm("Publicar esta edição na área pública?")) event.preventDefault(); }}>
        {fields(key("publication"))}<Button type="submit" variant="camini" disabled={publishPending}><Globe2 className="size-4" />{publishPending ? "Publicando…" : "Publicar edição"}</Button>
      </form>
      <Result result={publishResult} />
    </>}
    {!isCandidate && !isApproved && <p className="text-sm text-muted-foreground">Esta edição não está em um estado que permita nova decisão ou publicação.</p>}
  </CardContent></Card>;
}
