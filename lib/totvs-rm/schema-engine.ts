import fs from "fs";
import path from "path";
import { RMSemanticDictionary, RMSemanticTableWithKey } from "./types";
import { ProviderCredential } from "./llm/providers";

const DATA_DIR = path.join(process.cwd(), "public", "dicionario_rm", "data");
const DICT_FILE = path.join(DATA_DIR, "DicionarioSemantico_Completo.json");

/**
 * Cache global em memória para o Dicionário Semântico (evita re-leitura de ~50MB por request)
 */
let cachedDictionary: RMSemanticDictionary | null = null;

export const RM_MODULES_MAP: Record<string, string> = {
  F: "RM Fluxus (Finanças)",
  T: "RM Nucleus (Faturamento/Estoque)",
  S: "RM Classis/Suprimentos",
  P: "RM Labore (Folha/RH)",
  C: "RM Saldus (Contabilidade)",
  G: "Global / Cadastros Gerais",
  A: "RM Bis / Automação",
  D: "RM Agilis / CRM",
  E: "RM Solum / Obras",
  K: "RM Factor / Produção",
  M: "RM Bonum / Patrimônio",
  V: "RM Biblios / Biblioteca",
  U: "RM Saúde",
};

export function loadSemanticDictionary(): RMSemanticDictionary {
  if (cachedDictionary) return cachedDictionary;
  try {
    if (!fs.existsSync(DICT_FILE)) {
      console.warn("Dicionário não encontrado:", DICT_FILE);
      return {};
    }
    const raw = fs.readFileSync(DICT_FILE, "utf8");
    cachedDictionary = JSON.parse(raw);
    return cachedDictionary!;
  } catch (err) {
    console.error("Erro ao carregar DicionarioSemantico_Completo.json:", err);
    return {};
  }
}

export function getRMTableCatalog(): { tabela: string; descricao: string; sistema: string }[] {
  const dict = loadSemanticDictionary();
  const catalog = [];
  for (const [tabela, dados] of Object.entries(dict)) {
    const firstChar = tabela.charAt(0);
    catalog.push({
      tabela,
      descricao: dados.descricao,
      sistema: RM_MODULES_MAP[firstChar] || "Geral RM"
    });
  }
  return catalog;
}

export function getTableDetails(tableName: string): RMSemanticTableWithKey | null {
  const dict = loadSemanticDictionary();
  const cleanName = tableName.toUpperCase().trim();
  if (dict[cleanName]) {
    return { tabela: cleanName, ...dict[cleanName] };
  }
  return null;
}

import { callRouterLlm } from "./llm/router";
/**
 * Roteador Semântico (NLP Router): Identifica tabelas utilizando IA em etapa prévia,
 * consulta o Dicionário Completo em memória e enriquece com o Grafo de relacionamentos.
 */
export interface RAGContextMetadata {
  routerTables: string[];
  seedTables: string[];
  expandedTables: string[];
  finalAllowedTables: string[];
  routerMetadata?: {
    usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; latencyMs?: number; };
    provider: string;
    model: string;
  };
}

