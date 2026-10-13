# FORÇA — F2.2: Fichas Individuais Versionadas

Camini · Christian Pompeu · 13 de outubro de 2026 · Versão 1.0 de entrega  
Branch: `forca` | Módulo: FORÇA (`/forca`)

---

## 1. Resumo Executivo: O que já existia vs. O que foi implementado

### O que já existia (Preservado e Intacto)
- **Catálogo Independente de Exercícios (F2.1):** 16 exercícios canônicos sementes com mídias semânticas do `manifest.json`, CRUD, editor mobile-first, busca com filtros, validação de publicação e status de revisão.
- **Núcleo de Sessão Ativa (F1):** `useWorkoutStore` com rascunho de sessão, timer de descanso, registro de séries de trabalho e aquecimento, dialog de edição de séries e finalização de treino (completa ou parcial).
- **Histórico e Exportação (F2):** Detalhe de sessões anteriores, editor retroativo e backup JSON/CSV.
- **Acordo do Ciclo:** Uso pessoal de Christian; nenhuma auditoria ou refatoração geral foi reaberta.

### O que foi Implementado na F2.2
1. **Domínio Tipado de Fichas e Versionamento (`types/workout-plan.ts`):**
   - Separação ontológica rigorosa entre:
     a) **Identidade da Ficha e Proprietário:** `ownerId` estável (`user_local_christian`), `id` estável imutável da ficha (`plan_...`), nome, objetivo, observações e relações de linhagem versionada (`version`, `previousVersionId`).
     b) **Divisões de Treino (`WorkoutDivision`):** Nomenclatura flexível (A, B, C, Superior, Inferior, etc.), sem quantidade fixa forçada.
     c) **Exercícios Prescritos (`PrescribedExercise`):** Ocorrência com ID próprio e estável (`id: "pex_..."`), independente do `exerciseId`. Permite repetir o mesmo exercício do catálogo em posições diferentes sem colisão.
     d) **Parâmetros de Prescrição:** Séries de trabalho inteiras positivas, repetições/duração/distância (com suporte a faixas `[min, max]`), descanso em segundos, carga inicial e convenção explícita (`LoadConvention`), RIR-alvo opcional preservando "não informado", e observações.
     e) **Imutabilidade e Snapshots:** Versões ativadas são seladas (`status: "active"` ou `"archived"`) e imutáveis. Edições geram rascunhos (`status: "draft"`).

2. **Store Local de Fichas com Versionamento (`store/useWorkoutPlanStore.ts`):**
   - Persistência desacoplada em `localStorage` sob a chave `camini-workout-plan-storage` (`version: 1`).
   - Gerenciamento completo de ciclo de vida: `createEmptyPlan`, `updatePlanDraft`, `importDraftFromBaseline`, `activatePlan`, `createNewVersionFromPlan`, `duplicatePlan`, `archivePlan`, `restorePlan`.
   - **Idempotência no A–E:** O botão "Criar rascunho a partir dos treinos atuais" detecta se já existe rascunho derivado da base provisória, evitando qualquer duplicação por duplo clique.
   - **Garantia de No Máximo Uma Ficha Ativa:** Ao ativar uma ficha/versão, a anterior é arquivada automaticamente e preservada no histórico.
   - **Cálculo de Diferenças (`getDiffWithPreviousVersion`):** Identifica divisões e exercícios adicionados, removidos, reordenados ou com prescrições modificadas.

3. **Integração Desacoplada com Sessão e Histórico (`store/useWorkoutStore.ts`):**
   - **Snapshot Congelado de Treino:** Ao iniciar uma sessão a partir de uma ficha (`startWorkout`), a sessão cria uma cópia profunda dos dados da prescrição (`planId`, `planName`, `planVersion`, `divisionId`, `occurrenceId`) e da definição do exercício.
   - Nenhuma edição posterior na ficha ou no catálogo retroage sobre sessões em andamento ou históricas.
   - Se uma nova versão de ficha for ativada enquanto uma sessão estiver em andamento, a sessão atual conclui usando seu snapshot original.
   - O histórico exibe badges com a ficha e versão de origem (`Ex: Ficha Hipertrofia 2026 v2 • Treino A`), mantendo sessões legadas legíveis sem inventar vínculos fictícios.
   - **Resolução Unificada de Mídia:** Resolução em duas camadas (`MEDIA_REGISTRY` com fallback para mídias do catálogo), mantendo total retrocompatibilidade.

