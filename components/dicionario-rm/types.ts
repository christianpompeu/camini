import { RMSemanticTableWithKey, RMTableSummary } from "@/lib/totvs-rm/types";

export interface DictSearchSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  primaryTable: string | null;
  secondaryTable?: string | null;
  sidePanels?: string[];
  activeSideTab?: string;
  isSplitView?: boolean;
  searchQuery?: string;
  selectedModule?: string;
  pinned?: boolean;
}

export type ColumnCategoryFilter = "all" | "keys" | "text" | "number" | "date";

export type PaneTab = "columns" | "outgoing" | "incoming" | "graph" | "sql";

export interface TableDetailsCache {
  [tableName: string]: RMSemanticTableWithKey;
}

export interface ModuleFilterItem {
  prefix: string;
  label: string;
  shortLabel: string;
  description: string;
  colorClass: string;
  badgeClass: string;
}

export const RM_MODULES_CONFIG: ModuleFilterItem[] = [
  {
    prefix: "",
    label: "Todos os Módulos",
    shortLabel: "Todos",
    description: "Catálogo completo com mais de 9.400 tabelas",
    colorClass: "border-border text-foreground",
    badgeClass: "bg-muted text-foreground border-border",
  },
  {
    prefix: "F",
    label: "RM Fluxus (Financeiro)",
    shortLabel: "Fluxus",
    description: "Contas a pagar/receber, cheques, borderôs e caixas",
    colorClass: "border-sky-500/30 text-sky-600 dark:text-sky-400",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  {
    prefix: "T",
    label: "RM Nucleus (Compras & Faturamento)",
    shortLabel: "Nucleus",
    description: "Movimentos, notas fiscais, estoque e pedidos",
    colorClass: "border-violet-500/30 text-violet-600 dark:text-violet-400",
    badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  {
    prefix: "P",
    label: "RM Labore (RH & Folha)",
    shortLabel: "Labore",
    description: "Funcionários, seções, histórico salarial e eventos",
    colorClass: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    prefix: "C",
    label: "RM Saldus (Contabilidade)",
    shortLabel: "Saldus",
    description: "Plano de contas, partidas contábeis e lotes",
    colorClass: "border-amber-500/30 text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    prefix: "S",
    label: "RM Classis (Educacional)",
    shortLabel: "Classis",
    description: "Alunos, turmas, matrículas e professores",
    colorClass: "border-rose-500/30 text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  {
    prefix: "G",
    label: "Global (Cadastros Gerais)",
    shortLabel: "Global",
    description: "Coligadas, filiais, usuários, centros de custo e parâmetros",
    colorClass: "border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    prefix: "D",
    label: "RM Agilis (CRM)",
    shortLabel: "Agilis",
    description: "Atendimentos, clientes e contatos comerciais",
    colorClass: "border-orange-500/30 text-orange-600 dark:text-orange-400",
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  {
    prefix: "E",
    label: "RM Solum (Obras)",
    shortLabel: "Solum",
    description: "Projetos, orçamentos, composições e insumos",
    colorClass: "border-teal-500/30 text-teal-600 dark:text-teal-400",
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  },
  {
    prefix: "K",
    label: "RM Factor (Produção)",
    shortLabel: "Factor",
    description: "Ordens de produção, roteiros e estrutura de produtos",
    colorClass: "border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400",
    badgeClass: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
  },
  {
    prefix: "M",
    label: "RM Bonum (Patrimônio)",
    shortLabel: "Bonum",
    description: "Ativos imobilizados, cálculos de depreciação e baixas",
    colorClass: "border-cyan-500/30 text-cyan-600 dark:text-cyan-400",
    badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
];

export interface PopularTableShortcut {
  table: string;
  name: string;
  module: string;
  description: string;
  badgeClass: string;
}

export const POPULAR_RM_TABLES: PopularTableShortcut[] = [
  {
    table: "TMOV",
    name: "Movimento de Estoque/Venda",
    module: "Nucleus",
    description: "Cabeçalho de notas fiscais, pedidos, cotações e transferências",
    badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  {
    table: "TITMMOV",
    name: "Itens de Movimento",
    module: "Nucleus",
    description: "Produtos, quantidades, valores unitários e tributos de cada item",
    badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  {
    table: "FLAN",
    name: "Lançamentos Financeiros",
    module: "Fluxus",
    description: "Títulos a pagar e a receber, parcelas, juros e status de baixa",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  {
    table: "FCFO",
    name: "Clientes e Fornecedores",
    module: "Fluxus/Geral",
    description: "Cadastro geral de parceiros comerciais, CNPJ/CPF, endereços e bancos",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  {
    table: "PFUNC",
    name: "Funcionários",
    module: "Labore",
    description: "Cadastro de colaboradores, chapa, admissão, jornada e situação",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    table: "PSECAO",
    name: "Seções / Departamentos",
    module: "Labore",
    description: "Estrutura organizacional, departamentos e centros de lotação",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    table: "CCONTA",
    name: "Plano de Contas",
    module: "Saldus",
    description: "Estrutura do plano de contas contábil analítico e sintético",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    table: "CPARTIDA",
    name: "Partidas Contábeis",
    module: "Saldus",
    description: "Lançamentos a débito e a crédito com datas e históricos padrão",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    table: "TPRD",
    name: "Produtos e Serviços",
    module: "Nucleus",
    description: "Catálogo de mercadorias, NCM, unidades de medida e tributação",
    badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  {
    table: "GCCUSTO",
    name: "Centros de Custo",
    module: "Global",
    description: "Centros de custo globais usados em finanças, compras e folha",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
];
