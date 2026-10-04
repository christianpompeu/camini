# Design System Camini (Baseline Studio Admin)

Baseado na identidade visual do Studio Admin (arhamkhnz/next-shadcn-admin-dashboard), adaptada para os componentes Base UI do Camini.

## 1. Tipografia e Escala
- **Fonte Padrão (Sans):** `Geist Sans` (fallback `system-ui, -apple-system, sans-serif`).
- **Fonte Código (Mono):** `Geist Mono` (para SQL, queries e identificadores).
- **Hierarquia:**
  - `h1`: `text-2xl font-bold tracking-tight` (desktop: `text-3xl font-bold tracking-tight`)
  - `h2`: `text-lg font-semibold tracking-tight`
  - `h3`: `text-sm font-semibold text-foreground`
  - Corpo: `text-sm text-foreground` (linha de leitura `leading-normal`)
  - Legendas / Metadados: `text-xs text-muted-foreground`

## 2. Tokens Semânticos e Cores (Tema Neutro)

A paleta neutra Studio substitui gradientes expressivos e decorações no dashboard administrativo:

| Token | Modo Claro (OKLCH) | Modo Escuro (OKLCH) | Descrição |
| :--- | :--- | :--- | :--- |
| `--background` | `oklch(1 0 0)` (#ffffff) | `oklch(0.145 0 0)` (#18181b) | Fundo da aplicação |
| `--foreground` | `oklch(0.145 0 0)` (#18181b) | `oklch(0.985 0 0)` (#fafafa) | Texto principal |
| `--card` | `oklch(1 0 0)` (#ffffff) | `oklch(0.205 0 0)` (#27272a) | Superfície de cartões |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Texto em cartões |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Diálogos e menus flutuantes |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Botões de ação primária |
| `--primary-foreground`| `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Texto sobre botão primário |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Ações secundárias |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Fundos atenuados |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Textos secundários |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Bordas e divisores |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Bordas de campos de entrada |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Anel de foco |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Ações de exclusão e perigo |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Fundo da sidebar |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Borda lateral da barra |

## 3. Dimensões, Espaçamento e Raios
- **Raio Base (`--radius`):** `0.625rem` (10px).
- **Largura da Sidebar:**
  - Expandida: `16rem` (~272px).
  - Ícone / Recolhida: `3rem` (48px).
  - Mobile (Sheet): `18rem`.
- **Altura do Header:** `48px` (`h-12`) no desktop, fixo e compacto.
- **Altura dos Controles:**
  - Botão default: `36px` (`h-9`), `px-4 py-2 text-sm`.
  - Botão sm: `32px` (`h-8`), `px-3 py-1 text-xs`.
  - Botão lg: `44px` (`h-11`), `px-6 py-2.5 text-base`.
  - Input: `36px` (`h-9`), `px-3 py-1 text-sm`.

## 4. Primitivos e Variantes de Componentes
- **Button:**
  - `default`: Neutro de alto contraste (`bg-primary text-primary-foreground`).
  - `outline`: Borda sutil neutra (`border border-input bg-background`).
  - `secondary`: Superfície neutra atenuada (`bg-secondary text-secondary-foreground`).
  - `destructive`: Vermelho semântico para confirmações de deleção.
  - `ghost`: Transparente para triggers de ícones e navegações em listas.
- **Dialog & Sheet:** Abertura com animação leve e backdrop suave (`bg-black/40` com blur leve), fechamento com tecla Escape e clique fora, gerenciamento de foco nativo do `@base-ui/react`.
- **Table:** Cabeçalhos em `text-xs font-medium text-muted-foreground uppercase tracking-wider`, linhas com hover suave (`hover:bg-muted/50`), scroll horizontal em telas estreitas sem transbordar a página.
- **AlertDialog:** Modal destrutivo dedicado para confirmação de exclusão (Professores, Disciplinas, Aulas).

## 5. Compatibilidade Transitória (Fases B, C, D)
- As classes utilitárias legadas (`.bg-gradient-camini`, `.card-elevation`, `.tap-effect`) e variantes como `energy`, `effort`, `coral` são preservadas em `app/globals.css` e no `button.tsx` para não quebrar módulos ainda não reformulados (FORÇA, RM SQL AI, Playground).
