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

Data da definição: 23/10/2026  
Status: Proposta técnica conclusiva e plano de implementação estruturado  
Ambiente de destino: Supabase HML `hrpathjcxyzzwxgkhwnt`

---

### 1. ADR Final — Modelo de Identidade Editorial

#### Contexto e Problema
O Gate 1 (leitura privada das edições e validação isolada do contrato de decisão) foi concluído e aprovado. Para habilitar as ações persistentes de **aprovação** e **rejeição** humana no Supabase HML sem reabrir discussões arquiteturais, é mandatório definir a fronteira de identidade do revisor.

A análise técnica avaliou duas alternativas concretas com base nas capacidades reais do Supabase:

- **Alternativa A — Autenticação dedicada no Supabase HML:** A identidade humana é autenticada diretamente pelo Supabase Auth do projeto HML (`hrpathjcxyzzwxgkhwnt`) e verificada contra uma allowlist local vinculada a `auth.uid()`.
- **Alternativa B — Ponte server-side Camini → HML:** O Camini autentica o usuário em seu projeto principal, valida uma permissão editorial própria e transmite a decisão ao HML através de um canal administrativo restrito.

#### Investigação Técnica e Limitações Comprovadas da Ponte Server-Side (Alternativa B)
A análise minuciosa das interfaces do Supabase PostgREST e das restrições de segurança comprovou que a Alternativa B é inviável sob os critérios de menor privilégio e identidade confiável:

1. **Ausência de credencial com granularidade intermediária no PostgREST:** O Supabase hospeda o PostgREST com duas chaves padrão (`anon` e `service_role`). Não há suporte nativo para provisionar uma terceira API key com papel customizado restrito apenas à execução de uma RPC específica.
2. **Reuso inaceitável de `service_role`:** Criar uma variável de ambiente (como `OBSERVATORIO_HML_DECISION_KEY`) contendo o token `service_role` apenas mudaria o nome da variável, mas manteria os mesmos privilégios irrestritos do sincronizador (bypass de RLS e acesso a todas as tabelas).
3. **Impossibilidade de demonstrar a identidade humana ao PostgreSQL:** Na chamada via PostgREST com `service_role`, `auth.uid()` é nulo no banco. O banco de dados teria que receber o identificador do ator como um parâmetro arbitrário de payload (`actor_user_id`), sem qualquer garantia criptográfica de que aquela pessoa realmente autenticou ou consentiu com a decisão.
4. **Proibição de federação/assinatura de tokens:** Gerar e assinar JWTs customizados com o segredo do HML no servidor Camini para simular papéis violaria a restrição explícita do projeto de não inventar mecanismos de federação de tokens.

#### Decisão Arquitetural Conclusiva: Alternativa A (Autenticação Dedicada no HML)
Adota-se conclusivamente a **Alternativa A**:

- **Identidade Nativa:** O revisor humano autentica-se diretamente contra o Supabase Auth do HML. O PostgreSQL recebe a requisição com o papel `authenticated` e extrai `v_actor_user_id := auth.uid()` diretamente da sessão criptografada.
- **Menor Privilégio Real:** A RPC de decisão pertence exclusivamente ao papel `authenticated` (`GRANT EXECUTE TO authenticated`). O papel `service_role` tem sua permissão de execução expressamente revogada (`REVOKE EXECUTE FROM service_role`), impedindo categoricamente que processos em lote ou coletores aprovem ou rejeitem edições.
- **Identidade Blindada:** O payload JSON enviado pelo cliente é proibido de conter campos de identidade (`actor_user_id` / `actorUserId`). A tentativa de injetar identidade de cliente aborta a transação com `42501 (client_identity_forbidden)`.
- **Revogação Local e Instantânea:** A allowlist reside em `public.observatorio_revisores_edicoes` no próprio HML. A revogação (`ativo = false`) surte efeito imediatamente na próxima transação.
- **Operação Enxuta:** Dado que o Observatório possui um grupo restrito de editores humanos (1 a 3 revisores seniores), o provisionamento direto no HML é simples, robusto e elimina qualquer dependência de ponte administrativa.

---

### 2. Desenho da Persistência Mínima

A persistência do Gate 2 adiciona exclusivamente as estruturas necessárias para o ciclo de vida editorial das edições, sem reutilizar a tabela `observatorio_aprovacoes_editoriais` (restrita às relações causais do grafo) e sem misturar status editorial com assinantes, pagamentos ou publicação.

