"use server";

import { revalidatePath } from "next/cache";
import { getAuthorizedObservatorioActionClient } from "@/lib/observatorio/server";
import { readPublicEdition } from "@/lib/observatorio/public";
import type { CanalObservatorio } from "@/lib/observatorio/types";

export type ActionResult = { ok: true; status?: string; replay?: boolean; message: string } | { ok: false; error: string };

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function channel(formData: FormData): CanalObservatorio {
  const value = text(formData, "channel");
  if (value !== "panorama" && value !== "tech") throw new Error("invalid_channel");
  return value;
}

function payload(formData: FormData, idempotencyKey: string) {
  return {
    edition_id: text(formData, "edition_id"),
    identifier: text(formData, "identifier"),
    version: text(formData, "version"),
    content_hash: text(formData, "content_hash"),
    decision: text(formData, "decision"),
    justification: text(formData, "justification"),
    idempotency_key: idempotencyKey,
  };
}

async function callRpc(name: string, body: Record<string, string>) {
  const client = await getAuthorizedObservatorioActionClient();
  const rpcClient = client as unknown as { rpc: (fn: string, args: { p_payload: Record<string, string> }) => Promise<{ data: unknown; error: { message: string } | null }> };
  const response = await rpcClient.rpc(name, { p_payload: body });
  if (response.error) throw new Error(response.error.message);
  return (response.data ?? {}) as { ok?: boolean; status?: string; replay?: boolean };
}

function revalidateEdition(identifier: string, channel: string) {
  revalidatePath("/dashboard/observatorio");
  revalidatePath("/dashboard/observatorio/edicoes");
  revalidatePath(`/dashboard/observatorio/edicoes/${encodeURIComponent(identifier)}`);
  revalidatePath(`/${channel}`);
  revalidatePath(`/${channel}/edicoes/${identifier}`);
}

export async function decideEditorialEdition(formData: FormData): Promise<ActionResult> {
  try {
    const decision = text(formData, "decision");
    if (decision !== "aprovar" && decision !== "rejeitar") return { ok: false, error: "Decisão inválida." };
    const identifier = text(formData, "identifier");
    const result = await callRpc("observatorio_decidir_edicao", payload(formData, text(formData, "idempotency_key")));
    revalidateEdition(identifier, text(formData, "channel"));
    return { ok: true, status: result.status, replay: result.replay, message: result.replay ? "Replay idempotente confirmado." : `Edição ${decision === "aprovar" ? "aprovada" : "rejeitada"} com auditoria registrada.` };
  } catch {
    return { ok: false, error: "Não foi possível persistir a decisão. Verifique a sessão, a permissão e a integridade da edição." };
  }
}

export async function publishEditorialEdition(formData: FormData): Promise<ActionResult> {
  try {
    const identifier = text(formData, "identifier");
    const channelValue = channel(formData);
    const result = await callRpc("observatorio_publicar_edicao", {
      edition_id: text(formData, "edition_id"),
      identifier,
      version: text(formData, "version"),
      content_hash: text(formData, "content_hash"),
      idempotency_key: text(formData, "idempotency_key"),
    });
    const publicEdition = await readPublicEdition(channelValue, identifier);
    if (!publicEdition || publicEdition.status !== "publicada") {
      throw new Error("public_query_did_not_accept_edition");
    }
    revalidateEdition(identifier, channelValue);
    return { ok: true, status: result.status, replay: result.replay, message: result.replay ? "Replay de publicação confirmado." : "Publicação registrada; a página pública foi revalidada." };
  } catch {
    return { ok: false, error: "Não foi possível publicar. A edição precisa estar aprovada e íntegra." };
  }
}

export async function approveAndPublishEditorialEdition(formData: FormData): Promise<ActionResult> {
  const approval = await decideEditorialEdition(formData);
  if (!approval.ok) return approval;
  const publicationData = new FormData();
  for (const [name, value] of formData.entries()) publicationData.append(name, value);
  publicationData.set("idempotency_key", `publication-after-${text(formData, "idempotency_key")}`);
  const publication = await publishEditorialEdition(publicationData);
  if (!publication.ok) return { ok: false, error: `A aprovação foi registrada, mas a publicação não foi concluída: ${publication.error}` };
  return { ok: true, status: publication.status, replay: publication.replay, message: "Aprovação e publicação concluídas como operações auditáveis separadas." };
}
