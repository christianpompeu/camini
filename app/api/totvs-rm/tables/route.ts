import { NextRequest, NextResponse } from "next/server";
import { searchRMTableCatalog, getTableDetails, RM_MODULES_MAP } from "@/lib/totvs-rm/schema-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const modulePrefix = searchParams.get("module")?.toUpperCase().trim() || "";
    const specificTable = searchParams.get("table")?.toUpperCase().trim() || "";
    const joinPath = searchParams.get("path")?.toUpperCase().trim() || "";

    // Caminho de JOINs entre duas tabelas (obsoleto com o novo motor FTS)
    if (joinPath) {
      return NextResponse.json({ error: "Funcionalidade de path obsoleta com o novo motor semântico FTS." }, { status: 400 });
    }


    // Se solicitou detalhes completos de uma tabela específica
    if (specificTable) {
      const details = getTableDetails(specificTable);
      if (!details) {
        return NextResponse.json({ error: `Tabela '${specificTable}' não encontrada.` }, { status: 404 });
      }

      const firstChar = details.tabela.charAt(0);
      const modulo = RM_MODULES_MAP[firstChar] || "Geral RM";

      return NextResponse.json({
        ...details,
        Modulo: modulo,
      });
    }

    const limitParam = parseInt(searchParams.get("limit") || "100", 10);
    const limit = isNaN(limitParam) ? 100 : Math.min(Math.max(limitParam, 1), 3000);

    const result = searchRMTableCatalog(query, modulePrefix, limit);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao pesquisar tabelas.";
    console.error("Erro na API de tabelas RM:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