#### A. Tabela de Allowlist de Revisores (`public.observatorio_revisores_edicoes`)
Armazena a permissão editorial explícita e revogável:
- `user_id uuid primary key references auth.users (id) on delete cascade`;
- `email text not null`;
- `ativo boolean not null default true`;
- `concedido_em timestamptz not null default now()`;
- `concedido_por text not null default current_user`;
- `revogado_em timestamptz`;
- `motivo_revogacao text`.

*Segurança:* RLS habilitado. Leitura permitida apenas para o próprio usuário autenticado (`user_id = auth.uid() and ativo = true`). Mutação restrita à administração do banco.

#### B. Tabela de Auditoria Imutável (`public.observatorio_edicoes_decisoes`)
Registro append-only de todas as decisões humanas tomadas sobre edições:
- `id uuid primary key default gen_random_uuid()`;
- `edicao_id uuid not null references public.observatorio_edicoes (id)`;
- `identificador text not null`;
- `notion_page_id text not null`;
- `decisao text not null check (decisao in ('aprovar', 'rejeitar'))`;
- `justificativa text not null check (length(btrim(justificativa)) >= 10)`;
- `versao integer not null check (versao >= 1)`;
- `content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$')`;
- `actor_user_id uuid not null references auth.users (id)`;
- `actor_email text not null`;
- `chave_idempotencia text not null unique`;
- `fingerprint text not null`;
- `snapshot_congelado jsonb not null`;
- `decidido_em timestamptz not null default now()`.

*Segurança e Índices:*
- Índices em `(edicao_id, decidido_em desc)` e `(identificador)`.
- RLS habilitado (leitura apenas de registros próprios).
- Trigger append-only `observatorio_edicoes_decisoes_append_only` bloqueia `UPDATE` e `DELETE` incondicionalmente via `observatorio_bloquear_mutacao_auditoria()`.

#### C. Campo Operacional em `public.observatorio_edicoes`
- `rejeitada_em timestamptz` adicionado para marcar o timestamp de rejeição formal, em perfeita simetria com `aprovada_em` e `publicada_em`.

---

### 3. Operação Transacional de Decisão (RPC)

A operação persistente será formalizada na função `public.observatorio_decidir_edicao(p_payload jsonb)`:

#### Parâmetros de Entrada (`p_payload jsonb`)
- `edition_id`: UUID da edição;
- `identifier`: identificador canônico textual;
- `version`: número da versão examinada na interface;
- `content_hash`: hash SHA-256 de 64 caracteres do conteúdo examinado;
- `decision`: `'aprovar'` ou `'rejeitar'` (qualquer outro valor é rejeitado; `'publicada'` é terminantemente bloqueada);
- `justification`: texto com justificativa editorial (mínimo 10 caracteres);
- `idempotency_key`: chave única gerada para a ação.

#### Sequência Transacional Obrigatória
1. **Autenticação:** Valida `v_uid := auth.uid()`. Se nulo, falha com código `42501 (unauthenticated)`.
2. **Autorização e Revogação:** Consulta `observatorio_revisores_edicoes` por `user_id = v_uid AND ativo = true`. Se não localizado, falha com `42501 (editorial_permission_required)`.
3. **Proteção contra Forja de Identidade:** Rejeita a requisição se contiver `actor_user_id` no payload com `42501 (client_identity_forbidden)`.
4. **Validação de Sintaxe e Domínio:** Garante preenchimento de campos obrigatórios, versão inteira positiva, decisão válida (`aprovar`/`rejeitar`) e justificativa `>= 10` caracteres.
5. **Fingerprint e Idempotência:**
   - Calcula fingerprint canônico via `jsonb_build_object('actorUserId', v_uid, 'contentHash', v_content_hash, 'decision', v_decision, 'editionId', v_edition_id, 'identifier', v_identifier, 'justification', v_justification, 'version', v_version)`.
   - Se `chave_idempotencia` já existir:
     - Se fingerprint, ator e decisão coincidirem com o registro persistido, retorna sucesso com `replay: true` sem nova escrita.
     - Se qualquer dado divergir, aborta com `23505 (idempotency_key_reused)`.
6. **Concorrência e Locks:**
   - Adquire advisory lock transacional pelo hash do identificador: `pg_advisory_xact_lock(hashtextextended(v_identifier, 0))`.
   - Executa `SELECT * FROM observatorio_edicoes WHERE id = v_edition_id FOR UPDATE`.
7. **Validação de Estado e Snapshot:**
   - Exige `status = 'candidata'`, `aprovada_em IS NULL` e `publicada_em IS NULL`. Se violado, falha com `42501 (editorial_state_not_candidate)`.
   - Exige que `versao` e `contentHash` correspondam aos examinados pelo revisor. Se divergirem, falha com `40001 (stale_version / stale_content_hash)`.
   - Exige snapshot íntegro (`complete = true` e blocos presentes).
