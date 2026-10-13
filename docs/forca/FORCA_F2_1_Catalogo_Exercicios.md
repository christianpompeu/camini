# FORÇA — F2.1: Catálogo Independente de Exercícios

Camini · Christian Pompeu · 13 de outubro de 2026 · Versão 1.0 de entrega  
Branch: `forca` | Módulo: FORÇA (`/forca`)

---

## 1. Resumo Executivo: O que já existia vs. O que foi implementado

### O que já existia (Preservado e Intacto)
- **Núcleo de Treino e Sessão Ativa:** `useWorkoutStore` gerencia o estado da sessão ativa (`activeWorkout`), registro de séries (`logSet`), timer de descanso (`RestTimer`), editor de séries (`SetEditorDialog`) e finalização.
- **Histórico e Exportação:** Histórico com detalhe da sessão (`HistorySessionDetail`) e exportação JSON/CSV (`export-data-panel.tsx`).
- **Aceite Provisório:** Mantido integralmente; nenhuma alteração destrutiva ou reabertura de auditoria do núcleo foi realizada.

### O que foi Implementado na F2.1
1. **Domínio Tipado Independente (`types/exercise.ts`):**
   - Separação total entre a **definição do exercício** (biomecânica, padrão de movimento, lateralidade, equipamentos, instruções, mídias) e a **prescrição de treino** (séries, repetições-alvo, RIR, descanso ou carga).
   - Vocabulário tipado: `MovementPattern`, `Equipment`, `Laterality`, `MeasurementType`, `LoadConvention`, `MediaRole`, `ExerciseStatus`, `ContentOrigin`, `ReviewStatus`.
   - Suporte a variantes com `parentExerciseId` e `variantNotes`.

2. **Repositório Semente com Mídias Semânticas (`data/default-exercises.ts`):**
   - 16 exercícios canônicos mapeados a partir dos treinos A–E e do `manifest.json`.
   - Vínculo a arquivos reais `/media-reference/...` quando disponíveis, com `availabilityStatus: "available"`.
   - Fallback gracioso para mídias pendentes (`availabilityStatus: "pending_download"`), garantindo que mídia ausente não quebre a interface nem impeça publicação de exercícios.
   - Origem marcada como `contentOrigin: "imported"` e `reviewStatus: "pending"`.

3. **Store Local-First Idempotente (`store/useExerciseCatalogStore.ts`):**
   - Persistência desacoplada em `localStorage` sob chave `camini-exercise-catalog-storage` com `version: 1`.
   - Inicialização estritamente **idempotente**: novos exercícios sementes são mesclados sem sobrescrever nenhuma edição manual feita pelo usuário.
   - Operações CRUD completas: `createExercise` (rascunho inicial), `updateExercise` (preserva ID e incrementa versão), `publishExercise` (validação rigorosa de campos mínimos), `archiveExercise` e `restoreExercise` (sem deleção destrutiva).
   - Detecção em tempo real de nomes duplicados (`checkDuplicateName`), alertando o usuário sem impedir variantes legítimas.
   - Busca textual (nome, sinônimos, descrição, músculos) e filtros por equipamento, grupo muscular e estado.

4. **Interface e UX Baseadas nas Telas do Figma (`components/catalog/`):**
   - **Tela 11 (Biblioteca — `exercise-catalog-view.tsx`):** Header "Entenda o movimento", busca com campo arredondado, chips deslizantes de equipamentos e filtros musculares/status, contagem dinâmica e banner contextual "Consulte durante o descanso" quando uma sessão estiver em andamento.
   - **Card de Exercício (`exercise-card.tsx`):** Badges de status (Rascunho, Publicado, Pendente de Revisão, Arquivado) e indicador de mídias disponíveis/pendentes.
   - **Tela 12 e 14 (Detalhe — `exercise-detail-view.tsx`):** Cabeçalho com ações de voltar, editar, arquivar/restaurar; galeria de mídias 9:16 com navegação multiângulo e papel semântico; abas de conteúdo ("Execução", "Músculos & Equip.", "Dicas e Erros"); fallback para mídias pendentes conforme Figma 14.
   - **Galeria Vertical 9:16 (`media-gallery-modal.tsx`):** Visualizador em tela cheia com proporção 9:16 `contain`, seletor de ângulos (homem/mulher, início/fim, vista muscular 1/2) e legendas informativas.
   - **Formulário Completo Mobile-First (`exercise-form-view.tsx`):** Formulário em página/área rolável confortável (não modal comprimido) com 4 seções estruturadas, badges táteis para seleção de equipamentos e músculos, construtor de passos de execução e erros comuns, feedback de validação em tempo real e **modal de proteção contra descarte acidental de edições não salvas**.

