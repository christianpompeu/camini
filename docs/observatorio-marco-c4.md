# CAMINI OBSERVATÓRIO — Marco C4 — Gate 1

Data: 23/10/2026  
Escopo: leitura privada e preparação do contrato de decisão humana; nenhuma decisão persistente habilitada.

## Parecer

**GO para revisão do Gate 1. NO-GO para aprovação/rejeição persistente até a definição e autorização da identidade editorial humana.**

O Gate 1 entrega uma experiência privada de inspeção individual das seis edições HML e explicita a fronteira entre leitura autorizada e decisão editorial. Não houve migration, DDL/DML, criação de usuário, alteração de permissão, aprovação, rejeição ou publicação.

## Implementação realizada

- Adicionada a rota privada `/dashboard/observatorio/edicoes/[identificador]`.
- A fila existente agora leva ao detalhe individual, preservando filtros, badges e identidade visual.
- A leitura usa `getUser()` e `app_permissions` por meio de `assertObservatorioAccess()`; `is_super_admin` ou `allowed_routes` contendo `/dashboard/observatorio` continuam sendo os únicos critérios de leitura.
- O detalhe lê a edição no servidor, com `OBSERVATORIO_HML_SUPABASE_URL` validada contra `hrpathjcxyzzwxgkhwnt.supabase.co` e credencial HML server-only; nunca expõe a chave privilegiada ao cliente nem usa a URL pública do app para esta tela.
- O snapshot exibe título, resumo, canal, status HML, status/revisão originais do Notion, versão, hash, origem, datas, URL original, conteúdo e links.
- Blocos são renderizados recursivamente, incluindo filhos aninhados. A contagem apresentada é total, não somente a raiz; a edição Tech de 45 blocos permanece coberta pelo contrato de snapshot.
- Links aceitam apenas `http`/`https`; esquemas `javascript:`, `data:` e URLs inválidas são descartados. Não há `dangerouslySetInnerHTML` nem HTML remoto confiado.
- Estados incluídos: carregamento, edição inexistente, erro de leitura e acesso negado via boundary da rota.
- A interface mostra explicitamente “Decisão não habilitada” e não contém botões de Aprovar/Rejeitar/Publicar.

## Identidade e autorização — análise independente

O HML consultado permanece com `auth.users=0` e `observatorio_aprovadores=0`. A sessão usada pelo dashboard pertence ao Supabase do Camini, não ao projeto HML. A `service_role` do sincronizador é uma credencial técnica e não representa uma pessoa.

### Opção 1 — Auth e allowlist dedicadas no HML

Criar usuários Auth no HML e uma allowlist editorial vinculada ao `auth.uid()` permitiria RLS e revogação nativas no mesmo projeto. É a fronteira mais direta para uma RPC futura, mas exige provisionamento de usuários, políticas e operação de recuperação no HML. Não está habilitada neste gate.

### Opção 2 — Ponte segura Camini → HML

O Camini autentica o revisor com `getUser()`, verifica uma permissão editorial própria e chama uma RPC HML server-to-server com credencial restrita, transmitindo apenas uma identidade/decisão validada pelo backend. O cliente nunca escolhe `revisor_id`, e-mail ou UUID; o HML registra a identidade confiável recebida pelo canal administrativo. Essa opção preserva a UX atual e evita duplicar usuários, mas exige um contrato criptográfico/credencial entre projetos, rotação, revogação e auditoria da ponte.

### Opção 3 — Integração entre projetos

Não há evidência no código atual de federação Auth entre os dois projetos. JWT de um projeto não deve ser aceito implicitamente pelo outro, e não se deve improvisar validação por e-mail, header ou UUID informado pelo navegador. Esta opção só deve ser considerada após comprovação explícita de suporte e desenho de confiança.

### Recomendação

Recomendo a Opção 2 como menor mudança compatível com o Camini: autenticação permanece no Camini; uma permissão editorial explícita e revogável é validada server-side; uma função HML futura recebe apenas operações autorizadas por canal interno. Se a exigência for RLS/autonomia de identidade no HML, a Opção 1 é a alternativa mais forte, mas requer autorização para criar usuários e políticas. Nenhuma das duas foi implementada neste Gate 1.

