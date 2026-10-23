# Guideline de Identidade Visual — Camini Observatório (Panorama & Tech)

Este documento consolida a identidade visual, os padrões de design, os tokens de estilo e os princípios de composição desenvolvidos para os produtos editoriais **Panorama** e **Tech** do Camini Observatório. Ele serve como diretriz oficial para futuras implementações, expansões de telas e avaliação de adoção em outros módulos do ecossistema.

---

## 1. Filosofia de Design e Propósito Editorial

A identidade visual do Observatório une dois universos complementares:
1. **A solidez e o prestígio editorial:** Tipografia imponente, hierarquia assertiva, respiro generoso e diagramação que privilegia a profundidade analítica ("menos ruído, mais perspectiva").
2. **A sofisticação do design digital moderno:** Superfícies translúcidas com *glassmorphism*, ambient orbs etéreos, micro-interações táteis e sombras volumétricas sutis que geram sensação tátil de produto de alto padrão (*WOW factor*).

### Princípios Fundamentais:
- **Clareza sem frieza:** Ausência de layouts genéricos cinzentos de IA; uso de cores ricas e curadas (violetas e índigos elétricos) com equilíbrio de contraste.
- **Rigor na informação:** Cada elemento visual tem propósito cognitivo (distinguir periodicidade, sinalizar estágio editorial, destacar tópicos estruturados).
- **Sem poluição ou clickbait:** Elementos gráficos transmitem credibilidade executiva, sem ruído visual excessivo ou saturação agressiva.

---

## 2. Tokens Cromáticos e Identidade por Canal

A identidade cromática opera com uma base neutra compartilhada de alta legibilidade e ramificações específicas para cada canal editorial.

### 2.1. Base Neutra Compartilhada

