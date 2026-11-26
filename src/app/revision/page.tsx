'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Layers,
  Plus,
  Printer,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand-logo';
import { AuroraBackdrop } from '@/components/react-bits';
import { SkeletonBox } from '@/components/skeletons';
import { cn } from '@/lib/utils';
import { ESTADOS, REVISION_VACIA, type Estado, type Pieza as DatosPieza, type Revision, type Tipo } from '@/lib/revision-tipos';
import { BORDE_ESTADO, NOMBRE_TIPO, ORDEN_ESTADO, hayTextoCorregido } from './comun';
import { Cargar } from './cargar';
import { Detalle } from './detalle';
import { MarcaEstado } from './estado';
import { imprimir } from './imprimir';
import { Pieza } from './lamina';

const FILTRO_ESTADO: Record<Estado, string> = {
  pendiente: 'Pendientes',
  correcciones: 'Con correcciones',
  aprobado: 'Aprobadas',
  desaprobado: 'Desaprobadas',
};
const FILTRO_TIPO: Record<Tipo, string> = {
  publicacion: 'Publicaciones',
  historia: 'Historias',
  video: 'Videos',
  idea: 'Ideas',
  portada: 'Portadas web',
};
const TIPOS = ['todo', 'publicacion', 'historia', 'video', 'idea', 'portada'] as const;
const CLAVE_GUARDADA = 'dm-revision-clave';

function Filtro({
  activo,
  alElegir,
  children,
  cuantas,
}: {
  activo: boolean;
  alElegir: () => void;
  children: React.ReactNode;
  cuantas: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={alElegir}
      className={cn(
        'rb-pill-interactive flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-all',
        activo
          ? 'bg-gradient-to-r from-[#002878] via-[#00308F] to-[#2349B6] font-semibold text-white shadow-sm shadow-primary/25'
          : 'text-muted-foreground hover:bg-[#EEF4FF] hover:text-primary',
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 font-mono text-xs tabular-nums',
          activo ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
        )}
      >
        {cuantas}
      </span>
    </button>
  );
}

type OpcionSelector<T extends string> = {
  value: T;
  label: string;
  count: number;
};

