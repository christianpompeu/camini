# Observatório B1.2 — correções finais

Aplicado exclusivamente no HML `hrpathjcxyzzwxgkhwnt`; produção `xywherqsudwsredplxmd` foi somente consultada.

## Evidências

- `20261020195900` (HML `20261020202947`) revogou `TRUNCATE` em auditoria e aprovações: `false/false` para `service_role`.
- `20261020195912` (HML `20261020202955`) adicionou `revisao_necessaria`, bloqueou causalidade no INSERT e normalizou relações novas para `hipotese/pendente`.
- `20261020195924` (HML `20261020203156`) fixou `search_path` dos triggers auxiliares.
- `20261020195940` (HML `20261020204158`) corrigiu o trigger de reavaliação para retornar imediatamente por tabela e não acessar colunas incompatíveis.
- `20261020195970` (HML `20261020205634`, registrado remotamente como `..._v2`) criou os papéis NOLOGIN `observatorio_coletor` e `observatorio_ingest_owner`, tornou a ingestão uma RPC `SECURITY DEFINER` de escopo restrito e removeu grants editoriais do `service_role`.
- `20261020195980` (HML `20261020205656`) adicionou políticas RLS somente para o owner da ingestão nas sete tabelas de coleta.

## Isolamento de privilégios

O coletor não recebe `service_role`. O broker confiável deve usar conexão privada,
assumir `observatorio_coletor` e chamar somente `observatorio_ingest_lote(jsonb)`.
Esse papel não possui privilégios de tabela, allowlist, aprovações ou relações.
O owner da função é NOLOGIN, não-superusuário e possui grants apenas nas tabelas
de coleta. O `service_role` perdeu INSERT/UPDATE em `observatorio_aprovadores`,
UPDATE em `observatorio_relacoes` e qualquer acesso direto às aprovações.

O adaptador de backend ainda precisa ser implementado no Camini; até essa
integração, a promoção deve permanecer bloqueada.
- Auditoria antes/depois: 13/13; rodadas: 4; nenhum dado histórico removido.
- Teste transacional com `SET ROLE service_role` e payload reservado retornou `hipotese/pendente`; a transação foi revertida.
- Workflow atualizado para PostgreSQL 17, RLS por tabela, grants, TRUNCATE, duplicidade, rollback e `service_role` com BYPASSRLS. O link de execução informado anteriormente precede estas correções; nova execução é pendência explícita.

## Decisão

Recomendação: não promover ainda. A promoção permanece condicionada a uma nova execução verde do workflow atualizado, aos testes E2E com sessão Auth sintética (aprovador autorizado, revogado, não autorizado e coletor), à reconciliação dos dois registros remotos do nome `observatorio_b1_2_fix_reavaliacao_trigger` e à aprovação humana explícita. Nenhuma migration foi promovida para produção.
