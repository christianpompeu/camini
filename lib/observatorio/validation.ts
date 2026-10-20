import type { Json } from "@/lib/supabase/database.types";
import { ObservatorioValidationError, type ValidationIssue } from "./errors.ts";
import { buildEventKey, buildRunKey } from "./identity.ts";
import {
  canonicalizeUrl,
  domainFromCanonicalUrl,
  normalizeTimestamp,
  slugify,
} from "./normalization.ts";
import type {
  CanalObservatorio,
  CategoriaEvento,
  FormatoMateria,
  LoteIngestaoInput,
  PapelEvidencia,
  PapelMateriaEvento,
  PrecisaoDataEvento,
  StatusAcademico,
  StatusEvidencia,
  StatusRevisaoRelacao,
  StatusRodada,
  StatusSanitizacao,
  StatusVerificacaoEvento,
  StatusVerificacaoMateria,
  TipoFonte,
  TipoRelacao,
} from "./types.ts";

const CANAIS = ["panorama", "tech"] as const;
const STATUS_RODADA = ["executando", "concluida", "parcial", "falhou"] as const;
const TIPOS_FONTE = ["jornalismo", "oficial", "academico", "institucional", "outro"] as const;
const FORMATOS = ["noticia", "paper", "documento", "analise", "outro"] as const;
const STATUS_ACADEMICO = ["nao_aplicavel", "preprint", "revisado_por_pares", "desconhecido"] as const;
const STATUS_MATERIA = ["pendente", "checado", "contestado", "descartado"] as const;
const CATEGORIAS = ["politica", "economia", "geopolitica", "tecnologia", "ciencia", "sociedade", "outros"] as const;
const PRECISOES = ["exata", "dia", "estimada", "desconhecida"] as const;
const STATUS_EVENTO = ["pendente", "verificado", "contestado"] as const;
const STATUS_SANITIZACAO = ["bruto", "normalizado", "revisado", "fundido", "descartado"] as const;
const PAPEIS_VINCULO = ["cobertura", "fonte_primaria", "contraponto", "retificacao"] as const;
const TIPOS_RELACAO = ["relacionado", "precede", "correlacionado", "influencia_alegada", "causal_comprovada", "contradiz"] as const;
const STATUS_EVIDENCIA = ["confirmado", "correlacionado", "hipotese", "contestado"] as const;
const STATUS_REVISAO = ["pendente", "revisado", "rejeitado"] as const;
const PAPEIS_EVIDENCIA = ["apoia", "contradiz", "contextualiza"] as const;

export interface NormalizedRodada {
  run_key: string;
  canal: CanalObservatorio;
  origem: string;
  status: StatusRodada;
  janela_inicio: string | null;
  janela_fim: string | null;
  iniciado_em: string;
  concluido_em: string | null;
  resumo: string | null;
  diagnostico: Record<string, Json>;
}

export interface NormalizedFonte {
  dominio: string;
  nome: string;
  tipo: TipoFonte;
  notas: string | null;
}

export interface NormalizedMateria {
  url_canonica: string;
  titulo: string;
  resumo: string;
  idioma: string;
  formato: FormatoMateria;
  status_verificacao: StatusVerificacaoMateria;
  revisao_por_pares: boolean | null;
  publicado_em: string | null;
  coletado_em: string;
  metadados: Record<string, Json>;
}

export interface NormalizedEvento {
  chave: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaEvento;
  data_evento: string | null;
  data_evento_precisao: PrecisaoDataEvento;
  status_verificacao: StatusVerificacaoEvento;
  status_sanitizacao: StatusSanitizacao;
  dados: Record<string, Json>;
}

export interface NormalizedItem {
  fonte: NormalizedFonte;
  materia: NormalizedMateria;
  eventos: Array<{ evento: NormalizedEvento; papel: PapelMateriaEvento }>;
}

export interface NormalizedRelacao {
  evento_origem_chave: string;
  evento_destino_chave: string;
  tipo: TipoRelacao;
  evidencia_status: StatusEvidencia;
  justificativa: string;
  confianca: number | null;
  revisao: StatusRevisaoRelacao;
  base_causal: string | null;
  evidencias: Array<{
    materia_url_canonica: string;
    papel: PapelEvidencia;
    justificativa: string | null;
  }>;
}

export interface NormalizedLote {
  rodada: NormalizedRodada;
  itens: NormalizedItem[];
  relacoes: NormalizedRelacao[];
}

