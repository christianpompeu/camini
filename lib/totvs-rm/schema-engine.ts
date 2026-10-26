import fs from "fs";
import path from "path";
import { RMSemanticDictionary, RMSemanticTableWithKey, RMSemanticColumn, RMTableSummary } from "./types";
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

export function getRMTableCatalog(): RMTableSummary[] {
  const dict = loadSemanticDictionary();
  const catalog: RMTableSummary[] = [];
  for (const [tabela, dados] of Object.entries(dict)) {
    const firstChar = tabela.charAt(0);
    catalog.push({
      tabela,
      descricao: dados.descricao || "",
      sistema: RM_MODULES_MAP[firstChar] || "Geral RM"
    });
  }
  return catalog;
}

interface ScoredTableResult extends RMTableSummary {
  score: number;
}

/**
 * Busca inteligente no catálogo de tabelas com suporte a:
 * 1. Nome da tabela (ex: TMOV, FLAN)
 * 2. Descrição da tabela (ex: movimento de estoque, lançamento financeiro)
 * 3. Nome da coluna / campo (ex: CODFILIAL, NSEQITMMOV, VALORBRUTO, CHAPA)
 * 4. Descrição da coluna (ex: código da filial, valor líquido, data de emissão)
 */
const POPULAR_TABLE_KEYS = [
  "TMOV",
  "FLAN",
  "FCFO",
  "PFUNC",
  "GCOLIGADA",
  "TITMMOV",
  "GCCUSTO",
  "TCPG",
  "CPARAM",
  "DCONTRATO",
  "MPATRIMONIO",
  "KORDEM",
];

export function searchRMTableCatalog(
  query: string,
  modulePrefix = "",
  limit = 60
): { totalMatches: number; tables: RMTableSummary[] } {
  const dict = loadSemanticDictionary();
  const cleanQuery = query.trim();
  const qUpper = cleanQuery.toUpperCase();
  const qLower = cleanQuery.toLowerCase();
  const modUpper = modulePrefix.toUpperCase().trim();

  // Sem busca nem módulo ativo: catálogo padrão com populares no topo e ordem alfabética
  if (!cleanQuery && !modUpper) {
    const list: RMTableSummary[] = [];
    const added = new Set<string>();

    // 1. Priorizar tabelas populares fundamentais do TOTVS RM
    for (const popKey of POPULAR_TABLE_KEYS) {
      if (dict[popKey] && list.length < limit) {
        const firstChar = popKey.charAt(0);
        list.push({
          tabela: popKey,
          descricao: dict[popKey].descricao || "",
          sistema: RM_MODULES_MAP[firstChar] || "Geral RM",
        });
        added.add(popKey);
      }
    }

    // 2. Adicionar tabelas normais (A-Z) em ordem alfabética limpa
    const standardKeys = Object.keys(dict)
      .filter((k) => /^[A-Z]/.test(k) && !added.has(k))
      .sort((a, b) => a.localeCompare(b));

    for (const tabela of standardKeys) {
      if (list.length >= limit) break;
      const firstChar = tabela.charAt(0);
      list.push({
        tabela,
        descricao: dict[tabela].descricao || "",
        sistema: RM_MODULES_MAP[firstChar] || "Geral RM",
      });
      added.add(tabela);
    }

    // 3. Demais tabelas (internas com _ etc.) se houver espaço
    if (list.length < limit) {
      for (const [tabela, data] of Object.entries(dict)) {
        if (list.length >= limit) break;
        if (added.has(tabela)) continue;
        const firstChar = tabela.charAt(0);
        list.push({
          tabela,
          descricao: data.descricao || "",
          sistema: RM_MODULES_MAP[firstChar] || "Geral RM",
        });
        added.add(tabela);
      }
    }

    return {
      totalMatches: Object.keys(dict).length,
      tables: list,
    };
  }

  const scored: ScoredTableResult[] = [];

  for (const [tabela, data] of Object.entries(dict)) {
    let score = 0;
    const tUpper = tabela.toUpperCase();
    const dLower = (data.descricao || "").toLowerCase();
    const firstChar = tUpper.charAt(0);
    const sistema = RM_MODULES_MAP[firstChar] || "Geral RM";

    let matchedColumn: string | undefined;
    let matchedColumnDesc: string | undefined;
    let matchType: "table_name" | "table_desc" | "column_name" | "column_desc" = "table_name";

    if (cleanQuery) {
      // 1. MATCH POR NOME DE TABELA
      if (tUpper === qUpper) {
        score = 20000;
        matchType = "table_name";
      } else if (tUpper.startsWith(qUpper)) {
        score = 10000 - Math.min((tUpper.length - qUpper.length) * 10, 3000);
        matchType = "table_name";
      } else if (tUpper.includes(qUpper)) {
        score = 5000 - Math.min(tUpper.indexOf(qUpper) * 10, 2000);
        matchType = "table_name";
      }

      // 2. MATCH POR DESCRIÇÃO DA TABELA
      if (dLower) {
        if (dLower.startsWith(qLower)) {
          const descScore = 3500;
          if (descScore > score) {
            score = descScore;
            matchType = "table_desc";
          }
        } else if (dLower.includes(qLower)) {
          const descScore = 2000;
          if (descScore > score) {
            score = descScore;
            matchType = "table_desc";
          }
        }
      }

      // 3. MATCH POR NOME DE COLUNA E DESCRIÇÃO DE COLUNA
      if (data.colunas && Array.isArray(data.colunas)) {
        for (const col of data.colunas) {
          if (!col || !col.nome) continue;
          const colUpper = col.nome.toUpperCase();
          const colDescLower = (col.descricao || "").toLowerCase();

          // Match no nome da coluna
          if (colUpper === qUpper) {
            // Coluna com correspondência exata (ex: CODFILIAL, NSEQITMMOV)
            const colScore = 6000;
            if (colScore > score) {
              score = colScore;
              matchType = "column_name";
              matchedColumn = col.nome;
              matchedColumnDesc = col.descricao;
            }
          } else if (colUpper.startsWith(qUpper)) {
            const colScore = 3200;
            if (colScore > score) {
              score = colScore;
              matchType = "column_name";
              matchedColumn = col.nome;
              matchedColumnDesc = col.descricao;
            }
          } else if (colUpper.includes(qUpper)) {
            const colScore = 2200;
            if (colScore > score) {
              score = colScore;
              matchType = "column_name";
              matchedColumn = col.nome;
              matchedColumnDesc = col.descricao;
            }
          }

          // Match na descrição da coluna
          if (colDescLower) {
            if (colDescLower.startsWith(qLower)) {
              const colDescScore = 1800;
              if (colDescScore > score) {
                score = colDescScore;
                matchType = "column_desc";
                matchedColumn = col.nome;
                matchedColumnDesc = col.descricao;
              }
            } else if (colDescLower.includes(qLower)) {
              const colDescScore = 1200;
              if (colDescScore > score) {
                score = colDescScore;
                matchType = "column_desc";
                matchedColumn = col.nome;
                matchedColumnDesc = col.descricao;
              }
            }
          }
        }
      }

      if (score === 0) continue;

      // Ajuste de Módulo Ativo
      if (modUpper) {
        if (tUpper.startsWith(modUpper)) {
          score += 400; // Bônus para tabelas do módulo ativo
        } else {
          // Se for match forte (exato no nome da tabela ou da coluna), preserva nos resultados
          if (score >= 4000) {
            score -= 100;
          } else {
            continue;
          }
        }
      }
    } else if (modUpper) {
      // Apenas filtro por módulo
      if (tUpper.startsWith(modUpper)) {
        score = 100;
        if (POPULAR_TABLE_KEYS.includes(tUpper)) {
          score += 500; // Prioriza tabelas populares chave do módulo no topo
        }
      } else {
        continue;
      }
    }

    scored.push({
      tabela,
      descricao: data.descricao || "",
      sistema,
      score,
      matchedColumn,
      matchedColumnDesc,
      matchType,
    });
  }

  // Ordenação decrescente por pontuação de relevância
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.tabela.localeCompare(b.tabela);
  });

  return {
    totalMatches: scored.length,
    tables: scored.slice(0, limit).map(({ score: _score, ...rest }) => rest),
  };
}

