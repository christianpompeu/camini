do $$ declare t text; begin
  foreach t in array array['observatorio_rodadas','observatorio_fontes','observatorio_materias','observatorio_eventos','observatorio_eventos_materias','observatorio_relacoes','observatorio_relacoes_evidencias'] loop
    execute format('drop policy if exists observatorio_ingest_owner_policy on public.%I', t);
    execute format('create policy observatorio_ingest_owner_policy on public.%I for all to observatorio_ingest_owner using (true) with check (true)', t);
  end loop;
end $$;
