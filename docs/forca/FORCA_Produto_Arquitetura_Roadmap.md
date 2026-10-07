# FORÇA — Produto, arquitetura e roadmap

Camini · Christian Pompeu · 07 de outubro de 2026 · versão 1.0 de planejamento

## 1. O produto que estamos construindo

O FORÇA deve ajudar Christian a consultar sua ficha, executar o treino, registrar o que realmente fez e acompanhar sua evolução. O centro da experiência é a próxima série. O histórico dá contexto; a inteligência artificial, quando houver dados suficientes, ajuda a interpretar. Nenhuma dessas camadas deve atrapalhar o registro durante o treino.

O objetivo inicial é força, preservando o programa A–E existente. Hipertrofia pode ser um resultado ou objetivo adicional, mas não substitui silenciosamente o objetivo declarado. A aplicação começa com um usuário, aproveitando a conta Camini; propriedade dos dados e isolamento por usuário precisam existir desde o início.

**Protótipo Figma:** https://www.figma.com/design/5Yt7Z7ACx2EsAmPw6dunHp

**Acervo desta entrega:** https://drive.google.com/drive/folders/1_YHVRqBZI1OPTQus1NxXrcmrB_xOkFYc

**Código analisado:** branch `forca`, commit `2545692805bd60ef452b21f6ada6137e4eff469b`, de 07/10/2026. Leitura estática; não houve execução de build nem homologação do aplicativo nesta tarefa.

## 2. O que já existe e o que ainda precisa ser feito

| Área | Evidência atual | Consequência |
|---|---|---|
| Identidade | Studio Admin, shadcn `base-nova`, base neutral, Geist/Geist Mono, Lucide | Reutilizar tokens e componentes atuais; identidade antiga é histórica. |
| Stack | Next.js 16.3.5, React 19.2.8, Tailwind 4, Zustand 5, Supabase já no projeto | Evoluir o projeto existente; não criar outro scaffolding. |
| Sessão | `store/useWorkoutStore.ts` com Zustand persist/localStorage | Existe persistência local inicial, mas ainda não é offline-first completo. |
| Timer | `components/workout/rest-timer.tsx` calcula por timestamp | Boa base; pausa e expiração precisam de correção. |
| Fichas | A/B/C demonstrativos embutidos em `app/forca/page.tsx` | Não correspondem ao A–E canônico sem máquinas. |
| Histórico | `completedWorkouts` no store, tela com registros fixos | Conectar a tela aos registros; não apresentar dados simulados como reais. |
| Progresso | Valores fixos, como “+4 kg nesta semana” | Remover da experiência real; métricas precisam de definições verificáveis. |
| PWA | Manifest e metadados existem; ícone apenas favicon | Não foi localizado service worker na árvore lida. Manifest não prova funcionamento offline. |
| Dados remotos/IA | Infraestrutura geral do Camini não prova integração FORÇA | Nenhuma migração, sincronização ou chamada Groq do FORÇA foi executada nesta tarefa. |

### Problemas concretos encontrados no núcleo

1. `logSet` rejeita `weight <= 0`: impede peso corporal/carga adicional zero. Tipos aceitam apenas peso e repetições; prancha e Farmer’s Walk precisam de tempo/distância.
2. `startWorkout(workoutDef: any)` impõe quatro séries a todos os exercícios e usa o foco do treino como grupo muscular de cada movimento.
3. A tela inicia a carga em 30 kg, reps em 10, RIR em 2 e assume que a primeira série é aquecimento. Esses valores não são a ficha aprovada nem o registro pessoal.
4. Rascunhos de carga/reps/RIR vivem em estado local do `ActiveSetCard`; o store recebe apenas séries concluídas. Atualizar a página pode perder a entrada ainda não confirmada.
5. O botão confirma visualmente antes de obter resultado de `logSet`; uma série inválida pode parecer registrada. A página inicia o descanso mesmo se a gravação tiver sido rejeitada.
6. IDs com `Date.now().toString()` e ausência de proteção contra duplo toque são frágeis. Usar identificadores estáveis e transação idempotente.
7. Avançar exercício não significa executá-lo: hoje a lista risca itens pelo índice. Guardar status real: não iniciado, em andamento, concluído, pulado.
8. `resetWorkout` elimina séries sem confirmação. Substituir por operações explícitas de retomar, finalizar parcial e descartar com confirmação.
9. `finishWorkout` limpa `activeWorkout`; a condição visual de “treino finalizado” dependente do objeto ativo se torna inalcançável nesse fluxo. Falta `endedAt` e duração consolidada.
10. `stopTimer` zera o timestamp e o efeito volta à duração original. Pausar pode perder o restante; ao expirar, a interface pode voltar ao tempo cheio. `resetTimer` usa um start/stop com timeout que merece substituição por uma ação atômica.
11. Validação de números finitos, RIR, metas, séries extras, hidratação e migração de versão do armazenamento não está estabelecida.

