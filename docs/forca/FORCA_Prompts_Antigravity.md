# FORÇA — Prompts para o Antigravity

07/10/2026 · Camini · branch `forca`

Use uma etapa por vez. O prompt inicial combina F0 (conciliação) com o início da F1 (núcleo confiável), pois já existe implementação parcial. Os demais prompts são independentes e incluem gates; não autorizam avançar automaticamente.

Protótipo: https://www.figma.com/design/5Yt7Z7ACx2EsAmPw6dunHp

Leia junto: `FORCA_Produto_Arquitetura_Roadmap.md` e `FORCA_Inventario_Telas_e_Retomada.md`. O Figma está parcialmente concluído por limite de chamadas do plano Starter; não tratar placeholders de mídia, desktop ou interações não ligadas como comportamento final.

## Entrega visual local — revisão de 07/10/2026

As 34 telas exportadas acompanham esta versão em `docs/forca/design-reference/`. Leia `FORCA_Guia_Visual_Antigravity.md`, que relaciona arquivos por fase e corrige falhas observadas no protótipo. O acesso via MCP/Figma é opcional. Consulte a galeria `design-reference/index.html`.

## Prompt 1 — Reconciliação e núcleo da sessão

```text
Atue como engenheiro frontend sênior no repositório christianpompeu/camini, branch forca. Quero evoluir o módulo existente, não reconstruí-lo. Escopo desta execução: F0 e núcleo F1 do FORÇA. Ao terminar, aguarde meu feedback antes de integrar backend.

FONTES
- Leia AGENTS.md e as skills locais aplicáveis em .agents/skills.
- Leia as guias locais da versão de Next.js antes de escrever código; não suponha APIs antigas.
- Consulte FORCA_Produto_Arquitetura_Roadmap.md e o inventário de telas.
- Figma: https://www.figma.com/design/5Yt7Z7ACx2EsAmPw6dunHp
- Snapshot auditado em 07/10/2026: 2545692805bd60ef452b21f6ada6137e4eff469b. A branch local pode ter avançado. Revalide os achados no estado atual; implemente somente o delta.

REFERÊNCIAS VISUAIS LOCAIS — REVISÃO DE 07/10/2026
Leia docs/forca/FORCA_Guia_Visual_Antigravity.md e abra visualmente os PNGs de docs/forca/design-reference/ indicados para esta etapa. Comece pelas telas 04, 05, 07 e 26, depois consulte os demais estados do Prompt 1: 06, 09, 10, 27, 28, 31, 32 e 33. Informe quais imagens conseguiu realmente visualizar; leitura de nome/JSON não basta. Se a IDE não conseguir abrir PNGs locais, peça os mesmos arquivos como anexos antes de declarar fidelidade visual. Pode prosseguir na auditoria independente de código.
Leia também docs/forca/FORCA_Referencias_Midia_ABC.md. Há 103 imagens atuais mapeadas no Drive, dez amostras reais locais e produção pendente de D/E e vídeos; não antecipar a fase de migração de mídia.
Os PNGs têm 780×1688, mas representam viewport 390×844 em 2x. Preserve tokens e componentes atuais. Aplique as correções V01–V11 do guia: não copiar sobreposição de métricas/legendas, não excluir séries por tempo do total de trabalho, não simular mídia disponível nem sincronização. Na fase local mostre somente estados locais reais. Corrija alvos de toque e continuidade do timer. Desktop/dark são adaptações pendentes de validação, não referências já desenhadas.
As telas são estados, não 34 páginas independentes. PNGs orientam composição; contratos do produto definem comportamento. Não usar as imagens como fundo da interface.

PRIMEIRO, INSPECIONE
1. git status, branch atual, alterações não commitadas e instruções do repositório. Preserve trabalho local. Não troque branch descartando alterações nem faça reset.
2. app/forca/page.tsx; app/forca/layout.tsx; store/useWorkoutStore.ts; components/workout/*; components/forca/*; app/globals.css; components.json; manifest; dependências e lockfile.
3. Identifique o contrato dos componentes e a persistência já presente. Registre uma tabela “existe / falta / evidência”. Não gaste a execução redesenhando outras áreas do Camini.

DIREÇÃO DO PRODUTO
FORÇA pessoal, foco inicial em força, programa A–E. Interface Studio Admin/shadcn base-nova neutral, fonte Geist, Lucide e tokens semânticos existentes. Sem resgatar gradientes históricos. Preserve tema global. Alvos ≥44 px; controles da sessão ≥48 px.

CONTRATOS DA SESSÃO
- Elimine any do contrato de treino. Diferencie ExerciseDefinition, WorkoutPrescription, WorkoutVersionSnapshot, Session, SessionExercise, SetDraft e SetRecord.
- ExerciseDefinition usa id estável, measurementType ('reps' | 'duration' | 'distance') e convenção de carga ('total' | 'per_implement' | 'additional' | 'bodyweight'). Modelo e nomenclatura podem se adaptar ao projeto, mantendo o significado.
- Registro contém UUID, tipo warmup/work, valores adequados à medida, RIR opcional, timestamp e estado. Rep não é segundo nem metro.
- Peso corporal ou adicional zero é válido. Rejeite NaN, infinito, negativos e reps/duração/distância inválidas para o tipo. Diferencie ausente de zero. RIR aceita 0,1,2,3,4+ ou ausente; não invente esforço.
- Aquecimento não conta como série de trabalho. Não marque automaticamente a primeira série como aquecimento. Metas vêm da prescrição, não de quatro séries globais.
- Carga deve mostrar convenção e permitir decimal pt-BR e digitação. Incremento é configurável, não aumento obrigatório de 2 kg.
- Unilateral precisa de lado e convenção clara. Não duplicar registro/volume automaticamente.

ESTADO E PERSISTÊNCIA
- Preserve o armazenamento legado camini-workout-storage. Introduza schemaVersion, migração validada e backup/exportação antes de transformação irreversível. Nenhum reset silencioso.
- Persista rascunho da série, exercício selecionado e timer; carga digitada ainda não concluída deve sobreviver à atualização da página.
- Defina adaptador de persistência para futura IndexedDB. Se mantiver localStorage nesta etapa, registre que isso não entrega abertura offline da aplicação e trate exceções de gravação. Não simule garantia de durabilidade.
- Hidratação deve terminar antes de permitir startWorkout. Evite sobrescrever sessão existente com estado vazio.
- Uma única sessão ativa neste aparelho; retomar ou encerrar antes de iniciar outra.
- Concluir série retorna resultado tipado. UI só confirma e inicia descanso após sucesso da gravação. Duplo toque/reenvio não cria duas séries.
- Edição referencia o mesmo setId. Desfazer/excluir precisa atualizar registro, contagem e histórico, não apenas um booleano visual.
- Navegar para biblioteca e voltar mantém série/rascunho/timer. Status de exercício deve ser real, não derivado de seu índice.

TIMER
Estados idle/running/paused/finished. Guarde endsAt e remainingMsWhenPaused. Correndo: max(0, endsAt - Date.now()). Pausa captura restante; retomar cria novo prazo; +30 s altera prazo ou restante; pular encerra; reset é uma ação atômica. O zero permanece zero ao terminar. Intervalo serve só para renderizar. Recalcule no visibilitychange/foreground. Não use start/stop com setTimeout como reset. Navegação não pausa. Não prometa alarme com tela bloqueada.

CONCLUSÃO
- Finalizar completa ou parcial, conforme registros e metas. Faltantes não se tornam concluídos.
- Grave endedAt, duração e snapshot da ficha. Retorne sessionId e abra resumo baseado no histórico persistido; não dependa de activeWorkout depois de limpá-lo.
- Troque “Reiniciar Sessão” destrutivo por ações claras; descartar exige confirmação.
- Remova dados fixos do histórico/progresso em modo real. Use estado vazio. Mantenha exemplos apenas em fixture/demo explicitamente identificada.
- A ficha B foi localizada e transcrita em FORCA_Referencias_Midia_ABC.md; confira a versão antes de aplicar metas. Nesta fase, a conciliação do catálogo pode permanecer pendente, desde que a interface e os fixtures não pareçam ficha pessoal aprovada.

INTERFACE
Priorize telas 04 (sessão), 05/33 (descanso), 06 (sequência), 07 (correção), 09 (parcial), 10/32 (resumo), 26 (retomada), 27/28 (tempo/distância). Mantenha componentes de apresentação separados do motor. Use shadcn/Base UI já configurado. Reduza a densidade do cabeçalho global no modo treino sem quebrar rotas do hub.

VERIFICAÇÕES OBRIGATÓRIAS, ADEQUADAS À MUDANÇA
- Peso zero válido; NaN/negativos rejeitados; tempo/distância nas unidades corretas.
- Aquecimento separado e série extra identificada.
- Duplo toque registra uma série; correção altera o mesmo registro.
- Rascunho e sessão restaurados após reload; migração preserva dados legados.
- Timer pausa/retoma, +30 s, expira em zero e recalcula no retorno.
- Finalizar parcial/completa preserva histórico e abre resumo correto.
- Tipagem, lint dos arquivos alterados e build conforme gates reais do projeto. Diferencie erro preexistente de regressão.
- Inspeção em viewport 390 px e desktop; teclado não encobre ação. Se não conseguir teste em aparelho, declare-o pendente.

FORA DESTA ETAPA
Não criar schema Supabase, migrar mídias, acionar Groq, alterar módulos Radar/CTC/RM, fazer deploy ou presumir que PWA/offline completo está entregue.

ENTREGA
Implemente o delta. Relate arquivos alterados, decisões e evidências de verificação. Atualize documentação operacional com “implementado / validado / pendente”. Entregue um roteiro curto de homologação no celular e pare para meu feedback.
```

