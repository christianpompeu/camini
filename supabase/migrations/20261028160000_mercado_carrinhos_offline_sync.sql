-- ============================================================================
-- CAMINI MERCADO — Carrinho Inteligente & Registro de Compras Offline-First
-- ============================================================================
-- Tabelas para persistência e sincronização de carrinhos de compras,
-- itens registrados no supermercado e cupons fiscais.
-- Todas as operações possuem Row Level Security (RLS) estrito vinculado a auth.uid().
-- ============================================================================

-- 1. TABELA DE CARRINHOS DE MERCADO
CREATE TABLE IF NOT EXISTS public.mercado_carrinhos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'finalizado', 'cancelado')),
  total_estimado NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_final NUMERIC(10, 2),
  foto_cupom_url TEXT,
  foto_cupom_base64 TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalizado_em TIMESTAMPTZ
);

-- 2. TABELA DE ITENS DO CARRINHO
CREATE TABLE IF NOT EXISTS public.mercado_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrinho_id UUID NOT NULL REFERENCES public.mercado_carrinhos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade NUMERIC(10, 3) NOT NULL DEFAULT 1.000,
  preco_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  preco_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  foto_produto_url TEXT,
  foto_produto_base64 TEXT,
  ordem INT NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_mercado_carrinhos_user ON public.mercado_carrinhos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_mercado_carrinhos_criado_em ON public.mercado_carrinhos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_mercado_itens_carrinho ON public.mercado_itens(carrinho_id, ordem);
CREATE INDEX IF NOT EXISTS idx_mercado_itens_user ON public.mercado_itens(user_id);

-- 4. TRIGGER PARA ATUALIZAR 'atualizado_em'
CREATE OR REPLACE FUNCTION public.handle_mercado_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mercado_carrinhos_updated_at ON public.mercado_carrinhos;
CREATE TRIGGER trg_mercado_carrinhos_updated_at
  BEFORE UPDATE ON public.mercado_carrinhos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_mercado_updated_at();

DROP TRIGGER IF EXISTS trg_mercado_itens_updated_at ON public.mercado_itens;
CREATE TRIGGER trg_mercado_itens_updated_at
  BEFORE UPDATE ON public.mercado_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_mercado_updated_at();

-- 5. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.mercado_carrinhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercado_itens ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS PARA 'mercado_carrinhos'
DROP POLICY IF EXISTS "Usuários gerenciam seus próprios carrinhos" ON public.mercado_carrinhos;
CREATE POLICY "Usuários gerenciam seus próprios carrinhos"
  ON public.mercado_carrinhos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. POLÍTICAS RLS PARA 'mercado_itens'
DROP POLICY IF EXISTS "Usuários gerenciam seus próprios itens de carrinho" ON public.mercado_itens;
CREATE POLICY "Usuários gerenciam seus próprios itens de carrinho"
  ON public.mercado_itens
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. COMENTÁRIOS EXPLICATIVOS NO BANCO
COMMENT ON TABLE public.mercado_carrinhos IS 'Carrinhos de supermercado registrados localmente e sincronizados com a nuvem.';
COMMENT ON TABLE public.mercado_itens IS 'Itens individuais registrados no carrinho de compras com foto, quantidade e valor.';
