'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, ClipboardCheck, Plus, Printer, Sparkles } from 'lucide-react';
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
  const piezaAbierta = todas.find((p) => p.id === abierta);

  const cuantasConEstado = (valor: Estado | 'todas') =>
    valor === 'todas' ? delTipo.length : delTipo.filter((p) => revisionDe(p.id).estado === valor).length;
  const cuantasDeTipo = (valor: Tipo | 'todo') =>
    valor === 'todo' ? delEstado.length : delEstado.filter((p) => p.tipo === valor).length;

  const abrir = (id: string) => {
    setRecorrido(visibles.map((p) => p.id));
    setAbierta(id);
  };

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
        <section className="bg-brand-hero relative w-full overflow-hidden border-b border-border py-8 lg:py-10">
          <AuroraBackdrop variant="light" />
          <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col justify-between gap-5 px-4 sm:px-6 lg:flex-row lg:items-end lg:px-8">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/85 px-3 py-1 text-xs font-semibold text-primary shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Espacio de aprobación de piezas
              </div>
              <h1 className="flex items-center gap-3 font-headline text-3xl font-extrabold tracking-tight sm:text-4xl">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#002878] to-[#2349B6] text-white shadow-md shadow-primary/25">
                  <ClipboardCheck className="h-5 w-5" />
                </span>
                Revisión de contenido
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {piezas ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {aprobadas} de {piezas.length} aprobadas
                  </span>
                ) : (
                  'Publicaciones, historias, videos, portadas e ideas'
                )}
              </p>
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

        <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-7 sm:px-6 lg:px-8">
          {error && (
            <section role="alert" className="space-y-3 rounded-2xl border border-primary/15 bg-white p-6 text-center shadow-xs">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={cargar} className="rounded-full">
                Reintentar
              </Button>
            </section>
          )}

          <div className="space-y-5 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
            {/* Filtros móvil */}
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                Estado
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as Estado | 'todas')}
                  className="h-11 rounded-xl border border-primary/15 bg-white px-3 text-sm font-medium text-foreground shadow-xs outline-none focus:border-primary"
                >
                  {(['todas', ...ESTADOS] as const).map((valor) => (
                    <option key={valor} value={valor}>
                      {valor === 'todas' ? 'Todas' : FILTRO_ESTADO[valor]} ({cuantasConEstado(valor)})
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted-foreground">
                Tipo
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as Tipo | 'todo')}
                  className="h-11 rounded-xl border border-primary/15 bg-white px-3 text-sm font-medium text-foreground shadow-xs outline-none focus:border-primary"
                >
                  {TIPOS.map((valor) => (
                    <option key={valor} value={valor}>
                      {valor === 'todo' ? 'Todo' : FILTRO_TIPO[valor]} ({cuantasDeTipo(valor)})
                    </option>
                  ))}
                </select>
              </label>
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

            {/* Grilla de piezas */}
            <div>
              {!piezas && !error && (
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-3" aria-label="Cargando piezas">
                  {Array.from({ length: 6 }, (_, i) => (
                    <SkeletonBox key={i} className="aspect-[9/16] rounded-2xl" />
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

              <div className="grid grid-cols-2 items-start gap-4 sm:gap-5 xl:grid-cols-3">
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
                          'min-w-0 overflow-hidden rounded-2xl border-4 bg-white shadow-xs transition-all duration-300 ease-expo hover:-translate-y-1 hover:shadow-xl',
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
                          <div className="space-y-2 border-t border-border/70 bg-white p-2.5">
                            {detalles.length > 0 && <p className="text-xs text-muted-foreground">{detalles.join(' · ')}</p>}
                            {imprimible && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full rounded-xl"
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
