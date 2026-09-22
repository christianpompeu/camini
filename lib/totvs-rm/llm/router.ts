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
    domain: { type: "string" },
    complexity: { type: "string", enum: ["simple", "medium", "complex"] }
  },
  required: ["intent", "tables"],
  additionalProperties: false
};

/**
 * Chamada ultrarrápida e direta ao LLM para roteamento semântico de tabelas (NLP Router)
 */
export async function callRouterLlm(
  chain: ProviderCredential[],
  userPrompt: string
): Promise<{ result: RMRouterResult; tables: string[] }> {
  // Dispara a chain de failover para o roteador, passando o schema JSON nativo para OpenAI
  const { result } = await chatCompleteWithFailover<RMRouterResult>(chain, {
    systemPrompt: routerSystemPrompt,
    userPrompt: userPrompt,
    stage: "router",
    temperature: 0.1,
    jsonSchema: routerJsonSchema,
    schemaName: "RMRouterResult",
    schemaDescription: "Output format for the RM semantic router"
  });

  // Validação/sanitização básica das tabelas retornadas
  let tables: string[] = [];
  if (Array.isArray(result.tables)) {
    tables = result.tables.map((t) => String(t).toUpperCase().trim()).filter(Boolean);
  }

  return { result, tables };
}
