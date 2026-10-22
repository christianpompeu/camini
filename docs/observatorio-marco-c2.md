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
`OBSERVATORIO_NOTION_TOKEN` e o `OBSERVATORIO_NOTION_DATA_SOURCE_ID` foram provisionados
no ambiente server-side seguro (`.env.local`), mantendo `.env.example` documentado:

```text
OBSERVATORIO_NOTION_TOKEN=<provisionar no gerenciador seguro>
OBSERVATORIO_NOTION_DATA_SOURCE_ID=469de5a5-6634-45eb-9d43-9019ac0f46eb
```

A integração interna do Notion opera exclusivamente com permissão de leitura sobre
a base Edições / data source. O token permanece protegido no servidor, sem exposição
em chat, sem uso de conector ChatGPT e sem qualquer prefixo `NEXT_PUBLIC_`.

## Reconciliação e Evidências da Leitura Real

A fila combina páginas Notion com `observatorio_edicoes` do HML usando exclusivamente
o `Supabase ID` declarado no Notion. Nenhuma correspondência é inferida por título
ou data e nenhuma escrita é realizada no Notion, HML ou Produção.

Executada a leitura real com sucesso (`HTTP 200` em `POST /v1/data_sources/469de5a5-6634-45eb-9d43-9019ac0f46eb/query`):

- **Edições retornadas da fonte canônica (Notion):** 6 páginas mapeadas.
- **Tabela `observatorio_edicoes` no HML:** vazia (0 registros).
- **Resultado da reconciliação:** 6 edições em estado `supabase_id_not_found` (todas possuem `Supabase ID` declarado no Notion que ainda não existe no HML).
- **Edição alvo `2026-10-21-panorama-0900-ampliada`:**
  - Identificador: `2026-10-21-panorama-0900-ampliada`
  - Título: `Panorama — 21/10/2026, 09h | Apuração ampliada (19 pautas)`
  - Canal: `panorama`
  - Status no Notion: `aprovada` (original: `Aprovada`)
  - Revisão: `concluida` (original: `Concluída`)
  - Supabase ID declarado: `6052e5f7-fcae-40db-b468-262eda0f1b6b`
  - Estado reconciliado: `supabase_id_not_found` (aguarda sincronização formal/snapshot no HML)
  - Última alteração no Notion: `2026-10-22T11:10:00.000Z`

## Verificação

- TypeScript (`npx tsc --noEmit`): aprovado sem erros;
- ESLint direcionado (`lib/`, `components/`, `app/` do Observatório): aprovado;
- Testes da fundação (`npm run test:observatorio`): 6/6 aprovados;
- Testes do adaptador backend (`npm run test:observatorio-backend`): 3/3 aprovados;
- Build de produção do Next.js 16.3.5 (`npm run build`): aprovado;
- Rotas dinâmicas reconhecidas: `/dashboard/observatorio` e `/dashboard/observatorio/edicoes`;
- Nenhuma migration, escrita HML/Notion, publicação ou acesso à produção.

## Estado

Marco C2 **concluído com sucesso**. A fonte canônica Notion está conectada e reconciliada
de forma estritamente somente leitura com o HML.

Próximos passos (Marco C3 / backlog):
- Sincronização e ingestão de edições do Notion para snapshot formal no Supabase HML;
- Fluxo de aprovação humana e publicação editorial.
