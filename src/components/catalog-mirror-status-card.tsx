'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const MIRROR_SQL = `CREATE TABLE IF NOT EXISTS public.catalogo_productos (
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

CREATE INDEX IF NOT EXISTS idx_catalogo_productos_web_stock ON public.catalogo_productos (mostrar_en_web, stock DESC);
CREATE INDEX IF NOT EXISTS idx_catalogo_productos_titulo ON public.catalogo_productos (titulo);
CREATE INDEX IF NOT EXISTS idx_catalogo_productos_marca ON public.catalogo_productos (marca);

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

INSERT INTO public.catalogo_sync_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;`;

type SyncState = {
  last_kardex_movimiento: number;
  total_articles: number;
  published_in_stock: number;
  last_changed_count: number;
  last_synced_at: string;
};

export function CatalogMirrorStatusCard() {
  const { toast } = useToast();
  const [needsSetup, setNeedsSetup] = useState(false);
  const [state, setState] = useState<SyncState | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadState = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog/sync', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setNeedsSetup(Boolean(data.needsSetup));
      setState(data.state || null);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/catalog/sync', { method: 'POST' });
      const data = await res.json();
      if (data.needsSetup) {
        setNeedsSetup(true);
        toast({
          title: 'Falta crear la tabla espejo',
          description: 'Copiá y ejecutá el SQL en Supabase SQL Editor una única vez.',
          variant: 'destructive',
        });
        return;
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || data.message || 'No se pudo sincronizar.');
      }
      toast({
        title: data.skipped ? 'Espejo al día' : 'Cambios replicados',
        description: data.message,
      });
      await loadState();
    } catch (err: any) {
      toast({
        title: 'Error de sincronización',
        description: err?.message || 'Verificá que el servidor del local esté accesible.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(MIRROR_SQL);
    setCopiedSql(true);
    toast({ title: 'SQL copiado', description: 'Pegalo en Supabase → SQL Editor → Run y luego tocá Sincronizar.' });
    window.setTimeout(() => setCopiedSql(false), 2200);
  };

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 font-headline text-lg">
            <Database className="h-5 w-5 text-primary" />
            Espejo de Catálogo en Supabase (Replicación solo por cambios)
          </CardTitle>
          <CardDescription>
            La tienda lee directo desde Supabase en milisegundos sin depender del servidor del local. Solo se escriben diferencias cuando cambia un artículo o el Kardex.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleSyncNow}
          disabled={syncing}
          className="shrink-0 rounded-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Detectando cambios...' : 'Sincronizar cambios'}
        </Button>
      </CardHeader>

      <CardContent>
        {needsSetup ? (
          <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs leading-relaxed text-foreground/85">
              Para activar la lectura independiente desde Supabase, ejecutá este SQL una única vez en <strong>Supabase → SQL Editor</strong> (guardado en <code>docs/supabase-catalog-mirror.sql</code>) y luego tocá <strong>Sincronizar cambios</strong>.
            </p>
            <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={handleCopySql}>
              {copiedSql ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> SQL copiado
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar SQL del espejo
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface p-3.5">
              <p className="text-xs text-muted-foreground">Publicados en stock</p>
              <p className="mt-1 font-mono text-xl font-bold text-primary tabular-nums">
                {state?.published_in_stock ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5">
              <p className="text-xs text-muted-foreground">Total replicados</p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums">{state?.total_articles ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5">
              <p className="text-xs text-muted-foreground">Último Kardex #</p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums">{state?.last_kardex_movimiento ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3.5">
              <p className="text-xs text-muted-foreground">Último cambio replicado</p>
              <p className="mt-1 font-mono text-xs font-semibold tabular-nums">
                {state?.last_synced_at
                  ? new Date(state.last_synced_at).toLocaleString('es-AR')
                  : 'Pendiente de 1ª sincronización'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