function fail(path: string, message: string): never {
  throw new ObservatorioValidationError([{ path, message }]);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(path, "Objeto esperado.");
  }
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, path: string, max = 4_000): string {
  if (typeof value !== "string" || !value.trim()) {
    fail(path, "Texto obrigatorio.");
  }
  const result = value.trim();
  if (result.length > max) {
    fail(path, `Texto excede ${max} caracteres.`);
  }
  return result;
}

function nullableString(value: unknown, path: string, max = 4_000): string | null {
  if (value === undefined || value === null || value === "") return null;
  return stringValue(value, path, max);
}

function enumValue<const Values extends readonly string[]>(
  value: unknown,
  values: Values,
  path: string
): Values[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    fail(path, `Valor invalido. Permitidos: ${values.join(", ")}.`);
  }
  return value as Values[number];
}

function optionalTimestamp(value: unknown, path: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" && !(value instanceof Date)) {
    fail(path, "Data/hora invalida.");
  }
  return normalizeTimestamp(value, path);
}

function jsonRecord(value: unknown, path: string): Record<string, Json> {
  if (value === undefined) return {};
  const candidate = record(value, path);
  try {
    JSON.stringify(candidate);
  } catch {
    fail(path, "Metadados precisam ser serializaveis em JSON.");
  }
  return candidate as Record<string, Json>;
}

function normalizeEventKey(value: unknown, path: string): string {
  const key = slugify(stringValue(value, path, 180));
  if (!key) fail(path, "Chave de evento invalida.");
  return key;
}

function normalizeAcademicStatus(
  format: FormatoMateria,
  rawStatus: unknown,
  path: string
): boolean | null {
  const status = rawStatus === undefined
    ? (format === "paper" ? "desconhecido" : "nao_aplicavel")
    : enumValue(rawStatus, STATUS_ACADEMICO, path) as StatusAcademico;

  if (format !== "paper" && status !== "nao_aplicavel") {
    fail(path, "Status academico so pode ser usado em publicacao cientifica.");
  }

  if (status === "revisado_por_pares") return true;
  if (status === "preprint") return false;
  return null;
}

function collectIssue(error: unknown, fallbackPath: string): ValidationIssue[] {
  if (error instanceof ObservatorioValidationError) return error.issues;
  return [{ path: fallbackPath, message: "Valor invalido." }];
}

