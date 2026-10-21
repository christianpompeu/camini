# Observatorio — fechamento do Marco B

Data: 21/10/2026

HML: `hrpathjcxyzzwxgkhwnt`

Producao: `xywherqsudwsredplxmd` (nenhuma escrita)

## Decisao arquitetural

Foi mantida a RPC transacional `observatorio_ingest_lote(jsonb)` com o owner
restrito `observatorio_ingest_owner`. O backend usa exclusivamente uma chave
secreta server-side para executar essa RPC. Nao foram criados novos papeis,
servicos ou funcoes privilegiadas.

O adaptador exige `OBSERVATORIO_HML_SUPABASE_URL` e
`OBSERVATORIO_HML_SUPABASE_SECRET_KEY`, recusa URLs fora do projeto HML e e
protegido por `server-only`. Nenhuma variavel `NEXT_PUBLIC_*` contem a
credencial de ingestao.

## Entregas

- Migration incremental concede ao owner somente `INSERT` na auditoria e
  `USAGE/SELECT` em sua sequencia, com policy RLS de INSERT.
- `service_role` recebeu apenas `EXECUTE` na RPC de ingestao; seus grants
  editoriais continuam revogados.
- Adaptador valida e normaliza integralmente o lote antes da RPC, valida a
  resposta e registra somente codigo de erro e `run_key`.
- Fixture de reavaliacao passou a criar dados pela RPC; a parte editorial
  administrativa permanece isolada em transacao descartavel.
- Workflow cobre contrato da RPC, escrita direta recusada, concorrencia,
  idempotencia, rollback, preservacao editorial e auditoria append-only.

## Evidencias HML

Fixture: `marco-b-backend-20261021`.

| Prova | Resultado |
|---|---|
| Primeira ingestao | 1 fonte, 1 materia e 1 evento inseridos |
| Reprocessamento | zero insercoes e mesmo `round_id` |
| Persistencia | 1 rodada, 1 fonte, 1 materia e 1 evento |
| Auditoria | 3 registros com o `run_key` da fixture |
| Rollback | erro `23503`; zero rodadas `marco-b-must-rollback` |
| Preservacao editorial | materia `contestado`; evento `verificado/revisado` apos reprocessamento |
| Escrita direta do coletor | `INSERT=false` |
| Auditoria do owner | `INSERT=true`; `UPDATE/DELETE/TRUNCATE=false` |
| Mutacao indevida da auditoria | recusada com `42501` |

Validacao local concluida:

- 6/6 testes da fundacao;
- 3/3 testes do adaptador backend;
- TypeScript sem erros;
- lint direcionado sem erros;
- build de producao do Next.js 16.3.5 concluido.

GitHub Actions concluido com sucesso no commit `2c4cee0`:
<https://github.com/christianpompeu/camini/actions/runs/39523554567>.

Os tipos TypeScript foram regenerados contra HML e incluem a RPC. Os advisors
nao apontaram problema novo desta migration. Permanecem quatro tabelas privadas
com RLS sem policy (intencional) e o alerta preexistente da RPC editorial
`observatorio_aprovar_relacao` acessivel a `authenticated`.

## Fila de refinamentos

### Correcao curta de fechamento

- Executar o adaptador com as duas variaveis secretas no backend autorizado;
  o contrato e a mesma RPC foram provados em HML, mas nenhuma credencial foi
  copiada para o ambiente local.

### Proxima sprint

- E2E de aprovadores com Supabase Auth antes de habilitar aprovacao real.
- Reconciliar as duas versoes remotas historicas da migration de reavaliacao
  antes de qualquer promocao.

### Refinamentos futuros

- Interface editorial e publicacao dos canais.
- Integracoes RSS/APIs e grafo visual definitivo.
- Hardening adicional de infraestrutura e analise de indices apos volume real.

## Parecer

O bloqueio funcional de ingestao e a fundacao tecnica do Marco B estao
resolvidos em HML. O encerramento formal fica condicionado somente a prova do
adaptador usando as credenciais secretas no ambiente de backend. Producao
permanece sem alteracoes e a promocao continua sendo uma decisao humana
separada.

## Bloco para o Br[AI]n

> **Sprint 21/10/2026 — Marco B**
>
> Entregue: cadeia minima de auditoria, adaptador server-only e suite de replay.
>
> Testado: ingestao HML, idempotencia, rollback, auditoria e preservacao editorial.
>
> Pendente curto: execucao do adaptador com secrets do backend.
>
> Adiado: Auth editorial E2E, UI, publicacao, grafo e integracoes externas.
>
> Risco para o proximo passo: nao promover sem reconciliacao de migrations,
> backup/PITR e autorizacao humana.
>
> Proxima entrega: fechar as duas provas pendentes e declarar o Marco B encerrado.
