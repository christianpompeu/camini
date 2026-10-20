select public.observatorio_ingest_lote($json$
{
  "round": {"run_key":"replay-b12-synthetic","canal":"tech","origem":"github-replay","status":"concluida"},
  "sources": [{
    "nome":"Replay Synthetic Source",
    "dominio":"replay.example",
    "tipo":"institucional",
    "articles": [{
      "url_canonica":"https://replay.example/item",
      "titulo":"Replay synthetic item",
      "resumo":"Synthetic replay fixture",
      "status_verificacao":"pendente",
      "events": [{
        "chave":"replay-synthetic-event",
        "titulo":"Replay synthetic event",
        "descricao":"Synthetic event for migration replay",
        "categoria":"tecnologia",
        "status_verificacao":"pendente",
        "status_sanitizacao":"bruto"
      }]
    }]
  }],
  "relations": []
}$json$::jsonb);
