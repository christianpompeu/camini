import { chatCompleteWithFailover, ProviderCredential } from "./providers";
import { SemanticPlan } from "../types";

export const plannerSystemPrompt = `Você é um Analista Semântico de Dados (Semantic Planner) especialista no ERP TOTVS RM.
Sua única responsabilidade é interpretar a intenção do usuário a partir da pergunta em linguagem natural e extrair um plano estruturado de consulta.
NÃO GERE SQL. NÃO FORNEÇA RESPOSTAS ABERTAS.

Instruções:
1. Extraia a intenção principal (ex: listar movimentos, totalizar lançamentos financeiros).
2. Identifique os domínios de negócio envolvidos (ex: movimento, financeiro, contabilidade, folha).
3. Liste as entidades de negócio principais mencionadas.
4. Extraia explicitamente todos os filtros (ex: filial = 1, coligada = 9, data > 2024-01-01). Mapeie conceitos de forma genérica.
5. Liste os campos que o usuário pediu para retornar na consulta (requestedFields).
6. Identifique as operações necessárias ("select", "join", "filter", "aggregate", "group_by", "order_by").
7. Identifique se há agregações implícitas ou explícitas (ex: SUM, COUNT, MAX).
8. Identifique regras de ordenação e agrupamento (ordering, grouping).
9. Identifique requisitos temporais (ex: "últimos 12 meses", "ano passado").
10. Liste algumas tabelas candidatas (candidateTables) do TOTVS RM (ex: TMOV, FLAN, FCFO) que possam estar relacionadas. Não precisa encontrar TODAS as tabelas ponte; concentre-se nas entidades principais. O dicionário físico fará a resolução fina.

Seja preciso e preencha o JSON de acordo com o esquema fornecido.`;

const plannerJsonSchema = {
  type: "object",
  properties: {
    intent: { type: "string" },
    domains: { type: "array", items: { type: "string" } },
    entities: { type: "array", items: { type: "string" } },
    filters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          concept: { type: "string" },
          operator: { type: "string", enum: ["=", "!=", ">", "<", ">=", "<=", "IN", "NOT_IN", "LIKE", "BETWEEN", "IS_NULL", "IS_NOT_NULL"] },
          value: { type: ["string", "null"] },
          values: { type: "array", items: { type: "string" } }
        },
        required: ["concept", "operator", "value", "values"],
        additionalProperties: false
      }
    },
    requestedFields: { type: "array", items: { type: "string" } },
    operations: { type: "array", items: { type: "string" } },
    aggregations: { type: "array", items: { type: "string" } },
    ordering: { type: "array", items: { type: "string" } },
    grouping: { type: "array", items: { type: "string" } },
    temporalRequirements: { type: "array", items: { type: "string" } },
    candidateTables: { type: "array", items: { type: "string" } }
  },
  required: [
    "intent",
    "domains",
    "entities",
    "filters",
    "requestedFields",
    "operations",
    "aggregations",
    "ordering",
    "grouping",
    "temporalRequirements",
    "candidateTables"
  ],
  additionalProperties: false
};

export async function callSemanticPlannerLlm(
  chain: ProviderCredential[],
  userPrompt: string
): Promise<{ result: SemanticPlan; tables: string[]; metadata: { usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number; latencyMs?: number; }; provider: string; model: string; } }> {
  
  const { result, usage, model, provider } = await chatCompleteWithFailover<SemanticPlan>(chain, {
    systemPrompt: plannerSystemPrompt,
    userPrompt: userPrompt,
    stage: "router", // keep stage as router for telemetry continuity or we can create a new stage. Let's keep it 'router' to not break existing charts, or we can use 'planner'. In phase E it was router.
    temperature: 0.1,
    jsonSchema: plannerJsonSchema,
    schemaName: "SemanticPlan",
    schemaDescription: "Structured output for the RM Semantic Planner"
  });

  if (usage) {
    const lat = usage.latencyMs ? Math.round(usage.latencyMs) : "?";
    console.log(`\x1b[36m[RAG ENGINE] [PLAN]\x1b[0m\nIntent: ${result.intent}\nDomains: ${result.domains?.join(", ")}\nEntities: ${result.entities?.join(", ")}\nFilters: ${result.filters?.length || 0}\nOperations: ${result.operations?.join(", ")}\nCandidateTables: ${result.candidateTables?.join(", ")}\n`);
  }

  // Sanitização básica das tabelas retornadas
  let tables: string[] = [];
  if (Array.isArray(result.candidateTables)) {
    tables = result.candidateTables.map((t) => String(t).toUpperCase().trim()).filter(Boolean);
  }

  return { result, tables, metadata: { usage, provider, model } };
}
