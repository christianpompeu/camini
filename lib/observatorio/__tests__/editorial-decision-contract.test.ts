import assert from "node:assert/strict";
import test from "node:test";
import { validateEditorialDecision, type EditorialDecisionRequest, type EditorialDecisionState, type TrustedEditorialIdentity } from "../editorial-decision-contract.ts";

const identity: TrustedEditorialIdentity = { authenticated: true, userId: "camini-user", editorialPermission: true, revoked: false };
const state: EditorialDecisionState = { editionId: "ed-1", identifier: "2026-10-22-tech", version: 1, status: "candidata", contentHash: "a".repeat(64), locked: false };
const request: EditorialDecisionRequest = { editionId: "ed-1", identifier: "2026-10-22-tech", version: 1, contentHash: "a".repeat(64), decision: "aprovar", justification: "Revisão editorial concluída", idempotencyKey: "decision-1" };

test("rejeita usuário sem sessão e leitor sem permissão editorial", () => {
  assert.equal(validateEditorialDecision(request, null, state).reason, "unauthenticated");
  assert.equal(validateEditorialDecision(request, { ...identity, editorialPermission: false }, state).reason, "editorial_permission_required");
});

test("rejeita revisor revogado e identidade forjada pelo cliente", () => {
  assert.equal(validateEditorialDecision(request, { ...identity, revoked: true }, state).reason, "editorial_permission_revoked");
  assert.equal(validateEditorialDecision({ ...request, actorUserId: "forged-user" }, identity, state).reason, "client_identity_forbidden");
});

test("rejeita hash/versão obsoletos e concorrência", () => {
  assert.equal(validateEditorialDecision({ ...request, contentHash: "b".repeat(64) }, identity, state).reason, "stale_content_hash");
  assert.equal(validateEditorialDecision({ ...request, version: 2 }, identity, state).reason, "stale_version");
  assert.equal(validateEditorialDecision(request, identity, { ...state, locked: true }).reason, "concurrent_decision");
});

test("replay idempotente é aceito sem segunda decisão; chave reutilizada com payload diferente é rejeitada", () => {
  const first = validateEditorialDecision(request, identity, state);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const replay = validateEditorialDecision(request, identity, { ...state, status: "aprovada" }, [{ idempotencyKey: request.idempotencyKey, fingerprint: first.fingerprint, actorUserId: identity.userId!, result: "aprovada" }]);
  assert.deepEqual(replay, { ok: true, fingerprint: first.fingerprint, replay: true });
  const reused = validateEditorialDecision({ ...request, justification: "Justificativa materialmente diferente" }, identity, state, [{ idempotencyKey: request.idempotencyKey, fingerprint: first.fingerprint, actorUserId: identity.userId!, result: "aprovada" }]);
  assert.equal(reused.reason, "idempotency_key_reused");
});

test("mesma chave não pode ser usada por outro revisor ou fingerprint inconsistente", () => {
  const first = validateEditorialDecision(request, identity, state);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const previous = [{ idempotencyKey: request.idempotencyKey, fingerprint: first.fingerprint, actorUserId: identity.userId!, result: "aprovada" as const }];
  assert.equal(validateEditorialDecision(request, { ...identity, userId: "other-reviewer" }, { ...state, status: "aprovada" }, previous).reason, "idempotency_key_reused");
  assert.equal(validateEditorialDecision(request, identity, { ...state, status: "aprovada" }, [{ ...previous[0], fingerprint: `${first.fingerprint}x` }]).reason, "idempotency_key_reused");
});

test("não altera decisão já encerrada nem permite snapshot aprovado mutável", () => {
  assert.equal(validateEditorialDecision(request, identity, { ...state, status: "aprovada" }).reason, "editorial_state_not_candidate");
  assert.equal(validateEditorialDecision(request, identity, { ...state, status: "publicada" }).reason, "editorial_state_not_candidate");
});
