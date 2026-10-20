-- Baseline reconciliado com o schema remoto do projeto Camini.
--
-- A versao e o nome deste arquivo correspondem a migration ja registrada no
-- Supabase remoto. Portanto, este SQL existe para tornar ambientes novos
-- reproduziveis; ele NAO deve ser reaplicado manualmente ao projeto remoto.

create table public.observatorio_rodadas (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  canal text not null check (canal in ('panorama', 'tech')),
  origem text not null default 'chatgpt',
  status text not null default 'executando'
    check (status in ('executando', 'concluida', 'parcial', 'falhou')),
  janela_inicio timestamptz,
  janela_fim timestamptz,
  iniciado_em timestamptz not null default now(),
  concluido_em timestamptz,
  resumo text,
  diagnostico jsonb not null default '{}'::jsonb
);

create table public.observatorio_fontes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  dominio text not null unique,
  tipo text not null default 'jornalismo'
    check (tipo in ('jornalismo', 'oficial', 'academico', 'institucional', 'outro')),
  notas text,
  criado_em timestamptz not null default now()
);

create table public.observatorio_materias (
  id uuid primary key default gen_random_uuid(),
  fonte_id uuid not null references public.observatorio_fontes (id),
  rodada_id uuid references public.observatorio_rodadas (id),
  url_canonica text not null unique,
  titulo text not null,
  resumo text not null,
  idioma text not null default 'pt',
  formato text not null default 'noticia'
    check (formato in ('noticia', 'paper', 'documento', 'analise', 'outro')),
  status_verificacao text not null default 'pendente'
    check (status_verificacao in ('pendente', 'checado', 'contestado', 'descartado')),
  revisao_por_pares boolean,
  publicado_em timestamptz,
  coletado_em timestamptz not null default now(),
  metadados jsonb not null default '{}'::jsonb
);

create table public.observatorio_eventos (
  id uuid primary key default gen_random_uuid(),
  chave text not null unique,
  titulo text not null,
  descricao text not null,
  categoria text not null
    check (categoria in ('politica', 'economia', 'geopolitica', 'tecnologia', 'ciencia', 'sociedade', 'outros')),
  data_evento timestamptz,
  data_evento_precisao text not null default 'estimada'
    check (data_evento_precisao in ('exata', 'dia', 'estimada', 'desconhecida')),
  status_verificacao text not null default 'pendente'
    check (status_verificacao in ('pendente', 'verificado', 'contestado')),
  status_sanitizacao text not null default 'bruto'
    check (status_sanitizacao in ('bruto', 'normalizado', 'revisado', 'fundido', 'descartado')),
  evento_canonico_id uuid references public.observatorio_eventos (id),
  notion_page_id text,
  visto_primeiro_em timestamptz not null default now(),
  visto_ultimo_em timestamptz not null default now(),
  dados jsonb not null default '{}'::jsonb,
  constraint obs_evento_nao_auto_fusao
    check (evento_canonico_id is null or evento_canonico_id <> id)
);

create table public.observatorio_eventos_materias (
  evento_id uuid not null references public.observatorio_eventos (id) on delete cascade,
  materia_id uuid not null references public.observatorio_materias (id) on delete cascade,
  papel text not null default 'cobertura'
    check (papel in ('cobertura', 'fonte_primaria', 'contraponto', 'retificacao')),
  criado_em timestamptz not null default now(),
  primary key (evento_id, materia_id)
);

create table public.observatorio_relacoes (
  id uuid primary key default gen_random_uuid(),
  origem_id uuid not null references public.observatorio_eventos (id),
  destino_id uuid not null references public.observatorio_eventos (id),
  tipo text not null
    check (tipo in ('relacionado', 'precede', 'correlacionado', 'influencia_alegada', 'causal_comprovada', 'contradiz')),
  evidencia_status text not null default 'hipotese'
    check (evidencia_status in ('confirmado', 'correlacionado', 'hipotese', 'contestado')),
  justificativa text not null,
  confianca numeric check (confianca >= 0 and confianca <= 1),
  revisao text not null default 'pendente'
    check (revisao in ('pendente', 'revisado', 'rejeitado')),
  notion_page_id text,
  criado_em timestamptz not null default now(),
  revisado_em timestamptz,
  constraint obs_relacao_nao_self check (origem_id <> destino_id),
  unique (origem_id, destino_id, tipo)
);

