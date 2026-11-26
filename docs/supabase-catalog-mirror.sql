-- Ejecutar una única vez en Supabase SQL Editor para habilitar
-- el espejo ultra-rápido del catálogo (replicado solo cuando hay cambios).

CREATE TABLE IF NOT EXISTS public.catalogo_productos (
  codigo TEXT PRIMARY KEY,
  id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion_web TEXT,
  anotaciones_web TEXT,
  stock NUMERIC NOT NULL DEFAULT 0,
  precio NUMERIC,
  moneda TEXT,
  imagen_url TEXT NOT NULL DEFAULT '',
  mostrar_en_web BOOLEAN NOT NULL DEFAULT FALSE,
  linea TEXT,
  rubro TEXT,
  marca TEXT,
  content_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalogo_productos_web_stock
  ON public.catalogo_productos (mostrar_en_web, stock DESC);

CREATE INDEX IF NOT EXISTS idx_catalogo_productos_titulo
  ON public.catalogo_productos (titulo);

CREATE INDEX IF NOT EXISTS idx_catalogo_productos_marca
  ON public.catalogo_productos (marca);

CREATE TABLE IF NOT EXISTS public.catalogo_sync_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_kardex_movimiento BIGINT NOT NULL DEFAULT 0,
  last_checksum TEXT NOT NULL DEFAULT '',
  total_articles INTEGER NOT NULL DEFAULT 0,
  published_in_stock INTEGER NOT NULL DEFAULT 0,
  last_changed_count INTEGER NOT NULL DEFAULT 0,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.catalogo_sync_state (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