## Contrato de decisão futura

Transições permitidas no próximo gate:

- `candidata → aprovada`;
- `candidata → rejeitada`.

`publicada` permanece fora de escopo. Uma decisão deverá validar, na mesma transação:

1. edição e `notion_page_id`/`identificador`;
2. identidade autenticada obtida pelo backend;
3. permissão editorial vigente e não revogada;
4. versão e `contentHash` examinados;
5. decisão e justificativa não vazias;
6. chave idempotente da operação;
7. estado atual ainda `candidata` e sem aprovação/publicação;
8. snapshot aprovado congelado para `aprovada`.

Versão/hash divergente, revisor revogado, permissão ausente, operação duplicada ou concorrência devem abortar sem alteração parcial. A trilha `observatorio_decisoes_historico` deve registrar antes/depois, ator confiável, decisão, versão, hash, justificativa, timestamp e chave idempotente. Uma tabela específica de decisões editoriais poderá ser proposta no próximo gate se a estrutura existente não comportar esses campos sem ambiguidade; nenhuma migration foi criada para C4.

## Testes e evidências

- `npm run test:observatorio-c4`: 3/3 aprovados.
- Cobertura: links inseguros, snapshot com bloco aninhado, autorização por `getUser()`/`app_permissions` e ausência de ações persistentes na UI.
- `npx tsc --noEmit`: aprovado.
- ESLint dirigido aos arquivos C4: aprovado.
- `npm run build`: aprovado; a rota dinâmica `/dashboard/observatorio/edicoes/[identificador]` foi compilada.
- Testes de usuário sem sessão, usuário autenticado sem acesso, revisor revogado, hash divergente, aprovação duplicada e concorrência permanecem contratos mockados/propostos; não substituem E2E com identidade real.
- Estado HML verificado antes da implementação: 6 edições privadas, 43 históricos, 0 aprovadas/publicadas, 0 usuários Auth e 0 aprovadores.

## Arquivos alterados

- `lib/observatorio/supabase-read-repository.ts`: leitura privada de uma edição por identificador.
- `lib/observatorio/server.ts`: wrapper autorizado para detalhe.
- `components/observatorio/editorial-queue.tsx`: navegação da fila para o detalhe.
- `components/observatorio/editorial-snapshot-view.tsx`: renderização segura e recursiva do snapshot.
- `lib/observatorio/editorial-snapshot-safety.ts`: validação de URLs externas.
- `app/dashboard/observatorio/edicoes/[identificador]/page.tsx`: página privada de detalhe.
- `loading.tsx`, `not-found.tsx`, `error.tsx`: estados de carregamento, inexistência e erro.
- `lib/observatorio/__tests__/editorial-detail.test.ts`: testes do Gate 1.
- `package.json`: comando `test:observatorio-c4`.

Não foram alterados migrations, RPCs, permissões HML, Notion, produção, Radar, Nutre, Força ou outras branches.

## Correções da revisão independente — evidências finais

- `rich_text` agora é renderizado segmento a segmento, preservando ordem, texto, hyperlinks `http`/`https`, negrito e anotações simples. Hyperlinks inseguros preservam somente o texto.
- “Referências e links” combina URLs de blocos e hyperlinks de `rich_text`, com deduplicação e validação por `safeExternalHref()`.
- Blocos `child_page` exibem `data.title` e continuam renderizando filhos aninhados. O smoke real das seis edições confirmou `2026-10-20-tech-1900-ampliada` com 45 blocos totais.
- URLs de origem da fila e do detalhe também passam por `safeExternalHref()`; esquemas diferentes de `http`/`https` não viram links.

### Verificação executada em 23/10/2026

