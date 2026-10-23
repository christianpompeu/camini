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

## Revisão independente do Gate 1

Correções aplicadas localmente após a revisão:

1. O planejador agora aceita somente `statusOriginal` explicitamente igual a `Candidata` (comparação trim/case-insensitive). `Aprovada`, `Publicada`, `Rejeitada`, `Arquivada`, ausente e desconhecido são conflitos; o caso aprovado preserva `notion_approved_requires_human_review`.
2. A RPC proposta passou a usar `IS DISTINCT FROM` nas verificações anuláveis e exige operação conhecida, snapshot objeto, `schemaVersion` numérico igual a 1, origem Notion, page ID/URL, identificador, canal, título, resumo, status Candidata, conteúdo completo com array de blocos e hash textual não vazio.
3. Replay sem alteração material permanece `unchanged/skipped`; o CLI explicita `skipped: true` e o caminho normal não chama RPC. Alteração isolada de `notion_url` não incrementa versão nem gera auditoria.
4. O hash canônico continua cobrindo metadados editoriais materiais e corpo, mas não a URL de origem, mantendo a decisão coerente com a materialidade do conteúdo.

Testes adicionados cobrem todos os status proibidos, `Candidata` com espaços, replay URL-only e as cláusulas SQL de nulidade/contrato.

## Evidência após a revisão

Novo dry-run real em `2026-10-23T01:50:18.938Z`:

- `insert`: 6;
- `update`: 0;
- `unchanged`: 0;
- `conflict`: 1;
- `ignored`: 0.

`2026-10-21-panorama-0900-ampliada` continua bloqueada por `notion_approved_requires_human_review`, com 109 blocos. `2026-10-22-tech-1900-ampliada` continua elegível como `insert`, versão 1, com 23 blocos e hash `5af63ef999515ddeda13a46e3beaa3f70fbadda541727c13ff3f4ed852b3bf6c`.

Consulta HML posterior permanece inalterada: 0 linhas em `observatorio_edicoes`, 37 linhas históricas e RPC C3 inexistente.

Verificações atualizadas:

- `npm run test:observatorio-c3`: 11/11 aprovados;
- `npx tsc --noEmit`: aprovado;
- ESLint dirigido: aprovado;
- dry-run real Notion × HML: aprovado, sem escrita;
- `git diff --check`: aprovado.

O diff final da migration fica restrito à validação de status Notion Candidata, validação resistente a `NULL`/tipos obrigatórios e preservação das proteções anteriores de identidade, lock, `FOR UPDATE`, estado HML, auditoria e `service_role`. A migration continua não aplicada.

**Parecer revisado para o Gate 2: GO condicionado mantido.** A primeira inserção recomendada permanece `2026-10-22-tech-1900-ampliada`, mas qualquer aplicação exige autorização explícita posterior; nenhum registro, RPC, trigger ou permissão foi criado no HML.

## Ajuste final de replay operacional

O caminho `applySingleEditorialPlan()` foi corrigido para tratar `unchanged` antes da criação do cliente Supabase. Ele retorna `{ status: "skipped", reason: "unchanged", identifier, version, contentHash }` sem cliente privilegiado e sem RPC. `conflict` e `ignored` são rejeitados como não aplicáveis antes da criação do cliente; `insert` e `update` permanecem inalterados.

O teste operacional remove as credenciais HML durante a chamada e confirma que o replay `unchanged` ainda retorna sucesso `skipped`; portanto, uma tentativa de criar cliente ou chamar RPC falharia. O mesmo teste confirma que `conflict` e `ignored` continuam não aplicáveis.

Evidências finais:

- `npm run test:observatorio-c3`: 13/13 aprovados;
- `npx tsc --noEmit`: aprovado;
- dry-run real em `2026-10-23T02:22:52.658Z`: 6 `insert`, 0 `update`, 0 `unchanged`, 1 `conflict`, 0 `ignored`;
- conflito Panorama aprovado preservado;
- `2026-10-22-tech-1900-ampliada` preservada como `insert`, versão 1;
- HML após o dry-run: 0 edições, 37 históricos, RPC C3 inexistente;
- nenhum INSERT, UPDATE, trigger, RPC ou auditoria foi executado.

