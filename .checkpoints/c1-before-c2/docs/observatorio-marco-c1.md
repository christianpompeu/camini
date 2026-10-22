# Observatório — Marco C1

## Entrega

Implementada a primeira fila editorial privada, somente leitura:

- `/dashboard/observatorio`: indicadores do HML e estado da fonte canônica;
- `/dashboard/observatorio/edicoes`: filtros por canal/status e listagem cronológica;
- `lib/observatorio/editorial.ts`: leitura tipada server-only do HML;
- autorização reutilizada por `assertObservatorioAccess()` antes de qualquer consulta;
- navegação adicionada ao dashboard existente.

Não há botões ou ações de aprovação, rejeição ou publicação.

## Dados e reconciliação

O HML é consultado exclusivamente por `OBSERVATORIO_HML_SUPABASE_URL` e
`OBSERVATORIO_HML_SUPABASE_SECRET_KEY`, nunca pela configuração pública global.
A tabela `observatorio_edicoes` está vazia, portanto a fila exibe estado vazio
real e não cria fixtures de produção.

Não existe integração Notion autorizada nem credencial `NOTION_*` disponível no
projeto. A interface informa explicitamente que a reconciliação está
indisponível; nenhum status do Notion foi inferido ou alterado. A divergência
editorial de `2026-10-21-panorama-0900-ampliada` permanece pendente de leitura
autorizada da fonte canônica.

## Verificação

- `npx tsc --noEmit`: aprovado;
- ESLint direcionado: aprovado;
- `npm run test:observatorio`: 6/6 aprovados;
- `npm run test:observatorio-backend`: 3/3 aprovados;
- `npm run build`: aprovado; ambas as rotas foram reconhecidas como dinâmicas.

Produção não foi consultada nem alterada. Nenhuma migration foi criada.

## Estado e próxima etapa

Sprint C1: **entregue com dependência operacional não bloqueante** (credencial
Notion server-side). C2 deve conectar a leitura autorizada do Notion e executar
a reconciliação somente leitura, preservando a separação entre “Aprovada no
Notion” e snapshot aprovado/publicável no Supabase.

Refinamentos mantidos no backlog: aprovação humana, publicação, sincronização
Notion → Supabase, E2E Auth editorial, grafo e rotas públicas.