function SelectorFiltro<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: T;
  options: OpcionSelector<T>[];
  onChange: (next: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-2xl border bg-white px-3.5 py-2.5 text-left shadow-xs transition-all duration-200',
          open
            ? 'border-primary ring-4 ring-primary/10'
            : 'border-primary/15 hover:border-primary/40',
        )}
      >
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary/75">
            {icon}
            {label}
          </span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">{selected?.label}</span>
            <span className="shrink-0 rounded-full bg-[#EEF4FF] px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary tabular-nums">
              {selected?.count ?? 0}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-primary/70 transition-transform duration-200',
            open && 'rotate-180 text-primary',
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-primary/15 bg-white/98 p-1.5 shadow-[0_20px_48px_-16px_rgba(0,48,143,0.28)] backdrop-blur-xl"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                  active
                    ? 'bg-gradient-to-r from-[#002878] via-[#00308F] to-[#2349B6] font-semibold text-white'
                    : 'font-medium text-foreground hover:bg-[#EEF4FF] hover:text-primary',
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Check className={cn('h-3.5 w-3.5 shrink-0', active ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{opt.label}</span>
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 font-mono text-xs tabular-nums',
                    active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RevisionPage() {
  const [clave, setClave] = useState<string | null>(null);
  const [piezas, setPiezas] = useState<DatosPieza[] | null>(null);
  const [revisiones, setRevisiones] = useState<Record<string, Revision>>({});
  const [error, setError] = useState('');
  const [estado, setEstado] = useState<Estado | 'todas'>('todas');
  const [tipo, setTipo] = useState<Tipo | 'todo'>('todo');
  const [abierta, setAbierta] = useState<string | null>(null);
  // Orden al abrir una pieza: guardar no cambia a cuál llevan las flechas.
  const [recorrido, setRecorrido] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  // La clave va después del # del enlace: el navegador no la manda al servidor ni queda en registros.
  useEffect(() => {
    const deEnlace = window.location.hash.slice(1);
    let guardada = '';
    try {
      if (deEnlace) localStorage.setItem(CLAVE_GUARDADA, deEnlace);
      guardada = localStorage.getItem(CLAVE_GUARDADA) ?? '';
    } catch {}
    setClave(deEnlace || guardada);
  }, []);

  const cargar = useCallback(async () => {
    if (clave === null) return;
    setError('');
    try {
      const respuesta = await fetch('/api/revision', { headers: { 'x-revision-clave': clave }, cache: 'no-store' });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error);
      setPiezas(datos.piezas);
      setRevisiones(datos.revisiones);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'No se pudieron cargar las piezas.');
    }
  }, [clave]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const revisionDe = (id: string) => revisiones[id] ?? REVISION_VACIA;
  const todas = piezas ?? [];
  const delTipo = todas.filter((p) => tipo === 'todo' || p.tipo === tipo);
  const delEstado = todas.filter((p) => estado === 'todas' || revisionDe(p.id).estado === estado);
  // Sin filtro de estado, primero las pendientes. El orden por fecha se conserva dentro de cada estado.
  const visibles = delTipo
    .filter((p) => estado === 'todas' || revisionDe(p.id).estado === estado)
    .sort((a, b) => ORDEN_ESTADO[revisionDe(a.id).estado] - ORDEN_ESTADO[revisionDe(b.id).estado]);

  const aprobadas = todas.filter((p) => revisionDe(p.id).estado === 'aprobado').length;
  const pendientes = todas.filter((p) => revisionDe(p.id).estado === 'pendiente').length;
  const piezaAbierta = todas.find((p) => p.id === abierta);

  const cuantasConEstado = (valor: Estado | 'todas') =>
    valor === 'todas' ? delTipo.length : delTipo.filter((p) => revisionDe(p.id).estado === valor).length;
  const cuantasDeTipo = (valor: Tipo | 'todo') =>
    valor === 'todo' ? delEstado.length : delEstado.filter((p) => p.tipo === valor).length;

  const abrir = (id: string) => {
    setRecorrido(visibles.map((p) => p.id));
    setAbierta(id);
  };

  const opcionesEstado: OpcionSelector<Estado | 'todas'>[] = (['todas', ...ESTADOS] as const).map((valor) => ({
    value: valor,
    label: valor === 'todas' ? 'Todas' : FILTRO_ESTADO[valor],
    count: cuantasConEstado(valor),
  }));

  const opcionesTipo: OpcionSelector<Tipo | 'todo'>[] = TIPOS.map((valor) => ({
    value: valor,
    label: valor === 'todo' ? 'Todo' : FILTRO_TIPO[valor],
    count: cuantasDeTipo(valor),
  }));

  return (
    <div className="bg-brand-mist min-h-screen w-full">
      {/* Con una pieza abierta la lista se oculta para que no se transparente bajo el encabezado. */}
      <div className={cn((piezaAbierta || cargando) && 'invisible')}>
        {/* Barra superior exclusiva: solo marca + botón para alternar con Estadísticas */}
        <header className="sticky top-0 z-40 w-full border-b border-primary/12 bg-white/90 shadow-[0_6px_24px_-16px_rgba(0,48,143,0.16)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#00308F] via-[#3B6AF0] to-[#00308F] opacity-80" />
          <div className="mx-auto flex h-[70px] w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center">
                <BrandLogo size="md" />
              </span>
              <span className="hidden rounded-full border border-primary/15 bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
                Revisión de Contenido
              </span>
            </div>
            <Button asChild size="sm" className="h-10 rounded-full px-5 text-xs font-semibold sm:text-sm">
              <Link href="/admin/estadisticas">
                <BarChart3 className="h-4 w-4" />
                Ver Estadísticas
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Hero editorial institucional */}
        <section className="bg-brand-hero relative w-full overflow-hidden border-b border-border py-6 sm:py-8 lg:py-10">
          <AuroraBackdrop variant="light" />
          <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col justify-between gap-4 px-4 sm:gap-5 sm:px-6 lg:flex-row lg:items-end lg:px-8">
            <div>
              <h1 className="flex items-center gap-2.5 font-headline text-2xl font-extrabold tracking-tight sm:gap-3 sm:text-4xl">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#002878] to-[#2349B6] text-white shadow-md shadow-primary/25 sm:h-11 sm:w-11 sm:rounded-2xl">
                  <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                Revisión de contenido
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {piezas ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {aprobadas} de {piezas.length} aprobadas
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      <Clock className="h-3.5 w-3.5" />
                      {pendientes} {pendientes === 1 ? 'pendiente' : 'pendientes'}
                    </span>
                  </>
                ) : (
                  'Publicaciones, historias, videos, portadas e ideas'
                )}
              </div>
            </div>

            {piezas && (
              <div className="flex flex-wrap items-center gap-2">
                <Button size="lg" className="w-full rounded-full px-6 sm:w-auto" onClick={() => setCargando(true)}>
                  <Plus className="h-5 w-5" />
                  Cargar contenido o idea
                </Button>
              </div>
            )}
          </div>
        </section>

        <main className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-7 lg:px-8">
          {error && (
            <section role="alert" className="space-y-3 rounded-2xl border border-primary/15 bg-white p-6 text-center shadow-xs">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={cargar} className="rounded-full">
                Reintentar
              </Button>
            </section>
          )}

          <div className="space-y-5 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
            {/* Selectores propios estilizados para móvil */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              <SelectorFiltro
                label="Estado"
                icon={<SlidersHorizontal className="h-3 w-3" />}
                value={estado}
                options={opcionesEstado}
                onChange={setEstado}
              />
              <SelectorFiltro
                label="Tipo"
                icon={<Layers className="h-3 w-3" />}
                value={tipo}
                options={opcionesTipo}
                onChange={setTipo}
              />
            </div>

            {/* Sidebar filtros desktop */}
            <aside className="sticky top-24 hidden space-y-5 rounded-3xl border border-primary/12 bg-white/95 p-5 shadow-xs backdrop-blur-md lg:block">
              <div>
                <h2 className="mb-3 border-b border-border pb-2 font-headline text-sm font-bold uppercase tracking-wider text-primary">
                  Estado
                </h2>
                <div className="flex flex-col gap-1" role="group" aria-label="Estado">
                  {(['todas', ...ESTADOS] as const).map((valor) => (
                    <Filtro key={valor} activo={estado === valor} alElegir={() => setEstado(valor)} cuantas={cuantasConEstado(valor)}>
                      {valor === 'todas' ? 'Todas' : FILTRO_ESTADO[valor]}
                    </Filtro>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-3 border-b border-border pb-2 font-headline text-sm font-bold uppercase tracking-wider text-primary">
                  Tipo de pieza
                </h2>
                <div className="flex flex-col gap-1" role="group" aria-label="Tipo">
                  {TIPOS.map((valor) => (
                    <Filtro key={valor} activo={tipo === valor} alElegir={() => setTipo(valor)} cuantas={cuantasDeTipo(valor)}>
                      {valor === 'todo' ? 'Todo' : FILTRO_TIPO[valor]}
                    </Filtro>
                  ))}
                </div>
              </div>
            </aside>

            {/* Grilla tipo Masonry sin huecos vacíos entre piezas de distinto formato */}
            <div>
              {!piezas && !error && (
                <div className="columns-2 gap-3.5 sm:gap-5 xl:columns-3" aria-label="Cargando piezas">
                  {Array.from({ length: 6 }, (_, i) => (
                    <SkeletonBox
                      key={i}
                      className={cn(
                        'mb-3.5 w-full break-inside-avoid rounded-2xl sm:mb-5',
                        i % 2 === 0 ? 'aspect-[9/16]' : 'aspect-[4/5]',
                      )}
                    />
                  ))}
                </div>
              )}

              {piezas && visibles.length === 0 && (
                <section className="space-y-3 rounded-3xl border border-primary/12 bg-white p-10 text-center shadow-xs">
                  <p className="text-sm text-muted-foreground">
                    {tipo === 'portada'
                      ? 'Todavía no hay portadas para el inicio de la web cargadas.'
                      : 'No hay piezas con esos filtros.'}
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setEstado('todas');
                      setTipo('todo');
                    }}
                  >
                    Ver todas
                  </Button>
                </section>
              )}

              <div className="columns-2 gap-3.5 sm:gap-5 xl:columns-3">
                {clave !== null &&
                  visibles.map((pieza) => {
                    const revision = revisionDe(pieza.id);
                    const [primera] = pieza.laminas;
                    const descripcion = revision.descripcion ?? pieza.descripcion;
                    const imprimible = Boolean(primera) && !primera.archivo?.mime.startsWith('video/');
                    const detalles = [
                      pieza.aporte?.autor && `Cargado por ${pieza.aporte.autor}`,
                      hayTextoCorregido(revision) && 'Texto corregido',
                      revision.nota && 'Con nota',
                    ].filter(Boolean) as string[];
                    return (
                      <article
                        key={pieza.id}
                        data-id={pieza.id}
                        className={cn(
                          'mb-3.5 inline-block w-full break-inside-avoid overflow-hidden rounded-2xl border-4 bg-white shadow-xs transition-all duration-300 ease-expo hover:-translate-y-1 hover:shadow-xl sm:mb-5',
                          BORDE_ESTADO[revision.estado],
                        )}
                      >
                        <MarcaEstado estado={revision.estado} className="px-3 py-2 text-xs font-semibold sm:text-sm" />
                        <div className="relative" style={{ aspectRatio: primera ? `${primera.ancho} / ${primera.alto}` : '4 / 5' }}>
                          {primera ? (
                            <Pieza lamina={primera} clave={clave} nombre={pieza.titulo} cambios={revision.textos[primera.id]} />
                          ) : (
                            <p className="h-full overflow-hidden whitespace-pre-wrap bg-amber-50 p-4 pt-11 text-base leading-snug">
                              {descripcion}
                            </p>
                          )}
                          <button
                            type="button"
                            className="absolute inset-0 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring"
                            onClick={() => abrir(pieza.id)}
                            aria-label={`Revisar ${pieza.titulo}`}
                          />
                          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-slate-950/75 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                            {NOMBRE_TIPO[pieza.tipo]}
                            {pieza.laminas.length > 1 ? `, ${pieza.laminas.length} imágenes` : ''}
                          </span>
                        </div>
                        {(detalles.length > 0 || imprimible) && (
                          <div
                            className={cn(
                              'space-y-2 border-t border-border/70 bg-white p-2.5',
                              detalles.length === 0 && 'hidden sm:block',
                            )}
                          >
                            {detalles.length > 0 && <p className="text-xs text-muted-foreground">{detalles.join(' · ')}</p>}
                            {imprimible && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="hidden w-full rounded-xl sm:inline-flex"
                                onClick={() =>
                                  imprimir(pieza, revision.textos, clave).catch(() =>
                                    setError('No se pudo preparar la impresión.'),
                                  )
                                }
                              >
                                <Printer className="mr-1.5 h-4 w-4" /> Imprimir
                              </Button>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {cargando && clave !== null && (
        <Cargar
          clave={clave}
          alCerrar={() => setCargando(false)}
          alTerminar={() => {
            setCargando(false);
            setEstado('todas');
            setTipo('todo');
            cargar();
          }}
        />
      )}

      {piezaAbierta && clave !== null && (
        <Detalle
          piezas={recorrido.flatMap((id) => todas.filter((p) => p.id === id))}
          actual={piezaAbierta.id}
          revisiones={revisiones}
          clave={clave}
          alGuardar={(id, revision) => setRevisiones((antes) => ({ ...antes, [id]: revision }))}
          alIr={setAbierta}
        />
      )}
    </div>
  );
}
