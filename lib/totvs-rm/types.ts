export interface RMSemanticRelationship {
  tabela_destino: string;
  chaves_ligacao: string;
}

export interface RMSemanticColumn {
  nome: string;
  tipo: string;
  descricao: string;
}

export interface RMSemanticTable {
  descricao: string;
  colunas: RMSemanticColumn[];
  relacionamentos_saida: RMSemanticRelationship[];
}

export interface RMSemanticTableWithKey extends RMSemanticTable {
  tabela: string;
  Modulo?: string; // Trazido pelo /api/totvs-rm/tables
}

export interface RMTableSummary {
  tabela: string;
  descricao: string;
  sistema: string;
}

export type RMSemanticDictionary = Record<string, RMSemanticTable>;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  sqlCode?: string;
  sqlExplanation?: string;
  tablesUsed?: string[];
  tips?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  systemModule?: string;
  dialect?: "sqlserver" | "oracle";
}

export interface UserSettings {
  llmProvider: "gemini" | "groq" | "openrouter" | "openai";
  geminiApiKey?: string;
  geminiModel: string;
  groqApiKey?: string;
  groqModel: string;
  sqlDialect: "sqlserver" | "oracle";
  includeComments: boolean;
  defaultColigadaFilter: boolean;
}

// --- FASE F: Semantic Planner & Routing Types ---

export type SemanticOperator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "IN" | "NOT_IN" | "LIKE" | "BETWEEN" | "IS_NULL" | "IS_NOT_NULL";

export interface SemanticFilter {
  concept: string;
  operator: SemanticOperator;
  value?: string;
  values?: string[];
}

export interface SemanticPlan {
  intent: string;
  domains: string[];
  entities: string[];
  filters: SemanticFilter[];
  requestedFields: string[];
  operations: string[];
  aggregations: string[];
  ordering: string[];
  grouping: string[];
  temporalRequirements: string[];
  candidateTables: string[];
}

export type ComplexityLevel = "simple" | "moderate" | "complex";

export interface ComplexityResult {
  level: ComplexityLevel;
  reasons: string[];
}

export type RoutingMode = "static" | "complexity";

export interface RoutingDecision {
  strategy: RoutingMode;
  preferredProvider: string;
  preferredModel: string;
  allowRepair: boolean;
  allowEscalation: boolean;
}
