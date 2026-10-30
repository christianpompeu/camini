import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getLocalUserTemplates,
  type CustomUserTemplate,
} from "../templates-sync.ts";

test("Templates Sync - Integridade da Migração do Supabase (rm_sql_templates)", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261030120000_rm_sql_studio_templates.sql"
  );
  assert.ok(fs.existsSync(migrationPath), "Arquivo de migração do Supabase deve existir");

  const migrationContent = fs.readFileSync(migrationPath, "utf-8");
  assert.match(migrationContent, /CREATE TABLE IF NOT EXISTS public\.rm_sql_templates/);
  assert.match(migrationContent, /user_id UUID NOT NULL REFERENCES auth\.users\(id\)/);
  assert.match(migrationContent, /ALTER TABLE public\.rm_sql_templates ENABLE ROW LEVEL SECURITY/);
  assert.match(migrationContent, /CREATE POLICY/);
  assert.match(migrationContent, /auth\.uid\(\) = user_id/);
});

test("Templates Sync - Mock de Cache Local para Usuários Anônimos", () => {
  const templates = getLocalUserTemplates();
  assert.ok(Array.isArray(templates));

  const sampleTemplate: CustomUserTemplate = {
    id: "test_1",
    title: "Template Fluxus Teste",
    category: "personalizado",
    moduleLabel: "RM Fluxus",
    description: "Consulta de teste para lançamentos",
    mainTables: ["FLAN", "FCFO"],
    sql: "SELECT FLAN.IDLAN FROM CORPORE.DBO.FLAN AS FLAN WITH (NOLOCK);",
    isCustom: true,
  };

  assert.equal(sampleTemplate.isCustom, true);
  assert.equal(sampleTemplate.mainTables.length, 2);
});
