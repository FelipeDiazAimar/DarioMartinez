'use client';

import { useCallback, useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ESTADOS, REVISION_VACIA, type Estado, type Pieza as DatosPieza, type Revision, type Tipo } from '@/lib/revision-tipos';
import { COLOR_ESTADO, NOMBRE_ESTADO, NOMBRE_TIPO, ORDEN_ESTADO, fechaCorta, hayTextoCorregido } from './comun';
import { Detalle } from './detalle';
import { imprimir } from './imprimir';
import { Pieza } from './lamina';

const FILTRO_ESTADO: Record<Estado, string> = {
  pendiente: 'Pendientes',
  correcciones: 'Con correcciones',
  aprobado: 'Aprobadas',
  desaprobado: 'Desaprobadas',
};
const FILTRO_TIPO: Record<Tipo, string> = { publicacion: 'Publicaciones', historia: 'Historias', portada: 'Portadas web' };
const CLAVE_GUARDADA = 'dm-revision-clave';

function Filtro({ activo, alElegir, children, cuantas }: { activo: boolean; alElegir: () => void; children: React.ReactNode; cuantas: number }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={alElegir}
      className={cn(
        'flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors',
        activo ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
      <span className="tabular-nums">{cuantas}</span>
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
  const posicion = abierta ? recorrido.indexOf(abierta) : -1;

  const abrir = (id: string) => {
    setRecorrido(visibles.map((p) => p.id));
    setAbierta(id);
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'rgb(217 225 242 / 30%)' }}>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
        <div className="space-y-2 py-4 text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Revisión de contenido</h1>
          <p className="text-foreground/80">
            {piezas ? `${aprobadas} de ${piezas.length} aprobadas` : 'Publicaciones, historias y portadas'}
          </p>
        </div>

        {error && (
          <section role="alert" className="space-y-3 rounded-2xl border bg-white p-6 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={cargar}>Reintentar</Button>
          </section>
        )}

        <div className="space-y-4 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
          <aside className="space-y-3 rounded-2xl border bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:p-4">
            <div>
              <h2 className="mb-2 hidden border-b pb-2 text-lg font-semibold lg:block">Estado</h2>
              <div className="flex gap-1 overflow-x-auto lg:flex-col" role="group" aria-label="Estado">
                {(['todas', ...ESTADOS] as const).map((valor) => (
                  <Filtro key={valor} activo={estado === valor} alElegir={() => setEstado(valor)} cuantas={valor === 'todas' ? delTipo.length : delTipo.filter((p) => revisionDe(p.id).estado === valor).length}>
                    {valor === 'todas' ? 'Todas' : FILTRO_ESTADO[valor]}
                  </Filtro>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-2 hidden border-b pb-2 text-lg font-semibold lg:block">Tipo</h2>
              <div className="flex gap-1 overflow-x-auto lg:flex-col" role="group" aria-label="Tipo">
                {(['todo', 'publicacion', 'historia', 'portada'] as const).map((valor) => (
                  <Filtro key={valor} activo={tipo === valor} alElegir={() => setTipo(valor)} cuantas={valor === 'todo' ? delEstado.length : delEstado.filter((p) => p.tipo === valor).length}>
                    {valor === 'todo' ? 'Todo' : FILTRO_TIPO[valor]}
                  </Filtro>
                ))}
              </div>
            </div>
          </aside>

          <div>
            {!piezas && !error && (
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3" aria-label="Cargando piezas">
                {Array.from({ length: 6 }, (_, i) => <div key={i} className="dm-skeleton aspect-[9/16] rounded-2xl" />)}
              </div>
            )}

            {piezas && visibles.length === 0 && (
              <section className="space-y-3 rounded-2xl border bg-white p-6 text-center">
                <p className="text-muted-foreground">
                  {tipo === 'portada' ? 'Todavía no hay portadas para el inicio de la web cargadas.' : 'No hay piezas con esos filtros.'}
                </p>
                <Button variant="outline" onClick={() => { setEstado('todas'); setTipo('todo'); }}>Ver todas</Button>
              </section>
            )}

            <div className="grid grid-cols-2 items-start gap-3 sm:gap-5 xl:grid-cols-3">
              {clave !== null && visibles.map((pieza) => {
                const revision = revisionDe(pieza.id);
                const [primera] = pieza.laminas;
                return (
                  <article key={pieza.id} className="group min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative" style={{ aspectRatio: `${primera.ancho} / ${primera.alto}` }}>
                      <Pieza lamina={primera} clave={clave} nombre={pieza.titulo} cambios={revision.textos[primera.id] ?? {}} />
                      <button type="button" className="absolute inset-0 focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring" onClick={() => abrir(pieza.id)} aria-label={`Revisar ${pieza.titulo}`} />
                      {pieza.laminas.length > 1 && (
                        <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{pieza.laminas.length} imágenes</span>
                      )}
                    </div>
                    <div className="space-y-2 border-t p-3">
                      <div>
                        <h3 className="font-semibold leading-tight">{pieza.titulo}</h3>
                        <p className="text-sm text-muted-foreground">
                          {NOMBRE_TIPO[pieza.tipo]}{pieza.dia ? `, ${fechaCorta(pieza.dia).toLowerCase()} ${pieza.hora}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', COLOR_ESTADO[revision.estado])}>{NOMBRE_ESTADO[revision.estado]}</span>
                        {hayTextoCorregido(revision) && <span className="text-xs text-muted-foreground">Texto corregido</span>}
                        {revision.nota && <span className="text-xs text-muted-foreground">Con nota</span>}
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => imprimir(pieza, revision.textos, clave).catch(() => setError('No se pudo preparar la impresión.'))}>
                        <Printer className="mr-1.5 h-4 w-4" /> Imprimir
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {piezaAbierta && clave !== null && (
        <Detalle
          key={piezaAbierta.id}
          pieza={piezaAbierta}
          revision={revisionDe(piezaAbierta.id)}
          clave={clave}
          anterior={recorrido[posicion - 1]}
          siguiente={recorrido[posicion + 1]}
          alGuardar={(revision) => setRevisiones((antes) => ({ ...antes, [piezaAbierta.id]: revision }))}
          alIr={setAbierta}
        />
      )}
    </div>
  );
}
