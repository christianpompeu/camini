# Agent Directives & Customizations

Bem-vindo ao projeto! Aqui utilizamos uma arquitetura de **Workspace Skills** para especializar os agentes de inteligência artificial de forma direcionada ("Progressive Disclosure").

## Contexto Principal
Este projeto é focado em [App Router Next.js + Tailwind + Supabase]. 

## Skills Locais
As skills especializadas desta stack estão configuradas em `.agents/skills/`. Os agentes são instruídos a ler estas documentações ativamente ao invés de tentarem adivinhar o padrão a ser seguido:

- `nextjs-react-expert`: Padrões do App Router e Server Components.
- `api-patterns`: Como estruturar e validar as APIs.
- `systematic-debugging`: Fluxo exato para debugar no projeto.
- `verify-changes`: A necessidade constante de provas de funcionamento.
- `frontend-design`: Expectativas elevadas para UX e design.
- `tailwind-specialist`: Melhores práticas de estilização em Tailwind CSS.

> [!IMPORTANT]
> Ao longo de suas interações neste workspace, siga as instruções das skills descritas acima de acordo com o contexto em que está operando.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