export async function identifyRelevantTables(
  userPrompt: string,
  routerCredentials?: ProviderCredential[]
): Promise<{ tables: RMSemanticTableWithKey[]; contextMetadata: RAGContextMetadata }> {
  const dict = loadSemanticDictionary();
  const identifiedNames = new Set<string>();

  let routerTables: string[] = [];
  let routerMetadata: RAGContextMetadata["routerMetadata"];

  // 1. Tentar Roteador Semântico via LLM (Agentic Workflow)
  if (routerCredentials && routerCredentials.length > 0) {
    try {
      const { tables, metadata } = await callRouterLlm(routerCredentials, userPrompt);
      if (tables.length > 0) {
        routerTables = [...tables];
        routerMetadata = metadata;
        for (const tbl of tables) {
          if (dict[tbl]) {
            identifiedNames.add(tbl);
          }
        }
      }
    } catch (err) {
      console.warn("[RAG ENGINE] Falha na cadeia do Router LLM, fallback para extração local:", err);
    }
  }

  // 2. Fallback e Reforço Lexical Inteligente
  // Mesmo se o Roteador retornar algo, reforçamos com tabelas básicas baseadas no texto
  const text = userPrompt.toLowerCase();
  
  if (text.includes("movimento") || text.includes("venda") || text.includes("compra") || text.includes("pedido") || text.includes("nota")) {
    identifiedNames.add("TMOV");
    if (text.includes("item") || text.includes("produto")) identifiedNames.add("TITMMOV");
  }
  if (text.includes("financeiro") || text.includes("lançamento") || text.includes("lancamento") || text.includes("pagar") || text.includes("receber") || text.includes("fatura") || text.includes("vencimento")) {
    identifiedNames.add("FLAN");
  }
  if (text.includes("cliente") || text.includes("fornecedor") || text.includes("clifor") || text.includes("cnpj") || text.includes("cpf")) {
    identifiedNames.add("FCFO");
  }
  if (text.includes("funcionário") || text.includes("funcionario") || text.includes("colaborador") || text.includes("chapa") || text.includes("salarial") || text.includes("salário") || text.includes("salario") || text.includes("cargo")) {
    identifiedNames.add("PFUNC");
    identifiedNames.add("PSECAO");
    if (text.includes("salarial") || text.includes("salário") || text.includes("salario")) identifiedNames.add("PFHSTSAL");
  }
  if (text.includes("produto") || text.includes("item") || text.includes("serviço") || text.includes("servico") || text.includes("estoque")) {
    identifiedNames.add("TPRD");
  }
  if (text.includes("centro de custo")) {
    identifiedNames.add("GCCUSTO");
  }
  if (text.includes("contabil") || text.includes("contábil") || text.includes("conta")) {
    identifiedNames.add("CCONTA");
    if (text.includes("partida")) identifiedNames.add("CPARTIDA");
  }

  // Se ainda vazio, insere pacote mínimo
  if (identifiedNames.size === 0) {
    ["TMOV", "FLAN", "FCFO"].forEach(t => identifiedNames.add(t));
  }

  const seedTables = Array.from(identifiedNames);

  // 3. Expansão via Grafo e Intenção: adiciona tabelas-ponte cruciais com base no contexto
  const textContext = userPrompt.toLowerCase();
  const initialList = Array.from(identifiedNames);
  
  if (initialList.includes("TMOV")) {
    if (textContext.includes("pagamento") || textContext.includes("forma de") || textContext.includes("tpagto")) {
      identifiedNames.add("TMOVPAGTO");
      identifiedNames.add("TPAGTO");
    }
    if (textContext.includes("origem") || textContext.includes("gerou") || textContext.includes("relaciona")) {
      identifiedNames.add("TMOVRELAC");
    }
  }
  
  if (initialList.includes("FLAN") && initialList.includes("TMOV") && !textContext.includes("pagamento")) {
    // Se precisa ligar LAN e MOV mas não é por TMOVPAGTO, usa FLANMOV ou SLAN (acordo no RM)
    identifiedNames.add("FLANMOV");
  }

  const expandedTables = Array.from(identifiedNames).filter(t => !seedTables.includes(t));

  // Monta o micro-contexto estruturado limitando a um teto seguro (ex: até 10 tabelas)
  const limit = Math.min(identifiedNames.size, 10);
  const result: RMSemanticTableWithKey[] = [];
  const finalAllowedTables: string[] = [];
  let count = 0;

  for (const name of identifiedNames) {
    if (count >= limit) break;
    if (dict[name]) {
      result.push({ tabela: name, ...dict[name] });
      finalAllowedTables.push(name);
      count++;
    }
  }

  return {
    tables: result,
    contextMetadata: {
      routerTables,
      seedTables,
      expandedTables,
      finalAllowedTables,
      routerMetadata
    }
  };
}

