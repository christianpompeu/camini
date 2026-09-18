/**
 * Gerador determinístico de consultas TOTVS RM de alta fidelidade.
 * Fallback imediato do chat quando nenhum provider LLM está disponível.
 *
 * Módulo puro (sem dependências do Next): o Route Handler importa daqui e
 * os cenários podem ser testados diretamente via tsc + node.
 *
 * Ordem dos cenários importa: o de movimentos vem antes do financeiro,
 * porque um pedido de vendas com lançamentos ("...movimentos... com
 * ...lançamentos financeiros...") contém a palavra "financeiro" e cairia
 * no cenário errado se o financeiro fosse checado primeiro.
 */

export interface FallbackTableRef {
  Tabela: string;
  Descricao?: string;
}

export interface FallbackResult {
  sqlCode: string;
  sqlExplanation: string;
  tablesUsed: string[];
  tips: string[];
}

/** "coligada 9" -> 9 */
export function extractColigada(prompt: string): number | null {
  const m = prompt.toLowerCase().match(/coligada\s+(\d{1,4})/);
  return m ? parseInt(m[1], 10) : null;
}

/** "filial 3" -> 3 */
export function extractFilial(prompt: string): number | null {
  const m = prompt.toLowerCase().match(/filial\s+(\d{1,4})/);
  return m ? parseInt(m[1], 10) : null;
}

/** "tipos de movimento 2.2.58" -> ["2.2.58"] */
export function extractCodtmvList(prompt: string): string[] {
  const out = new Set<string>();
  const re = /(\d+\.\d+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(prompt)) !== null) out.add(m[1]);
  return Array.from(out);
}

/** "últimos 30" / "ultimos 30 dias" -> 30 */
export function extractDays(prompt: string): number | null {
  const norm = prompt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const m = norm.match(/ultimos?\s+(\d{1,4})/);
  return m ? parseInt(m[1], 10) : null;
}

/** Pedido envolve pagamentos da venda (TPAGTO/TMOVPAGTO)? */
export function wantsPaymentLink(pLower: string): boolean {
  return (
    pLower.includes("tpagto") ||
    pLower.includes("tmovpagto") ||
    pLower.includes("forma de pagamento") ||
    pLower.includes("condicao de pagamento") ||
    pLower.includes("condição de pagamento")
  );
}

/**
 * Gerador determinístico de consultas TOTVS RM de alta fidelidade
 * Usado como demonstração/fallback imediato caso nenhum provider LLM esteja disponível.
 */