let cachedIncomingMap: Record<string, { tabela_origem: string; chaves_ligacao: string }[]> | null = null;

export function getIncomingRelationships(targetTable: string): { tabela_origem: string; chaves_ligacao: string }[] {
  if (!cachedIncomingMap) {
    const dict = loadSemanticDictionary();
    const incoming: Record<string, { tabela_origem: string; chaves_ligacao: string }[]> = {};
    for (const [origem, data] of Object.entries(dict)) {
      if (data.relacionamentos_saida) {
        for (const rel of data.relacionamentos_saida) {
          if (!rel.tabela_destino) continue;
          const dest = rel.tabela_destino.toUpperCase();
          if (!incoming[dest]) {
            incoming[dest] = [];
          }
          incoming[dest].push({
            tabela_origem: origem,
            chaves_ligacao: rel.chaves_ligacao,
          });
        }
      }
    }
    cachedIncomingMap = incoming;
  }
  return cachedIncomingMap[targetTable.toUpperCase()] || [];
}

function deduplicateColumns(columns: RMSemanticColumn[]): RMSemanticColumn[] {
  if (!columns || !Array.isArray(columns)) return [];
  const seen = new Set<string>();
  const unique: RMSemanticColumn[] = [];
  for (const col of columns) {
    if (!col || !col.nome) continue;
    const key = col.nome.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(col);
    }
  }
  return unique;
}

export function getTableDetails(tableName: string): RMSemanticTableWithKey | null {
  const dict = loadSemanticDictionary();
  const cleanName = tableName.toUpperCase().trim();
  if (dict[cleanName]) {
    const firstChar = cleanName.charAt(0);
    const modulo = RM_MODULES_MAP[firstChar] || "Geral RM";
    const raw = dict[cleanName];
    return {
      tabela: cleanName,
      ...raw,
      colunas: deduplicateColumns(raw.colunas || []),
      Modulo: modulo,
      relacionamentos_entrada: getIncomingRelationships(cleanName),
    };
  }
  return null;
}

import { callSemanticPlannerLlm } from "./llm/planner";
import { SemanticPlan } from "./types";
/**
 * Roteador Semântico (NLP Router / Semantic Planner): Identifica tabelas utilizando IA em etapa prévia,
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
): Promise<{ tables: RMSemanticTableWithKey[]; contextMetadata: RAGContextMetadata; semanticPlan?: SemanticPlan }> {
  const dict = loadSemanticDictionary();
  const identifiedNames = new Set<string>();

  let routerTables: string[] = [];
  let routerMetadata: RAGContextMetadata["routerMetadata"];

  // 1. Tentar Roteador Semântico via LLM (Semantic Planner)
  let semanticPlan: SemanticPlan | undefined;
  if (routerCredentials && routerCredentials.length > 0) {
    try {
      const { result, tables, metadata } = await callSemanticPlannerLlm(routerCredentials, userPrompt);
      semanticPlan = result;
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
    },
    semanticPlan
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
