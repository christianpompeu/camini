# Camini Observatório — páginas públicas

Data da implementação: 23/10/2026  
Escopo: canais Panorama e Tech, assinatura em estado de preparação e leitura pública de edições publicadas.

## Arquitetura

A camada pública é independente do dashboard editorial privado. Nenhuma rota pública chama `readAuthorizedObservatorioEdition()`, consulta o Notion ou reutiliza a autorização de revisão. O navegador recebe somente o resultado já considerado publicável.

Fluxo de leitura:

1. A rota valida `identificador` com formato estável (`a-z`, `0-9` e hífens, até 160 caracteres).
2. `lib/observatorio/public.ts` executa consulta server-only pontual por `identificador` e `canal`.
3. A própria consulta exige `status = publicada`, `aprovada_em`, `publicada_em` e `snapshot` não nulos.
4. `isPublicEdition()` mantém a política central e acrescenta integridade do snapshot: schema 1, origem Notion registrada, `complete = true`, blocos presentes, hash SHA-256 no formato esperado e identificador/canal idênticos ao registro.
5. Qualquer divergência falha fechada com `null`; a rota responde 404 e metadados indisponíveis recebem `noindex, nofollow`.
6. O snapshot validado é renderizado por Server Components, sem API pública intermediária e sem serialização de candidatas, hashes privados ou decisões editoriais.

A credencial HML fica restrita a `OBSERVATORIO_HML_SUPABASE_SECRET_KEY`. Não há chave privilegiada com prefixo `NEXT_PUBLIC_`. A implementação não criou migration, RPC, policy, permissão ou mutação.

## Contrato público: separação de integridade, identidade e ciclo de vida

Para garantir consistência sem acoplamento indevido entre fontes e persistência, o validador público (`lib/observatorio/publication.ts`) distingue estritamente as seis dimensões do contrato:

1. **Validação do hash (SHA-256 canônico):**
   - Recalculado determinísticamente via `hashEditorialContent` a partir de `schemaVersion`, `notionPageId`, metadados congelados da edição e árvore de blocos de conteúdo.
   - Garante matematicamente a imutabilidade do snapshot e a rejeição de qualquer conteúdo adulterado ou incompleto (`complete !== true` ou blocos vazios).
   - O algoritmo C3 de hashing não é modificado.

2. **Identidade editorial:**
   - Correspondência estrita entre o registro em `observatorio_edicoes` e o snapshot congelado para:
     - `identificador` (com formato seguro `^[a-z0-9]+(?:-[a-z0-9]+)*$`);
     - `canal` (`panorama` ou `tech`);
     - `titulo`;
     - `resumo`;
     - Identidade e URL da página de origem no Notion (`notionPageId === edition.notion_page_id` e `notionUrl === edition.notion_url`).
   - Impede que uma edição de um canal seja servida em outro, ou que snapshots de páginas diferentes sejam associados à mesma linha.

3. **Timestamps de origem (metadados editoriais):**
   - `snapshot.edition.criadaEm`: data editorial original no Notion (ex: `"2026-10-22"`).
   - `snapshot.edition.publicadaEm`: data original da fonte (atualmente nula nas candidatas do Notion).
   - Pertencem ao snapshot original e fazem parte do cômputo do hash C3. Não devem ser alterados nem comparados com timestamps operacionais do banco.

4. **Timestamps operacionais (Supabase HML):**
   - `observatorio_edicoes.criada_em`: timestamp de inserção do registro no Supabase HML (ex: `"2026-10-23T02:32:42Z"`).
   - `observatorio_edicoes.publicada_em`: timestamp operacional preenchido exclusivamente no momento da publicação efetiva.
   - Representam eventos de infraestrutura e persistência no HML, de natureza temporal diferente da criação editorial no Notion. O validador não exige igualdade entre esses timestamps e os de origem.

5. **Autorização humana (Gate C4):**
   - Exigência estrita de aprovação formal registrada: `edition.aprovada_em !== null`.
   - Nenhuma edição é publicável sem a decisão editorial humana aprovada e auditada de forma append-only.

6. **Publicação efetiva:**
   - Exigência combinada de `edition.status === "publicada"`, `edition.aprovada_em !== null`, `edition.publicada_em !== null` e `publicEditionSnapshot(edition) !== null`.
   - Sem a presença cumulativa de todos esses critérios, a edição é sumariamente descartada da projeção pública (retornando 404 seguro).

## Rotas

