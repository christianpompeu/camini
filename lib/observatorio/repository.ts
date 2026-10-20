import { stableUuid } from "./identity.ts";
import type {
  Evento,
  EventoMateria,
  Fonte,
  Materia,
  OperacaoPersistencia,
  Relacao,
  RelacaoEvidencia,
  Rodada,
} from "./types.ts";
import type {
  NormalizedEvento,
  NormalizedFonte,
  NormalizedMateria,
  NormalizedRelacao,
  NormalizedRodada,
} from "./validation.ts";

export interface UpsertOutcome<T> {
  record: T;
  operation: OperacaoPersistencia;
}

export interface MateriaWrite extends NormalizedMateria {
  fonte_id: string;
  rodada_id: string | null;
}

export interface EventoWrite extends NormalizedEvento {
  observado_em: string;
}

export interface VinculoWrite {
  evento_id: string;
  materia_id: string;
  papel: EventoMateria["papel"];
  criado_em: string;
}

export interface RelacaoWrite extends Omit<
  NormalizedRelacao,
  "evento_origem_chave" | "evento_destino_chave" | "evidencias" | "base_causal"
> {
  origem_id: string;
  destino_id: string;
}

export interface EvidenciaWrite {
  relacao_id: string;
  materia_id: string;
  papel: RelacaoEvidencia["papel"];
  justificativa: string | null;
}

export interface ObservatorioTransaction {
  findMateriaByCanonicalUrl(url: string): Promise<Materia | null>;
  findEventoByKey(key: string): Promise<Evento | null>;
  upsertRodada(input: NormalizedRodada): Promise<UpsertOutcome<Rodada>>;
  upsertFonte(input: NormalizedFonte): Promise<UpsertOutcome<Fonte>>;
  upsertMateria(input: MateriaWrite): Promise<UpsertOutcome<Materia>>;
  upsertEvento(input: EventoWrite): Promise<UpsertOutcome<Evento>>;
  upsertVinculo(input: VinculoWrite): Promise<UpsertOutcome<EventoMateria>>;
  upsertRelacao(input: RelacaoWrite): Promise<UpsertOutcome<Relacao>>;
  upsertEvidencia(input: EvidenciaWrite): Promise<UpsertOutcome<RelacaoEvidencia>>;
}

export interface ObservatorioIngestionRepository {
  transaction<T>(work: (transaction: ObservatorioTransaction) => Promise<T>): Promise<T>;
}

export interface InMemoryObservatorioSnapshot {
  rodadas: Rodada[];
  fontes: Fonte[];
  materias: Materia[];
  eventos: Evento[];
  vinculos: EventoMateria[];
  relacoes: Relacao[];
  evidencias: RelacaoEvidencia[];
}

function recordsEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function outcome<T>(current: T | undefined, next: T): UpsertOutcome<T> {
  if (!current) return { record: next, operation: "inserido" };
  if (recordsEqual(current, next)) return { record: current, operation: "inalterado" };
  return { record: next, operation: "atualizado" };
}

