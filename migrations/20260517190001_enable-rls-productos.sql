-- Habilitar RLS en tabla productos
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos FORCE ROW LEVEL SECURITY;

-- Lectura pública: cualquier usuario (incluyendo anon) puede leer productos
CREATE POLICY "productos_select_public"
  ON public.productos
  FOR SELECT
  USING (true);

-- Escritura restringida al service role (backend con api_key)
-- anon y authenticated NO pueden insertar, modificar ni eliminar directamente
CREATE POLICY "productos_insert_service"
  ON public.productos
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "productos_update_service"
  ON public.productos
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "productos_delete_service"
  ON public.productos
  FOR DELETE
  USING (auth.role() = 'service_role');