- `/panorama` e `/tech`: páginas públicas dos canais; permanecem acessíveis sem edição publicada e exibem estado de preparação.
- `/panorama/assinar` e `/tech/assinar`: cadastro informativo; não simula persistência enquanto a infraestrutura não existe.
- `/panorama/edicoes/[identificador]`: leitura pública de edição Panorama.
- `/tech/edicoes/[identificador]`: leitura pública de edição Tech.

Uma edição Tech consultada pela rota Panorama — ou o inverso — não é retornada. Parâmetros, query strings e headers não participam da decisão de elegibilidade.

## Componentes

- `components/observatorio/public-edition-shell.tsx`: navegação e moldura pública responsiva.
- `components/observatorio/public-edition-page.tsx`: cabeçalho editorial, resumo, tópicos comprovados, corpo, arquivo e CTA.
- `components/observatorio/public-snapshot-view.tsx`: renderização recursiva de rich text, headings, parágrafos, listas, tarefas, citações, callouts, código, tabelas, imagens seguras, links, referências e fallback explícito.
- `components/observatorio-public/*`: páginas institucionais e de assinatura compartilhadas entre os canais.
- `lib/observatorio/publication.ts`: política pura de elegibilidade e integridade.
- `lib/observatorio/public.ts`: repositório público server-only e consultas mínimas.
- `lib/observatorio/public-metadata.ts`: título, descrição, canonical, Open Graph condicional e negação de indexação para indisponíveis.

O componente privado `components/observatorio/editorial-snapshot-view.tsx` e a rota `/dashboard/observatorio/edicoes/[identificador]` permanecem protegidos e não foram transformados em conteúdo público.

## Conteúdo e fallbacks

“Nesta edição” é derivado somente de headings e `child_page` do snapshot. “Resumo da edição” usa o resumo persistido. Arquivo recente inclui apenas outras edições que passam pela mesma política. Não são inventados autoria, tempo de leitura, tendências, conexões causais, citações, imagens ou classificações.

Links aceitam apenas HTTP/HTTPS e abrem com `noopener noreferrer`. Imagens são exibidas apenas quando o bloco editorial possui URL HTTP/HTTPS; mídia sem URL segura recebe fallback explícito. Blocos não representáveis mostram o tipo omitido e continuam renderizando filhos, evitando perda silenciosa de conteúdo.

Na ausência de publicação real:

- os canais mostram “Primeira edição em preparação”;
- a rota dinâmica devolve 404 sem revelar se existe candidata com o mesmo identificador;
- metadata da edição indisponível usa `noindex, nofollow`;
- não há entrada adicionada a sitemap ou feed.

## Responsividade e referências visuais

O layout é mobile-first e mantém uma coluna entre 375–390 px. Conteúdo longo usa `min-w-0`, links quebram linha, tabelas têm rolagem horizontal e mídias respeitam a largura disponível. Em desktop, o corpo usa largura de leitura e sidebar contextual sticky quando há tópicos ou arquivo.

Referências verificadas no repositório:

- Panorama, desktop + mobile: `docs/observatorio/Imagem do ChatGPT 23 de out. de 2026, 01_37_06-1.png`.
- Tech, desktop + mobile: `docs/observatorio/Imagem do ChatGPT 23 de out. de 2026, 01_37_07-2.png`.

Essas imagens contêm dados demonstrativos e serviram apenas para hierarquia, proporção e linguagem visual. Nenhum fato, autor, duração de leitura ou mídia do mockup foi inserido no produto.

Capturas do smoke local sem conteúdo publicado:

- Panorama desktop: `docs/observatorio-publico-screenshots/panorama-desktop.png`.
- Tech desktop: `docs/observatorio-publico-screenshots/tech-desktop.png`.
- Panorama assinatura mobile: `docs/observatorio-publico-screenshots/panorama-assinar-mobile.png`.
- Tech assinatura mobile: `docs/observatorio-publico-screenshots/tech-assinar-mobile.png`.

Não há captura fabricada de uma edição publicada: o HML permanece sem edição elegível. A tela positiva está coberta por fixture isolada e deve receber screenshots desktop/mobile após a primeira publicação real aprovada.

## Testes

`npm run test:observatorio-public` cobre:

