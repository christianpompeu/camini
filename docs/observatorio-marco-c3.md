# CAMINI OBSERVATÓRIO — Marco C3 — Gate 1

Data da validação: 22/10/2026 (America/Sao_Paulo) / 23/10/2026 UTC  
Ambiente consultado: Supabase HML `hrpathjcxyzzwxgkhwnt` e base editorial do Notion  
Modo: **dry-run estrito**

## Decisão do gate

**GO condicionado para o Gate 2**, limitado a uma única edição candidata e somente após autorização explícita para aplicar a migration proposta e executar um apply controlado.

O Marco C3 **não está encerrado**. Nenhuma migration, RPC ou linha editorial foi criada ou alterada em HML neste gate. Produção, permissões editoriais, aprovação, publicação e Notion permaneceram intocados.

## Resultado real

Foram lidas 7 edições e todos os corpos foram recuperados integralmente, inclusive filhos aninhados e paginação. O planejamento retornou:

- `insert`: 6
- `update`: 0
- `unchanged`: 0
- `conflict`: 1
- `ignored`: 0

| Identificador | Canal | Blocos | Ação | Versão planejada | Hash SHA-256 |
|---|---|---:|---|---:|---|
| `2026-10-22-tech-1900-ampliada` | Tech | 23 | insert | 1 | `5af63ef999515ddeda13a46e3beaa3f70fbadda541727c13ff3f4ed852b3bf6c` |
| `2026-10-22-panorama-0810-profunda` | Panorama | 73 | insert | 1 | `f9c7590884404f5de701e0a4677bf2b16921b8fd4cc1518633487b78615a29ef` |
| `2026-10-21-tech-1900-ampliada` | Tech | 28 | insert | 1 | `ed18da39633a0d5052986a59bf30a9f24813d0766ff94a4921fd8bb4263d0dd8` |
| `2026-10-21-panorama-0900-ampliada` | Panorama | 109 | **conflict** | — | `986d3faaa1b868e04f8e64a02f46dd6776bbcda944da9a69779c19cafa13b39d` |
| `2026-10-20-tech-1900-ampliada` | Tech | 45 | insert | 1 | `9a7eb31382e2db0c34d36d615eada98caee24bbea43ec1855a6c4c3f593f51ec` |
| `2026-10-20-tech-inaugural` | Tech | 29 | insert | 1 | `e19cdb174ec61667e73903a17c4f6546de08a896894fd70f7f28edf8e3f91132` |
| `2026-10-20-panorama-inaugural` | Panorama | 30 | insert | 1 | `3be81cf573e8ac4240b20b2e8bb875ce6cf9201000e75f7f3625d55895fb67ad` |

O conflito `2026-10-21-panorama-0900-ampliada` foi deliberadamente bloqueado por `notion_approved_requires_human_review`. Seu estado declarado como aprovado não será convertido em aprovação no Camini e exige decisão humana separada.

Os sete UUIDs declarados no Notion não existem em HML. Eles foram tratados apenas como sinais de reconciliação (`declared_supabase_id_not_found`) e não foram adotados como identidade de banco.

## Identidade e reconciliação

Identidade estável implementada:

1. `notion_page_id` identifica a página de origem.
2. `identificador` é a chave editorial legível e única.
3. O UUID declarado no Notion só confirma um registro HML já existente; nunca determina o UUID de uma inserção.
4. Divergência entre quaisquer identidades existentes resulta em `conflict`, sem tentativa de correção automática.
5. Estados HML diferentes de `candidata`, ou com aprovação/publicação registrada, são protegidos contra atualização.

Estado HML confirmado após os dois dry-runs:

- `observatorio_edicoes`: 0 linhas;
- `observatorio_decisoes_historico`: 37 linhas preexistentes;
- `observatorio_sync_edicoes(text,jsonb)`: inexistente;
- nenhuma reconciliação material foi executada.

## Contrato de snapshot

Cada snapshot versão 1 contém:

- origem: page ID, URL estável e `lastEditedTime` do Notion;
- metadados editoriais: identificador, canal, título, resumo, datas, status/revisão originais, slug e UUID declarado;
- corpo completo: árvore de blocos com `id`, `type`, dados canônicos e filhos;
- `content.complete: true`;
- `contentHash`: SHA-256 do conteúdo canônico.

O leitor percorre todas as páginas de resultados e todos os filhos recursivamente. Tipo desconhecido, bloco `unsupported`, paginação incompleta, payload inválido ou limite excedido invalida a edição inteira; não há snapshot parcial. URLs temporárias acompanhadas por `expiry_time` são removidas do conteúdo canônico. O horário de coleta e `lastEditedTime` não participam do hash, evitando versões artificiais.

