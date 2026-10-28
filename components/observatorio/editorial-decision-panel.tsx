"use client";

import { useActionState, useState } from "react";
import { Check, Globe2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { approveAndPublishEditorialEdition, decideEditorialEdition, publishEditorialEdition, type ActionResult } from "@/app/dashboard/observatorio/actions";
import { useEditorialHmlSession } from "./editorial-hml-session";

const initial: ActionResult | null = null;

function key(prefix: string) { return `${prefix}-${crypto.randomUUID()}`; }

function Result({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return <div role="status" className={`rounded-lg border p-3 text-sm ${result.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-destructive/30 bg-destructive/10 text-destructive"}`}><p>{result.ok ? result.message : result.error}</p>{result.ok && result.publicUrl && <a className="mt-2 inline-block font-medium underline" href={result.publicUrl}>Abrir edicao publica</a>}</div>;
}

export function EditorialDecisionPanel({ editionId, identifier, channel, version, contentHash, status }: { editionId: string; identifier: string; channel: string; version: number; contentHash: string; status: string }) {
  const [decisionResult, decisionAction, decisionPending] = useActionState(async (_: ActionResult | null, formData: FormData) => decideEditorialEdition(formData), initial);
  const [publishResult, publishAction, publishPending] = useActionState(async (_: ActionResult | null, formData: FormData) => publishEditorialEdition(formData), initial);
  const [combinedResult, combinedAction, combinedPending] = useActionState(async (_: ActionResult | null, formData: FormData) => approveAndPublishEditorialEdition(formData), initial);
  const [justification, setJustification] = useState("");
  const [approvalKey] = useState(() => key("approval"));
  const [rejectionKey] = useState(() => key("rejection"));
  const [approvalPublicationKey] = useState(() => key("approval-publication"));
  const [publicationKey] = useState(() => key("publication"));
  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    variant?: "default" | "destructive" | "camini";
    formId: string;
  } | null>(null);
  const { accessToken, status: editorialStatus } = useEditorialHmlSession();
  const editorialReady = editorialStatus === "authenticated" && Boolean(accessToken);
  const isCandidate = status === "candidata";
  const isApproved = status === "aprovada";
  const fields = (idempotencyKey: string) => <>
    <input type="hidden" name="edition_id" value={editionId} />
    <input type="hidden" name="identifier" value={identifier} />
    <input type="hidden" name="channel" value={channel} />
    <input type="hidden" name="version" value={version} />
    <input type="hidden" name="content_hash" value={contentHash} />
    <input type="hidden" name="idempotency_key" value={idempotencyKey} />
    <input type="hidden" name="editorial_access_token" value={accessToken ?? ""} />
  </>;

  return (
    <Card variant="elevated" className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Decisão editorial</CardTitle>
          <Badge variant={isCandidate ? "warning" : isApproved ? "success" : "outline"}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCandidate && (
          <>
            <label className="block text-sm font-medium">
              Justificativa <span className="font-normal text-muted-foreground">(mínimo de 10 caracteres)</span>
              <textarea
                name="justification"
                required
                minLength={10}
                value={justification}
                onChange={(event) => setJustification(event.target.value)}
                className="mt-2 min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Registre o fundamento editorial da decisão."
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <form id="form-approve" action={decisionAction}>
                {fields(approvalKey)}
                <input type="hidden" name="decision" value="aprovar" />
                <input type="hidden" name="justification" value={justification} />
                <Button
                  type="button"
                  disabled={!editorialReady || decisionPending || combinedPending || justification.trim().length < 10}
                  onClick={() => setPendingConfirm({
                    title: "Confirmar aprovação",
                    description: "Deseja confirmar a aprovação editorial desta edição?",
                    confirmLabel: "Aprovar edição",
                    variant: "default",
                    formId: "form-approve",
                  })}
                >
                  <Check className="size-4" />{decisionPending ? "Aprovando…" : "Aprovar"}
                </Button>
              </form>

              <form id="form-reject" action={decisionAction}>
                {fields(rejectionKey)}
                <input type="hidden" name="decision" value="rejeitar" />
                <input type="hidden" name="justification" value={justification} />
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!editorialReady || decisionPending || combinedPending || justification.trim().length < 10}
                  onClick={() => setPendingConfirm({
                    title: "Confirmar rejeição",
                    description: "Deseja confirmar a rejeição desta edição?",
                    confirmLabel: "Rejeitar edição",
                    variant: "destructive",
                    formId: "form-reject",
                  })}
                >
                  <X className="size-4" />{decisionPending ? "Salvando…" : "Rejeitar"}
                </Button>
              </form>

              <form id="form-combined" action={combinedAction}>
                {fields(approvalPublicationKey)}
                <input type="hidden" name="decision" value="aprovar" />
                <input type="hidden" name="justification" value={justification} />
                <Button
                  type="button"
                  variant="camini"
                  disabled={!editorialReady || combinedPending || decisionPending || justification.trim().length < 10}
                  onClick={() => setPendingConfirm({
                    title: "Aprovar e publicar agora",
                    description: "Aprovar e publicar esta edição agora? Esta ação executa duas operações auditáveis.",
                    confirmLabel: "Aprovar e publicar",
                    variant: "camini",
                    formId: "form-combined",
                  })}
                >
                  <Globe2 className="size-4" />{combinedPending ? "Processando…" : "Aprovar e publicar"}
                </Button>
              </form>
            </div>
            <Result result={decisionResult} />
            <Result result={combinedResult} />
          </>
        )}
        {isApproved && (
          <>
            <p className="text-sm leading-6 text-muted-foreground">
              A edição está aprovada. A publicação é uma operação explícita e separada, com nova chave de idempotência, timestamp e auditoria.
            </p>
            <form id="form-publish" action={publishAction}>
              {fields(publicationKey)}
              <Button
                type="button"
                variant="camini"
                disabled={!editorialReady || publishPending}
                onClick={() => setPendingConfirm({
                  title: "Publicar edição",
                  description: "Publicar esta edição na área pública do Observatório?",
                  confirmLabel: "Publicar edição",
                  variant: "camini",
                  formId: "form-publish",
                })}
              >
                <Globe2 className="size-4" />{publishPending ? "Publicando…" : "Publicar edição"}
              </Button>
            </form>
            <Result result={publishResult} />
          </>
        )}
        {!isCandidate && !isApproved && (
          <p className="text-sm text-muted-foreground">Esta edição não está em um estado que permita nova decisão ou publicação.</p>
        )}
      </CardContent>

      {/* Modal de Confirmação Editorial */}
      <AlertDialog open={Boolean(pendingConfirm)} onOpenChange={(open) => !open && setPendingConfirm(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl p-6 bg-background border border-border shadow-2xl">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              {pendingConfirm?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {pendingConfirm?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 pt-4">
            <AlertDialogCancel onClick={() => setPendingConfirm(null)} className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingConfirm) {
                  const form = document.getElementById(pendingConfirm.formId) as HTMLFormElement | null;
                  form?.requestSubmit();
                  setPendingConfirm(null);
                }
              }}
              className={`rounded-xl font-medium ${
                pendingConfirm?.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : pendingConfirm?.variant === "camini"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : ""
              }`}
            >
              {pendingConfirm?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