- edição publicada válida com formato realista e timestamps desacoplados;
- candidata, aprovada sem publicação e rejeitada negadas;
- timestamps operacionais de aprovação/publicação ausentes;
- snapshot ausente, vazio, divergente ou com hash inválido;
- canal divergente;
- identificador inválido e tentativa de manipulação;
- blocos aninhados;
- referências seguras e descarte de esquemas perigosos;
- ausência de mídia por fallback;
- filtros de elegibilidade feitos na consulta server-only;
- ausência de API pública de snapshot e de segredo público;
- rotas como Server Components e estrutura responsiva;
- páginas públicas/assinatura e ausência de persistência simulada.

A verificação final também executa os testes C1–C4 existentes, TypeScript, ESLint, build e smoke HTTP das rotas públicas. Como o HML não possui edição publicada, a validação positiva usa fixture local isolada; nenhum registro remoto é alterado.

## Dependências para a primeira publicação real

1. Concluir aprovação editorial humana pelos Gates posteriores autorizados.
2. Publicar explicitamente uma edição, preenchendo `aprovada_em`, `publicada_em` e snapshot integral congelado.
3. Confirmar que identificador e canal do snapshot correspondem à linha publicada.
4. Validar URLs de mídia e direitos de publicação antes de incluí-las no snapshot.
5. Executar revisão independente do conteúdo, SEO, acessibilidade e screenshots da edição real.

Até essas condições existirem, as seis candidatas do HML continuam privadas e nenhuma pode aparecer nas rotas de edição.

## Auditoria final de navegação e integridade

Correções aplicadas:

- `lib/observatorio/publication.ts`: remoção das comparações indevidas entre timestamps de origens distintas (`snapshotEdition.criadaEm !== edition.criada_em` e `snapshotEdition.publicadaEm !== edition.publicada_em`). Todas as demais regras de integridade (status, aprovação, publicação, hash canônico, canal, identificador, identidade Notion, título, resumo e árvore de blocos) foram preservadas integralmente.
- `lib/observatorio/__tests__/public-editions.test.ts` e `lib/observatorio/__tests__/public-pages.test.ts`: fixtures atualizadas para reproduzir o formato realista do HML (`snapshot.edition.criadaEm = "2026-10-22"`, `edition.criada_em = "2026-10-23T02:32:42Z"`, `snapshot.edition.publicadaEm = null`, `edition.publicada_em = "2026-10-23T04:00:00Z"`), cobrindo o cenário positivo e todos os cenários negativos (candidata, aprovada sem publicação, sem aprovada_em, sem publicada_em, hash adulterado, canal divergente, identificador divergente, página de origem divergente e snapshot incompleto). Nenhuma fixture grava no HML.
- `package.json`: inclusão de `--conditions=react-server` em `test:observatorio` para alinhamento com a proteção `server-only` das dependências compartilhadas.

Evidências executadas:

- `npm run test:observatorio-public`: 11/11 testes aprovados (positivo desacoplado e matriz completa de negativos).
- `npm run test:observatorio-c3`: 13/13 aprovados.
- `npm run test:observatorio-c4`: 5/5 aprovados.
- `npm run test:observatorio-c4-contract`: 6/6 aprovados.
- `npm run test:observatorio`: 6/6 aprovados.
- `npm run test:observatorio-backend`: 3/3 aprovados.
- TypeScript (`npx tsc --noEmit`): aprovado sem erros.
- ESLint direcionado do escopo Observatório: aprovado com 0 erros e 0 warnings.
- Next.js build de produção (`npm run build`): aprovado gerando 86 páginas com rotas estáticas e dinâmicas corretas.
- Zero escritas ou modificações no Notion, HML, produção ou outros módulos.

Parecer: GO para a correção do contrato público e desacoplamento de timestamps. Prontidão técnica mantida para a primeira publicação real quando os gates editoriais humanos forem concluídos.

## Mapa Final de Integração e Navegação (Panorama & Tech)

A integração dos produtos públicos **Panorama** e **Tech** unifica a experiência do ecossistema Camini, estabelecendo canais fluidos de descoberta, navegação editorial e assinatura, respeitando integralmente a identidade Studio Admin e os gates de publicação.

### 1. Topologia de Rotas e Pontos de Acesso

- **Página Inicial (`app/page.tsx`):**
  - Seção dedicada e harmoniosa **Camini Observatório / Publicações & Conteúdo Editorial** posicionada imediatamente antes dos módulos operacionais, sem alterar nenhum módulo pré-existente (Dashboard Central, Radar Tributário, RM SQL AI, App FORÇA, Calendário Público, Design System).
  - Cartão **Panorama**: link principal `/panorama`, atalho de arquivo `/panorama#edicoes`, síntese sobre negócios e gestão, e badge "Semanal".
  - Cartão **Tech**: link principal `/tech`, atalho de arquivo `/tech#edicoes`, síntese sobre produto, arquitetura e IA, e badge "Quinzenal".
  - Rodapé da Home enriquecido com links diretos para `/panorama` e `/tech`.

