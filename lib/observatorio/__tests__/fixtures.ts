import type { LoteIngestaoInput } from "../types.ts";

export function inauguralBatchFixture(): LoteIngestaoInput {
  return {
    rodada: {
      runKey: "observatorio-tech-2026-10-20-fixture",
      canal: "tech",
      origem: "fixture_marco_a",
      status: "concluida",
      janelaInicio: "2026-10-19T00:00:00-03:00",
      janelaFim: "2026-10-20T19:00:00-03:00",
      iniciadoEm: "2026-10-20T19:00:00-03:00",
      concluidoEm: "2026-10-20T19:05:00-03:00",
      resumo: "Fixture isolada baseada no contrato remoto do Observatorio.",
    },
    itens: [
      {
        fonte: {
          nome: "Diario Oficial de Exemplo",
          tipo: "oficial",
        },
        materia: {
          url: "https://example.gov.br/noticias/observatorio/?utm_source=teste&id=42#trecho",
          titulo: "Orgao publica conjunto oficial de dados",
          resumo: "Documento oficial descreve a publicacao do conjunto de dados.",
          formato: "documento",
          statusAcademico: "nao_aplicavel",
          statusVerificacao: "checado",
          publicadoEm: "2026-10-20T08:30:00-03:00",
          coletadoEm: "2026-10-20T19:01:00-03:00",
          metadados: { fixture: true },
        },
        eventos: [
          {
            papel: "fonte_primaria",
            evento: {
              chave: "publicacao-dados-oficiais-2026-10-20",
              titulo: "Publicacao de dados oficiais",
              descricao: "O orgao publicou um conjunto de dados documentado.",
              categoria: "tecnologia",
              dataEvento: "2026-10-20T08:00:00-03:00",
              dataEventoPrecisao: "exata",
              statusVerificacao: "verificado",
            },
          },
        ],
      },
      {
        fonte: {
          nome: "Journal of Example Systems",
          tipo: "academico",
        },
        materia: {
          url: "https://journal.example.org/papers/graph-memory/?utm_medium=rss",
          titulo: "Graph memory for longitudinal observatories",
          resumo: "Preprint avalia memoria historica em grafos editoriais.",
          idioma: "en",
          formato: "paper",
          statusAcademico: "preprint",
          statusVerificacao: "checado",
          publicadoEm: "2026-10-19T16:00:00Z",
          coletadoEm: "2026-10-20T19:02:00-03:00",
          metadados: { doi: "10.0000/example" },
        },
        eventos: [
          {
            papel: "cobertura",
            evento: {
              chave: "estudo-grafo-historico-2026-10-20",
              titulo: "Estudo sobre grafo historico",
              descricao: "Um preprint apresentou resultados sobre grafos historicos.",
              categoria: "ciencia",
              dataEvento: "2026-10-20T00:00:00Z",
              dataEventoPrecisao: "dia",
              statusVerificacao: "pendente",
            },
          },
        ],
      },
    ],
    relacoes: [
      {
        eventoOrigemChave: "publicacao-dados-oficiais-2026-10-20",
        eventoDestinoChave: "estudo-grafo-historico-2026-10-20",
        tipo: "correlacionado",
        evidenciaStatus: "correlacionado",
        justificativa: "Os registros compartilham tema, sem afirmacao de causalidade.",
        confianca: 0.55,
        evidencias: [
          {
            materiaUrl: "https://example.gov.br/noticias/observatorio?id=42&utm_campaign=remover",
            papel: "contextualiza",
          },
          {
            materiaUrl: "https://journal.example.org/papers/graph-memory/",
            papel: "apoia",
            justificativa: "O preprint sustenta apenas a correlacao tematica.",
          },
        ],
      },
    ],
  };
}
