# Observatório — Marco B1 em HML

Data da execução: 20/10/2026  
Projeto HML: `camini-observatorio-hml` (`hrpathjcxyzzwxgkhwnt`)  
Produção auditada, sem escrita: `xywherqsudwsredplxmd`

## Estratégia de migrations

- O HML foi confirmado ativo, vazio e sem migrations antes da intervenção.
- O histórico de produção foi preservado: quatro migrations do Radar e o
  baseline `observatorio_camini_grafo_v1` (`20261020123117`).
- No HML foram aplicados somente o baseline do Observatório e a migration
  aditiva `observatorio_b1_rpc_indices`. Nenhuma migration do Radar foi
  aplicada ao HML.
- O endpoint de aplicação registra versões remotas pelo instante de execução;
  no HML os nomes semânticos ficaram registrados como
  `observatorio_camini_grafo_v1` e `observatorio_b1_rpc_indices` (versões
  remotas `20261020190046` e `20261020190052`). Os arquivos versionados no
  repositório continuam sendo a fonte canônica. Antes de promover, a equipe
  deve reconciliar a versão/hash no pipeline de migration e obter aprovação
  explícita.

## Schema e RPC

O baseline reproduz as dez tabelas `observatorio_*`, constraints, RLS e grants
privados do Marco A. A migration B1 adiciona apenas:

- seis índices de FKs/joins: `obs_edicao_rodada_idx`,
  `obs_evento_canonico_idx`, `obs_evento_materia_materia_idx`,
  `obs_mat_fonte_idx`, `obs_rel_evid_materia_idx` e `obs_tend_evento_idx`;
- `public.observatorio_ingest_lote(jsonb)`, `SECURITY INVOKER`, com upserts
  idempotentes em uma única transação, validação de referências e rollback por
  exceção;
- execução revogada de `public`, `anon` e `authenticated`, concedida somente
  a `service_role`.

Não foi usado Docker nem chave privilegiada em cliente. O SQL foi executado
por ferramenta administrativa do Supabase; não há credenciais no repositório.

## Evidências no banco HML

Fixture exclusivamente sintética (`*.example`, sem URLs ou dados de produção):

- primeira chamada RPC: 1 fonte, 2 matérias, 2 eventos, 1 relação e 1
  evidência; `run_key=hml-b1-sintetico-20261020`;
- duas chamadas concorrentes com a mesma carga retornaram `inserted=0` e os
  totais permaneceram: 1 rodada, 1 fonte, 2 matérias, 2 eventos, 2 vínculos,
  1 relação e 1 evidência;
- repetição sequencial é idempotente pelos mesmos conflitos únicos;
- carga de rollback com evento de destino inexistente falhou com `23503` e
  deixou `0` rodada/0 fonte da carga inválida; o total válido continuou 1;
- todas as 10 tabelas têm RLS habilitado e `anon_select=false`/
  `authenticated_select=false`;
- a RPC confirmou `security_definer=false`, execução anônima/autenticada
  negada e execução de `service_role` permitida;
- `supabase_get_advisors` reportou somente o achado esperado
  `rls_enabled_no_policy` nas 10 tabelas privadas e índices ainda não usados
  (HML recém-criado), sem objetos do Radar.

## Verificações locais

O código do Marco A continua passando nos testes de ingestão, TypeScript e
build já registrados no relatório do Marco A. A validação funcional adicional
deste marco foi feita no banco HML real acima; o Docker local permaneceu
indisponível e não foi necessário para a validação.

## Plano de promoção HML → produção (somente após aprovação)

1. Congelar a migration B1 e registrar checksum; confirmar que a produção não
   recebeu qualquer alteração desde a auditoria.
2. Fazer backup/PITR e medir contagens/checksums das tabelas existentes. Aplicar
   somente o baseline já presente e a migration B1 aditiva, nunca reexecutar o
   histórico Radar.
3. Executar smoke tests de RPC, privilégios, RLS e contagens antes de qualquer
   publicação. O Observatório permanece não publicado até aprovação editorial.
4. Rollback de código: reverter o deploy para a versão anterior. Rollback de
   banco: restaurar PITR/backup ou executar uma migration de compensação
   aprovada; não apagar dados existentes nem fazer `DROP` destrutivo como parte
   automática do deploy.
5. Em caso de falha parcial, bloquear novas chamadas, preservar as tabelas e
   registros já existentes, investigar os `run_key`s e só então decidir entre
   retry idempotente ou restauração. Nenhuma promoção foi executada neste
   marco.
