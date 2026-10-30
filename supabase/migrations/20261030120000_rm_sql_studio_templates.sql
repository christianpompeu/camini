-- ============================================================================
-- CAMINI SQL STUDIO — Modelos de Consultas Personalizadas T-SQL (TOTVS RM)
-- ============================================================================
-- Armazena modelos de queries criados pelo usuário no SQL Studio RM.
-- Possui sincronização híbrida (Local Storage / Cookies quando anônimo,
-- e persistência em nuvem vinculada ao usuário autenticado com RLS estrito).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rm_sql_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'personalizado',
  modulo_label TEXT NOT NULL DEFAULT 'Geral RM',
  tabelas_principais TEXT[] NOT NULL DEFAULT '{}',
  sql TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_rm_sql_templates_user ON public.rm_sql_templates(user_id, atualizado_em DESC);
CREATE INDEX IF NOT EXISTS idx_rm_sql_templates_categoria ON public.rm_sql_templates(categoria);

-- Trigger de atualização automática do timestamp 'atualizado_em'
CREATE OR REPLACE FUNCTION public.handle_rm_sql_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rm_sql_templates_updated_at ON public.rm_sql_templates;
CREATE TRIGGER trg_rm_sql_templates_updated_at
  BEFORE UPDATE ON public.rm_sql_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_rm_sql_templates_updated_at();

-- Ativação de Row Level Security (RLS)
ALTER TABLE public.rm_sql_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso: o usuário gerencia exclusivamente os seus próprios modelos
DROP POLICY IF EXISTS "Usuários gerenciam seus próprios modelos RM" ON public.rm_sql_templates;
CREATE POLICY "Usuários gerenciam seus próprios modelos RM"
  ON public.rm_sql_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.rm_sql_templates IS 'Modelos de consultas T-SQL personalizadas salvas pelos usuários no SQL Studio RM.';
