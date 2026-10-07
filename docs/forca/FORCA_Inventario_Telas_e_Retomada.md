# FORÇA — Inventário de telas e retomada

07/10/2026 · arquivo Figma 5Yt7Z7ACx2EsAmPw6dunHp

Link: https://www.figma.com/design/5Yt7Z7ACx2EsAmPw6dunHp

## Páginas

- 01 • Protótipo mobile: 0:1, com 34 telas de 390×844.
- 00 • Sistema e guia: 2:6, com tokens claros, estilos Geist e componentes locais.
- 02 • Desktop e evolução: 2:7, criada, ainda vazia.

O arquivo foi interrompido pelo limite MCP do plano Starter. A conclusão integral do protótipo permanece pendente. Não recriar um arquivo novo nem refazer telas já construídas ao retomar.

## Telas criadas

| Nº | Tela | Node ID | Escopo |
|---|---|---|---|
| 01 | Cada série conta. | 3:42 | V1 / estado |
| 02 | Vamos ao treino? | 3:43 | V1 / estado |
| 03 | Pernas e Core | 3:44 | V1 / estado |
| 04 | Agachamento Goblet | 3:45 | V1 / estado |
| 05 | Respire. Recupere. | 3:46 | V1 / estado |
| 06 | Seu treino, em ordem | 3:47 | V1 / estado |
| 07 | Ajustar registro | 3:48 | V1 / estado |
| 08 | Trocar exercício | 3:49 | V1 / estado |
| 09 | Finalizar por hoje? | 3:50 | V1 / estado |
| 10 | Treino registrado. | 3:51 | V1 / estado |
| 11 | Entenda o movimento | 3:52 | V1 / estado |
| 12 | Remada unilateral | 3:53 | V1 / estado |
| 13 | Veja com calma | 3:54 | V1 / estado |
| 14 | A ficha segue com você | 3:55 | V1 / estado |
| 15 | O caminho percorrido | 3:56 | V1 / estado |
| 16 | Treino A | 3:57 | V1 / estado |
| 17 | Compare o comparável | 3:58 | V1 / estado |
| 18 | Ainda sem registros | 3:59 | V1 / estado |
| 19 | Uma base para continuar | 3:60 | V1 / estado |
| 20 | Editar ficha | 3:61 | V1 / estado |
| 21 | Revise o que muda | 3:62 | V1 / estado |
| 22 | Sua semana possível | 3:63 | V1 / estado |
| 23 | Pronto para levar | 3:64 | V1 / estado |
| 24 | Do seu jeito | 3:65 | V1 / estado |
| 25 | Duas versões encontradas | 3:66 | V1 / estado |
| 26 | Vamos continuar? | 3:67 | V1 / estado |
| 27 | Prancha | 3:68 | V1 / estado |
| 28 | Farmer’s Walk | 3:69 | V1 / estado |
| 29 | Uma sugestão, com motivo | 3:70 | Evolução IA |
| 30 | Atualizar com intenção | 3:71 | Evolução IA |
| 31 | Biblioteca durante descanso | 6:2 | V1 / estado |
| 32 | Treino completo | 6:24 | V1 / estado |
| 33 | Descanso pausado | 6:44 | V1 / estado |
| 34 | Entrar no Camini | 6:65 | V1 / estado |

## Componentes

- Button/primary: 3:2
- Button/outline: 3:4
- Button/ghost: 3:6
- Button/disabled: 3:8
- ListRow: 3:11
- Metric: 3:14
- Notice: 3:18
- NumberStepper: 3:21
- RestDock: 3:27
- SetRow: 3:31
- NavItem: 3:33
- Field: 3:35

Coleção semântica clara: VariableCollectionId:2:9. A tentativa de segundo modo foi rejeitada por limite de um modo. Tokens escuros devem usar solução compatível com o plano ou ser retomados quando suportados; não afirmar que já existem.

## Exportação e revisão visual recebida — 07/10/2026

Christian enviou os 34 PNGs em 2x (780×1688). Integridade e dimensões verificadas em todos os arquivos. Triagem panorâmica das 34 telas e inspeção individual de 02, 04, 09, 10, 17, 31, 32 e 34. O guia visual registra sobreposições e correções; esta revisão não é aprovação final. Imagens preservadas sem retoque em `docs/forca/design-reference/`; consultar `FORCA_Guia_Visual_Antigravity.md`.

## O que foi verificado

- Leitura de código e fontes canônicas antes do desenho.
- Busca de Code Connect na árvore: nenhum arquivo .figma encontrado para os componentes relevantes.
- Arquivo inicialmente vazio. Biblioteca de equipe consultada; Button/Card/background/Geist não retornaram ativos compatíveis. Componentes locais seguem o código atual.
- 30 telas-base construídas com texto e instâncias editáveis; leitura estrutural confirmou Geist.
- 240 links iniciais registrados; estados 31–34 receberam conexões adicionais. Não houve teste manual exaustivo em modo apresentação.
- Screenshot da sessão ativa inspecionado; altura ajustada para manter navegação visível. Configurações também recebeu ajuste por evidência estrutural.
- Telas-base foram movidas para a página mobile, com pais confirmados após a organização.

## Pendências exatas antes de considerar o Figma concluído

