/**
 * Catálogo de Autocomplete Fase 2 para o SQL Studio RM
 * Palavras-chave T-SQL, funções nativas com templates de offset, snippets corporativos RM
 * e dicionário de tabelas populares para sugestão instantânea.
 */

export interface GenericSuggestionItem {
  label: string;
  insertText: string;
  type: "keyword" | "function" | "snippet" | "table" | "column";
  description?: string;
  detail?: string;
  cursorOffset?: number; // Quantos caracteres antes do fim da string para posicionar o cursor
}

/**
 * Palavras-chave e Cláusulas T-SQL fundamentais
 */
export const SQL_KEYWORDS: GenericSuggestionItem[] = [
  { label: "SELECT", insertText: "SELECT ", type: "keyword", description: "Cláusula de projeção de colunas" },
  { label: "DISTINCT", insertText: "DISTINCT ", type: "keyword", description: "Elimina registros duplicados" },
  { label: "TOP 100", insertText: "TOP 100 ", type: "keyword", description: "Limita o número de linhas retornadas" },
  { label: "FROM", insertText: "FROM\n    ", type: "keyword", description: "Cláusula de origem das tabelas" },
  { label: "WHERE", insertText: "WHERE ", type: "keyword", description: "Cláusula de filtragem de linhas" },
  { label: "AND", insertText: "AND ", type: "keyword", description: "Operador lógico conjutivo" },
  { label: "OR", insertText: "OR ", type: "keyword", description: "Operador lógico disjuntivo" },
  { label: "NOT", insertText: "NOT ", type: "keyword", description: "Negação lógica" },
  { label: "IN", insertText: "IN ()", type: "keyword", description: "Pertinência em lista de valores", cursorOffset: 1 },
  { label: "NOT IN", insertText: "NOT IN ()", type: "keyword", description: "Não pertencente a lista", cursorOffset: 1 },
  { label: "BETWEEN", insertText: "BETWEEN  AND ", type: "keyword", description: "Intervalo inclusivo", cursorOffset: 5 },
  { label: "LIKE", insertText: "LIKE '%%'", type: "keyword", description: "Correspondência de padrão texto", cursorOffset: 2 },
  { label: "IS NULL", insertText: "IS NULL", type: "keyword", description: "Checagem de valor nulo" },
  { label: "IS NOT NULL", insertText: "IS NOT NULL", type: "keyword", description: "Checagem de valor não nulo" },
  { label: "LEFT JOIN", insertText: "LEFT JOIN ", type: "keyword", description: "Junção externa à esquerda" },
  { label: "INNER JOIN", insertText: "INNER JOIN ", type: "keyword", description: "Junção interna estrita" },
  { label: "RIGHT JOIN", insertText: "RIGHT JOIN ", type: "keyword", description: "Junção externa à direita" },
  { label: "FULL OUTER JOIN", insertText: "FULL OUTER JOIN ", type: "keyword", description: "Junção externa completa" },
  { label: "CROSS JOIN", insertText: "CROSS JOIN ", type: "keyword", description: "Produto cartesiano" },
  { label: "ON", insertText: "ON ", type: "keyword", description: "Condição de ligação entre tabelas" },
  { label: "AS", insertText: "AS ", type: "keyword", description: "Definição de apelido (alias)" },
  { label: "GROUP BY", insertText: "GROUP BY\n    ", type: "keyword", description: "Agrupamento de agregações" },
  { label: "HAVING", insertText: "HAVING ", type: "keyword", description: "Filtro sobre agregações do GROUP BY" },
  { label: "ORDER BY", insertText: "ORDER BY\n    ", type: "keyword", description: "Ordenação dos registros" },
  { label: "ASC", insertText: "ASC", type: "keyword", description: "Ordem ascendente / crescente" },
  { label: "DESC", insertText: "DESC", type: "keyword", description: "Ordem descendente / decrescente" },
  { label: "UNION ALL", insertText: "UNION ALL\n", type: "keyword", description: "União de queries sem deduplicar" },
  { label: "UNION", insertText: "UNION\n", type: "keyword", description: "União de queries deduplicada" },
  { label: "WITH (NOLOCK)", insertText: "WITH (NOLOCK)", type: "keyword", description: "Leitura suja não bloqueante (padrão RM)" },
  { label: "EXISTS", insertText: "EXISTS ()", type: "keyword", description: "Verificação de existência em subquery", cursorOffset: 1 },
  { label: "NOT EXISTS", insertText: "NOT EXISTS ()", type: "keyword", description: "Verificação de não existência em subquery", cursorOffset: 1 },
];