| Elemento | Token Tailwind / Hex | Descrição e Uso |
| :--- | :--- | :--- |
| **Fundo da Página** | `#fbfbfe` | Branco gelo com leve matiz violeta/azulada; evita a frieza do branco absoluto (#fff). |
| **Gradiente de Fundo (Assinatura)** | `linear-gradient(135deg, #fff 0%, #faf9ff 48%, #eef8ff 100%)` | Gradiente sutil em diagonal que confere dinamismo e luminosidade. |
| **Ambient Orbs (Glows de Fundo)** | `violet-200/30 blur-3xl` e `cyan-200/20 blur-3xl` | Círculos orgânicos desfocados no background para profundidade espacial. |
| **Texto Primário (Headings/Corpo)** | `#0f172a` (`slate-950`) / `#101127` | Preto/azul meia-noite denso de altíssimo contraste e legibilidade. |
| **Texto Secundário** | `#475569` (`slate-600`) | Cinza ardósia para subtítulos, parágrafos explicativos e notas de contexto. |
| **Bordas Estruturais** | `border-slate-200` / `border-violet-100` | Delimitação sutil e elegante sem pesar a interface. |
| **Banner Escuro (High-Contrast CTA)**| `#17112e` | Roxo-marinho escuro para caixas de destaque e conversão no rodapé. |

---

### 2.2. Canal Panorama (Atualidades, Política, Economia & Sociedade)

- **Voz Visual:** Ampla, estratégica, com profundidade de contexto para além do fato isolado.
- **Cor Primária de Destaque:** Roxo Editorial / Deep Violet (`#6237ed` / `violet-600`).
- **Superfície Suave / Fundos de Tags:** `violet-50` (`#f1edff`) / `violet-100`.
- **Badge de Status Operacional:** `Em preparação` (Pill violeta com fundo suave e texto com peso `font-semibold uppercase`, refletindo a fase de estruturação editorial).
- **Tags Temáticas Oficiais:** *Política*, *Economia*, *Geopolítica*, *Sociedade*, *Clima*.

```tsx
// Exemplo de aplicação no canal Panorama
<span className="rounded-full bg-violet-100 text-violet-700 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
  Em preparação
</span>
<h1 className="text-violet-600">Panorama.</h1>
```

---

### 2.3. Canal Tech (Tecnologia, Inovação, IA, Software & Pesquisa)

- **Voz Visual:** Precisa, contemporânea, orientada ao futuro, sem ruído especulativo.
- **Cor Primária de Destaque:** Electric Indigo / Tech Violet (`#4d39f1` / `#5b2cff` / `indigo-600`).
- **Superfície Suave / Fundos de Tags:** `indigo-50` (`#eeedff`) com toques contextuais de ciano (`cyan-400` / `teal-400`).
- **Badge de Status Operacional:** `Em preparação` (Pill índigo com fundo suave e texto com peso `font-semibold uppercase`).
- **Tags Temáticas Oficiais:** *IA*, *Software*, *Pesquisa*, *Segurança*, *Startups*.

```tsx
// Exemplo de aplicação no canal Tech
<span className="rounded-full bg-indigo-100 text-indigo-700 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
  Em preparação
</span>
<h1 className="text-[#4d39f1]">Tech.</h1>
```

---

## 3. Tipografia e Hierarquia de Impacto

A tipografia do Observatório se destaca pela densidade óptica e ritmo de leitura rigoroso:

### 3.1. Display Hero Headings
- **Especificação:** `text-4xl sm:text-5xl lg:text-7xl font-black leading-[.98] tracking-[-.045em]`
- **Assinatura Estilística do Ponto:** O nome do canal recebe cor primária e ponto final enfático no mesmo tom (`Panorama.` ou `Tech.`), seguido imediatamente pela proposição de valor em texto escuro:
  > **Panorama.** Contexto para entender o que realmente importa.  
  > **Tech.** O futuro, explicado sem o ruído.

### 3.2. Overlines e Supertítulos
- **Especificação:** `text-xs font-bold uppercase tracking-[.2em] text-violet-600`
- **Uso:** Utilizado acima de títulos de seção (*"COMO FUNCIONA"*, *"ARQUIVO EDITORIAL"*, *"ACOMPANHE O TECH"*), frequentemente acompanhado de ícones vetoriais de linha fina (`Sparkles`, `Layers3`, `Compass`, `Cpu`).

### 3.3. Subtítulos de Abertura
- **Especificação:** `text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl`
- **Uso:** Explicação concisa da proposta editorial logo abaixo do título principal.

### 3.4. Badges Numéricas de Metodologia (`01`, `02`, `03`)
- **Especificação:** `grid size-10 place-items-center rounded-xl bg-violet-100 font-mono text-xs font-bold text-violet-700`
- **Uso:** Sequenciamento de pilares e passos editoriais.

---

## 4. Padrões de Componentes e Estrutura Visual

### 4.1. Header Fixo com Glassmorphism
- **Classes:** `sticky top-0 z-50 border-b border-violet-950/8 bg-white/88 backdrop-blur-xl`
- **Navegação:** Pílulas com bordas arredondadas completas (`rounded-full px-3 py-2 text-xs font-medium`), com estado ativo em fundo violeta claro e texto no tom de destaque.
- **Botão CTA:** `rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 transition-all hover:-translate-y-0.5 hover:bg-violet-700`.

### 4.2. Card Flutuante de Demonstração (Hero Preview)
- **Estrutura:** Card branco elevado (`bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-violet-950/8 p-6`).
- **Elementos Internos:** Linhas de tópicos temáticos com pills numerados, barras de sinal/progresso em gradiente e selo de garantia de curadoria ("Menos ruído, mais relações entre os fatos").

### 4.3. Cards de Metodologia e Funcionalidades
- **Estrutura:** `rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5`
- **Efeito:** Transição de elevação no eixo Y acompanhada de expansão sutil de sombra volumétrica.

### 4.4. Banner Escuro de Conversão (High-Contrast CTA)
- **Estrutura:** `relative overflow-hidden rounded-[2rem] bg-[#17112e] px-6 py-12 text-white shadow-2xl shadow-violet-950/15 sm:px-12`
- **Glow Interno:** Esfera decorativa no canto superior direito (`absolute right-0 top-0 size-64 rounded-full bg-violet-500/20 blur-3xl`).
- **Watermark Sutil:** Ícone vetorial em escala ampliada com opacidade mínima (`text-white/[0.03]`).
- **Botão de Ação:** Botão de alto contraste em branco puro com texto violeta escuro (`bg-white text-violet-800 hover:bg-violet-50 rounded-xl px-6 min-h-12`).

### 4.5. Empty State e Preparação Editorial
- **Princípio:** Transmitir seriedade institucional sem sensação de página vazia ou quebrada.
- **Composição:** Ícone centralizado em container circular suave, título de status claro (*"Primeiras edições em preparação"*), texto explicativo do fluxo e aviso de transparência com ícone de caneta (*"Nenhum rascunho ou edição candidata é exibido aqui"*).

---

## 5. Micro-interações e Acessibilidade (WCAG AA)

1. **Micro-interações de Hover:**
   - Botões principais: leve deslocamento vertical negativo (`hover:-translate-y-0.5`) e intensificação da sombra colorida.
   - Cards de conteúdo: deslocamento de -4px (`hover:-translate-y-1`) e borda levemente tonalizada (`hover:border-violet-200`).
2. **Navegação por Teclado e Foco:**
   - Todos os elementos interativos possuem anel de foco explícito de alta visibilidade: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2`.
3. **Contraste de Cores:**
   - Textos sobre `#fbfbfe` mantêm razão de contraste superior a 8:1 (muito acima do piso de 4.5:1 exigido pelo critério WCAG AA).
   - Textos de botão e badges passam em todas as verificações de conformidade.
4. **Reserva de Espaço e Layout Shift (CLS Zero):**
   - Imagens e mídias utilizam dimensões estritas e aspect-ratios definidos.
   - Âncoras como `#edicoes` contam com compensação de cabeçalho via `scroll-mt-24`.

---

## 6. Critérios para Avaliação e Adoção em Outros Casos

Ao considerar a extensão desta identidade visual para outros módulos ou novas páginas no ecossistema Camini:

### ✅ Casos Recomendados para Adoção:
- **Portais Públicos e Apresentações Externas:** Páginas públicas do Radar da Reforma, relatórios executivos para clientes corporativos, documentações institucionais abertas.
- **Páginas de Onboarding e Assinatura:** Telas de captação de leads, cadastro de interesse e landing pages de produtos novos.
- **Interfaces de Leitura Aprofundada:** Artigos analíticos, publicações legislativas comentadas e relatórios de inteligência.

### ⚠️ Casos em que se deve Preservar o Studio Admin Clássico:
- **Dashboards Operacionais e Administrativos:** Telas de gestão de professores/disciplinas (CTC), edição de permissões, formulários densos de parametrização do RM SQL AI.
- **Tabelas de Alta Densidade:** Grids de dados que demandam máxima concentração horizontal e linhas compactas de 32px a 36px.

---

## 7. Referências de Telas Implementadas

| Tela | Rota Local | Arquivo de Componente |
| :--- | :--- | :--- |
| **Página Inicial Panorama** | `/panorama` | [`components/observatorio-public/public-product-page.tsx`](file:///c:/projects/camini/components/observatorio-public/public-product-page.tsx) |
| **Página Inicial Tech** | `/tech` | [`components/observatorio-public/public-product-page.tsx`](file:///c:/projects/camini/components/observatorio-public/public-product-page.tsx) |
| **Cadastro Panorama** | `/panorama/assinar` | [`components/observatorio-public/signup-page.tsx`](file:///c:/projects/camini/components/observatorio-public/signup-page.tsx) |
| **Cadastro Tech** | `/tech/assinar` | [`components/observatorio-public/signup-page.tsx`](file:///c:/projects/camini/components/observatorio-public/signup-page.tsx) |
| **Shell de Leitura da Edição** | `/panorama/edicoes/[id]` | [`components/observatorio/public-edition-shell.tsx`](file:///c:/projects/camini/components/observatorio/public-edition-shell.tsx) |
| **Apresentação na Home** | `/` (Seção Observatório) | [`app/page.tsx`](file:///c:/projects/camini/app/page.tsx) |
