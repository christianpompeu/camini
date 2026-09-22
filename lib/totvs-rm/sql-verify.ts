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

function pairKey(t1: string, c1: string, t2: string, c2: string): string {
  const a = `${t1.toUpperCase()}.${c1.toUpperCase()}`;
  const b = `${t2.toUpperCase()}.${c2.toUpperCase()}`;
  return a < b ? `${a}=${b}` : `${b}=${a}`;
}

let cachedGroundedPairs: Set<string> | null = null;

export function getGroundedJoinPairs(): Set<string> {
  if (cachedGroundedPairs) return cachedGroundedPairs;
  const dict = loadSemanticDictionary();
  const set = new Set<string>();
  for (const [origem, dados] of Object.entries(dict)) {
    for (const rel of dados.relacionamentos_saida || []) {
      const parts = rel.chaves_ligacao.split("=");
      if (parts.length === 2) {
        const leftCols = parts[0].split(",").map((c) => c.trim().toUpperCase());
        const rightCols = parts[1].split(",").map((c) => c.trim().toUpperCase());
        const n = Math.min(leftCols.length, rightCols.length);
        for (let i = 0; i < n; i++) {
          set.add(pairKey(origem, leftCols[i], rel.tabela_destino, rightCols[i]));
        }
      }
    }
  }
  cachedGroundedPairs = set;
  return cachedGroundedPairs;
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
  const grounded = getGroundedJoinPairs();

  for (const stmt of stmts) {
    for (const f of stmt.from || []) {
      if (!f.join || !f.on) continue;
      const eqs: Equality[] = [];
      collectOnEqualities(f.on, eqs);
      for (const eq of eqs) {
        const lt = aliasToTable.get(eq.lTable.toUpperCase()) || eq.lTable.toUpperCase();
        const rt = aliasToTable.get(eq.rTable.toUpperCase()) || eq.rTable.toUpperCase();
        if (cteNames.has(lt) || cteNames.has(rt)) continue;
        const key = pairKey(lt, eq.lCol, rt, eq.rCol);
        if (!grounded.has(key)) {
          problems.push({
            code: "JOIN_NOT_GROUNDED",
            message: `Junção \`${lt}.${eq.lCol} = ${rt}.${eq.rCol}\` sem lastro no dicionário. Use EXCLUSIVAMENTE as condições da seção JOINS GARANTIDOS.`,
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

/**
 * Adendo de reparo: anexado ao system prompt na 2ª tentativa, com o
 * diagnóstico do verificador + SQL rejeitado.
 */
export function buildRepairAddendum(problems: VerifyProblem[], rejectedSql: string, allowedTables: string[]): string {
  return `\n\nREPARO OBRIGATÓRIO — sua resposta anterior foi rejeitada pela verificação automática do dicionário RM:\n${problems.map((p) => `- [${p.code}] ${p.message}`).join("\n")}\n\nSQL rejeitado (não repita estes erros):\n\`\`\`sql\n${rejectedSql.slice(0, 4000)}\n\`\`\`\n\nTabelas permitidas nesta consulta: ${allowedTables.join(", ")}. Gere novamente o JSON completo corrigindo TODOS os itens acima.`;
}
