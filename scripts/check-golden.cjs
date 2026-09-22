/**
 * Golden set do gerador SQL RM: verifica tabelas recuperadas, trechos do SQL
 * e ausência de sintaxe Oracle. Uso:
 *   1. npm run build && (npm start -- --port 3100 &)
 *   2. node scripts/check-golden.cjs http://localhost:3100
 */
const fs = require("fs");
const path = require("path");

const BASE = process.argv[2] || "http://localhost:3100";
const ORACLE_TOKENS = ["NVL(", "SYSDATE", "FETCH FIRST", "VARCHAR2", "FROM DUAL", "CONNECT BY", ".NEXTVAL", ":="];

async function postChat(prompt, dialect) {
  const res = await fetch(`${BASE}/api/totvs-rm/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }], dialect }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function hasBindVar(sql) {
  const m = sql.match(/(^|[\s,(=]):([A-Za-z_][A-Za-z0-9_]*)/);
  return m ? m[0] : null;
}

async function main() {
  const golden = JSON.parse(fs.readFileSync(path.join(__dirname, "rm-golden.json"), "utf8"));
  let failed = 0;
  for (const c of golden.cases) {
    const problems = [];
    try {
      const resp = await postChat(c.prompt, c.dialect);
      const tables = (resp.tablesUsed || []).map((t) => String(t).toUpperCase());
      for (const t of c.expectTables) {
        if (!tables.includes(t)) problems.push(`tabela ausente: ${t} (veio: ${tables.join(",")})`);
      }
      const sql = resp.sqlCode || "";
      const upper = sql.toUpperCase();
      for (const s of c.expectSnippets) {
        if (!upper.includes(s.toUpperCase())) problems.push(`trecho ausente no SQL: ${s}`);
      }
      // Asserção semântica: trechos proibidos (ex.: filtros do cenário errado)
      for (const s of c.expectAbsent || []) {
        if (upper.includes(s.toUpperCase())) problems.push(`trecho proibido no SQL: ${s}`);
      }
      for (const tok of ORACLE_TOKENS) {
        if (upper.includes(tok)) problems.push(`token Oracle no SQL: ${tok}`);
      }
      const bind = hasBindVar(sql);
      if (bind) problems.push(`bind Oracle no SQL: ${bind}`);
    } catch (err) {
      problems.push(`erro de requisição: ${err.message}`);
    }
    if (problems.length === 0) {
      console.log(`PASS ${c.name}`);
    } else {
      failed++;
      console.log(`FAIL ${c.name}`);
      for (const p of problems) console.log(`     - ${p}`);
    }
  }
  console.log(failed === 0 ? `GOLDEN OK (${golden.cases.length}/${golden.cases.length})` : `GOLDEN FALHOU (${failed} caso(s))`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