- `npm run test:observatorio-c4`: 5/5 aprovados, incluindo rich text múltiplo, hyperlink inseguro, negrito, referências deduplicadas, `child_page.title` e filhos aninhados.
- `npx tsc --noEmit`: aprovado.
- ESLint dirigido aos arquivos alterados: aprovado.
- `npm run build`: aprovado; a rota privada dinâmica foi compilada.
- `npm run observatorio:sync -- --dry-run`: leitura real Notion × HML, 6 edições inalteradas, 1 conflito Panorama preservado, 0 escritas. Tech 20/10 retornou `blockCount: 45`, hash `9a7eb31382e2db0c34d36d615eada98caee24bbea43ec1855a6c4c3f593f51ec`.
- O smoke de rota com sessão real de navegador não foi executado nesta revisão; não foram fabricadas evidências de sessão. A proteção server-side existente permanece inalterada.

**Parecer revisado:** GO para encerramento do Gate 1 de leitura privada, sujeito à conferência independente; NO-GO para identidade, decisões persistentes, migrations, RPCs ou ações editoriais do Gate 2.

## Consolidação independente do contrato — replay e identidade

### Problema confirmado e correção pontual

O contrato anterior consultava `state.status` antes de procurar a decisão idempotente persistida. Assim, o replay legítimo depois de `candidata → aprovada/rejeitada` era rejeitado como estado encerrado. A correção agora:

1. autentica e revalida a permissão/revogação do revisor;
2. rejeita qualquer identidade enviada pelo cliente;
3. calcula fingerprint canônico incluindo ator confiável, edição, identificador, versão, hash, decisão e justificativa normalizada;
4. consulta a decisão anterior pela chave e fingerprint antes da validação do estado atual;
5. reconhece somente replay com mesma chave, payload, identidade e resultado persistidos;
6. rejeita outro revisor, fingerprint divergente ou chave reutilizada;
7. aplica as precondições de candidata, lock, versão e hash apenas à primeira execução.

Revogação continua sendo verificada antes do replay: uma permissão revogada não pode operar nem “repetir” uma decisão através do contrato ativo. O fingerprint não é autenticação nem autorização; é apenas vínculo de integridade/idempotência. A autenticação vem da sessão server-side e a autorização da permissão editorial vigente.

### Proposta persistente mantida

Permanece proposta, sem aplicação, uma tabela append-only própria de decisões de edições com `edicao_id`, `notion_page_id`, `identifier`, `decision`, `justification`, `version`, `content_hash`, `actor_user_id` confiável, `operation_key`, fingerprint e timestamps. A futura RPC deverá receber somente edição/versão/hash/justificativa/chave/decisão, resolver o ator no backend, usar lock transacional e congelar o snapshot aprovado. A tabela de aprovações de relações do grafo não será reutilizada.

### Evidências desta revisão

- Segunda tentativa de leitura do ADR Notion: indisponível pelo conector/web; nenhum conteúdo desconhecido foi presumido.
- `npm run test:observatorio-c4-contract`: 6/6 aprovados.
- `npm run test:observatorio-c4`: 5/5 aprovados.
- `npm run test:observatorio-c3`: 13/13 aprovados.
- `npx tsc --noEmit`: aprovado.
- ESLint dos arquivos do contrato: aprovado.
- `npm run build`: aprovado.
- Nenhuma migration, DDL/DML, RPC, credencial, usuário, permissão ou decisão editorial foi executada.

### Decisão arquitetural revisada

A ponte Camini → HML continua condicionada à demonstração de autenticação server-side real, identidade não controlável pelo cliente, permissão editorial revogável no momento da operação, credencial de decisão segregada da `service_role` do sincronizador, grants mínimos/EXECUTE restrito, rotação/revogação e auditoria vinculada a ator, versão e hash. Como essa prova operacional ainda não existe, o risco é bloqueante e a alternativa recomendada permanece Auth dedicado ao HML caso a ponte não consiga demonstrar essa separação. Não iniciar implementação persistente do Gate 2.

**Parecer revisado:** GO para o contrato local e sua auditoria independente; NO-GO para migration/RPC, provisionamento ou qualquer mutação até aprovação da fronteira de identidade e demonstração operacional do canal de confiança.

## Marco C4 / Gate 2 — Definição Arquitetural e Preparação da Implementação Persistente

Data da consolidação: 23/10/2026  
Status: Especificação final concluída, migration SQL endurecida e plano de 6 etapas estruturado  
Ambiente de destino: Supabase HML `hrpathjcxyzzwxgkhwnt`  
Branch: `feat/observatorio-fundacao`