Esses pontos são achados de leitura do código, não resultados de testes executados.

## 3. Escopo da primeira versão utilizável

### Obrigatório para começar a usar com confiança

- Ficha A–E com origem, versão, data de revisão e pendências explícitas.
- Consulta de exercícios com instruções textuais e imagem essencial quando aprovada.
- Registrar séries por repetições, tempo ou distância; carga total, por halter, adicional ou sem carga externa.
- Distinguir aquecimento e trabalho, sem inferir o tipo pela posição.
- Retomar sessão e rascunho após fechar/reabrir; indicador de gravação local.
- Corrigir ou desfazer registro, acrescentar série extra, pular/reordenar exercício e substituir apenas nesta sessão.
- Timer não bloqueante com estados correndo, pausado, encerrado e inativo.
- Finalizar sessão completa ou parcial, preservando o que foi executado.
- Histórico real e resumo de cada sessão; exportação JSON e CSV.
- Preparação offline explícita: ficha, instruções e imagens essenciais. Vídeos opcionais.
- Sincronização com outbox e retorno claro de pendente, enviado, erro e conflito.
- Personalização manual e revisão de ficha sem reescrever o passado.
- Tema do sistema/claro/escuro e operação acessível no celular.

### Primeira evolução, sem bloquear o uso inicial

- Planejamento semanal editável, sem punir faltas nem reiniciar o ciclo.
- Comparações por exercício e convenção de carga, consistência e melhores séries.
- Galeria completa por função e variante de modelo; vídeos com download seletivo.
- Análise IA pós-sessão, explicação dos dados utilizados e aceite manual.

### Depois de validar o uso cotidiano

- Proposta de revisão de ficha por IA, com comparação antes/depois e nova versão.
- Adaptações por disponibilidade de tempo/equipamento, sempre revisadas.
- Superséries, deloads, periodização e ciclos mais complexos, se houver necessidade real.
- Integrações externas, wearables e uso por outros usuários somente em fases próprias.

Não incluir feed social, ranking, gamificação que premie treinar sem descanso ou um chat de IA permanente na tela de registro.

## 4. Programa de referência

Fonte: página canônica “Fitness — Sistema Pessoal de Treinos”, lida em 07/10/2026; metas de B complementadas pela ficha visual encontrada no Drive, identificada em FORCA_Referencias_Midia_ABC.md. Os números abaixo preservam o registro disponível. Não representam uma nova prescrição. Cargas pessoais não foram preenchidas.

| Treino | Exercícios e metas disponíveis |
|---|---|
| A — Pernas e Core | Goblet 4×5–8; romeno com barra 3×5–6; avanço reverso 3×6–8 por perna; panturrilha 3×10–15; prancha 2×45–90 s. |
| B — Empurrar | Supino no chão com halteres 4×5–8; desenvolvimento militar em pé com barra 3×5–6; flexão 3×8–12; elevação lateral 2×10–15; prancha 2×45–90 s. Transcrição da ficha B localizada em 07/10/2026 na pasta de mídia indicada por Christian; conciliar versão antes de ativar. |
| C — Puxar | Terra 3×3–5; remada curvada 3×6–8; remada unilateral 3×6–8 por lado; crucifixo inverso inclinado 2×10–15; rosca direta 2–3×6–10. |
| D — Full Body técnico/moderado | Goblet 3×5–8; supino no chão 3×5–8; remada curvada 3×6–8; elevação lateral 2×10–15; panturrilha 2×10–15. |
| E — Complementar | Desenvolvimento com halteres 3×5–8; remada unilateral 3×6–8 por lado; romeno 3×6–8; crucifixo inverso 2×10–15; Farmer’s Walk 2–3×20–40 m. |