create table public.observatorio_relacoes_evidencias (
  relacao_id uuid not null references public.observatorio_relacoes (id) on delete cascade,
  materia_id uuid not null references public.observatorio_materias (id),
  papel text not null default 'apoia'
    check (papel in ('apoia', 'contradiz', 'contextualiza')),
  justificativa text,
  primary key (relacao_id, materia_id, papel)
);

create table public.observatorio_tendencias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  descricao text not null,
  estado text not null default 'monitorando'
    check (estado in ('monitorando', 'emergente', 'crescente', 'estavel', 'declinante', 'encerrada')),
  metodo text not null,
  janela_inicio date,
  janela_fim date,
  score numeric,
  base_amostral integer not null default 0,
  notion_page_id text,
  atualizado_em timestamptz not null default now(),
  metadados jsonb not null default '{}'::jsonb
);

create table public.observatorio_tendencias_eventos (
  tendencia_id uuid not null references public.observatorio_tendencias (id) on delete cascade,
  evento_id uuid not null references public.observatorio_eventos (id) on delete cascade,
  ligado_em timestamptz not null default now(),
  primary key (tendencia_id, evento_id)
);

create table public.observatorio_edicoes (
  id uuid primary key default gen_random_uuid(),
  identificador text not null unique,
  canal text not null check (canal in ('panorama', 'tech')),
  rodada_id uuid references public.observatorio_rodadas (id),
  titulo text not null,
  resumo text not null,
  status text not null default 'candidata'
    check (status in ('candidata', 'aprovada', 'publicada', 'rejeitada', 'arquivada')),
  notion_page_id text unique,
  notion_url text,
  snapshot jsonb,
  versao integer not null default 1 check (versao > 0),
  criada_em timestamptz not null default now(),
  aprovada_em timestamptz,
  publicada_em timestamptz,
  constraint obs_publicacao_aprovada
    check (status <> 'publicada' or (aprovada_em is not null and publicada_em is not null))
);

create index obs_mat_rodada_idx
  on public.observatorio_materias (rodada_id);
create index obs_mat_publicado_idx
  on public.observatorio_materias (publicado_em desc);
create index obs_evento_data_idx
  on public.observatorio_eventos (data_evento desc);
create index obs_evento_categoria_idx
  on public.observatorio_eventos (categoria);
create index obs_rel_origem_idx
  on public.observatorio_relacoes (origem_id);
create index obs_rel_destino_idx
  on public.observatorio_relacoes (destino_id);
create index obs_edicao_canal_status_idx
  on public.observatorio_edicoes (canal, status);

comment on table public.observatorio_eventos is
  'Nos historicos do grafo: manter historico bruto e sanitizar incrementalmente.';
comment on table public.observatorio_relacoes is
  'Arestas do grafo com estado de evidencias e revisao; hipotese nao e causalidade.';
comment on table public.observatorio_edicoes is
  'Snapshots operacionais; Notion e CMS editorial canonico. Publicacao so apos aprovacao.';

alter table public.observatorio_rodadas enable row level security;
alter table public.observatorio_fontes enable row level security;
alter table public.observatorio_materias enable row level security;
alter table public.observatorio_eventos enable row level security;
alter table public.observatorio_eventos_materias enable row level security;
alter table public.observatorio_relacoes enable row level security;
alter table public.observatorio_relacoes_evidencias enable row level security;
alter table public.observatorio_tendencias enable row level security;
alter table public.observatorio_tendencias_eventos enable row level security;
alter table public.observatorio_edicoes enable row level security;

-- O corpus de apuracao permanece privado neste marco. Nao ha policies para
-- anon/authenticated; somente o backend administrativo recebe privilegios.
revoke all on table
  public.observatorio_rodadas,
  public.observatorio_fontes,
  public.observatorio_materias,
  public.observatorio_eventos,
  public.observatorio_eventos_materias,
  public.observatorio_relacoes,
  public.observatorio_relacoes_evidencias,
  public.observatorio_tendencias,
  public.observatorio_tendencias_eventos,
  public.observatorio_edicoes
from anon, authenticated;

grant all on table
  public.observatorio_rodadas,
  public.observatorio_fontes,
  public.observatorio_materias,
  public.observatorio_eventos,
  public.observatorio_eventos_materias,
  public.observatorio_relacoes,
  public.observatorio_relacoes_evidencias,
  public.observatorio_tendencias,
  public.observatorio_tendencias_eventos,
  public.observatorio_edicoes
to service_role;