5. **Backup Unificado e Retrocompatível (`components/workout/export-data-panel.tsx`):**
   - Envelope de exportação JSON (`schemaVersion: 2`) inclui o catálogo independente (`catalog: CatalogExercise[]`) mantendo a estrutura de sessões e histórico 100% retrocompatível.

---

## 2. Arquivos Criados e Alterados

| Arquivo | Natureza | Descrição / Responsabilidade |
|---|---|---|
| `types/exercise.ts` | **Criado** | Modelo de dados tipado do catálogo, enums biomecânicos e função de validação para publicação. |
| `data/default-exercises.ts` | **Criado** | Semente de 16 exercícios base com mídias semânticas do `manifest.json`. |
| `store/useExerciseCatalogStore.ts` | **Criado** | Store Zustand com persistência local, CRUD, busca, filtros e validação. |
| `components/catalog/exercise-card.tsx` | **Criado** | Componente de card para listagem da biblioteca. |
| `components/catalog/media-gallery-modal.tsx` | **Criado** | Modal de visualização 9:16 com alternância de ângulos e papéis semânticos. |
| `components/catalog/exercise-detail-view.tsx` | **Criado** | Tela de detalhes do exercício com abas de execução, anatomia, erros e ações. |
| `components/catalog/exercise-form-view.tsx` | **Criado** | Formulário mobile-first com validação, badges e proteção contra descarte. |
| `components/catalog/exercise-catalog-view.tsx` | **Criado** | Orquestrador principal da aba "Exercícios" (Figma 11). |
| `app/forca/page.tsx` | **Modificado** | Conexão da aba "Exercícios" ao `ExerciseCatalogView`. |
| `components/workout/export-data-panel.tsx` | **Modificado** | Inclusão do catálogo no backup JSON unificado (`schemaVersion: 2`). |
| `scripts/test-forca-f2-1.ts` | **Criado** | Suíte de testes automatizados com 12 cenários de auditoria do catálogo. |
| `docs/forca/FORCA_Produto_Arquitetura_Roadmap.md` | **Modificado** | Atualização do roadmap com F2.1, F2.2, F3 e F4. |
| `docs/forca/FORCA_F2_1_Catalogo_Exercicios.md` | **Criado** | Este relatório consolidado de entrega e validação. |

---

## 3. Modelo de Dados e Estratégia de Compatibilidade

### Contrato do Exercício no Catálogo (`CatalogExercise`)

```typescript
export interface CatalogExercise {
  // Identificação estável e versionamento
  id: string; // ex: "agachamento_goblet", slug estável imutável
  name: string; // "Agachamento Goblet"
  alternativeNames?: string[]; // ["Goblet Squat", "Agachamento com Halter"]
  description?: string;
  status: "draft" | "published" | "archived";
  version: number; // Incrementado a cada mutação
  createdAt: number;
  updatedAt: number;

  // Classificação biomecânica
  movementPattern?: MovementPattern; // squat | hinge | push | pull | lunge | etc.
  laterality: Laterality; // bilateral | unilateral | alternating | not_applicable
  primaryMuscles: string[]; // ["Quadríceps", "Glúteos"]
  secondaryMuscles?: string[]; // ["Core"]
  equipment: Equipment[]; // ["dumbbell"]

  // Prescrição e convenções permitidas
  measurementType: MeasurementType; // reps | duration | distance
  loadConvention: LoadConvention; // total | per_implement | additional | bodyweight

  // Instruções e coaching
  instructions?: string[]; // Passos sequenciais de execução
  commonErrors?: string[]; // Erros comuns a evitar

  // Acervo de mídia semântica
  media?: ExerciseMediaItem[];

  // Governança de conteúdo
  contentOrigin: ContentOrigin; // imported | user_created | system
  reviewStatus: ReviewStatus; // pending | reviewed | draft

  // Relação de variantes
  parentExerciseId?: string;
  variantNotes?: string;
}
```