Descansos, cargas iniciais, peso da barra e incrementos disponíveis devem vir da ficha/equipamento real ou ser informados pelo usuário. Faixas de séries, como 2–3, são preservadas como faixas e resolvidas explicitamente no treino; não transformar silenciosamente em quatro.

## 5. Navegação e fluxos

Navegação principal: **Hoje, Exercícios, Histórico e Progresso**. Minhas fichas e planejamento ficam acessíveis a partir de Hoje; configurações no cabeçalho. A sessão ativa possui retorno persistente em todas as áreas.

### Primeiro uso

Entrar com conta Camini → conhecer o FORÇA → revisar ficha A–E → conferir dados ausentes → preparar conteúdo offline → escolher treino. Não exigir onboarding longo a cada abertura.

### Uma sessão

Hoje → ficha → iniciar → registrar série → descanso → próxima série/exercício → revisar pendências → finalizar → resumo → histórico. Confirmar gravação local antes do feedback de sucesso. Uma sessão parcial é um resultado válido.

### Consulta durante o treino

Sessão → biblioteca/execução → galeria → voltar ao treino. A barra de descanso permanece acessível, inclusive com a galeria aberta na implementação. Navegação não pausa o timer. A tela Figma 31 representa biblioteca com descanso; overlay completo com timer ainda precisa de refinamento.

### Alterar ficha

Minhas fichas → rascunho → editar/reordenar/adicionar → comparar alterações → ativar nova versão. Sessão ativa mantém o snapshot anterior. Substituição “só hoje” não altera o template; “próximos treinos” passa pela revisão de versão.

### Recuperação e falhas

- Reabrir: restaurar contexto e rascunho, recalcular descanso, oferecer continuar ou encerrar parcial.
- Perder internet: manter gravação local, enfileirar envio; não interromper treino para autenticação.
- Sessão da conta expirada: preservar dados locais; pedir nova autenticação para sincronizar, sem atribuir dados a outra conta.
- Erro de armazenamento/quota: não fingir que gravou. Exibir falha persistente e permitir exportar registros já salvos.
- Conflito: preservar ambas as versões, comparar e resolver; não fundir ou duplicar silenciosamente.
- Atualização do PWA: adiar troca de versão durante sessão ativa; aplicar em momento seguro.

## 6. Direção de UX e componentes

Usar a identidade efetiva de `app/globals.css` e `components.json`: branco/neutros, preto nas ações primárias, borda discreta, raio-base 10 px, sem gradiente legado. Geist para interface; números tabulares e Geist Mono quando necessário.

Componentes Figma criados: Button (primary/outline/ghost/disabled), ListRow, Metric, Notice, NumberStepper, RestDock, SetRow, NavItem e Field. Mapeamento operacional para shadcn: Button, Card, Input, Tabs, Dialog/AlertDialog, Sheet, Switch/ToggleGroup, Badge, Select, Skeleton e Sonner, reaproveitando a configuração Base UI existente. Não presumir que toda a API instalada é Radix.

Alvos de toque de 44 px ou mais; aumentar controles da sessão para 48–56 px. Inputs de carga com teclado decimal, leitura de vírgula pt-BR e unidade explícita. Permitir digitação além dos botões +/−. RIR aceita 0, 1, 2, 3, 4+ e não informado; mostrar uma explicação curta. Nunca transformar valor ausente em zero.

Feedback acessível: foco visível, rótulos para ícones, estado além da cor e anúncio de série salva. Som/vibração e tela ativa são opcionais e dependem de suporte do dispositivo. Não prometer alerta preciso com o celular bloqueado.

### Desktop e tablet — especificação ainda não desenhada no Figma

- ≥1024 px: navegação lateral compacta; área central de registro e painel direito com sequência, descanso e consulta. Conteúdo limitado a aproximadamente 1200 px, sem esticar controles de carga pela tela toda.
- 768–1023 px: duas colunas quando houver espaço, mantendo ordem de leitura e ação principal próxima do registro.
- Mobile: uma coluna; dock de descanso e ações com safe area, teclado não encobrindo valores. Evitar acumular Navbar global, subheader, dock e bottom nav com alturas redundantes.
- Histórico desktop: lista/tabela com filtros e detalhe lateral. Editor de ficha: lista reordenável à esquerda e editor do exercício à direita. Progresso: seletor de exercício, série temporal e registros que sustentam cada ponto.
- Modo escuro segue tokens já presentes no código. O plano Starter bloqueou a criação de um segundo modo de variáveis; a entrega Figma contém a coleção clara. O desenho escuro permanece pendente.

