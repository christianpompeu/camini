import fs from "fs";
import path from "path";
import { RMSemanticDictionary, RMSemanticTable, RMSemanticColumn, RMSemanticRelationship, RMSemanticTableWithKey } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "dicionario_rm", "data");
const DICT_FILE = path.join(DATA_DIR, "DicionarioSemantico_Completo.json");

let cachedDictionary: RMSemanticDictionary | null = null;

export const RM_MODULES_MAP: Record<string, string> = {
  F: "RM Fluxus (Finanças)",
  T: "RM Nucleus (Faturamento/Estoque)",
  S: "RM Classis/Suprimentos",
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

export function identifyRelevantTables(userPrompt: string, selectedModule?: string): RMSemanticTableWithKey[] {
  const dict = loadSemanticDictionary();
  // Logs temporariamente desabilitados
  // console.log(`\x1b[36m[RAG ENGINE] Input do Usuário: "${userPrompt}"\x1b[0m`);
  const promptUpper = userPrompt.toUpperCase();
  const promptLower = userPrompt.toLowerCase();
  const identifiedNames = new Set<string>();

  // 1. Interceptar nomes literais de tabelas
  const words = promptUpper.match(/[A-Z0-9_]{3,20}/g) || [];
  for (const word of words) {
    if (dict[word]) {
      identifiedNames.add(word);
    }
  }

  // 2. Interceptar por heurística/palavras-chave (somente se não foram citadas tabelas explicitamente)
  if (identifiedNames.size === 0) {
    if (promptLower.includes("cliente") || promptLower.includes("fornecedor")) identifiedNames.add("FCFO");
    if (promptLower.includes("lançamento") || promptLower.includes("pagar") || promptLower.includes("receber") || promptLower.includes("financeiro")) identifiedNames.add("FLAN");
    if (promptLower.includes("movimento") || promptLower.includes("nota fiscal") || promptLower.includes("pedido") || promptLower.includes("venda") || promptLower.includes("compra")) identifiedNames.add("TMOV");
    if (promptLower.includes("produto") || promptLower.includes("item")) {
      identifiedNames.add("TITMMOV");
      identifiedNames.add("TPRD");
    }
  }

  // 3. Pelo módulo selecionado no UI
  if (selectedModule && identifiedNames.size === 0) {
    if (selectedModule === "FLUXUS") {
      identifiedNames.add("FLAN");
      identifiedNames.add("FCFO");
    } else if (selectedModule === "NUCLEUS") {
      identifiedNames.add("TMOV");
      identifiedNames.add("TITMMOV");
    }
  }

  // Se FLAN for requisitada, quase sempre precisamos do FCFO para nomes
  if (identifiedNames.has("FLAN") && !identifiedNames.has("FCFO")) {
    if (dict["FCFO"]) identifiedNames.add("FCFO");
  }

  // Limitar as tabelas (RAG Contexto Enxuto)
  const result: RMSemanticTableWithKey[] = [];
  const limit = Math.min(identifiedNames.size, 8);
  let count = 0;

  for (const name of identifiedNames) {
    if (count >= limit) break;
    if (dict[name]) {
      result.push({ tabela: name, ...dict[name] });
      count++;
    }
  }

  // Logs temporariamente desabilitados
  // console.log(`\x1b[35m[RAG ENGINE] Tabelas Detectadas: [${result.map(t => `'${t.tabela}'`).join(", ")}]\x1b[0m`);
  return result;
}

export function buildSchemaContextPrompt(tables: RMSemanticTableWithKey[], userPrompt = ""): string {
  if (tables.length === 0) {
    return "Nenhuma tabela do Dicionário RM foi identificada. Use seu conhecimento base do TOTVS RM.";
  }

  let text = "### ESQUEMA DO DICIONÁRIO RM IDENTIFICADO PARA ESTA CONSULTA (GRAFO EM MEMÓRIA):\n\n";
  const tableNames = new Set(tables.map(t => t.tabela));

  for (const table of tables) {
    const mod = RM_MODULES_MAP[table.tabela.charAt(0)] || "Geral";
    text += `#### Tabela: \`${table.tabela}\` (${mod})\n`;
    if (table.descricao) {
      text += `Descrição: ${table.descricao}\n`;
    }
    
    text += "Colunas Relevantes:\n";
    // Para economizar contexto, podemos priorizar IDs, Códigos e Valores se a tabela tiver muitas colunas,
    // mas com o novo dicionário, vamos tentar listar todas se não ultrapassar 30, senão cortamos
    let displayCols = table.colunas;
    if (displayCols.length > 30) {
      displayCols = displayCols.filter(c => {
         const n = c.nome.toUpperCase();
         return n.includes("ID") || n.includes("COD") || n.includes("VALOR") || n.includes("DATA") || n.includes("STATUS");
      });
      if (displayCols.length === 0) displayCols = table.colunas.slice(0, 30);
    }

    for (const col of displayCols) {
      text += `- \`${col.nome}\` (${col.tipo}) - ${col.descricao}\n`;
    }

    if (table.relacionamentos_saida && table.relacionamentos_saida.length > 0) {
      // Filtrar relacionamentos de saída apenas para as tabelas que também foram identificadas no contexto atual
      // para evitar poluirmos o LLM com junções desnecessárias
      const rels = table.relacionamentos_saida.filter(r => tableNames.has(r.tabela_destino));
      if (rels.length > 0) {
        text += "\nRelacionamentos de Saída (JOINs Garantidos):\n";
        for (const rel of rels) {
          text += `- Junção com \`${rel.tabela_destino}\`: ON ${rel.chaves_ligacao}\n`;
        }
      }
    }
    text += "\n";
  }

  return text;
}