8. **Efetivação Atômica:**
   - Atualiza `observatorio_edicoes` para `status = 'aprovada'` (com `aprovada_em = now()`) ou `status = 'rejeitada'` (com `rejeitada_em = now()`).
   - Insere na tabela imutável `observatorio_edicoes_decisoes` com o snapshot congelado no momento da decisão.
9. **Permissões Granulares:**
   - `REVOKE ALL ON FUNCTION public.observatorio_decidir_edicao(jsonb) FROM public, anon, service_role;`
   - `GRANT EXECUTE ON FUNCTION public.observatorio_decidir_edicao(jsonb) TO authenticated;`

*Garantia de Isolamento com o Sincronizador C3:* A migration C3 (`observatorio_sync_edicoes`) já protege explicitamente edições com `status <> 'candidata'` ou `aprovada_em IS NOT NULL`. Portanto, uma vez aprovada ou rejeitada no Gate 2, a edição torna-se imutável para o sincronizador Notion, impedindo sobrescritas automáticas.

---

### 4. Plano de Implementação em 4 Etapas Executáveis

```
+-------------------------------------------------------------------------------+
| ETAPA A: Identidade e Permissões (Provisionamento e Allowlist no HML)         |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| ETAPA B: Persistência e Transação (Migration DDL, RLS, Trigger e RPC)         |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| ETAPA C: Interface de Decisão (Ações Aprovar/Rejeitar no Detalhe Privado)     |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| ETAPA D: Verificação Ponta a Ponta (E2E com Fixture Isolada e Matriz Negativa)|
+-------------------------------------------------------------------------------+
```

#### Etapa A — Identidade e Permissões
- **Arquivos envolvidos:** Painel Supabase HML (`hrpathjcxyzzwxgkhwnt`), `.env.local` (apenas para eventual usuário de teste).
- **Estruturas novas:** Usuário revisor em `auth.users` do HML; registro correspondente na allowlist `observatorio_revisores_edicoes`.
- **Operações previstas:** Criação de 1 conta humana de revisor no Supabase Auth HML; inserção manual/controlada do registro na allowlist com `pode_revisar = true` e `ativo = true`.
- **Permissões exigidas:** Acesso administrativo ao dashboard do Supabase HML.
- **Critérios de aceite:** O revisor consegue obter um token de sessão válido emitido pelo HML (`role: authenticated`).
- **Risco residual:** Uso indevido de credenciais caso compartilhadas (mitigado por senhas fortes e MFA no HML).
- **Necessidade de autorização humana:** **SIM (Operação 1 e Operação 3).**

#### Etapa B — Persistência e Transação
- **Arquivos envolvidos:** `supabase/migrations/20261023150000_observatorio_c4_gate2_decisao_editorial.sql`.
- **Estruturas novas:** Tabelas `observatorio_revisores_edicoes` e `observatorio_edicoes_decisoes`, coluna `rejeitada_em` em `observatorio_edicoes`, trigger append-only e RPC `observatorio_decidir_edicao(jsonb)`.
- **Operações previstas:** Aplicação da migration local proposta via CLI ou console SQL do HML.
- **Permissões exigidas:** Papel `postgres` / `service_role` para execução de DDL no HML.
- **Critérios de aceite:** DDL aplicado com sucesso; testes de segurança confirmando que `service_role` e `anon` não conseguem executar a RPC; trigger append-only bloqueia `UPDATE`/`DELETE` na auditoria.
- **Risco residual:** Conflito de nomes ou tipos (mitigado pelo script com `if not exists` e tipagem estrita).
- **Necessidade de autorização humana:** **SIM (Operação 2).**

#### Etapa C — Interface de Decisão
- **Arquivos envolvidos:**
  - `app/dashboard/observatorio/edicoes/[identificador]/page.tsx`
  - `components/observatorio/editorial-decision-box.tsx` (novo componente de decisão)
  - `lib/observatorio/editorial-decision-actions.ts` (ações server/client autenticadas no HML)
- **Estruturas novas:** Painel de decisão no detalhe da edição com:
  - Botões distintos para **Aprovar Edição** e **Rejeitar Edição**;
  - Campo de texto para **Justificativa Editorial Obrigatória** (mínimo 10 caracteres);
  - Modal de confirmação explícito com resumo da versão e hash examinados;
  - Feedback visual de status e histórico da decisão.
