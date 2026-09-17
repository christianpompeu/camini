import { NextRequest, NextResponse } from "next/server";
import { identifyRelevantTables, buildSchemaContextPrompt } from "@/lib/totvs-rm/schema-engine";

interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  systemModule?: string;
  dialect?: "sqlserver" | "oracle";
  userApiKey?: string;
  userModel?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, systemModule, dialect = "sqlserver", userApiKey, userModel } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Nenhuma mensagem enviada." }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content;

    // 1. Identificar tabelas e relacionamentos relevantes no dicionário do RM
    const identifiedTables = identifyRelevantTables(userPrompt, systemModule);
    const schemaContext = buildSchemaContextPrompt(identifiedTables);
    const tablesUsed = identifiedTables.map((t) => t.Tabela);

    // 2. Chave de API Gemini (da requisição ou de process.env)
    const apiKey = userApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    const selectedModel = userModel || "gemini-2.5-flash";

    // 3. Montagem do prompt do sistema especializado em TOTVS RM
    const systemPrompt = `Você é o maior especialista sênior em banco de dados e desenvolvimento de consultas SQL para o ERP TOTVS Corpore RM.
Sua missão é gerar scripts SQL de alta performance, precisos e elegantes, rigorosamente alinhados com a arquitetura e dicionário de dados do RM.

DIALETO REQUISITADO: ${dialect === "oracle" ? "Oracle PL/SQL" : "Microsoft SQL Server T-SQL (padrão do RM)"}

DIRETRIZES FUNDAMENTAIS DO TOTVS CORPORE RM:
1. Multi-Coligada: O RM é um sistema multi-empresa. QUASE TODAS as tabelas possuem a coluna CODCOLIGADA. Sempre filtre por CODCOLIGADA ou declare um parâmetro (ex: @CODCOLIGADA = 1).
2. Clientes e Fornecedores: A tabela FCFO relaciona-se com FLAN via (FLAN.CODCOLCFO = FCFO.CODCOLIGADA AND FLAN.CODCFO = FCFO.CODCFO) ou (FLAN.CODCOLIGADA = FCFO.CODCOLIGADA AND FLAN.CODCFO = FCFO.CODCFO).
3. Movimentos (RM Nucleus): A tabela TMOV (cabeçalho) liga-se a TITMMOV (itens) por (TMOV.CODCOLIGADA = TITMMOV.CODCOLIGADA AND TMOV.IDMOV = TITMMOV.IDMOV). TITMMOV liga-se a TPRD (produtos) por (TITMMOV.CODCOLIGADA = TPRD.CODCOLIGADA AND TITMMOV.IDPRD = TPRD.IDPRD).
4. Lançamentos Financeiros (RM Fluxus):
   - PAGREC: 1 = A Receber, 2 = A Pagar
   - STATUSLAN: 0 = Em Aberto, 1 = Baixado, 2 = Cancelado
5. Funcionários (RM Labore):
   - Chave primária: CODCOLIGADA, CHAPA.
   - Situação: PFHSTSIT ou PFUNC.CODSITUACAO ('A' = Ativo, 'D' = Demitido, 'F' = Férias, etc).
   - Seção / Centro de Custo RH: PSECAO (PFUNC.CODCOLIGADA = PSECAO.CODCOLIGADA AND PFUNC.CODSECAO = PSECAO.CODIGO).
6. Performance: No SQL Server, use sempre a dica WITH (NOLOCK) para tabelas de grande volume (FLAN, TMOV, TITMMOV, PFUNC, CPARTIDA) para não bloquear transações concorrentes no ERP.
7. Formatação: O SQL deve ser limpo, indentado com aliases claros (ex: F para FLAN, C para FCFO, M para TMOV, I para TITMMOV).

CONTEXTO DO ESQUEMA EXTRAÍDO DO DICIONÁRIO RM:
${schemaContext}

FORMATO DA SUA RESPOSTA:
Você DEVE responder ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "sqlCode": "-- Script SQL completo aqui formatado",
  "sqlExplanation": "Explicação detalhada em Markdown explicando as tabelas utilizadas, as condições de junção (JOINs) e os filtros aplicados.",
  "tablesUsed": ["TABELA1", "TABELA2"],
  "tips": [
    "Dica prática de performance ou regra de negócio RM relacionada a esta consulta",
    "Outra dica útil (ex: parâmetros de coligada, índices recomendados)"
  ]
}`;

    // Se temos uma chave de API, chama o Gemini oficial
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${systemPrompt}\n\nSOLICITAÇÃO DO USUÁRIO:\n${userPrompt}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          console.error("Erro na API do Gemini:", errData);
          throw new Error(errData?.error?.message || "Falha na comunicação com a API do Gemini.");
        }

        const data = await response.json();
        const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          return NextResponse.json({
            content: parsed.sqlExplanation || "Consulta gerada com sucesso.",
            sqlCode: parsed.sqlCode || "",
            sqlExplanation: parsed.sqlExplanation || "",
            tablesUsed: parsed.tablesUsed?.length > 0 ? parsed.tablesUsed : tablesUsed,
            tips: parsed.tips || [],
          });
        }
      } catch (geminiErr: unknown) {
        const errMsg = geminiErr instanceof Error ? geminiErr.message : "Erro desconhecido";
        console.warn("Falha ao chamar Gemini, acionando gerador especializado RM:", errMsg);
        // Prossegue para o fallback inteligente abaixo
      }
    }

    // 4. Modo Fallback Inteligente Especializado (Gera SQL real com base no dicionário RM mesmo sem chave configurada)
    const fallbackResponse = generateSpecializedRMSql(userPrompt, identifiedTables, dialect);

    return NextResponse.json({
      content: fallbackResponse.sqlExplanation,
      sqlCode: fallbackResponse.sqlCode,
      sqlExplanation: fallbackResponse.sqlExplanation,
      tablesUsed: fallbackResponse.tablesUsed.length > 0 ? fallbackResponse.tablesUsed : tablesUsed,
      tips: fallbackResponse.tips,
      isFallback: !apiKey,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno ao processar consulta.";
    console.error("Erro no chat RM SQL:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Gerador determinístico de consultas TOTVS RM de alta fidelidade
 * Usado como demonstração/fallback imediato caso nenhuma chave Gemini tenha sido configurada ainda.
 */
function generateSpecializedRMSql(
  prompt: string,
  tables: Array<{ Tabela: string; Descricao?: string }>,
  dialect: "sqlserver" | "oracle"
) {
  const p = prompt.toLowerCase();
  const nolock = dialect === "sqlserver" ? " WITH (NOLOCK)" : "";

  // Cenário 1: Financeiro / Lançamentos (FLAN, FCFO)
  if (p.includes("financeiro") || p.includes("pagar") || p.includes("receber") || p.includes("titulo") || p.includes("flan")) {
    const isPagar = p.includes("pagar");
    const pagrecVal = isPagar ? "2" : "1";
    const pagrecDesc = isPagar ? "Contas a Pagar (PAGREC = 2)" : "Contas a Receber (PAGREC = 1)";

    const sql = `-- =====================================================================
-- TOTVS CORPORE RM - GESTÃO FINANCEIRA (RM FLUXUS)
-- Consulta: Lançamentos Financeiros com Dados do Cliente/Fornecedor
-- Dialeto: ${dialect === "oracle" ? "Oracle PL/SQL" : "Microsoft SQL Server T-SQL"}
-- =====================================================================

DECLARE @CODCOLIGADA INT = 1;
DECLARE @DATA_INICIAL DATETIME = DATEADD(MONTH, -1, GETDATE());
DECLARE @DATA_FINAL DATETIME = GETDATE();

SELECT 
    L.CODCOLIGADA,
    L.IDLAN,
    L.NUMERODOCUMENTO AS [Num_Documento],
    L.DATAVENCIMENTO AS [Vencimento],
    L.DATABAIXA AS [Data_Baixa],
    L.VALORORIGINAL AS [Valor_Original],
    ISNULL(L.VALORBAIXADO, 0) AS [Valor_Baixado],
    (L.VALORORIGINAL - ISNULL(L.VALORBAIXADO, 0)) AS [Saldo_Aberto],
    CASE L.STATUSLAN
        WHEN 0 THEN 'Em Aberto'
        WHEN 1 THEN 'Baixado'
        WHEN 2 THEN 'Cancelado'
        ELSE 'Outro'
    END AS [Status_Lancamento],
    L.CODCFO AS [Codigo_CFO],
    C.NOMEFANTASIA AS [Nome_Fantasia],
    C.CGCCFO AS [CNPJ_CPF],
    L.HISTORICO AS [Historico]
FROM FLAN L${nolock}
INNER JOIN FCFO C${nolock}
    ON C.CODCOLIGADA = L.CODCOLCFO
    AND C.CODCFO = L.CODCFO
WHERE L.CODCOLIGADA = @CODCOLIGADA
  AND L.PAGREC = ${pagrecVal} -- ${pagrecDesc}
  AND L.STATUSLAN = 0        -- Apenas lançamentos em aberto
  AND L.DATAVENCIMENTO BETWEEN @DATA_INICIAL AND @DATA_FINAL
ORDER BY L.DATAVENCIMENTO ASC;`;

    return {
      sqlCode: sql,
      sqlExplanation: `### Estrutura da Consulta Financeira (RM Fluxus)\n\nEsta consulta extrai os títulos da tabela de lançamentos financeiros (\`FLAN\`) relacionando-os diretamente com o cadastro de clientes e fornecedores (\`FCFO\`).\n\n- **Junção Canônica**: \`FLAN.CODCOLCFO = FCFO.CODCOLIGADA AND FLAN.CODCFO = FCFO.CODCFO\`.\n- **Regra de Negócio RM**: No RM Fluxus, o campo \`PAGREC = ${pagrecVal}\` define ${pagrecDesc}. O campo \`STATUSLAN = 0\` restringe a títulos pendentes de liquidação.`,
      tablesUsed: ["FLAN", "FCFO"],
      tips: [
        "Atenção ao campo CODCOLCFO: em muitas implantações onde os clientes/fornecedores são globais, a coligada do cliente pode ser 0.",
        "A dica WITH (NOLOCK) evita concorrência e bloqueios com processos de baixa e faturamento.",
      ],
    };
  }

  // Cenário 2: Faturamento / Compras / Movimentos (TMOV, TITMMOV, TPRD)
  if (p.includes("movimento") || p.includes("nota fiscal") || p.includes("nf") || p.includes("compra") || p.includes("venda") || p.includes("tmov") || p.includes("estoque")) {
    const sql = `-- =====================================================================
-- TOTVS CORPORE RM - GESTÃO DE ESTOQUE E COMPRAS (RM NUCLEUS)
-- Consulta: Movimentos (Cabeçalho, Itens e Produtos)
-- Dialeto: ${dialect === "oracle" ? "Oracle PL/SQL" : "Microsoft SQL Server T-SQL"}
-- =====================================================================

DECLARE @CODCOLIGADA INT = 1;
DECLARE @CODFILIAL INT = 1;
DECLARE @DATA_INICIAL DATETIME = DATEADD(DAY, -30, GETDATE());

SELECT 
    M.CODCOLIGADA,
    M.CODFILIAL,
    M.IDMOV,
    M.CODTMV AS [Tipo_Movimento],
    M.NUMEROMOV AS [Numero_Movimento],
    M.DATAEMISSAO AS [Data_Emissao],
    M.VALORLIQUIDO AS [Valor_Liquido_Total],
    CASE M.STATUS
        WHEN 'A' THEN 'Aberto / A Faturar'
        WHEN 'F' THEN 'Faturado'
        WHEN 'C' THEN 'Cancelado'
        ELSE M.STATUS
    END AS [Status_Movimento],
    C.NOMEFANTASIA AS [Parceiro],
    C.CGCCFO AS [CNPJ_CPF],
    I.NSEQITMMOV AS [Seq_Item],
    P.CODIGOPRD AS [Codigo_Produto],
    P.DESCRICAO AS [Descricao_Produto],
    I.QUANTIDADE AS [Quantidade],
    I.PRECOUNITARIO AS [Preco_Unitario],
    I.VALORBRUTOITEM AS [Valor_Bruto_Item],
    I.VALORLIQUIDO AS [Valor_Liquido_Item]
FROM TMOV M${nolock}
INNER JOIN TITMMOV I${nolock}
    ON I.CODCOLIGADA = M.CODCOLIGADA
    AND I.IDMOV = M.IDMOV
INNER JOIN TPRD P${nolock}
    ON P.CODCOLIGADA = I.CODCOLIGADA
    AND P.IDPRD = I.IDPRD
LEFT JOIN FCFO C${nolock}
    ON C.CODCOLIGADA = M.CODCOLCFO
    AND C.CODCFO = M.CODCFO
WHERE M.CODCOLIGADA = @CODCOLIGADA
  AND M.CODFILIAL = @CODFILIAL
  AND M.DATAEMISSAO >= @DATA_INICIAL
  AND M.STATUS <> 'C' -- Exclui movimentos cancelados
ORDER BY M.DATAEMISSAO DESC, M.IDMOV, I.NSEQITMMOV;`;

    return {
      sqlCode: sql,
      sqlExplanation: `### Estrutura de Movimentação (RM Nucleus)\n\nEsta consulta percorre a hierarquia clássica de faturamento e suprimentos do RM:\n\n1. **\`TMOV\`**: Cabeçalho dos movimentos (pedidos, notas de entrada, faturamento).\n2. **\`TITMMOV\`**: Itens e quantidades do movimento.\n3. **\`TPRD\`**: Cadastro de produtos e especificações.\n4. **\`FCFO\`**: Fornecedor ou cliente associado ao movimento via \`CODCOLCFO\` e \`CODCFO\`.`,
      tablesUsed: ["TMOV", "TITMMOV", "TPRD", "FCFO"],
      tips: [
        "Para filtrar movimentos específicos, utilize a coluna CODTMV (ex: CODTMV LIKE '1.1.%' para compras ou '2.1.%' para vendas).",
        "O vínculo entre TMOV e TITMMOV é sempre por CODCOLIGADA e IDMOV.",
      ],
    };
  }

  // Cenário 3: RH / Folha de Pagamento (PFUNC, PSECAO, PFUNCAO)
  if (p.includes("funcionario") || p.includes("funcionário") || p.includes("salario") || p.includes("salário") || p.includes("folha") || p.includes("pfunc") || p.includes("chapa")) {
    const sql = `-- =====================================================================
-- TOTVS CORPORE RM - RECURSOS HUMANOS E FOLHA (RM LABORE)
-- Consulta: Colaboradores Ativos com Cargo, Seção e Salário
-- Dialeto: ${dialect === "oracle" ? "Oracle PL/SQL" : "Microsoft SQL Server T-SQL"}
-- =====================================================================

DECLARE @CODCOLIGADA INT = 1;

SELECT 
    F.CODCOLIGADA,
    F.CHAPA AS [Chapa],
    F.NOME AS [Nome_Funcionario],
    F.CPF AS [CPF],
    F.DATAADMISSAO AS [Data_Admissao],
    F.SALARIO AS [Salario_Atual],
    S.CODIGO AS [Codigo_Secao],
    S.DESCRICAO AS [Nome_Secao],
    C.CODIGO AS [Codigo_Funcao],
    C.NOME AS [Cargo_Funcao],
    CASE F.CODSITUACAO
        WHEN 'A' THEN 'Ativo'
        WHEN 'F' THEN 'Férias'
        WHEN 'D' THEN 'Demitido'
        WHEN 'E' THEN 'Licença Maternidade'
        WHEN 'I' THEN 'Afastado por Doença'
        ELSE F.CODSITUACAO
    END AS [Situacao]
FROM PFUNC F${nolock}
INNER JOIN PSECAO S${nolock}
    ON S.CODCOLIGADA = F.CODCOLIGADA
    AND S.CODIGO = F.CODSECAO
LEFT JOIN PFUNCAO C${nolock}
    ON C.CODCOLIGADA = F.CODCOLIGADA
    AND C.CODIGO = F.CODFUNCAO
WHERE F.CODCOLIGADA = @CODCOLIGADA
  AND F.CODSITUACAO = 'A' -- Apenas colaboradores ativos
ORDER BY S.DESCRICAO, F.NOME;`;

    return {
      sqlCode: sql,
      sqlExplanation: `### Estrutura de Funcionários (RM Labore)\n\nConsulta focada no cadastro central de funcionários (\`PFUNC\`) com suas relações estruturais:\n\n- **Seção / Centro de Custo RH**: Junção com \`PSECAO\` via \`CODSECAO = CODIGO\`.\n- **Cargo / Função**: Junção com \`PFUNCAO\` via \`CODFUNCAO = CODIGO\`.\n- **Filtro de Ativos**: \`CODSITUACAO = 'A'\`.`,
      tablesUsed: ["PFUNC", "PSECAO", "PFUNCAO"],
      tips: [
        "Para obter históricos salariais detalhados por período, utilize a tabela PFHSTSAL vinculada por CODCOLIGADA e CHAPA.",
        "A tabela PFFINANC armazena os valores das folhas calculadas por período (ano/mês) e código de evento (PEVENTO).",
      ],
    };
  }

  // Cenário Genérico Baseado nas Tabelas Identificadas
  const targetTables = tables.length > 0 ? tables : [{ Tabela: "FLAN", Descricao: "Lançamentos Financeiros" }];
  const mainTable = targetTables[0].Tabela;

  const genericSql = `-- =====================================================================
-- TOTVS CORPORE RM - CONSULTA ESPECIALIZADA
-- Tabelas identificadas: ${targetTables.map((t) => t.Tabela).join(", ")}
-- Dialeto: ${dialect === "oracle" ? "Oracle PL/SQL" : "Microsoft SQL Server T-SQL"}
-- =====================================================================

DECLARE @CODCOLIGADA INT = 1;

SELECT TOP 100
    T.*
FROM ${mainTable} T${nolock}
WHERE T.CODCOLIGADA = @CODCOLIGADA
ORDER BY 1 DESC;`;

  return {
    sqlCode: genericSql,
    sqlExplanation: `### Consulta Base para ${mainTable} no TOTVS RM\n\nIdentificamos a tabela **\`${mainTable}\`** (${targetTables[0].Descricao || "Tabela do RM"}) como o ponto focal para o seu pedido.\n\nPara personalizar com filtros avançados, campos específicos e junções relacionais, você pode detalhar sua solicitação ou configurar sua chave de API Gemini no ícone de configurações acima.`,
    tablesUsed: targetTables.map((t) => t.Tabela),
    tips: [
      "Sempre restrinja o filtro por CODCOLIGADA para aproveitar os índices nativos do TOTVS RM.",
      "Para obter os nomes dos campos exatos, você pode utilizar o botão 'Explorar Dicionário' na barra de ferramentas.",
    ],
  };
}