export function validateAndNormalizeBatch(input: unknown): NormalizedLote {
  const issues: ValidationIssue[] = [];
  let root: Record<string, unknown>;

  try {
    root = record(input, "lote");
  } catch (error) {
    throw new ObservatorioValidationError(collectIssue(error, "lote"));
  }

  let rodada: NormalizedRodada | undefined;
  try {
    const raw = record(root.rodada, "rodada");
    const canal = enumValue(raw.canal, CANAIS, "rodada.canal") as CanalObservatorio;
    const iniciadoEm = optionalTimestamp(raw.iniciadoEm, "rodada.iniciadoEm");
    if (!iniciadoEm) fail("rodada.iniciadoEm", "Data/hora obrigatoria.");
    const runKey = raw.runKey === undefined
      ? buildRunKey(canal, iniciadoEm)
      : normalizeEventKey(raw.runKey, "rodada.runKey");
    const janelaInicio = optionalTimestamp(raw.janelaInicio, "rodada.janelaInicio");
    const janelaFim = optionalTimestamp(raw.janelaFim, "rodada.janelaFim");
    if (janelaInicio && janelaFim && janelaInicio > janelaFim) {
      fail("rodada.janelaFim", "Fim da janela anterior ao inicio.");
    }

    rodada = {
      run_key: runKey,
      canal,
      origem: stringValue(raw.origem, "rodada.origem", 120),
      status: (raw.status === undefined
        ? "concluida"
        : enumValue(raw.status, STATUS_RODADA, "rodada.status")) as StatusRodada,
      janela_inicio: janelaInicio,
      janela_fim: janelaFim,
      iniciado_em: iniciadoEm,
      concluido_em: optionalTimestamp(raw.concluidoEm, "rodada.concluidoEm"),
      resumo: nullableString(raw.resumo, "rodada.resumo", 8_000),
      diagnostico: jsonRecord(raw.diagnostico, "rodada.diagnostico"),
    };
  } catch (error) {
    issues.push(...collectIssue(error, "rodada"));
  }

  const itens: NormalizedItem[] = [];
  if (!Array.isArray(root.itens) || root.itens.length === 0) {
    issues.push({ path: "itens", message: "Informe ao menos uma materia." });
  } else {
    root.itens.forEach((rawItem, itemIndex) => {
      const base = `itens.${itemIndex}`;
      try {
        const item = record(rawItem, base);
        const rawFonte = record(item.fonte, `${base}.fonte`);
        const rawMateria = record(item.materia, `${base}.materia`);
        const canonicalUrl = canonicalizeUrl(
          stringValue(rawMateria.url, `${base}.materia.url`, 8_000)
        );
        const collectedAt = optionalTimestamp(
          rawMateria.coletadoEm,
          `${base}.materia.coletadoEm`
        );
        if (!collectedAt) {
          fail(`${base}.materia.coletadoEm`, "Data de coleta obrigatoria.");
        }
        const publishedAt = optionalTimestamp(
          rawMateria.publicadoEm,
          `${base}.materia.publicadoEm`
        );
        if (publishedAt && publishedAt > collectedAt) {
          fail(`${base}.materia.publicadoEm`, "Publicacao nao pode ocorrer depois da coleta.");
        }
        const format = enumValue(
          rawMateria.formato,
          FORMATOS,
          `${base}.materia.formato`
        ) as FormatoMateria;

        if (!Array.isArray(item.eventos) || item.eventos.length === 0) {
          fail(`${base}.eventos`, "A materia precisa relatar ao menos um acontecimento.");
        }

        const eventos = item.eventos.map((rawLink, eventIndex) => {
          const linkPath = `${base}.eventos.${eventIndex}`;
          const link = record(rawLink, linkPath);
          const rawEvent = record(link.evento, `${linkPath}.evento`);
          const eventDate = optionalTimestamp(
            rawEvent.dataEvento,
            `${linkPath}.evento.dataEvento`
          );
          const title = stringValue(rawEvent.titulo, `${linkPath}.evento.titulo`, 500);
          const category = enumValue(
            rawEvent.categoria,
            CATEGORIAS,
            `${linkPath}.evento.categoria`
          ) as CategoriaEvento;
          const key = rawEvent.chave === undefined
            ? buildEventKey({ titulo: title, categoria: category, dataEvento: eventDate })
            : normalizeEventKey(rawEvent.chave, `${linkPath}.evento.chave`);

          return {
            papel: enumValue(
              link.papel,
              PAPEIS_VINCULO,
              `${linkPath}.papel`
            ) as PapelMateriaEvento,
            evento: {
              chave: key,
              titulo: title,
              descricao: stringValue(rawEvent.descricao, `${linkPath}.evento.descricao`, 8_000),
              categoria: category,
              data_evento: eventDate,
              data_evento_precisao: (rawEvent.dataEventoPrecisao === undefined
                ? (eventDate ? "estimada" : "desconhecida")
                : enumValue(rawEvent.dataEventoPrecisao, PRECISOES, `${linkPath}.evento.dataEventoPrecisao`)) as PrecisaoDataEvento,
              status_verificacao: (rawEvent.statusVerificacao === undefined
                ? "pendente"
                : enumValue(rawEvent.statusVerificacao, STATUS_EVENTO, `${linkPath}.evento.statusVerificacao`)) as StatusVerificacaoEvento,
              status_sanitizacao: (rawEvent.statusSanitizacao === undefined
                ? "bruto"
                : enumValue(rawEvent.statusSanitizacao, STATUS_SANITIZACAO, `${linkPath}.evento.statusSanitizacao`)) as StatusSanitizacao,
              dados: jsonRecord(rawEvent.dados, `${linkPath}.evento.dados`),
            },
          };
        });

        itens.push({
          fonte: {
            dominio: domainFromCanonicalUrl(canonicalUrl),
            nome: stringValue(rawFonte.nome, `${base}.fonte.nome`, 300),
            tipo: enumValue(rawFonte.tipo, TIPOS_FONTE, `${base}.fonte.tipo`) as TipoFonte,
            notas: nullableString(rawFonte.notas, `${base}.fonte.notas`, 4_000),
          },
          materia: {
            url_canonica: canonicalUrl,
            titulo: stringValue(rawMateria.titulo, `${base}.materia.titulo`, 1_000),
            resumo: stringValue(rawMateria.resumo, `${base}.materia.resumo`, 12_000),
            idioma: rawMateria.idioma === undefined
              ? "pt"
              : stringValue(rawMateria.idioma, `${base}.materia.idioma`, 16).toLowerCase(),
            formato: format,
            status_verificacao: (rawMateria.statusVerificacao === undefined
              ? "pendente"
              : enumValue(rawMateria.statusVerificacao, STATUS_MATERIA, `${base}.materia.statusVerificacao`)) as StatusVerificacaoMateria,
            revisao_por_pares: normalizeAcademicStatus(
              format,
              rawMateria.statusAcademico,
              `${base}.materia.statusAcademico`
            ),
            publicado_em: publishedAt,
            coletado_em: collectedAt,
            metadados: jsonRecord(rawMateria.metadados, `${base}.materia.metadados`),
          },
          eventos,
        });
      } catch (error) {
        issues.push(...collectIssue(error, base));
      }
    });
  }

  const relacoes: NormalizedRelacao[] = [];
  if (root.relacoes !== undefined && !Array.isArray(root.relacoes)) {
    issues.push({ path: "relacoes", message: "Lista de relacoes invalida." });
  } else if (Array.isArray(root.relacoes)) {
    root.relacoes.forEach((rawRelation, relationIndex) => {
      const base = `relacoes.${relationIndex}`;
      try {
        const relation = record(rawRelation, base);
        const originKey = normalizeEventKey(relation.eventoOrigemChave, `${base}.eventoOrigemChave`);
        const targetKey = normalizeEventKey(relation.eventoDestinoChave, `${base}.eventoDestinoChave`);
        if (originKey === targetKey) {
          fail(base, "Uma relacao nao pode ligar o evento a ele mesmo.");
        }
        const type = enumValue(relation.tipo, TIPOS_RELACAO, `${base}.tipo`) as TipoRelacao;
        const evidenceStatus = enumValue(
          relation.evidenciaStatus,
          STATUS_EVIDENCIA,
          `${base}.evidenciaStatus`
        ) as StatusEvidencia;
        const causalBasis = nullableString(relation.baseCausal, `${base}.baseCausal`, 8_000);
        if (type === "causal_comprovada" &&
            (evidenceStatus !== "confirmado" || !causalBasis)) {
          fail(base, "Causalidade comprovada exige evidencia confirmada e base causal explicita.");
        }
        if (!Array.isArray(relation.evidencias) || relation.evidencias.length === 0) {
          fail(`${base}.evidencias`, "A relacao precisa de ao menos uma evidencia rastreavel.");
        }
        if (type === "causal_comprovada" &&
            !relation.evidencias.some((rawEvidence) =>
              record(rawEvidence, `${base}.evidencias`).papel === "apoia"
            )) {
          fail(`${base}.evidencias`, "Causalidade comprovada exige evidencia que apoie o vinculo.");
        }
        const confidence = relation.confianca === undefined || relation.confianca === null
          ? null
          : Number(relation.confianca);
        if (confidence !== null &&
            (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)) {
          fail(`${base}.confianca`, "Confianca deve estar entre 0 e 1.");
        }

        relacoes.push({
          evento_origem_chave: originKey,
          evento_destino_chave: targetKey,
          tipo: type,
          evidencia_status: evidenceStatus,
          justificativa: stringValue(relation.justificativa, `${base}.justificativa`, 8_000),
          confianca: confidence,
          revisao: (relation.revisao === undefined
            ? "pendente"
            : enumValue(relation.revisao, STATUS_REVISAO, `${base}.revisao`)) as StatusRevisaoRelacao,
          base_causal: causalBasis,
          evidencias: relation.evidencias.map((rawEvidence, evidenceIndex) => {
            const evidencePath = `${base}.evidencias.${evidenceIndex}`;
            const evidence = record(rawEvidence, evidencePath);
            return {
              materia_url_canonica: canonicalizeUrl(
                stringValue(evidence.materiaUrl, `${evidencePath}.materiaUrl`, 8_000)
              ),
              papel: enumValue(evidence.papel, PAPEIS_EVIDENCIA, `${evidencePath}.papel`) as PapelEvidencia,
              justificativa: nullableString(evidence.justificativa, `${evidencePath}.justificativa`, 8_000),
            };
          }),
        });
      } catch (error) {
        issues.push(...collectIssue(error, base));
      }
    });
  }

  if (issues.length > 0 || !rodada) {
    throw new ObservatorioValidationError(issues.length > 0
      ? issues
      : [{ path: "rodada", message: "Rodada invalida." }]);
  }

  return { rodada, itens, relacoes };
}

export function typedBatch(input: LoteIngestaoInput): LoteIngestaoInput {
  return input;
}