## Prompt 2 — Fichas reais, catálogo e personalização

```text
Leia também docs/forca/FORCA_Guia_Visual_Antigravity.md e visualize os PNGs selecionados para este prompt. Aplique as correções visuais registradas e informe os arquivos realmente vistos.

Continue o FORÇA no Camini/branch forca a partir do código atual, após meu aceite da etapa anterior. Leia AGENTS.md, documentação do produto, inventário Figma e relatório da F1. Não repita o que já foi comprovado.

Objetivo F2: integrar o programa A–E de referência e permitir consulta/personalização manual com versão de ficha. Figma: telas 02,03,08,11,12,19,20,21 e 22. Use identidade, tipografia e componentes existentes.

1. Estruture catálogo com IDs estáveis, aliases, equipamento, músculos, measurementType, loadConvention, instruções e origem. Separe exercício de prescrição e de execução.
2. Recupere as fichas finais do acervo fornecido. Use os valores documentados no produto apenas quando corresponderem à fonte aprovada. A ficha B foi localizada na pasta indicada por Christian: consulte FORCA_Referencias_Midia_ABC.md e media-reference/ficha_treino_b/ficha.png. Transcrição: supino 4×5–8; desenvolvimento 3×5–6; flexão 3×8–12; elevação lateral 2×10–15; prancha 2×45–90 s. Concilie a versão antes de ativar; não copie números de A/C nem aplique quatro séries por padrão.
3. Crie importação/seed revisável e idempotente. Não importe exemplos como histórico nem cargas pessoais. Substitua A/B/C demonstrativos no modo real sem apagar sessões legadas.
4. Hoje mostra próxima ficha selecionada e sessão ativa. Não imponha calendário ou cinco treinos consecutivos. Planejamento é editável; uma falta não reinicia o ciclo.
5. Editor permite adicionar/remover, mover com botões acessíveis, alterar metas/descanso/observações e revisar diff. Ativação cria versão imutável; sessões mantêm snapshot. Edição apenas para hoje pertence à sessão.
6. Catálogo tem busca e filtros. Exercício oferece execução, músculos, dicas e histórico próprio. Set de mídia pode estar incompleto; texto não depende do vídeo.
7. Não trate substituição como equivalência automática. Escolha manual, motivo e revisão de metas antes de aplicar.
8. Metas por tempo/distância e unilateral devem funcionar no mesmo motor validado na F1. Carga inicial vem do usuário ou histórico comparável, nunca fixture.

Verifique: fonte de cada ficha; ausência de valores inventados; nova versão sem alterar sessão ativa/histórico; consulta preserva rascunho; busca sem resultado; ativo sem mídia. Execute gates do projeto e entregue relatório. Não avance para backend/IA. Aguarde feedback.
```

