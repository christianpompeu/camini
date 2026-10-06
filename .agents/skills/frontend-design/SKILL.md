---
name: frontend-design
description: Padrões de design premium, interfaces modernas e foco no WOW factor.
---
# Frontend Design & UI Excellence

Nós construímos interfaces que precisam surpreender os usuários ("WOW factor").

1.  **Estética Premium**: Abandone designs genéricos de IA (cinzas chatos, layouts excessivamente utilitários). Use paletas coesas (cores brand, slate/zinc para neutros), contraste legível, e hierarquia tipográfica clara.
2.  **Micro-interações Ativas**: Cada elemento interativo (botões, cards, links) DEVE ter estados de hover visíveis (`hover:bg-muted`, `hover:scale-[1.02]`) e transições suaves (`transition-all duration-200`). Elementos não podem parecer mortos na tela.
3.  **Uso Sensato de Espaço (White space)**: Não esprema componentes. Use `gap`, `p` e `m` generosamente para criar respiro visual e focar a atenção do usuário no que importa.
4.  **Glassmorphism & Depth**: Onde aplicável (modais, popovers, headers fixos), use sutis efeitos de blur (`backdrop-blur-md`, `bg-background/80`) e sombras apropriadas (`shadow-sm` ou `shadow-md`) para criar profundidade espacial.
5.  **Feedback Visual Imediato**: Ações destrutivas, carregamentos ou sucessos devem prover feedback instantâneo (spinners em botões, toasts, cores de perigo/sucesso).
6.  **Consistência de Componentes**: Utilize sempre as abstrações da biblioteca de componentes (ex: shadcn/ui) ao invés de reinventar botões ou inputs crus no HTML.