/**
 * Funções T-SQL essenciais utilizadas no ecossistema TOTVS RM
 */
export const SQL_FUNCTIONS: GenericSuggestionItem[] = [
  {
    label: "ISNULL(campo, valor)",
    insertText: "ISNULL(, )",
    type: "function",
    description: "Substitui NULL por um valor alternativo",
    detail: "T-SQL / SQL Server",
    cursorOffset: 3,
  },
  {
    label: "COALESCE(v1, v2, ...)",
    insertText: "COALESCE(, )",
    type: "function",
    description: "Retorna o primeiro valor não nulo da lista",
    detail: "ANSI SQL / T-SQL",
    cursorOffset: 3,
  },
  {
    label: "CONVERT Data BR (103)",
    insertText: "CONVERT(VARCHAR(10), , 103)",
    type: "function",
    description: "Converte data para formato brasileiro (DD/MM/AAAA)",
    detail: "Estilo 103 Britânico/Brasileiro",
    cursorOffset: 6,
  },
  {
    label: "CONVERT(tipo, expressao)",
    insertText: "CONVERT(, )",
    type: "function",
    description: "Conversão explícita de tipos com ou sem estilo",
    detail: "T-SQL",
    cursorOffset: 3,
  },
  {
    label: "CAST(expressao AS tipo)",
    insertText: "CAST( AS VARCHAR(50))",
    type: "function",
    description: "Conversão padrão de tipo de dados",
    detail: "ANSI SQL",
    cursorOffset: 16,
  },
  {
    label: "GETDATE()",
    insertText: "GETDATE()",
    type: "function",
    description: "Data e hora atual do servidor SQL Server",
    detail: "DATETIME",
  },
  {
    label: "DATEDIFF(day, ini, fim)",
    insertText: "DATEDIFF(day, , )",
    type: "function",
    description: "Diferença em dias/meses/anos entre duas datas",
    detail: "T-SQL",
    cursorOffset: 3,
  },
  {
    label: "DATEADD(day, qtd, data)",
    insertText: "DATEADD(day, 1, )",
    type: "function",
    description: "Adiciona intervalo a uma data",
    detail: "T-SQL",
    cursorOffset: 1,
  },
  {
    label: "YEAR(data)",
    insertText: "YEAR()",
    type: "function",
    description: "Extrai o ano (numérico de 4 dígitos)",
    detail: "INT",
    cursorOffset: 1,
  },
  {
    label: "MONTH(data)",
    insertText: "MONTH()",
    type: "function",
    description: "Extrai o mês (1 a 12)",
    detail: "INT",
    cursorOffset: 1,
  },
  {
    label: "DAY(data)",
    insertText: "DAY()",
    type: "function",
    description: "Extrai o dia do mês (1 a 31)",
    detail: "INT",
    cursorOffset: 1,
  },
  {
    label: "COUNT(*)",
    insertText: "COUNT(*)",
    type: "function",
    description: "Contagem de todas as linhas resultantes",
    detail: "Agregação",
  },
  {
    label: "COUNT(campo)",
    insertText: "COUNT()",
    type: "function",
    description: "Contagem de valores não nulos do campo",
    detail: "Agregação",
    cursorOffset: 1,
  },
  {
    label: "SUM(campo)",
    insertText: "SUM()",
    type: "function",
    description: "Soma dos valores numéricos",
    detail: "Agregação",
    cursorOffset: 1,
  },
  {
    label: "AVG(campo)",
    insertText: "AVG()",
    type: "function",
    description: "Média aritmética dos valores",
    detail: "Agregação",
    cursorOffset: 1,
  },
  {
    label: "MIN(campo)",
    insertText: "MIN()",
    type: "function",
    description: "Menor valor da coluna",
    detail: "Agregação",
    cursorOffset: 1,
  },
  {
    label: "MAX(campo)",
    insertText: "MAX()",
    type: "function",
    description: "Maior valor da coluna",
    detail: "Agregação",
    cursorOffset: 1,
  },
  {
    label: "SUBSTRING(campo, ini, tam)",
    insertText: "SUBSTRING(, 1, 10)",
    type: "function",
    description: "Recorta trecho de string",
    detail: "Texto",
    cursorOffset: 8,
  },
  {
    label: "LEN(campo)",
    insertText: "LEN()",
    type: "function",
    description: "Retorna a quantidade de caracteres",
    detail: "Texto",
    cursorOffset: 1,
  },
  {
    label: "LTRIM(RTRIM(campo))",
    insertText: "LTRIM(RTRIM())",
    type: "function",
    description: "Remove espaços em branco à esquerda e à direita",
    detail: "Texto",
    cursorOffset: 2,
  },
  {
    label: "UPPER(campo)",
    insertText: "UPPER()",
    type: "function",
    description: "Converte texto para letras maiúsculas",
    detail: "Texto",
    cursorOffset: 1,
  },
  {
    label: "LOWER(campo)",
    insertText: "LOWER()",
    type: "function",
    description: "Converte texto para letras minúsculas",
    detail: "Texto",
    cursorOffset: 1,
  },
  {
    label: "ROUND(campo, decimais)",
    insertText: "ROUND(, 2)",
    type: "function",
    description: "Arredonda valor para número de casas decimais",
    detail: "Numérico",
    cursorOffset: 4,
  },
];

