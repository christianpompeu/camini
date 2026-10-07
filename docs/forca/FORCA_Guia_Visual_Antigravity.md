# FORÇA — Referências visuais para o Antigravity

Revisão de 07/10/2026 · exportações enviadas por Christian · Camini / branch `forca`.

## Como usar

1. Copie a pasta `docs/forca` deste pacote para a raiz do repositório Camini. Se já houver documentação com os mesmos nomes, compare as versões antes de substituir.
2. Abra `docs/forca/design-reference/index.html` para navegar pelas 34 imagens. A galeria funciona localmente, sem servidor, CDN, login ou MCP.
3. No Antigravity, forneça `docs/forca/INICIAR_NO_ANTIGRAVITY.txt`. Ele aponta para o Prompt 1 completo e para este guia.
4. O agente deve abrir visualmente os PNGs da etapa. Ler somente nomes de arquivos, JSON ou Markdown não comprova que enxergou a tela. Caso a IDE não abra imagens locais, anexe os PNGs diretamente à conversa em pequenos grupos. A checagem inicial usa 04, 05, 07 e 26; depois, os demais do Prompt 1.
5. Ao concluir, compare a aplicação em 390 px com as imagens e com as correções abaixo. Registre o que foi implementado e o que não foi validado; não avance automaticamente para a próxima fase.

## O que este pacote contém

- 34 PNGs de 780 × 1688 px: exportação em 2x de frames 390 × 844. O tamanho de referência CSS é 390 × 844, não 780 × 1688.
- Imagens preservadas byte a byte; só os nomes foram normalizados para evitar problemas de caminho. `screens.json` relaciona nome original, nome local, node ID e hash SHA-256.
- Galeria HTML e índice de telas. As imagens são retratos do protótipo nesta revisão; mudanças posteriores no Figma não se refletem automaticamente nelas.
- Arquitetura/roadmap, prompts completos e inventário de retomada atualizados com esta entrega visual.

Figma editável: https://www.figma.com/design/5Yt7Z7ACx2EsAmPw6dunHp

## Hierarquia das referências

Os contratos do produto definem comportamento e dados. Os componentes/tokens do código atual definem o sistema visual. Os PNGs orientam a composição das telas, com as correções deste documento aplicadas. O Figma é a fonte editável; o MCP é opcional para usar este pacote. Dados de exemplo não constituem histórico pessoal ou prescrição aprovada.

Não rasterizar a interface com as imagens nem criar 34 rotas automaticamente. Várias imagens representam estados de uma mesma tela (descanso, pausa, conclusão parcial/completa). Implementar componentes e estados reutilizáveis no módulo existente.

## Revisão visual e correções obrigatórias

Abertura e integridade verificadas nos 34 PNGs; triagem visual panorâmica das 34 telas e inspeção individual de 02, 04, 09, 10, 17, 31, 32 e 34. Isso não valida interações, acessibilidade, fidelidade integral ou execução do app. Os PNGs mantêm os problemas do original como evidência; nenhuma imagem foi retocada para disfarçar o estado do Figma.

