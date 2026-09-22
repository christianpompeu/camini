/**
 * Verificador semântico do SQL gerado para o TOTVS RM (Fase D).
 *
 * Checa o SQL contra o plano determinístico (tabelas permitidas + JOINs do
 * dicionário) usando AST real (node-sql-parser, dialeto transactsql):
 *  - PARSE_ERROR: SQL não pôde ser analisado
 *  - UNKNOWN_TABLE: tabela fora do conjunto permitido (identificadas + pontes + CTEs)
 *  - JOIN_NOT_GROUNDED: igualdade de JOIN sem lastro no grafo do dicionário
 *    (aceita qualquer aresta do grafo, não só as do plano sequencial)
 *  - MISSING_FILTER: coluna obrigatória ausente no WHERE (ex.: CODCOLIGADA)
 *
 * Retorna problemas em PT-BR para realimentar o modelo (reparo 1x).
 * Módulo puro, testável offline via tsc + node.
 */
import { Parser } from "node-sql-parser";
import { loadSemanticDictionary } from "./schema-engine";

export interface VerifyProblem {
  code: "PARSE_ERROR" | "UNKNOWN_TABLE" | "JOIN_NOT_GROUNDED" | "MISSING_FILTER";
  message: string;
}

export interface VerifyInput {
  sql: string;
  /** Tabelas permitidas (identificadas + pontes), em qualquer caixa. */
  allowedTables: string[];
  /** JOINs do plano (informativos no diagnóstico / compatibilidade retroativa). */
  guaranteedJoins?: unknown[];
  /** Colunas que precisam aparecer no WHERE (ex.: ["CODCOLIGADA"]). */
  requiredFilters?: string[];
}

export interface VerifyResult {
  ok: boolean;
  problems: VerifyProblem[];
  /** Tabelas detectadas no SQL (maiúsculas). */
  tables: string[];
}

let parser: Parser | null = null;

function getParser(): Parser {
  if (!parser) parser = new Parser();
  return parser;
}

interface Equality {
  lTable: string;
  lCol: string;
  rTable: string;
  rCol: string;
}

let cachedGroundedJoins: Map<string, Set<string>> | null = null;

function tablePairKey(t1: string, t2: string): string {
  const a = t1.toUpperCase();
  const b = t2.toUpperCase();
  return a < b ? `${a}=${b}` : `${b}=${a}`;
}

function joinSignature(t1: string, c1: string[], t2: string, c2: string[]): string {
  const a = t1.toUpperCase();
  const b = t2.toUpperCase();
  const swap = a > b;
  const aTable = swap ? b : a;
  const bTable = swap ? a : b;
  const aCols = swap ? c2 : c1;
  const bCols = swap ? c1 : c2;
  
  const pairs = [];
  const n = Math.min(aCols.length, bCols.length);
  for (let i = 0; i < n; i++) {
    pairs.push(`${aTable}.${aCols[i]}=${bTable}.${bCols[i]}`);
  }
  return pairs.sort().join(" AND ");
}

export function getGroundedJoins(): Map<string, Set<string>> {
  if (cachedGroundedJoins) return cachedGroundedJoins;
  const dict = loadSemanticDictionary();
  const map = new Map<string, Set<string>>();
  for (const [origem, dados] of Object.entries(dict)) {
    for (const rel of dados.relacionamentos_saida || []) {
      const parts = rel.chaves_ligacao.split("=");
      if (parts.length === 2) {
        const leftCols = parts[0].split(",").map((c) => c.trim().toUpperCase());
        const rightCols = parts[1].split(",").map((c) => c.trim().toUpperCase());
        const key = tablePairKey(origem, rel.tabela_destino);
        const sig = joinSignature(origem, leftCols, rel.tabela_destino, rightCols);
        if (!map.has(key)) map.set(key, new Set());
        map.get(key)!.add(sig);
      }
    }
  }
  cachedGroundedJoins = map;
  return cachedGroundedJoins;
}

function isColumnRef(node: unknown): node is { type: string; table: string | null; column: string } {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as { type?: string }).type === "column_ref" &&
    typeof (node as { column?: unknown }).column === "string"
  );
}

/** Igualdades `A.x = B.y` dentro de ON (recursivo em AND). */
function collectOnEqualities(on: unknown, out: Equality[]): void {
  if (typeof on !== "object" || on === null) return;
  const node = on as { type?: string; operator?: string; left?: unknown; right?: unknown };
  if (node.type === "binary_expr" && node.operator === "AND") {
    collectOnEqualities(node.left, out);
    collectOnEqualities(node.right, out);
    return;
  }
  if (node.type === "binary_expr" && node.operator === "=" && isColumnRef(node.left) && isColumnRef(node.right)) {
    if (node.left.table && node.right.table) {
      out.push({ lTable: node.left.table, lCol: node.left.column, rTable: node.right.table, rCol: node.right.column });
    }
  }
}

/** Colunas referenciadas no WHERE (qualquer operador de comparação). */
function collectWhereColumns(where: unknown, out: Array<{ table: string | null; column: string }>): void {
  if (typeof where !== "object" || where === null) return;
  const node = where as { type?: string; table?: string | null; column?: unknown };
  if (node.type === "column_ref" && typeof node.column === "string") {
    out.push({ table: node.table ?? null, column: node.column });
    return;
  }
  for (const v of Object.values(where as Record<string, unknown>)) {
    if (typeof v === "object" && v !== null) collectWhereColumns(v, out);
  }
}

interface SelectStmt {
  type?: string;
  from?: Array<{
    table?: string;
    as?: string;
    db?: string;
    join?: string;
    on?: unknown;
    expr?: { ast?: unknown };
  }>;
  where?: unknown;
  with?: Array<{ name?: string | { value?: string } }> | null;
}

