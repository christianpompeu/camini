-- Tabelas de auditoria e decisões são append-only, inclusive contra TRUNCATE.
revoke truncate on table public.observatorio_decisoes_historico,
  public.observatorio_aprovacoes_editoriais
  from public, anon, authenticated, service_role;
