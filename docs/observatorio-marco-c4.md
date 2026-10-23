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

## Riscos bloqueantes para o Gate 2

## Preparação técnica do Gate 2 — ponte de identidade e decisão

### Evidência de ADR

O ADR preliminar informado em `https://app.notion.com/p/40213c241b4d81ceb4acd09f43de68c7` não pôde ser recuperado pelo conector/web desta sessão. Portanto, nenhuma decisão foi atribuída ao ADR; a proposta abaixo deriva somente dos contratos já registrados neste documento e do código local.

### Contrato verificável de identidade

- O Camini resolve a sessão com `supabase.auth.getUser()` no servidor; ausência de sessão ou usuário não produz identidade editorial.
- Leitura do dashboard e permissão editorial são capacidades distintas. A leitura continua baseada em `app_permissions`/`is_super_admin`/`allowed_routes`; a decisão exigirá uma permissão editorial explícita, separada e revogável.
- O cliente não envia `revisor_id`, e-mail ou UUID de ator. A operação recebe apenas os dados da edição e a decisão; o ator é resolvido no backend a partir da sessão.
- Revogação deve ser consultada server-side a cada operação (ou por concessão com versão/expiração curta), de modo que remover a permissão invalide novas decisões sem confiar em metadata editável do usuário.

### Canal de confiança proposto

A ponte server-side só é aceitável com uma credencial dedicada à decisão editorial, separada da `service_role` usada pelo sincronizador, com privilégios mínimos para uma futura RPC específica, rotação, expiração, allowlist de origem e auditoria. A credencial nunca chega ao navegador, e a RPC não aceita identidade fornecida pelo cliente. Até existir essa prova operacional (segredo segregado, rotação/revogação testadas e grants mínimos), não há demonstração suficiente de separação confiável de privilégios.

Comparação objetiva:

| Critério | Ponte Camini → HML | Auth dedicado no HML |
|---|---|---|
| Identidade | Camini resolve `getUser()` e permissão editorial | HML resolve `auth.uid()` diretamente |
| Revogação | exige consulta server-side e rotação/expiração da credencial | allowlist/RLS nativas no mesmo projeto |
| Superfície de confiança | canal administrativo entre projetos | um único domínio de autenticação |
| Estado atual | proposta, sem prova de credencial segregada | ainda não provisionado, mas fronteira verificável |
| Parecer | não autorizar persistência antes da prova | recomendada se a ponte não demonstrar separação |

### Contrato de `aprovar`/`rejeitar`

Entrada mínima server-side: `editionId`, `identifier`, `version`, `contentHash`, `decision`, `justification` não vazia e `idempotencyKey`. A operação deve validar identidade confiável, edição/`notion_page_id`, estado atual `candidata`, versão, hash e chave idempotente. Apenas `candidata → aprovada` ou `candidata → rejeitada` são permitidos; `publicada` permanece fora do Gate 2.

### Persistência mínima proposta

Criar, somente após aprovação e migration separada, uma tabela própria de decisões editoriais de edições (por exemplo `observatorio_edicoes_decisoes`) com `edicao_id`, `notion_page_id`, `identifier`, `decision`, `justification`, `version`, `content_hash`, `actor_user_id` confiável, `operation_key`, timestamps e estado de revogação/validade. Não reutilizar `observatorio_aprovacoes` das relações do grafo: são domínios, invariantes e auditorias diferentes. A tabela de decisões deve ser append-only; alterações posteriores ao snapshot aprovado exigem nova versão/decisão explícita.

### Estratégia transacional

Uma futura RPC deve adquirir lock por edição (`FOR UPDATE`/advisory lock), verificar novamente estado, versão e hash, rejeitar snapshot obsoleto e inserir a chave idempotente na mesma transação. Chave repetida com payload idêntico retorna replay sem nova auditoria; chave repetida com payload diferente falha. Após aprovação, o snapshot aprovado fica congelado: atualização de conteúdo não pode sobrescrevê-lo nem alterar timestamps/ator da decisão. Concorrência, revogação ou qualquer precondição falha sem alteração parcial.

### Validação local do contrato

Foi adicionado apenas o validador puro `lib/observatorio/editorial-decision-contract.ts`, sem cliente Supabase, RPC ou endpoint mutante. Os testes cobrem: sem sessão, leitor sem permissão editorial, revisor revogado, identidade forjada pelo cliente, hash divergente, versão obsoleta, concorrência, replay idempotente, reutilização de chave e estado já aprovado/publicado. Isso valida o contrato, não substitui E2E com identidades reais.

**Parecer para implementação persistente do Gate 2: NO-GO.** A ponte server-side permanece uma proposta até demonstrar credencial segregada, grants mínimos, rotação e revogação efetivas. Se essa separação não puder ser demonstrada em HML, adotar Auth dedicado no HML; não improvisar confiança por e-mail, UUID, header ou `service_role` do sincronizador. Nenhuma migration, usuário, permissão, RPC, aprovação, rejeição ou publicação foi executada neste preparo.

- Não existe ainda identidade humana editorial provisionada no HML.
- A ponte Camini/HML ainda não possui contrato de confiança, rotação e revogação implementado.
- Os testes de autorização ainda são mocks; falta E2E com um usuário autorizado e um usuário sem permissão.
- O contrato de decisão precisa ser aprovado antes de qualquer botão ou Server Action persistente.

**Conclusão:** Gate 1 preparado para revisão independente. O próximo passo autorizado deve ser escolher e aprovar a fronteira de identidade; até lá, a tela permanece estritamente privada e somente leitura.
