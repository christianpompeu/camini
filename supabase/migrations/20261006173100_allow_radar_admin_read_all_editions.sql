CREATE POLICY "Acesso administrativo ao Radar"
ON public.radar_edicoes
FOR SELECT
TO authenticated
USING (
  has_route_access('/dashboard/radar')
);
