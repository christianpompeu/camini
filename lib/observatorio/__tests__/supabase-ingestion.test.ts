import assert from "node:assert/strict";
import test from "node:test";

import type { Json } from "@/lib/supabase/database.types";
import { ObservatorioRepositoryError, ObservatorioValidationError } from "../errors.ts";
import { executeObservatorioIngestion } from "../supabase-ingestion.ts";
import { inauguralBatchFixture } from "./fixtures.ts";

test("adaptador valida, normaliza e chama somente a RPC de ingestao", async () => {
  let received: { fn: string; args: { p_payload: Json } } | undefined;
  const client = {
    rpc: async (fn: string, args: { p_payload: Json }) => {
      received = { fn, args };
      return {
        data: {
          run_key: "observatorio-tech-2026-10-20-fixture",
          round_id: "00000000-0000-0000-0000-000000000001",
          inserted: { sources: 2, articles: 2, events: 2, relations: 1, evidences: 2 },
        },
        error: null,
      };
    },
  };

  const result = await executeObservatorioIngestion(client as never, inauguralBatchFixture());

  assert.equal(received?.fn, "observatorio_ingest_lote");
  const payload = received?.args.p_payload as { sources: Array<{ articles: Json[] }> };
  assert.equal(payload.sources.length, 2);
  assert.equal(payload.sources[0].articles.length, 1);
  assert.deepEqual(result.inseridos, {
    fontes: 2,
    materias: 2,
    eventos: 2,
    relacoes: 1,
    evidencias: 2,
  });
});

test("adaptador rejeita payload invalido antes de acessar o Supabase", async () => {
  let called = false;
  const client = {
    rpc: async () => {
      called = true;
      return { data: null, error: null };
    },
  };

  await assert.rejects(
    () => executeObservatorioIngestion(client as never, {}),
    ObservatorioValidationError
  );
  assert.equal(called, false);
});

test("adaptador nao repassa detalhes crus de falha do banco", async () => {
  const client = {
    rpc: async () => ({
      data: null,
      error: { code: "42501", message: "segredo interno do banco" },
    }),
  };

  await assert.rejects(
    () => executeObservatorioIngestion(client as never, inauguralBatchFixture()),
    (error: unknown) =>
      error instanceof ObservatorioRepositoryError &&
      !error.message.includes("segredo interno do banco")
  );
});
