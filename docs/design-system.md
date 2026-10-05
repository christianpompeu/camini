# Design System Camini (Baseline Studio Admin & Base UI)

Consolidação oficial da linguagem visual e do catálogo de componentes do Camini, baseada na identidade neutra do **Studio Admin** (`arhamkhnz/next-shadcn-admin-dashboard`) e nos primitivos semânticos do **Base UI** (`@base-ui/react`).

A rota interativa e isolada de demonstração está disponível em `/playground`.

---

## 1. Tipografia e Hierarquia de Leitura
- **Família Sans Padrão:** `Geist Sans` (com fallback nativo `system-ui, -apple-system, sans-serif`).
- **Família Monospaçada (Código & SQL):** `Geist Mono` (para blocos analíticos do RM SQL AI, queries e identificadores de tabela).
- **Escala Padronizada:**
  - `Display / Hero`: `text-3xl sm:text-4xl font-bold tracking-tight`
  - `H1 (Páginas)`: `text-2xl sm:text-3xl font-bold tracking-tight`
  - `H2 (Seções / Grupos)`: `text-lg font-semibold tracking-tight`
  - `H3 (Cards / Cabeçalhos)`: `text-base font-semibold text-foreground`
  - `Corpo / Labels`: `text-sm text-foreground` (linha de leitura `leading-normal`)
  - `Legendas / Metadados`: `text-xs text-muted-foreground`
  - `Código inline`: `font-mono text-xs bg-muted px-1.5 py-0.5 rounded-md`

---

## 2. Tokens Semânticos e Paleta Neutra

Todas as cores operam sobre variáveis de tema neutras e acessíveis (WCAG AA), dispensando gradientes arbitrários no sistema administrativo:

| Token | Modo Claro (OKLCH / HEX) | Modo Escuro (OKLCH / HEX) | Uso Semântico |
| :--- | :--- | :--- | :--- |
| `--background` | `oklch(1 0 0)` (#ffffff) | `oklch(0.145 0 0)` (#18181b) | Fundo base de viewport |
| `--foreground` | `oklch(0.145 0 0)` (#18181b) | `oklch(0.985 0 0)` (#fafafa) | Tipografia dominante |
| `--card` | `oklch(1 0 0)` (#ffffff) | `oklch(0.205 0 0)` (#27272a) | Superfície de cartões e seções |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Texto interno de cartões |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Menus, diálogos e tooltips |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Ações primárias (alto contraste) |
| `--primary-foreground`| `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Texto sobre botão primário |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Ações de apoio e superfícies suaves |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Fundos sutis e estados desabilitados |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Subtítulos e metadados contextuais |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Divisores, bordas de tabela e cards |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Contorno neutro de inputs e selects |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Anel de foco visível em teclado |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Ações destrutivas e alertas |

---

## 3. Raios, Elevações e Espaçamentos
- **Raio Base (`--radius`):** `0.625rem` (10px).
  - `--radius-sm`: `6px` (badges compactos, tags).
  - `--radius-md`: `8px` (inputs, botões padrão, controles).
  - `--radius-lg`: `10px` (cards de métricas, contêineres).
  - `--radius-xl`: `14px` (modais, diálogos e gavetas laterais).
- **Alturas dos Controles:**
  - Botão default / Input / Select: `h-9` (36px).
  - Botão sm / Ações de tabela: `h-8` (32px).
  - Botão lg: `h-11` (44px).
  - Touch Target Mobile Mínimo: `≥ 44px` (em mobile views e abas do app FORÇA).
- **Header:**
  - Administrativo (`DashboardHeader`): `h-12` (48px), fixo com breadcrumbs contextuais.
  - Público (`Navbar` OpenDocs): `h-14` (56px) com links diretos aos módulos.

---

## 4. Primitivos Base UI e Convenções de Composição

O projeto adota `@base-ui/react` como fundação de acessibilidade. Em vez da prop `asChild` tradicional do Radix, os componentes usam a prop `render`:

```tsx
// Padrão Base UI com Link do Next.js
<Button
  variant="outline"
  size="sm"
  render={<Link href="/dashboard/ctc" />}
>
  Área Administrativa
</Button>
```

### Componentes Consolidados:
1. **Button:**
   - Variantes: `default`, `secondary`, `outline`, `destructive`, `ghost`, `link`.
   - Suporte a spinner `Loader2` e estado `disabled`.
2. **Badge / Chip:**
   - Variantes: `default`, `secondary`, `outline`, `destructive`.
3. **Input & Textarea:**
   - Variantes neutras integradas com `Label` e estados de erro acessíveis (`border-destructive`).
4. **Switch:**
   - Alternador tátil acessível Base UI (`SwitchPrimitive.Root`).
5. **Dialog & Sheet:**
   - Gestão de foco automático, fechamento via Escape e clique no backdrop.
6. **AlertDialog:**
   - Confirmações destrutivas com tratamento de dependência referencial (prevenção prévia de exclusão de professores/disciplinas com aulas vinculadas).
7. **Table:**
   - Tabelas neutras de alta densidade com paginação e toolbar de busca em tempo real.
8. **Toast:**
   - Notificações transitórias integradas via `sonner` (`toast.success`, `toast.error`, `toast.info`).
9. **Skeleton:**
   - Animação de pulso neutra com dimensionamento correspondente ao conteúdo real, garantindo CLS zero.

---

## 5. Rota do Catálogo (`/playground`)
A rota `/playground` atua como catálogo vivo de componentes:
- Não efetua mutações no banco de dados.
- Apresenta todas as variantes reais e estados suportados.
- Permite validação de contraste e responsividade em múltiplos viewports (375px, 768px, 1280px e 1440px).