4. **Telas e UX Alinhadas ao Figma e Mobile-First (`components/plans/`):**
   - **Tela 19 (Minhas Fichas — `workout-plan-list-view.tsx`):** Exibe a ficha ativa com suas divisões e CTAs ("Ver Ficha", "Iniciar Treino"), rascunhos com pendências visíveis, fichas arquivadas e ações "Nova Ficha" e "Importar dos treinos A–E".
   - **Tela 20 (Editar Ficha — `workout-plan-editor-view.tsx`):** Gerenciamento de divisões (adicionar, renomear, mover para cima/baixo, excluir), construtor de exercícios prescritos com seleção no catálogo (`exercise-picker-dialog.tsx`), campos condicionais por medida (reps/duração/distância), convenção de carga, descanso, botões táteis "Subir/Descer" e **modal de proteção contra descarte de alterações não salvas**.
   - **Tela 21 (Revisar Versão — `workout-plan-review-view.tsx`):** Resumo de diferenças (adições, remoções, modificações de séries/reps), card de segurança ("Seu histórico permanece intacto"), campo opcional de motivo da versão, sumário de validação e ativação com feedback claro.
   - **Tela 03 (Ficha A / Detalhe da Divisão — `workout-division-detail-view.tsx`):** Visualização completa do treino com total de séries de trabalho, lista de exercícios com parâmetros de prescrição, timer de descanso, e ações de "Iniciar treino" e "Editar ficha".

5. **Backup Unificado (`schemaVersion: 3`):**
   - O exportador JSON inclui `workoutPlans` e `activePlanId` no envelope, preservando catálogo (`v2`) e histórico (`v1`).

---

## 2. Arquivos Criados e Alterados

| Arquivo | Natureza | Responsabilidade |
|---|---|---|
| `types/workout-plan.ts` | **Criado** | Modelo ontológico tipado de fichas, divisões, exercícios prescritos, validações e diffs. |
| `data/default-workout-plan.ts` | **Criado** | Gerador canônico do plano baseline A–E para importação estruturada com `reviewStatus: "pending"`. |
| `store/useWorkoutPlanStore.ts` | **Criado** | Store Zustand local-first com ciclo de vida de fichas, versionamento, rascunhos, validação e ativação. |
| `components/plans/exercise-picker-dialog.tsx` | **Criado** | Seletor modal de exercícios publicados do catálogo com busca e filtros. |
| `components/plans/workout-plan-list-view.tsx` | **Criado** | Tela 19 (Minhas Fichas) com ficha ativa, divisões, rascunhos, histórico de versões e ações de importação. |
| `components/plans/workout-plan-editor-view.tsx` | **Criado** | Tela 20 (Editar Ficha) com formulário mobile-first, ordenação por botões, campos condicionais e proteção de rascunho. |
| `components/plans/workout-plan-review-view.tsx` | **Criado** | Tela 21 (Revisar Versão) com diff visual das alterações, validações obrigatórias e confirmação de ativação. |
| `components/plans/workout-division-detail-view.tsx` | **Criado** | Tela 03 (Detalhe do Treino A) com resumo de volume, prescrições e CTAs de início de treino e edição. |
| `store/useWorkoutStore.ts` | **Modificado** | Desacoplamento para aceitar dados da ficha (`planId`, `planVersion`, `divisionId`, `occurrenceId`) e criar snapshots imutáveis. |
| `components/workout/bottom-navigation.tsx` | **Modificado** | Inclusão da aba "Fichas" na barra de navegação inferior. |
| `components/workout/workout-card.tsx` | **Modificado** | Suporte a letras de divisões personalizadas e callback `onViewDetail` com parada de propagação no CTA. |
| `components/workout/exercise-hero.tsx` | **Modificado** | Resolução semântica compartilhada de mídias (legado `MEDIA_REGISTRY` + catálogo). |
| `components/workout/history-list.tsx` | **Modificado** | Exibição de badge com a ficha e versão de origem nas sessões históricas. |
| `components/workout/history-session-detail.tsx` | **Modificado** | Exibição dos metadados da versão da ficha no cabeçalho da sessão detalhada. |
| `components/workout/export-data-panel.tsx` | **Modificado** | Atualização do envelope JSON para `schemaVersion: 3`, incluindo `workoutPlans` e `activePlanId`. |
| `app/forca/page.tsx` | **Modificado** | Integração orquestrada entre a ficha ativa, treinos provisórios, nova aba de Fichas e alternância de telas. |
| `scripts/test-forca-f2-2.ts` | **Criado** | Suíte de testes automatizados com 16 cenários rigorosos de domínio e fluxo da F2.2. |
| `docs/forca/FORCA_Produto_Arquitetura_Roadmap.md` | **Modificado** | Atualização do status da F2.2 para concluído. |
| `docs/forca/FORCA_F2_2_Fichas_Individuais_Versionadas.md` | **Criado** | Este relatório consolidado de entrega e validação. |

