import fs from "fs";
import path from "path";

export interface JoinEdge {
  o: string; // tabela origem
  of: string[]; // campos da origem (chave composta)
  d: string; // tabela destino
  df: string[]; // campos do destino (chave composta)
  src: "glinksrel" | "master";
  mm: boolean; // true quando a contagem de campos origem/destino diverge
}

interface JoinGraphFile {
  version: number;
  builtAt: string;
  stats: Record<string, unknown>;
  edges: JoinEdge[];
}

export interface OrientedJoin {
  from: string;
  fromFields: string[];
  to: string;
  toFields: string[];
  mismatched: boolean;
}

const INDEX_FILE = path.join(process.cwd(), "public", "dicionario_rm", "index", "join-graph.json");

let cachedAdj: Map<string, Array<{ edge: JoinEdge; forward: boolean }>> | null = null;

function loadAdjacency(): Map<string, Array<{ edge: JoinEdge; forward: boolean }>> {
  if (cachedAdj) return cachedAdj;
  const adj = new Map<string, Array<{ edge: JoinEdge; forward: boolean }>>();
  try {
    if (!fs.existsSync(INDEX_FILE)) {
      console.warn("join-graph.json não encontrado em:", INDEX_FILE);
      cachedAdj = adj;
      return adj;
    }
    const parsed: JoinGraphFile = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
    for (const edge of parsed.edges || []) {
      if (!adj.has(edge.o)) adj.set(edge.o, []);
      if (!adj.has(edge.d)) adj.set(edge.d, []);
      adj.get(edge.o)!.push({ edge, forward: true });
      adj.get(edge.d)!.push({ edge, forward: false });
    }
  } catch (err) {
    console.error("Erro ao carregar grafo de JOINs RM:", err);
  }
  cachedAdj = adj;
  return adj;
}

function orient(entry: { edge: JoinEdge; forward: boolean }): OrientedJoin {
  const { edge, forward } = entry;
  return forward
    ? { from: edge.o, fromFields: edge.of, to: edge.d, toFields: edge.df, mismatched: edge.mm }
    : { from: edge.d, fromFields: edge.df, to: edge.o, toFields: edge.of, mismatched: edge.mm };
}

/**
 * Menor caminho (BFS) entre duas tabelas no grafo de JOINs.
 * Prefere arestas com chaves compostas íntegras (mm = false).
 */
export function findJoinPath(from: string, to: string, maxDepth = 4): OrientedJoin[] | null {
  const start = from.toUpperCase().trim();
  const target = to.toUpperCase().trim();
  if (!start || !target) return null;
  if (start === target) return [];

  const adj = loadAdjacency();
  if (!adj.has(start) || !adj.has(target)) return null;

  const visited = new Set<string>([start]);
  const queue: Array<{ node: string; path: OrientedJoin[] }> = [{ node: start, path: [] }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.path.length >= maxDepth) continue;

    // Arestas íntegras primeiro, depois as divergentes
    const neighbors = (adj.get(current.node) || []).slice().sort((a, b) =>
      a.edge.mm === b.edge.mm ? 0 : a.edge.mm ? 1 : -1
    );

    for (const nb of neighbors) {
      const step = orient(nb);
      if (visited.has(step.to)) continue;
      const newPath = [...current.path, step];
      if (step.to === target) return newPath;
      visited.add(step.to);
      queue.push({ node: step.to, path: newPath });
    }
  }
  return null;
}

/**
 * Conecta um conjunto de tabelas-semente com caminhos de JOIN (liga
 * sequencialmente: semente[0]->semente[1], semente[1]->semente[2], ...).
 * Retorna os passos orientados (sem duplicar arestas) e as tabelas
 * intermediárias descobertas no caminho.
 */
export function connectSeedTables(seedTables: string[]): {
  joins: OrientedJoin[];
  bridgeTables: string[];
  unconnected: string[][];
} {
  const seeds = Array.from(new Set(seedTables.map((t) => t.toUpperCase().trim()).filter(Boolean)));
  const joins: OrientedJoin[] = [];
  const seen = new Set<string>();
  const bridgeTables: string[] = [];
  const unconnected: string[][] = [];

  for (let i = 0; i + 1 < seeds.length; i++) {
    const path = findJoinPath(seeds[i], seeds[i + 1]);
    if (!path) {
      unconnected.push([seeds[i], seeds[i + 1]]);
      continue;
    }
    for (const step of path) {
      const key = `${step.from}|${step.fromFields.join("+")}|${step.to}|${step.toFields.join("+")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      joins.push(step);
      for (const t of [step.from, step.to]) {
        if (!seeds.includes(t) && !bridgeTables.includes(t)) bridgeTables.push(t);
      }
    }
  }
  return { joins, bridgeTables, unconnected };
}

/**
 * Formata um passo de JOIN como condição SQL canônica do RM.
 */
export function formatJoinCondition(step: OrientedJoin, aliasFrom: string, aliasTo: string): string {
  const pairs = step.fromFields.map((f, i) => `${aliasFrom}.${f} = ${aliasTo}.${step.toFields[i]}`);
  return pairs.join(" AND ");
}
