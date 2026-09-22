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
