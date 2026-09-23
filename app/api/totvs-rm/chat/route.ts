import { NextRequest, NextResponse } from "next/server";
import { identifyRelevantTables, buildSchemaContextPrompt } from "@/lib/totvs-rm/schema-engine";
import { generateSpecializedRMSql } from "@/lib/totvs-rm/fallback-sql";
import { verifySql } from "@/lib/totvs-rm/sql-verify";
import { buildRepairAddendum } from "@/lib/totvs-rm/llm/prompts/repair";
import { buildGeneratorSystemPrompt } from "@/lib/totvs-rm/llm/prompts/generator";
import {
  chatCompleteWithFailover,
  LlmProviderId,
  LlmSqlJson,
  ProviderCredential,
} from "@/lib/totvs-rm/llm/providers";
import { classifyQueryComplexity } from "@/lib/totvs-rm/complexity";
import { determineRoutingStrategy, RoutingConfig, determineEscalationRoute, isRepairEligible } from "@/lib/totvs-rm/routing-policy";

interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  systemModule?: string;
  dialect?: "sqlserver" | "oracle";
  provider?: "gemini" | "groq" | "openrouter";
  userApiKey?: string;
  userModel?: string;
  userGroqKey?: string;
  userGroqModel?: string;
}

export async function POST(req: NextRequest) {
  const requestStartTime = performance.now();
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, userApiKey, userModel } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem enviada." }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content;

    const geminiKey = process.env.GEMINI_API_KEY?.trim() || userApiKey?.trim() || "";
    const groqKey = process.env.GROQ_API_KEY?.trim() || body.userGroqKey?.trim() || "";
    const openaiKey = process.env.OPENAI_API_KEY?.trim() || "";

    const keyFor = (id: LlmProviderId) => {
      if (id === "openai") return openaiKey;
      return id === "groq" ? groqKey : geminiKey;
    };

    // Obsolete models
    const obsoleteGroq = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"];
    const obsoleteGemini = ["gemini-2.5-flash", "gemini-1.5-flash"];

    const resolvePlannerModel = (id: LlmProviderId) => {
      if (id === "groq") return process.env.GROQ_ROUTER_MODEL?.trim() || "llama3-70b-8192";
      if (id === "openai") return process.env.OPENAI_ROUTER_MODEL?.trim() || "gpt-4o-mini";
      return process.env.GEMINI_ROUTER_MODEL?.trim() || "gemini-1.5-pro-latest";
    };

    const getPrioritizedPlannerProviders = (envProvider?: string): LlmProviderId[] => {
      const p = envProvider?.trim().toLowerCase();
      const all: LlmProviderId[] = ["gemini", "groq", "openai"];
      if (p === "openai" && openaiKey) return ["openai", "gemini", "groq"];
      if (p === "groq" && groqKey) return ["groq", "gemini", "openai"];
      if (p === "gemini" && geminiKey) return ["gemini", "groq", "openai"];
      return all;
    };

    const plannerProviders = getPrioritizedPlannerProviders(process.env.RM_ROUTER_PROVIDER);
    const plannerChain: ProviderCredential[] = plannerProviders.map((id) => ({
      id,
      apiKey: keyFor(id),
      model: resolvePlannerModel(id),
    }));

    // 1. Semantic Planner + Dictionary Grounding
    const { tables: identifiedTables, contextMetadata, semanticPlan } = await identifyRelevantTables(userPrompt, plannerChain);
    const schemaContext = buildSchemaContextPrompt(identifiedTables, userPrompt);
    const tablesUsed = identifiedTables.map((t) => t.tabela);

    const contextLatency = performance.now() - requestStartTime;

    const rT = contextMetadata.routerTables.length ? contextMetadata.routerTables.join(", ") : "nenhuma";
    const sT = contextMetadata.seedTables.length ? contextMetadata.seedTables.join(", ") : "nenhuma";
    const eT = contextMetadata.expandedTables.length ? contextMetadata.expandedTables.join(", ") : "nenhuma";
    const aT = contextMetadata.finalAllowedTables.length ? contextMetadata.finalAllowedTables.join(", ") : "nenhuma";
    
    console.log(`\x1b[36m[RAG ENGINE] [CONTEXT]\x1b[0m\nRouterRawTables: ${rT}\nSeedTables: ${sT}\nExpandedTables: ${eT}\nAllowedTables: ${aT}\nLatency: ${Math.round(contextLatency)}ms\n`);

    // 2. Complexity Classification
    let complexityLevel = "unknown";
    let allowEscalation = false;
    let routingMode = "static";
    let preferredGenProvider = "gemini";
    let preferredGenModel = "gemini-1.5-pro-latest";

    if (semanticPlan) {
      const complexity = classifyQueryComplexity(semanticPlan, contextMetadata);
      complexityLevel = complexity.level;

      console.log(`\x1b[36m[RAG ENGINE] [COMPLEXITY]\x1b[0m\nLevel: ${complexity.level}\nReasons:\n- ${complexity.reasons.join("\n- ")}\n`);

      // 3. Deterministic Routing Policy
      const routingConfig: RoutingConfig = {
        mode: process.env.RM_ROUTING_MODE || "static",
        staticGeneratorProvider: process.env.RM_GENERATOR_PROVIDER,
        staticGeneratorModel: process.env.RM_GENERATOR_MODEL || process.env.LLM_MODEL_NAME || process.env.GEMINI_GENERATOR_MODEL,
        simpleGeneratorProvider: process.env.RM_SIMPLE_GENERATOR_PROVIDER,
        simpleGeneratorModel: process.env.RM_SIMPLE_GENERATOR_MODEL,
        moderateGeneratorProvider: process.env.RM_MODERATE_GENERATOR_PROVIDER,
        moderateGeneratorModel: process.env.RM_MODERATE_GENERATOR_MODEL,
        complexGeneratorProvider: process.env.RM_COMPLEX_GENERATOR_PROVIDER,
        complexGeneratorModel: process.env.RM_COMPLEX_GENERATOR_MODEL,
        envGroqModel: process.env.GROQ_GENERATOR_MODEL || "llama3-70b-8192",
        envOpenAiModel: process.env.OPENAI_GENERATOR_MODEL || "gpt-4o",
        envGeminiModel: process.env.GEMINI_GENERATOR_MODEL || "gemini-1.5-pro-latest"
      };

      const decision = determineRoutingStrategy(complexity, routingConfig);
      routingMode = decision.strategy;
      preferredGenProvider = decision.preferredProvider;
      preferredGenModel = decision.preferredModel;
      allowEscalation = decision.allowEscalation;

      console.log(`\x1b[36m[RAG ENGINE] [ROUTING]\x1b[0m\nMode: ${decision.strategy}\nStrategy: ${decision.strategy}\nPreferredProvider: ${decision.preferredProvider}\nPreferredModel: ${decision.preferredModel}\nAllowRepair: ${decision.allowRepair}\nAllowEscalation: ${decision.allowEscalation}\n`);
    } else {
      console.log(`\x1b[36m[RAG ENGINE] [ROUTING]\x1b[0m\nMode: static (Fallback)\nPreferredProvider: ${preferredGenProvider}\n`);
    }

    const generatorChain: ProviderCredential[] = [
      { id: preferredGenProvider as LlmProviderId, apiKey: keyFor(preferredGenProvider as LlmProviderId), model: preferredGenModel },
      { id: "gemini", apiKey: geminiKey, model: "gemini-1.5-pro-latest" },
      { id: "groq", apiKey: groqKey, model: "llama3-70b-8192" },
      { id: "openai", apiKey: openaiKey, model: "gpt-4o" }
    ];

    const systemPrompt = buildGeneratorSystemPrompt(schemaContext);

    const generatorJsonSchema = {
      type: "object",
      properties: {
        sqlCode: { type: "string", description: "Script SQL completo aqui formatado" },
        sqlExplanation: { type: "string", description: "Explicação detalhada EM PORTUGUÊS (Markdown) explicando as tabelas utilizadas, as condições de junção (JOINs) e os filtros aplicados." },
        tablesUsed: { type: "array", items: { type: "string" }, description: "Lista de tabelas utilizadas" },
        tips: { type: "array", items: { type: "string" }, description: "Dicas de performance ou regras de negócio RM relacionadas" }
      },
      required: ["sqlCode", "sqlExplanation", "tablesUsed", "tips"],
      additionalProperties: false
    };

    const allowedTables = Array.from(new Set(identifiedTables.map((t) => t.tabela)));
    const checkSql = (sql: string) =>
      verifySql({
        sql,
        allowedTables,
        requiredFilters: /CODCOLIGADA/i.test(sql) ? ["CODCOLIGADA"] : [],
      });

    let totalInput = contextMetadata.routerMetadata?.usage?.inputTokens || 0;
    let totalOutput = contextMetadata.routerMetadata?.usage?.outputTokens || 0;
    let totalTokens = contextMetadata.routerMetadata?.usage?.totalTokens || 0;
    let totalLatency = contextMetadata.routerMetadata?.usage?.latencyMs || 0;
    let generatorTokens = 0;
    let repairTokens = 0;
    let escalationTokens = 0;
    let wasRepaired = false;
    let wasEscalated = false;

    // Helper to run Generation + Verification + Repair
    const runGenerationCycle = async (chain: ProviderCredential[], isEscalation = false) => {
      const { result, provider, usage, model } = await chatCompleteWithFailover<LlmSqlJson>(chain, { 
        systemPrompt, 
        userPrompt, 
        stage: "generator",
        jsonSchema: generatorJsonSchema,
        schemaName: "LlmSqlJson",
        schemaDescription: "Structured output for generated SQL"
      });
      
      if (usage) {
        if (isEscalation) escalationTokens += usage.totalTokens || 0;
        else generatorTokens += usage.totalTokens || 0;
        totalInput += usage.inputTokens || 0;
        totalOutput += usage.outputTokens || 0;
        totalTokens += usage.totalTokens || 0;
        totalLatency += usage.latencyMs || 0;
        
        const lat = usage.latencyMs ? Math.round(usage.latencyMs) : "?";
        console.log(`\x1b[36m[RAG ENGINE] [GENERATOR${isEscalation ? ' ESCALATION' : ''}]\x1b[0m\nProvider: ${provider}\nModel: ${model}\nInput: ${usage.inputTokens}\nOutput: ${usage.outputTokens}\nTotal: ${usage.totalTokens}\nLatency: ${lat}ms\n`);
      }

      const normalized = validateAndNormalizeTSql(result.sqlCode || "");
      const checkResult = checkSql(normalized.sql);
      
      console.log(`\x1b[36m[RAG ENGINE] [VERIFY${isEscalation ? ' ESCALATION' : ''}]\x1b[0m\nFirstPass: ${checkResult.ok ? "PASS" : "FAIL"}\nErrors: ${checkResult.problems.length}\n`);

      if (checkResult.ok) {
        return { ok: true, result, normalized, warnings: normalized.warnings };
      }

      // REPAIR
      if (!isRepairEligible(checkResult.problems)) {
        console.warn("SQL rejeitado, e não é elegível para reparo:", checkResult.problems.map((p) => p.message));
        return { ok: false, problems: checkResult.problems };
      }

      console.warn("SQL rejeitado pelo verificador, tentando reparo:", checkResult.problems.map((p) => p.message));
      try {
        const addendum = buildRepairAddendum(checkResult.problems, normalized.sql, allowedTables);
        const { result: repaired, usage: repairUsage, provider: repProv, model: repMod } = await chatCompleteWithFailover<LlmSqlJson>(chain, {
          systemPrompt: systemPrompt + addendum,
          userPrompt,
          stage: "generator",
          jsonSchema: generatorJsonSchema,
          schemaName: "LlmSqlJson",
          schemaDescription: "Structured output for generated SQL repair"
        });
        
        if (repairUsage) {
           if (isEscalation) escalationTokens += repairUsage.totalTokens || 0;
           else repairTokens += repairUsage.totalTokens || 0;
           totalInput += repairUsage.inputTokens || 0;
           totalOutput += repairUsage.outputTokens || 0;
           totalTokens += repairUsage.totalTokens || 0;
           totalLatency += repairUsage.latencyMs || 0;
           
           const lat = repairUsage.latencyMs ? Math.round(repairUsage.latencyMs) : "?";
           console.log(`\x1b[36m[RAG ENGINE] [REPAIR${isEscalation ? ' ESCALATION' : ''}]\x1b[0m\nProvider: ${repProv}\nModel: ${repMod}\nInput: ${repairUsage.inputTokens}\nOutput: ${repairUsage.outputTokens}\nTotal: ${repairUsage.totalTokens}\nLatency: ${lat}ms\n`);
        }
        
        const normalizedRepair = validateAndNormalizeTSql(repaired.sqlCode || "");
        const secondCheck = checkSql(normalizedRepair.sql);
        
        console.log(`\x1b[36m[RAG ENGINE] [VERIFY${isEscalation ? ' ESCALATION' : ''}]\x1b[0m\nAfterRepair: ${secondCheck.ok ? "PASS" : "FAIL"}\n`);

        if (secondCheck.ok) {
          wasRepaired = true;
          return { ok: true, result: repaired, normalized: normalizedRepair, warnings: ["A primeira versão do SQL foi corrigida automaticamente pela verificação do dicionário.", ...normalizedRepair.warnings] };
        }
        return { ok: false, problems: secondCheck.problems };
      } catch (repairErr: unknown) {
        return { ok: false, problems: [{ message: repairErr instanceof Error ? repairErr.message : "Erro no reparo" }] };
      }
    };

    try {
      // Primary Generation Attempt
      const attempt1 = await runGenerationCycle(generatorChain, false);
      if (attempt1.ok) {
        const pipelineLatency = performance.now() - requestStartTime;
        console.log(`\x1b[36m[RAG ENGINE] [RESULT]\x1b[0m\nPlannerTokens: ${contextMetadata.routerMetadata?.usage?.totalTokens || 0}\nGeneratorTokens: ${generatorTokens}\nRepairTokens: ${repairTokens}\nEscalationTokens: ${escalationTokens}\nRequestInputTokens: ${totalInput}\nRequestOutputTokens: ${totalOutput}\nRequestTotalTokens: ${totalTokens}\nRequestPipelineLatency: ${Math.round(pipelineLatency)}ms\n`);
        return NextResponse.json({
          content: attempt1.result!.sqlExplanation || "Consulta gerada com sucesso.",
          sqlCode: attempt1.normalized!.sql,
          sqlExplanation: attempt1.result!.sqlExplanation || "",
          tablesUsed: attempt1.result!.tablesUsed?.length > 0 ? attempt1.result!.tablesUsed : tablesUsed,
          tips: [...attempt1.warnings!, ...(attempt1.result!.tips || [])],
          isFallback: false,
          repaired: wasRepaired,
        });
      }

      // ESCALATION (if primary fails verification & repair, and routing policy allows)
      if (allowEscalation) {
        // Fallback default routing config if empty
        const routingConfig: RoutingConfig = {
          mode: "complexity",
          envGroqModel: process.env.GROQ_GENERATOR_MODEL || "llama3-70b-8192",
          envOpenAiModel: process.env.OPENAI_GENERATOR_MODEL || "gpt-4o",
          envGeminiModel: process.env.GEMINI_GENERATOR_MODEL || "gemini-1.5-pro-latest"
        };
        const escalationRoute = determineEscalationRoute(preferredGenProvider, preferredGenModel, routingConfig);
        
        if (escalationRoute) {
          console.log(`\x1b[36m[RAG ENGINE] [ESCALATION]\x1b[0m\nFromProvider: ${preferredGenProvider}\nFromModel: ${preferredGenModel}\nToProvider: ${escalationRoute.provider}\nToModel: ${escalationRoute.model}\nReason: verifier_failed_after_repair\nEscalation: 1/1\n`);
          
          const escalationChain: ProviderCredential[] = [
            { id: escalationRoute.provider as LlmProviderId, apiKey: keyFor(escalationRoute.provider as LlmProviderId), model: escalationRoute.model }
          ];

          const attempt2 = await runGenerationCycle(escalationChain, true);
          if (attempt2.ok) {
            wasEscalated = true;
            const pipelineLatency = performance.now() - requestStartTime;
            console.log(`\x1b[36m[RAG ENGINE] [RESULT]\x1b[0m\nPlannerTokens: ${contextMetadata.routerMetadata?.usage?.totalTokens || 0}\nGeneratorTokens: ${generatorTokens}\nRepairTokens: ${repairTokens}\nEscalationTokens: ${escalationTokens}\nRequestInputTokens: ${totalInput}\nRequestOutputTokens: ${totalOutput}\nRequestTotalTokens: ${totalTokens}\nRequestPipelineLatency: ${Math.round(pipelineLatency)}ms\n`);
            return NextResponse.json({
              content: attempt2.result!.sqlExplanation || "Consulta gerada com sucesso.",
              sqlCode: attempt2.normalized!.sql,
              sqlExplanation: attempt2.result!.sqlExplanation || "",
              tablesUsed: attempt2.result!.tablesUsed?.length > 0 ? attempt2.result!.tablesUsed : tablesUsed,
              tips: ["Aviso: O gerador principal falhou, consulta gerada via Escalation.", ...attempt2.warnings!, ...(attempt2.result!.tips || [])],
              isFallback: false,
              repaired: wasRepaired,
            });
          }
        }
      }

    } catch (llmErr: unknown) {
      console.warn("Falha nos providers LLM, acionando gerador especializado RM:", llmErr instanceof Error ? llmErr.message : "Erro desconhecido");
    }

    // 4. Modo Fallback Inteligente Especializado
    const fallbackResponse = generateSpecializedRMSql(userPrompt, identifiedTables);
    const normalizedFallback = validateAndNormalizeTSql(fallbackResponse.sqlCode);

    const pipelineLatency = performance.now() - requestStartTime;
    console.log(`\x1b[36m[RAG ENGINE] [RESULT]\x1b[0m\nPlannerTokens: ${contextMetadata.routerMetadata?.usage?.totalTokens || 0}\nGeneratorTokens: ${generatorTokens}\nRepairTokens: ${repairTokens}\nEscalationTokens: ${escalationTokens}\nRequestInputTokens: ${totalInput}\nRequestOutputTokens: ${totalOutput}\nRequestTotalTokens: ${totalTokens}\nRequestPipelineLatency: ${Math.round(pipelineLatency)}ms\n`);

    return NextResponse.json({
      content: fallbackResponse.sqlExplanation,
      sqlCode: normalizedFallback.sql,
      sqlExplanation: fallbackResponse.sqlExplanation,
      tablesUsed: fallbackResponse.tablesUsed.length > 0 ? fallbackResponse.tablesUsed : tablesUsed,
      tips: [...normalizedFallback.warnings, ...fallbackResponse.tips],
      isFallback: true,
      repaired: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno ao processar consulta.";
    console.error("Erro no chat RM SQL:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function validateAndNormalizeTSql(input: string): { sql: string; warnings: string[] } {
  const warnings: string[] = [];
  if (!input) return { sql: input, warnings };

  let sql = input;

  if (/\bNVL\s*\(/i.test(sql)) {
    sql = sql.replace(/\bNVL\s*\(/gi, "ISNULL(");
    warnings.push("Converti NVL() para ISNULL(), que é a função equivalente no SQL Server.");
  }
  if (/\bSYSDATE\b/i.test(sql)) {
    sql = sql.replace(/\bSYSDATE\b/gi, "GETDATE()");
    warnings.push("Troquei SYSDATE por GETDATE(), a função de data/hora atual do SQL Server.");
  }
  if (/\bVARCHAR2\b/i.test(sql)) {
    sql = sql.replace(/\bVARCHAR2\b/gi, "VARCHAR");
    warnings.push("Ajustei VARCHAR2 para VARCHAR, o tipo texto do SQL Server.");
  }
  const fetchMatch = sql.match(/FETCH\s+FIRST\s+(\d+)\s+ROWS\s+ONLY/i);
  if (fetchMatch) {
    const topN = fetchMatch[1];
    sql = sql.replace(/FETCH\s+FIRST\s+\d+\s+ROWS\s+ONLY/i, "");
    if (!/\bSELECT\s+TOP\s+\d+/i.test(sql)) {
      sql = sql.replace(/\bSELECT\s+(DISTINCT\s+)?/i, (_m, d) => `SELECT TOP ${topN} ${d || ""}`);
    }
    warnings.push(`Converti FETCH FIRST ${topN} ROWS ONLY (Oracle) para TOP ${topN} (SQL Server).`);
  }
  if (/:=/.test(sql)) {
    sql = sql.replace(/:=/g, "=");
    warnings.push("Troquei o operador de atribuição := (Oracle) por = (T-SQL).");
  }
  if (/(^|[\s,(=]):([A-Za-z_][A-Za-z0-9_]*)/.test(sql)) {
    sql = sql.replace(/(^|[\s,(=]):([A-Za-z_][A-Za-z0-9_]*)/g, "$1@$2");
    warnings.push("Converti variáveis bind :NOME (Oracle) para @NOME (variáveis T-SQL).");
  }
  if (/\bFROM\s+DUAL\b/i.test(sql)) {
    sql = sql.replace(/\bFROM\s+DUAL\b/i, "");
    warnings.push("Removi FROM DUAL, que só existe no Oracle — no SQL Server o SELECT sem tabela é válido.");
  }

  const leftovers: Array<{ pattern: RegExp; hint: string }> = [
    { pattern: /\bCONNECT\s+BY\b/i, hint: "CONNECT BY (hierarquia Oracle): reescreva com CTE recursiva (WITH ... AS) no SQL Server." },
    { pattern: /\bSTART\s+WITH\b/i, hint: "START WITH (Oracle): reescreva com CTE recursiva no SQL Server." },
    { pattern: /\|\|/, hint: "Operador || (concatenação Oracle): use + ou a função CONCAT() no SQL Server." },
    { pattern: /\bNUMBER\s*\(/i, hint: "Tipo NUMBER (Oracle): use NUMERIC/DECIMAL ou INT no SQL Server." },
    { pattern: /\.NEXTVAL/i, hint: "Sequences Oracle (.NEXTVAL): use IDENTITY ou SEQUENCE do SQL Server (NEXT VALUE FOR)." },
  ];
  for (const item of leftovers) {
    if (item.pattern.test(sql)) {
      warnings.push(item.hint);
    }
  }

  if (/CODCOLIGADA/i.test(sql) && !/WHERE[\s\S]*CODCOLIGADA/i.test(sql)) {
    warnings.push("Atenção: o script cita CODCOLIGADA mas não filtra por ela no WHERE — restrinja a coligada para aproveitar os índices do RM.");
  }

  const bigTables = ["FLAN", "TMOV", "TITMMOV", "PFUNC", "CPARTIDA", "TPRD", "FCFO"];
  const mentionsBigTable = bigTables.some((t) => new RegExp(`\\b${t}\\b`, "i").test(sql));
  if (mentionsBigTable && !/WITH\s*\(\s*NOLOCK\s*\)/i.test(sql)) {
    warnings.push("Tabelas de grande volume (FLAN, TMOV, PFUNC...) sem WITH (NOLOCK): considere adicionar para não bloquear o ERP em produção.");
  }

  sql = sql.replace(/[ \t]+$/gm, "");

  return { sql, warnings };
}
