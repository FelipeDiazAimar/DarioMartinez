'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Users,
  BarChart3,
  FileText,
  MousePointerClick,
  Smartphone,
  Tablet,
  Laptop,
  ChevronsUpDown,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Link2,
  Database,
  Instagram,
  Share2,
  TrendingUp,
  TrendingDown,
  EyeOff,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { GoogleIcon } from '@/components/icons/google-icon';
import { WeeklySocialDashboards } from '@/components/weekly-social-dashboards';
import { BrandLogo } from '@/components/brand-logo';
import { AuroraBackdrop, SpotlightCard } from '@/components/react-bits';
import { SkeletonBox } from '@/components/skeletons';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TimeRangeKey = 'today' | '7d' | '30d' | '90d' | '365d';

type StatsResponse = {
  needsSetup: boolean;
  generatedAt: string;
  range: TimeRangeKey;
  rangeLabel: string;
  compareLabel: string;
  historicalCutoff: string;
  summary: {
    totalVisits: number;
    visitsDelta: number;
    uniqueVisitors: number;
    uniqueVisitorsDelta: number;
    productClicks: number;
    productClicksDelta: number;
    whatsappClicks: number;
    whatsappClicksDelta: number;
    totalConsultas: number;
    consultasDelta: number;
  };
  series: Array<{ label: string; visits: number; visitors: number }>;
  devices: Array<{ key: string; name: string; value: number }>;
  topPages: Array<{ name: string; views: number }>;
  topProducts: Array<{ name: string; clicks: number }>;
  trafficSources: Array<{ channel: string; name: string; visits: number; visitors: number }>;
  campaigns: Array<{ refCode: string; source: string; campaign: string; visits: number; visitors: number }>;
  refCounts: Record<string, number>;
  recentConsultas: Array<{ id: number; name: string; email: string; createdAt: string | null; leida: boolean }>;
};

type ReferralLinkRow = {
  id: number;
  channel: 'whatsapp' | 'facebook' | 'instagram' | 'google';
  name: string;
  target_path: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  ref_code: string;
};

const RANGE_OPTIONS: Array<{ key: TimeRangeKey; label: string; shortLabel: string }> = [
  { key: 'today', label: 'Hoy', shortLabel: 'Hoy' },
  { key: '7d', label: 'Última semana', shortLabel: '7 días' },
  { key: '30d', label: 'Último mes', shortLabel: 'Mes' },
  { key: '90d', label: 'Último trimestre', shortLabel: 'Trimestre' },
  { key: '365d', label: 'Último año', shortLabel: 'Año' },
];

const DEVICE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

const CHANNEL_META = {
  whatsapp: {
    label: 'WhatsApp',
    badge: 'bg-[#1FAF5A] text-white',
    defaultMedium: 'social',
  },
  instagram: {
    label: 'Instagram',
    badge: 'rb-instagram-btn text-white',
    defaultMedium: 'social',
  },
  facebook: {
    label: 'Facebook',
    badge: 'bg-[#1877F2] text-white',
    defaultMedium: 'social',
  },
  google: {
    label: 'Google',
    badge: 'bg-white border border-border text-foreground',
    defaultMedium: 'organic',
  },
} as const;

const TARGET_ROUTES = [
  { value: '/', label: 'Inicio (/)' },
  { value: '/productos', label: 'Catálogo de Productos (/productos)' },
  { value: '/servicios', label: 'Servicio Técnico (/servicios)' },
  { value: '/posberry', label: 'POSBerry (/posberry)' },
  { value: '/controladores-fiscales', label: 'Controladores Fiscales (/controladores-fiscales)' },
  { value: '/sobre-nosotros', label: 'Sobre Nosotros (/sobre-nosotros)' },
  { value: '/contacto', label: 'Contacto (/contacto)' },
];

function ChannelIcon({ channel, className = 'h-4 w-4' }: { channel: string; className?: string }) {
  if (channel === 'whatsapp') return <WhatsAppIcon className={className} />;
  if (channel === 'instagram') return <Instagram className={className} />;
  if (channel === 'facebook') return <FacebookIcon className={className} />;
  if (channel === 'google') return <GoogleIcon className={className} />;
  return <Share2 className={className} />;
}

