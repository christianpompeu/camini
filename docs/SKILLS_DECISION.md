# Architectural Decision: Progressive Disclosure via Workspace Skills

## Contexto
Durante o desenvolvimento do projeto, os agentes de IA precisavam de regras de conduta consistentes e de um direcionamento rigoroso para garantir a manutenibilidade, a qualidade do design (WOW factor) e aderência cega aos padrões (ex: Next.js App Router, Zod validations, Tailwind).

Colocar todas as regras no nível do repositório (`AGENTS.md` raiz ou num System Prompt global) cria um prompt inflado. Isso dilui o foco, satura a janela de contexto, aumenta custos e muitas vezes faz a IA "esquecer" ou pesar mal as restrições específicas para a tarefa daquele exato momento.

## Decisão
Implementamos um padrão de **Workspace Skills** localizado em `.agents/skills/`. Essa abordagem segue o princípio de **Progressive Disclosure**:

Em vez de empurrar o "Manual Inteiro" pro cérebro da IA sempre, fatiamos o conhecimento em habilidades ("Skills") modulares. 

1. `nextjs-react-expert`
2. `api-patterns`
3. `systematic-debugging`
4. `verify-changes`
5. `frontend-design`
6. `tailwind-specialist`

## Benefícios (O porquê)
- **Foco do Agente**: Quando for trabalhar no design de um botão, o agente vai ler a skill de design e de tailwind. Ele não precisa saber do fluxo de Server Actions naquele instante.
- **Isolamento de Alterações**: É muito mais fácil iterar nas regras de Frontend Design ou depuração de erros sem esbarrar e modificar sem querer as regras globais do banco de dados.
- **Context Window Enxuto**: Melhora a retenção e obediência da IA às ordens dadas. Menos tokens desnecessários em jogo = Respostas mais afiadas, cirúrgicas e eficientes.

## Regras de Crescimento
Sempre que o projeto adotar um novo padrão central ou uma nova tecnologia que cause "alucinações" frequentes na IA, **crie uma nova skill** em vez de embutir no `AGENTS.md` global.
