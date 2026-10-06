---
name: nextjs-supabase-patterns
description: Padrões rigorosos de uso do Supabase no Next.js App Router, focando em segurança, tipos, RLS e chamadas de API.
---
# Next.js + Supabase Patterns

Ao trabalhar com Supabase neste projeto Next.js, siga obrigatoriamente estes padrões:

1.  **Row Level Security (RLS)**
    - Nunca crie funcionalidades ou tabelas sem garantir que o RLS está ativado e as políticas (`policies`) foram definidas.
    - O controle de acesso a linhas individuais DEVE ser feito no banco de dados, e o cliente do Supabase deve herdar a sessão do usuário de forma segura.

2.  **Typesafe Supabase Client**
    - Sempre utilize os tipos gerados do banco (`Database`) ao interagir com o cliente do Supabase (ex: `supabase.from('ctc_aulas').select(...)`).
    - Nunca force tipos manuais, deixe a tipagem inferir automaticamente do schema gerado.

3.  **Data Fetching no Servidor**
    - Busque dados (selects) primariamente em Server Components ou Route Handlers usando as instâncias corretas do cliente de servidor (cookies/SSR).
    - Para mutações (inserts, updates, deletes), utilize estritamente Server Actions e faça a validação com Zod antes de enviar para o Supabase.

4.  **Validação de Sessão Confiável**
    - Para segurança no backend (Server Actions/Route Handlers), utilize sempre `supabase.auth.getUser()` (que verifica o token criptograficamente no servidor) e **nunca** `getSession()` (que pode apenas retornar os cookies decodificados localmente).

5.  **Alerta sobre Alterações Estruturais**
    - Sempre que houver uma mudança no esquema do banco (nova tabela, coluna, ou política), lembre imediatamente o time/usuário que é necessário rodar o CLI do Supabase para gerar/atualizar os tipos TypeScript.
