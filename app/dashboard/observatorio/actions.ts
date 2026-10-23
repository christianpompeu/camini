"use server";

import { revalidatePath } from "next/cache";
import { getAuthorizedObservatorioActionClient } from "@/lib/observatorio/server";
import { readPublicEdition } from "@/lib/observatorio/public";
import type { CanalObservatorio } from "@/lib/observatorio/types";

export type ActionResult = { ok: true; status?: string; replay?: boolean; message: string; publicUrl?: string } | { ok: false; error: string };

function text(formData: FormData, key: string): string { return String(formData.get(key) ?? "").trim(); }

function channel(formData: FormData): CanalObservatorio {
  const value = text(formData, "channel");
  if (value !== "panorama" && value !== "tech") throw new Error("invalid_channel");
  return value;
}

function payload(formData: FormData, idempotencyKey: string) {
  return {
    edition_id: text(formData, "edition_id"), identifier: text(formData, "identifier"), version: text(formData, "version"),
    content_hash: text(formData, "content_hash"), decision: text(formData, "decision"), justification: text(formData, "justification"),
    idempotency_key: idempotencyKey,
  };
}

async function callRpc(name: string, accessToken: string, body: Record<string, string>) {
  const client = await getAuthorizedObservatorioActionClient(accessToken);
  const rpcClient = client as unknown as { rpc: (fn: string, args: { p_payload: Record<string, string> }) => Promise<{ data: unknown; error: { message: string } | null }> };
  const response = await rpcClient.rpc(name, { p_payload: body });
  if (response.error) throw new Error(response.error.message);
  return (response.data ?? {}) as { ok?: boolean; status?: string; replay?: boolean };
}

export async function getEditorialHmlStatus(accessToken: string): Promise<"authorized" | "unauthorized" | "expired"> {
  try {
    const client = await getAuthorizedObservatorioActionClient(accessToken);
    const { data: { user }, error: userError } = await client.auth.getUser(accessToken);
    if (userError || !user?.id) return "expired";
    const allowlistClient = client as unknown as {
      from: (table: "observatorio_revisores_edicoes") => {
        select: (columns: "ativo") => { eq: (column: "user_id", value: string) => Promise<{ data: { ativo: boolean } | null; error: unknown }> };
      };
    };
    const { data, error } = await allowlistClient.from("observatorio_revisores_edicoes").select("ativo").eq("user_id", user.id);
    if (error) return "expired";
    return data?.ativo === true ? "authorized" : "unauthorized";
  } catch { return "expired"; }
}

function revalidateEdition(identifier: string, channelValue: string) {
  revalidatePath("/dashboard/observatorio"); revalidatePath("/dashboard/observatorio/edicoes");
  revalidatePath(`/dashboard/observatorio/edicoes/${encodeURIComponent(identifier)}`);
  revalidatePath(`/${channelValue}`); revalidatePath(`/${channelValue}/edicoes/${identifier}`);
}

export async function decideEditorialEdition(formData: FormData): Promise<ActionResult> {
  try {
    const accessToken = text(formData, "editorial_access_token");
    if (!accessToken) return { ok: false, error: "Conecte a sessão editorial HML antes de decidir." };
    const decision = text(formData, "decision");
    if (decision !== "aprovar" && decision !== "rejeitar") return { ok: false, error: "Decisão inválida." };
    const identifier = text(formData, "identifier");
    const result = await callRpc("observatorio_decidir_edicao", accessToken, payload(formData, text(formData, "idempotency_key")));
    revalidateEdition(identifier, text(formData, "channel"));
    return { ok: true, status: result.status, replay: result.replay, message: result.replay ? "Replay idempotente confirmado." : `Edição ${decision === "aprovar" ? "aprovada" : "rejeitada"} com auditoria registrada.` };
  } catch { return { ok: false, error: "Não foi possível persistir a decisão. Verifique a sessão, a permissão e a integridade da edição." }; }
}

export async function publishEditorialEdition(formData: FormData): Promise<ActionResult> {
  let publicationRecorded = false;
  try {
    const accessToken = text(formData, "editorial_access_token");
    if (!accessToken) return { ok: false, error: "Conecte a sessão editorial HML antes de publicar." };
    const identifier = text(formData, "identifier");
    const channelValue = channel(formData);
    const result = await callRpc("observatorio_publicar_edicao", accessToken, {
      edition_id: text(formData, "edition_id"), identifier, version: text(formData, "version"), content_hash: text(formData, "content_hash"), idempotency_key: text(formData, "idempotency_key"),
    });
    publicationRecorded = true;
    const publicEdition = await readPublicEdition(channelValue, identifier);
    if (!publicEdition || publicEdition.status !== "publicada") return { ok: false, error: "Publicação registrada, mas a consulta pública não confirmou uma edição elegível. Interrompa a divulgação e verifique o HML." };
    revalidateEdition(identifier, channelValue);
    const publicUrl = `/${channelValue}/edicoes/${encodeURIComponent(identifier)}`;
    return { ok: true, status: result.status, replay: result.replay, publicUrl, message: result.replay ? "Replay de publicação confirmado; a página pública foi verificada." : "Publicação registrada e confirmada pela consulta pública." };
  } catch { return { ok: false, error: publicationRecorded ? "Publicação registrada, mas ocorreu uma falha posterior de verificação pública." : "Não foi possível publicar. A edição precisa estar aprovada e íntegra." }; }
}

export async function approveAndPublishEditorialEdition(formData: FormData): Promise<ActionResult> {
  const approval = await decideEditorialEdition(formData);
  if (!approval.ok) return approval;
  const publicationData = new FormData();
  for (const [name, value] of formData.entries()) publicationData.append(name, value);
  publicationData.set("idempotency_key", `publication-after-${text(formData, "idempotency_key")}`);
  const publication = await publishEditorialEdition(publicationData);
  if (!publication.ok) return { ok: false, error: `A aprovação foi registrada, mas a publicação não foi concluída: ${publication.error}` };
  return { ok: true, status: publication.status, replay: publication.replay, publicUrl: publication.publicUrl, message: "Aprovação e publicação concluídas como operações auditáveis separadas." };
}
