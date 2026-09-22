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
    const { messages, systemModule, userApiKey, userModel } = body;
    // Trava temporária: somente Microsoft SQL Server (T-SQL). O campo `dialect`
    // vindo do client é ignorado de propósito e o Oracle será reintroduzido depois.

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem enviada." }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content;

    // 1. Cadeia de providers LLM: o selecionado primeiro, o outro de failover.
    // Prioridade: process.env (`.env.local`, servidor) > chave do navegador
    // (localStorage, enviada no body). O servidor nunca expõe o valor do env.
    const selectedProvider: LlmProviderId = body.provider === "groq" ? "groq" : "gemini";
    const geminiKey = process.env.GEMINI_API_KEY?.trim() || userApiKey?.trim() || "";
    const groqKey = process.env.GROQ_API_KEY?.trim() || body.userGroqKey?.trim() || "";
    const otherProvider: LlmProviderId = selectedProvider === "groq" ? "gemini" : "groq";

    // Resolução de modelos com filtragem de versões obsoletas e prioridade de env:
    const obsoleteGroq = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"];
    const obsoleteGemini = ["gemini-2.5-flash", "gemini-1.5-flash"];

    const resolveGeneratorModel = (id: LlmProviderId) => {
      if (id === "groq") {
        if (process.env.GROQ_GENERATOR_MODEL?.trim()) return process.env.GROQ_GENERATOR_MODEL.trim();
        if (process.env.LLM_MODEL_NAME?.trim()) return process.env.LLM_MODEL_NAME.trim();
        if (body.userGroqModel?.trim() && !obsoleteGroq.includes(body.userGroqModel.trim())) {
          return body.userGroqModel.trim();
        }
        return "llama3-70b-8192";
      } else if (id === "openai") {
        return process.env.OPENAI_GENERATOR_MODEL?.trim() || "gpt-4o";
      } else {
        if (process.env.GEMINI_GENERATOR_MODEL?.trim()) return process.env.GEMINI_GENERATOR_MODEL.trim();
        if (process.env.GEMINI_MODEL_NAME?.trim()) return process.env.GEMINI_MODEL_NAME.trim();
        if (userModel?.trim() && !obsoleteGemini.includes(userModel.trim())) {
          return userModel.trim();
        }
        return "gemini-1.5-pro-latest";
      }
    };

    const keyFor = (id: LlmProviderId) => {
      if (id === "openai") return process.env.OPENAI_API_KEY?.trim() || "";
      return id === "groq" ? groqKey : geminiKey;
    };
    
    // Lista de providers a serem testados
    const availableProviders: LlmProviderId[] = [selectedProvider, otherProvider];
    if (process.env.OPENAI_API_KEY) {
      availableProviders.push("openai");
    }

    // Chain original usada pelo Roteador
    const chain: ProviderCredential[] = availableProviders.map((id) => ({
      id,
      apiKey: keyFor(id),
      model: id === "groq" ? "llama3-70b-8192" : (id === "openai" ? "gpt-4o-mini" : "gemini-1.5-pro-latest"),
    }));

    // Chain estrita para o Gerador T-SQL
    const generatorChain: ProviderCredential[] = availableProviders.map((id) => ({
      id,
      apiKey: keyFor(id),
      model: resolveGeneratorModel(id),
    }));

    // 2. Roteador Semântico (NLP Router): identifica tabelas e relacionamentos relevantes via IA + Grafo
    const { tables: identifiedTables, contextMetadata } = await identifyRelevantTables(userPrompt, chain);
    const schemaContext = buildSchemaContextPrompt(identifiedTables, userPrompt);
    const tablesUsed = identifiedTables.map((t) => t.tabela);

    const contextLatency = performance.now() - requestStartTime;
    
    // Log do Context Builder
    const rT = contextMetadata.routerTables.length ? contextMetadata.routerTables.join(", ") : "nenhuma";
    const sT = contextMetadata.seedTables.length ? contextMetadata.seedTables.join(", ") : "nenhuma";
    const eT = contextMetadata.expandedTables.length ? contextMetadata.expandedTables.join(", ") : "nenhuma";
    const aT = contextMetadata.finalAllowedTables.length ? contextMetadata.finalAllowedTables.join(", ") : "nenhuma";
    console.log(`\x1b[36m[RAG ENGINE] [CONTEXT]\x1b[0m\nRouterRawTables: ${rT}\nSeedTables: ${sT}\nExpandedTables: ${eT}\nAllowedTables: ${aT}\nLatency: ${Math.round(contextLatency)}ms\n`);

    // 3. Montagem do prompt do sistema especializado em TOTVS RM
    const systemPrompt = buildGeneratorSystemPrompt(schemaContext);

    // Schema do Structured Output para o Gerador
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

    // 3. Providers LLM com failover (selecionado -> outro -> fallback local)
    // + verificação semântica do SQL (Fase D): tabelas/JOINs lastreados no
    // dicionário; rejeitado => 1 tentativa de reparo com o diagnóstico.
    const allowedTables = Array.from(
      new Set(identifiedTables.map((t) => t.tabela))
    );
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
    let wasRepaired = false;
    let generatorTokens = 0;
    let repairTokens = 0;

    try {
      const { result, provider, usage, model } = await chatCompleteWithFailover<LlmSqlJson>(generatorChain, { 
        systemPrompt, 
        userPrompt, 
        stage: "generator",
        jsonSchema: generatorJsonSchema,
        schemaName: "LlmSqlJson",
        schemaDescription: "Structured output for generated SQL"
      });
      
      if (usage) {
        generatorTokens = usage.totalTokens || 0;
        totalInput += usage.inputTokens || 0;
        totalOutput += usage.outputTokens || 0;
        totalTokens += usage.totalTokens || 0;
        totalLatency += usage.latencyMs || 0;
        
        const lat = usage.latencyMs ? Math.round(usage.latencyMs) : "?";
        console.log(`\x1b[36m[RAG ENGINE] [GENERATOR]\x1b[0m\nProvider: ${provider}\nModel: ${model}\nInput: ${usage.inputTokens}\nOutput: ${usage.outputTokens}\nTotal: ${usage.totalTokens}\nLatency: ${lat}ms\n`);
      }

      const normalized = validateAndNormalizeTSql(result.sqlCode || "");
      const firstCheck = checkSql(normalized.sql);
      
      console.log(`\x1b[36m[RAG ENGINE] [VERIFY]\x1b[0m\nFirstPass: ${firstCheck.ok ? "PASS" : "FAIL"}\nErrors: ${firstCheck.problems.length}\n`);

      if (firstCheck.ok) {
        const pipelineLatency = performance.now() - requestStartTime;
        console.log(`\x1b[36m[RAG ENGINE] [RESULT]\x1b[0m\nRouterTokens: ${contextMetadata.routerMetadata?.usage?.totalTokens || 0}\nGeneratorTokens: ${generatorTokens}\nRepairTokens: ${repairTokens}\nRequestInputTokens: ${totalInput}\nRequestOutputTokens: ${totalOutput}\nRequestTotalTokens: ${totalTokens}\nRequestPipelineLatency: ${Math.round(pipelineLatency)}ms\n`);
        return NextResponse.json({
          content: result.sqlExplanation || "Consulta gerada com sucesso.",
          sqlCode: normalized.sql,
          sqlExplanation: result.sqlExplanation || "",
          tablesUsed: result.tablesUsed?.length > 0 ? result.tablesUsed : tablesUsed,
          tips: [...normalized.warnings, ...(result.tips || [])],
          isFallback: false,
          repaired: false,
        });
      }
      
      console.warn("SQL rejeitado pelo verificador, tentando reparo:", firstCheck.problems.map((p) => p.message));
      try {
        const addendum = buildRepairAddendum(firstCheck.problems, normalized.sql, allowedTables);
        const { result: repaired, usage: repairUsage, provider: repProv, model: repMod } = await chatCompleteWithFailover<LlmSqlJson>(generatorChain, {
          systemPrompt: systemPrompt + addendum,
          userPrompt,
          stage: "generator",
          jsonSchema: generatorJsonSchema,
          schemaName: "LlmSqlJson",
          schemaDescription: "Structured output for generated SQL repair"
        });
        
        if (repairUsage) {
           repairTokens = repairUsage.totalTokens || 0;
           totalInput += repairUsage.inputTokens || 0;
           totalOutput += repairUsage.outputTokens || 0;
           totalTokens += repairUsage.totalTokens || 0;
           totalLatency += repairUsage.latencyMs || 0;
           
           const lat = repairUsage.latencyMs ? Math.round(repairUsage.latencyMs) : "?";
           console.log(`\x1b[36m[RAG ENGINE] [REPAIR]\x1b[0m\nProvider: ${repProv}\nModel: ${repMod}\nInput: ${repairUsage.inputTokens}\nOutput: ${repairUsage.outputTokens}\nTotal: ${repairUsage.totalTokens}\nLatency: ${lat}ms\n`);
        }
        
        const normalizedRepair = validateAndNormalizeTSql(repaired.sqlCode || "");
        const secondCheck = checkSql(normalizedRepair.sql);
        
        console.log(`\x1b[36m[RAG ENGINE] [VERIFY]\x1b[0m\nAfterRepair: ${secondCheck.ok ? "PASS" : "FAIL"}\n`);

        if (secondCheck.ok) {
          wasRepaired = true;
          const pipelineLatency = performance.now() - requestStartTime;
          console.log(`\x1b[36m[RAG ENGINE] [RESULT]\x1b[0m\nRouterTokens: ${contextMetadata.routerMetadata?.usage?.totalTokens || 0}\nGeneratorTokens: ${generatorTokens}\nRepairTokens: ${repairTokens}\nRequestInputTokens: ${totalInput}\nRequestOutputTokens: ${totalOutput}\nRequestTotalTokens: ${totalTokens}\nRequestPipelineLatency: ${Math.round(pipelineLatency)}ms\n`);
          return NextResponse.json({
            content: repaired.sqlExplanation || "Consulta gerada com sucesso.",
            sqlCode: normalizedRepair.sql,
            sqlExplanation: repaired.sqlExplanation || "",
            tablesUsed: repaired.tablesUsed?.length > 0 ? repaired.tablesUsed : tablesUsed,
            tips: [
              "A primeira versão do SQL foi corrigida automaticamente pela verificação do dicionário.",
              ...normalizedRepair.warnings,
              ...(repaired.tips || []),
            ],
            isFallback: false,
            repaired: true,
          });
        }
        console.warn("Reparo rejeitado pelo verificador:", secondCheck.problems.map((p) => p.message));
      } catch (repairErr: unknown) {
        const repairMsg = repairErr instanceof Error ? repairErr.message : "Erro desconhecido";
        console.warn("Falha no reparo, acionando fallback:", repairMsg);
      }
      // Cai no fallback inteligente abaixo
    } catch (llmErr: unknown) {
      const errMsg = llmErr instanceof Error ? llmErr.message : "Erro desconhecido";
      console.warn("Falha nos providers LLM, acionando gerador especializado RM:", errMsg);
      // Prossegue para o fallback inteligente abaixo
    }

    // 4. Modo Fallback Inteligente Especializado (Gera SQL real com base no dicionário RM mesmo sem chave configurada)
    const fallbackResponse = generateSpecializedRMSql(userPrompt, identifiedTables);
    const normalizedFallback = validateAndNormalizeTSql(fallbackResponse.sqlCode);

    const pipelineLatency = performance.now() - requestStartTime;
    console.log(`\x1b[36m[RAG ENGINE] [RESULT]\x1b[0m\nRouterTokens: ${contextMetadata.routerMetadata?.usage?.totalTokens || 0}\nGeneratorTokens: ${generatorTokens}\nRepairTokens: ${repairTokens}\nRequestInputTokens: ${totalInput}\nRequestOutputTokens: ${totalOutput}\nRequestTotalTokens: ${totalTokens}\nRequestPipelineLatency: ${Math.round(pipelineLatency)}ms\n`);

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