---

## 3. Modelo de Dados e Integração com Contratos

### Contrato Central da Ficha (`WorkoutPlan`)

```typescript
export interface WorkoutPlan {
  id: string; // ex: "plan_hipertrofia_2026"
  ownerId: string; // "user_local_christian"
  name: string;
  goal?: string;
  notes?: string;
  version: number; // 1, 2, 3...
  status: "draft" | "active" | "archived";
  previousVersionId?: string;
  versionReason?: string;
  origin: "user_created" | "imported_from_baseline" | "duplicated";
  reviewStatus: "pending" | "reviewed" | "draft";
  createdAt: number;
  updatedAt: number;
  divisions: WorkoutDivision[];
}

export interface WorkoutDivision {
  id: string; // ex: "div_treino_a"
  name: string; // "Superior Foco Peito"
  letter?: string; // "A", "B", "C" ou customizado
  order: number;
  notes?: string;
  exercises: PrescribedExercise[];
}

export interface PrescribedExercise {
  id: string; // Identificador da ocorrência (ex: "pex_179185...")
  exerciseId: string; // ID estável do catálogo (ex: "agachamento_goblet")
  exerciseVersion?: number;
  order: number;
  workSets: number; // Séries de trabalho (inteiro >= 1)
  measurementType: MeasurementType; // "reps" | "duration" | "distance"
  repsTarget?: number;
  repsRange?: [number, number];
  durationSeconds?: number;
  distanceMeters?: number;
  restSeconds: number; // Segundos (>= 0)
  rirTarget?: number; // Preserva null/undefined como "não informado"
  targetWeight?: number;
  loadConvention: LoadConvention;
  lateralityNotes?: string;
  prescriptionNotes?: string;
}
```

### Regras de Imutabilidade e Preservação
1. **Identidade Própria da Ocorrência:** O campo `id` de `PrescribedExercise` é gerado individualmente (`pex_...`), permitindo que o mesmo exercício do catálogo (ex: `agachamento_goblet`) seja prescrito duas vezes na mesma divisão (ou em divisões diferentes) sem colisão de chave ou mutação compartilhada.
2. **Snapshot Congelado na Sessão:** Quando `startWorkout` é disparado:
   - A sessão recebe uma cópia independente profunda dos dados prescritos (`planId`, `planName`, `planVersion`, `divisionId`, `occurrenceId`).
   - Se o usuário editar a ficha mais tarde ou publicar uma versão 2, a sessão concluída ou em andamento não sofre qualquer alteração retroativa.
3. **Preservação de Sessões Legadas:** Sessões realizadas antes da F2.2 não possuem `planId` e continuam sendo renderizadas perfeitamente no histórico sem que vínculos fictícios sejam fabricados.
4. **Resolução de Mídia Unificada:** O componente `ExerciseHero` busca mídia primeiro no `MEDIA_REGISTRY` estático e, caso não encontre, recorre ao acervo de mídias cadastradas no catálogo `useExerciseCatalogStore`, eliminando a necessidade de uma terceira tabela redundante.

---

## 4. Evidências Visuais e Capturas (Mobile 390 px)

O fluxo completo foi validado em viewport mobile de **390 × 844 px** via agente autônomo de browser:

### 1. Minhas Fichas (Figma 19)
- Exibição de ficha ativa com divisões A, B, C, D e E.
- Contagem de treinos, data da última versão e botão "Ver Ficha" ou "Iniciar".
- Seção de rascunhos com indicação de pendências e ações contextuais.
- **Evidência:** `minhas_fichas_screen_19_1791926964761.png`