export function buildSchemaContextPrompt(tables: RMSemanticTableWithKey[], userPrompt = ""): string {
  if (tables.length === 0) {
    return "Nenhuma tabela do Dicionário RM foi identificada. Use seu conhecimento base do TOTVS RM.";
  }

  let text = "### ESQUEMA DO DICIONÁRIO RM IDENTIFICADO PARA ESTA CONSULTA (GRAFO EM MEMÓRIA):\n\n";
  const tableNames = new Set(tables.map((t) => t.tabela));

  for (const table of tables) {
    const mod = RM_MODULES_MAP[table.tabela.charAt(0)] || "Geral";
    text += `#### Tabela: \`${table.tabela}\` (${mod})\n`;
    if (table.descricao) {
      text += `Descrição: ${table.descricao}\n`;
    }

    text += "Colunas Relevantes:\n";
    
    // Identificar colunas que são chaves de junção (usadas em relacionamentos_saida)
    const relColumns = new Set<string>();
    if (table.relacionamentos_saida) {
      for (const rel of table.relacionamentos_saida) {
        const matches = rel.chaves_ligacao.match(/\b([A-Z0-9_]+)\b/gi);
        if (matches) {
          for (const match of matches) relColumns.add(match.toUpperCase());
        }
      }
    }

    let displayCols = table.colunas.filter((c) => {
      const n = c.nome.toUpperCase();
      const t = c.tipo.toUpperCase();
      const isRequested = userPrompt && userPrompt.toUpperCase().includes(n);
      
      // Se for explicitamente solicitada no prompt, inclui sempre
      if (isRequested) return true;

      // Omitir colunas puramente de auditoria interna e colunas irrelevantes para as queries geradas
      const isAudit = ["RECCREATEDBY", "RECMODIFIEDBY", "RECCREATEDON", "RECMODIFIEDON", "CODUSUARIO", "SECAD", "IDIMAGEM", "CODSISTEMA"].includes(n);
      if (isAudit) return false;

      // Colunas de Chave Primária / Estrangeira (começam com ID, COD ou estão em relacionamentos_saida)
      if (n.startsWith("ID") || n.startsWith("COD") || relColumns.has(n)) return true;

      // Colunas com tipos relevantes
      if (t.includes("DATETIME") || t.includes("VARCHAR") || t.includes("NUMERIC") || t.includes("DECIMAL")) return true;

      return false;
    });

    // Limite a no máximo as 25 principais colunas por tabela
    if (displayCols.length > 25) {
      displayCols = displayCols.slice(0, 25);
    }

    for (const col of displayCols) {
      text += `- \`${col.nome}\` (${col.tipo}) - ${col.descricao}\n`;
    }

    if (table.relacionamentos_saida && table.relacionamentos_saida.length > 0) {
      const rels = table.relacionamentos_saida.filter((r) => tableNames.has(r.tabela_destino));
      if (rels.length > 0) {
        text += "\nRelacionamentos de Saída (JOINs Garantidos):\n";
        for (const rel of rels) {
          const parts = rel.chaves_ligacao.split("=");
          if (parts.length === 2) {
            const left = parts[0].split(",").map((c) => c.trim());
            const right = parts[1].split(",").map((c) => c.trim());
            const n = Math.min(left.length, right.length);
            const conditions = [];
            for (let i = 0; i < n; i++) {
              conditions.push(`${table.tabela}.${left[i]} = ${rel.tabela_destino}.${right[i]}`);
            }
            text += `- Junção com \`${rel.tabela_destino}\`: ON ${conditions.join(" AND ")}\n`;
          } else {
            text += `- Junção com \`${rel.tabela_destino}\`: ON ${rel.chaves_ligacao}\n`;
          }
        }
      }
    }
    text += "\n";
  }

  return text;
}