export class InMemoryObservatorioRepository
implements ObservatorioIngestionRepository, ObservatorioTransaction {
  private rodadas = new Map<string, Rodada>();
  private fontes = new Map<string, Fonte>();
  private materias = new Map<string, Materia>();
  private eventos = new Map<string, Evento>();
  private vinculos = new Map<string, EventoMateria>();
  private relacoes = new Map<string, Relacao>();
  private evidencias = new Map<string, RelacaoEvidencia>();
  private readonly now: () => Date;

  constructor(now: () => Date = () => new Date()) {
    this.now = now;
  }

  async transaction<T>(
    work: (transaction: ObservatorioTransaction) => Promise<T>
  ): Promise<T> {
    const backup = this.cloneState();
    try {
      return await work(this);
    } catch (error) {
      this.restoreState(backup);
      throw error;
    }
  }

  async findMateriaByCanonicalUrl(url: string): Promise<Materia | null> {
    return this.materias.get(url) ?? null;
  }

  async findEventoByKey(key: string): Promise<Evento | null> {
    return this.eventos.get(key) ?? null;
  }

  async upsertRodada(input: NormalizedRodada): Promise<UpsertOutcome<Rodada>> {
    const current = this.rodadas.get(input.run_key);
    const next: Rodada = {
      id: current?.id ?? stableUuid("rodada", input.run_key),
      ...input,
    };
    const result = outcome(current, next);
    this.rodadas.set(input.run_key, result.record);
    return result;
  }

  async upsertFonte(input: NormalizedFonte): Promise<UpsertOutcome<Fonte>> {
    const current = this.fontes.get(input.dominio);
    const next: Fonte = {
      id: current?.id ?? stableUuid("fonte", input.dominio),
      criado_em: current?.criado_em ?? this.now().toISOString(),
      ...input,
    };
    const result = outcome(current, next);
    this.fontes.set(input.dominio, result.record);
    return result;
  }

  async upsertMateria(input: MateriaWrite): Promise<UpsertOutcome<Materia>> {
    const current = this.materias.get(input.url_canonica);
    const next: Materia = {
      id: current?.id ?? stableUuid("materia", input.url_canonica),
      ...input,
      coletado_em: current?.coletado_em ?? input.coletado_em,
    };
    const result = outcome(current, next);
    this.materias.set(input.url_canonica, result.record);
    return result;
  }

  async upsertEvento(input: EventoWrite): Promise<UpsertOutcome<Evento>> {
    const current = this.eventos.get(input.chave);
    const { observado_em: observedAt, ...event } = input;
    const next: Evento = {
      id: current?.id ?? stableUuid("evento", input.chave),
      evento_canonico_id: current?.evento_canonico_id ?? null,
      notion_page_id: current?.notion_page_id ?? null,
      visto_primeiro_em: current?.visto_primeiro_em ?? observedAt,
      visto_ultimo_em: current && current.visto_ultimo_em > observedAt
        ? current.visto_ultimo_em
        : observedAt,
      ...event,
    };
    const result = outcome(current, next);
    this.eventos.set(input.chave, result.record);
    return result;
  }

  async upsertVinculo(input: VinculoWrite): Promise<UpsertOutcome<EventoMateria>> {
    const key = `${input.evento_id}:${input.materia_id}`;
    const current = this.vinculos.get(key);
    const next: EventoMateria = {
      evento_id: input.evento_id,
      materia_id: input.materia_id,
      papel: input.papel,
      criado_em: current?.criado_em ?? input.criado_em,
    };
    const result = outcome(current, next);
    this.vinculos.set(key, result.record);
    return result;
  }

  async upsertRelacao(input: RelacaoWrite): Promise<UpsertOutcome<Relacao>> {
    const key = `${input.origem_id}:${input.destino_id}:${input.tipo}`;
    const current = this.relacoes.get(key);
    const next: Relacao = {
      id: current?.id ?? stableUuid("relacao", key),
      origem_id: input.origem_id,
      destino_id: input.destino_id,
      tipo: input.tipo,
      evidencia_status: input.evidencia_status,
      justificativa: input.justificativa,
      confianca: input.confianca,
      revisao: input.revisao,
      notion_page_id: current?.notion_page_id ?? null,
      criado_em: current?.criado_em ?? this.now().toISOString(),
      revisado_em: current?.revisado_em ?? null,
    };
    const result = outcome(current, next);
    this.relacoes.set(key, result.record);
    return result;
  }

  async upsertEvidencia(input: EvidenciaWrite): Promise<UpsertOutcome<RelacaoEvidencia>> {
    const key = `${input.relacao_id}:${input.materia_id}:${input.papel}`;
    const current = this.evidencias.get(key);
    const next: RelacaoEvidencia = { ...input };
    const result = outcome(current, next);
    this.evidencias.set(key, result.record);
    return result;
  }

  snapshot(): InMemoryObservatorioSnapshot {
    return structuredClone({
      rodadas: [...this.rodadas.values()],
      fontes: [...this.fontes.values()],
      materias: [...this.materias.values()],
      eventos: [...this.eventos.values()],
      vinculos: [...this.vinculos.values()],
      relacoes: [...this.relacoes.values()],
      evidencias: [...this.evidencias.values()],
    });
  }

  private cloneState() {
    return structuredClone({
      rodadas: [...this.rodadas.entries()],
      fontes: [...this.fontes.entries()],
      materias: [...this.materias.entries()],
      eventos: [...this.eventos.entries()],
      vinculos: [...this.vinculos.entries()],
      relacoes: [...this.relacoes.entries()],
      evidencias: [...this.evidencias.entries()],
    });
  }

  private restoreState(state: ReturnType<InMemoryObservatorioRepository["cloneState"]>) {
    this.rodadas = new Map(state.rodadas);
    this.fontes = new Map(state.fontes);
    this.materias = new Map(state.materias);
    this.eventos = new Map(state.eventos);
    this.vinculos = new Map(state.vinculos);
    this.relacoes = new Map(state.relacoes);
    this.evidencias = new Map(state.evidencias);
  }
}