Comando exato proposto para o Gate 2, ainda não executado:

```text
npm run observatorio:sync -- --apply-hml --identifier=2026-10-22-tech-1900-ampliada --run-key=c3-gate2-2026-10-23-tech-1900
```

O comando deve ser executado somente após revisão e autorização explícita. A revisão atual para antes de qualquer execução persistente.

## Execução autorizada do Gate 2 — HML

Autorização explícita registrada no Br[AI]n foi utilizada exclusivamente no projeto HML `hrpathjcxyzzwxgkhwnt`.

### Pré-validação

- URL/ID confirmados para `hrpathjcxyzzwxgkhwnt.supabase.co` / `hrpathjcxyzzwxgkhwnt`; nenhum segredo foi exibido.
- Estado anterior: `observatorio_edicoes=0`, `observatorio_decisoes_historico=37`, RPC ausente e trigger ausente.
- Histórico anterior preservado; a única migration aplicada foi `20261023023220_observatorio_c3_sync_editorial` (`observatorio_c3_sync_editorial`), correspondente ao arquivo autorizado.
- Dry-run imediatamente anterior: alvo `2026-10-22-tech-1900-ampliada` em `insert`, status Notion `Candidata`, 23 blocos, snapshot completo e hash `5af63ef999515ddeda13a46e3beaa3f70fbadda541727c13ff3f4ed852b3bf6c`.
- A edição Panorama aprovada permaneceu `conflict`; nenhuma outra edição foi selecionada para apply.

### Migration e permissões

Após a migration:

- `observatorio_sync_edicoes(text,jsonb)`: existente;
- `observatorio_edicoes_decisao_audit`: existente;
- `service_role`: `EXECUTE=true`;
- `anon`: `EXECUTE=false`;
- `authenticated`: `EXECUTE=false`;
- função: `SECURITY INVOKER`;
- contagens ainda antes do apply: 0 edições e 37 auditorias.

Não foram aplicadas migrations anteriores nem alterações paralelas.

### Primeira inserção

Comando autorizado executado:

```text
npm run observatorio:sync -- --apply-hml --identifier=2026-10-22-tech-1900-ampliada --run-key=c3-gate2-2026-10-23-tech-1900
```

Resultado da RPC: `inserted=1`, `updated=0`, ID HML `cfa965dd-b863-4d9e-a086-28d05758b962`.

Validação direta no HML:

- identificador: `2026-10-22-tech-1900-ampliada`;
- `notion_page_id`: `40113c24-1b4d-812b-905d-d4bbb657f772`;
- `status=candidata`;
- `versao=1`;
- `aprovada_em=NULL`;
- `publicada_em=NULL`;
- `snapshot.content.complete=true`;
- hash: `5af63ef999515ddeda13a46e3beaa3f70fbadda541727c13ff3f4ed852b3bf6c`;
- total de edições: 1;
- total de auditorias: 38;
- auditorias `INSERT` para a linha e run key autorizado: 1.

### Replay

O mesmo comando foi executado novamente. O resultado foi:

```json
{
  "status": "skipped",
  "reason": "unchanged",
  "identifier": "2026-10-22-tech-1900-ampliada",
  "version": 1,
  "contentHash": "5af63ef999515ddeda13a46e3beaa3f70fbadda541727c13ff3f4ed852b3bf6c"
}
```

Após o replay, a consulta confirmou novamente: 1 edição, versão 1, mesmo hash, snapshot inalterado, 38 auditorias totais e exatamente 1 auditoria associada à linha/run key. Não houve duplicação, incremento de versão ou nova auditoria.

### Parecer

O Gate 2 autorizado foi executado com sucesso e limitado à única edição Tech. As cinco candidatas restantes continuam apenas planejadas; a edição Panorama aprovada continua bloqueada. Não houve escrita no Notion, aprovação, publicação, acesso à produção ou commit/push.

**Parecer para avançar às demais candidatas: GO técnico condicionado a nova autorização explícita por lote. A C3 não é declarada encerrada automaticamente.**
