---
name: verify-changes
description: Protocolo obrigatório de verificação funcional do código antes da entrega.
---
# Protocolo de Verificação de Mudanças

Você não pode entregar código presumindo que ele funciona ("Trust, but verify").

1.  **Revisão do Escopo**: Antes de dizer "terminei", leia o prompt original do usuário. Todas as restrições e requisitos foram atendidos?
2.  **Teste de Execução Local**: O código compila sem erros? Use ferramentas como `run_command` com `npm run type-check` ou `npm run lint` se julgar necessário.
3.  **Ausência de Regressões**: A mudança quebrou o layout ou o funcionamento existente das outras partes da tela? O componente ainda renderiza em cenários de erro e loading?
4.  **Comprovando o Sucesso**: Se for uma mudança visual, e o usuário pedir, use um browser subagent para tirar screenshot e provar a alteração. Se for no backend de dados, rode um script ou `curl` validando a resposta do banco/API.
5.  **Zero Placeholders**: O código deve estar "production-ready". Não deixe comentários de "faça a lógica aqui" a menos que expressamente solicitado.
