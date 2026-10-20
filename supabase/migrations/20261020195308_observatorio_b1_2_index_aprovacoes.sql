-- Correcao aditiva para ambientes onde B1.2 ja foi aplicada.
create index if not exists obs_aprovacoes_relacao_idx
  on public.observatorio_aprovacoes_editoriais (relacao_id, decidido_em desc);