/**
 * Snippets Inteligentes corporativos do TOTVS RM
 */
export const SQL_SNIPPETS: GenericSuggestionItem[] = [
  {
    label: "WHERE CODCOLIGADA = 1",
    insertText: "WHERE CODCOLIGADA = 1",
    type: "snippet",
    description: "Filtro clássico obrigatório por coligada ativa no TOTVS RM",
    detail: "Snippet Corporativo RM",
  },
  {
    label: "AND CODCOLIGADA = 1",
    insertText: "AND CODCOLIGADA = 1",
    type: "snippet",
    description: "Condição adicional de filtro por coligada",
    detail: "Snippet Corporativo RM",
  },
  {
    label: "CASE WHEN ... THEN ... ELSE",
    insertText: "CASE\n        WHEN  THEN \n        ELSE \n      END",
    type: "snippet",
    description: "Estrutura condicional T-SQL formatada em bloco",
    detail: "Snippet Condicional",
    cursorOffset: 26,
  },
  {
    label: "GROUP BY com HAVING COUNT > 1",
    insertText: "GROUP BY\n       \nHAVING COUNT(*) > 1",
    type: "snippet",
    description: "Identificação rápida de registros duplicados",
    detail: "Snippet Auditoria RM",
    cursorOffset: 23,
  },
  {
    label: "ORDER BY ... ASC",
    insertText: "ORDER BY\n       ASC",
    type: "snippet",
    description: "Ordenação ascendente padrão RM",
    detail: "Snippet Ordenação",
    cursorOffset: 4,
  },
  {
    label: "ORDER BY ... DESC",
    insertText: "ORDER BY\n       DESC",
    type: "snippet",
    description: "Ordenação descendente padrão RM",
    detail: "Snippet Ordenação",
    cursorOffset: 5,
  },
];

/**
 * Catálogo das tabelas centrais mais utilizadas no TOTVS RM
 */
export interface PopularRmTableItem {
  tabela: string;
  descricao: string;
  modulo: string;
}