## 7. Arquitetura proposta

Esta seção especifica a evolução; não descreve backend já implementado.

### Separação de responsabilidades

| Camada | Responsabilidade |
|---|---|
| Br[AI]n / Notion | Decisões duráveis, ficha de referência, método, roadmap e fontes. |
| Google Drive | Originais e versões dos ativos; pacote de planejamento e entregáveis. |
| Figma | Contrato visual, jornadas, componentes e estados. |
| Camini | Interface, comandos da sessão e revisão das sugestões. |
| IndexedDB | Sessões, rascunhos, snapshots de ficha e outbox no aparelho. |
| Cache Storage | Shell e mídias selecionadas/versionadas; distinto do banco de registros. |
| Supabase | Conta, dados operacionais sincronizados e distribuição de mídia. |
| Groq no servidor | Análise opcional de histórico, com saída validada e aceite do usuário. |

Não transportar automaticamente a arquitetura editorial do Radar para cada série de musculação. O Notion guarda conhecimento e planejamento; registros transacionais de treino pertencem ao aplicativo e ao Supabase.

### Motor local

Zustand coordena a interface; IndexedDB guarda os dados duráveis. Gravar série e operação de outbox na mesma transação. Carregar o store apenas após hidratar; bloquear “iniciar novo treino” enquanto a recuperação não termina. Persistir também o rascunho da série, exercício selecionado e estado do descanso.

Migrar `camini-workout-storage` com backup, validação, `schemaVersion` e marcação de migração. Não apagar registros antigos nem tratá-los como ficha aprovada. Separar dados por `userId`; impedir mistura entre contas. O app deve funcionar sem background sync: tentar envio na abertura, retorno ao foreground, evento de conexão e comando manual. `navigator.onLine` é apenas um sinal; sucesso depende da resposta do servidor.

Transições: sessão `active → completed | partial | discarded`; série `draft → saved → corrected | deleted`; sincronização `pending → syncing → synced | error | conflict`. “Descartar” exige confirmação e política explícita para exclusão remota.

### Timer

Guardar `status`, `endsAt`, `remainingMsWhenPaused` e duração configurada. Correndo: `max(0, endsAt - Date.now())`. Pausar captura restante; retomar cria novo prazo; +30s ajusta prazo ou restante; concluir produz estado `finished` estável em zero. Intervalo apenas redesenha, nunca é a fonte do tempo. Tratar retorno de visibilidade e mudança significativa do relógio; não prometer execução contínua em background.

### Modelo conceitual

Nomes são propostas; inspecionar o schema real antes de criar tabelas. Preferir namespace/prefixo consistente `forca_`, sem colisão com outros módulos.

| Entidade | Campos/contrato principais |
|---|---|
| exercise | id estável, nome, equipamento, músculos, measurementType, loadConvention, instruções, revisão editorial. |
| exercise_media | exerciseId, papel semântico, variante de modelo, assetVersion, storagePath, MIME, tamanho, duração, dimensões, checksum e origem Drive. |
| program / workout_template | proprietário, nome, objetivo, letra, estado e versão ativa. |
| workout_version / prescription | snapshot imutável, ordem, exerciseId, faixas de séries/reps/tempo/distância, descanso e observações. |
| session | UUID, userId, versão/snapshot, deviceId, início/fim, duração, estado, observações, revision. |
| session_exercise | snapshot do exercício, ordem, substituição, motivo, estado, lados. |
| set_record | UUID, sessionExerciseId, sequence, warmup/work, peso opcional, convenção, reps/segundos/metros conforme tipo, lado, RIR opcional, horário, revision/tombstone. |
| sync_operation | operationId UUID, entityId, baseRevision, payloadVersion, tentativa, erro, acknowledgedAt. |
| analysis_job / recommendation | sessionRevision, inputHash, modelo/promptVersion, estado, proposta estruturada, evidências, aceite/rejeição/expiração. |

Não deduzir identidade de exercício pelo nome, que pode mudar. Não usar um único campo `reps` para segundos ou metros. Para unilateral, guardar lado e a convenção da repetição; não duplicar automaticamente o volume. Carga por halter deve indicar quantos implementos contam no exercício, sem multiplicar cegamente toda remada por dois.