/**
 * Validador/normalizador T-SQL (trava temporária: somente SQL Server).
 * Converte resquícios de sintaxe Oracle em T-SQL equivalente e devolve
 * avisos amigáveis em PT-BR, que são anexados ao array `tips` da resposta.
 */
function validateAndNormalizeTSql(input: string): { sql: string; warnings: string[] } {
  const warnings: string[] = [];
  if (!input) return { sql: input, warnings };

  let sql = input;

  // NVL(...) -> ISNULL(...)
  if (/\bNVL\s*\(/i.test(sql)) {
    sql = sql.replace(/\bNVL\s*\(/gi, "ISNULL(");
    warnings.push("Converti NVL() para ISNULL(), que é a função equivalente no SQL Server.");
  }

  // SYSDATE -> GETDATE()
  if (/\bSYSDATE\b/i.test(sql)) {
    sql = sql.replace(/\bSYSDATE\b/gi, "GETDATE()");
    warnings.push("Troquei SYSDATE por GETDATE(), a função de data/hora atual do SQL Server.");
  }

  // VARCHAR2 -> VARCHAR
  if (/\bVARCHAR2\b/i.test(sql)) {
    sql = sql.replace(/\bVARCHAR2\b/gi, "VARCHAR");
    warnings.push("Ajustei VARCHAR2 para VARCHAR, o tipo texto do SQL Server.");
  }

  // FETCH FIRST N ROWS ONLY (Oracle) -> TOP N (SQL Server, reposicionado após o SELECT)
  const fetchMatch = sql.match(/FETCH\s+FIRST\s+(\d+)\s+ROWS\s+ONLY/i);
  if (fetchMatch) {
    const topN = fetchMatch[1];
    sql = sql.replace(/FETCH\s+FIRST\s+\d+\s+ROWS\s+ONLY/i, "");
    if (!/\bSELECT\s+TOP\s+\d+/i.test(sql)) {
      sql = sql.replace(/\bSELECT\s+(DISTINCT\s+)?/i, (_m, d) => `SELECT TOP ${topN} ${d || ""}`);
    }
    warnings.push(`Converti FETCH FIRST ${topN} ROWS ONLY (Oracle) para TOP ${topN} (SQL Server).`);
  }

  // Atribuição Oracle := -> =
  if (/:=/.test(sql)) {
    sql = sql.replace(/:=/g, "=");
    warnings.push("Troquei o operador de atribuição := (Oracle) por = (T-SQL).");
  }

  // Binds Oracle :VAR -> variáveis T-SQL @VAR
  if (/(^|[\s,(=]):([A-Za-z_][A-Za-z0-9_]*)/.test(sql)) {
    sql = sql.replace(/(^|[\s,(=]):([A-Za-z_][A-Za-z0-9_]*)/g, "$1@$2");
    warnings.push("Converti variáveis bind :NOME (Oracle) para @NOME (variáveis T-SQL).");
  }

  // FROM DUAL só existe no Oracle — no SQL Server o SELECT sem tabela é válido
  if (/\bFROM\s+DUAL\b/i.test(sql)) {
    sql = sql.replace(/\bFROM\s+DUAL\b/i, "");
    warnings.push("Removi FROM DUAL, que só existe no Oracle — no SQL Server o SELECT sem tabela é válido.");
  }

  // Resíduos Oracle sem conversão automática: viram aviso de revisão manual
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

  // Checagem amigável: citou CODCOLIGADA mas não filtra por ela
  if (/CODCOLIGADA/i.test(sql) && !/WHERE[\s\S]*CODCOLIGADA/i.test(sql)) {
    warnings.push("Atenção: o script cita CODCOLIGADA mas não filtra por ela no WHERE — restrinja a coligada para aproveitar os índices do RM.");
  }

  // Checagem amigável: tabelas de grande volume sem WITH (NOLOCK)
  const bigTables = ["FLAN", "TMOV", "TITMMOV", "PFUNC", "CPARTIDA", "TPRD", "FCFO"];
  const mentionsBigTable = bigTables.some((t) => new RegExp(`\\b${t}\\b`, "i").test(sql));
  if (mentionsBigTable && !/WITH\s*\(\s*NOLOCK\s*\)/i.test(sql)) {
    warnings.push("Tabelas de grande volume (FLAN, TMOV, PFUNC...) sem WITH (NOLOCK): considere adicionar para não bloquear o ERP em produção.");
  }

  // Limpeza leve de espaços no fim das linhas (ex.: após remover FETCH FIRST)
  sql = sql.replace(/[ \t]+$/gm, "");

  return { sql, warnings };
}