export const POPULAR_RM_TABLES: PopularRmTableItem[] = [
  // RM Fluxus (Finanças)
  { tabela: "FLAN", descricao: "Lançamentos Financeiros (Pagar/Receber)", modulo: "RM Fluxus (Finanças)" },
  { tabela: "FCFO", descricao: "Clientes e Fornecedores", modulo: "RM Fluxus (Finanças)" },
  { tabela: "FXCX", descricao: "Movimentações de Caixa / Extrato Bancário", modulo: "RM Fluxus (Finanças)" },
  { tabela: "FCONTA", descricao: "Contas Bancárias e Caixas", modulo: "RM Fluxus (Finanças)" },
  { tabela: "FTDO", descricao: "Tipos de Documento Financeiro", modulo: "RM Fluxus (Finanças)" },
  { tabela: "FCXA", descricao: "Caixas Financeiros", modulo: "RM Fluxus (Finanças)" },
  { tabela: "FCHEQUE", descricao: "Controle de Cheques Emitidos/Recebidos", modulo: "RM Fluxus (Finanças)" },
  { tabela: "FLANCOMPL", descricao: "Campos Complementares do Lançamento Financeiro", modulo: "RM Fluxus (Finanças)" },
  { tabela: "FCFOCOMPL", descricao: "Campos Complementares de Clientes/Fornecedores", modulo: "RM Fluxus (Finanças)" },

  // RM Nucleus (Estoque / Faturamento / Compras)
  { tabela: "TMOV", descricao: "Movimentos de Estoque, Compras e Vendas", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },
  { tabela: "TITMMOV", descricao: "Itens dos Movimentos de Estoque/Venda", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },
  { tabela: "TPRD", descricao: "Cadastro Geral de Produtos e Serviços", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },
  { tabela: "TPRODUTO", descricao: "Definições e Parâmetros de Produtos", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },
  { tabela: "TPRDLOC", descricao: "Saldo e Localização dos Produtos no Estoque", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },
  { tabela: "TTB1", descricao: "Tabela de Classificação 1 do Movimento", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },
  { tabela: "TTB2", descricao: "Tabela de Classificação 2 do Movimento", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },
  { tabela: "TCLF", descricao: "Classificação Fiscal / NCM dos Produtos", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },
  { tabela: "TMOVCOMPL", descricao: "Campos Complementares do Movimento", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },
  { tabela: "TITMMOVCOMPL", descricao: "Campos Complementares do Item de Movimento", modulo: "RM Nucleus (Compras/Estoque/Faturamento)" },

  // RM Saldus (Contabilidade)
  { tabela: "CCONTA", descricao: "Plano de Contas Contábeis", modulo: "RM Saldus (Contabilidade)" },
  { tabela: "GCCUSTO", descricao: "Cadastro de Centros de Custo", modulo: "RM Saldus (Contabilidade)" },
  { tabela: "CPARTIDA", descricao: "Partidas e Lançamentos Contábeis", modulo: "RM Saldus (Contabilidade)" },
  { tabela: "CLOTE", descricao: "Lotes de Lançamento Contábil", modulo: "RM Saldus (Contabilidade)" },
  { tabela: "CHISTP", descricao: "Históricos Padrão da Contabilidade", modulo: "RM Saldus (Contabilidade)" },
  { tabela: "CRATEIO", descricao: "Rateio Contábil e Gerencial", modulo: "RM Saldus (Contabilidade)" },

  // RM Labore (Folha de Pagamento / RH)
  { tabela: "PFUNC", descricao: "Cadastro de Funcionários / Chapa", modulo: "RM Labore (Folha/RH)" },
  { tabela: "PPESSOA", descricao: "Dados Pessoais (CPF, RG, Nascimento)", modulo: "RM Labore (Folha/RH)" },
  { tabela: "PSECAO", descricao: "Departamentos e Seções da Empresa", modulo: "RM Labore (Folha/RH)" },
  { tabela: "PFPERFF", descricao: "Períodos da Ficha Financeira", modulo: "RM Labore (Folha/RH)" },
  { tabela: "PEVENTO", descricao: "Cadastro de Eventos e Rubricas da Folha", modulo: "RM Labore (Folha/RH)" },
  { tabela: "PFFINANC", descricao: "Valores Calculados dos Eventos por Período", modulo: "RM Labore (Folha/RH)" },
  { tabela: "PFHSTSAL", descricao: "Histórico Salarial do Funcionário", modulo: "RM Labore (Folha/RH)" },

  // RM Classis (Educacional)
  { tabela: "SALUNO", descricao: "Cadastro Geral de Alunos", modulo: "RM Classis (Educacional)" },
  { tabela: "SMATRICULA", descricao: "Matrículas dos Alunos no Período Letivo", modulo: "RM Classis (Educacional)" },
  { tabela: "SPLETIVO", descricao: "Períodos Letivos / Semestres", modulo: "RM Classis (Educacional)" },
  { tabela: "STURMA", descricao: "Turmas e Séries do Curso", modulo: "RM Classis (Educacional)" },
  { tabela: "SDISCIPLINA", descricao: "Disciplinas da Matriz Curricular", modulo: "RM Classis (Educacional)" },
  { tabela: "SHABILITACAOFILIAL", descricao: "Habilitações e Cursos por Filial", modulo: "RM Classis (Educacional)" },

  // Global / Cadastros Gerais
  { tabela: "GCOLIGADA", descricao: "Cadastro de Coligadas / Empresas do Grupo", modulo: "Global / Cadastros Gerais" },
  { tabela: "GFILIAL", descricao: "Filiais das Coligadas", modulo: "Global / Cadastros Gerais" },
  { tabela: "GUSUARIO", descricao: "Usuários e Contas de Acesso ao RM", modulo: "Global / Cadastros Gerais" },
  { tabela: "GSISTEMA", descricao: "Sistemas e Parâmetros Globais do RM", modulo: "Global / Cadastros Gerais" },
  { tabela: "GAUTOINC", descricao: "Sequenciais e Geradores de Auto-Incremento", modulo: "Global / Cadastros Gerais" },
  { tabela: "GCIDADE", descricao: "Cadastro de Cidades e Códigos IBGE", modulo: "Global / Cadastros Gerais" },
  { tabela: "GMENU", descricao: "Itens de Menu e Permissões de Telas", modulo: "Global / Cadastros Gerais" },
];
