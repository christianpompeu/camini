---
name: api-patterns
description: Padronização de APIs REST, validação rigorosa e tratamento de erros.
---
# API Patterns & Data Validation

Ao desenvolver rotas de API (Route Handlers no Next.js) ou Server Actions consumidas por clientes, siga estes padrões:

1.  **Zod para TUDO**: Todo input de usuário, payload de requisição ou query parameter DEVE ser validado usando schemas do Zod antes de qualquer lógica de negócio ser executada. Sem exceções.
2.  **Tratamento de Erros Padronizado**: Não exponha erros crus do banco de dados (ex: erros Postgres) para o cliente. Capture exceções e retorne respostas padronizadas.
    -   Exemplo de formato de erro: `{ error: string, details?: any, status: number }`
3.  **Códigos HTTP Semânticos**: (Em Route Handlers) Use `400` para erros de validação Zod, `401` para não autenticado, `403` para sem permissão, `404` para não encontrado, e `500` para erros de servidor genéricos.
4.  **Paginação e Filtros**: APIs de listagem devem aceitar e processar corretamente parâmetros de `page`, `limit`, ou cursores.
5.  **Segurança (RLS e Server Checks)**: Nunca confie que o cliente tem permissão. Verifique a sessão do usuário no servidor (`supabase.auth.getUser()`) e garanta que as queries respeitem as permissões (RLS ativado ou verificações manuais no código).
