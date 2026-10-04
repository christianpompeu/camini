# Camini Redesign Plan — Studio Admin Baseline

## 1. Visão Geral e Fases do Projeto
- [x] **Fase A: Autenticação e Área Administrativa Completa** (Em execução)
  - [x] Extração do baseline visual do Studio Admin (neutro, Geist Sans, raio 0.625rem).
  - [x] Configuração de tokens em `app/globals.css`.
  - [x] Correção e criação de primitivos Base UI (`collapsible`, `avatar`, `button`, `theme-toggle`).
  - [ ] Redesenho da página `/login` com layout Studio split-screen responsivo e acessibilidade total.
  - [ ] Refatoração do Shell Administrativo (`dashboard-shell`, `sidebar`, `dashboard-header`) com persistência de estado via cookie `sidebar_state` no servidor e rotas verificadas.
  - [ ] Redesenho da Visão Geral (`/dashboard`) com 3 KPIs reais, próximas aulas e atalhos rápidos.
  - [ ] Redesenho da Gestão CTC (`/dashboard/ctc`) com visão geral e acessos rápidos.
  - [ ] Refatoração completa das listagens CTC (`professores`, `disciplinas`, `aulas`):
    - Formulários migrados para `Dialog` acessível.
    - Toolbar de busca e filtros client-side com paginação.
    - Exclusão com `AlertDialog` destrutivo e estados de pending.
    - Estados vazios com chamada de ação.
  - [ ] Validação completa (Next.js build, typecheck, lint, responsividade 375/768/1280/1440px).
- [ ] **Fase B: RM SQL AI**
  - Aplicação da nova identidade visual aos componentes de chat, editor SQL monoespaçado, histórico e grid de resultados.
- [ ] **Fase C: FORÇA**
  - Adaptação ao novo sistema visual Studio com ergonomia mobile aprimorada, mantendo suporte PWA/offline.
- [ ] **Fase D: Site, blog e conteúdo público**
  - Integração do OpenDocs para estrutura de documentação/blog, mantendo consistência com o tema neutro.
- [ ] **Fase E: Design system e consolidação**
  - Catálogo de componentes em `/playground`, consolidação de tokens e revisão cross-módulo.

## 2. Matriz de Rotas do Escopo (Fase A)

| Rota | Finalidade | Dados / Server Actions | Layout / Shell | Situação |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | Autenticação no painel | `login(prevState, formData)` (Supabase) | Tela cheia (Split Studio) | Redesenhar com foco em acessibilidade e sem links mortos |
| `/dashboard` | Visão Geral Operacional | `getCtcStats()`, `getAulas()` | `DashboardShell` | 3 KPIs reais + Próximas Aulas + Atalhos de Módulos |
| `/dashboard/ctc` | Entrada do Módulo CTC | `getCtcStats()` | `DashboardShell` | Cards de resumo + links diretos para subrotas + Calendário |
| `/dashboard/ctc/professores` | Gestão de Professores | `getProfessores()`, `createProfessor()`, `deleteProfessor()` | `DashboardShell` | Dialog de cadastro + Toolbar de busca + Tabela + AlertDialog |
| `/dashboard/ctc/disciplinas` | Gestão de Disciplinas | `getDisciplinas()`, `createDisciplina()`, `deleteDisciplina()` | `DashboardShell` | Dialog de cadastro + Toolbar de busca + Tabela + AlertDialog |
| `/dashboard/ctc/aulas` | Gestão de Aulas | `getAulas()`, `getDisciplinas()`, `getProfessores()`, `createAula()`, `deleteAula()` | `DashboardShell` | Dialog com selects Base UI + Toolbar + Formatação pt-BR + AlertDialog |

## 3. Mapeamento de Rotas Externas e Legadas
- `/totvs-rm`: Rota real do módulo RM SQL AI (preservar link direto, sem criar `/dashboard/totvs-rm`).
- `/forca`: Rota real do app de treino (preservar link direto, sem criar `/dashboard/forca`).
- `/ctc/calendario`: Visualização pública da grade de aulas (preservar link no menu).
- `/`: Site público (atalho de retorno ao site).
- `/auth/signout`: Endpoint POST real para logout seguro.
- Rotas fictícias removidas do menu: `/dashboard/workflows`, `/dashboard/produtos`, `/dashboard/permissoes`, `/dashboard/config`.

## 4. Checklist de Validação
- [x] TypeScript sem erros de tipos nos primitivos Base UI e componentes.
- [ ] Next build limpo sem warnings críticos de rotas.
- [ ] Sidebar recolhível com persistência via cookie sem flash SSR.
- [ ] Responsividade testada em 375px, 768px, 1280px e 1440px.
- [ ] Suporte a Dark e Light mode com persistência local.