## Versionamento, idempotência e concorrência

- Inserção nova: versão 1 e status HML sempre `candidata`.
- Mesmo hash e mesmos campos: `unchanged`, sem incremento.
- Mudança material em candidata existente: versão atual + 1.
- Snapshot mais antigo que o armazenado: conflito.
- O apply proposto exige exatamente uma edição, `run_key`, versão e hash anteriores.
- A função proposta usa advisory transaction lock por identificador e `SELECT ... FOR UPDATE` em atualização.
- Qualquer precondição inválida aborta a transação completa.

Os dois dry-runs reais, executados às `01:29:50Z` e `01:30:02Z`, retornaram os mesmos 7 hashes, contagens e ações. Isso valida o determinismo na fonte observada.

## Auditoria e DDL proposta — não aplicada

Arquivo local: `supabase/migrations/20261023012749_observatorio_c3_sync_editorial.sql`.

A proposta adiciona:

- trigger append-only de INSERT/UPDATE de `observatorio_edicoes` para `observatorio_decisoes_historico`;
- RPC `observatorio_sync_edicoes(text,jsonb)` restrita a `service_role`;
- lote obrigatório de uma edição, validação do contrato, proteção de identidade/estado, lock e precondições otimistas;
- preservação de `status`, `aprovada_em` e `publicada_em` em updates.

A migration existe apenas no workspace. Não foi aplicada a HML. A assinatura adicionada em `lib/supabase/database.types.ts` é igualmente prospectiva e só deverá representar o remoto depois de autorização e aplicação da migration.

## Arquivos implementados

- `lib/observatorio/editorial.ts`: expõe a leitura pública já autorizada.
- `lib/observatorio/editorial-snapshot.ts`: leitura integral, normalização e hash.
- `lib/observatorio/editorial-sync.ts`: reconciliação, plano dry-run e apply unitário protegido.
- `scripts/observatorio-sync-editorial.ts`: CLI; padrão obrigatório é dry-run.
- `lib/observatorio/__tests__/editorial-sync.test.ts`: testes do planejador e das garantias da migration.
- `supabase/migrations/20261023012749_observatorio_c3_sync_editorial.sql`: DDL proposta, não aplicada.
- `lib/supabase/database.types.ts` e `package.json`: tipo prospectivo e comandos de operação/teste.

O arquivo `docs/observatorio-marco-c2.md`, já modificado antes deste trabalho, foi preservado como histórico e não faz parte da implementação C3.

## Evidências de verificação

- `npm run test:observatorio-c3`: 9/9 testes aprovados.
- `npm run test:observatorio`: 6/6 testes aprovados.
- `npm run test:observatorio-backend`: 3/3 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- ESLint dirigido aos cinco arquivos TypeScript C3: aprovado.
- `npm run build`: aprovado; 82 páginas geradas e rotas do Observatório compiladas.
- `git diff --check`: aprovado.
- Dry-run real executado duas vezes: 7/7 snapshots completos; resultados idênticos.
- Consulta HML posterior: 0 edições e RPC C3 ausente.

Os testes cobrem hash canônico, identidade não confiável, conflito de aprovado, replay idempotente, incremento unitário, colisões, snapshot incompleto, proteção de estado, fonte obsoleta e garantias estáticas da migration.

## Riscos e condição para o Gate 2

Riscos residuais:

- a migration ainda não foi validada por execução em um banco descartável compatível nem aplicada em HML;
- o primeiro apply real ainda precisa comprovar a criação da linha e do evento de auditoria na mesma transação;
- a edição aprovada permanece deliberadamente fora do fluxo automático;
- mídias hospedadas pelo Notion têm URLs temporárias removidas; eventual persistência binária é trabalho separado e não deve ser inferida deste snapshot.

Para o Gate 2, a candidata recomendada é `2026-10-22-tech-1900-ampliada`, por ser a edição mais recente e ter o menor corpo (23 blocos). Sequência proposta: revisar/aplicar a única migration em HML, repetir o dry-run, aplicar somente essa edição com `run_key` único, verificar linha + auditoria + replay idempotente. Falha durante a RPC faz rollback transacional; após commit, qualquer compensação exige nova decisão explícita e deve preservar a trilha histórica.

**Parecer final do Gate 1: GO condicionado. Aguardando revisão e autorização explícita; nenhum apply foi executado.**
