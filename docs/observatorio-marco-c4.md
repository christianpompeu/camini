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

## Riscos bloqueantes para o Gate 2

- Não existe ainda identidade humana editorial provisionada no HML.
- A ponte Camini/HML ainda não possui contrato de confiança, rotação e revogação implementado.
- Os testes de autorização ainda são mocks; falta E2E com um usuário autorizado e um usuário sem permissão.
- O contrato de decisão precisa ser aprovado antes de qualquer botão ou Server Action persistente.

**Conclusão:** Gate 1 preparado para revisão independente. O próximo passo autorizado deve ser escolher e aprovar a fronteira de identidade; até lá, a tela permanece estritamente privada e somente leitura.
