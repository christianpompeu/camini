/**
 * Camada de providers LLM do módulo RM SQL (todas via fetch puro, sem SDKs).
 *
 * - gemini: Google AI Studio (fetch generateContent)
 * - groq: API OpenAI-compatível (https://api.groq.com/openai/v1)
 * - openai: API nativa da OpenAI (https://api.openai.com/v1) - Suporte a Structured Outputs
 * - openrouter: API OpenAI-compatível (https://openrouter.ai/api/v1)
 */

export type LlmProviderId = "gemini" | "groq" | "openrouter" | "openai";

export const OPENROUTER_ENABLED = false;

export interface LlmUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  latencyMs?: number;
}

export interface LlmCallParams<T = any> {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  stage?: "router" | "generator";
  // Opcional para extração via OpenAI Structured Outputs
  jsonSchema?: any;
  schemaName?: string;
  schemaDescription?: string;
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

export interface ProviderResult<T> {
  result: T;
  provider: LlmProviderId;
  model: string;
  usage?: LlmUsage;
}

function extractJson<T>(raw: string): T {
  // Remove cercas de markdown caso o modelo as inclua
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

async function callGemini<T>(cred: ProviderCredential, params: LlmCallParams<T>): Promise<{ result: T; usage?: LlmUsage; model: string }> {
  let model = cred.model;
  if (params.stage === "router" && process.env.GEMINI_ROUTER_MODEL) {
    model = process.env.GEMINI_ROUTER_MODEL.trim();
  } else if (params.stage === "generator" && process.env.GEMINI_GENERATOR_MODEL) {
    model = process.env.GEMINI_GENERATOR_MODEL.trim();
  } else {
    const obsoleteGemini = ["gemini-2.5-flash", "gemini-1.5-flash"];
    model = cred.model?.trim() && !obsoleteGemini.includes(cred.model.trim())
        ? cred.model.trim()
        : process.env.GEMINI_MODEL_NAME || "gemini-1.5-pro-latest";
  }

  const startTime = performance.now();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cred.apiKey}`,
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
  const latencyMs = performance.now() - startTime;
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
  
  const usage: LlmUsage = {
    inputTokens: data?.usageMetadata?.promptTokenCount,
    outputTokens: data?.usageMetadata?.candidatesTokenCount,
    totalTokens: data?.usageMetadata?.totalTokenCount,
    latencyMs,
  };

  return { result: extractJson<T>(rawContent), usage, model };
}

async function callOpenAiCompatible<T>(
  baseUrl: string,
  cred: ProviderCredential,
  params: LlmCallParams<T>,
  extraHeaders?: Record<string, string>
): Promise<{ result: T; usage?: LlmUsage; model: string }> {
  let model = cred.model;
  if (cred.id === "groq") {
    if (params.stage === "router" && process.env.GROQ_ROUTER_MODEL) {
      model = process.env.GROQ_ROUTER_MODEL.trim();
    } else if (params.stage === "generator" && process.env.GROQ_GENERATOR_MODEL) {
      model = process.env.GROQ_GENERATOR_MODEL.trim();
    } else {
      const obsoleteGroq = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"];
      const defaultModel = process.env.LLM_MODEL_NAME || "llama3-70b-8192";
      model = cred.model?.trim() && !obsoleteGroq.includes(cred.model.trim())
          ? cred.model.trim()
          : defaultModel;
    }
  }

  const startTime = performance.now();
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cred.apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      temperature: params.temperature ?? 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
  });
  const latencyMs = performance.now() - startTime;
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
  
  const usage: LlmUsage = {
    inputTokens: data?.usage?.prompt_tokens,
    outputTokens: data?.usage?.completion_tokens,
    totalTokens: data?.usage?.total_tokens,
    latencyMs,
  };

  return { result: extractJson<T>(rawContent), usage, model };
}

async function callOpenAi<T>(cred: ProviderCredential, params: LlmCallParams<T>): Promise<{ result: T; usage?: LlmUsage; model: string }> {
  let model = cred.model;
  if (params.stage === "router" && process.env.OPENAI_ROUTER_MODEL) {
    model = process.env.OPENAI_ROUTER_MODEL.trim();
  } else if (params.stage === "generator" && process.env.OPENAI_GENERATOR_MODEL) {
    model = process.env.OPENAI_GENERATOR_MODEL.trim();
  }

  // Se for especificado um jsonSchema e nome, usa Structured Outputs da OpenAI.
  // Caso contrário, usa apenas json_object.
  const responseFormat = params.jsonSchema ? {
    type: "json_schema",
    json_schema: {
      name: params.schemaName || "ResponseSchema",
      description: params.schemaDescription || "Schema of the structured response",
      schema: params.jsonSchema,
      strict: true
    }
  } : { type: "json_object" };

  const payload: any = {
    model,
    response_format: responseFormat,
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
  };

  // Helpers de capacidades: omite 'temperature' para modelos que não a suportam (ex: o1, gpt-5.6-luna)
  const modelsWithoutTemperature = ["o1-preview", "o1-mini", "gpt-5.6-luna"];
  const supportsTemperature = !modelsWithoutTemperature.some(m => model.includes(m));
  
  if (supportsTemperature) {
    payload.temperature = params.temperature ?? 0.2;
  }

  const startTime = performance.now();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cred.apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  const latencyMs = performance.now() - startTime;

  if (!response.ok) {
    let detail = "";
    try {
      const errData = await response.json();
      detail = errData?.error?.message || JSON.stringify(errData)?.slice(0, 200) || "";
    } catch {
      // corpo de erro ilegível
    }
    throw new Error(`openai HTTP ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  
  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error(`openai retornou resposta vazia.`);
  
  const usage: LlmUsage = {
    inputTokens: data?.usage?.prompt_tokens,
    outputTokens: data?.usage?.completion_tokens,
    totalTokens: data?.usage?.total_tokens,
    latencyMs,
  };

  return { result: JSON.parse(rawContent) as T, usage, model };
}

/**
 * Executa a cadeia de providers em ordem; o primeiro com chave configurada
 * que responder vence. 429/quota/queda viram tentativa no próximo.
 */
export async function chatCompleteWithFailover<T = LlmSqlJson>(
  chain: ProviderCredential[],
  params: LlmCallParams<T>
): Promise<ProviderResult<T>> {
  const errors: string[] = [];
  let attempt = 1;
  const stageName = (params.stage || "UNKNOWN").toUpperCase(); // ROUTER, GENERATOR, REPAIR

  for (const cred of chain) {
    if (!cred.apiKey) continue;
    if (cred.id === "openrouter" && !OPENROUTER_ENABLED) {
      console.warn("OpenRouter solicitado mas desabilitado (OPENROUTER_ENABLED=false); pulando.");
      continue;
    }

    // Identificar o modelo real que será usado (espelhando a lógica das calls)
    let actualModel = cred.model || "default";
    if (cred.id === "groq") {
      if (params.stage === "router" && process.env.GROQ_ROUTER_MODEL) actualModel = process.env.GROQ_ROUTER_MODEL.trim();
      else if (params.stage === "generator" && process.env.GROQ_GENERATOR_MODEL) actualModel = process.env.GROQ_GENERATOR_MODEL.trim();
    }

    console.log(`\x1b[36m[RAG ENGINE] [${stageName} ATTEMPT]\x1b[0m\nProvider: ${cred.id}\nModel: ${actualModel}\nAttempt: ${attempt}\n`);

    try {
      if (cred.id === "gemini") {
        const { result, usage, model } = await callGemini<T>(cred, params);
        return { result, provider: "gemini", model, usage };
      }
      if (cred.id === "openai") {
        const { result, usage, model } = await callOpenAi<T>(cred, params);
        return { result, provider: "openai", model, usage };
      }
      if (cred.id === "groq") {
        const { result, usage, model } = await callOpenAiCompatible<T>("https://api.groq.com/openai/v1", cred, params);
        return { result, provider: "groq", model, usage };
      }
      const { result, usage, model } = await callOpenAiCompatible<T>("https://openrouter.ai/api/v1", cred, params, {
        "HTTP-Referer": "https://camini.local/totvs-rm",
        "X-Title": "camini RM SQL AI",
      });
      return { result, provider: "openrouter", model, usage };
    } catch (err) {
      let status = "Unknown";
      let errorType = "Exception";
      let message = "erro desconhecido";
      
      if (err instanceof Error) {
        message = err.message;
        if ((err as any).status) status = (err as any).status.toString();
        if ((err as any).type) errorType = (err as any).type;
        else errorType = err.name;
      }
      
      console.log(`\x1b[31m[RAG ENGINE] [${stageName} FAILOVER]\x1b[0m\nProvider: ${cred.id}\nModel: ${actualModel}\nStatus: ${status}\nErrorType: ${errorType}\nMessage: ${message.substring(0, 300)}\n`);
      
      errors.push(`${cred.id}: ${message}`);
      attempt++;
    }
  }
  throw new Error(
    errors.length > 0 ? `Todos os providers falharam (${errors.join(" | ")})` : "Nenhum provider com chave configurada."
  );
}
