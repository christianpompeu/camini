# Observatório — Marco C2

## Implementação

`lib/observatorio/editorial.ts` agora consulta a API oficial do Notion em
`POST /v1/data_sources/{data_source_id}/query`, usando `Notion-Version:
2026-03-11`, paginação por cursor e limite de 100 páginas por requisição. A
consulta é server-only, sem dependência do conector Notion do ChatGPT e sem
qualquer endpoint público privilegiado.

As páginas são mapeadas para Edição, Canal, Identificador, Data, Status,
Revisão, Resumo, Slug, Supabase ID, URL, page ID e última alteração. Respostas
inválidas, HTTP 401/403/429/5xx e indisponibilidade retornam estado explícito
sem expor o token.

## Configuração

O mecanismo existente é `.env.local`, carregado pelo Next.js no servidor. O
projeto não possui `OBSERVATORIO_NOTION_TOKEN` configurado; o data source ID já
fica documentado em `.env.example`:

```text
OBSERVATORIO_NOTION_TOKEN=<provisionar no gerenciador seguro>
OBSERVATORIO_NOTION_DATA_SOURCE_ID=469de5a5-6634-45eb-9d43-9019ac0f46eb
```

Para habilitar a leitura real, criar uma integração interna no workspace
Notion, conceder apenas capacidade de leitura à base Edições/data source e
provisionar o token exclusivamente no ambiente server-side. Não enviar o
token por chat, não usar o conector do ChatGPT e não adicionar `NEXT_PUBLIC_`.

## Reconciliação

A fila combina páginas Notion com `observatorio_edicoes` do HML usando somente
o `Supabase ID` declarado no Notion. Estados possíveis: somente no Notion,
somente no HML, correspondência confirmada, ID não encontrado, divergência de
status e informação insuficiente. Nenhuma correspondência é inferida por
título ou data e nenhuma escrita é realizada.

Com a configuração atual, a leitura real do Notion permanece bloqueada pela
ausência do token. O HML continua sendo consultado exclusivamente por
`OBSERVATORIO_HML_SUPABASE_URL` e `OBSERVATORIO_HML_SUPABASE_SECRET_KEY`.

## Verificação

- TypeScript: aprovado;
- ESLint direcionado: aprovado;
- build Next.js: aprovado;
- rotas dinâmicas reconhecidas: `/dashboard/observatorio` e
  `/dashboard/observatorio/edicoes`;
- nenhuma migration, escrita HML/Notion, publicação ou acesso à produção.

## Estado

C2 está **parcialmente entregue e bloqueada para encerramento** até o token
server-side ser provisionado e uma leitura real da base ser executada. O fluxo
de aprovação, sincronização Notion → Supabase e publicação permanece no
backlog.
