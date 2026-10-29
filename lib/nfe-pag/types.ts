export type TagCondition = "Obrigatório" | "Condicional" | "Opcional" | "Obrigatório no grupo";

export interface TagInfo {
  id: string;
  tag: string;
  parent: string;
  type: string;
  occurrences: string;
  cond: TagCondition;
  notes: string;
  rejections: string[];
  source: string;
}

export type PaymentCategory =
  | "all"
  | "pix"
  | "cards"
  | "cash"
  | "benefits"
  | "new"
  | "special"
  | "other";

export interface TPagItem {
  code: string;
  name: string;
  start: string;
  card: "Obrigatório" | "Proibido" | "Permitido" | "Facultativo" | "Não exigido" | "Dispensado";
  category: PaymentCategory;
  source: string;
  notes: string;
}

export interface TBandItem {
  code: string;
  name: string;
}

export type RejectionModel = "55" | "65" | "Ambos" | "Future55";

export interface RejectionItem {
  rule: string;
  model: RejectionModel;
  cStat: string;
  msg: string;
  trigger: string;
  source: string;
}

export interface TimelineMilestone {
  nt: string;
  badge: string;
  badgeColor?: string;
  title: string;
  desc: string;
  sourceText: string;
  sourceDetail: string;
}

export interface ErpGuideline {
  id: string;
  title: string;
  iconName: string;
  sourceText: string;
  sourceDetail: string;
  description: string;
}

export interface PresetScenario {
  id: string;
  label: string;
  model: "55" | "65";
  finNFe: "1" | "3" | "4";
  tPag: string;
  vNF: number;
  vPag: number;
  tpIntegra: "1" | "2";
  xPag?: string;
}

export interface DiagnosticItem {
  type: "error" | "warning" | "success" | "info";
  code: string;
  msg: string;
}
