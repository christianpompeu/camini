import fs from "fs";
import path from "path";
import { RMTable, RMTableSummary } from "./types";
import { connectSeedTables, formatJoinCondition } from "./join-graph";

const DATA_DIR = path.join(process.cwd(), "public", "dicionario_rm", "data");

// Cache em memória do catálogo de tabelas (carregado uma única vez)
let cachedCatalog: RMTableSummary[] | null = null;
const masterCache = new Map<string, RMTable[]>();

// Mapeamento dos principais módulos RM pelo prefixo
export const RM_MODULES_MAP: Record<string, { nome: string; sigla: string; descricao: string }> = {
  F: { nome: "RM Fluxus", sigla: "FIN", descricao: "Gestão Financeira, Contas a Pagar/Receber, Bancos e Caixa" },
  T: { nome: "RM Nucleus", sigla: "FAT", descricao: "Faturamento, Compras, Estoque e Gestão de Materiais" },
  P: { nome: "RM Labore", sigla: "FOL", descricao: "Folha de Pagamento, Gestão de Pessoas e Férias" },
  C: { nome: "RM Saldus", sigla: "CTB", descricao: "Contabilidade Geral, Plano de Contas e Partidas" },
  D: { nome: "RM Liber", sigla: "FIS", descricao: "Gestão Fiscal, Apuração de Tributos e Escrituração" },
  G: { nome: "RM Global", sigla: "GLB", descricao: "Configurações Globais, Coligadas, Filiais e Acessos" },
  S: { nome: "RM Classis", sigla: "EDU", descricao: "Gestão Educacional, Alunos, Cursos e Matrículas" },
  M: { nome: "RM Solum", sigla: "OBR", descricao: "Gestão de Obras, Projetos e Contratos" },
  V: { nome: "RM Bonum", sigla: "ATV", descricao: "Ativo Imobilizado e Controle Patrimonial" },
  K: { nome: "RM Factor", sigla: "PRD", descricao: "Planejamento e Controle da Produção (PCP)" },
  H: { nome: "RM Chronus", sigla: "PTO", descricao: "Ponto Eletrônico e Frequência" },
  A: { nome: "RM Vitae", sigla: "REC", descricao: "Recrutamento, Seleção e Treinamento" },
  B: { nome: "RM Agilis", sigla: "CRM", descricao: "Atendimento, CRM e Helpdesk" },
};

