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

/**
 * Chamada ultrarrápida e direta ao LLM para roteamento semântico de tabelas (NLP Router)
 */
async function callRouterLlm(cred: ProviderCredential, userPrompt: string): Promise<string[]> {
  const routerSystemPrompt = `Você é um especialista em banco de dados TOTVS RM. Analise a pergunta do usuário e identifique as tabelas necessárias para construir a consulta. Retorne EXCLUSIVAMENTE um array JSON contendo os nomes das tabelas em maiúsculo, sem crases, sem markdown, sem explicações. Exemplo: ["FLAN", "FCFO", "SPARCELA"].`;

  if (cred.id === "gemini") {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${cred.model}:generateContent?key=${cred.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${routerSystemPrompt}\n\nPERGUNTA:\n${userPrompt}` }] }
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Router Gemini HTTP ${response.status}`);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return [];
    return parseTableArrayJson(raw);
  }

  // OpenAi-compatível (Groq / OpenRouter)
  const baseUrl = cred.id === "groq" ? "https://api.groq.com/openai/v1" : "https://openrouter.ai/api/v1";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cred.apiKey}`
    },
    body: JSON.stringify({
      model: cred.model,
      temperature: 0.1,
      messages: [
        { role: "system", content: routerSystemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Router ${cred.id} HTTP ${response.status}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return [];
  return parseTableArrayJson(raw);
}

/**
 * Helper para extrair e validar array JSON de nomes de tabelas retornado pela IA
 */
function parseTableArrayJson(raw: string): string[] {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).toUpperCase().trim()).filter(Boolean);
    }
    if (parsed && typeof parsed === "object") {
      // Se retornou objeto com chave tipo { "tabelas": [...] }
      const possibleArray = Object.values(parsed).find(Array.isArray);
      if (possibleArray) {
        return (possibleArray as unknown[]).map((item) => String(item).toUpperCase().trim()).filter(Boolean);
      }
    }
  } catch {
    // Regex de fallback caso o JSON venha truncado ou imperfeito
    const matches = cleaned.match(/"([A-Za-z0-9_#]+)"/g);
    if (matches) {
      return matches.map((m) => m.replace(/"/g, "").toUpperCase().trim());
    }
  }
  return [];
}

/**
 * Roteador Semântico (NLP Router): Identifica tabelas utilizando IA em etapa prévia,
 * consulta o Dicionário Completo em memória e enriquece com o Grafo de relacionamentos.
 */
export async function identifyRelevantTables(
  userPrompt: string,
  routerCredentials?: ProviderCredential[]
): Promise<RMSemanticTableWithKey[]> {
  const dict = loadSemanticDictionary();
  const identifiedNames = new Set<string>();

  // 1. Tentar Roteador Semântico via LLM (Agentic Workflow)
  if (routerCredentials && routerCredentials.length > 0) {
    for (const cred of routerCredentials) {
      if (!cred.apiKey) continue;
      try {
        const tablesFromLlm = await callRouterLlm(cred, userPrompt);
        if (tablesFromLlm.length > 0) {
          for (const tbl of tablesFromLlm) {
            if (dict[tbl]) {
              identifiedNames.add(tbl);
            }
          }
          if (identifiedNames.size > 0) {
            break; // Identificação bem-sucedida pelo primeiro provider disponível
          }
        }
      } catch (err) {
        // Falha no provider atual do roteador; tenta o próximo da cadeia
      }
    }
  }

  // 2. Se nenhuma tabela foi identificada via LLM (ex: offline ou erro de API),
  // faz fallback para busca direta de nomes exatos de tabelas no prompt
  if (identifiedNames.size === 0) {
    const promptWords = userPrompt.toUpperCase().match(/[A-Z0-9_]{3,20}/g) || [];
    for (const word of promptWords) {
      if (dict[word]) {
        identifiedNames.add(word);
      }
    }
  }

  // 3. Expansão via Grafo em Memória: adiciona relacionamentos de saída diretos
  const initialList = Array.from(identifiedNames);
  for (const tableName of initialList) {
    const tableData = dict[tableName];
    if (tableData?.relacionamentos_saida) {
      for (const rel of tableData.relacionamentos_saida) {
        if (dict[rel.tabela_destino]) {
          identifiedNames.add(rel.tabela_destino);
        }
      }
    }
  }

  // Monta o micro-contexto estruturado limitando a um teto seguro (ex: até 10 tabelas)
  const limit = Math.min(identifiedNames.size, 10);
  const result: RMSemanticTableWithKey[] = [];
  let count = 0;

  for (const name of identifiedNames) {
    if (count >= limit) break;
    if (dict[name]) {
      result.push({ tabela: name, ...dict[name] });
      count++;
    }
  }

  return result;
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
    let displayCols = table.colunas;
    if (displayCols.length > 30) {
      displayCols = displayCols.filter((c) => {
        const n = c.nome.toUpperCase();
        return (
          n.includes("ID") ||
          n.includes("COD") ||
          n.includes("VALOR") ||
          n.includes("DATA") ||
          n.includes("STATUS") ||
          n.includes("NUM") ||
          n.includes("NOME")
        );
      });
      if (displayCols.length === 0) displayCols = table.colunas.slice(0, 30);
    }

    for (const col of displayCols) {
      text += `- \`${col.nome}\` (${col.tipo}) - ${col.descricao}\n`;
    }

    if (table.relacionamentos_saida && table.relacionamentos_saida.length > 0) {
      const rels = table.relacionamentos_saida.filter((r) => tableNames.has(r.tabela_destino));
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
