# Camini Observatório — Marco B1.2

## Parecer

**APROVADO COM RESSALVAS.** O endurecimento foi aplicado e testado no HML,
mas a promoção depende do replay limpo no GitHub Actions, de um teste com
usuário editorial sintético autenticado e de aprovação humana explícita.

Produção `xywherqsudwsredplxmd` permaneceu somente em leitura; HML é
`hrpathjcxyzzwxgkhwnt`.

## Implementação

### Auditoria append-only

`20261020195125_observatorio_b1_2_aprovacao_append_only.sql` adiciona:

- bloqueio `BEFORE UPDATE OR DELETE` em `observatorio_decisoes_historico` e
  `observatorio_aprovacoes_editoriais`;
- revogação de `UPDATE`/`DELETE` de `service_role` na auditoria e de `UPDATE`
  na sequência de identidade;
- exceção break-glass somente com `observatorio.emergency_override=approved`.

Superusuário/owner do banco continua podendo desabilitar triggers ou alterar
privilégios. Qualquer exceção deve ser aberta como incidente, executada por DBA,
registrada e revisada; não faz parte do fluxo de aplicação.

### Aprovação editorial

`observatorio_aprovar_relacao(uuid,text,text)` é separada da ingestão. Ela:

1. exige `auth.uid()` de uma sessão autenticada;
2. consulta `observatorio_aprovadores`, allowlist privada provisionada pelo
   backend a partir das permissões efetivas do Camini;
3. grava identidade, e-mail, timestamp, decisão e justificativa;
4. atualiza a relação somente após registrar a aprovação;
5. só permite `confirmar_causalidade` para `influencia_alegada` com evidência
   `apoia`.

`service_role` não tem `EXECUTE`; apenas `authenticated` tem. Assim, uma
credencial de coleta não simula aprovação editorial. O teste administrativo sem
sessão retornou `42501`.

## Migrations e checksums

O manifesto completo está em
[observatorio-marco-b1-2-manifest.json](C:\projects\camini\docs\observatorio-marco-b1-2-manifest.json).

Migrations novas:

- `20261020195125_observatorio_b1_2_aprovacao_append_only.sql`
- `20261020195308_observatorio_b1_2_index_aprovacoes.sql`
- `20261020195525_observatorio_b1_2_restrict_collection_writer.sql`
- `20261020195803_observatorio_b1_2_revoke_trigger_exec.sql`

O segundo arquivo corrige o único achado novo de performance: FK de
`observatorio_aprovacoes_editoriais.relacao_id` sem índice. Após sua aplicação,
o advisor não reporta FK sem cobertura; permanecem apenas índices não usados em
HML recém-criado.

HML registra oito migrations do Observatório, com versões remotas atribuídas
por horário de aplicação. Produção registra o baseline do Observatório e as
migrations Radar; o baseline não será reaplicado.

A migration `restrict_collection_writer` adiciona uma trava `BEFORE UPDATE` em
relações: escrita direta sem contexto de ingestão ou aprovação autenticada
falha com `42501`. A credencial de coleta também não possui `INSERT` na tabela
de aprovações.

## Replay limpo

Foi preparado o workflow
[observatorio-replay.yml](C:\projects\camini\.github\workflows\observatorio-replay.yml),
com PostgreSQL 17 efêmero no GitHub Actions. Ele cria roles/schema mínimos,
aplica as oito migrations do Observatório, verifica RLS/grants/funções e
executa fixture sintética concorrente para validar idempotência e auditoria.

O workflow foi preparado, mas **não foi executado neste ambiente**.

Os auxiliares `SECURITY DEFINER` dos triggers tiveram `EXECUTE` revogado para
`public`, `anon`, `authenticated` e `service_role`. O único `SECURITY DEFINER`
exposto intencionalmente é a aprovação editorial, restrita a `authenticated` e
protegida por `auth.uid()` e allowlist.

## Evidências executadas no HML

- ingestão `hml-b1-2-audit-fixture` criou evento sintético e registrou `INSERT`
  na auditoria com `run_key` correto;
- `UPDATE` direto na auditoria falhou com `42501`;
- `DELETE` direto na auditoria falhou com `42501`;
- `service_update=false`, `service_delete=false`,
  `service_approval=false`, `service_approval_insert=false`,
  `authenticated_approval=true`;
- UPDATE direto de uma relação sem contexto controlado falhou com `42501`;
- INSERT direto de aprovação sob `SET ROLE service_role` falhou por permissão;
- aprovação sem sessão falhou com `42501`;
- fixtures anteriores B1/B1.1 continuaram preservando estados revisados,
  evidências, rollback e idempotência.

## Critérios de aceite

| Critério | Estado |
|---|---|
| Auditoria append-only contra coleta | Aprovado no HML |
| Aprovação separada e identidade via sessão | Estruturalmente aprovado; usuário autenticado sintético pendente |
| Proteção de decisões/evidências | Aprovado no HML |
| Checksums e reconciliação | Aprovado no manifesto |
| Replay limpo PostgreSQL 17 | Preparado, ainda não executado |
| Produção/Radar inalterados | Aprovado |

O Security Advisor final não reporta mais os auxiliares de trigger; permanece
somente o alerta intencional da função de aprovação `SECURITY DEFINER`, exposta
apenas a `authenticated` e protegida por sessão e allowlist.

## Promoção e rollback

Após as ressalvas, promover somente as migrations aditivas listadas no
manifesto, em ordem, com backup/PITR, smoke tests e aprovação explícita. Não
reaplicar `20261020123117_observatorio_camini_grafo_v1` em produção.

Em falha: bloquear ingestões, reverter código, preservar a trilha de auditoria
e restaurar PITR/backup ou aplicar migration compensatória aprovada. Não usar
`DROP` ou `TRUNCATE` automático.
