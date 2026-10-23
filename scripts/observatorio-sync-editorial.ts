import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply-hml");
const identifierArg = process.argv.find((arg) => arg.startsWith("--identifier="));
const runKeyArg = process.argv.find((arg) => arg.startsWith("--run-key="));

const { applySingleEditorialPlan, dryRunEditorialSync } = await import(
  "../lib/observatorio/editorial-sync.ts"
);

const plan = await dryRunEditorialSync();
const printable = {
  mode: plan.mode,
  generatedAt: plan.generatedAt,
  hmlProject: plan.hmlProject,
  counts: plan.counts,
  items: plan.items.map((item) => ({
    identificador: item.identificador,
    notionPageId: item.notionPageId,
    declaredSupabaseId: item.declaredSupabaseId,
    existingSupabaseId: item.existingSupabaseId,
    action: item.action,
    skipped: item.action === "unchanged",
    reason: item.reason,
    warnings: item.warnings,
    changedFields: item.changedFields,
    currentVersion: item.currentVersion,
    plannedVersion: item.plannedVersion,
    contentHash: item.contentHash,
    blockCount: item.blockCount,
  })),
};
console.log(JSON.stringify(printable, null, 2));

if (apply) {
  const identifier = identifierArg?.slice("--identifier=".length);
  const runKey = runKeyArg?.slice("--run-key=".length);
  if (!identifier || !runKey) {
    throw new Error("Apply exige --identifier=<uma-edicao> e --run-key=<chave-unica>.");
  }
  const result = await applySingleEditorialPlan(plan, identifier, runKey);
  console.log(JSON.stringify({ mode: "apply-hml", identifier, result }, null, 2));
}