---

### 1. ADR Final — Modelo de Identidade e Segregação de Privilégios

#### Contexto e Decisão de Identidade
O Gate 1 (leitura privada das edições e validação isolada do contrato de decisão) foi concluído e aprovado. A arquitetura definitiva aprovada para esta fase é a **Alternativa A: Autenticação editorial dedicada no Supabase HML**.

- **Identidade Nativa:** O revisor humano autentica-se diretamente contra o Supabase Auth do projeto HML (`hrpathjcxyzzwxgkhwnt`). O PostgreSQL recebe a requisição com o papel `authenticated` e extrai `v_actor_user_id := auth.uid()` diretamente da sessão criptografada.
- **Identidade Blindada:** O payload JSON enviado pelo cliente é proibido de conter campos de identidade (`actor_user_id` / `actorUserId`). A tentativa de injetar identidade de cliente aborta a transação com `42501 (client_identity_forbidden)`.
- **Allowlist Restrita:** A permissão editorial reside na tabela `public.observatorio_revisores_edicoes`, vinculada a `auth.users(id)` e protegida por RLS por identidade (`auth.uid() = user_id AND ativo = true`). A revogação (`ativo = false`) tem efeito imediato na próxima transação.

#### Segregação Efetiva de Privilégios (C3 vs. Decisão Humana)
A auditoria independente identificou que a credencial `service_role` possuía originalmente permissão direta de `UPDATE` sobre `public.observatorio_edicoes`. Para eliminar qualquer possibilidade de mutação direta ou bypass pelo sincronizador C3 ou por chaves técnicas:

1. **Revogação de Mutação Direta:**
   `REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.observatorio_edicoes FROM public, anon, authenticated, service_role;`
   Nenhum papel de aplicação consegue executar comandos DML de alteração direta de estado sobre a tabela `observatorio_edicoes`.
2. **Sincronizador C3 Restrito (`SECURITY DEFINER`):**
   A função `public.observatorio_sync_edicoes` foi convertida para `SECURITY DEFINER` (executável por `service_role`), com `SET search_path = pg_catalog`.
   - Permite apenas inserções e atualizações de edições no estado `'candidata'`.
   - Se a edição possuir `status <> 'candidata'`, `aprovada_em IS NOT NULL`, `rejeitada_em IS NOT NULL` ou `publicada_em IS NOT NULL`, a execução é abortada com `42501 (estado editorial HML protegido)`.
   - O sincronizador não possui autorização nem capacidade de alterar estados para aprovada, rejeitada ou publicada.
3. **Decisão Humana Restrita (`SECURITY DEFINER` para `authenticated`):**
   A função `public.observatorio_decidir_edicao` pertence ao papel `authenticated`, com revogação explícita para `service_role` (`REVOKE ALL FROM service_role`).
   - Apenas revisores humanos ativos na allowlist conseguem aprovar ou rejeitar.
   - O sincronizador não possui privilégio de execução (`EXECUTE`) na função de decisão.
4. **Allowlist Protegida:**
   `REVOKE ALL ON TABLE public.observatorio_revisores_edicoes FROM public, anon, authenticated, service_role;`
   `GRANT SELECT ON TABLE public.observatorio_revisores_edicoes TO authenticated;` (com RLS).
   O papel `service_role` não possui privilégio de leitura ou escrita na allowlist de revisores. Somente o superusuário/DBA (`postgres`) pode inserir ou revogar revisores.

---

### 2. Matriz de Permissões Efetivas por Papel

