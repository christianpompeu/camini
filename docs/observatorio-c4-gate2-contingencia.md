# Observatório C4 — contingência de implantação

Este procedimento é para a migration local `20261023150000_observatorio_c4_gate2_decisao_editorial.sql`. A aplicação deve ser autorizada separadamente; nenhum passo abaixo aplica SQL por conta própria.

## Pré-condições

- backup/verificação independente do schema e das tabelas `observatorio_edicoes` e `observatorio_decisoes_historico`;
- confirmação do banco-alvo isolado e da versão exata das migrations C3 e C4;
- extensão `pgcrypto` disponível (a migration a declara em `extensions`);
- papéis `anon`, `authenticated`, `service_role` e funções Auth existentes;
- nenhum usuário Auth, registro de allowlist ou edição real criado por este procedimento;
- plano de duas sessões e uma janela de interrupção aprovados.

## Aplicação e verificações

Aplicar em uma única transação controlada pelo migrator. Se qualquer DDL, função, grant, índice ou trigger falhar, interromper e fazer rollback da transação inteira; não prosseguir com decisões humanas.

Após commit, verificar: existência e assinatura das funções; `prosecdef`, `search_path` e grants; RLS e políticas; índices únicos; trigger histórico; digest dos dois vetores; privilégios dos três papéis; e uma fixture descartável com C3. Executar o plano `scripts/observatorio-c4-gate2-test-plan.sql` apenas no banco isolado. A homologação concorrente real permanece pendente de autorização.

## Falha antes do commit

Não há histórico humano para descartar: a transação deve ser abortada. Confirmar que não restaram coluna, tabela, função, grant ou trigger parcial e restaurar a definição/grants anteriores do C3 somente se o mecanismo de migração não tiver revertido automaticamente.

## Falha depois do commit

Não executar `DROP`, `TRUNCATE` ou restauração genérica de snapshots. Preservar decisões e `observatorio_decisoes_historico`. Suspender novas decisões, registrar SQLSTATE e evidência, e corrigir por migration compensatória revisada. Se for indispensável restaurar a definição original do C3, fazê-lo em migration transacional, mantendo a tabela de decisões, a trilha histórica e os `run_key`; revalidar os grants antes de reabrir o fluxo.

Uma decisão já persistida não é desfeita por rollback de schema. Qualquer compensação editorial exige nova decisão explícita e mantém a decisão original, seu snapshot, ator, hash, chave de idempotência e histórico.

## Critérios de interrupção

Interromper se o alvo não for confirmado, se um vetor JS/SQL divergir, se algum papel adquirir mutação direta indevida, se o trigger gravar `postgres` para C3/C4, se a revogação não serializar com a decisão, se o hash adulterado for aceito, ou se o plano precisar tocar alguma das seis edições reais.
