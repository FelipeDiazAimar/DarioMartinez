-- =====================================================================
-- Cierre de permisos de la clave pública (anon) en Supabase
-- =====================================================================
-- CUÁNDO: recién DESPUÉS de que la rama `seguridad-admin` esté en `main` y
-- desplegada en producción. Antes de eso el panel escribe con la clave pública
-- y dejaría de guardar.
--
-- DÓNDE: Supabase → SQL Editor. Correr los pasos de a uno, en orden.
--
-- QUÉ QUEDA:
--   - Cualquiera (anon) puede LEER el contenido público de la web.
--   - Cualquiera puede INSERTAR en `consultas` (formulario de contacto),
--     pero no leerlas ni modificarlas.
--   - `ventas_admin`, `ventas_admin_items` y la lectura de `consultas`:
--     solo el servidor (clave de servicio, que ignora estas reglas).
--   - Bucket `images`: se sigue viendo público; subir, pisar o borrar
--     archivos solo con el permiso firmado que da /api/admin/storage.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PASO 0 (solo lectura): guardar cómo está hoy. Copiar el resultado a un
-- archivo antes de seguir: es la referencia para volver atrás.
-- ---------------------------------------------------------------------
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, cmd, policyname;

select c.relname as tabla, c.relrowsecurity as rls_activado
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by 1;


-- ---------------------------------------------------------------------
-- PASO 1: aplicar. Todo en una transacción: si algo falla, no cambia nada.
-- ---------------------------------------------------------------------
begin;

-- 1a. Borrar las políticas actuales de las tablas de la web.
do $$
declare p record;
begin
  for p in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in (
        'articulos_categorias', 'categorias_articulos', 'clientes', 'consultas',
        'contacto_info', 'controladores_fiscales_content', 'home_content', 'imagenes',
        'posberry_content', 'preguntas_frecuentes', 'productos', 'productos_categorias',
        'servicios', 'sobre_nosotros', 'ventas_admin', 'ventas_admin_items'
      )
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 1b. Activar RLS en todas (sin políticas = nadie con la clave pública entra).
alter table public.articulos_categorias            enable row level security;
alter table public.categorias_articulos            enable row level security;
alter table public.clientes                        enable row level security;
alter table public.consultas                       enable row level security;
alter table public.contacto_info                   enable row level security;
alter table public.controladores_fiscales_content  enable row level security;
alter table public.home_content                    enable row level security;
alter table public.imagenes                        enable row level security;
alter table public.posberry_content                enable row level security;
alter table public.preguntas_frecuentes            enable row level security;
alter table public.productos                       enable row level security;
alter table public.productos_categorias            enable row level security;
alter table public.servicios                       enable row level security;
alter table public.sobre_nosotros                  enable row level security;
alter table public.ventas_admin                    enable row level security;
alter table public.ventas_admin_items              enable row level security;

-- 1c. Lectura pública del contenido de la web.
create policy "lectura publica" on public.articulos_categorias           for select to anon, authenticated using (true);
create policy "lectura publica" on public.categorias_articulos           for select to anon, authenticated using (true);
create policy "lectura publica" on public.clientes                       for select to anon, authenticated using (true);
create policy "lectura publica" on public.contacto_info                  for select to anon, authenticated using (true);
create policy "lectura publica" on public.controladores_fiscales_content for select to anon, authenticated using (true);
create policy "lectura publica" on public.home_content                   for select to anon, authenticated using (true);
create policy "lectura publica" on public.imagenes                       for select to anon, authenticated using (true);
create policy "lectura publica" on public.posberry_content               for select to anon, authenticated using (true);
create policy "lectura publica" on public.preguntas_frecuentes           for select to anon, authenticated using (true);
create policy "lectura publica" on public.productos                      for select to anon, authenticated using (true);
create policy "lectura publica" on public.productos_categorias           for select to anon, authenticated using (true);
create policy "lectura publica" on public.servicios                      for select to anon, authenticated using (true);
create policy "lectura publica" on public.sobre_nosotros                 for select to anon, authenticated using (true);

-- 1d. Formulario de contacto: solo insertar, sin poder marcarse como leída.
create policy "formulario de contacto" on public.consultas
  for insert to anon, authenticated
  with check (coalesce(leida, false) = false and leido_por is null);

-- 1e. Archivos: borrar las políticas de escritura sobre storage.objects.
--     El bucket `images` es público, así que verlo no necesita política.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;

commit;


-- ---------------------------------------------------------------------
-- PASO 2 (solo lectura): verificar.
-- ---------------------------------------------------------------------
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, cmd;
-- Esperado: 13 "lectura publica" (SELECT), 1 "formulario de contacto" (INSERT)
-- y en storage solo políticas de SELECT, si había alguna.


-- ---------------------------------------------------------------------
-- VOLVER ATRÁS (solo si algo de la web deja de andar y no hay tiempo de
-- arreglarlo): reabre todo como estaba en la práctica (anon con acceso total).
-- Después recrear con calma lo que mostraba el PASO 0.
-- ---------------------------------------------------------------------
-- begin;
-- do $$
-- declare t text;
-- begin
--   foreach t in array array[
--     'articulos_categorias','categorias_articulos','clientes','consultas','contacto_info',
--     'controladores_fiscales_content','home_content','imagenes','posberry_content',
--     'preguntas_frecuentes','productos','productos_categorias','servicios',
--     'sobre_nosotros','ventas_admin','ventas_admin_items'
--   ] loop
--     execute format('create policy "temporal acceso total" on public.%I for all to anon, authenticated using (true) with check (true)', t);
--   end loop;
-- end $$;
-- create policy "temporal subida images" on storage.objects for all to anon, authenticated
--   using (bucket_id = 'images') with check (bucket_id = 'images');
-- commit;
