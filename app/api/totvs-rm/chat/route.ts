import { NextRequest, NextResponse } from "next/server";
import { identifyRelevantTables, buildSchemaContextPrompt, getTableDetails } from "@/lib/totvs-rm/schema-engine";
import { generateSpecializedRMSql } from "@/lib/totvs-rm/fallback-sql";
import {
  chatCompleteWithFailover,
  LlmProviderId,
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

    // 1. Identificar tabelas e relacionamentos relevantes no dicionário do RM
    const identifiedTables = identifyRelevantTables(userPrompt, systemModule);
    
    // Opcional: Adicionar regras extras baseadas no prompt se necessário. 
    // Com o novo motor semântico FTS, os relacionamentos de saída já trazem o contexto direto das tabelas identificadas.
    
    const schemaContext = buildSchemaContextPrompt(identifiedTables, userPrompt);
    console.log(`\x1b[36m[RAG ENGINE] Contexto Schema (tamanho): ${schemaContext.length} caracteres\x1b[0m`);
    const tablesUsed = identifiedTables.map((t) => t.tabela);

    // 2. Cadeia de providers LLM: o selecionado primeiro, o outro de failover.
    // Prioridade: process.env (`.env.local`, servidor) > chave do navegador
    // (localStorage, enviada no body). O servidor nunca expõe o valor do env.
    const selectedProvider: LlmProviderId = body.provider === "groq" ? "groq" : "gemini";
    const geminiKey = process.env.GEMINI_API_KEY?.trim() || userApiKey?.trim() || "";
    const groqKey = process.env.GROQ_API_KEY?.trim() || body.userGroqKey?.trim() || "";
    const otherProvider: LlmProviderId = selectedProvider === "groq" ? "gemini" : "groq";

    // Resolução de modelos com filtragem de versões obsoletas e prioridade de env:
    const obsoleteGroq = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"];
    const obsoleteGemini = ["gemini-2.5-flash", "gemini-1.5-flash"];

    const resolveGroqModel = () => {
      if (process.env.LLM_MODEL_NAME?.trim()) return process.env.LLM_MODEL_NAME.trim();
      if (body.userGroqModel?.trim() && !obsoleteGroq.includes(body.userGroqModel.trim())) {
        return body.userGroqModel.trim();
      }
      return process.env.LLM_MODEL_NAME || "llama3-70b-8192";
    };

    const resolveGeminiModel = () => {
      if (process.env.GEMINI_MODEL_NAME?.trim()) return process.env.GEMINI_MODEL_NAME.trim();
      if (userModel?.trim() && !obsoleteGemini.includes(userModel.trim())) {
        return userModel.trim();
      }
      return process.env.GEMINI_MODEL_NAME || "gemini-1.5-pro-latest";
    };

    const modelFor = (id: LlmProviderId) => (id === "groq" ? resolveGroqModel() : resolveGeminiModel());
    const keyFor = (id: LlmProviderId) => (id === "groq" ? groqKey : geminiKey);
    const chain: ProviderCredential[] = [selectedProvider, otherProvider].map((id) => ({
      id,
      apiKey: keyFor(id),
      model: modelFor(id),
    }));

    // 3. Montagem do prompt do sistema especializado em TOTVS RM
    const systemPrompt = `Você é o maior especialista sênior em banco de dados e desenvolvimento de consultas SQL para o ERP TOTVS Corpore RM.
Sua missão é gerar scripts SQL de alta performance, precisos e elegantes, rigorosamente alinhados com a arquitetura e dicionário de dados do RM.

DIALETO OBRIGATÓRIO: Microsoft SQL Server T-SQL (padrão do RM). É PROIBIDO usar qualquer sintaxe Oracle (NVL, SYSDATE, FETCH FIRST, DEFINE, VARCHAR2, NUMBER, binds :VAR, operador || para concatenação, FROM DUAL).

Responda sempre em português (PT-BR), de forma clara e amigável para um consultor funcional do RM.

DIRETRIZES FUNDAMENTAIS DO TOTVS CORPORE RM:
1. Multi-Coligada: O RM é um sistema multi-empresa. QUASE TODAS as tabelas possuem a coluna CODCOLIGADA. Sempre filtre por CODCOLIGADA ou declare um parâmetro (ex: @CODCOLIGADA = 1).
2. Clientes e Fornecedores: A tabela FCFO relaciona-se com FLAN via (FLAN.CODCOLCFO = FCFO.CODCOLIGADA AND FLAN.CODCFO = FCFO.CODCFO) ou (FLAN.CODCOLIGADA = FCFO.CODCOLIGADA AND FLAN.CODCFO = FCFO.CODCFO).
3. Movimentos (RM Nucleus): A tabela TMOV (cabeçalho) liga-se a TITMMOV (itens) por (TMOV.CODCOLIGADA = TITMMOV.CODCOLIGADA AND TMOV.IDMOV = TITMMOV.IDMOV). TITMMOV liga-se a TPRD (produtos) por (TITMMOV.CODCOLIGADA = TPRD.CODCOLIGADA AND TITMMOV.IDPRD = TPRD.IDPRD). Pagamentos da venda: TMOV liga-se a TMOVPAGTO por (TMOV.CODCOLIGADA = TMOVPAGTO.CODCOLIGADA AND TMOV.IDMOV = TMOVPAGTO.IDMOV); TMOVPAGTO liga-se a TPAGTO por (TMOVPAGTO.CODCOLIGADA = TPAGTO.CODCOLIGADA AND TMOVPAGTO.IDSEQPAGTO = TPAGTO.IDSEQPAGTO); TPAGTO liga-se a FLAN por (TPAGTO.CODCOLIGADA = FLAN.CODCOLIGADA AND TPAGTO.IDLAN = FLAN.IDLAN).
4. Lançamentos Financeiros (RM Fluxus):
   - PAGREC: 1 = A Receber, 2 = A Pagar
   - STATUSLAN: 0 = Em Aberto, 1 = Baixado, 2 = Cancelado
5. Funcionários (RM Labore):
   - Chave primária: CODCOLIGADA, CHAPA.
   - Situação: PFHSTSIT ou PFUNC.CODSITUACAO ('A' = Ativo, 'D' = Demitido, 'F' = Férias, etc).
   - Seção / Centro de Custo RH: PSECAO (PFUNC.CODCOLIGADA = PSECAO.CODCOLIGADA AND PFUNC.CODSECAO = PSECAO.CODIGO).
6. Performance (MUITO CRÍTICO): É ESTRITAMENTE OBRIGATÓRIO o uso da hint WITH (NOLOCK) logo após declarar cada tabela em cláusulas FROM ou JOIN. Exemplo: FROM FLAN F WITH (NOLOCK) INNER JOIN FCFO C WITH (NOLOCK) ON... Se você omitir, a sua query irá derrubar e bloquear o banco inteiro em produção.
7. Formatação: O SQL deve ser limpo, indentado com aliases claros (ex: F para FLAN, C para FCFO, M para TMOV, I para TITMMOV).
8. JOINs: utilize EXCLUSIVAMENTE as condições da seção JOINS GARANTIDOS do contexto (extraídas do dicionário oficial). Nunca invente colunas de ligação.

CONTEXTO DO ESQUEMA EXTRAÍDO DO DICIONÁRIO RM:
${schemaContext}

FORMATO DA SUA RESPOSTA:
Você DEVE responder ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "sqlCode": "-- Script SQL completo aqui formatado",
  "sqlExplanation": "Explicação detalhada EM PORTUGUÊS (Markdown) explicando as tabelas utilizadas, as condições de junção (JOINs) e os filtros aplicados.",
  "tablesUsed": ["TABELA1", "TABELA2"],
  "tips": [
    "Dica prática de performance ou regra de negócio RM relacionada a esta consulta",
    "Outra dica útil (ex: parâmetros de coligada, índices recomendados)"
  ]
}`;

    // 3. Providers LLM com failover (selecionado -> outro -> fallback local)
    try {
      const { result, provider } = await chatCompleteWithFailover(chain, { systemPrompt, userPrompt });
      console.log(`\x1b[32m[RAG ENGINE] Provider utilizado com sucesso: ${provider}\x1b[0m`);
      const normalized = validateAndNormalizeTSql(result.sqlCode || "");
      return NextResponse.json({
        content: result.sqlExplanation || "Consulta gerada com sucesso.",
        sqlCode: normalized.sql,
        sqlExplanation: result.sqlExplanation || "",
        tablesUsed: result.tablesUsed?.length > 0 ? result.tablesUsed : tablesUsed,
        tips: [...normalized.warnings, ...(result.tips || [])],
      });
    } catch (llmErr: unknown) {
      const errMsg = llmErr instanceof Error ? llmErr.message : "Erro desconhecido";
      console.warn("Falha nos providers LLM, acionando gerador especializado RM:", errMsg);
      // Prossegue para o fallback inteligente abaixo
    }

    // 4. Modo Fallback Inteligente Especializado (Gera SQL real com base no dicionário RM mesmo sem chave configurada)
    const fallbackResponse = generateSpecializedRMSql(userPrompt, identifiedTables);
    const normalizedFallback = validateAndNormalizeTSql(fallbackResponse.sqlCode);

    return NextResponse.json({
      content: fallbackResponse.sqlExplanation,
      sqlCode: normalizedFallback.sql,
      sqlExplanation: fallbackResponse.sqlExplanation,
      tablesUsed: fallbackResponse.tablesUsed.length > 0 ? fallbackResponse.tablesUsed : tablesUsed,
      tips: [...normalizedFallback.warnings, ...fallbackResponse.tips],
      isFallback: true,
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