### Sincronização e acesso

UUIDs gerados no cliente e `operationId` único no servidor; reenvio não duplica. A API valida proprietário e formato, grava de modo transacional, devolve revision e confirmação. Atualizações usam comparação de revision, com conflito explícito. Evitar sobrescrita silenciosa por horário do cliente.

Autenticação reaproveita o Camini. RLS por proprietário nas tabelas expostas; `USING` e `WITH CHECK` adequados, inclusive tabelas filhas. Chaves privilegiadas e Groq somente no servidor. Não cachear páginas privadas de outros módulos nem respostas autenticadas por uma estratégia global indiscriminada.

Exportação não depende de rede: JSON versionado para recuperação e CSV legível para análise. Validar importação em futura fase; download JSON, sozinho, não comprova que restauração existe.

## 8. Mídias e offline

O Drive permanece como acervo original. Supabase Storage recebe derivados aprovados para distribuição. Isso não exige apagar, mover nem tornar públicos os originais.

Inventário localizado: pasta “Fitness — Arquivos do Projeto”, com fichas, imagens de exercícios, subpastas de treinos e pasta de imagens. Foram vistos arquivos legados com nomes ambíguos e extensões diferentes do MIME; verificar conteúdo antes de associar. Exemplo: “Crucifixo Inclinado” não pode ser automaticamente vinculado ao crucifixo inverso.

**Padrão canônico de oito imagens:** início homem; final homem; músculos vista 1; músculos vista 2; início mulher; final mulher; ficha masculina; ficha feminina. Consultar a página canônica para prompts e estilo. O documento antigo do Drive ainda se chama “7 imagens”; registrar como divergência e não replicar como norma vigente.

Usar papéis semânticos, não apenas `image1` a `image8`: `execution_start`, `execution_end`, `muscle_view_1`, `muscle_view_2`, `instruction_card`, com `model_variant` quando aplicável. Aceitar conjuntos incompletos sem fabricar mídia. Vídeo é um ativo separado, com poster, duração e versão.

Primeiro carregamento: texto e poster. Vídeo por toque; loop e velocidade opcionais, sem som automático. Galeria 9:16 usa `contain`, zoom e legenda, preservando músculos e instruções. A miniatura não deve forçar o download de todo o vídeo.

Pacote offline da ficha: metadados e instruções essenciais primeiro, imagens depois; vídeo opcional. Exibir tamanho, progresso, falhas e “disponível neste aparelho” somente após verificar os itens. Limpeza de mídia não remove sessões/outbox. Cache é sujeito a quota e expulsão pelo navegador; nunca dizer “baixou uma vez, está garantido para sempre”.

Por padrão, planejar ativos privados até classificação de publicação. Links assinados expiram; não persistir a URL como identidade da mídia. Usar caminho/version/hash estável, baixar autorizado e gerenciar cache por usuário. Recursos públicos só após decisão explícita. Na implementação, testar requisições de vídeo/Range e fallback de poster em aparelhos reais.

## 9. Progresso e IA

O desempenho registrado é um fato; a sugestão da IA é uma interpretação. Os dois precisam aparecer separados.

| Métrica | Regra proposta |
|---|---|
| Consistência | Contar sessões e dias treinados; diferenciar completa/parcial. Meta semanal é configurável. |
| Melhor série | Mostrar carga + reps + RIR, no mesmo exercício, equipamento, amplitude/variante e convenção de carga. Não comparar 24×5 com 22×10 como “+2 kg de força”. |
| Volume externo | Soma da carga externa efetiva × reps das séries de trabalho elegíveis. Excluir aquecimento por padrão e não juntar kg·rep com tempo/distância. |
| Tempo/distância | Guardar e comparar segundos ou metros com contexto próprio; não converter em tonelagem fictícia. |
| e1RM | Estimativa opcional em fase posterior; fórmula, elegibilidade e limitações precisam ser documentadas. Não é teste real de 1RM nem deve ser o único sinal. |
| Ausência de dados | “Sem registros” ou “Dados insuficientes”, nunca zero de desempenho. |

IA só após confirmação da sincronização da revisão da sessão, sem bloquear finalização. Job idempotente por sessão/revisão/hash; retry com limite, custo e timeout. Se corrigir a sessão, invalidar análise antiga. Enviar apenas contexto necessário; não enviar mídias ou informações pessoais sem necessidade.

