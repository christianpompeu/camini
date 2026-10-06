-- Migration: Admin Roles, Subscribers e Radar Ações
-- Description: Criação da estrutura segura de RBAC e tabelas do módulo Radar.

-- 1. Tabela de Permissões de Usuário (RBAC)
-- Optamos por email para facilitar a gestão pelo painel antes mesmo do usuário fazer o primeiro login.
CREATE TABLE IF NOT EXISTS public.app_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    is_super_admin boolean DEFAULT false,
    allowed_routes text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em app_permissions
ALTER TABLE public.app_permissions ENABLE ROW LEVEL SECURITY;

-- Super admins podem gerenciar app_permissions
CREATE POLICY "Super admins gerenciam permissoes" ON public.app_permissions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_permissions ap 
            WHERE ap.email = (auth.jwt() ->> 'email') 
            AND ap.is_super_admin = true
        )
    );

-- Usuários podem ler suas próprias permissões
CREATE POLICY "Usuarios leem proprias permissoes" ON public.app_permissions
    FOR SELECT TO authenticated
    USING (email = (auth.jwt() ->> 'email'));

-- 2. Tabela de Assinantes do Radar
CREATE TABLE IF NOT EXISTS public.radar_assinantes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    email text UNIQUE NOT NULL,
    telefone text,
    status text DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado')),
    origem text DEFAULT 'manual' CHECK (origem IN ('app_forca', 'site', 'manual')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.radar_assinantes ENABLE ROW LEVEL SECURITY;

-- Somente admins ou quem tem permissão de rota /dashboard/radar/assinantes
CREATE POLICY "Acesso a assinantes para autorizados" ON public.radar_assinantes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_permissions ap 
            WHERE ap.email = (auth.jwt() ->> 'email') 
            AND (ap.is_super_admin = true OR '/dashboard/radar/assinantes' = ANY(ap.allowed_routes))
        )
    );

-- 3. Tabela de Ações Administrativas (Fila para o Work/Notion)
CREATE TABLE IF NOT EXISTS public.radar_admin_acoes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    edicao_id text NOT NULL, -- ID ou slug da edição
    acao text NOT NULL CHECK (acao IN ('aprovar', 'rejeitar', 'arquivar')),
    status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'processado', 'erro')),
    motivo text,
    realizado_por text NOT NULL, -- email do admin
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at timestamp with time zone
);

ALTER TABLE public.radar_admin_acoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso a acoes para autorizados" ON public.radar_admin_acoes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.app_permissions ap 
            WHERE ap.email = (auth.jwt() ->> 'email') 
            AND (ap.is_super_admin = true OR '/dashboard/radar' = ANY(ap.allowed_routes))
        )
    );

-- Insert do admin inicial (Substitua o email pelo seu em producao, ou insira manualmente no painel do Supabase)
-- INSERT INTO public.app_permissions (email, is_super_admin) VALUES ('seu_email@dominio.com', true);
