# Design System (Camini)
Baseado em: Studio Admin Dashboard

## Tipografia
- Fonte Principal: Geist Sans (fallback para system-ui).
- Fonte Mono: Geist Mono (para componentes de código/RM).
- Densidade: Compacta/Produtividade.

## Tokens e Cores
O tema neutro substitui a antiga paleta (azul, ciano e esmeralda). As cores de acento do brand Camini serão usadas muito esporadicamente, não regendo o sistema global.

- **Background:** `--background: oklch(1 0 0)` (Claro) / `oklch(0.145 0 0)` (Escuro).
- **Cards e Superfícies:** `--card: oklch(1 0 0)` (Claro) / `oklch(0.205 0 0)` (Escuro).
- **Sidebar:** Fundo quase idêntico ao background.
- **Raios (Border Radius):** Baseline em `0.625rem` (10px). Variáveis `--radius-sm` até `--radius-4xl`.

## Componentes (Primitivos)
Utiliza-se estritamente Shadcn com Base UI.

- **Button:** Variante default usa cor primária sólida. Variantes 'camini' removidas do contexto administrativo.
- **Table:** Usar `Table`, `TableHeader`, `TableRow`, `TableCell` para listagens ao invés de tags nativas (já em vigor).
- **Sidebar:** Shadcn `SidebarProvider` e `Sidebar` deverão orquestrar toda a interface administrativa, unificando o controle (sem modais manuais).

> Nota: Compatibilidades de legado (gradientes forca/camini) permanecem restritas ao css utilitário até que as fases C/D sejam concluídas.
