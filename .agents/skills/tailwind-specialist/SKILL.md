---
name: tailwind-specialist
description: Melhores práticas para Tailwind CSS v4, arquitetura CSS-first, organização de classes e manutenção.
---
# Tailwind CSS Specialist Guidelines

Seu código CSS gerado via Tailwind deve ser profissional, limpo e sustentável. O projeto utiliza **Tailwind v4**, portanto as regras de arquitetura são fundamentais.

## 1. Arquitetura Tailwind v4 (CSS-first)
1. **Fim do `tailwind.config.js`**: Não crie nem modifique o arquivo `tailwind.config.js`. O Tailwind v4 utiliza configuração nativa via CSS usando a diretiva `@theme` no arquivo principal de estilos (ex: `app/globals.css`).
2. **Variáveis Nativas**: Todas as variáveis de tema são expostas como propriedades customizadas de CSS nativas (ex: `--color-primary`, `--spacing-md`).
3. **Container Queries Nativas**: Onde apropriado, use `@container` no elemento pai e responda ao tamanho dele usando modificadores como `@sm:`, `@md:`, `@lg:` nos filhos. Isso é excelente para componentes reutilizáveis que não devem depender da largura total da tela (viewport).

## 2. Padrões de React e Componentização
1. **Tailwind-Merge é Obrigatório**: Ao construir componentes reutilizáveis, SEMPRE aceite uma prop `className` e combine-a com as classes padrão usando uma função utilitária como `cn(defaultClasses, className)` (clsx + tailwind-merge). Não concatene strings de forma ingênua para evitar conflitos de estilo.
2. **Agrupamento Lógico**: Aplique as classes seguindo uma ordem semântica (Layout -> Espaçamento -> Tipografia -> Cores -> Efeitos). Isso facilita a manutenção visual.
3. **Evite Poluição Extrema**: Se um elemento repetido excede mais de 20 classes utilitárias, considere extrair para um sub-componente.

## 3. Design Tokens e Responsividade
1. **Design Tokens Semânticos**: Utilize sempre as variáveis de cor e tema semânticas do projeto (ex: `text-muted-foreground`, `bg-primary`, `ring-ring`) em vez de cores estáticas (ex: `text-gray-500`), para manter suporte robusto a Dark Mode e temas dinâmicos.
2. **Mobile-first**: Desenhe primeiro a interface para celular (sem prefixos) e expanda a tela com os modificadores responsivos: `w-full md:w-1/2 lg:w-1/3`.
