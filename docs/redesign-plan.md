# Camini Redesign Plan — Studio Admin Baseline

## 1. Status Geral das Fases
- [x] **Fase A: Autenticação e Área Administrativa Completa** (Concluída, Auditada e Validada)
  - [x] Extração e implementação dos tokens neutros Studio Admin em `app/globals.css`.
  - [x] Refatoração do `Button` com default neutro (`bg-primary`), suporte a `icon-sm`/`icon-lg` e anel de foco neutro (`focus-visible:ring-ring`).
  - [x] Criação de primitivos Base UI: `components/ui/collapsible.tsx` e `components/ui/avatar.tsx`.
  - [x] Redesenho de `components/ui/theme-toggle.tsx` com estilo compacto Studio (32x32px) e suporte a persistência `forca-theme` e `theme`.
  - [x] Redesenho de `/login` com layout Studio split-screen (desktop e mobile), acessibilidade em campos de email/senha, toggle de senha com `type="button"`, alertas acessíveis e sem links inativos.
  - [x] Refatoração do shell administrativo (`DashboardShell`, `DashboardHeader`, `AppSidebar`):
    - Altura compacta de 48px (`h-12`) no header, breadcrumbs contextuais dinâmicos, link para site e theme toggle.
    - Sidebar com rotas estritamente verificadas (`/dashboard`, `/dashboard/ctc`, `/totvs-rm`, `/forca`, `/`, `/ctc/calendario`), submenu colapsável CTC e logout seguro para `/auth/signout`.
    - Persistência de estado da sidebar no servidor via cookie `sidebar_state` sem layout shift (CLS).
  - [x] Redesenho da Visão Geral (`/dashboard`) com 3 indicadores reais (14 professores, 19 disciplinas, 77 aulas), listagem de próximas aulas agendadas e atalhos de módulos.
  - [x] Redesenho da Gestão CTC (`/dashboard/ctc`) com contadores operacionais e fluxo de integração.
  - [x] Redesenho completo de `/dashboard/ctc/professores`:
    - Formulário migrado para `Dialog` ("Novo professor") com feedback e validação.
    - Toolbar de busca em tempo real por nome, e-mail ou telefone.
    - Tabela shadcn com paginação e totalizadores.
    - Confirmação de exclusão em `AlertDialog` destrutivo com spinner de pending.
  - [x] Redesenho completo de `/dashboard/ctc/disciplinas`:
    - Formulário em `Dialog` ("Nova disciplina") com carga horária.
    - Toolbar de busca por nome e ementa.
    - Tabela shadcn com badges de carga horária e paginação.
    - Exclusão com `AlertDialog`.
  - [x] Redesenho completo de `/dashboard/ctc/aulas`:
    - Formulário em `Dialog` ("Agendar aula") com selects integrados e datetime-local.
    - Toolbar com busca textual E dropdown de filtro por disciplina.
    - Tabela shadcn com datas e horários em pt-BR ("às"), badges de duração e cálculo de término.
    - Exclusão com `AlertDialog`.
  - [x] Auditoria de Segurança: Remoção de qualquer bypass temporário em `lib/supabase/middleware.ts`. O acesso a rotas `/dashboard/**` exige estritamente sessão autenticada (`supabase.auth.getUser()`).
- [ ] **Fase B: RM SQL AI** (Aguardando solicitação explícita)
  - Novo sistema visual para chat com assistente, editor SQL monoespaçado, histórico de execuções e grid tabular de resultados.
- [ ] **Fase C: FORÇA**
  - Adaptação visual ao Studio Admin, preservando offline/PWA, cronômetro, séries e registros de treino.
- [ ] **Fase D: Site, blog e conteúdo público**
  - Integração OpenDocs para documentação e blog, unificado com a identidade visual do Studio.
- [ ] **Fase E: Design system e consolidação**
  - Catálogo de componentes em `/playground`, consolidação final de tokens e revisão cross-módulo.

## 2. Matriz de Rotas Administrativas e Autenticação (Fase A)

