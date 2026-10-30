import { RMTableSummary, RMSemanticTableWithKey } from "@/lib/totvs-rm/types";

export interface SavedSqlQuery {
  id: string;
  title: string;
  sql: string;
  createdAt: number;
  updatedAt: number;
  tablesUsed: string[];
}

export type SqlStudioSidebarTab = "catalog" | "history" | "templates";

export interface SqlStudioModuleConfig {
  prefix: string;
  label: string;
  shortLabel: string;
  colorClass: string;
}

export const SQL_STUDIO_MODULES: SqlStudioModuleConfig[] = [
  { prefix: "", label: "Todas", shortLabel: "Todas", colorClass: "bg-muted text-foreground" },
  { prefix: "F", label: "RM Fluxus (Finanças)", shortLabel: "Fluxus", colorClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { prefix: "T", label: "RM Nucleus (Faturamento/Estoque)", shortLabel: "Nucleus", colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { prefix: "P", label: "RM Labore (Folha/RH)", shortLabel: "Labore", colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { prefix: "C", label: "RM Saldus (Contabilidade)", shortLabel: "Saldus", colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { prefix: "G", label: "Global / Cadastros Gerais", shortLabel: "Global", colorClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
];