## Prompt 3 — PWA e offline confiável

```text
Leia também docs/forca/FORCA_Guia_Visual_Antigravity.md e visualize os PNGs selecionados para este prompt. Aplique as correções visuais registradas e informe os arquivos realmente vistos.

Execute F3 do FORÇA sobre o estado atual, após homologação de F1/F2. Leia AGENTS.md e docs locais das versões instaladas. Consulte o documento de produto. Objetivo: uso local preparado sem internet, não apenas manifest instalável.

- Escolha e justifique o service worker compatível com esta versão de Next.js; confira a documentação atual. Evite instalar pacote por memória. Limite escopo/cache para não interferir em outros módulos Camini.
- Migre durabilidade de sessão/rascunho/ficha para IndexedDB com schema versionado, backup e tratamento de erro. Zustand coordena UI, não é o banco.
- Grave série e item de outbox na mesma transação; a outbox já pode existir localmente sem backend nesta fase. Se gravação falhar, não mostrar sucesso.
- Cacheie shell e conteúdo necessário; não cacheie indiscriminadamente dados privados/API/HTML autenticado. Particione por conta e defina comportamento de logout com pendências.
- Prepare ficha offline com progresso e verificação. Imagens essenciais primeiro, vídeos opcionais. Exiba tamanho e disponibilidade real; quota/evicção podem ocorrer. Não garanta cache permanente.
- Reaproveite manifest existente; valide scope/start_url, ícones adequados e instalação nos navegadores alvo. Tema respeita preferência.
- Atualização do SW não pode trocar o motor no meio da sessão. Defina ciclo seguro e mensagem de atualização disponível.
- Exporte JSON versionado dos registros locais e CSV legível. Limpar mídias não remove sessões/outbox. Primeiro acesso offline sem shell baixado precisa de fallback honesto.
- Timer usa timestamps e continua coerente quando JS é suspenso; notificações/tela ativa são melhoria progressiva.

Teste abrir depois de preparar em modo avião, registrar, fechar/reabrir, voltar à conexão, quota/erro de gravação, migração, conta diferente e atualização pendente durante sessão. Simulação desktop não substitui iOS/Android real; declare quais foram usados. Não declarar sincronização Supabase entregue. Aguarde feedback.
```

