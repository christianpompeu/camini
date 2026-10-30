export interface SqlStudioTemplate {
  id: string;
  title: string;
  category: "financeiro" | "faturamento" | "rh" | "contabil";
  moduleLabel: string;
  description: string;
  mainTables: string[];
  sql: string;
}

export const SQL_STUDIO_TEMPLATES: SqlStudioTemplate[] = [
  {
    id: "flan_fcfo_rateio",
    title: "Lançamentos Financeiros (Pagar/Receber)",
    category: "financeiro",
    moduleLabel: "RM Fluxus",
    description: "Extrato completo de títulos a pagar e receber com dados do cliente/fornecedor e filiais.",
    mainTables: ["FLAN", "FCFO", "GFILIAL"],
    sql: `/* =========================================================================
   CAMINI SQL STUDIO - TOTVS RM
   Consulta: Lançamentos Financeiros a Pagar/Receber com Cliente/Fornecedor
   Módulo: RM Fluxus (Finanças)
   ========================================================================= */
SELECT
        FLAN.CODCOLIGADA
      , FLAN.IDLAN
      , FLAN.NUMERODOCUMENTO
      , FLAN.PAGREC
      , FLAN.STATUSLAN
      , FLAN.DATAEMISSAO
      , FLAN.DATAVENCIMENTO
      , FLAN.VALORORIGINAL
      , FCFO.CODCFO
      , FCFO.NOMEFANTASIA
      , FCFO.CGCCFO
      , GFILIAL.NOMEFANTASIA                    AS NOME_FILIAL
  FROM CORPORE.DBO.FLAN AS FLAN WITH (NOLOCK)
 INNER JOIN CORPORE.DBO.FCFO AS FCFO WITH (NOLOCK)
         ON FLAN.CODCOLCFO                      = FCFO.CODCOLIGADA
        AND FLAN.CODCFO                         = FCFO.CODCFO
 INNER JOIN CORPORE.DBO.GFILIAL AS GFILIAL WITH (NOLOCK)
         ON FLAN.CODCOLIGADA                    = GFILIAL.CODCOLIGADA
        AND FLAN.CODFILIAL                      = GFILIAL.CODFILIAL
 WHERE FLAN.CODCOLIGADA = 1
   AND FLAN.STATUSLAN = 0
 ORDER BY
       FLAN.DATAVENCIMENTO ASC;`,
  },
  {
    id: "tmov_titmmov_compras_vendas",
    title: "Movimentos de Venda e Faturamento",
    category: "faturamento",
    moduleLabel: "RM Nucleus",
    description: "Cabeçalho de movimento comercial ligado aos itens de movimento e parceiro de negócios.",
    mainTables: ["TMOV", "TITMMOV", "FCFO"],
    sql: `/* =========================================================================
   CAMINI SQL STUDIO - TOTVS RM
   Consulta: Movimentação de Vendas/Faturamento com Itens e Clientes
   Módulo: RM Nucleus (Faturamento / Estoque)
   ========================================================================= */
SELECT
        TMOV.CODCOLIGADA
      , TMOV.IDMOV
      , TMOV.CODTMV
      , TMOV.NUMEROMOV
      , TMOV.DATAEMISSAO
      , TMOV.VALORBRUTO
      , TMOV.VALORLIQUIDO
      , FCFO.CODCFO
      , FCFO.NOMEFANTASIA                       AS NOME_CLIENTE
      , TITMMOV.NSEQITMMOV
      , TITMMOV.IDPRD
      , TITMMOV.QUANTIDADE
      , TITMMOV.PRECOUNITARIO
      , TITMMOV.VALORTOTAL                      AS TOTAL_ITEM
  FROM CORPORE.DBO.TMOV AS TMOV WITH (NOLOCK)
 INNER JOIN CORPORE.DBO.TITMMOV AS TITMMOV WITH (NOLOCK)
         ON TMOV.CODCOLIGADA                    = TITMMOV.CODCOLIGADA
        AND TMOV.IDMOV                          = TITMMOV.IDMOV
 INNER JOIN CORPORE.DBO.FCFO AS FCFO WITH (NOLOCK)
         ON TMOV.CODCOLCFO                      = FCFO.CODCOLIGADA
        AND TMOV.CODCFO                         = FCFO.CODCFO
 WHERE TMOV.CODCOLIGADA = 1
   AND TMOV.STATUS != 'C'
 ORDER BY
       TMOV.DATAEMISSAO DESC
     , TITMMOV.NSEQITMMOV ASC;`,
  },
  {
    id: "pfunc_psecao_colaboradores",
    title: "Quadro de Funcionários e Lotação",
    category: "rh",
    moduleLabel: "RM Labore",
    description: "Cadastro de funcionários ativos com dados cadastrais, cargo, seção e coligada.",
    mainTables: ["PFUNC", "PSECAO", "GCOLIGADA"],
    sql: `/* =========================================================================
   CAMINI SQL STUDIO - TOTVS RM
   Consulta: Quadro de Colaboradores com Lotação e Salário
   Módulo: RM Labore (Folha / RH)
   ========================================================================= */
SELECT
        PFUNC.CODCOLIGADA
      , PFUNC.CHAPA
      , PFUNC.NOME                              AS NOME_FUNCIONARIO
      , PFUNC.CODSITUACAO
      , PFUNC.DATAADMISSAO
      , PFUNC.SALARIO
      , PSECAO.CODSECAO
      , PSECAO.DESCRICAO                        AS NOME_SECAO
      , GCOLIGADA.NOME                          AS NOME_EMPRESA
  FROM CORPORE.DBO.PFUNC AS PFUNC WITH (NOLOCK)
 INNER JOIN CORPORE.DBO.PSECAO AS PSECAO WITH (NOLOCK)
         ON PFUNC.CODCOLIGADA                   = PSECAO.CODCOLIGADA
        AND PFUNC.CODSECAO                      = PSECAO.CODSECAO
 INNER JOIN CORPORE.DBO.GCOLIGADA AS GCOLIGADA WITH (NOLOCK)
         ON PFUNC.CODCOLIGADA                   = GCOLIGADA.CODCOLIGADA
 WHERE PFUNC.CODCOLIGADA = 1
   AND PFUNC.CODSITUACAO = 'A'
 ORDER BY
       PFUNC.NOME ASC;`,
  },
  {
    id: "cconta_cpartida_contabil",
    title: "Plano de Contas e Lançamentos Contábeis",
    category: "contabil",
    moduleLabel: "RM Saldus",
    description: "Plano de contas contábeis e amarração com rateios e centros de custo.",
    mainTables: ["CCONTA", "CPARAM", "GCCUSTO"],
    sql: `/* =========================================================================
   CAMINI SQL STUDIO - TOTVS RM
   Consulta: Plano de Contas Contábeis com Centros de Custo
   Módulo: RM Saldus (Contabilidade)
   ========================================================================= */
SELECT
        CCONTA.CODCOLIGADA
      , CCONTA.CODCONTA
      , CCONTA.DESCRICAO                        AS NOME_CONTA
      , CCONTA.NATUREZA
      , GCCUSTO.CODCCUSTO
      , GCCUSTO.NOME                            AS NOME_CENTRO_CUSTO
  FROM CORPORE.DBO.CCONTA AS CCONTA WITH (NOLOCK)
  LEFT JOIN CORPORE.DBO.GCCUSTO AS GCCUSTO WITH (NOLOCK)
         ON CCONTA.CODCOLIGADA                  = GCCUSTO.CODCOLIGADA
 WHERE CCONTA.CODCOLIGADA = 1
 ORDER BY
       CCONTA.CODCONTA ASC;`,
  },
];