Saída estruturada: exercício/versão, período analisado, fatos usados, proposta (`maintain`, `review`, `adjust`), razões, dados ausentes e validade. Validar unidades, faixa permitida, incrementos reais e referências. O modelo não executa comandos nem altera dados diretamente. Conteúdo de observações é dado, não instrução de sistema.

**RIR 1 não implica automaticamente aumentar carga.** Aumentar depende da prescrição, repetibilidade, técnica, metas atingidas, equipamento e contexto. Desconforto relatado não deve disparar aumento automático ou diagnóstico. Sugestão deve poder ser ignorada e o treino continuar.

Pedir atualização da ficha gera rascunho; mostrar diff; aceitar cria versão nova. Começar por revisão manual evita colocar uma dependência probabilística no núcleo do produto.

## 10. Roadmap para o Antigravity

Os códigos F0–F6 abaixo são exclusivos desta evolução FORÇA. Não substituem a nomenclatura das fases A–E do redesign global Camini nem afirmam que as fases do Gemini foram homologadas.

| Etapa | Entrega | Critério de saída |
|---|---|---|
| F0 — Reconciliação | Inventário atual, contratos, fontes A–E, remoção de histórico fictício no modo real | Evidências por arquivo; exemplos isolados; parâmetros ausentes sinalizados. |
| F1 — Núcleo confiável | Tipos, estados, rascunho, edição, timer, completa/parcial e migração local | Reabrir recupera; timer pausa/retoma; séries válidas não duplicam; zero/tempo/distância funcionam. |
| F2 — Fichas e consulta | A–E real, biblioteca, editor/versionamento, orientação e imagens básicas | Origem verificável; Ficha B localizada é conciliada pela fonte; nenhum número é inventado; edição não altera sessão ativa. |
| F3 — Uso offline | IndexedDB transacional, shell, downloads essenciais, exportação e update seguro | Abrir previamente preparado em modo avião; gravar e reabrir; falha de quota visível. |
| F4 — Sincronização | Schema conciliado, RLS, outbox, idempotência, erro/conflito | Retry não duplica; outra conta não lê; expiração de auth preserva pendências. |
| F5 — Histórico e mídia | Progresso verificável, galeria completa, vídeos seletivos, semana flexível | Cada ponto rastreável às séries; cache/Range testado; vídeos ausentes não bloqueiam. |
| F6 — IA assistiva | Job Groq, proposta validada, explicação e aceite manual | Falha da IA não bloqueia; nada muda sem aceite; versão de ficha e auditoria preservadas. |

**Marco de uso pessoal local:** F0–F3, com exportação e limitações claras. **V1 sincronizada:** F0–F4. **V1 ampliada:** F5. IA não é pré-requisito para começar a usar.

Ao fim de cada etapa: relatório de arquivos alterados, verificações executadas, pendências e roteiro de teste no celular. Aguardar feedback antes da etapa seguinte, como combinado. Não repetir uma fase já implementada e comprovada: fazer o delta.

## 11. Cenários de aceitação prioritários

1. Registrar trabalho com carga zero e aquecimento sem contaminar métricas.
2. Registrar prancha em segundos e Farmer’s Walk em metros, com suas unidades corretas.
3. Editar o rascunho, atualizar a página e recuperar valores; gravar com duplo toque sem duplicar.
4. Concluir série inválida: nenhum falso sucesso nem início indevido do timer.
5. Bloquear/reabrir; prazo de descanso coerente. Pausar, esperar e retomar sem perder restante.
6. Consultar galeria durante descanso; voltar para mesma série; descanso não reiniciado.
7. Finalizar parcial; preservar faltantes e abrir resumo real. Finalizar completa; histórico correto.
8. Alterar ficha após sessão; histórico continua no snapshot original.
9. Preparar offline, desligar rede, fechar/reabrir PWA e registrar. Primeiro acesso sem cache tem explicação útil.
10. Reenviar operação após timeout; apenas um registro no servidor. Testar conflito de revision.
11. Trocar conta; nenhum dado cruzado. Logout com pendências não apaga silenciosamente registros.
12. Recusar/indisponibilidade de IA; ficha e treino continuam funcionando.

Esses testes são gates de implementação futura, não testes executados nesta entrega de design.

