export interface RMColumnRelationship {
  TabelaDestino: string;
  CamposDestino: string;
  ChaveLogicaComposta: string;
}

export interface RMColumn {
  Coluna: string;
  Tipo: string;
  TamanhoBytes?: number;
  Precisao?: number;
  Escala?: number;
  PermiteNulo?: string;
  Identity?: string;
  Calculada?: string;
  Descricao?: string;
  RelacionamentosRM?: RMColumnRelationship[];
}

export interface RMTable {
  Tabela: string;
  Descricao?: string;
  Sistema?: string;
  Colunas: RMColumn[];
}

export interface RMTableSummary {
  tabela: string;
  descricao: string;
  sistema: string;
  arquivo: string;
}

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
  llmProvider: "gemini" | "groq" | "openrouter";
  geminiApiKey?: string;
  geminiModel: string;
  groqApiKey?: string;
  groqModel: string;
  sqlDialect: "sqlserver" | "oracle";
  includeComments: boolean;
  defaultColigadaFilter: boolean;
}
