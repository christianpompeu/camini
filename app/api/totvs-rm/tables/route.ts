import { NextRequest, NextResponse } from "next/server";
import { getRMTableCatalog, getTableDetails, RM_MODULES_MAP } from "@/lib/totvs-rm/schema-engine";
import { findJoinPath, formatJoinCondition } from "@/lib/totvs-rm/join-graph";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const modulePrefix = searchParams.get("module")?.toUpperCase().trim() || "";
    const specificTable = searchParams.get("table")?.toUpperCase().trim() || "";
    const joinPath = searchParams.get("path")?.toUpperCase().trim() || "";

    // Caminho de JOINs entre duas tabelas (ex.: ?path=FLAN,FCFO)
    if (joinPath) {
      const [from, to] = joinPath.split(",").map((t) => t.trim());
      if (!from || !to) {
        return NextResponse.json({ error: "Use ?path=ORIGEM,DESTINO." }, { status: 400 });
      }
      const steps = findJoinPath(from, to);
      if (!steps) {
        return NextResponse.json({ from, to, path: [], message: "Sem caminho no grafo do dicionário." });
      }
      return NextResponse.json({
        from,
        to,
        path: steps.map((s) => ({
          from: s.from,
          to: s.to,
          condition: formatJoinCondition(s, s.from, s.to),
          mismatched: s.mismatched,
        })),
      });
    }

    // Se solicitou detalhes completos de uma tabela específica
    if (specificTable) {
      const details = getTableDetails(specificTable);
      if (!details) {
        return NextResponse.json({ error: `Tabela '${specificTable}' não encontrada.` }, { status: 404 });
      }

      const firstChar = details.Tabela.charAt(0);
      const modulo = RM_MODULES_MAP[firstChar]?.nome || "Geral RM";

      return NextResponse.json({
        ...details,
        Modulo: modulo,
      });
    }

    // Busca no catálogo geral resumido
    const catalog = getRMTableCatalog();
    let filtered = catalog;

    if (modulePrefix) {
      filtered = filtered.filter((t) => t.tabela.startsWith(modulePrefix));
    }

    if (query) {
      const qLower = query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.tabela.toLowerCase().includes(qLower) ||
          t.descricao.toLowerCase().includes(qLower) ||
          t.sistema.toLowerCase().includes(qLower)
      );
    }

    // Limitar para não trafegar milhares de itens desnecessariamente (top 50 resultados)
    const results = filtered.slice(0, 50);

    return NextResponse.json({
      totalMatches: filtered.length,
      tables: results,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao pesquisar tabelas.";
    console.error("Erro na API de tabelas RM:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
