import fs from "fs";
import path from "path";
import { RMColumn, RMTable, RMTableSummary } from "./types";
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
  PFHSTSAL: { tabela: "PFHSTSAL", modulo: "RM Labore", desc: "Histórico Salarial do Funcionário", keywords: ["salario", "salarial", "aumento", "reajuste", "historico salarial", "historico"] },
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
  if (identifiedNames.has("PFUNC") && (promptLower.includes("salario") || promptLower.includes("salário") || promptLower.includes("salarial") || promptLower.includes("historico")) && !identifiedNames.has("PFHSTSAL")) {
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

// --- Fase 2: cobertura de colunas (ranking léxico pela pergunta) ---

const COLUMN_DOCS_FILE = path.join(process.cwd(), "public", "dicionario_rm", "index", "column-docs.json");
let cachedColumnDocs: Record<string, Record<string, string>> | null = null;

function loadColumnDocs(): Record<string, Record<string, string>> {
  if (cachedColumnDocs) return cachedColumnDocs;
  try {
    if (!fs.existsSync(COLUMN_DOCS_FILE)) {
      cachedColumnDocs = {};
      return cachedColumnDocs;
    }
    const parsed = JSON.parse(fs.readFileSync(COLUMN_DOCS_FILE, "utf8"));
    cachedColumnDocs = (parsed.docs || {}) as Record<string, Record<string, string>>;
    return cachedColumnDocs;
  } catch (err) {
    console.warn("column-docs.json não encontrado ou inválido:", err);
    cachedColumnDocs = {};
    return cachedColumnDocs;
  }
}

/** Teto de colunas por tabela no prompt (Fase 2). */
export const MAX_COLUMNS_PER_TABLE = 25;

const PT_STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "com", "para", "por", "em", "um", "uma",
  "e", "o", "a", "os", "as", "que", "se", "nos", "nas", "ao", "aos",
  "no", "na", "dos", "das", "como", "mais", "menos", "entre", "sobre",
  "qual", "quais", "todo", "todos", "toda", "todas", "este", "esta",
]);

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ");
}

function tokenizePt(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .filter((t) => t.length > 2 && !PT_STOPWORDS.has(t));
}

function prefixMatch(a: string, b: string, min = 5): boolean {
  if (a.length < 4 || b.length < 4) return a === b;
  const n = Math.min(min, a.length, b.length);
  return a.slice(0, n) === b.slice(0, n);
}

/**
 * Pontua uma coluna contra os tokens da pergunta.
 * Usa nome da coluna (ex.: NOMEFANTASIA casa com "fantasia") +
 * descrição do dicionário (ex.: CGCCFO/"CNPJ" casa com "cnpj").
 */
function scoreColumn(colName: string, colDesc: string, promptTokens: string[]): number {
  if (promptTokens.length === 0) return 0;
  const nameNorm = normalizeText(colName).replace(/\s+/g, "");
  const descTokens = tokenizePt(colDesc);
  let score = 0;
  for (const pt of promptTokens) {
    // Nome da coluna contém o token (ex.: "fantasia" em "nomefantasia")
    if (pt.length >= 4 && nameNorm.includes(pt)) {
      score += 2.5;
      continue;
    }
    // Token da pergunta contém o nome (ex.: pergunta cita "cgccfo")
    if (pt.length >= 5 && nameNorm.length >= 4 && pt.includes(nameNorm)) {
      score += 2.5;
      continue;
    }
    // Descrição: igualdade exata vale mais
    if (descTokens.includes(pt)) {
      score += 3;
      continue;
    }
    // Descrição: variação de radical (salario/salarial, historico/historicos)
    for (const dt of descTokens) {
      if (prefixMatch(pt, dt)) {
        score += 2;
        break;
      }
    }
  }
  // Sinônimos curtos do RM que o dicionário nem sempre aproxima
  const nameUp = colName.toUpperCase();
  if (promptTokens.includes("cnpj") && nameUp === "CGCCFO") score += 2;
  if (promptTokens.includes("cpf") && (nameUp === "CGCCFO" || nameUp === "CPF")) score += 2;
  return score;
}

/**
 * Ranqueia as colunas de uma tabela pela pergunta, preservando sempre os
 * campos obrigatórios (JOINs da Fase 1 + CODCOLIGADA). Retorna no máximo
 * `limit` colunas: obrigatórias primeiro (ordem original), depois as de
 * maior escore (desempate pela ordem original, determinístico).
 */
