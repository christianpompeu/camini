import type { Database, Json } from "@/lib/supabase/database.types";

type Tables = Database["public"]["Tables"];
type Row<Name extends keyof Tables> = Tables[Name]["Row"];

export type CanalObservatorio = "panorama" | "tech";
export type StatusRodada = "executando" | "concluida" | "parcial" | "falhou";
export type TipoFonte =
  | "jornalismo"
  | "oficial"
  | "academico"
  | "institucional"
  | "outro";
export type FormatoMateria =
  | "noticia"
  | "paper"
  | "documento"
  | "analise"
  | "outro";
export type StatusAcademico =
  | "nao_aplicavel"
  | "preprint"
  | "revisado_por_pares"
  | "desconhecido";
export type StatusVerificacaoMateria =
  | "pendente"
  | "checado"
  | "contestado"
  | "descartado";
export type CategoriaEvento =
  | "politica"
  | "economia"
  | "geopolitica"
  | "tecnologia"
  | "ciencia"
  | "sociedade"
  | "outros";
export type PrecisaoDataEvento = "exata" | "dia" | "estimada" | "desconhecida";
export type StatusVerificacaoEvento = "pendente" | "verificado" | "contestado";
export type StatusSanitizacao =
  | "bruto"
  | "normalizado"
  | "revisado"
  | "fundido"
  | "descartado";
export type PapelMateriaEvento =
  | "cobertura"
  | "fonte_primaria"
  | "contraponto"
  | "retificacao";
export type TipoRelacao =
  | "relacionado"
  | "precede"
  | "correlacionado"
  | "influencia_alegada"
  | "causal_comprovada"
  | "contradiz";
export type StatusEvidencia =
  | "confirmado"
  | "correlacionado"
  | "hipotese"
  | "contestado";
export type StatusRevisaoRelacao = "pendente" | "revisado" | "rejeitado";
export type PapelEvidencia = "apoia" | "contradiz" | "contextualiza";
export type EstadoTendencia =
  | "monitorando"
  | "emergente"
  | "crescente"
  | "estavel"
  | "declinante"
  | "encerrada";
export type StatusEdicao =
  | "candidata"
  | "aprovada"
  | "publicada"
  | "rejeitada"
  | "arquivada";

export type Rodada = Omit<Row<"observatorio_rodadas">, "canal" | "status"> & {
  canal: CanalObservatorio;
  status: StatusRodada;
};
export type Fonte = Omit<Row<"observatorio_fontes">, "tipo"> & {
  tipo: TipoFonte;
};
export type Materia = Omit<
  Row<"observatorio_materias">,
  "formato" | "status_verificacao"
> & {
  formato: FormatoMateria;
  status_verificacao: StatusVerificacaoMateria;
};
export type Evento = Omit<
  Row<"observatorio_eventos">,
  | "categoria"
  | "data_evento_precisao"
  | "status_verificacao"
  | "status_sanitizacao"
> & {
  categoria: CategoriaEvento;
  data_evento_precisao: PrecisaoDataEvento;
  status_verificacao: StatusVerificacaoEvento;
  status_sanitizacao: StatusSanitizacao;
};
export type EventoMateria = Omit<Row<"observatorio_eventos_materias">, "papel"> & {
  papel: PapelMateriaEvento;
};
export type Relacao = Omit<
  Row<"observatorio_relacoes">,
  "tipo" | "evidencia_status" | "revisao"
> & {
  tipo: TipoRelacao;
  evidencia_status: StatusEvidencia;
  revisao: StatusRevisaoRelacao;
};
export type RelacaoEvidencia = Omit<
  Row<"observatorio_relacoes_evidencias">,
  "papel"
> & {
  papel: PapelEvidencia;
};
export type Tendencia = Omit<Row<"observatorio_tendencias">, "estado"> & {
  estado: EstadoTendencia;
};
export type TendenciaEvento = Row<"observatorio_tendencias_eventos">;
export type Edicao = Omit<Row<"observatorio_edicoes">, "canal" | "status"> & {
  canal: CanalObservatorio;
  status: StatusEdicao;
};

export interface RodadaInput {
  runKey?: string;
  canal: CanalObservatorio;
  origem: string;
  status?: StatusRodada;
  janelaInicio?: string | Date | null;
  janelaFim?: string | Date | null;
  iniciadoEm: string | Date;
  concluidoEm?: string | Date | null;
  resumo?: string | null;
  diagnostico?: Record<string, Json>;
}
export interface FonteInput {
  nome: string;
  tipo: TipoFonte;
  notas?: string | null;
}

export interface MateriaInput {
  url: string;
  titulo: string;
  resumo: string;
  idioma?: string;
  formato: FormatoMateria;
  statusAcademico?: StatusAcademico;
  statusVerificacao?: StatusVerificacaoMateria;
  publicadoEm?: string | Date | null;
  coletadoEm: string | Date;
  metadados?: Record<string, Json>;
}

export interface EventoInput {
  chave?: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaEvento;
  dataEvento?: string | Date | null;
  dataEventoPrecisao?: PrecisaoDataEvento;
  statusVerificacao?: StatusVerificacaoEvento;
  statusSanitizacao?: StatusSanitizacao;
  dados?: Record<string, Json>;
}

export interface VinculoMateriaEventoInput {
  evento: EventoInput;
  papel: PapelMateriaEvento;
}

export interface ItemIngestaoInput {
  fonte: FonteInput;
  materia: MateriaInput;
  eventos: VinculoMateriaEventoInput[];
}

export interface EvidenciaRelacaoInput {
  materiaUrl: string;
  papel: PapelEvidencia;
  justificativa?: string | null;
}

export interface RelacaoInput {
  eventoOrigemChave: string;
  eventoDestinoChave: string;
  tipo: TipoRelacao;
  evidenciaStatus: StatusEvidencia;
  justificativa: string;
  confianca?: number | null;
  revisao?: StatusRevisaoRelacao;
  baseCausal?: string | null;
  evidencias: EvidenciaRelacaoInput[];
}

export interface LoteIngestaoInput {
  rodada: RodadaInput;
  itens: ItemIngestaoInput[];
  relacoes?: RelacaoInput[];
}

export type OperacaoPersistencia = "inserido" | "atualizado" | "inalterado";

export interface ContagemOperacoes {
  inseridos: number;
  atualizados: number;
  inalterados: number;
}

export interface ResultadoIngestao {
  runKey: string;
  rodadas: ContagemOperacoes;
  fontes: ContagemOperacoes;
  materias: ContagemOperacoes;
  eventos: ContagemOperacoes;
  vinculos: ContagemOperacoes;
  relacoes: ContagemOperacoes;
  evidencias: ContagemOperacoes;
}