| Objeto / Recurso | Papel `anon` | Papel `service_role` (C3) | Papel `authenticated` (Revisores) | DBA / `postgres` |
| :--- | :---: | :---: | :---: | :---: |
| `public.observatorio_edicoes` (SELECT) | ❌ Bloqueado | ✅ Permitido | ✅ Permitido | ✅ Total |
| `public.observatorio_edicoes` (INSERT/UPDATE/DELETE) | ❌ Bloqueado | ❌ **Revogado** | ❌ **Revogado** | ✅ Total |
| `public.observatorio_revisores_edicoes` (SELECT) | ❌ Bloqueado | ❌ **Revogado** | ✅ Próprio ID ativo (RLS) | ✅ Total |
| `public.observatorio_revisores_edicoes` (INSERT/UPDATE/DELETE)| ❌ Bloqueado | ❌ **Revogado** | ❌ Bloqueado | ✅ Total |
| `public.observatorio_edicoes_decisoes` (SELECT) | ❌ Bloqueado | ❌ **Revogado** | ✅ Próprias decisões (RLS) | ✅ Total |
| `public.observatorio_edicoes_decisoes` (INSERT/UPDATE/DELETE)| ❌ Bloqueado | ❌ **Revogado** | ❌ Bloqueado (Append-Only) | ✅ Total |
| RPC `observatorio_sync_edicoes` (EXECUTE) | ❌ Bloqueado | ✅ **Exclusivo** | ❌ Bloqueado | ✅ Total |
| RPC `observatorio_decidir_edicao` (EXECUTE) | ❌ Bloqueado | ❌ **Revogado** | ✅ **Exclusivo** (Allowlist) | ✅ Total |

*Limites de segurança remanescentes para papéis administrativos:* Superusuários PostgreSQL (`postgres`) mantêm controle do banco para migrações e auditoria; nenhuma credencial de aplicação (seja `anon` ou `service_role`) possui permissão de mutação direta sobre estados editoriais ou allowlist.

---

### 3. Concorrência Determinística, Idempotência e Replay

#### Problema Identificado na Versão Anterior
Na proposta preliminar, a verificação da chave de idempotência ocorria antes da aquisição dos locks transacionais. Essa brecha permitia que duas requisições simultâneas passassem simultaneamente pela verificação de replay e competissem pelo lock da edição, podendo uma requisição legítima ser rejeitada com erro de concorrência ou colisão de estado.

#### Solução Estruturada com Ordem Determinística
A RPC `observatorio_decidir_edicao` adota a seguinte ordem rigorosa de serialização:

```
[Requisição Recebida]
         │
         ▼
[1. Autenticação & Allowlist Ativa] ──> Erro 42501 se inválido
         │
         ▼
[2. Validação Estrita de Sintaxe & Tipos] ──> Erro 22023 se inválido
         │
         ▼
[3. SERIALIZAÇÃO DETERMINÍSTICA]
    a) Advisory Lock: pg_advisory_xact_lock(hashtextextended(identifier, 0))
    b) Row Lock Exclusivo: SELECT * FROM observatorio_edicoes FOR UPDATE
         │
         ▼
[4. Verificação de Idempotência / Replay (SOB LOCK)]
    ├── Encontrou chave?
    │    ├── Mesmo ator, fingerprint, edição e decisão ──> Retorna replay: true (SEM MUTAR)
    │    └── Divergência de payload/ator/decisão ──> Erro 23505 (idempotency_key_reused)
    │
    ▼ (Se chave não existia)
[5. Validação de Pré-condições da Edição]
    ├── Status = 'candidata' e sem carimbos prévios? ──> Erro 42501 se já decidida
    ├── Decisão terminal prévia na mesma versão? ──> Erro 42501 (unicidade de ciclo)
    ├── Versão e ContentHash examinados coincidem? ──> Erro 40001 (stale_version/hash)
    └── Snapshot íntegro (complete=true, blocks array > 0)? ──> Erro 22023 se incompleto
         │
         ▼
[6. Efetivação Atômica]
    ├── UPDATE observatorio_edicoes (status = 'aprovada'/'rejeitada', timestamps)
    └── INSERT INTO observatorio_edicoes_decisoes (snapshot congelado, chave, fingerprint)
         │
         ▼
[7. Retorno com Sucesso (replay: false)]
```

#### Matriz de Comportamento Concorrente e Replay