- **Navbar Desktop Principal (`components/layout/navbar.tsx`):**
  - Item agrupador único **Observatório** implementado com dropdown acessível Base UI (`@base-ui/react/menu` / Studio Admin), eliminando o risco de sobrecarga horizontal ou quebra em telas médias (768px–1024px).
  - O dropdown apresenta os dois canais editoriais com distinção visual, periodicidade ("Semanal" e "Quinzenal") e sínteses de escopo.
  - Detecção ativa inteligente: o menu se destaca quando o usuário navega em rotas filhas de `/panorama` ou `/tech`.

- **Menu Mobile Geral (`components/layout/mobile-sidebar.tsx`):**
  - Nova seção **Publicações** posicionada estrategicamente no topo da navegação, logo após o link do Início e antes de "Módulos & Aplicações".
  - Entradas dedicadas para **Panorama** e **Tech** com ícones temáticos (`Compass` e `Cpu`), tags de periodicidade, descrições compactas e destaque de rota ativa (`isPanorama`, `isTech`).

- **Cabeçalhos Públicos (`components/observatorio-public/public-header.tsx` e `components/observatorio/public-edition-shell.tsx`):**
  - Navegação desktop e gaveta mobile unificadas oferecendo acesso cruzado imediato a:
    1. **Panorama** (`/panorama`);
    2. **Tech** (`/tech`);
    3. **Arquivo de Edições** do canal ativo (`/panorama#edicoes` e `/tech#edicoes`);
    4. **Assinatura** do canal ativo (`/panorama/assinar` e `/tech/assinar`).
  - O alvo `#edicoes` utiliza o elemento `<section id="edicoes">` já presente em `PublicProductPage`, com suporte nativo a scroll suave e margem de rolagem (`scroll-mt-24`).

- **Middleware Supabase (`lib/supabase/middleware.ts`):**
  - Declaração explícita de `"/panorama"` e `"/tech"` na lista `ALWAYS_PUBLIC_PREFIXES`.
  - Rotas públicas e dinâmicas de edição operam sem bloqueio indevido de autenticação, enquanto `/dashboard/observatorio` e rotas administrativas permanecem sob proteção estrita de sessão.

### 2. Matriz de Navegação

| Origem | Destino Panorama | Destino Tech | Destino Edições (Âncora) | Destino Assinatura |
|---|---|---|---|---|
| **Home (`/`)** | Card / Botão (`/panorama`) | Card / Botão (`/tech`) | Links nos Cards (`#edicoes`) | Via canais |
| **Navbar Desktop** | Dropdown Observatório (`/panorama`) | Dropdown Observatório (`/tech`) | Via página do canal | Via página do canal |
| **Menu Mobile Drawer** | Seção Publicações (`/panorama`) | Seção Publicações (`/tech`) | Via página do canal | Via página do canal |
| **Header Público (`PublicHeader`)** | Link navegação (`/panorama`) | Link navegação (`/tech`) | Link âncora (`/${channel}#edicoes`) | Botão CTA (`/${channel}/assinar`) |
| **Shell de Leitura (`PublicEditionShell`)** | Link navegação (`/panorama`) | Link navegação (`/tech`) | Link âncora (`/${channel}#edicoes`) | Botão CTA (`/${channel}/assinar`) |

### 3. Limitações de Validação Visual

- **Ambiente HML e local sem edições publicadas:** Como o banco HML contém exclusivamente 6 edições em estado de preparação editorial (candidatas), a navegação pelas rotas de edição real `/panorama/edicoes/[identificador]` e `/tech/edicoes/[identificador]` resulta em 404 intencional e seguro. A renderização de edições reais foi validada por meio de fixtures com snapshots completos e válidos em `npm run test:observatorio-public`.
- **Validação de âncora `#edicoes`:** O scroll para `#edicoes` funciona perfeitamente nas páginas `/panorama` e `/tech`, posicionando a visualização diretamente sobre a lista/mensagem de arquivo editorial.
- **Isolamento de dados:** Nenhuma alteração foi realizada em migrations, dados do HML, credenciais do Notion ou contratos C3/C4 de snapshot.

