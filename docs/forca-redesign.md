# FORÇA Redesign — Auditoria, Arquitetura e Plano de Execução

## 1. Inventário Inicial e Auditoria do Módulo FORÇA

### Estado Atual do Código
- **Rota:** `/forca` (`app/forca/page.tsx`)
- **Componentes Dedicados:** `components/workout/`
  - `workout-card.tsx` — Apresentação dos treinos A, B, C com foco, contagem de exercícios, tempo estimado e último registro.
  - `active-set-card.tsx` — Registro interativo da série em execução: controle de Carga (kg), Repetições (reps), RIR (0-3), conclusão e reabertura de série.
  - `exercise-hero.tsx` — Detalhes e instruções do exercício: categoria, séries/reps, músculos ativados e lista de orientações de execução.
  - `rest-timer.tsx` — Temporizador regressivo circular SVG com controles de Play/Pause, Reset e acréscimo de +30s.
  - `floating-workout-bar.tsx` — Barra de ação rápida para indicar status do treino ativo e atalho para próxima ação.
  - `bottom-navigation.tsx` — Barra de navegação inferior flutuante com abas (Treinos, Histórico, Exercícios, Progresso).

### Recursos Verificados (Existentes vs Ausentes)
1. **Plano de treino e divisão por dias/grupos:** EXISTE. Divisões A (Peito, Ombros e Tríceps), B (Costas e Bíceps) e C (Pernas Completo).
2. **Lista de exercícios e detalhes/instruções:** EXISTE. Estrutura de orientações de execução, músculos ativados e recomendações em `exercise-hero.tsx`.
3. **Séries, repetições, cargas e marcação:** EXISTE. Interação completa em `active-set-card.tsx` (carga, repetições, RIR 0 a 3, marcação de conclusão).
4. **Sessão de treino, descanso e temporizadores:** EXISTE. `rest-timer.tsx` funcional com contagem regressiva em segundos, formatação MM:SS e feedback.
5. **Histórico e progresso:** PARCIAL. Dados de execução presentes nos cards ("Ontem, 19:30", "Há 3 dias", "Há 5 dias", "+4 kg nesta semana").
6. **Persistência remota / PWA / Service Worker:** NÃO EXISTE no código atual. Não há `manifest.json` específico de treino, nem Service Worker registrado em `/forca`. A única persistência existente é de tema via `localStorage.getItem('forca-theme')`. A arquitetura será mantida fiel sem inventar sincronizações inexistentes.

---

## 2. Decisões de Design e Identidade (Studio Admin)
- **Eliminação de tokens legados:** Substituição completa de `bg-gradient-camini`, `bg-surface`, `bg-surface-elevated`, `text-camini-cobalt`, `border-outline`, `card-elevation`, `rounded-pill` e classes `energy-*` pelos tokens neutros do Studio Admin (`bg-background`, `bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `rounded-xl`, `rounded-lg`).
- **Suporte a Tema Claro e Escuro:** Respeito absoluto à preferência do usuário (sem forçar dark mode). Ambos os modos devem possuir contraste perfeito para leitura em movimento na academia.
- **Experiência de Uso (Mobile-First):**
  - Alvos de toque com área mínima de 44x44px.
  - Tipografia de números grandes para Carga e Repetições (legibilidade sem forçar a vista).
  - Navegação fluida entre Seleção de Treino, Sessão Ativa de Treino, Consulta de Exercícios e Histórico.
  - Eliminação de alertas nativos (`alert(...)`), integrando o clique de início de treino diretamente ao fluxo da sessão ativa.

---

## 3. Plano de Implementação em Lotes

- [x] **Lote 1: Refatoração dos Componentes Base (`components/workout/*`)**
  - `workout-card.tsx`: design neutro Studio, botões e badges shadcn.
  - `active-set-card.tsx`: botões ergonômicos para carga/reps, seletor de RIR acessível com contraste neutro, feedback de conclusão claro.
  - `exercise-hero.tsx`: apresentação limpa das instruções, badges de músculos em tokens neutros, sem gradientes legados.
  - `rest-timer.tsx`: anel de progresso em SVG utilizando tokens do tema (`stroke-primary`), controles com botões shadcn e labels acessíveis.
  - `floating-workout-bar.tsx` e `bottom-navigation.tsx`: barra inferior neutra com contraste adequado e safe area.
- [x] **Lote 2: Recomposição da Página Principal (`app/forca/page.tsx`)**
  - Cabeçalho compacto integrado à `Navbar`.
  - Abas funcionais integradas à `BottomNavigation`:
    1. **Treinos:** visualização dos treinos do ciclo com opção de iniciar sessão.
    2. **Sessão Ativa:** área dedicada à execução atual (série ativa + timer de descanso).
    3. **Exercícios:** biblioteca de exercícios com detalhes e execução.
    4. **Histórico:** registro dos treinos anteriores.
  - Responsividade desktop (painéis laterais/duas colunas quando em telas largas) e mobile (coluna única ergonômica).
- [x] **Lote 3: Validação Técnica e Não-Regressão**
  - `tsc --noEmit`: 0 erros (código 0).
  - ESLint: 0 erros e 0 avisos nos componentes e página do FORÇA.
  - `npm run build`: compilação Turbopack bem-sucedida (17/17 rotas estáticas e dinâmicas geradas).
  - Validação em browser desktop (1440x900) e mobile (375x812) cobrindo troca de abas, início de treino dinâmico e sem overflow.
  - Validação de não-regressão nas páginas `/`, `/login`, `/dashboard` e `/totvs-rm` (todas respondendo status 200 / 307 com layout íntegro).

---

## 4. Evidências de Validação
- **Screenshots Gerados:**
  - `treinos_tab_desktop_1791220442018.png` — Aba Treinos e Sessão Ativa em 1440px.
  - `exercicios_tab_desktop_1791220448562.png` — Biblioteca de Execução de Exercícios com ExerciseHero em 1440px.
  - `historico_tab_desktop_1791220456780.png` — Histórico de Treinos e Execuções Concluídas em 1440px.
  - `treino_b_iniciado_1791220482704.png` — Treino B selecionado e carregado dinamicamente na Sessão Ativa.
  - `mobile_view_1791220493637.png` — Layout responsivo de coluna única com alvos de toque em 375px.
- **Gravação de Sessão:** `forca_validation_1791220419455.webp`

