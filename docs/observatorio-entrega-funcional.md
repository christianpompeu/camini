# Observatório — entrega funcional

## Fluxo editorial

O painel privado usa `assertObservatorioAccess()` antes de ler ou mutar dados. A decisão humana chama `observatorio_decidir_edicao(jsonb)`. A publicação chama a RPC separada `observatorio_publicar_edicao(jsonb)`, exige estado `aprovada`, versão/hash atuais, allowlist ativa e chave de idempotência própria.

`Aprovar e publicar` executa as duas RPCs em sequência. A aprovação continua auditada se a publicação falhar; a interface informa esse resultado sem mascarar a operação parcial. Depois da publicação, o painel revalida a fila, o detalhe e as rotas públicas do canal.

A migration proposta é `20261024100000_observatorio_publicacao_editorial.sql`. Ela cria somente a auditoria append-only de publicação e a RPC correspondente. Não foi aplicada remotamente.

Para a primeira publicação HML, é necessário aplicar C4 e a migration de publicação, provisionar o usuário Auth HML e sua allowlist por procedimento administrativo, confirmar a sessão do app contra o projeto HML e homologar primeiro uma edição candidata autorizada. Nenhuma dessas ações é executada por esta entrega.

## Dashboard de inteligência

As rotas privadas são:

- `/dashboard/observatorio`: visão geral, métricas, filtros e linha do tempo;
- `/dashboard/observatorio/noticias`: acontecimentos e matérias;
- `/dashboard/observatorio/grafo`: nós, arestas e painel de contexto;
- `/dashboard/observatorio/tendencias`: tendências persistidas ou estado vazio honesto.

O dashboard lê rodadas, fontes, matérias, acontecimentos, vínculos matéria–acontecimento, relações, evidências, tendências e vínculos tendência–acontecimento do HML server-side. Filtros combináveis cobrem busca, categoria, fonte, tipo de relação, status de evidência e revisão.

O grafo não cria causalidade: `causal_comprovada`, `correlacionado`, `hipotese`, `contestado` e demais estados são exibidos conforme persistidos. A lista de nós é a alternativa acessível ao SVG interativo. Cada matéria mantém o link da fonte original.

As seis edições possuem `rodada_id` nullable no schema atual, mas o dashboard não inventa vínculo entre edição e acontecimento. Qualquer futura ligação precisa vir de proveniência explícita, não de proximidade temporal ou textual.