export function generateSpecializedRMSql(
  prompt: string,
  tables: FallbackTableRef[]
): FallbackResult {
  const p = prompt.toLowerCase();
  const nolock = " WITH (NOLOCK)";
  const coligada = extractColigada(prompt) ?? 1;
  const filial = extractFilial(prompt) ?? 1;
  const days = extractDays(prompt) ?? 30;
  const codtmvs = extractCodtmvList(prompt);
  const codtmvFilter =
    codtmvs.length > 0 ? `\n  AND M.CODTMV IN (${codtmvs.map((c) => `'${c}'`).join(", ")})` : "";

  // Cenário 1: Movimentos de venda com pagamentos e lançamentos (TMOV, TMOVPAGTO, TPAGTO, FLAN)
  if (
    p.includes("movimento") ||
    p.includes("nota fiscal") ||
    p.includes("nf") ||
    p.includes("compra") ||
    p.includes("venda") ||
    p.includes("tmov") ||
    p.includes("estoque")
  ) {
    if (wantsPaymentLink(p)) {
      const sql = `-- =====================================================================
-- TOTVS CORPORE RM - VENDAS COM PAGAMENTOS E LANCAMENTOS (RM NUCLEUS + FLUXUS)
-- Consulta: Movimentos com Formas de Pagamento (TPAGTO) e Lancamentos (FLAN)
-- Dialeto: Microsoft SQL Server T-SQL
-- =====================================================================

DECLARE @CODCOLIGADA INT = ${coligada};
DECLARE @CODFILIAL INT = ${filial};

SELECT
    M.CODCOLIGADA,
    M.CODFILIAL,
    M.IDMOV,
    M.NUMEROMOV AS [Numero_Movimento],
    M.DATAEMISSAO AS [Data_Emissao],
    M.CODTMV AS [Tipo_Movimento],
    MP.IDSEQPAGTO AS [Seq_Pagto],
    G.IDFORMAPAGTO AS [Forma_Pagto],
    G.VALOR AS [Valor_Pagto],
    L.IDLAN AS [Id_Lancamento],
    L.DATAVENCIMENTO AS [Vencimento],
    L.VALORORIGINAL AS [Valor_Original],
    L.STATUSLAN AS [Status_Lancamento]
FROM TMOV M${nolock}
INNER JOIN TMOVPAGTO MP${nolock}
    ON MP.CODCOLIGADA = M.CODCOLIGADA
    AND MP.IDMOV = M.IDMOV
INNER JOIN TPAGTO G${nolock}
    ON G.CODCOLIGADA = MP.CODCOLIGADA
    AND G.IDSEQPAGTO = MP.IDSEQPAGTO
INNER JOIN FLAN L${nolock}
    ON L.CODCOLIGADA = G.CODCOLIGADA
    AND L.IDLAN = G.IDLAN
WHERE M.CODCOLIGADA = @CODCOLIGADA
  AND M.CODFILIAL = @CODFILIAL${codtmvFilter}
  AND M.DATAEMISSAO >= DATEADD(DAY, -${days}, GETDATE())
ORDER BY M.DATAEMISSAO DESC, M.IDMOV, L.IDLAN;`;

      return {
        sqlCode: sql,
        sqlExplanation: `### Estrutura de Vendas com Pagamentos (RM Nucleus + Fluxus)\n\nEsta consulta percorre a cadeia de pagamentos da venda:\n\n1. **\`TMOV\`**: Cabeçalho dos movimentos (filtros de coligada, filial, tipo e período).\n2. **\`TMOVPAGTO\`**: Ligação movimento ↔ pagamento via \`CODCOLIGADA + IDMOV\`.\n3. **\`TPAGTO\`**: Formas de pagamento via \`CODCOLIGADA + IDSEQPAGTO\`.\n4. **\`FLAN\`**: Lançamentos financeiros via \`CODCOLIGADA + IDLAN\`.`,
        tablesUsed: ["TMOV", "TMOVPAGTO", "TPAGTO", "FLAN"],
        tips: [
          "Para filtrar tipos específicos, utilize a coluna CODTMV (ex: CODTMV IN ('2.2.58')).",
          "O vínculo entre TMOV e TMOVPAGTO é sempre por CODCOLIGADA e IDMOV; entre TMOVPAGTO e TPAGTO, por CODCOLIGADA e IDSEQPAGTO.",
        ],
      };
    }

    const sql = `-- =====================================================================
-- TOTVS CORPORE RM - GESTÃO DE ESTOQUE E COMPRAS (RM NUCLEUS)
-- Consulta: Movimentos (Cabeçalho, Itens e Produtos)
-- Dialeto: Microsoft SQL Server T-SQL
-- =====================================================================

DECLARE @CODCOLIGADA INT = ${coligada};
DECLARE @CODFILIAL INT = ${filial};
DECLARE @DATA_INICIAL DATETIME = DATEADD(DAY, -${days}, GETDATE());

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
  AND M.CODFILIAL = @CODFILIAL${codtmvFilter}
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

  // Cenário 2: Financeiro / Lançamentos (FLAN, FCFO)
  if (p.includes("financeiro") || p.includes("pagar") || p.includes("receber") || p.includes("titulo") || p.includes("flan")) {
    const isPagar = p.includes("pagar");
    const pagrecVal = isPagar ? "2" : "1";
    const pagrecDesc = isPagar ? "Contas a Pagar (PAGREC = 2)" : "Contas a Receber (PAGREC = 1)";

    const sql = `-- =====================================================================
-- TOTVS CORPORE RM - GESTÃO FINANCEIRA (RM FLUXUS)
-- Consulta: Lançamentos Financeiros com Dados do Cliente/Fornecedor
-- Dialeto: Microsoft SQL Server T-SQL
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

  // Cenário 3: RH / Folha de Pagamento (PFUNC, PSECAO, PFUNCAO, + PFHSTSAL se pedir histórico)
  if (p.includes("funcionario") || p.includes("funcionário") || p.includes("salario") || p.includes("salário") || p.includes("salarial") || p.includes("historico") || p.includes("histórico") || p.includes("folha") || p.includes("pfunc") || p.includes("chapa")) {
    const wantsHistory = p.includes("historico") || p.includes("histórico");
    const historyJoin = wantsHistory
      ? `\nLEFT JOIN PFHSTSAL H${nolock}\n    ON H.CODCOLIGADA = F.CODCOLIGADA\n    AND H.CHAPA = F.CHAPA`
      : "";
    const historyCols = wantsHistory
      ? `,\n    H.SALARIO AS [Salario_Historico],\n    H.DTMUDANCA AS [Data_Mudanca],\n    H.MOTIVO AS [Motivo_Alteracao]`
      : "";
    const sql = `-- =====================================================================
-- TOTVS CORPORE RM - RECURSOS HUMANOS E FOLHA (RM LABORE)
-- Consulta: Colaboradores Ativos com Cargo, Seção e Salário
-- Dialeto: Microsoft SQL Server T-SQL
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
    C.NOME AS [Cargo_Funcao]${historyCols},
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
    AND C.CODIGO = F.CODFUNCAO${historyJoin}
WHERE F.CODCOLIGADA = @CODCOLIGADA
  AND F.CODSITUACAO = 'A' -- Apenas colaboradores ativos
ORDER BY S.DESCRICAO, F.NOME;`;

    return {
      sqlCode: sql,
      sqlExplanation: `### Estrutura de Funcionários (RM Labore)\n\nConsulta focada no cadastro central de funcionários (\`PFUNC\`) com suas relações estruturais:\n\n- **Seção / Centro de Custo RH**: Junção com \`PSECAO\` via \`CODSECAO = CODIGO\`.\n- **Cargo / Função**: Junção com \`PFUNCAO\` via \`CODFUNCAO = CODIGO\`.${wantsHistory ? "\n- **Histórico salarial**: Junção com `PFHSTSAL` via `CODCOLIGADA + CHAPA` (`SALARIO`, `DTMUDANCA`, `MOTIVO`)." : ""}\n- **Filtro de Ativos**: \`CODSITUACAO = 'A'\`.`,
      tablesUsed: wantsHistory ? ["PFUNC", "PSECAO", "PFUNCAO", "PFHSTSAL"] : ["PFUNC", "PSECAO", "PFUNCAO"],
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
-- Dialeto: Microsoft SQL Server T-SQL
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