1. Ler o estado atual das três páginas e confirmar IDs. Não assumir que o arquivo permaneceu intacto após esta entrega.
2. Inserir imagem real nas áreas 4:606 e 4:646. Fonte localizada: https://drive.google.com/file/d/1W7ukec83BxOgt5K0RC59a-SsJWyMe0Af/view. As áreas ainda são placeholders. A prévia otimizada do arquivo original está incluída no pacote; não gerar imagem substituta nem atribuí-la a outro exercício.
3. Corrigir os achados V01–V11 do guia visual e realizar QA final: sobreposições nas telas 02, 09, 10, 17 e 32; contagem de séries por medida; áreas de toque; mídia real; timer na galeria. A triagem das 34 exportações foi feita, sem correção do Figma por limite MCP.
4. Atualizar o guia de escopo: agora são 34 telas, sendo 29–30 evolução IA. A legenda antiga não cobre os quatro estados acrescentados.
5. Ligar entradas claras para 26 (retomar), 29/30 (IA futura), 32 (completo) e 34 (login). Não apresentar IA como funcional na v1.
6. Refinar caminhos por exercício: sessão usa Goblet; galeria real disponível é remada unilateral. A sessão foi direcionada à biblioteca para evitar exibir mídia do exercício errado. Ainda falta galeria contextual completa.
7. Refinar RIR e stepper como interações de protótipo, variações de esforço, aquecimento/trabalho, validação e erro. Hoje são controles desenhados, não simulação integral de estado.
8. Na tela 08, seleção de substituição precisa de revisão explícita antes de aplicar; no editor, adicionar o detalhe de exercício, controles reais de ordem e comparação granular. Projeções atuais são pontos de partida.
9. Separar “sem internet”, “enviando”, “erro transitório”, “conflito” e “sincronizado” em variações. O botão tentar sincronizar não deve sempre resultar em conflito, como simplificação do fluxo atual.
10. Transformar galeria em overlay/sheet com timer ainda acessível; adicionar zoom/navegação entre ativos quando disponíveis. Não alegar reprodução de vídeo sem ativo.
11. Criar três telas desktop: Hoje/planejamento, sessão em duas colunas com dock, histórico/progresso com detalhe. Criar variante tablet conforme especificação.
12. Criar amostras dark (Hoje e sessão), usando valores atuais do CSS. Não aplicar a paleta histórica.
13. Criar estados de carregamento, busca vazia, erro de gravação/quota, confirmação de descarte, sessão expirada e atualização PWA. Estão especificados no produto, mas ainda não todos desenhados.
14. Definir pontos de início do protótipo e testar os fluxos principais por clique, inclusive voltar/cancelar. Auditar todos os destinos após alterações de página.
15. As 34 telas foram exportadas por Christian e organizadas no pacote visual. Após corrigir o Figma, reexportar os frames alterados e substituir a revisão visual; os PNGs atuais registram as falhas ainda presentes.

## Escopo das interações nesta versão

Os links representam navegação entre estados. Não são um motor funcional de treino: campos não gravam dados, incrementos não executam lógica real, timers não contam e IA não gera recomendações. O código de produção deve implementar os contratos do documento de arquitetura; o Figma não serve como prova de persistência, sincronização ou validação física do exercício.

## Roteiros de revisão

- Entrada: 34 → 01 → 19 → 03 → 04.
- Sessão parcial: 04 → 05 → 06 → 09 → 10 → 15 → 16.
- Descanso e consulta: 05 → 31 → 12 → 13 → 12; revisar retorno à sessão e persistência do dock.
- Correção: 04 → 07 → 04.
- Edição: 19 → 20 → 21 → 19.
- Offline: 02 → 23 → 25; separar erro comum de conflito antes da homologação.
- Medidas alternativas: 03 → 27; 19 → 28.
- Evolução futura: 17 → 29 → 30 → 21; revisar o acesso “Entender métricas”, que deve abrir explicação de métricas, não pular para IA.

## Próximo comando de retomada

“Continue o protótipo FORÇA no arquivo Figma 5Yt7Z7ACx2EsAmPw6dunHp. Leia FORCA_Inventario_Telas_e_Retomada.md e o estado do arquivo. Preserve as 34 telas e componentes existentes. Conclua primeiro mídia, revisão de fluxos e desktop; depois dark e QA final. Não declare concluído sem verificar todas as telas solicitadas. O design usa a branch forca do Camini, Studio Admin/shadcn base-nova neutral e Geist.”


## Atualização de referências de mídia — 07/10/2026

Pasta indicada por Christian: https://drive.google.com/drive/folders/1QYlMevY8HS9g0kTeeziUJoWQLu4osV2a. Foram localizados 103 PNGs em 13 conjuntos atuais (A: 24; B: 40; C: 39) e 12 referências soltas. Consulte `FORCA_Referencias_Midia_ABC.md` e `media-reference/manifest.json`. A ficha B foi localizada e transcrita; D/E e vídeos são produção futura. Panturrilha A e o arquivo 8 da remada unilateral não foram encontrados nessa estrutura. A numeração não determina papel semântico; o Goblet foi conferido e difere da ordem normativa do Brain. A origem deve prevalecer no mapeamento explícito do ativo, sem modificar a regra de produção. Dez amostras reais acompanham o pacote.