### Regras de Compatibilidade e Isolamento
1. **Preservação do Snapshot de Treino:** A sessão ativa (`SessionExercise`) e o histórico (`CompletedWorkoutSession`) gravam snapshots completos (`ExerciseDefinition` / `SessionSet[]`). Nenhuma edição no catálogo altera nomes ou mídias de treinos já gravados ou em andamento.
2. **Não Sobrescrita na Inicialização:** Se o usuário editar a descrição do "Agachamento Goblet" ou cadastrar um novo exercício, a função `initializeCatalog` verifica a existência da chave pelo ID e não sobrescreve os dados locais existentes.
3. **Desacoplamento de Séries e Cargas:** Propriedades como número de séries, peso prescrito ou descanso permanecem exclusivas da ficha de treino (a ser implementada na F2.2) e nunca poluem a definição do catálogo.

---

## 4. Evidências Visuais e Capturas (Mobile 390 px)

As telas foram validadas em viewport mobile de **390 × 844 px** (padrão iPhone 12/13/14) utilizando o agente de browser:

| Tela | Descrição | Artefato / Evidência |
|---|---|---|
| **Listagem da Biblioteca** | Header "Entenda o movimento", busca arredondada, chips de equipamento deslizantes e banner da sessão ativa. | `catalog_list_390_1791916829141.png` |
| **Busca em Tempo Real** | Filtro instantâneo por termo "Agachamento", exibindo apenas exercícios compatíveis com contagem dinâmica. | `catalog_search_390_1791916844756.png` |
| **Detalhe do Exercício** | Visualização completa do exercício com badges, mídias 9:16, abas de anatomia e ações de editar/arquivar. | `catalog_detail_390_1791916897155.png` |
| **Formulário de Cadastro** | Área rolável confortável com seções numeradas, construtor de passos e proteção contra descarte acidental. | `catalog_form_390_1791917022256.png` |
| **Sessão em Vídeo** | Navegação contínua entre lista, busca, detalhe, abas e tentativa de cancelamento com diálogo de confirmação. | `catalog_mobile_demo_1791916800975.webp` |

---

## 5. Tabela de Critérios Testados e Resultados

Todos os 12 testes foram executados via script de automação (`scripts/test-forca-f2-1.ts`) e complementados com inspeção de interface:

| # | Critério Testado | Comportamento Esperado | Resultado |
|---|---|---|---|
| **T01** | Inicialização idempotente | Importa exercícios base marcando `imported` e `pending`; reexecuções não duplicam nem alteram registros. | **PASS** (Exit Code 0) |
| **T02** | Criação como rascunho | Salva novo exercício com `status: "draft"` e gera ID estável único. | **PASS** (Exit Code 0) |
| **T03** | Edição com ID estável | Atualiza dados, incrementa `version`, atualiza `updatedAt` e mantém `id` e `createdAt` imutáveis. | **PASS** (Exit Code 0) |
| **T04** | Proteção de dados do usuário | `initializeCatalog` não sobrescreve registros locais que já foram customizados pelo usuário. | **PASS** (Exit Code 0) |
| **T05** | Validação mínima de publicação | Exige nome (>=3 caracteres), medida, convenção de carga, lateralidade, equipamentos e instruções; mídia ausente emite warning mas não bloqueia. | **PASS** (Exit Code 0) |
| **T06** | Publicação via store | Valida requisitos e transiciona exercício para `status: "published"` e `reviewStatus: "reviewed"`. | **PASS** (Exit Code 0) |
| **T07** | Arquivamento e Restauração | Altera estado para `archived` sem exclusão física destrutiva; restaura para `published` preservando integridade. | **PASS** (Exit Code 0) |
| **T08** | Detecção de nomes duplicados | Detecta nomes foneticamente idênticos emitindo aviso na interface sem bloquear variantes legítimas. | **PASS** (Exit Code 0) |
| **T09** | Independência de Sessão e Histórico | Modificar o catálogo durante ou após um treino não altera snapshots de sessões ativas ou concluídas. | **PASS** (Exit Code 0) |
| **T10** | Persistência local | Estado sobrevive ao recarregamento e recupera exercícios através do `localStorage`. | **PASS** (Exit Code 0) |
| **T11** | Backup JSON unificado | Exporta catálogo junto com sessões e histórico no envelope `schemaVersion: 2` de forma retrocompatível. | **PASS** (Exit Code 0) |
| **T12** | Mídias semânticas e fallbacks | Diferencia papéis (execução, músculos, instruções, vídeo), exibe fallback textual para mídias pendentes sem travar. | **PASS** (Exit Code 0) |

### Regressão do Núcleo F2
- Suíte `scripts/test-forca-f2.ts` re-executada: **12/12 testes passaram com sucesso (Exit Code 0)**. Zero regressões no núcleo de treino, timer e editor de séries.