function cteName(raw: string | { value?: string } | undefined): string | null {
  if (!raw) return null;
  if (typeof raw === "string") return raw.toUpperCase();
  if (typeof raw.value === "string") return raw.value.toUpperCase();
  return null;
}

function selectStmts(parsed: unknown): SelectStmt[] {
  const out: SelectStmt[] = [];
  const visit = (node: unknown): void => {
    if (typeof node !== "object" || node === null) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const rec = node as Record<string, unknown> & { type?: string };
    if (rec.type === "select") out.push(node as unknown as SelectStmt);
    for (const v of Object.values(rec)) visit(v);
  };
  visit((parsed as { ast?: unknown }).ast ?? parsed);
  return out;
}

export function verifySql(input: VerifyInput): VerifyResult {
  const problems: VerifyProblem[] = [];
  const allowed = new Set(input.allowedTables.map((t) => t.toUpperCase().trim()).filter(Boolean));

  let stmts: SelectStmt[];
  try {
    const parsed: unknown = getParser().parse(input.sql, { database: "transactsql" });
    stmts = selectStmts(parsed);
    if (stmts.length === 0) {
      problems.push({ code: "PARSE_ERROR", message: "Não encontrei um SELECT analisável no SQL gerado." });
      return { ok: false, problems, tables: [] };
    }
  } catch (err) {
    problems.push({
      code: "PARSE_ERROR",
      message: `Não consegui analisar o SQL (${err instanceof Error ? err.message.slice(0, 160) : "erro desconhecido"}). Simplifique a consulta em T-SQL válido.`,
    });
    return { ok: false, problems, tables: [] };
  }

  // Mapa alias -> tabela real (maiúsculas) + conjunto de tabelas + CTEs
  const aliasToTable = new Map<string, string>();
  const tablesFound = new Set<string>();
  const cteNames = new Set<string>();
  for (const stmt of stmts) {
    for (const cte of stmt.with || []) {
      const name = cteName(cte.name);
      if (name) cteNames.add(name);
    }
    for (const f of stmt.from || []) {
      if (!f.table) continue;
      const real = f.table.toUpperCase();
      tablesFound.add(real);
      aliasToTable.set(real, real);
      if (f.as) aliasToTable.set(f.as.toUpperCase(), real);
    }
  }

  for (const t of tablesFound) {
    if (!allowed.has(t) && !cteNames.has(t)) {
      problems.push({
        code: "UNKNOWN_TABLE",
        message: `Tabela \`${t}\` não está no conjunto permitido (${Array.from(allowed).join(", ") || "vazio"}). Use apenas as tabelas do contexto.`,
      });
    }
  }

  // Pares de JOIN com lastro no dicionário (qualquer relacionamento)
  const groundedJoins = getGroundedJoins();

  for (const stmt of stmts) {
    for (const f of stmt.from || []) {
      if (!f.join || !f.on) continue;
      const eqs: Equality[] = [];
      collectOnEqualities(f.on, eqs);
      
      const grouped = new Map<string, Equality[]>();
      for (const eq of eqs) {
        const lt = aliasToTable.get(eq.lTable.toUpperCase()) || eq.lTable.toUpperCase();
        const rt = aliasToTable.get(eq.rTable.toUpperCase()) || eq.rTable.toUpperCase();
        if (cteNames.has(lt) || cteNames.has(rt)) continue;
        if (lt === rt) continue; // Bypass para auto-relacionamento garantido
        
        const key = tablePairKey(lt, rt);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(eq);
      }

      for (const [key, pairEqs] of grouped.entries()) {
        const [t1, t2] = key.split("=");
        const c1: string[] = [];
        const c2: string[] = [];
        for (const eq of pairEqs) {
           const lt = aliasToTable.get(eq.lTable.toUpperCase()) || eq.lTable.toUpperCase();
           if (lt === t1) {
             c1.push(eq.lCol.toUpperCase());
             c2.push(eq.rCol.toUpperCase());
           } else {
             c1.push(eq.rCol.toUpperCase());
             c2.push(eq.lCol.toUpperCase());
           }
        }
        const sig = joinSignature(t1, c1, t2, c2);
        const allowedSigs = groundedJoins.get(key);
        
        if (!allowedSigs || !allowedSigs.has(sig)) {
          problems.push({
            code: "JOIN_NOT_GROUNDED",
            message: `Junção entre \`${t1}\` e \`${t2}\` [${sig}] sem lastro no dicionário. Use EXCLUSIVAMENTE as condições da seção JOINS GARANTIDOS.`,
          });
        }
      }
    }
  }

  // Filtros obrigatórios no WHERE
  const required = (input.requiredFilters || []).map((c) => c.toUpperCase());
  if (required.length > 0) {
    const whereCols = new Set<string>();
    for (const stmt of stmts) {
      const cols: Array<{ table: string | null; column: string }> = [];
      collectWhereColumns(stmt.where, cols);
      for (const c of cols) whereCols.add(c.column.toUpperCase());
    }
    for (const r of required) {
      if (!whereCols.has(r)) {
        problems.push({
          code: "MISSING_FILTER",
          message: `Filtro obrigatório ausente no WHERE: \`${r}\`. Restrinja a consulta (ex.: por coligada) para aproveitar os índices do RM.`,
        });
      }
    }
  }

  // Dedup por código+mensagem (JOINs repetidos em subselects)
  const seen = new Set<string>();
  const deduped = problems.filter((p) => {
    const k = `${p.code}|${p.message}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return { ok: deduped.length === 0, problems: deduped, tables: Array.from(tablesFound) };
}

