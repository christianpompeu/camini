-- Marco C3: proposta local para apply HML controlado.
-- NAO APLICAR sem aprovacao explicita posterior ao dry-run do Gate 1.

drop trigger if exists observatorio_edicoes_decisao_audit
  on public.observatorio_edicoes;
create trigger observatorio_edicoes_decisao_audit
after insert or update on public.observatorio_edicoes
for each row execute function public.observatorio_registrar_decisao();

create or replace function public.observatorio_sync_edicoes(
  p_run_key text,
  p_edicoes jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_item jsonb;
  v_snapshot jsonb;
  v_operation text;
  v_identifier text;
  v_notion_page_id text;
  v_existing_id uuid;
  v_expected_version integer;
  v_expected_hash text;
  v_current public.observatorio_edicoes%rowtype;
  v_result_id uuid;
  v_inserted integer := 0;
  v_updated integer := 0;
begin
  if nullif(pg_catalog.btrim(p_run_key), '') is null then
    raise exception using errcode = '22023', message = 'run_key obrigatorio';
  end if;
  if pg_catalog.jsonb_typeof(p_edicoes) is distinct from 'array'
     or pg_catalog.jsonb_array_length(p_edicoes) <> 1 then
    raise exception using errcode = '22023', message = 'apply C3 exige exatamente uma edicao';
  end if;

  perform pg_catalog.set_config('observatorio.run_key', p_run_key, true);

  for v_item in select value from pg_catalog.jsonb_array_elements(p_edicoes) item(value)
  loop
    v_operation := v_item->>'operation';
    v_snapshot := v_item->'snapshot';
    v_identifier := v_snapshot#>>'{edition,identificador}';
    v_notion_page_id := v_snapshot#>>'{source,notionPageId}';
    v_expected_version := nullif(v_item->>'expected_version', '')::integer;
    v_expected_hash := v_item->>'expected_previous_hash';

    if v_operation is null or v_operation not in ('insert', 'update')
       or pg_catalog.jsonb_typeof(v_snapshot) is distinct from 'object'
       or pg_catalog.jsonb_typeof(v_snapshot->'schemaVersion') is distinct from 'number'
       or (v_snapshot->>'schemaVersion')::integer is distinct from 1
       or pg_catalog.jsonb_typeof(v_snapshot->'source') is distinct from 'object'
       or v_snapshot#>>'{source,type}' is distinct from 'notion'
       or nullif(pg_catalog.btrim(v_snapshot#>>'{source,notionPageId}'), '') is null
       or nullif(pg_catalog.btrim(v_snapshot#>>'{source,notionUrl}'), '') is null
       or pg_catalog.jsonb_typeof(v_snapshot->'edition') is distinct from 'object'
       or nullif(pg_catalog.btrim(v_identifier), '') is null
       or nullif(pg_catalog.btrim(v_snapshot#>>'{edition,canal}'), '') is null
       or nullif(pg_catalog.btrim(v_snapshot#>>'{edition,titulo}'), '') is null
       or nullif(pg_catalog.btrim(v_snapshot#>>'{edition,resumo}'), '') is null
       or pg_catalog.lower(pg_catalog.btrim(v_snapshot#>>'{edition,statusOriginal}')) is distinct from 'candidata'
       or pg_catalog.jsonb_typeof(v_snapshot->'content') is distinct from 'object'
       or pg_catalog.jsonb_typeof(v_snapshot#>'{content,complete}') is distinct from 'boolean'
       or (v_snapshot#>>'{content,complete}')::boolean is distinct from true
       or pg_catalog.jsonb_typeof(v_snapshot#>'{content,blocks}') is distinct from 'array'
       or pg_catalog.jsonb_typeof(v_snapshot->'contentHash') is distinct from 'string'
       or nullif(pg_catalog.btrim(v_snapshot->>'contentHash'), '') is null
       or nullif(pg_catalog.btrim(v_notion_page_id), '') is null then
      raise exception using errcode = '22023', message = 'contrato de snapshot C3 invalido';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_identifier, 0)
    );

    if v_operation = 'insert' then
      if v_item->>'existing_id' is not null
         or exists (
           select 1 from public.observatorio_edicoes
           where identificador = v_identifier or notion_page_id = v_notion_page_id
         ) then
        raise exception using errcode = '23505', message = 'identidade editorial ja existe';
      end if;

      insert into public.observatorio_edicoes (
        identificador, canal, titulo, resumo, status,
        notion_page_id, notion_url, snapshot, versao,
        aprovada_em, publicada_em
      ) values (
        v_identifier,
        v_snapshot#>>'{edition,canal}',
        v_snapshot#>>'{edition,titulo}',
        v_snapshot#>>'{edition,resumo}',
        'candidata',
        v_notion_page_id,
        v_snapshot#>>'{source,notionUrl}',
        v_snapshot,
        1,
        null,
        null
      ) returning id into v_result_id;
      v_inserted := v_inserted + 1;
    else
      v_existing_id := nullif(v_item->>'existing_id', '')::uuid;
      if v_existing_id is null or v_expected_version is null then
        raise exception using errcode = '22023', message = 'precondicoes de update ausentes';
      end if;

      select * into v_current
      from public.observatorio_edicoes
      where id = v_existing_id
      for update;
      if not found then
        raise exception using errcode = 'P0002', message = 'edicao HML nao encontrada';
      end if;
      if v_current.identificador <> v_identifier
         or v_current.notion_page_id is distinct from v_notion_page_id then
        raise exception using errcode = '23505', message = 'conflito de identidade editorial';
      end if;
      if v_current.status <> 'candidata'
         or v_current.aprovada_em is not null
         or v_current.publicada_em is not null then
        raise exception using errcode = '42501', message = 'estado editorial HML protegido';
      end if;
      if v_current.versao <> v_expected_version
         or (v_current.snapshot->>'contentHash') is distinct from v_expected_hash then
        raise exception using errcode = '40001', message = 'edicao alterada desde o dry-run';
      end if;
      if nullif(v_current.snapshot#>>'{source,lastEditedTime}', '') is not null
         and nullif(v_snapshot#>>'{source,lastEditedTime}', '') is not null
         and (v_snapshot#>>'{source,lastEditedTime}')::timestamptz
             < (v_current.snapshot#>>'{source,lastEditedTime}')::timestamptz then
        raise exception using errcode = '40001', message = 'snapshot Notion obsoleto';
      end if;
      if v_current.snapshot->>'contentHash' = v_snapshot->>'contentHash' then
        raise exception using errcode = '22023', message = 'update sem alteracao material';
      end if;

      update public.observatorio_edicoes
      set canal = v_snapshot#>>'{edition,canal}',
          titulo = v_snapshot#>>'{edition,titulo}',
          resumo = v_snapshot#>>'{edition,resumo}',
          notion_url = v_snapshot#>>'{source,notionUrl}',
          snapshot = v_snapshot,
          versao = v_current.versao + 1
      where id = v_existing_id
      returning id into v_result_id;
      v_updated := v_updated + 1;
    end if;
  end loop;

  return pg_catalog.jsonb_build_object(
    'run_key', p_run_key,
    'inserted', v_inserted,
    'updated', v_updated,
    'edition_id', v_result_id
  );
end;
$$;

revoke all on function public.observatorio_sync_edicoes(text, jsonb)
  from public, anon, authenticated;
grant execute on function public.observatorio_sync_edicoes(text, jsonb)
  to service_role;
