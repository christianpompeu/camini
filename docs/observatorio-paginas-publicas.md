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

- edição publicada válida;
- candidata, aprovada sem publicação e rejeitada negadas;
- timestamps de aprovação/publicação ausentes;
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
