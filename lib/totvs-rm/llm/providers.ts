/**
 * Camada de providers LLM do módulo RM SQL (todas via fetch puro, sem SDKs).
 *
 * - gemini: Google AI Studio (fetch generateContent, já era o padrão)
 * - groq: API OpenAI-compatível (https://api.groq.com/openai/v1)
 * - openrouter: API OpenAI-compatível (https://openrouter.ai/api/v1) — IMPLEMENTADO
 *   MAS DESABILITADO (OPENROUTER_ENABLED = false) até decisão futura.
 *
 * O roteamento com failover trata 429/limite de quota como rota alternativa,
 * não como erro: tenta os providers com chave em ordem e cai no fallback local.
 */

export type LlmProviderId = "gemini" | "groq" | "openrouter";

export const OPENROUTER_ENABLED = false;

export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export interface LlmCallParams {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

export interface LlmSqlJson {
  sqlCode: string;
  sqlExplanation: string;
  tablesUsed: string[];
  tips: string[];
}

export interface ProviderCredential {
  id: LlmProviderId;
  apiKey: string;
  model: string;
}

function extractJson(raw: string): LlmSqlJson {
  // Remove cercas de markdown caso o modelo as inclua
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  return {
    sqlCode: String(parsed.sqlCode || ""),
    sqlExplanation: String(parsed.sqlExplanation || ""),
    tablesUsed: Array.isArray(parsed.tablesUsed) ? parsed.tablesUsed.map(String) : [],
    tips: Array.isArray(parsed.tips) ? parsed.tips.map(String) : [],
  };
}

async function callGemini(cred: ProviderCredential, params: LlmCallParams): Promise<LlmSqlJson> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${cred.model}:generateContent?key=${cred.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${params.systemPrompt}\n\nSOLICITAÇÃO DO USUÁRIO:\n${params.userPrompt}` }] },
        ],
        generationConfig: {
          temperature: params.temperature ?? 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );
  if (!response.ok) {
    let detail = "";
    try {
      const errData = await response.json();
      detail = errData?.error?.message || "";
    } catch {
      // corpo de erro ilegível
    }
    throw new Error(`Gemini HTTP ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  const data = await response.json();
  const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) throw new Error("Gemini retornou resposta vazia.");
  return extractJson(rawContent);
}

async function callOpenAiCompatible(
  baseUrl: string,
  cred: ProviderCredential,
  params: LlmCallParams,
  extraHeaders?: Record<string, string>
): Promise<LlmSqlJson> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cred.apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model: cred.model,
      temperature: params.temperature ?? 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
  });
  if (!response.ok) {
    let detail = "";
    try {
      const errData = await response.json();
      detail = errData?.error?.message || JSON.stringify(errData)?.slice(0, 200) || "";
    } catch {
      // corpo de erro ilegível
    }
    throw new Error(`${cred.id} HTTP ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error(`${cred.id} retornou resposta vazia.`);
  return extractJson(rawContent);
}

/**
 * Executa a cadeia de providers em ordem; o primeiro com chave configurada
 * que responder vence. 429/quota/queda viram tentativa no próximo.
 */
export async function chatCompleteWithFailover(
  chain: ProviderCredential[],
  params: LlmCallParams
): Promise<{ result: LlmSqlJson; provider: LlmProviderId }> {
  const errors: string[] = [];
  for (const cred of chain) {
    if (!cred.apiKey) continue;
    if (cred.id === "openrouter" && !OPENROUTER_ENABLED) {
      console.warn("OpenRouter solicitado mas desabilitado (OPENROUTER_ENABLED=false); pulando.");
      continue;
    }
    try {
      if (cred.id === "gemini") {
        return { result: await callGemini(cred, params), provider: "gemini" };
      }
      if (cred.id === "groq") {
        const result = await callOpenAiCompatible("https://api.groq.com/openai/v1", cred, params);
        return { result, provider: "groq" };
      }
      const result = await callOpenAiCompatible("https://openrouter.ai/api/v1", cred, params, {
        "HTTP-Referer": "https://camini.local/totvs-rm",
        "X-Title": "camini RM SQL AI",
      });
      return { result, provider: "openrouter" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "erro desconhecido";
      console.warn(`Provider ${cred.id} falhou, tentando próximo:`, msg);
      errors.push(`${cred.id}: ${msg}`);
    }
  }
  throw new Error(
    errors.length > 0 ? `Todos os providers falharam (${errors.join(" | ")})` : "Nenhum provider com chave configurada."
  );
}