---

## 6. Resultados dos Comandos de Verificação

| Comando | Escopo | Código de Saída | Detalhes |
|---|---|---|---|
| `npx eslint app/forca components/catalog store/useExerciseCatalogStore.ts types/exercise.ts data/default-exercises.ts scripts/test-forca-f2-1.ts` | Arquivos da F2.1 | **0** | **0 erros, 0 avisos** nos arquivos do catálogo e FORÇA. |
| `npm run lint` | Todo o projeto | 1 (Legado) | 0 erros em FORÇA; 21 erros pré-existentes fora do módulo (TOTVS-RM e permissões). |
| `npx tsc --noEmit` | Todo o projeto | **0** | Verificação estrita de tipos TypeScript concluída com sucesso total. |
| `npm run build` | Next.js Build | **0** | Todas as 61 rotas do projeto compiladas com sucesso em produção. |

---

## 7. Limitações Conhecidas e Próximos Passos (F2.2 em Diante)

### Limitações Deliberadas Desta Etapa
1. **Sem Fichas Versionadas (Escopo da F2.2):** O catálogo agora existe de forma independente. As fichas individuais A–E que selecionam exercícios desse catálogo serão implementadas na etapa F2.2.
2. **Sem Exclusão Definitiva:** Exercícios podem ser arquivados e restaurados, mas não excluídos fisicamente para evitar dangling references em históricos futuros.
3. **Sem Upload Remoto de Mídias:** As mídias utilizam o acervo local mapeado em `/media-reference/` e o `manifest.json`. O upload para Supabase Storage pertence à etapa de sincronização (F4).
4. **Sem Chamadas de IA ou Serviços Pagos:** Nenhuma integração externa com Groq ou LLMs foi incluída nesta etapa, conforme diretriz.

### Próximos Passos
- **F2.2 — Fichas individuais e versões:** Modelagem de fichas com seleção a partir do catálogo, editor visual de ficha e snapshots por versão.
- **F3 — Uso offline:** Cache com Service Worker e IndexedDB transacional.
- **F4 — Sincronização:** Outbox offline-first e persistência na nuvem via Supabase.

---

## 8. Roteiro de Validação Manual para Christian

Execute os passos a seguir no navegador (preferencialmente no celular ou com ferramentas de desenvolvedor em 390 px):

1. **Acessar o FORÇA:**
   - Abra `http://localhost:3000/forca` (ou porta ativa).
   - Clique na aba **"Exercícios"** na navegação inferior.
2. **Testar Busca e Filtros:**
   - Digite `Goblet` no campo de busca: verifique que apenas o "Agachamento Goblet" aparece.
   - Limpe a busca e clique no chip **"Halteres"**: verifique que os exercícios filtrados utilizam halteres.
3. **Consultar Detalhes:**
   - Clique no card do **"Agachamento Goblet"**.
   - Verifique a imagem de execução 9:16 e os badges de informação.
   - Alterne entre as abas **"Execução"**, **"Músculos & Equip."** e **"Dicas e Erros"**.
4. **Testar Criação e Proteção contra Descarte:**
   - Volte para a lista e clique em **"+ Novo Exercício"**.
   - Digite um nome temporário (ex: `Meu Exercício Teste`).
   - Clique no botão **"Cancelar"** no topo: observe a abertura do diálogo de confirmação *"Deseja descartar as alterações não salvas?"*.
   - Clique em *"Continuar Editando"* para verificar que os dados foram preservados.
5. **Publicar Exercício:**
   - Preencha os campos obrigatórios (Padrão de movimento, Lateralidade, Medida, Carga, selecione pelo menos um Equipamento e Músculo, adicione 1 instrução).
   - Clique em **"Publicar"**: verifique o toast de sucesso e o badge verde *"Publicado"*.
6. **Testar Arquivamento e Restauração:**
   - Na tela de detalhes do exercício recém-criado, clique no botão com ícone de arquivo (**"Arquivar"**).
   - Confirme o diálogo: verifique o badge âmbar *"Arquivado"*.
   - Clique em **"Restaurar"**: confirme a restauração para o catálogo ativo.
7. **Verificar Sessão Intacta:**
   - Clique na aba **"Treinos"** e inicie o Treino A.
   - Registre uma série e clique na aba **"Exercícios"** para consultar a biblioteca.
   - Observe o banner verde *"Consulte durante o descanso"* e clique em *"Retomar sessão"*: verifique que a sessão e a série registrada permanecem 100% intactas.
