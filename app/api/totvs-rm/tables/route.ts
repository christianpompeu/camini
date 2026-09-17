import { NextRequest, NextResponse } from "next/server";
import { getRMTableCatalog, getTableDetails, RM_MODULES_MAP } from "@/lib/totvs-rm/schema-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const modulePrefix = searchParams.get("module")?.toUpperCase().trim() || "";
    const specificTable = searchParams.get("table")?.toUpperCase().trim() || "";

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
