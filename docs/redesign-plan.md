# Camini Redesign Plan

## Inventário e Fases
- [x] **Fase A: Autenticação e Área Administrativa** (Em andamento)
  - [x] Extração do baseline visual do Studio Admin.
  - [x] Atualização de `globals.css` com o novo sistema visual (neutro).
  - [x] Refatorar Layout Compartilhado do `/dashboard`.
  - [x] Refatorar `/login`.
  - [x] Refatorar Visão Geral `/dashboard`.
  - [x] Refatorar `/dashboard/ctc` e listagens (Professores, Disciplinas, Aulas).
- [ ] **Fase B: RM SQL AI**
- [ ] **Fase C: FORÇA**
- [ ] **Fase D: Site, blog e conteúdo público**
- [ ] **Fase E: Design system e consolidação**

## Decisões da Fase A
- **Referência:** Studio Admin (arhamkhnz/next-shadcn-admin-dashboard).
- **Cores & Tokens:** Neutros originais do Studio (light: background white; dark: background almost black).
- **Decorações Antigas:** Omitidas do dashboard (gradientes coloridos e glassmorphism são removidos do layout primário).
- **Primitivos:** `shadcn/ui` baseados no `@base-ui/react`.

## Próxima Ação Concreta
- 1. Iniciar **Fase B: RM SQL AI** migrando os componentes de data visualization e SQL builder.