| ID | Evidência | Correção na implementação e futura revisão do Figma |
|---|---|---|
| V01 | Tela 02: letra A encosta/sobrepõe o título Pernas e Core. | Usar fluxo vertical, gap e line-height apropriados no card. Sem posicionamento absoluto entre título e valor. |
| V02 | Telas 09, 10, 17 e 32: número grande encosta/sobrepõe a legenda. | Metric com label, value e description em blocos independentes; altura automática e espaçamento. Verificar números de um, dois e três dígitos e rótulos longos. |
| V03 | Tela 09 usa 13 previstas; tela 32 usa 13 e mais 2 séries por tempo. | Não confundir tipo de medida com tipo de série. A ficha A ilustrada soma 15 séries de trabalho (13 por repetições + 2 por tempo). Contar todas as séries de trabalho no total e discriminar por medida quando útil; não somar segundos à tonelagem. Calcular pela ficha real, nunca fixar 13 ou 15 globalmente. |
| V04 | Telas 12 e 13 têm retângulos vazios; tela 11 diz mídia disponível. | São placeholders. Só mostrar disponível após vincular ativo real do exercício correto. No app, ausência usa fallback textual claro. A ficha original possui proporção 9:16, com contain e ampliação. |
| V05 | Timer e ação Editar têm rótulos/áreas visuais muito pequenos. | Construir botões reais, foco de teclado e rótulos acessíveis. Alvos mínimos de 44 px; controles principais da sessão de 48 px. Garantir área tocável para Pausar/Retomar, +30 s, Pular, Aquecimento/Trabalho e Editar. |
| V06 | A tela 31 tem dock do descanso; 12/13 não mostram sua continuidade. | A consulta e a galeria devem preservar timer e sessão. Dock acessível ou retorno explícito sem perder estado; overlay não pode ocultar controles essenciais. |
| V07 | Tela 32 diz sincronizada; telas 10 e 23 dizem aguardando envio. | Exibir a situação real da persistência. Na F1 local, nunca anunciar sincronização implementada. Não copiar texto estático como estado operacional. |
| V08 | Telas 29/30 representam IA futura, sem histórico real. | Manter fora do fluxo funcional inicial; implementar somente na fase própria, após dados e validação. |
| V09 | Não há desktop/tablet nem tema escuro exportados. | Usar tokens atuais e responsividade do Camini; a adaptação é proposta de implementação a validar. Não afirmar que corresponde a uma tela Figma inexistente. |
| V10 | Todas as capturas têm altura fixa e cantos arredondados. | São molduras de referência. O app usa fluxo responsivo, rolagem e safe-area real; não limitar conteúdo a 844 px nem transformar a página inteira em um cartão de telefone. Reservar espaço para navegação, dock e teclado. |
| V11 | Tela 34 ilustra email/senha. | Revalidar e reutilizar a autenticação vigente do Camini. A imagem não determina um novo contrato de login. |

## Seleção visual por prompt

| Prompt | Etapa | Telas a consultar |
|---|---|---|
| 1 | F0 + núcleo F1 | 04, 05, 06, 07, 09, 10, 26, 27, 28, 31, 32, 33. Começar por 04, 05, 07, 26. |
| 2 | Fichas e catálogo F2 | 01, 02, 03, 08, 11, 12, 19, 20, 21, 22. |
| 3 | Offline F3 | 14, 23, 24, 26; reutilizar os estados de sessão. |
| 4 | Sincronização F4 | 10, 16, 23, 25, 32, 34. |
| 5 | Histórico e mídia F5 | 11, 12, 13, 14, 15, 16, 17, 18, 22, 31. |
| 6 | IA assistiva F6 | 17, 21, 29, 30. |

As telas orientam a fase, mas não ampliam seu escopo. A F1 não implementa backend, autenticação nova, mídia remota ou IA apenas porque alguma captura os menciona.

## Critério de revisão antes de aceitar a etapa

- O agente lista quais imagens abriu e descreve elementos concretos, incluindo falhas que decidiu corrigir.
- A interface preserva tokens e componentes atuais, com layout em fluxo e texto legível.
- As sobreposições V01/V02 não aparecem na aplicação; counts e estados são derivados de dados.
- Teste visual no celular inclui rolagem, teclado, campos longos, foco e área de toque. Versões desktop e dark ficam explicitamente como propostas até revisão.
- Evidências de navegação e persistência vêm do app. Os PNGs não comprovam timer, sincronização ou funcionamento offline.

## Índice dos arquivos