// Tabelas mais frequentes e cruciais do TOTVS RM
export const FREQUENT_RM_TABLES: Record<string, { tabela: string; modulo: string; desc: string; keywords: string[] }> = {
  FLAN: { tabela: "FLAN", modulo: "RM Fluxus", desc: "Lançamentos Financeiros (Pagar e Receber)", keywords: ["titulo", "documento", "vencimento", "baixa", "pagar", "receber", "aberto", "duplicata", "boleto"] },
  FCFO: { tabela: "FCFO", modulo: "RM Fluxus / Global", desc: "Clientes e Fornecedores", keywords: ["cliente", "fornecedor", "cnpj", "cpf", "razao social", "nome fantasia", "parceiro"] },
  FTDO: { tabela: "FTDO", modulo: "RM Fluxus", desc: "Tipos de Documento Financeiro", keywords: ["tipo documento", "especie", "boleto", "promissoria", "nf"] },
  FLANBAIXA: { tabela: "FLANBAIXA", modulo: "RM Fluxus", desc: "Histórico de Baixas dos Lançamentos Financeiros", keywords: ["baixa", "pagamento", "liquidacao", "juros", "multa", "desconto"] },
  FXCX: { tabela: "FXCX", modulo: "RM Fluxus", desc: "Extrato de Caixa e Contas Bancárias", keywords: ["banco", "extrato", "conta corrente", "caixa", "saldo bancario"] },
  FCXA: { tabela: "FCXA", modulo: "RM Fluxus", desc: "Contas / Caixas da Coligada", keywords: ["conta", "agencia", "banco", "caixa"] },
  
  TMOV: { tabela: "TMOV", modulo: "RM Nucleus", desc: "Movimentos de Compras, Vendas e Estoque (Cabeçalho)", keywords: ["nota fiscal", "nfe", "pedido", "compra", "venda", "movimento", "faturamento", "ordem de compra"] },
  TITMMOV: { tabela: "TITMMOV", modulo: "RM Nucleus", desc: "Itens do Movimento (Produtos / Serviços do Movimento)", keywords: ["item", "produto", "preco", "quantidade", "desconto", "valor liquido"] },
  TPRD: { tabela: "TPRD", modulo: "RM Nucleus", desc: "Cadastro de Produtos / Serviços", keywords: ["produto", "codigo produto", "descricao produto", "ncm", "unidade de medida"] },
  TTMV: { tabela: "TTMV", modulo: "RM Nucleus", desc: "Tipos de Movimento (Regras e Códigos 1.1.XX, 2.1.XX, etc)", keywords: ["tipo de movimento", "codtmv", "natureza da operacao"] },
  TMOVHISTORICO: { tabela: "TMOVHISTORICO", modulo: "RM Nucleus", desc: "Histórico do Movimento", keywords: ["historico", "observacao"] },
  TTRBLOCAL: { tabela: "TTRBLOCAL", modulo: "RM Nucleus", desc: "Locais de Estoque", keywords: ["almoxarifado", "local de estoque", "armazem"] },
  
  PFUNC: { tabela: "PFUNC", modulo: "RM Labore", desc: "Cadastro de Funcionários / Colaboradores", keywords: ["funcionario", "colaborador", "chapa", "admissao", "demissao", "salario", "ativo", "afastado"] },
  PFHSTSAL: { tabela: "PFHSTSAL", modulo: "RM Labore", desc: "Histórico Salarial do Funcionário", keywords: ["salario", "aumento", "reajuste", "historico salarial"] },
  PSECAO: { tabela: "PSECAO", modulo: "RM Labore", desc: "Seções / Departamentos / Centros de Custo RH", keywords: ["secao", "departamento", "setor", "unidade"] },
  PFUNCAO: { tabela: "PFUNCAO", modulo: "RM Labore", desc: "Funções / Cargos dos Funcionários", keywords: ["cargo", "funcao", "cbo"] },
  PFHSTSIT: { tabela: "PFHSTSIT", modulo: "RM Labore", desc: "Histórico de Situação do Funcionário", keywords: ["situacao", "ferias", "afastamento", "licenca", "ativo"] },
  PFFINANC: { tabela: "PFFINANC", modulo: "RM Labore", desc: "Ficha Financeira (Verbas / Eventos da Folha)", keywords: ["evento", "holerite", "contra cheque", "provento", "desconto", "inss", "fgts", "irrf"] },
  PEVENTO: { tabela: "PEVENTO", modulo: "RM Labore", desc: "Cadastro de Eventos da Folha", keywords: ["evento", "codigo evento", "rubrica", "provento", "desconto"] },

  CPARTIDA: { tabela: "CPARTIDA", modulo: "RM Saldus", desc: "Partidas e Lançamentos Contábeis", keywords: ["lancamento contabil", "partida", "debito", "credito", "lote", "data contabilidade"] },
  CCONTA: { tabela: "CCONTA", modulo: "RM Saldus", desc: "Plano de Contas Contábil", keywords: ["conta contabil", "plano de contas", "ativo", "passivo", "patrimonio", "despesa", "receita"] },
  CLAFIN: { tabela: "CLAFIN", modulo: "RM Saldus", desc: "Integração Contábil de Lançamentos Financeiros", keywords: ["integracao contabil", "contabilizacao"] },
  
  GCOLIGADA: { tabela: "GCOLIGADA", modulo: "RM Global", desc: "Coligadas (Empresas do Grupo)", keywords: ["coligada", "empresa", "cnpj", "matriz", "filial"] },
  GFILIAL: { tabela: "GFILIAL", modulo: "RM Global", desc: "Filiais da Coligada", keywords: ["filial", "estabelecimento", "inscricao estadual"] },
  GUSUARIO: { tabela: "GUSUARIO", modulo: "RM Global", desc: "Usuários do Sistema RM", keywords: ["usuario", "operador", "login", "permissao"] },
};

