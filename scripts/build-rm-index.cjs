/**
 * Build offline do índice do dicionário TOTVS RM.
 *
 * Lê public/dicionario_rm/data e gera public/dicionario_rm/index/join-graph.json:
 * um grafo de JOINs (tabela -> tabela, com chaves compostas origem/destino)
 * alimentado por DicionarioGLINKSREL.json + RelacionamentosRM dos
 * DicionarioMaster_*.json. Rode com: npm run build:rm-index
 *
 * Node puro, sem dependências.
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "public", "dicionario_rm", "data");
const OUT_DIR = path.join(__dirname, "..", "public", "dicionario_rm", "index");
const OUT_FILE = path.join(OUT_DIR, "join-graph.json");

function splitFields(raw) {
  return String(raw || "")
    .split(",")
    .map((f) => f.trim().toUpperCase())
    .filter(Boolean);
}

function cleanTable(raw) {
  return String(raw || "").trim().toUpperCase();
}

function main() {
  const edges = new Map(); // dedupKey -> edge
  const stats = {
    glinksrelTotal: 0,
    glinksrelSkippedEmptyOrigin: 0,
    glinksrelSkippedSelfLoop: 0,
    masterFilesOk: 0,
    masterFilesSkipped: [],
    masterRelsTotal: 0,
    masterSkippedSelfLoop: 0,
    mismatchedFieldCount: 0,
    duplicates: 0,
  };

  function addEdge(origem, camposOrigem, destino, camposDestino, src) {
    const o = cleanTable(origem);
    const d = cleanTable(destino);
    if (!o || !d) {
      stats.glinksrelSkippedEmptyOrigin++;
      return;
    }
    if (o === d) {
      if (src === "glinksrel") stats.glinksrelSkippedSelfLoop++;
      else stats.masterSkippedSelfLoop++;
      return;
    }
    const of = splitFields(camposOrigem);
    const df = splitFields(camposDestino);
    if (of.length === 0 || df.length === 0) return;
    const key = `${o}|${of.join("+")}|${d}|${df.join("+")}`;
    if (edges.has(key)) {
      stats.duplicates++;
      return;
    }
    if (of.length !== df.length) stats.mismatchedFieldCount++;
    edges.set(key, { o, of, d, df, src, mm: of.length !== df.length });
  }

  // 1. GLINKSREL (arestas explícitas origem -> destino)
  const glinksPath = path.join(DATA_DIR, "DicionarioGLINKSREL.json");
  const glinks = JSON.parse(fs.readFileSync(glinksPath, "utf8")).DicionarioGLINKSREL || [];
  stats.glinksrelTotal = glinks.length;
  for (const e of glinks) {
    addEdge(e.TabelaOrigem, e.CamposOrigem, e.TabelaDestino, e.CamposDestino, "glinksrel");
  }

  // 2. Master (RelacionamentosRM por coluna; lado origem = ChaveLogicaComposta)
  const masterFiles = fs
    .readdirSync(DATA_DIR)
    .filter((f) => /^DicionarioMaster_.*\.json$/i.test(f));
  for (const file of masterFiles) {
    let tables;
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
      if (!raw.trim()) throw new Error("arquivo vazio");
      tables = JSON.parse(raw);
    } catch (err) {
      stats.masterFilesSkipped.push(`${file} (${err.message})`);
      continue;
    }
    if (!Array.isArray(tables)) {
      stats.masterFilesSkipped.push(`${file} (formato inesperado)`);
      continue;
    }
    stats.masterFilesOk++;
    for (const t of tables) {
      const tableName = cleanTable(t.Tabela);
      if (!tableName || !Array.isArray(t.Colunas)) continue;
      for (const col of t.Colunas) {
        const rels = col.RelacionamentosRM;
        if (!Array.isArray(rels)) continue;
        for (const rel of rels) {
          stats.masterRelsTotal++;
          addEdge(tableName, rel.ChaveLogicaComposta, rel.TabelaDestino, rel.CamposDestino, "master");
        }
      }
    }
  }

  const edgeList = Array.from(edges.values());
  const tableSet = new Set();
  for (const e of edgeList) {
    tableSet.add(e.o);
    tableSet.add(e.d);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        version: 1,
        builtAt: new Date().toISOString(),
        stats: { ...stats, tables: tableSet.size, edges: edgeList.length },
        edges: edgeList,
      },
      null,
      1
    )
  );

  console.log(`OK: ${edgeList.length} arestas, ${tableSet.size} tabelas -> ${OUT_FILE}`);
  console.log(JSON.stringify(stats, null, 2));
}

main();