export function rankColumnsForTable(
  table: RMTable,
  userPrompt: string,
  requiredFields: Set<string> = new Set(),
  limit: number = MAX_COLUMNS_PER_TABLE
): RMColumn[] {
  const requiredUp = new Set(Array.from(requiredFields).map((f) => f.toUpperCase().trim()));
  if (table.Colunas.some((c) => c.Coluna.toUpperCase() === "CODCOLIGADA")) {
    requiredUp.add("CODCOLIGADA");
  }
  const promptTokens = tokenizePt(userPrompt || "");
  const required: RMColumn[] = [];
  const rest: Array<{ col: RMColumn; score: number; idx: number }> = [];
  table.Colunas.forEach((col, idx) => {
    if (requiredUp.has(col.Coluna.toUpperCase())) {
      required.push(col);
    } else {
      const desc = col.Descricao && col.Descricao !== "N/A" ? col.Descricao : "";
      rest.push({ col, score: scoreColumn(col.Coluna, desc, promptTokens), idx });
    }
  });
  rest.sort((a, b) => b.score - a.score || a.idx - b.idx);
  const out = [...required];
  for (const r of rest) {
    if (out.length >= limit) break;
    out.push(r.col);
  }
  return out.slice(0, limit);
}

/**
 * Constrói o resumo das tabelas, colunas e relacionamentos formatado para o prompt do LLM.
 * Fase 2: colunas ranqueadas pela pergunta (teto MAX_COLUMNS_PER_TABLE/tabela),
 * preservando sempre PK/FKs dos JOINs garantidos + CODCOLIGADA.
 */
export function buildSchemaContextPrompt(tables: RMTable[], userPrompt = ""): string {
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

  const seedSet = new Set(seedNames.map((s) => s.toUpperCase()));
  // Campos obrigatórios por tabela: JOINs garantidos + FKs p/ tabelas do conjunto
  const requiredByTable = new Map<string, Set<string>>();
  const ensure = (t: string) => {
    const k = t.toUpperCase();
    if (!requiredByTable.has(k)) requiredByTable.set(k, new Set());
    return requiredByTable.get(k)!;
  };
  for (const j of joins) {
    for (const f of j.fromFields) ensure(j.from).add(f.toUpperCase());
    for (const f of j.toFields) ensure(j.to).add(f.toUpperCase());
  }
  for (const table of tables) {
    const tUp = table.Tabela.toUpperCase();
    for (const col of table.Colunas) {
      if (!col.RelacionamentosRM) continue;
      for (const rel of col.RelacionamentosRM) {
        if (seedSet.has(rel.TabelaDestino.toUpperCase())) {
          for (const f of String(rel.ChaveLogicaComposta || "").split(",")) {
            const clean = f.trim().toUpperCase();
            if (clean) ensure(tUp).add(clean);
          }
        }
      }
    }
  }

  const colDocs = loadColumnDocs();

  for (const table of tables) {
    const firstChar = table.Tabela.charAt(0);
    const mod = RM_MODULES_MAP[firstChar]?.nome || "TOTVS RM";
    text += `#### Tabela: \`${table.Tabela}\` (${mod})\n`;
    if (table.Descricao) {
      text += `Descrição: ${table.Descricao}\n`;
    }
    text += "Colunas relevantes e tipos:\n";

    const required = requiredByTable.get(table.Tabela.toUpperCase()) || new Set<string>();
    const promptTokens = tokenizePt(userPrompt || "");
    let displayCols: RMColumn[];
    if (promptTokens.length === 0) {
      // Sem pergunta (chamadas legadas/testes): heurística antiga de prefixos
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
      const base = importantCols.length > 0 ? importantCols : table.Colunas.slice(0, 25);
      // Garante obrigatórias mesmo no fallback legado
      const baseSet = new Set(base.map((c) => c.Coluna.toUpperCase()));
      const missing = table.Colunas.filter(
        (c) => required.has(c.Coluna.toUpperCase()) && !baseSet.has(c.Coluna.toUpperCase())
      );
      displayCols = [...missing, ...base].slice(0, MAX_COLUMNS_PER_TABLE + missing.length);
    } else {
      displayCols = rankColumnsForTable(table, userPrompt, required, MAX_COLUMNS_PER_TABLE);
    }

    const tableDocs = colDocs[table.Tabela.toUpperCase()] || {};
    for (const col of displayCols.slice(0, MAX_COLUMNS_PER_TABLE)) {
      const typeStr = col.TamanhoBytes ? `${col.Tipo}(${col.TamanhoBytes})` : col.Tipo;
      const gdicDesc = tableDocs[col.Coluna.toUpperCase()] || "";
      const desc =
        col.Descricao && col.Descricao !== "N/A" ? col.Descricao : gdicDesc;
      text += `- \`${col.Coluna}\` (${typeStr}${col.PermiteNulo === "N" ? ", NOT NULL" : ""})${desc ? ` - ${desc}` : ""}\n`;
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
