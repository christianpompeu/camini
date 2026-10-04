# Documentação da Reformulação Visual — Dashboard e Autenticação

## 1. Contexto e Motivação
A reformulação visual do Camini adota a linguagem visual e estrutura do **Studio Admin**, migrando de uma estética com gradientes coloridos e decorações expressivas para um design de alta produtividade: sóbrio, neutro, consistente e acessível.

## 2. Decisões de Arquitetura e Componentes
- **Base UI Integration:** Os primitivos são mantidos em `@base-ui/react` (shadcn base-nova). Componentes compostos como `SidebarMenuButton` e `SidebarMenuSubButton` usam a prop `render={<Link href="..." />}` para manter compatibilidade e navegação client-side limpa.
- **Primitivos Adicionados:**
  - `components/ui/collapsible.tsx`: Implementado sobre `@base-ui/react/collapsible`.
  - `components/ui/avatar.tsx`: Implementado sobre `@base-ui/react/avatar`.
  - `components/ui/button.tsx`: Ajustado para variantes neutras de default e suporte a `icon-sm` e `icon-lg`.
  - `components/ui/theme-toggle.tsx`: Redesenhado como botão compacto de 32x32px (`h-8 w-8`) com preservação de tema.
- **Persistência de Sidebar:** Leitura do cookie `sidebar_state` no Server Component `app/dashboard/layout.tsx` para evitar Cumulative Layout Shift (CLS) no carregamento inicial da página.

## 3. Telas Reformuladas na Fase A
1. **`/login`:**
   - Tela cheia com visual split Studio (painel escuro com assinatura tipográfica Camini no desktop; formulário centralizado e responsivo no mobile).
   - Acessibilidade: labels explícitos, campo de e-mail, toggle de senha acessível (`type="button"` com `aria-label`), anúncio de erro via alert e estado de pending.
   - Preservação da Server Action existente e redirecionamento para `/dashboard`.
2. **`Shell do Dashboard` (`components/layout/dashboard-shell.tsx`, `sidebar.tsx`, `dashboard-header.tsx`):**
   - Header compacto (48px / `h-12`) com trigger, breadcrumb contextual dinâmico e theme toggle.
   - Sidebar com rotas estritamente verificadas:
     - `/dashboard` (Visão geral)
     - `/dashboard/ctc` (Gestão CTC com submenu colapsável: Professores, Disciplinas, Aulas)
     - `/ctc/calendario` (Visualização pública do calendário)
     - `/totvs-rm` (RM SQL AI)
     - `/forca` (App FORÇA)
     - `/` (Retorno ao site)
   - Área inferior com identificação neutra e ação funcional de logout via formulário seguro para `/auth/signout`.
3. **`/dashboard` (Visão Geral):**
   - 3 cartões de indicadores reais (Professores cadastrados, Disciplinas cadastradas, Aulas agendadas) derivados de `getCtcStats()`.
   - Seção principal com próximas aulas ordenadas por data/hora, exibindo disciplina, professor e duração, com estado vazio e link para agendamento.
   - Seção complementar com atalhos rápidos para módulos ativos.
4. **`/dashboard/ctc` (Módulo CTC):**
   - Visão geral da área acadêmica com contadores e links rápidos para os submódulos e calendário público.
5. **`/dashboard/ctc/professores`:**
   - Tabela responsiva com busca client-side por nome, e-mail ou telefone.
   - Formulário de cadastro movido para `Dialog` acessível ("Novo Professor"), com validação e feedback.
   - Exclusão com confirmação em `AlertDialog` destrutivo.
6. **`/dashboard/ctc/disciplinas`:**
   - Tabela responsiva com busca client-side por nome ou descrição.
   - Formulário de cadastro em `Dialog` ("Nova Disciplina") com carga horária.
   - Exclusão com `AlertDialog`.
7. **`/dashboard/ctc/aulas`:**
   - Tabela com formatação de data/hora em português (`pt-BR`), disciplina, professor e duração.
   - Toolbar de busca e filtro por disciplina.
   - Formulário em `Dialog` ("Agendar Aula") com selects nativos/Base UI integrados com Server Actions.
   - Exclusão com `AlertDialog`.