| Cenário Concorrente | Comportamento Garantido | Resultado Esperado |
| :--- | :--- | :--- |
| **Duas requisições simultâneas idênticas** (mesma chave e mesmo payload) | A 1ª adquire o lock, decide e comita; a 2ª aguarda no lock, lê a decisão comitada e reconhece o replay idêntico. | 1 decisão gravada; 1 resposta nova + 1 resposta com `replay: true`. Sem duplicar auditoria. |
| **Duas requisições com chaves diferentes** para a mesma edição | A 1ª comita a decisão; a 2ª obtém o lock, detecta que a edição não é mais `candidata`. | 1ª aprovada/rejeitada; 2ª abortada com `42501 (editorial_state_not_candidate)`. |
| **Mesma chave reutilizada com payload divergente** | Sob lock, detecta discrepância entre o fingerprint persistido e a nova solicitação. | Abortada com `23505 (idempotency_key_reused)`. Nenhuma alteração. |
| **Outro revisor tenta reutilizar chave de terceiro** | Sob lock, detecta `actor_user_id <> v_uid`. | Abortada com `23505 (idempotency_key_reused)`. |
| **Revisor revogado tenta decidir ou obter replay** | Rejeitado na etapa 1 (autorização prévia a qualquer leitura ou lock). | Abortada com `42501 (editorial_permission_required)`. |
| **Mutação concorrente pelo Notion durante a revisão** | Sincronizador C3 altera a versão ou contentHash da edição candidata. | Revisor é rejeitado com `40001 (stale_version / stale_content_hash)`. |
| **Tentativa de mutação direta no histórico append-only** | Trigger `observatorio_edicoes_decisoes_append_only` intercepta UPDATE/DELETE. | Abortada com `42501 (auditoria append-only: mutacao bloqueada)`. |

---

### 4. Sequência Ordenada de Implantação (Etapas A a F)

A implantação do Gate 2 está estruturada em seis etapas sequenciais e estritamente controladas:

```
+-------------------------------------------------------------------------------+
| ETAPA A: Migration Validada (DDL, RLS, Grants de Menor Privilégio e RPC)      |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| ETAPA B: Provisionamento Auth (Criação de Usuário Revisor no Supabase HML)   |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| ETAPA C: Ativação da Allowlist (Inserção Administrativa na Tabela de Revisores)|
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| ETAPA D: Interface Privada (Conexão da Sessão HML à Tela de Decisão)         |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| ETAPA E: Homologação Controlada (Bateria de Testes em Fixture Isolada)        |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| ETAPA F: Aceite Formal do Gate 2 (Apresentação de Evidências e Liberação)    |
+-------------------------------------------------------------------------------+
```

#### Etapa A — Migration Validada
- **Objetivo:** Aplicar o esquema persistente, triggers append-only, revogação de privilégios de `service_role`, endurecimento de C3 `SECURITY DEFINER` e a RPC `observatorio_decidir_edicao`.
- **Pré-requisito:** Autorização humana prévia para execução de DDL.
- **Arquivo:** `supabase/migrations/20261023150000_observatorio_c4_gate2_decisao_editorial.sql`.
- **Verificação pós-etapa:** Executar consultas de `has_table_privilege` e `has_function_privilege` confirmando que `service_role` perdeu `UPDATE` direto e que a allowlist está inacessível para papéis anônimos/públicos.
- **Contingência:** Script de rollback DDL preparado (reverter colunas e tabelas, restaurar permissões originais se houver falha de sintaxe).

#### Etapa B — Provisionamento Auth
- **Objetivo:** Criar a conta de revisor editorial de teste no Supabase Auth do projeto HML (`hrpathjcxyzzwxgkhwnt`).
- **Momento:** Executado **após** a aplicação da migration da Etapa A, garantindo que as tabelas de destino já existam.
- **Pré-requisito:** Autorização humana prévia para cadastro de credencial de teste.
- **Verificação pós-etapa:** Confirmar existência do usuário em `auth.users` com e-mail e UUID válidos, sem conceder nenhum papel de superadmin.

#### Etapa C — Ativação da Allowlist
- **Objetivo:** Vincular o `user_id` provisionado na tabela `public.observatorio_revisores_edicoes` com `ativo = true`.
- **Modo de execução:** Inserção puramente administrativa (via console SQL autenticado como superusuário/DBA).
- **Verificação pós-etapa:** Testar que o usuário autenticado consegue ler o próprio registro via RLS (`observatorio_revisores_edicoes_leitura_propria`), mas não consegue alterar registros de terceiros nem inserir novos revisores.