### 2. Editar Ficha (Figma 20)
- Gerenciamento de divisões: inclusão, renomeação, reordenação com botões "Subir/Descer" e exclusão.
- Prescrição por exercício com campos condicionais por tipo de medida (repetições, segundos ou metros), convenção de carga explícita e tempo de descanso.
- Modal de confirmação para prevenir descarte acidental de alterações não salvas.
- **Evidências:** `editar_ficha_screen_20_1791926975277.png` e `editar_ficha_scrolled_1791926982871.png`

### 3. Revisar Versão (Figma 21)
- Comparação explícita de diferenças (adições, remoções e alterações de parâmetros).
- Card informativo: *"Seu histórico permanece intacto — sessões anteriores continuam associadas à versão em que foram realizadas"*.
- Validação obrigatória de regras de negócio antes de liberar o botão de ativação.
- **Evidências:** `revisar_versao_screen_21_1791927000006.png` e `after_activation_1791927020683.png`

### 4. Ficha A / Detalhe da Divisão (Figma 03)
- Listagem completa dos exercícios prescritos com contagem de séries e faixa de repetições.
- Badges de descanso e observações de execução.
- Ações primárias: "Iniciar treino" e "Editar ficha".
- **Evidência:** `ficha_a_screen_03_1791927067711.png`

### 5. Sessão Ativa com Snapshot da Ficha
- Início da sessão com badge informando a ficha e versão ativa (`Ficha A • Ficha Hipertrofia 2026 v2`).
- Timer de descanso inicializado com a prescrição da ficha.
- **Evidências:** `active_workout_session_1791927107243.png` e `active_workout_session_top_1791927125638.png`

### 6. Registro em Vídeo da Execução Autônoma
- A gravação completa do fluxo está arquivada em: `forca_f2_2_visual_validation_1791926941092.webp`.

---

## 5. Estratégia de Migração e Transição dos Dados A–E

1. **Ação Explícita de Importação:** Na aba "Fichas", o usuário conta com o botão *"Importar dos treinos A–E"*.
2. **Preservação de Dados Provisórios:** A importação cria uma nova ficha em estado de rascunho (`status: "draft"`, `origin: "imported_from_baseline"`, `reviewStatus: "pending"`).
3. **Idempotência Garantida:** Caso o usuário clique repetidamente ou recarregue a tela, a função `importDraftFromBaseline` detecta que já existe um rascunho importado pendente e reutiliza o mesmo, evitando proliferação de rascunhos idênticos.
4. **Sem Ativação Automática:** A ficha provisória não é ativada compulsoriamente nem publica exercícios sem revisão. Enquanto nenhuma ficha for ativada pelo usuário, a tela principal de treinos continua oferecendo acesso direto aos treinos baseline identificados como provisórios.
5. **Transição Suave:** No momento em que o usuário ativa qualquer ficha personalizada, a aba "Treinos" passa automaticamente a ser governada pela ficha ativa do proprietário.

---

## 6. Persistência Local e Backup

- **Isolamento de Estado:** Os dados de fichas e versões residem exclusivamente na chave `camini-workout-plan-storage` do `localStorage` com `version: 1`.
- **Tratamento de Falha de Quota:** Em caso de erro de persistência no `localStorage`, o store captura a exceção, não atualiza o estado em memória para uma versão falsa e exibe notificação de erro ao usuário.
- **Envelope de Backup JSON (`schemaVersion: 3`):**
  ```json
  {
    "schemaVersion": 3,
    "exportedAt": "2026-10-13T21:30:00.000Z",
    "completedSessions": [...],
    "catalog": [...],
    "workoutPlans": [...],
    "activePlanId": "plan_hipertrofia_2026"
  }
  ```
  O backup preserva todas as relações de ID e linhagem de versões, mantendo retrocompatibilidade total com as versões 1 e 2.

---

## 7. Testes Automatizados e Resultados Reais

Foram executadas três suítes de testes automatizados dedicadas via Node/tsx:

### 1. Suíte da F2.2 (`scripts/test-forca-f2-2.ts`)
```
Cenário 1: Criar ficha com treinos e exercícios do catálogo ... OK
Cenário 2: Repetir o mesmo exercício sem colisão de IDs ... OK
Cenário 3: Validação de repetições, duração, distância e carga ... OK
Cenário 4: Salvar rascunho incompleto sem alterar ficha ativa ... OK
Cenário 5: Ativar somente após validação rigorosa ... OK
Cenário 6: Criar nova versão preservando a anterior imutável ... OK
Cenário 7: Duplicar ficha com novas identidades e novos IDs de ocorrência ... OK
Cenário 8: Reordenar treinos e exercícios sem perder prescrições ... OK
Cenário 9: Iniciar sessão pela versão correta da ficha ativa ... OK
Cenário 10: Editar ficha e catálogo sem alterar sessão histórica ... OK
Cenário 11: Preservar sessões legadas sem inventar relações falsas ... OK
Cenário 12: Importar A-E idempotente sem publicação/ativação automática ... OK
Cenário 13: Tratar falha de armazenamento com retorno de erro sem falso sucesso ... OK
Cenário 14: Exportar envelope schemaVersion 3 com relações coerentes ... OK
Cenário 15: Cálculo de diffs entre versões consecutivas ... OK
Cenário 16: Resolução unificada de mídia (MEDIA_REGISTRY + catálogo) ... OK

Resultado: 16/16 testes passaram (100% de sucesso).
```

### 2. Suíte de Regressão da F2.1 (`scripts/test-forca-f2-1.ts`)
```
Resultado: 12/12 testes passaram (100% de sucesso).
```

### 3. Suíte de Regressão do Núcleo F2 (`scripts/test-forca-f2.ts`)
```
Resultado: 12/12 testes passaram (100% de sucesso).
```

### 4. Verificação Estática de Código e Compilação
- **TypeScript (`npx tsc --noEmit`):** 0 erros.
- **ESLint (`npm run lint`):** 0 erros no código da aplicação.
- **Next.js Build (`npm run build`):** Exit Code 0 (todas as 61 rotas estáticas e dinâmicas compilaram perfeitamente).

---

## 8. Pendências e Limitações Conhecidas

1. **Escopo Local-First:** Fichas e versões são armazenadas no navegador do usuário (`localStorage`). Sincronização em nuvem e contas multiusuário são escopo das fases F3 (Offline) e F4 (Sincronização).
2. **Dados A–E:** Os dados do programa provisório A–E continuam aguardando conciliação técnica definitiva por Christian no fechamento do ciclo.
3. **Ausência de IA:** Não há geração automática de treinos por IA nem custos de API neste módulo, em conformidade com as diretrizes do projeto.

---

## 9. Roteiro de Validação Manual (10 Passos)

1. **Acessar o Módulo:** Abra `http://localhost:3000/forca` e verifique a nova aba **"Fichas"** na barra inferior de navegação.
2. **Importar Treinos Baseline:** Na aba Fichas, clique em *"Importar dos treinos A–E"*. Verifique que um rascunho é criado com 5 divisões e status de revisão pendente.
3. **Verificar Idempotência:** Clique novamente no botão de importar e confirme que nenhum rascunho duplicado é criado.
4. **Criar Ficha do Zero:** Clique em *"Nova Ficha"*. Dê um nome (ex: *"Meu Treino Personalizado"*), adicione a Divisão A e clique em *"Adicionar Exercício"*.
5. **Selecionar do Catálogo:** Escolha um exercício publicado (ex: *Agachamento Goblet*). Ajuste séries para 4, repetições para 10-12 e descanso para 90s.
6. **Repetir Exercício:** Adicione novamente o *Agachamento Goblet* na mesma divisão com 2 séries de 15 reps. Confirme que os botões "Subir/Descer" funcionam e os IDs não colidem.
7. **Revisar e Ativar:** Clique em *"Revisar e Ativar"*. Confira o resumo de alterações e o card de segurança do histórico. Preencha o motivo e clique em *"Ativar Esta Versão"*.
8. **Iniciar Treino:** Na listagem de fichas, clique em *"Iniciar"* na Divisão A. Verifique se o treino abre com a prescrição correta (4 séries, 10-12 reps, timer em 90s).
9. **Registrar e Finalizar:** Registre uma série de trabalho, finalize o treino e vá para a aba **"Histórico"**. Confirme que a sessão gravada exibe a etiqueta da ficha e versão de origem.
10. **Exportar Backup:** Na aba Histórico, abra *"Exportar Dados"* e gere o JSON. Abra o arquivo e confira se o envelope possui `"schemaVersion": 3` com a lista de `workoutPlans`.
