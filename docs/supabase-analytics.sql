-- Ejecutar en Supabase SQL Editor (una única vez) para habilitar
-- las estadísticas reales y los enlaces de referencia (WhatsApp, Facebook, Instagram, Google).

CREATE TABLE IF NOT EXISTS public.web_analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  referrer TEXT,
  source TEXT NOT NULL DEFAULT 'direct',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ref_code TEXT,
  label TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_web_analytics_created_at
  ON public.web_analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_web_analytics_type_created
  ON public.web_analytics_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_web_analytics_source
  ON public.web_analytics_events (source);

CREATE INDEX IF NOT EXISTS idx_web_analytics_path
  ON public.web_analytics_events (path);

CREATE TABLE IF NOT EXISTS public.referral_links (
  id BIGSERIAL PRIMARY KEY,
  channel TEXT NOT NULL,
  name TEXT NOT NULL,
  target_path TEXT NOT NULL DEFAULT '/',
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  ref_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_links_channel
  ON public.referral_links (channel);

INSERT INTO public.referral_links (channel, name, target_path, utm_source, utm_medium, utm_campaign, ref_code)
SELECT v.channel, v.name, v.target_path, v.utm_source, v.utm_medium, v.utm_campaign, v.ref_code
FROM (
  VALUES
    ('whatsapp', 'Perfil / Estado WhatsApp (Inicio)', '/', 'whatsapp', 'social', 'perfil_whatsapp', 'wa_perfil'),
    ('whatsapp', 'WhatsApp Catálogo Productos', '/productos', 'whatsapp', 'social', 'catalogo_whatsapp', 'wa_catalogo'),
    ('instagram', 'Bio de Instagram (Inicio)', '/', 'instagram', 'social', 'bio_instagram', 'ig_bio'),
    ('instagram', 'Instagram Historias / Productos', '/productos', 'instagram', 'social', 'stories_instagram', 'ig_stories'),
    ('facebook', 'Página de Facebook (Inicio)', '/', 'facebook', 'social', 'perfil_facebook', 'fb_perfil'),
    ('facebook', 'Facebook POSBerry & Fiscales', '/posberry', 'facebook', 'social', 'posberry_facebook', 'fb_posberry'),
    ('google', 'Perfil de Google / Maps (Inicio)', '/', 'google', 'organic', 'google_maps_perfil', 'g_maps'),
    ('google', 'Google Servicio Técnico', '/servicios', 'google', 'organic', 'google_servicios', 'g_servicios')
) AS v(channel, name, target_path, utm_source, utm_medium, utm_campaign, ref_code)
WHERE NOT EXISTS (SELECT 1 FROM public.referral_links LIMIT 1);