function DeltaPill({ delta, compareLabel }: { delta: number; compareLabel: string }) {
  const isPositive = delta >= 0;
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground sm:text-xs">
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums sm:text-[11px]',
          isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        )}
      >
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {isPositive ? `+${delta}%` : `${delta}%`}
      </span>
      <span className="truncate">{compareLabel}</span>
    </p>
  );
}

export default function StatisticsPage() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRangeKey>('30d');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [links, setLinks] = useState<ReferralLinkRow[]>([]);
  const [linksPersisted, setLinksPersisted] = useState(true);
  const [baseOrigin, setBaseOrigin] = useState('https://dariomartinezcomputacion.com.ar');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [clientPreviewMode, setClientPreviewMode] = useState(false);

  // Form para crear nuevo enlace de referencia
  const [newChannel, setNewChannel] = useState<'whatsapp' | 'facebook' | 'instagram' | 'google'>('instagram');
  const [newName, setNewName] = useState('');
  const [newTargetPath, setNewTargetPath] = useState('/');
  const [newCampaign, setNewCampaign] = useState('');
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  useEffect(() => {
    try {
      const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
      const localAuth = localStorage.getItem('isAdminAuthenticated');
      setIsAdmin(sessionAuth === 'true' || localAuth === 'true');
    } catch {
      setIsAdmin(false);
    } finally {
      setAuthChecked(true);
    }

    if (typeof window !== 'undefined' && window.location.origin) {
      setBaseOrigin(window.location.origin);
    }
  }, []);

  const fetchStats = useCallback(
    async (range: TimeRangeKey) => {
      setIsLoadingStats(true);
      try {
        const statsRes = await fetch(`/api/analytics/stats?range=${encodeURIComponent(range)}`, {
          cache: 'no-store',
        });
        if (statsRes.ok) {
          const statsJson = (await statsRes.json()) as StatsResponse;
          setStats(statsJson);
        }
      } catch {
        toast({
          title: 'Error al cargar estadísticas',
          description: 'No se pudo consultar la base de datos de analíticas.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingStats(false);
      }
    },
    [toast]
  );

  const fetchLinks = useCallback(async () => {
    try {
      const linksRes = await fetch('/api/analytics/links', { cache: 'no-store' });
      if (linksRes.ok) {
        const linksJson = await linksRes.json();
        setLinks((linksJson.links || []) as ReferralLinkRow[]);
        setLinksPersisted(Boolean(linksJson.persisted));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchLinks();
    }
  }, [isAdmin, fetchLinks]);

  useEffect(() => {
    if (authChecked) {
      fetchStats(selectedRange);
    }
  }, [authChecked, selectedRange, fetchStats]);

  const buildTrackedUrl = useCallback(
    (link: {
      target_path: string;
      utm_source: string;
      utm_medium: string;
      utm_campaign: string;
      ref_code: string;
    }) => {
      const cleanOrigin = baseOrigin.replace(/\/+$/, '');
      const cleanPath = link.target_path.startsWith('/') ? link.target_path : `/${link.target_path}`;
      const params = new URLSearchParams({
        utm_source: link.utm_source,
        utm_medium: link.utm_medium,
        utm_campaign: link.utm_campaign,
        ref: link.ref_code,
      });
      return `${cleanOrigin}${cleanPath}?${params.toString()}`;
    },
    [baseOrigin]
  );

  const previewUrl = useMemo(() => {
    const campaignSlug =
      newCampaign
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') || `${newChannel}_promo`;

    return buildTrackedUrl({
      target_path: newTargetPath,
      utm_source: newChannel,
      utm_medium: CHANNEL_META[newChannel].defaultMedium,
      utm_campaign: campaignSlug,
      ref_code: `${newChannel.slice(0, 2)}_${campaignSlug.slice(0, 20)}`,
    });
  }, [buildTrackedUrl, newCampaign, newChannel, newTargetPath]);

  const copyText = async (text: string, key: string, message = 'Enlace copiado al portapapeles') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast({ title: 'Copiado', description: message });
      window.setTimeout(() => setCopiedKey((curr) => (curr === key ? null : curr)), 2200);
    } catch {
      toast({
        title: 'No se pudo copiar',
        description: 'Seleccioná el enlace manualmente para copiarlo.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreatingLink(true);

    const campaignSlug =
      (newCampaign.trim() || newName.trim())
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') || `${newChannel}_campana`;

    try {
      const res = await fetch('/api/analytics/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: newChannel,
          name: newName.trim(),
          targetPath: newTargetPath,
          utmMedium: CHANNEL_META[newChannel].defaultMedium,
          utmCampaign: campaignSlug,
          refCode: `${newChannel.slice(0, 2)}_${campaignSlug.slice(0, 24)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo guardar el enlace.');
      }

      setLinks((prev) => [data.link, ...prev.filter((l) => l.id > 0)]);
      setNewName('');
      setNewCampaign('');
      toast({
        title: 'Enlace guardado',
        description: 'Ya podés copiarlo y compartirlo para medir sus visitas.',
      });
    } catch (err: any) {
      toast({
        title: 'Atención',
        description: err?.message || 'No se pudo crear el enlace.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (id <= 0) return;
    const res = await fetch(`/api/analytics/links?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setLinks((prev) => prev.filter((item) => item.id !== id));
      toast({ title: 'Enlace eliminado' });
    }
  };

  if (!authChecked) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 md:p-8">
        <SkeletonBox className="h-12 w-80" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBox key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalDeviceCount = stats ? stats.devices.reduce((acc, d) => acc + d.value, 0) : 0;

  return (
    <div className="bg-brand-mist min-h-screen w-full">
      {/* Barra superior exclusiva para acceso compartido sin login (solo permite alternar entre Estadísticas y Revisión) */}
      {!isAdmin && (
        <header className="sticky top-0 z-40 w-full border-b border-primary/12 bg-white/90 shadow-[0_6px_24px_-16px_rgba(0,48,143,0.16)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#00308F] via-[#3B6AF0] to-[#00308F] opacity-80" />
          <div className="mx-auto flex h-[70px] w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center">
                <BrandLogo size="md" />
              </span>
              <span className="hidden rounded-full border border-primary/15 bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
                Panel de Estadísticas
              </span>
            </div>
            <Button asChild size="sm" className="h-10 rounded-full px-5 text-xs font-semibold sm:text-sm">
              <Link href="/revision">
                <ClipboardCheck className="h-4 w-4" />
                Ir a Revisión
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </header>
      )}

      {/* Encabezado editorial con filtro temporal */}
      <section className="bg-brand-hero relative w-full overflow-hidden border-b border-border py-6 sm:py-8 lg:py-10">
        <AuroraBackdrop variant="light" />
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col justify-between gap-4 px-4 sm:gap-5 sm:px-6 lg:flex-row lg:items-end lg:px-8">
          <div>
            <h1 className="flex items-center gap-2.5 font-headline text-2xl font-extrabold tracking-tight sm:gap-3 sm:text-4xl">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#002878] to-[#2349B6] text-white shadow-md shadow-primary/25 sm:h-11 sm:w-11 sm:rounded-2xl">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              Estadísticas y Rendimiento
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
              Base histórica consolidada hasta el 25/11/2026 y medición 100% en vivo desde esa fecha en adelante.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Button asChild size="sm" className="h-9 rounded-full px-3.5 text-xs font-semibold sm:px-4">
                <Link href="/revision">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Ir a Revisión
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setClientPreviewMode((v) => !v)}
                className="h-9 rounded-full bg-white px-3.5 text-xs sm:px-4"
              >
                {clientPreviewMode ? (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Modo edición admin
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Vista sin drag & drop
                  </>
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchStats(selectedRange)}
              className="h-9 rounded-full bg-white px-3.5 text-xs sm:px-4"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoadingStats && 'animate-spin')} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filtro temporal: en móvil encaja en 1 sola barra táctil con etiquetas cortas; en desktop etiquetas completas */}
        <div className="relative z-10 mx-auto mt-5 max-w-[1440px] px-4 sm:mt-6 sm:px-6 lg:px-8">
          <div className="flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-primary/15 bg-white/92 p-1 shadow-xs backdrop-blur-md sm:inline-flex sm:w-auto sm:flex-wrap sm:gap-1.5 sm:rounded-full sm:p-1.5">
            {RANGE_OPTIONS.map((opt) => {
              const active = selectedRange === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedRange(opt.key)}
                  className={cn(
                    'rb-pill-interactive flex-1 whitespace-nowrap rounded-xl px-2.5 py-2 text-center text-xs font-semibold sm:flex-none sm:rounded-full sm:px-4 sm:py-1.5 sm:text-sm',
                    active
                      ? 'bg-gradient-to-r from-[#002878] via-[#00308F] to-[#2349B6] text-white shadow-sm'
                      : 'text-foreground/75 hover:bg-[#EEF4FF] hover:text-primary'
                  )}
                >
                  <span className="sm:hidden">{opt.shortLabel}</span>
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:gap-9 sm:px-6 sm:py-8 lg:px-8">
        {/* Aviso si faltara tabla de analíticas */}
        {stats?.needsSetup && (
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary">
                <Database className="h-4 w-4" />
                Tabla web_analytics_events no detectada en Supabase
              </CardTitle>
              <CardDescription>
                Ejecutá <code>docs/supabase-analytics.sql</code> en el SQL Editor de Supabase para acumular nuevos eventos en vivo.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* 1. KPIs Principales del período seleccionado (2×2 en móvil, 4 columnas en desktop) */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {isLoadingStats || !stats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox
                key={i}
                className="h-28 w-full rounded-2xl sm:h-32"
              />
            ))
          ) : (
            <>
              <SpotlightCard className="rounded-2xl border border-primary/12 bg-white p-3.5 shadow-xs sm:p-5">
                <div className="relative z-20">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">
                      Visitas ({stats.rangeLabel})
                    </span>
                    <Eye className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                  </div>
                  <div className="mt-2 font-mono text-xl font-extrabold tabular-nums sm:mt-3 sm:text-2xl">
                    {stats.summary.totalVisits.toLocaleString('es-AR')}
                  </div>
                  <DeltaPill delta={stats.summary.visitsDelta} compareLabel={stats.compareLabel} />
                </div>
              </SpotlightCard>

              <SpotlightCard className="rounded-2xl border border-primary/12 bg-white p-3.5 shadow-xs sm:p-5">
                <div className="relative z-20">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">
                      Visitantes Únicos
                    </span>
                    <Users className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                  </div>
                  <div className="mt-2 font-mono text-xl font-extrabold tabular-nums sm:mt-3 sm:text-2xl">
                    {stats.summary.uniqueVisitors.toLocaleString('es-AR')}
                  </div>
                  <DeltaPill delta={stats.summary.uniqueVisitorsDelta} compareLabel={stats.compareLabel} />
                </div>
              </SpotlightCard>

              <SpotlightCard className="rounded-2xl border border-primary/12 bg-white p-3.5 shadow-xs sm:p-5">
                <Collapsible className="relative z-20">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">
                      Clics en Productos
                    </span>
                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                      <MousePointerClick className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-6 w-6 rounded-full sm:h-7 sm:w-7">
                          <ChevronsUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span className="sr-only">Ver desglose por producto</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <div className="mt-2 font-mono text-xl font-extrabold tabular-nums sm:mt-3 sm:text-2xl">
                    {stats.summary.productClicks.toLocaleString('es-AR')}
                  </div>
                  <DeltaPill delta={stats.summary.productClicksDelta} compareLabel={stats.compareLabel} />
                  <CollapsibleContent className="mt-3 border-t border-border pt-3">
                    {stats.topProducts.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sin clics en este período.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {stats.topProducts.slice(0, 6).map((p) => (
                          <li key={p.name} className="flex justify-between gap-2 text-xs">
                            <span className="truncate text-muted-foreground">{p.name}</span>
                            <span className="font-mono font-semibold tabular-nums">{p.clicks}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </SpotlightCard>

              <SpotlightCard className="rounded-2xl border border-primary/12 bg-white p-3.5 shadow-xs sm:p-5">
                <div className="relative z-20">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-semibold text-muted-foreground sm:text-xs">
                      Clics a WhatsApp
                    </span>
                    <WhatsAppIcon className="h-3.5 w-3.5 shrink-0 text-[#1FAF5A] sm:h-4 sm:w-4" />
                  </div>
                  <div className="mt-2 font-mono text-xl font-extrabold tabular-nums sm:mt-3 sm:text-2xl">
                    {stats.summary.whatsappClicks.toLocaleString('es-AR')}
                  </div>
                  <DeltaPill delta={stats.summary.whatsappClicksDelta} compareLabel={stats.compareLabel} />
                </div>
              </SpotlightCard>
            </>
          )}
        </section>

        {/* 2. Dashboards Semanales de Instagram -> Facebook -> Google (Drag & Drop solo admin + Grid Asimétrico) */}
        <WeeklySocialDashboards canEditOverride={isAdmin && !clientPreviewMode} />

        {/* 3. Gráficos de Tráfico Web del período seleccionado */}
        {stats && (
          <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
            <Card className="overflow-hidden rounded-2xl border-primary/12 bg-white shadow-xs lg:col-span-8">
              <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="font-headline text-lg font-bold sm:text-xl">
                      Evolución de Visitas — {stats.rangeLabel}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Visitas totales y visitantes únicos dentro del período seleccionado.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground sm:text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                      Visitas
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                      Únicos
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-2 pb-4 pt-0 sm:px-6 sm:pb-6">
                <div className="w-full overflow-x-auto pb-1">
                  <div className={cn(stats.series.length > 12 ? 'min-w-[520px] sm:min-w-0' : 'w-full')}>
                    <ChartContainer
                      config={{
                        visits: { label: 'Visitas', color: 'hsl(var(--chart-1))' },
                        visitors: { label: 'Únicos', color: 'hsl(var(--chart-2))' },
                      }}
                      className="h-[220px] w-full sm:h-[300px]"
                    >
                      <BarChart data={stats.series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          minTickGap={16}
                          interval="preserveStartEnd"
                          fontSize={11}
                        />
                        <YAxis tickLine={false} axisLine={false} width={40} fontSize={11} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="visits" fill="var(--color-visits)" radius={[5, 5, 0, 0]} maxBarSize={28} />
                        <Bar dataKey="visitors" fill="var(--color-visitors)" radius={[5, 5, 0, 0]} maxBarSize={28} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
                {stats.series.length > 12 && (
                  <p className="mt-1 text-center text-[11px] text-muted-foreground sm:hidden">
                    Deslizá horizontalmente para ver todos los días
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-primary/12 bg-white shadow-xs lg:col-span-4">
              <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
                <CardTitle className="font-headline text-lg font-bold sm:text-xl">Dispositivos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Distribución en {stats.rangeLabel.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-2 sm:p-6 sm:pt-2">
                <ChartContainer
                  config={{
                    mobile: { label: 'Móvil', color: 'hsl(var(--chart-1))' },
                    desktop: { label: 'Escritorio', color: 'hsl(var(--chart-2))' },
                    tablet: { label: 'Tablet', color: 'hsl(var(--chart-3))' },
                  }}
                  className="mx-auto h-[185px] w-full max-w-[220px] sm:h-[210px] sm:max-w-[240px]"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={stats.devices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={76}
                      paddingAngle={3}
                    >
                      {stats.devices.map((entry, idx) => (
                        <Cell key={entry.key} fill={DEVICE_COLORS[idx % DEVICE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center sm:pt-4">
                  {stats.devices.map((d) => {
                    const pct = totalDeviceCount > 0 ? Math.round((d.value / totalDeviceCount) * 100) : 0;
                    const Icon = d.key === 'mobile' ? Smartphone : d.key === 'tablet' ? Tablet : Laptop;
                    return (
                      <div key={d.key} className="rounded-xl bg-surface p-2 sm:p-2.5">
                        <Icon className="mx-auto h-4 w-4 text-primary" />
                        <p className="mt-1 font-mono text-sm font-bold tabular-nums">{pct}%</p>
                        <p className="truncate text-[11px] text-muted-foreground">{d.name}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Orígenes de tráfico + Páginas más visitadas */}
            <Card className="rounded-2xl border-primary/12 bg-white shadow-xs lg:col-span-6">
              <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
                <CardTitle className="font-headline text-base font-bold sm:text-lg">Orígenes de Tráfico</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Visitas atribuidas por canal en {stats.rangeLabel.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
                {stats.trafficSources.map((src) => {
                  const maxVal = Math.max(1, ...stats.trafficSources.map((s) => s.visits));
                  const pct = Math.round((src.visits / maxVal) * 100);
                  return (
                    <div key={src.channel} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
                          <ChannelIcon channel={src.channel} className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="truncate">{src.name}</span>
                        </span>
                        <span className="shrink-0 font-mono font-semibold tabular-nums">
                          {src.visits.toLocaleString('es-AR')} visitas
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#00308F] to-[#3B6AF0] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-primary/12 bg-white shadow-xs lg:col-span-6">
              <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
                <CardTitle className="font-headline text-base font-bold sm:text-lg">Páginas más visitadas</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Secciones con mayor tráfico en {stats.rangeLabel.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 p-4 pt-0 sm:p-6 sm:pt-0">
                {stats.topPages.map((page) => {
                  const maxViews = Math.max(1, ...stats.topPages.map((p) => p.views));
                  const pct = Math.round((page.views / maxViews) * 100);
                  return (
                    <div key={page.name} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <code className="min-w-0 truncate font-mono font-semibold text-foreground">{page.name}</code>
                        <span className="shrink-0 font-mono font-semibold text-primary tabular-nums">
                          {page.views.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#1D44B2] to-[#25D366]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>
        )}

        {/* 4. AL ÚLTIMO (solo admin): Enlaces con Referencias UTM (WhatsApp, Instagram, Facebook, Google) */}
        {isAdmin && (
        <Card className="rounded-3xl border-primary/12 bg-white shadow-xs">
          <CardHeader className="border-b border-border pb-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <CardTitle className="flex items-center gap-2 font-headline text-2xl font-bold">
                  <Link2 className="h-6 w-6 text-primary" />
                  Enlaces con Referencias para Copiar y Pegar
                </CardTitle>
                <CardDescription className="mt-1">
                  Compartí estos enlaces en WhatsApp, Instagram, Facebook o Google para atribuir cada visita a su canal y campaña exacta.
                </CardDescription>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-1">
                <Label htmlFor="base-origin" className="text-xs text-muted-foreground">
                  Dominio base del sitio
                </Label>
                <Input
                  id="base-origin"
                  value={baseOrigin}
                  onChange={(e) => setBaseOrigin(e.target.value)}
                  placeholder="https://tusitio.com.ar"
                  className="h-9 rounded-lg font-mono text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            {/* Constructor rápido de enlace personalizado */}
            <form onSubmit={handleCreateLink} className="rounded-2xl border border-primary/12 bg-[#F6F9FF] p-5">
              <h3 className="font-headline text-base font-bold">Crear nuevo enlace rastreable</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="space-y-2 md:col-span-4">
                  <Label className="text-xs">Canal de origen</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['whatsapp', 'instagram', 'facebook', 'google'] as const).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setNewChannel(ch)}
                        className={cn(
                          'rb-pill-interactive flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold',
                          newChannel === ch
                            ? 'border-primary bg-gradient-to-r from-[#002878] to-[#2349B6] text-white'
                            : 'border-border bg-white text-foreground hover:border-primary/45'
                        )}
                      >
                        <ChannelIcon channel={ch} className="h-4 w-4" />
                        {CHANNEL_META[ch].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="link-name" className="text-xs">
                    Nombre / Ubicación
                  </Label>
                  <Input
                    id="link-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Historia promo notebooks"
                    className="h-10 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="link-target" className="text-xs">
                    Página destino
                  </Label>
                  <select
                    id="link-target"
                    value={newTargetPath}
                    onChange={(e) => setNewTargetPath(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary"
                  >
                    {TARGET_ROUTES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="link-campaign" className="text-xs">
                    Campaña (opcional)
                  </Label>
                  <Input
                    id="link-campaign"
                    value={newCampaign}
                    onChange={(e) => setNewCampaign(e.target.value)}
                    placeholder="promo_nov"
                    className="h-10 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col items-stretch justify-between gap-3 rounded-xl border border-border bg-white p-3 sm:flex-row sm:items-center">
                <code className="truncate font-mono text-xs text-primary">{previewUrl}</code>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => copyText(previewUrl, 'preview-url')}
                  >
                    {copiedKey === 'preview-url' ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copiar
                      </>
                    )}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newName.trim() || isCreatingLink}
                    className="rounded-full"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {isCreatingLink ? 'Guardando...' : 'Guardar enlace'}
                  </Button>
                </div>
              </div>
              {!linksPersisted && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Podés copiar los enlaces al instante; para guardar nuevos enlaces personalizados verificá la tabla referral_links en Supabase.
                </p>
              )}
            </form>

            {/* Enlaces listos para copiar agrupados por canal */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(['whatsapp', 'instagram', 'facebook', 'google'] as const).map((channel) => {
                const channelLinks = links.filter((l) => l.channel === channel);
                const sourceStats = stats?.trafficSources.find((s) => s.channel === channel);
                return (
                  <div
                    key={channel}
                    className="flex flex-col rounded-2xl border border-primary/12 bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`grid h-8 w-8 place-items-center rounded-lg ${CHANNEL_META[channel].badge}`}>
                          <ChannelIcon channel={channel} className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="font-headline text-sm font-bold">{CHANNEL_META[channel].label}</h4>
                          <p className="font-mono text-xs text-muted-foreground tabular-nums">
                            {(sourceStats?.visits ?? 0).toLocaleString('es-AR')} visitas ·{' '}
                            {(sourceStats?.visitors ?? 0).toLocaleString('es-AR')} únicos
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-border p-2">
                      {channelLinks.length === 0 ? (
                        <p className="p-4 text-xs text-muted-foreground">
                          Todavía no hay enlaces guardados para {CHANNEL_META[channel].label}.
                        </p>
                      ) : (
                        channelLinks.map((link) => {
                          const fullUrl = buildTrackedUrl(link);
                          const copyId = `link-${link.id}-${link.ref_code}`;
                          const refHits = stats?.refCounts?.[link.ref_code] ?? 0;

                          return (
                            <div
                              key={copyId}
                              className="flex flex-col gap-2 rounded-xl p-3 transition-colors hover:bg-surface/70"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-foreground">{link.name}</span>
                                <span className="shrink-0 rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs font-medium text-primary tabular-nums">
                                  {refHits} visitas
                                </span>
                              </div>
                              <code className="truncate rounded-lg bg-surface px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
                                {fullUrl}
                              </code>
                              <div className="flex items-center justify-between gap-2 pt-0.5">
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={copiedKey === copyId ? 'default' : 'outline'}
                                    className="h-8 rounded-full px-3 text-xs"
                                    onClick={() =>
                                      copyText(fullUrl, copyId, `Enlace de ${CHANNEL_META[channel].label} copiado.`)
                                    }
                                  >
                                    {copiedKey === copyId ? (
                                      <>
                                        <Check className="h-3.5 w-3.5" /> Copiado
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3.5 w-3.5" /> Copiar enlace
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    asChild
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full"
                                  >
                                    <a
                                      href={fullUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label="Probar enlace"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  </Button>
                                </div>

                                {link.id > 0 && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteLink(link.id)}
                                    aria-label="Eliminar enlace"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        )}
      </main>
    </div>
  );
}
