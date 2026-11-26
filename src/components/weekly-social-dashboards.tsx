'use client';

import * as React from 'react';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  GripVertical,
  ImagePlus,
  Instagram,
  Loader2,
  Save,
  UploadCloud,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { GoogleIcon } from '@/components/icons/google-icon';
import { SkeletonBox } from '@/components/skeletons';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type PlatformKey = 'instagram' | 'facebook' | 'google';

type WeeklyCaptureItem = {
  path: string;
  name: string;
  url: string;
  createdAt: string | null;
};

type WeeklyDashboardsPayload = {
  week: string;
  isAdmin: boolean;
  dashboards: Record<PlatformKey, WeeklyCaptureItem[]>;
};

const PLATFORM_CONFIG: Array<{
  key: PlatformKey;
  title: string;
  subtitle: string;
  badgeClass: string;
  borderGlow: string;
  accentBg: string;
}> = [
  {
    key: 'instagram',
    title: 'Instagram — Estadísticas Semanales',
    subtitle: 'Capturas de Meta Insights, alcance, interacciones y seguidores de la semana.',
    badgeClass: 'rb-instagram-btn text-white',
    borderGlow: 'border-pink-400/70 bg-pink-50/70',
    accentBg: 'from-pink-500/10 via-fuchsia-500/5 to-transparent',
  },
  {
    key: 'facebook',
    title: 'Facebook — Estadísticas Semanales',
    subtitle: 'Capturas de Meta Business Suite, publicaciones, alcance y rendimiento de campañas.',
    badgeClass: 'bg-gradient-to-br from-[#1877F2] to-[#0D5EC9] text-white',
    borderGlow: 'border-blue-400/70 bg-blue-50/70',
    accentBg: 'from-blue-500/10 via-sky-500/5 to-transparent',
  },
  {
    key: 'google',
    title: 'Google — Estadísticas Semanales',
    subtitle: 'Capturas de Google Ads, Perfil de Empresa, clics de búsqueda y llamadas.',
    badgeClass: 'border border-border bg-white text-foreground shadow-xs',
    borderGlow: 'border-amber-400/70 bg-amber-50/70',
    accentBg: 'from-amber-500/10 via-emerald-500/5 to-transparent',
  },
];

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Dom, 1=Lun...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const fmtStart = monday.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  const fmtEnd = sunday.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${fmtStart} al ${fmtEnd}`;
}

/**
 * Asigna dimensiones asimétricas estilo Bento Dashboard según la cantidad y posición de las capturas.
 */
function getBentoSpanClass(index: number, total: number): string {
  if (total === 1) {
    return 'md:col-span-12 md:row-span-2';
  }
  if (total === 2) {
    return index === 0 ? 'md:col-span-7 md:row-span-2' : 'md:col-span-5 md:row-span-2';
  }
  const slot = index % 6;
  switch (slot) {
    case 0:
      return 'md:col-span-7 md:row-span-2';
    case 1:
      return 'md:col-span-5 md:row-span-1';
    case 2:
      return 'md:col-span-5 md:row-span-1';
    case 3:
      return 'md:col-span-4 md:row-span-2';
    case 4:
      return 'md:col-span-8 md:row-span-1';
    default:
      return 'md:col-span-8 md:row-span-1';
  }
}

function PlatformIcon({ platform }: { platform: PlatformKey }) {
  if (platform === 'instagram') return <Instagram className="h-5 w-5" />;
  if (platform === 'facebook') return <FacebookIcon className="h-5 w-5" />;
  return <GoogleIcon className="h-5 w-5" />;
}

export function WeeklySocialDashboards({
  canEditOverride,
}: {
  canEditOverride?: boolean;
} = {}) {
  const { toast } = useToast();
  const [currentMonday, setCurrentMonday] = React.useState<Date>(() => getMondayOfWeek(new Date()));
  const [selectedMonday, setSelectedMonday] = React.useState<Date>(() => getMondayOfWeek(new Date()));

  // Asegurar que siempre se sincronice con el reloj real del cliente al montar (evita fecha cacheada de SSR/build)
  React.useEffect(() => {
    const liveMonday = getMondayOfWeek(new Date());
    setCurrentMonday(liveMonday);
    setSelectedMonday(liveMonday);
  }, []);
  const [dashboards, setDashboards] = React.useState<Record<PlatformKey, WeeklyCaptureItem[]>>({
    instagram: [],
    facebook: [],
    google: [],
  });
  const [serverIsAdmin, setServerIsAdmin] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [uploadingPlatform, setUploadingPlatform] = React.useState<PlatformKey | null>(null);
  const [dragOverPlatform, setDragOverPlatform] = React.useState<PlatformKey | null>(null);
  const [draggingCard, setDraggingCard] = React.useState<{ platform: PlatformKey; path: string } | null>(null);
  const [dragOverCardPath, setDragOverCardPath] = React.useState<string | null>(null);
  const [dirtyPlatforms, setDirtyPlatforms] = React.useState<Record<PlatformKey, boolean>>({
    instagram: false,
    facebook: false,
    google: false,
  });
  const [savingPlatform, setSavingPlatform] = React.useState<PlatformKey | null>(null);
  const [savedPlatform, setSavedPlatform] = React.useState<PlatformKey | null>(null);
  const [deletingPath, setDeletingPath] = React.useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = React.useState<{ url: string; title: string } | null>(null);

  const fileInputRefs = React.useRef<Record<PlatformKey, HTMLInputElement | null>>({
    instagram: null,
    facebook: null,
    google: null,
  });

  const weekKey = toDateKey(selectedMonday);
  const currentWeekKey = toDateKey(currentMonday);
  const isCurrentWeek = weekKey === currentWeekKey;
  const canEdit = canEditOverride !== undefined ? serverIsAdmin && canEditOverride : serverIsAdmin;

  const fetchWeek = React.useCallback(
    async (targetWeekKey: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics/weekly-dashboards?week=${encodeURIComponent(targetWeekKey)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const json = (await res.json()) as WeeklyDashboardsPayload;
        setServerIsAdmin(Boolean(json.isAdmin));
        setDashboards({
          instagram: json.dashboards?.instagram || [],
          facebook: json.dashboards?.facebook || [],
          google: json.dashboards?.google || [],
        });
        setDirtyPlatforms({ instagram: false, facebook: false, google: false });
      } catch {
        toast({
          title: 'Error cargando dashboards semanales',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  React.useEffect(() => {
    fetchWeek(weekKey);
  }, [weekKey, fetchWeek]);

  const shiftWeek = (deltaWeeks: number) => {
    setSelectedMonday((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + deltaWeeks * 7);
      if (next > currentMonday) return currentMonday;
      return next;
    });
  };

  const handleUploadFiles = async (platform: PlatformKey, fileList: FileList | File[]) => {
    if (!canEdit) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      toast({
        title: 'Archivo no compatible',
        description: 'Subí únicamente capturas en formato PNG, JPG o WEBP.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingPlatform(platform);
    try {
      const fd = new FormData();
      fd.append('week', weekKey);
      fd.append('platform', platform);
      for (const f of files) {
        fd.append('files', f);
      }

      const res = await fetch('/api/analytics/weekly-dashboards', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'No se pudieron subir las capturas.');
      }

      const added = (json.uploaded || []) as WeeklyCaptureItem[];
      setDashboards((prev) => ({
        ...prev,
        [platform]: [...prev[platform], ...added],
      }));

      toast({
        title: added.length === 1 ? 'Captura agregada al dashboard' : `${added.length} capturas agregadas`,
        description: `Se actualizaron las estadísticas semanales de ${platform.toUpperCase()}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Error al subir captura',
        description: err?.message || 'Revisá tu conexión e intentá nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPlatform(null);
      const input = fileInputRefs.current[platform];
      if (input) input.value = '';
    }
  };

  const handleReorderCards = (platform: PlatformKey, fromPath: string, toPath: string) => {
    if (!canEdit || fromPath === toPath) return;
    setDashboards((prev) => {
      const list = [...prev[platform]];
      const fromIdx = list.findIndex((i) => i.path === fromPath);
      const toIdx = list.findIndex((i) => i.path === toPath);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      return { ...prev, [platform]: list };
    });
    setDirtyPlatforms((prev) => ({ ...prev, [platform]: true }));
    setSavedPlatform((curr) => (curr === platform ? null : curr));
  };

  const handleSavePlatformOrder = async (platform: PlatformKey) => {
    if (!canEdit) return;
    setSavingPlatform(platform);
    try {
      const order = dashboards[platform].map((item) => item.path);
      const res = await fetch('/api/analytics/weekly-dashboards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week: weekKey, platform, order }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'No se pudo guardar el tablero.');
      }
      setDirtyPlatforms((prev) => ({ ...prev, [platform]: false }));
      setSavedPlatform(platform);
      toast({
        title: 'Tablero guardado',
        description: `Se guardó el orden y las capturas de ${platform.toUpperCase()}.`,
      });
      window.setTimeout(() => {
        setSavedPlatform((curr) => (curr === platform ? null : curr));
      }, 2400);
    } catch (err: any) {
      toast({
        title: 'Error al guardar',
        description: err?.message || 'Intentá nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setSavingPlatform(null);
    }
  };

  const handleDeleteCapture = async (platform: PlatformKey, itemPath: string) => {
    if (!canEdit) return;
    setDeletingPath(itemPath);
    try {
      const res = await fetch(
        `/api/analytics/weekly-dashboards?path=${encodeURIComponent(itemPath)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        throw new Error('No se pudo eliminar la captura.');
      }
      setDashboards((prev) => ({
        ...prev,
        [platform]: prev[platform].filter((item) => item.path !== itemPath),
      }));
      setDirtyPlatforms((prev) => ({ ...prev, [platform]: true }));
      toast({ title: 'Captura eliminada del tablero' });
    } catch (err: any) {
      toast({
        title: 'Error al eliminar',
        description: err?.message,
        variant: 'destructive',
      });
    } finally {
      setDeletingPath(null);
    }
  };

  const totalCaptures =
    dashboards.instagram.length + dashboards.facebook.length + dashboards.google.length;

  return (
    <section className="space-y-6">
      {/* Encabezado + Desplazamiento semanal ÚNICO para las 3 plataformas */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-primary/15 bg-gradient-to-r from-white via-[#F4F8FF] to-white p-5 shadow-xs lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-headline text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Dashboards Semanales de Redes y Ads
            </h2>
            <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary tabular-nums">
              {totalCaptures} {totalCaptures === 1 ? 'captura' : 'capturas'}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {canEdit
              ? 'Arrastrá y soltá tus capturas de Meta Insights y Google Ads para armar automáticamente el tablero semanal.'
              : 'Resumen visual semanal de rendimiento en Instagram, Facebook y Google.'}
          </p>
        </div>

        {/* Control único de desplazamiento semanal */}
        <div className="flex flex-wrap items-center gap-2">
          {isCurrentWeek && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Semana actual
            </span>
          )}

          <div className="inline-flex items-center rounded-full border border-primary/20 bg-white p-1 shadow-xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => shiftWeek(-1)}
              className="h-8 w-8 rounded-full"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 px-3 text-xs font-semibold text-foreground sm:text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="whitespace-nowrap">Semana del {formatWeekLabel(selectedMonday)}</span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => shiftWeek(1)}
              disabled={isCurrentWeek}
              className="h-8 w-8 rounded-full disabled:opacity-35"
              aria-label="Semana siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {!isCurrentWeek && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setSelectedMonday(currentMonday)}
              className="h-9 rounded-full px-4 text-xs"
            >
              Volver a esta semana
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* 3 secciones apiladas en orden: Instagram -> Facebook -> Google */}
      <div className="space-y-6">
        {PLATFORM_CONFIG.map((cfg) => {
          const items = dashboards[cfg.key];
          const isDraggingOver = dragOverPlatform === cfg.key;
          const isUploading = uploadingPlatform === cfg.key;

          return (
            <div
              key={cfg.key}
              onDragOver={(e) => {
                if (!canEdit || draggingCard) return;
                e.preventDefault();
                if (dragOverPlatform !== cfg.key) setDragOverPlatform(cfg.key);
              }}
              onDragLeave={(e) => {
                if (!canEdit || draggingCard) return;
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverPlatform(null);
                }
              }}
              onDrop={(e) => {
                if (!canEdit || draggingCard) return;
                e.preventDefault();
                setDragOverPlatform(null);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleUploadFiles(cfg.key, e.dataTransfer.files);
                }
              }}
              className={cn(
                'relative overflow-hidden rounded-3xl border bg-white p-5 shadow-xs transition-all duration-300 sm:p-6',
                isDraggingOver
                  ? cn('border-2 border-dashed shadow-lg', cfg.borderGlow)
                  : 'border-primary/12'
              )}
            >
              <div
                aria-hidden="true"
                className={cn('pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b', cfg.accentBg)}
              />

              {/* Cabecera de la plataforma */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div className="flex items-center gap-3">
                  <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', cfg.badgeClass)}>
                    <PlatformIcon platform={cfg.key} />
                  </span>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-foreground">{cfg.title}</h3>
                    <p className="text-xs text-muted-foreground">{cfg.subtitle}</p>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[cfg.key] = el;
                      }}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleUploadFiles(cfg.key, e.target.files);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isUploading}
                      onClick={() => fileInputRefs.current[cfg.key]?.click()}
                      className="h-9 rounded-full px-4 text-xs"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-3.5 w-3.5" />
                          Agregar capturas
                        </>
                      )}
                    </Button>
                    {items.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant={dirtyPlatforms[cfg.key] ? 'default' : 'outline'}
                        disabled={savingPlatform === cfg.key}
                        onClick={() => handleSavePlatformOrder(cfg.key)}
                        className={cn(
                          'h-9 rounded-full px-4 text-xs',
                          savedPlatform === cfg.key && 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        )}
                      >
                        {savingPlatform === cfg.key ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Guardando...
                          </>
                        ) : savedPlatform === cfg.key ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Guardado
                          </>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" />
                            {dirtyPlatforms[cfg.key] ? 'Guardar orden' : 'Guardar'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Contenido: Skeleton, Dropzone vacío (solo admin) o Grid Asimétrico Bento */}
              <div className="relative z-10 mt-5">
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <SkeletonBox className="h-64 md:col-span-7" />
                    <div className="grid gap-4 md:col-span-5">
                      <SkeletonBox className="h-[120px]" />
                      <SkeletonBox className="h-[120px]" />
                    </div>
                  </div>
                ) : items.length === 0 ? (
                  canEdit ? (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[cfg.key]?.click()}
                      disabled={isUploading}
                      className={cn(
                        'group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300',
                        isDraggingOver
                          ? 'border-primary bg-primary/8'
                          : 'border-primary/20 bg-[#F7FAFF] hover:border-primary/50 hover:bg-[#EFF5FF]'
                      )}
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-primary shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
                        {isUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <UploadCloud className="h-6 w-6" />
                        )}
                      </span>
                      <div className="space-y-1">
                        <p className="font-headline text-sm font-bold text-foreground sm:text-base">
                          {isDraggingOver
                            ? '¡Soltá las imágenes ahora!'
                            : `Arrastrá y soltá las capturas de ${cfg.key.charAt(0).toUpperCase() + cfg.key.slice(1)} de esta semana`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Podés subir varias capturas a la vez (PNG, JPG, WEBP) · Se acomodan solas en un grid asimétrico
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-border/70 bg-surface/60 px-6 py-10 text-center">
                      <p className="text-sm text-muted-foreground">
                        Sin reportes visuales cargados para esta semana.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    {/* Grid Asimétrico estilo Bento Dashboard */}
                    <div className="grid auto-rows-[210px] grid-cols-1 gap-4 md:grid-cols-12">
                      {items.map((item, idx) => {
                        const isBeingDragged =
                          draggingCard?.platform === cfg.key && draggingCard?.path === item.path;
                        const isDropTarget =
                          draggingCard?.platform === cfg.key &&
                          draggingCard?.path !== item.path &&
                          dragOverCardPath === item.path;

                        return (
                          <div
                            key={item.path}
                            draggable={canEdit}
                            onDragStart={(e) => {
                              if (!canEdit) return;
                              setDraggingCard({ platform: cfg.key, path: item.path });
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', item.path);
                            }}
                            onDragOver={(e) => {
                              if (!canEdit || !draggingCard || draggingCard.platform !== cfg.key) return;
                              e.preventDefault();
                              e.stopPropagation();
                              e.dataTransfer.dropEffect = 'move';
                              if (dragOverCardPath !== item.path) {
                                setDragOverCardPath(item.path);
                              }
                            }}
                            onDragLeave={() => {
                              if (dragOverCardPath === item.path) {
                                setDragOverCardPath(null);
                              }
                            }}
                            onDrop={(e) => {
                              if (!canEdit || !draggingCard || draggingCard.platform !== cfg.key) return;
                              e.preventDefault();
                              e.stopPropagation();
                              handleReorderCards(cfg.key, draggingCard.path, item.path);
                              setDraggingCard(null);
                              setDragOverCardPath(null);
                            }}
                            onDragEnd={() => {
                              setDraggingCard(null);
                              setDragOverCardPath(null);
                            }}
                            className={cn(
                              'group relative overflow-hidden rounded-2xl border bg-[#F8FAFF] shadow-xs transition-all duration-300 ease-expo',
                              canEdit ? 'cursor-grab active:cursor-grabbing' : '',
                              isBeingDragged
                                ? 'scale-[0.98] border-primary/50 opacity-50'
                                : isDropTarget
                                  ? 'border-2 border-dashed border-primary bg-primary/5 ring-4 ring-primary/15'
                                  : 'border-primary/15 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_18px_36px_-18px_rgba(0,48,143,0.28)]',
                              getBentoSpanClass(idx, items.length)
                            )}
                          >
                            {/* Indicador de arrastre y posición (solo admin) */}
                            {canEdit && (
                              <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full border border-primary/15 bg-white/92 px-2 py-0.5 text-[11px] font-semibold text-primary shadow-xs backdrop-blur-sm">
                                <GripVertical className="h-3 w-3 opacity-75" />
                                <span className="font-mono">#{idx + 1}</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => setLightboxItem({ url: item.url, title: `${cfg.title} · #${idx + 1}` })}
                              className="h-full w-full cursor-zoom-in text-left focus-visible:outline-none"
                              aria-label={`Ampliar captura ${idx + 1} de ${cfg.key}`}
                            >
                              <img
                                src={item.url}
                                alt={`Captura ${idx + 1} de ${cfg.title}`}
                                draggable={false}
                                className="h-full w-full bg-white object-contain p-2 transition-transform duration-500 ease-expo group-hover:scale-[1.02]"
                                loading="lazy"
                              />
                            </button>

                            {/* Controles flotantes: Ampliar (hover) + Cruz roja de borrado rápido (siempre visible para admin) */}
                            <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxItem({ url: item.url, title: `${cfg.title} · #${idx + 1}` });
                                }}
                                className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white/95 text-foreground opacity-0 shadow-sm transition-all hover:border-primary hover:text-primary group-hover:opacity-100"
                                aria-label="Ampliar imagen"
                              >
                                <Expand className="h-3.5 w-3.5" />
                              </button>
                              {canEdit && (
                                <button
                                  type="button"
                                  disabled={deletingPath === item.path}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCapture(cfg.key, item.path);
                                  }}
                                  className="grid h-8 w-8 place-items-center rounded-full border border-rose-200 bg-white/95 text-rose-600 shadow-sm transition-all hover:scale-105 hover:border-rose-600 hover:bg-rose-600 hover:text-white"
                                  aria-label={`Eliminar captura ${idx + 1}`}
                                  title="Eliminar captura"
                                >
                                  {deletingPath === item.path ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4 stroke-[2.5]" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Zona compacta de drag & drop adicional (solo visible para admin) */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[cfg.key]?.click()}
                        disabled={isUploading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/25 bg-[#F6F9FF] px-4 py-3 text-xs font-semibold text-primary/85 transition-colors hover:border-primary/60 hover:bg-[#ECF3FF] hover:text-primary"
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>
                          {isUploading
                            ? 'Subiendo nuevas capturas...'
                            : 'Arrastrá más capturas aquí o hacé clic para seguir armando este dashboard'}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox para ver cualquier captura del dashboard en alta resolución */}
      <Dialog open={Boolean(lightboxItem)} onOpenChange={(open) => !open && setLightboxItem(null)}>
        <DialogContent className="max-w-5xl border-border bg-white p-4 sm:p-6 [&>button]:hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <DialogTitle className="truncate font-headline text-base font-bold text-foreground">
              {lightboxItem?.title || 'Vista ampliada'}
            </DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={() => setLightboxItem(null)}
              aria-label="Cerrar vista ampliada"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {lightboxItem && (
            <div className="flex max-h-[80vh] items-center justify-center overflow-auto rounded-xl bg-surface p-2">
              <img
                src={lightboxItem.url}
                alt={lightboxItem.title}
                className="max-h-[76vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