/**
 * Inicializa e obtém o catálogo completo resumido das tabelas a partir de DicionarioGDIC.json
 */
export function getRMTableCatalog(): RMTableSummary[] {
  if (cachedCatalog) return cachedCatalog;

  try {
    const gdicPath = path.join(DATA_DIR, "DicionarioGDIC.json");
    if (!fs.existsSync(gdicPath)) {
      console.warn("DicionarioGDIC.json não encontrado em:", gdicPath);
      return [];
    }

    const raw = fs.readFileSync(gdicPath, "utf8");
    const parsed = JSON.parse(raw);
    const gdicList: Array<{ Tabela: string; Coluna: string; Descricao: string }> = parsed.DicionarioGDIC || [];

    const tableMap = new Map<string, string>();
    for (const item of gdicList) {
      if (item.Coluna === "#") {
        tableMap.set(item.Tabela.toUpperCase().trim(), item.Descricao || "");
      }
    }

    const result: RMTableSummary[] = [];
    tableMap.forEach((descricao, tabela) => {
      const firstChar = tabela.charAt(0);
      const fileLetter = /^[A-Z]$/.test(firstChar) ? firstChar : "_";
      result.push({
        tabela,
        descricao,
        sistema: RM_MODULES_MAP[firstChar]?.nome || "Geral RM",
        arquivo: `DicionarioMaster_${fileLetter}.json`,
      });
    });

    cachedCatalog = result;
    return result;
  } catch (err) {
    console.error("Erro ao carregar catálogo de tabelas RM:", err);
    return [];
  }
}

/**
 * Carrega a estrutura detalhada de tabelas do arquivo DicionarioMaster correspondente
 */
export function loadMasterFile(letter: string): RMTable[] {
  const normalizedLetter = /^[A-Z]$/i.test(letter) ? letter.toUpperCase() : "_";
  if (masterCache.has(normalizedLetter)) {
    return masterCache.get(normalizedLetter)!;
  }

  try {
    const filename = `DicionarioMaster_${normalizedLetter}.json`;
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const raw = fs.readFileSync(filePath, "utf8");
    const data: RMTable[] = JSON.parse(raw);
    masterCache.set(normalizedLetter, data);
    return data;
  } catch (err) {
    console.error(`Erro ao ler ${letter}:`, err);
    return [];
  }
}

/**
 * Busca detalhes completos de uma tabela específica (colunas, tipos, chaves e relacionamentos)
 */
export function getTableDetails(tableName: string): RMTable | null {
  const cleanName = tableName.toUpperCase().trim();
  const firstChar = cleanName.charAt(0);
  const tables = loadMasterFile(firstChar);
  const found = tables.find((t) => t.Tabela.toUpperCase() === cleanName);
  return found || null;
}

/**
 * Mecanismo inteligente para identificar tabelas candidatas com base na pergunta do usuário
 */