- **Operações previstas:** Renderização do formulário interativo de decisão apenas quando a edição estiver em status `candidata` e a sessão HML estiver presente.
- **Permissões exigidas:** Permissão de leitura do dashboard Camini + sessão ativa no HML.
- **Critérios de aceite:** Validação client-side impede envio com justificativa menor que 10 caracteres; a requisição é transmitida com JWT do HML; a UI reflete o novo status após a resposta da RPC.
- **Risco residual:** Erro de renderização em sessões expiradas (mitigado por tratamento explícito de erro HTTP 401/42501).
- **Necessidade de autorização humana:** Não para o código frontend local; sim para conectar à base remota.

#### Etapa D — Verificação Ponta a Ponta (E2E)
- **Arquivos envolvidos:** Script de validação isolada (ex: `scripts/test-c4-gate2-e2e.ts`) e testes automatizados de integração.
- **Estruturas novas:** Fixture de teste temporária `teste-c4-gate2-fixture` inserida em `observatorio_edicoes` (NUNCA executar sobre as 6 candidatas reais).
- **Operações previstas:**
  1. Teste positivo de aprovação com usuário autorizado e justificativa válida.
  2. Teste de replay idempotente com mesma chave e payload (deve retornar `replay: true` sem duplicar histórico).
  3. Teste negativo com usuário autenticado mas fora da allowlist (deve falhar com `42501`).
  4. Teste negativo com revisor revogado (`ativo = false`) (deve falhar com `42501`).
  5. Teste negativo com justificativa curta `< 10` caracteres (deve falhar com `22023`).
  6. Teste negativo de chave de idempotência reutilizada com dados divergentes (deve falhar com `23505`).
  7. Teste negativo de colisão de versão ou hash adulterado (deve falhar com `40001`).
  8. Teste negativo de concorrência simultânea contra o mesmo identificador.
- **Permissões exigidas:** Credenciais dos dois usuários de teste (autorizado e não autorizado).
- **Critérios de aceite:** 100% dos cenários positivos e negativos da matriz aprovados com os códigos de erro exatos.
- **Risco residual:** Deixar dados residuais de teste (mitigado por limpeza controlada da fixture ao término).
- **Necessidade de autorização humana:** **SIM (Operação 4).**

---

### 5. Lista Exata de Operações que Exigem Autorização Prévia

Para implementar o Gate 2 persistente de forma estritamente controlada, as seguintes quatro operações dependerão de aprovação formal:

1. **Operação 1 (Provisionamento Auth HML):** Criar a conta de revisor editorial em `auth.users` no Supabase HML (`hrpathjcxyzzwxgkhwnt`).
2. **Operação 2 (Execução da Migration):** Aplicar o script `supabase/migrations/20261023150000_observatorio_c4_gate2_decisao_editorial.sql` no HML.
3. **Operação 3 (Ativação da Allowlist):** Inserir o UUID da conta provisionada na tabela `public.observatorio_revisores_edicoes`.
4. **Operação 4 (Criação de Fixture Isolada de Teste):** Inserir no HML um registro pontual de teste (`identificador: teste-c4-gate2-fixture`) para execução do E2E, sem tocar nas seis candidatas reais.

---

### 6. Critérios de Aceite do Gate 2

O Gate 2 só será considerado concluído quando:
- [ ] A migration estiver aplicada sem erros e com permissões conferidas no HML.
- [ ] `service_role` estiver expressamente sem permissão de execução na RPC de decisão.
- [ ] O revisor humano conseguir aprovar e rejeitar a fixture de teste a partir da interface privada.
- [ ] Replays com a mesma chave forem reconhecidos sem gerar registros adicionais de auditoria.
- [ ] Tentativas de decisão por usuários não autorizados ou revogados forem bloqueadas no banco com `42501`.
- [ ] Nenhuma das seis candidatas reais do HML for modificada antes do encerramento formal dos testes.
- [ ] A sincronização C3 respeitar o snapshot aprovado e não sobrescrever edições decididas.

---

### 7. Parecer Conclusivo

- **GO para a Arquitetura e Especificação do Gate 2:** A definição do modelo de identidade (Alternativa A), o esquema de dados, a RPC transacional e o plano de 4 etapas estão consolidados, blindados e alinhados às regras do projeto.
- **NO-GO para Persistência Imediata:** Nenhuma migration foi aplicada, nenhum usuário foi criado, nenhuma permissão foi alterada no HML e nenhuma edição foi aprovada ou rejeitada. A persistência aguarda a liberação explícita das operações listadas.

