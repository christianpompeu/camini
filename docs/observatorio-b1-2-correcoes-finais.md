# Observatório B1.2 — correções finais

Aplicado exclusivamente no HML `hrpathjcxyzzwxgkhwnt`; produção `xywherqsudwsredplxmd` foi somente consultada.

## Evidências

- `20261020195900` (HML `20261020202947`) revogou `TRUNCATE` em auditoria e aprovações: `false/false` para `service_role`.
- `20261020195912` (HML `20261020202955`) adicionou `revisao_necessaria`, bloqueou causalidade no INSERT e normalizou relações novas para `hipotese/pendente`.
- `20261020195924` (HML `20261020203156`) fixou `search_path` dos triggers auxiliares.
- Auditoria antes/depois: 13/13; rodadas: 4; nenhum dado histórico removido.
- Teste transacional com `SET ROLE service_role` e payload reservado retornou `hipotese/pendente`; a transação foi revertida.
- Workflow atualizado para PostgreSQL 17, RLS por tabela, grants, TRUNCATE, duplicidade, rollback e `service_role` com BYPASSRLS. O link de execução informado anteriormente precede estas correções; nova execução é pendência explícita.

## Decisão

Recomendação: não promover ainda. A promoção permanece condicionada a uma nova execução verde do workflow atualizado, aos testes E2E com sessão Auth sintética (aprovador autorizado, revogado, não autorizado e coletor) e aprovação humana explícita. Nenhuma migration foi promovida para produção.