export function identifyRelevantTables(userPrompt: string, selectedModule?: string): RMTable[] {
  const promptUpper = userPrompt.toUpperCase();
  const promptLower = userPrompt.toLowerCase();
  const identifiedNames = new Set<string>();

  // 1. Verificar menções diretas a nomes de tabelas canônicas (ex: FLAN, TMOV, FCFO, PFUNC)
  const words = promptUpper.match(/[A-Z0-9_]{3,20}/g) || [];
  for (const word of words) {
    const directMatch = getTableDetails(word);
    if (directMatch) {
      identifiedNames.add(directMatch.Tabela);
    }
  }

  // 2. Verificar correspondências com tabelas frequentes por palavras-chave
  for (const [tabela, meta] of Object.entries(FREQUENT_RM_TABLES)) {
    for (const kw of meta.keywords) {
      if (promptLower.includes(kw)) {
        identifiedNames.add(tabela);
        break;
      }
    }
  }

  // 3. Se foi selecionado um módulo explicitamente (ex: Fluxus, Nucleus, Labore)
  if (selectedModule && identifiedNames.size === 0) {
    if (selectedModule === "FLUXUS") {
      identifiedNames.add("FLAN");
      identifiedNames.add("FCFO");
    } else if (selectedModule === "NUCLEUS") {
      identifiedNames.add("TMOV");
      identifiedNames.add("TITMMOV");
    } else if (selectedModule === "LABORE") {
      identifiedNames.add("PFUNC");
      identifiedNames.add("PSECAO");
    } else if (selectedModule === "SALDUS") {
      identifiedNames.add("CPARTIDA");
      identifiedNames.add("CCONTA");
    }
  }

  // 4. Se ainda tiver poucas tabelas, fazer busca semântica por descrição no catálogo
  if (identifiedNames.size < 2) {
    const catalog = getRMTableCatalog();
    const cleanTokens = promptLower
      .replace(/[^a-z0-9áéíóúãõç]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 3);

    for (const item of catalog) {
      const descLower = item.descricao.toLowerCase();
      let matchCount = 0;
      for (const token of cleanTokens) {
        if (descLower.includes(token)) matchCount++;
      }
      if (matchCount >= 2 || (matchCount >= 1 && cleanTokens.length === 1)) {
        identifiedNames.add(item.tabela);
        if (identifiedNames.size >= 4) break;
      }
    }
  }

  // 5. Garantir tabelas de apoio comuns quando suas tabelas principais estiverem presentes
  if (identifiedNames.has("FLAN") && !identifiedNames.has("FCFO") && promptLower.includes("cliente") || promptLower.includes("fornecedor")) {
    identifiedNames.add("FCFO");
  }
  if (identifiedNames.has("TMOV") && (promptLower.includes("item") || promptLower.includes("produto")) && !identifiedNames.has("TITMMOV")) {
    identifiedNames.add("TITMMOV");
    identifiedNames.add("TPRD");
  }
  if (identifiedNames.has("PFUNC") && (promptLower.includes("salario") || promptLower.includes("salário")) && !identifiedNames.has("PFHSTSAL")) {
    identifiedNames.add("PFHSTSAL");
  }

  // Carregar detalhes completos das tabelas selecionadas (máximo 6 para manter contexto enxuto e preciso)
  const result: RMTable[] = [];
  const limit = Math.min(identifiedNames.size, 6);
  let count = 0;

  for (const name of identifiedNames) {
    if (count >= limit) break;
    const details = getTableDetails(name);
    if (details) {
      result.push(details);
      count++;
    }
  }

  return result;
}

/**
 * Aloca aliases curtos e únicos para tabelas (F, C, M, I, F2...) usados nas
 * condições de JOIN garantidas.
 */
export function allocateAliases(tableNames: string[]): Map<string, string> {
  const map = new Map<string, string>();
  const used = new Set<string>();
  for (const raw of tableNames) {
    const name = raw.toUpperCase().trim();
    if (!name || map.has(name)) continue;
    const base = name.charAt(0);
    let alias = base;
    let n = 2;
    while (used.has(alias)) {
      alias = `${base}${n}`;
      n++;
    }
    used.add(alias);
    map.set(name, alias);
  }
  return map;
}

/**
 * Constrói o resumo das tabelas, colunas e relacionamentos formatado para o prompt do LLM
 */
