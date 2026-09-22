import { chatCompleteWithFailover, ProviderCredential } from "./providers";
import { routerSystemPrompt } from "./prompts/router";

export interface RMRouterResult {
  intent: "generate_sql";
  tables: string[];
  domain?: string;
  complexity?: "simple" | "medium" | "complex";
}

const routerJsonSchema = {
  type: "object",
  properties: {
    intent: { type: "string", enum: ["generate_sql"] },
    tables: { type: "array", items: { type: "string" } },
    domain: { type: ["string", "null"] },
    complexity: { type: ["string", "null"], enum: ["simple", "medium", "complex", null] }
  },
  required: ["intent", "tables", "domain", "complexity"],
  additionalProperties: false
};

/**
 * Chamada ultrarrápida e direta ao LLM para roteamento semântico de tabelas (NLP Router)
 */
export async function callRouterLlm(
  chain: ProviderCredential[],
  userPrompt: string
): Promise<{ result: RMRouterResult; tables: string[]; metadata: { usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; latencyMs?: number; }; provider: string; model: string; } }> {
  // Dispara a chain de failover para o roteador, passando o schema JSON nativo para OpenAI
  const { result, usage, model, provider } = await chatCompleteWithFailover<RMRouterResult>(chain, {
    systemPrompt: routerSystemPrompt,
    userPrompt: userPrompt,
    stage: "router",
    temperature: 0.1,
    jsonSchema: routerJsonSchema,
    schemaName: "RMRouterResult",
    schemaDescription: "Output format for the RM semantic router"
  });

  if (usage) {
    const lat = usage.latencyMs ? Math.round(usage.latencyMs) : "?";
    const tablesStr = result.tables ? result.tables.join(", ") : "nenhuma";
    console.log(`\x1b[36m[RAG ENGINE] [ROUTER]\x1b[0m\nProvider: ${provider}\nModel: ${model}\nTables: ${tablesStr}\nInput: ${usage.inputTokens}\nOutput: ${usage.outputTokens}\nTotal: ${usage.totalTokens}\nLatency: ${lat}ms\n`);
  }

  // Validação/sanitização básica das tabelas retornadas
  let tables: string[] = [];
  if (Array.isArray(result.tables)) {
    tables = result.tables.map((t) => String(t).toUpperCase().trim()).filter(Boolean);
  }

  return { result, tables, metadata: { usage, provider, model } };
}