## 12. Estado real dos artefatos de design

- Criadas 34 telas mobile no Figma, textos editáveis e instâncias de componentes; 30 telas-base receberam 240 conexões inicialmente, com conexões adicionais nos estados complementares.
- Leitura estrutural das 30 telas-base confirmou fonte Geist e camadas de texto/instâncias. Não há screenshot de UI usado como interface achatada.
- A tela de sessão recebeu inspeção visual por screenshot. Duas alturas excedentes detectadas foram ajustadas; não houve revisão visual completa de todas as telas.
- O limite de chamadas MCP do plano Figma Starter bloqueou a continuidade. Desktop, tema escuro, inserção de mídia e QA global **não concluídos**.
- As duas áreas de mídia do Figma continuam como placeholders; o original do Drive foi localizado e a prévia está no pacote. Tentativas de upload não concluíram. Não declarar que a galeria já contém o ativo real.
- Botões de navegação representam fluxo. Campos, stepper, filtros, arraste e geração IA ainda não são interações completas; o protótipo não é o aplicativo executável.
- A navegação e o layout dos quatro estados adicionais ainda precisam de revisão final. A legenda do guia anterior à ampliação deve ser atualizada no próximo acesso.

O arquivo `FORCA_Inventario_Telas_e_Retomada.md` contém o mapa de IDs e o checklist preciso para terminar sem recriar o arquivo.

## 13. Fontes e decisões

- Código: https://github.com/christianpompeu/camini/tree/forca
- Snapshot: https://github.com/christianpompeu/camini/commit/2545692805bd60ef452b21f6ada6137e4eff469b
- Fitness canônico: https://app.notion.com/p/3d513c241b4d8183a7d9d51ea45b755f
- Camini canônico: https://app.notion.com/p/3f113c241b4d8137b393ed071aaec6be
- Padrão de oito imagens: https://app.notion.com/p/3e513c241b4d81eeadf9f6b23dbb5a3c
- Acervo original: https://drive.google.com/drive/folders/1cmmbtpx4xDSrODxRmNKrBxVc7JK1Ub3i
- Offline e armazenamento: https://web.dev/learn/pwa/offline-data
- Cache PWA: https://web.dev/learn/pwa/caching
- Política de armazenamento WebKit: https://webkit.org/blog/14403/updates-to-storage-policy/
- Buckets privados: https://supabase.com/docs/guides/storage/buckets/fundamentals

As decisões de produto neste documento são propostas elaboradas para a solicitação atual. Fontes técnicas fundamentam limites de cache e acesso à mídia; não comprovam implementação do FORÇA. Antes de implementar APIs, conferir documentação da versão instalada e o `AGENTS.md` do projeto.

## Complemento — entrega visual local em 07/10/2026

As 34 telas exportadas por Christian estão no pacote visual para Antigravity, em `docs/forca/design-reference/`, com dimensões 780×1688 (2x). O guia `FORCA_Guia_Visual_Antigravity.md` associa telas a fases e registra correções necessárias. A entrega visual permite implementação sem depender de MCP, desde que a IDE consiga visualizar os arquivos locais/anexados. Sobreposições no protótipo não devem ser reproduzidas. Séries de trabalho incluem repetições, tempo e distância; o total ilustrado do Treino A é 15 (13 por repetições + 2 por tempo), separado de aquecimento e de métricas de volume por carga. Os estados de sincronização devem refletir implementação real. Desktop, dark, mídia e QA final do Figma permanecem pendentes.

## Atualização de referências de mídia — 07/10/2026

Pasta indicada por Christian: https://drive.google.com/drive/folders/1QYlMevY8HS9g0kTeeziUJoWQLu4osV2a. Foram localizados 103 PNGs em 13 conjuntos atuais (A: 24; B: 40; C: 39) e 12 referências soltas. Consulte `FORCA_Referencias_Midia_ABC.md` e `media-reference/manifest.json`. A ficha B foi localizada e transcrita; D/E e vídeos são produção futura. Panturrilha A e o arquivo 8 da remada unilateral não foram encontrados nessa estrutura. A numeração não determina papel semântico; o Goblet foi conferido e difere da ordem normativa do Brain. A origem deve prevalecer no mapeamento explícito do ativo, sem modificar a regra de produção. Dez amostras reais acompanham o pacote.
