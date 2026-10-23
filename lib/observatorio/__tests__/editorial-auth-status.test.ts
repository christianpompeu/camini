import assert from "node:assert/strict";
import test from "node:test";
import { resolveEditorialHmlStatus } from "../editorial-auth-status.ts";

test("revisor HML ativo aparece como autorizado", () => {
  assert.equal(resolveEditorialHmlStatus({ userId: "hml-reviewer", authError: false, allowlist: { ativo: true }, queryError: false }), "authorized");
});

test("separa expiracao, ausencia de allowlist e erro de consulta", () => {
  assert.equal(resolveEditorialHmlStatus({ userId: null, authError: true, allowlist: null, queryError: false }), "expired");
  assert.equal(resolveEditorialHmlStatus({ userId: "hml-user", authError: false, allowlist: null, queryError: false }), "unauthorized");
  assert.equal(resolveEditorialHmlStatus({ userId: "hml-user", authError: false, allowlist: null, queryError: true }), "error");
});