## Prompt 4 — Supabase e sincronização

```text
Leia também docs/forca/FORCA_Guia_Visual_Antigravity.md e visualize os PNGs selecionados para este prompt. Aplique as correções visuais registradas e informe os arquivos realmente vistos.

Execute F4 somente após validar núcleo e persistência local. Leia AGENTS.md, skills Supabase aplicáveis, documentação atual e schema real. Não suponha que tabelas conceituais do documento já existem.

1. Inspecione autenticação Camini, tabelas, migrations e políticas existentes. Proponha o delta mínimo e documente nomes finais. Preserve módulos vizinhos.
2. Modele catálogo, versões de ficha, sessões, exercícios da sessão e séries, separando prescrição/execução. UUIDs do cliente, proprietário, revision, snapshots e estados completa/parcial. Dados de tempo/distância não são reps.
3. RLS e grants de acesso adequados; políticas de escrita validam dono e vínculo pai. Não autorize por user_metadata. Chaves privilegiadas só no servidor. Confirme documentação e rode verificações de acesso entre duas identidades de teste.
4. Endpoint/rotina transacional idempotente por operationId. Reenvio após timeout não duplica. Atualização exige baseRevision; conflito preserva versões e pede decisão. Exclusões precisam de tombstone/semântica explícita.
5. Outbox com pending/syncing/synced/error/conflict, backoff e retomada. Flush no foreground, reconexão e botão manual; funcionamento não depende de background sync.
6. Sessão pode sincronizar incrementalmente em background, mas jamais precisa esperar rede para concluir série. Finalização local é confirmada antes do envio. Tokens expirados não apagam trabalho.
7. UI mostra salvo no aparelho versus enviado. Outra conta não herda fila nem cache. Multi-dispositivo não recebe fusão silenciosa.
8. Migrations reproduzíveis e rollback sem perda; não enviar dados demonstrativos ao banco pessoal.

Verifique reenvio, timeout depois de commit, desconexão, sessão expirada, conflito, exclusão, RLS cruzada, correção de série já enviada e edição da ficha após início. Não acione Groq nesta fase. Entregue evidências e pare para homologação.
```

## Prompt 5 — Histórico, métricas e mídias

