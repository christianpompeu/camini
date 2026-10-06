-- Cria tabela de rotas publicas
CREATE TABLE IF NOT EXISTS public.public_routes (
    route_path text PRIMARY KEY,
    is_public boolean DEFAULT false NOT NULL
);

-- Concede permissoes basicas
GRANT ALL ON TABLE public.public_routes TO anon, authenticated, service_role;

-- Atualiza funcao de checagem de acesso para considerar rotas publicas
CREATE OR REPLACE FUNCTION public.has_route_access(check_route text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email text;
  v_is_super_admin boolean;
  v_is_public boolean;
BEGIN
  -- Verificar se a rota é publica
  SELECT is_public INTO v_is_public
  FROM public.public_routes
  WHERE route_path = check_route;

  IF v_is_public THEN
    RETURN true;
  END IF;

  -- Obter email do usuario autenticado
  v_user_email := auth.jwt() ->> 'email';
  IF v_user_email IS NULL THEN
    RETURN false;
  END IF;

  -- Verificar super admin
  SELECT is_super_admin INTO v_is_super_admin
  FROM public.app_permissions
  WHERE email = v_user_email;
  
  IF v_is_super_admin THEN
    RETURN true;
  END IF;

  -- Verificar permissão especifica
  IF EXISTS (
    SELECT 1
    FROM public.app_permissions
    WHERE email = v_user_email 
      AND allowed_routes @> to_jsonb(check_route)
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