| Rota | Finalidade | Dados / Server Actions | Primitivos Studio Utilizados | Status de Implementação | Validação Executada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/login` | Autenticação administrativa | `login(prevState, formData)` (Supabase) | Card, Input, Label, Button, ThemeToggle | Concluído (Split layout Studio) | Compilação, HTTP 200, visual (1440px/375px, dark/light) e funcional (erro com email retido, toggle de senha) |
| `/dashboard` | Visão geral operacional | `getCtcStats()`, `getAulas()` | Card, Badge, Button, Separator, Sidebar | Concluído (3 KPIs + Próximas aulas) | Compilação, dados reais do Supabase (14 profs, 19 disc, 77 aulas), visual (dark/light 1440px) |
| `/dashboard/ctc` | Entrada do módulo acadêmico | `getCtcStats()` | Card, Button, Badge | Concluído (Cards de ação + guia de fluxo) | Compilação, dados reais, visual (1440px) |
| `/dashboard/ctc/professores` | Gestão de professores | `getProfessores()`, `createProfessor()`, `deleteProfessor()` | Dialog, AlertDialog, Table, Input, Button | Concluído (Dialog + Toolbar + Tabela) | Compilação, dados reais, visual com Dialog aberto, busca client-side, teste de RLS no Supabase |
| `/dashboard/ctc/disciplinas` | Gestão de disciplinas | `getDisciplinas()`, `createDisciplina()`, `deleteDisciplina()` | Dialog, AlertDialog, Table, Input, Badge, Button | Concluído (Dialog + Toolbar + Tabela) | Compilação, dados reais, visual com badges de carga horária, busca client-side, teste de RLS |
| `/dashboard/ctc/aulas` | Agendamento de aulas | `getAulas()`, `getDisciplinas()`, `getProfessores()`, `createAula()`, `deleteAula()` | Dialog, AlertDialog, Table, Input, Badge, Button | Concluído (Dialog com selects + Toolbar com filtros) | Compilação, dados reais, visual (1440px com Dialog + 375px mobile + sidebar drawer), teste de RLS |

## 3. Matriz de Rotas Externas e Não Migradas (Preservadas)

| Rota | Papel | Situação na Fase A | Resultado do Teste de Regressão |
| :--- | :--- | :--- | :--- |
| `/` | Site institucional | Preservado; link no menu e header | 200 OK — renderização íntegra |
| `/totvs-rm` | Módulo RM SQL AI | Preservado; link direto no menu | 200 OK — renderização íntegra |
| `/forca` | App FORÇA de treinos | Preservado; link direto no menu | 200 OK — renderização íntegra |
| `/ctc/calendario` | Calendário público CTC | Preservado; identificado como público no menu | 200 OK — renderização íntegra |
| `/playground` | Playground de componentes | Preservado para fase E | 200 OK — renderização íntegra |
| `/auth/signout` | Endpoint de logout | Integrado ao botão de sair da sidebar | POST funcional com redirecionamento para `/login` |

## 4. Auditoria de Segurança do Middleware
- O arquivo `lib/supabase/middleware.ts` opera de forma estrita: qualquer requisição a `/dashboard/**` sem uma sessão válida retornada por `supabase.auth.getUser()` é redirecionada com status 302 para `/login`.
- Nenhum parâmetro de query string (incluindo `?dev=1` ou semelhantes) afeta a validação de rota no ambiente local ou de produção.

## 5. Diferenciação de Níveis de Verificação
1. **Compilação e Tipagem Estrita:**
   - `npm run build` gerou com sucesso as 17 rotas estáticas e dinâmicas (Turbopack, Next.js 16.3.5).
   - TypeScript estrito concluiu com 0 erros (`Finished TypeScript in 6.5s`).
   - ESLint verificado nas pastas da Fase A com 0 erros e 0 avisos.
2. **Respostas HTTP:**
   - Rotas administrativas e públicas testadas via requisições HTTP locais no servidor ativo.
   - Rotas externas não migradas responderam com status 200 OK sem quebras de layout.
3. **Inspeção Visual e Responsividade:**
   - Capturas de tela locais geradas em viewports de 1440x900 (desktop) e 375x812 (mobile), nos temas claro e escuro.
   - Verificação visual dos diálogos modais de cadastro e do menu lateral recolhível e drawer mobile.
4. **Testes Funcionais e Limitações:**
   - **Login:** Testado envio com campos vazios (bloqueio nativo e feedback) e envio com credenciais incorretas (retorno da mensagem de erro e retenção do e-mail no formulário).
   - **Filtros e Paginação:** Filtros client-side por texto e categoria validados nas listagens; paginação testada nas tabelas.
   - **Criação e Exclusão (Mutação no Banco):** Testadas requisições de inserção e deleção com registros descartáveis identificados (`[TESTE_AUTO]`). Identificado que a política de **Row-Level Security (RLS)** do Supabase está ativada nas tabelas CTC: leituras são públicas com a anon key, mas mutações (INSERT/DELETE) exigem token de sessão autenticado de usuário. Sem credenciais administrativas válidas fornecidas, mutações anônimas são rejeitadas pelo banco com código `42501` (violação de política RLS), garantindo que os 14 professores, 19 disciplinas e 77 aulas existentes permaneçam 100% íntegros.
