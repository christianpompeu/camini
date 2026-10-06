-- Corrige a recursão infinita na tabela app_permissions criando uma function com SECURITY DEFINER
-- SECURITY DEFINER faz a função rodar com permissões de bypass do RLS (superuser), evitando o loop.

-- 1. Remove as policies que causaram loop
DROP POLICY IF EXISTS "Super admins gerenciam permissoes" ON public.app_permissions;
DROP POLICY IF EXISTS "Acesso a assinantes para autorizados" ON public.radar_assinantes;
DROP POLICY IF EXISTS "Acesso a acoes para autorizados" ON public.radar_admin_acoes;

-- 2. Cria funções seguras para checagem de regras (Bypass RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_permissions
    WHERE email = (auth.jwt() ->> 'email')
    AND is_super_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_route_access(check_route text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_permissions
    WHERE email = (auth.jwt() ->> 'email')
    AND (is_super_admin = true OR check_route = ANY(allowed_routes))
  );
$$;

-- 3. Recria as Policies utilizando as funções
CREATE POLICY "Super admins gerenciam permissoes" ON public.app_permissions
    FOR ALL TO authenticated
    USING ( public.is_super_admin() );

CREATE POLICY "Acesso a assinantes para autorizados" ON public.radar_assinantes
    FOR ALL TO authenticated
    USING ( public.has_route_access('/dashboard/radar') );

CREATE POLICY "Acesso a acoes para autorizados" ON public.radar_admin_acoes
    FOR ALL TO authenticated
    USING ( public.has_route_access('/dashboard/radar') );