export function buildSchemaContextPrompt(tables: RMTable[]): string {
  if (tables.length === 0) {
    return "Nenhuma tabela específica do RM identificada automaticamente. O modelo deve utilizar seu conhecimento geral das convenções do TOTVS Corpore RM.";
  }

  let text = "### ESQUEMA DO DICIONÁRIO DE DADOS TOTVS RM IDENTIFICADO PARA ESTA CONSULTA:\n\n";

  // JOINs garantidos pelo grafo do dicionário (GLINKSREL + RelacionamentosRM via BFS)
  const seedNames = tables.map((t) => t.Tabela);
  const { joins, bridgeTables } = connectSeedTables(seedNames);
  if (joins.length > 0) {
    const aliases = allocateAliases([...seedNames, ...bridgeTables]);
    text += "### JOINS GARANTIDOS PELO DICIONÁRIO (use EXATAMENTE estas condições de junção):\n";
    for (const j of joins) {
      const aFrom = aliases.get(j.from) || j.from;
      const aTo = aliases.get(j.to) || j.to;
      text += `- ${j.from} (${aFrom}) ↔ ${j.to} (${aTo}): ${formatJoinCondition(j, aFrom, aTo)}`;
      if (j.mismatched) {
        text += " [ATENÇÃO: divergência na chave composta do dicionário — confira os campos antes de usar]";
      }
      text += "\n";
    }
    if (bridgeTables.length > 0) {
      text += `Tabelas-ponte incluídas no caminho (podem entrar no FROM apenas para ligar as demais): ${bridgeTables.join(", ")}\n`;
    }
    text += "\n";
  } else if (tables.length > 1) {
    text += "### JOINS GARANTIDOS PELO DICIONÁRIO: nenhum caminho direto encontrado entre as tabelas acima — prefira subconsultas ou confira os campos no Dicionário RM.\n\n";
  }

  for (const table of tables) {
    const firstChar = table.Tabela.charAt(0);
    const mod = RM_MODULES_MAP[firstChar]?.nome || "TOTVS RM";
    text += `#### Tabela: \`${table.Tabela}\` (${mod})\n`;
    if (table.Descricao) {
      text += `Descrição: ${table.Descricao}\n`;
    }
    text += "Colunas relevantes e tipos:\n";

    // Destacar colunas principais (chaves, códigos, datas, valores, status)
    const importantCols = table.Colunas.filter((c) => {
      const col = c.Coluna.toUpperCase();
      return (
        col.startsWith("COD") ||
        col.startsWith("ID") ||
        col.startsWith("DATA") ||
        col.startsWith("VALOR") ||
        col.startsWith("STATUS") ||
        col.startsWith("PAGREC") ||
        col.startsWith("NUMERO") ||
        col.startsWith("CHAPA") ||
        col.startsWith("NOME") ||
        col.startsWith("HIST") ||
        col.startsWith("DESC") ||
        (c.RelacionamentosRM && c.RelacionamentosRM.length > 0)
      );
    });

    const displayCols = importantCols.length > 0 ? importantCols : table.Colunas.slice(0, 25);

    for (const col of displayCols.slice(0, 30)) {
      const typeStr = col.TamanhoBytes ? `${col.Tipo}(${col.TamanhoBytes})` : col.Tipo;
      const desc = col.Descricao ? ` - ${col.Descricao}` : "";
      text += `- \`${col.Coluna}\` (${typeStr}${col.PermiteNulo === "N" ? ", NOT NULL" : ""})${desc}\n`;
    }

    // Listar relacionamentos com outras tabelas presentes na consulta
    const relations: string[] = [];
    for (const col of table.Colunas) {
      if (col.RelacionamentosRM && col.RelacionamentosRM.length > 0) {
        for (const rel of col.RelacionamentosRM) {
          // Relacionamento com qualquer tabela do conjunto selecionado
          const isTargetInSet = tables.some((t) => t.Tabela.toUpperCase() === rel.TabelaDestino.toUpperCase());
          if (isTargetInSet) {
            relations.push(`- Junção com \`${rel.TabelaDestino}\`: ${table.Tabela}.${rel.ChaveLogicaComposta} = ${rel.TabelaDestino}.${rel.CamposDestino}`);
          }
        }
      }
    }

    if (relations.length > 0) {
      text += "\nRelacionamentos Diretos (Chaves Estrangeiras do RM):\n";
      text += Array.from(new Set(relations)).join("\n") + "\n";
    }

    text += "\n";
  }

  return text;
}