#### Etapa D — Interface Privada
- **Objetivo:** Conectar a interface do dashboard privado (`/dashboard/observatorio/edicoes/[identificador]`) ao fluxo de decisão, mantendo a autenticação editorial do HML devidamente segregada da autenticação principal do Camini.
- **Componentes:** Caixa de decisão editorial com validação de justificativa (mínimo 10 caracteres aparados), confirmação de versão/hash examinados, botões Aprovar e Rejeitar, e tratamento de replay idempotente.
- **Verificação pós-etapa:** Build de produção aprovado, rotas compiladas sem vazamento de segredos, validações visuais operacionais.

#### Etapa E — Homologação Controlada
- **Objetivo:** Executar a matriz completa de testes de integração e concorrência sobre uma **fixture sintética isolada** (ex: `teste-c4-gate2-fixture`), sem tocar nos seis registros candidatos reais.
- **Script de teste:** `scripts/observatorio-c4-gate2-test-plan.sql`.
- **Cenários testados:**
  1. Sucesso de aprovação e rejeição com justificativa e hash válidos.
  2. Replay idempotente (mesma chave retorna `replay: true` sem duplicar histórico).
  3. Rejeição de chave reutilizada com payload divergente (`23505`).
  4. Bloqueio de usuário não-autenticado e usuário fora da allowlist (`42501`).
  5. Bloqueio imediato de revisor revogado (`42501`).
  6. Bloqueio de snapshot obsoleto ou versão divergente (`40001`).
  7. Proteção append-only contra UPDATE ou DELETE na auditoria (`42501`).
  8. Preservação do sincronizador C3 (continua sincronizando candidatas e é bloqueado contra mutação de edições aprovadas).

#### Etapa F — Aceite Formal do Gate 2
- **Objetivo:** Consolidar o dossiê de evidências e submeter para aprovação humana deliberada para o encerramento do Gate 2.
- **Critérios de Aceite:**
  - [ ] Migration aplicada com integridade estrutural e permissões verificadas no HML.
  - [ ] `service_role` comprovadamente sem permissão de mutação direta sobre `observatorio_edicoes`.
  - [ ] Revisor humano de homologação consegue aprovar/rejeitar a fixture de teste com registro de auditoria imutável.
  - [ ] Nenhuma das seis edições candidatas reais foi alterada ou corrompida.
  - [ ] O sincronizador C3 permanece operacional para candidatas e respeita a imutabilidade de edições decididas.

---

### 5. Parecer Objetivo de Prontidão

- **Prontidão Técnica da Migration e Contratos:** **100% PRONTO.**
  A migration SQL `supabase/migrations/20261023150000_observatorio_c4_gate2_decisao_editorial.sql` foi integralmente revisada, os locks transacionais foram reordenados para garantir concorrência determinística, a segregação do `service_role` foi blindada com C3 `SECURITY DEFINER`, as validações de tipos e do snapshot JSONB foram endurecidas, e o plano de testes está formalizado.
- **Estado dos Testes Locais:**
  - Contrato de decisão: 6/6 aprovados (`npm run test:observatorio-c4-contract`).
  - Páginas públicas e sanitização: 12/12 aprovados (`npm run test:observatorio-public`).
  - TypeScript e lint: 0 erros (`npx tsc --noEmit`).
  - Build do Next.js: verde (86 páginas estáticas/dinâmicas compiladas).
- **Status Operacional dos Ambientes:**
  - **NÃO APLICADO:** Nenhuma migration foi executada no Supabase HML.
  - **NÃO PROVISIONADO:** Nenhuma conta Auth foi criada no HML.
  - **NÃO ATIVADO:** Nenhuma allowlist ou fixture foi inserida no HML.
  - **PRESERVADO:** Os seis registros candidatos reais do HML permanecem intocados.
- **Recomendação Conclusiva:**
  Solicitar formalmente autorização humana para iniciar a **Etapa A** (aplicação controlada da migration no Supabase HML) e, sequencialmente, as etapas B a F conforme o plano acordado.