```text
Leia também docs/forca/FORCA_Guia_Visual_Antigravity.md e visualize os PNGs selecionados para este prompt. Aplique as correções visuais registradas e informe os arquivos realmente vistos.

Execute F5 após meu aceite da sincronização. Use documento de produto e telas 11–18,22,23,31. Não alterar o objetivo de força nem inventar histórico.

- Histórico real: filtros por data/ficha/status, detalhe de sessão, snapshots, aquecimento separado, edição rastreável e estados vazios.
- Progresso determinístico por exercício/variante/convenção. Cada ponto deve abrir os registros de origem. Melhor série é carga+reps+RIR; não resumir mudança de reps como “+kg de força”. Tempo e distância têm métricas próprias. e1RM, se incluído, deve explicitar fórmula e elegibilidade; não introduzir como obrigação.
- Faça inventário de mídia com exerciseId, papel, variante, versão, checksum, MIME, tamanho e origem. Examine o conteúdo de arquivos ambíguos antes de vincular. Notion define oito imagens; o documento antigo de sete não é a norma.
- Preserve originais no Drive. Gere derivados leves aprovados e publique no Storage com política de acesso explícita. Não torne bucket público por conveniência nem exponha URLs assinadas como identidade permanente.
- Galeria vertical preserva a imagem completa; abas execução/músculos/dicas, seleção de modelo quando houver ativo. Poster primeiro; MP4 por toque e download seletivo; fallback sem vídeo. Não inventar mídia inexistente.
- Cache por versão/usuário, limpeza independente da outbox, tamanhos e falhas reais. Teste Range de vídeo e URLs expiradas; não prometa armazenamento permanente.
- Planejamento semanal flexível sem autogerar nova prescrição.

Verifique exatidão das métricas com fixtures pequenas de cálculo, proteção entre usuários, mídia em rede lenta/offline, pacote parcial e galeria sem encerrar timer. Entregue evidências e pare. IA fica na próxima etapa.
```

## Prompt 6 — IA assistiva pela Groq

```text
Leia também docs/forca/FORCA_Guia_Visual_Antigravity.md e visualize os PNGs selecionados para este prompt. Aplique as correções visuais registradas e informe os arquivos realmente vistos.

Execute F6 somente com histórico confiável e após meu aceite. Reutilize integração de servidor Groq já existente, verificando configuração e APIs atuais. Nunca exponha chave no browser.

- Job pós-sincronização de sessão, idempotente por sessionId/revision/inputHash. Corrigir sessão invalida análise anterior. Modelo, promptVersion e estado do job registrados.
- A finalização e o próximo treino não aguardam a IA. Trate timeout, indisponibilidade, JSON inválido, retry limitado, custo e ausência de dados.
- Métricas são calculadas pelo código e passadas ao modelo. Contexto mínimo: prescrição, séries elegíveis comparáveis, esforço informado, observações pertinentes e incrementos reais. Aquecimento permanece identificado.
- Não inferir aumento por RIR 1 isolado. Não alterar ficha ou carga automaticamente. Saída: fatos usados, recomendação estruturada, justificativa, limitações e validade. Dados insuficientes geram pedido de revisão, não certeza inventada.
- Valide schema, unidade, exercício/versão, limites e incrementos antes de exibir. Observações livres são dados, nunca instruções que autorizam ferramentas/escritas.
- UX: sugestão discreta antes da próxima sessão, com “ver motivo”, “aceitar para esta sessão” e “ignorar”. Atualizar ficha é outro fluxo: rascunho, diff, aceite, nova versão. Registrar decisão e permitir reverter por nova versão.
- Desconforto não gera diagnóstico nem progressão automática. A IA auxilia decisão do usuário; o motor segue funcionando sem ela.

Verifique respostas malformadas, unidade errada, exercício inexistente, falta de histórico, recomendação expirada, correção pós-análise, indisponibilidade e rejeição do usuário. Entregue evidências e roteiro de homologação. Não publique sem que eu solicite.
```

## Como devolver o feedback de cada etapa

Envie o relatório do Antigravity, os arquivos principais alterados ou o commit, erros de build/teste e duas capturas: celular e desktop. Diga o que conseguiu fazer em uso real e onde a experiência ficou confusa. Essa evidência define o próximo delta; uma mensagem “implementado” não substitui o teste da jornada.

## Atualização de referências de mídia — 07/10/2026

Pasta indicada por Christian: https://drive.google.com/drive/folders/1QYlMevY8HS9g0kTeeziUJoWQLu4osV2a. Foram localizados 103 PNGs em 13 conjuntos atuais (A: 24; B: 40; C: 39) e 12 referências soltas. Consulte `FORCA_Referencias_Midia_ABC.md` e `media-reference/manifest.json`. A ficha B foi localizada e transcrita; D/E e vídeos são produção futura. Panturrilha A e o arquivo 8 da remada unilateral não foram encontrados nessa estrutura. A numeração não determina papel semântico; o Goblet foi conferido e difere da ordem normativa do Brain. A origem deve prevalecer no mapeamento explícito do ativo, sem modificar a regra de produção. Dez amostras reais acompanham o pacote.