| Nº | Tela exportada | Grupo | PNG local | Node ID |
|---|---|---|---|---|
| 01 | Boas-vindas | Entrada | [01-boas-vindas.png](design-reference/01-boas-vindas.png) | `3:42` |
| 02 | Hoje | Entrada | [02-hoje.png](design-reference/02-hoje.png) | `3:43` |
| 03 | Ficha A | Fichas | [03-ficha-a.png](design-reference/03-ficha-a.png) | `3:44` |
| 04 | Sessão ativa | Sessão | [04-sessao-ativa.png](design-reference/04-sessao-ativa.png) | `3:45` |
| 05 | Descanso | Sessão | [05-descanso.png](design-reference/05-descanso.png) | `3:46` |
| 06 | Sequência | Sessão | [06-sequencia.png](design-reference/06-sequencia.png) | `3:47` |
| 07 | Corrigir série | Sessão | [07-corrigir-serie.png](design-reference/07-corrigir-serie.png) | `3:48` |
| 08 | Trocar exercício | Sessão | [08-trocar-exercicio.png](design-reference/08-trocar-exercicio.png) | `3:49` |
| 09 | Finalizar parcial | Sessão | [09-finalizar-parcial.png](design-reference/09-finalizar-parcial.png) | `3:50` |
| 10 | Resumo salvo | Sessão | [10-resumo-salvo.png](design-reference/10-resumo-salvo.png) | `3:51` |
| 11 | Biblioteca | Consulta e mídia | [11-biblioteca.png](design-reference/11-biblioteca.png) | `3:52` |
| 12 | Exercício | Consulta e mídia | [12-exercicio.png](design-reference/12-exercicio.png) | `3:53` |
| 13 | Galeria 9_16 | Consulta e mídia | [13-galeria-9-16.png](design-reference/13-galeria-9-16.png) | `3:54` |
| 14 | Mídia indisponível | Consulta e mídia | [14-midia-indisponivel.png](design-reference/14-midia-indisponivel.png) | `3:55` |
| 15 | Histórico | Histórico e progresso | [15-historico.png](design-reference/15-historico.png) | `3:56` |
| 16 | Sessão anterior | Histórico e progresso | [16-sessao-anterior.png](design-reference/16-sessao-anterior.png) | `3:57` |
| 17 | Progresso | Histórico e progresso | [17-progresso.png](design-reference/17-progresso.png) | `3:58` |
| 18 | Sem histórico | Histórico e progresso | [18-sem-historico.png](design-reference/18-sem-historico.png) | `3:59` |
| 19 | Minhas fichas | Fichas | [19-minhas-fichas.png](design-reference/19-minhas-fichas.png) | `3:60` |
| 20 | Editar ficha | Fichas | [20-editar-ficha.png](design-reference/20-editar-ficha.png) | `3:61` |
| 21 | Revisar versão | Fichas | [21-revisar-versao.png](design-reference/21-revisar-versao.png) | `3:62` |
| 22 | Planejar semana | Fichas | [22-planejar-semana.png](design-reference/22-planejar-semana.png) | `3:63` |
| 23 | Offline e downloads | Offline e conta | [23-offline-e-downloads.png](design-reference/23-offline-e-downloads.png) | `3:64` |
| 24 | Configurações | Offline e conta | [24-configuracoes.png](design-reference/24-configuracoes.png) | `3:65` |
| 25 | Conflito de sincronização | Offline e conta | [25-conflito-de-sincronizacao.png](design-reference/25-conflito-de-sincronizacao.png) | `3:66` |
| 26 | Retomar sessão | Sessão | [26-retomar-sessao.png](design-reference/26-retomar-sessao.png) | `3:67` |
| 27 | Registro por tempo | Sessão | [27-registro-por-tempo.png](design-reference/27-registro-por-tempo.png) | `3:68` |
| 28 | Registro por distância | Sessão | [28-registro-por-distancia.png](design-reference/28-registro-por-distancia.png) | `3:69` |
| 29 | Sugestão IA | IA futura | [29-sugestao-ia.png](design-reference/29-sugestao-ia.png) | `3:70` |
| 30 | Atualizar ficha com IA | IA futura | [30-atualizar-ficha-com-ia.png](design-reference/30-atualizar-ficha-com-ia.png) | `3:71` |
| 31 | Biblioteca durante descanso | Sessão | [31-biblioteca-durante-descanso.png](design-reference/31-biblioteca-durante-descanso.png) | `6:2` |
| 32 | Treino completo | Sessão | [32-treino-completo.png](design-reference/32-treino-completo.png) | `6:24` |
| 33 | Descanso pausado | Sessão | [33-descanso-pausado.png](design-reference/33-descanso-pausado.png) | `6:44` |
| 34 | Entrar no Camini | Offline e conta | [34-entrar-no-camini.png](design-reference/34-entrar-no-camini.png) | `6:65` |

## Atualização de referências de mídia — 07/10/2026

Pasta indicada por Christian: https://drive.google.com/drive/folders/1QYlMevY8HS9g0kTeeziUJoWQLu4osV2a. Foram localizados 103 PNGs em 13 conjuntos atuais (A: 24; B: 40; C: 39) e 12 referências soltas. Consulte `FORCA_Referencias_Midia_ABC.md` e `media-reference/manifest.json`. A ficha B foi localizada e transcrita; D/E e vídeos são produção futura. Panturrilha A e o arquivo 8 da remada unilateral não foram encontrados nessa estrutura. A numeração não determina papel semântico; o Goblet foi conferido e difere da ordem normativa do Brain. A origem deve prevalecer no mapeamento explícito do ativo, sem modificar a regra de produção. Dez amostras reais acompanham o pacote.
