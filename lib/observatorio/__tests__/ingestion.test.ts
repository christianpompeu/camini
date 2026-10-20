import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { ObservatorioValidationError } from "../errors.ts";
import { ingestObservatorioBatch } from "../ingestion.ts";
import { canonicalizeUrl, normalizeTimestamp } from "../normalization.ts";
import { isPublicEdition } from "../publication.ts";
import { InMemoryObservatorioRepository } from "../repository.ts";
import type { Edicao } from "../types.ts";
import { validateAndNormalizeBatch } from "../validation.ts";
import { inauguralBatchFixture } from "./fixtures.ts";

test("baseline SQL cobre as dez tabelas e nao contem DDL destrutivo", () => {
  const migrationUrl = new URL(
    "../../../supabase/migrations/20261020123117_observatorio_camini_grafo_v1.sql",
    import.meta.url
  );
  const sql = readFileSync(migrationUrl, "utf8");
  const tables = sql.match(/create table public\.observatorio_[a-z_]+/g) ?? [];
  const rls = sql.match(/enable row level security/g) ?? [];

  assert.equal(tables.length, 10);
  assert.equal(new Set(tables).size, 10);
  assert.equal(rls.length, 10);
  assert.doesNotMatch(sql, /\b(drop|truncate)\b/i);
  assert.match(sql, /revoke all on table[\s\S]+from anon, authenticated/i);
});

test("normaliza URL, parametros de tracking e fuso horario", () => {
  assert.equal(
    canonicalizeUrl("HTTPS://Example.COM:443/a//b/?utm_source=x&b=2&a=1#fragment"),
    "https://example.com/a/b?a=1&b=2"
  );
  assert.equal(
    normalizeTimestamp("2026-10-20T09:00:00-03:00"),
    "2026-10-20T12:00:00.000Z"
  );
  assert.throws(
    () => normalizeTimestamp("2026-10-20T09:00:00"),
    ObservatorioValidationError
  );
});

test("reprocessa o mesmo lote sem duplicar registros ou evidencias", async () => {
  const repository = new InMemoryObservatorioRepository();
  const fixture = inauguralBatchFixture();

  const first = await ingestObservatorioBatch(repository, fixture);
  assert.deepEqual(first.rodadas, { inseridos: 1, atualizados: 0, inalterados: 0 });
  assert.deepEqual(first.fontes, { inseridos: 2, atualizados: 0, inalterados: 0 });
  assert.deepEqual(first.materias, { inseridos: 2, atualizados: 0, inalterados: 0 });
  assert.deepEqual(first.eventos, { inseridos: 2, atualizados: 0, inalterados: 0 });
  assert.deepEqual(first.vinculos, { inseridos: 2, atualizados: 0, inalterados: 0 });
  assert.deepEqual(first.relacoes, { inseridos: 1, atualizados: 0, inalterados: 0 });
  assert.deepEqual(first.evidencias, { inseridos: 2, atualizados: 0, inalterados: 0 });

  const afterFirstRun = repository.snapshot();
  const second = await ingestObservatorioBatch(repository, fixture);

  for (const counter of [
    second.rodadas,
    second.fontes,
    second.materias,
    second.eventos,
    second.vinculos,
    second.relacoes,
    second.evidencias,
  ]) {
    assert.equal(counter.inseridos, 0);
    assert.equal(counter.atualizados, 0);
    assert.ok(counter.inalterados > 0);
  }
  assert.deepEqual(repository.snapshot(), afterFirstRun);
});

test("reverte o lote inteiro quando uma referencia falha", async () => {
  const repository = new InMemoryObservatorioRepository();
  const fixture = inauguralBatchFixture();
  fixture.relacoes![0].eventoDestinoChave = "evento-ausente";

  await assert.rejects(() => ingestObservatorioBatch(repository, fixture));
  const snapshot = repository.snapshot();
  assert.deepEqual(
    Object.values(snapshot).map((records) => records.length),
    [0, 0, 0, 0, 0, 0, 0]
  );
});

test("nao aceita causalidade sem base causal confirmada", () => {
  const fixture = inauguralBatchFixture();
  fixture.relacoes![0].tipo = "causal_comprovada";
  fixture.relacoes![0].evidenciaStatus = "correlacionado";

  assert.throws(
    () => validateAndNormalizeBatch(fixture),
    ObservatorioValidationError
  );
});

test("edicao candidata nao pertence a projecao publica", () => {
  const candidate: Edicao = {
    id: "candidate-id",
    identificador: "2026-10-20-tech-inaugural",
    canal: "tech",
    rodada_id: null,
    titulo: "Tech inaugural",
    resumo: "Edicao ainda em revisao.",
    status: "candidata",
    notion_page_id: null,
    notion_url: null,
    snapshot: null,
    versao: 1,
    criada_em: "2026-10-20T22:00:00.000Z",
    aprovada_em: null,
    publicada_em: null,
  };

  assert.equal(isPublicEdition(candidate), false);
  assert.equal(
    isPublicEdition({
      ...candidate,
      status: "publicada",
      aprovada_em: "2026-10-20T22:10:00.000Z",
      publicada_em: "2026-10-20T22:15:00.000Z",
      snapshot: { schemaVersion: 1, editorial: { markdown: "Conteudo aprovado." } },
    }),
    true
  );
});
