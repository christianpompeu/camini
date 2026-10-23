export type EditorialDecision = "aprovar" | "rejeitar";

export interface EditorialDecisionRequest {
  editionId: string;
  identifier: string;
  version: number;
  contentHash: string;
  decision: EditorialDecision;
  justification: string;
  idempotencyKey: string;
  /** Client identity is never accepted; the server resolves identity separately. */
  actorUserId?: unknown;
}

export interface TrustedEditorialIdentity {
  authenticated: boolean;
  userId: string | null;
  editorialPermission: boolean;
  revoked: boolean;
}

export interface EditorialDecisionState {
  editionId: string;
  identifier: string;
  version: number;
  status: "candidata" | "aprovada" | "rejeitada" | "publicada" | "arquivada";
  contentHash: string;
  locked: boolean;
}

export interface StoredDecisionFingerprint {
  idempotencyKey: string;
  fingerprint: string;
  actorUserId: string;
  result: "aprovada" | "rejeitada";
}

export type EditorialDecisionValidation =
  | { ok: true; fingerprint: string; replay: boolean; reason?: never }
  | { ok: false; reason: string };

function normalized(value: string): string {
  return value.trim();
}

function fingerprint(request: EditorialDecisionRequest, actorUserId: string): string {
  return JSON.stringify({
    actorUserId,
    contentHash: request.contentHash,
    decision: request.decision,
    editionId: request.editionId,
    identifier: request.identifier,
    justification: normalized(request.justification),
    version: request.version,
  });
}

export function validateEditorialDecision(
  request: EditorialDecisionRequest,
  identity: TrustedEditorialIdentity | null,
  state: EditorialDecisionState,
  previous: StoredDecisionFingerprint[] = []
): EditorialDecisionValidation {
  if (!identity?.authenticated || !identity.userId) return { ok: false, reason: "unauthenticated" };
  if (!identity.editorialPermission) return { ok: false, reason: "editorial_permission_required" };
  if (identity.revoked) return { ok: false, reason: "editorial_permission_revoked" };
  if (request.actorUserId !== undefined) return { ok: false, reason: "client_identity_forbidden" };
  if (!request.editionId || !request.identifier || !request.contentHash || !request.idempotencyKey) return { ok: false, reason: "required_fields" };
  if (!Number.isInteger(request.version) || request.version < 1) return { ok: false, reason: "invalid_version" };
  if (!(request.decision === "aprovar" || request.decision === "rejeitar")) return { ok: false, reason: "invalid_decision" };
  if (normalized(request.justification).length < 10) return { ok: false, reason: "justification_required" };
  const currentFingerprint = fingerprint(request, identity.userId);
  const sameKey = previous.find((item) => item.idempotencyKey === request.idempotencyKey);
  if (sameKey) {
    if (sameKey.fingerprint === currentFingerprint && sameKey.actorUserId === identity.userId && ((request.decision === "aprovar" && sameKey.result === "aprovada") || (request.decision === "rejeitar" && sameKey.result === "rejeitada"))) {
      return { ok: true, fingerprint: currentFingerprint, replay: true };
    }
    return { ok: false, reason: "idempotency_key_reused" };
  }
  if (state.editionId !== request.editionId || state.identifier !== request.identifier) return { ok: false, reason: "edition_identity_mismatch" };
  if (state.status !== "candidata") return { ok: false, reason: "editorial_state_not_candidate" };
  if (state.locked) return { ok: false, reason: "concurrent_decision" };
  if (state.version !== request.version) return { ok: false, reason: "stale_version" };
  if (state.contentHash !== request.contentHash) return { ok: false, reason: "stale_content_hash" };
  return { ok: true, fingerprint: currentFingerprint, replay: false };
}
