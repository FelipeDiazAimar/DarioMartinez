'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Printer, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Estado, Pieza as DatosPieza, Revision } from '@/lib/revision-tipos';
import { COLOR_ESTADO, NOMBRE_ESTADO, NOMBRE_TIPO, fechaCorta } from './comun';
import { imprimir } from './imprimir';
import { Pieza } from './lamina';

const AUTOR_GUARDADO = 'dm-revision-autor';

type Props = {
  pieza: DatosPieza;
  revision: Revision;
  clave: string;
  anterior?: string;
  siguiente?: string;
  alGuardar: (revision: Revision) => void;
  alIr: (id: string | null) => void;
};

/** Vista de acotaciones: todo a la vista, debajo del encabezado del sitio y sin desplazarse. */
export function Detalle({ pieza, revision, clave, anterior, siguiente, alGuardar, alIr }: Props) {
  const [indice, setIndice] = useState(0);
  const [pestana, setPestana] = useState<'descripcion' | 'nota'>(pieza.descripcion === null ? 'nota' : 'descripcion');
  const [nota, setNota] = useState(revision.nota);
  const [descripcion, setDescripcion] = useState(revision.descripcion ?? pieza.descripcion ?? '');
  const [textos, setTextos] = useState(revision.textos);
  const [autor, setAutor] = useState('');
  const [base, setBase] = useState(revision.actualizado);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; mal?: boolean } | null>(null);

  const descripcionNueva = pieza.descripcion === null || descripcion === pieza.descripcion ? null : descripcion;
  const sinGuardar =
    nota !== revision.nota || descripcionNueva !== revision.descripcion || JSON.stringify(textos) !== JSON.stringify(revision.textos);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    try {
      setAutor(localStorage.getItem(AUTOR_GUARDADO) ?? '');
    } catch {}
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!sinGuardar) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [sinGuardar]);

  const salir = (destino: string | null) => {
    if (sinGuardar && !window.confirm('Hay cambios sin guardar. ¿Salir igual?')) return;
    alIr(destino);
  };

  // Guardar con correcciones o nota deja la pieza "con correcciones", salvo que ya esté desaprobada.
  const hayCorrecciones = Boolean(nota.trim()) || descripcionNueva !== null || Object.keys(textos).length > 0;
  const estadoAlGuardar: Estado = revision.estado === 'desaprobado' ? 'desaprobado' : hayCorrecciones ? 'correcciones' : 'pendiente';

  async function guardar(estado: Estado) {
    setGuardando(true);
    setMensaje(null);
    try {
      localStorage.setItem(AUTOR_GUARDADO, autor);
    } catch {}
    try {
      const respuesta = await fetch('/api/revision/pieza', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-revision-clave': clave },
        body: JSON.stringify({ id: pieza.id, estado, nota, descripcion: descripcionNueva, textos, autor, base }),
      });
      const datos = await respuesta.json();
      if (respuesta.status === 409) {
        alGuardar(datos.actual);
        setBase(datos.actual.actualizado);
        setMensaje({ texto: `${datos.error} Lo tuyo sigue acá: revisalo y volvé a guardar.`, mal: true });
        return;
      }
      if (!respuesta.ok) throw new Error(datos.error);
      alGuardar(datos.revision);
      setBase(datos.revision.actualizado);
      setMensaje({ texto: estado === 'aprobado' ? 'Aprobada y guardada.' : `Guardada como "${NOMBRE_ESTADO[estado].toLowerCase()}".` });
    } catch (e) {
      setMensaje({ texto: e instanceof Error && e.message ? e.message : 'No se pudo guardar. Revisá la conexión.', mal: true });
    } finally {
      setGuardando(false);
    }
  }

  const firma = revision.actualizado
    ? `${revision.autor ? `${revision.autor}, ` : ''}${new Date(revision.actualizado).toLocaleString('es-AR', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    : '';

  return (
    <section aria-label={pieza.titulo} className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-1">
      <div className="flex min-h-0 flex-1 flex-col" style={{ backgroundColor: 'rgb(217 225 242 / 30%)' }}>
        <div className="flex items-center gap-1 border-b bg-white px-2 py-1.5">
          <Button variant="ghost" size="icon" onClick={() => salir(null)} aria-label="Volver a la lista"><X /></Button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold leading-tight">{pieza.titulo}</h2>
            <p className="truncate text-xs text-muted-foreground">
              {NOMBRE_TIPO[pieza.tipo]}{pieza.dia ? `, ${fechaCorta(pieza.dia).toLowerCase()} ${pieza.hora}` : ''}
            </p>
          </div>
          {Object.keys(textos).length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setTextos({})}>
              <RotateCcw className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Textos originales</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => imprimir(pieza, textos, clave).catch(() => setMensaje({ texto: 'No se pudo preparar la impresión.', mal: true }))}>
            <Printer className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Imprimir</span>
          </Button>
          <Button variant="ghost" size="icon" disabled={!anterior} onClick={() => salir(anterior!)} aria-label="Pieza anterior"><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" disabled={!siguiente} onClick={() => salir(siguiente!)} aria-label="Pieza siguiente"><ChevronRight /></Button>
        </div>

        <p className="px-3 pt-2 text-center text-sm text-muted-foreground">Tocá cualquier texto de la imagen y escribí encima.</p>

        <div className="flex min-h-0 flex-1 gap-3 p-3">
          {pieza.laminas.map((lamina, i) => (
            <div key={lamina.id} className={cn('min-h-0 min-w-0 flex-1', i !== indice && 'hidden lg:block')}>
              <Pieza
                lamina={lamina}
                clave={clave}
                nombre={`${pieza.titulo}, imagen ${i + 1}`}
                cambios={textos[lamina.id] ?? {}}
                alCambiar={(cambios) =>
                  setTextos((antes) => {
                    const nuevos = { ...antes };
                    if (Object.keys(cambios).length) nuevos[lamina.id] = cambios;
                    else delete nuevos[lamina.id];
                    return nuevos;
                  })
                }
              />
            </div>
          ))}
        </div>

        {pieza.laminas.length > 1 && (
          <div className="flex justify-center gap-2 pb-2 lg:hidden">
            {pieza.laminas.map((lamina, i) => (
              <Button key={lamina.id} size="sm" variant={i === indice ? 'default' : 'outline'} onClick={() => setIndice(i)}>Imagen {i + 1}</Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-col gap-2 border-t bg-white p-3 lg:gap-3 lg:border-l lg:border-t-0 lg:p-4">
        {pieza.descripcion !== null && (
          <>
            <div className="flex gap-2 lg:hidden">
              <Button size="sm" variant={pestana === 'descripcion' ? 'secondary' : 'ghost'} onClick={() => setPestana('descripcion')}>Descripción</Button>
              <Button size="sm" variant={pestana === 'nota' ? 'secondary' : 'ghost'} onClick={() => setPestana('nota')}>Nota</Button>
            </div>
            <div className={cn('flex min-h-0 flex-col gap-1 lg:flex lg:flex-[2]', pestana !== 'descripcion' && 'hidden')}>
              <div className="flex items-center justify-between">
                <label htmlFor="descripcion" className="text-sm font-semibold">Descripción</label>
                <div className="flex gap-1">
                  {descripcionNueva !== null && (
                    <Button variant="link" size="sm" className="h-7 px-1" onClick={() => setDescripcion(pieza.descripcion ?? '')}>Volver a la original</Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => navigator.clipboard.writeText(descripcion).then(() => setMensaje({ texto: 'Descripción copiada.' }))}>
                    <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar
                  </Button>
                </div>
              </div>
              <Textarea id="descripcion" value={descripcion} maxLength={4000} onChange={(e) => setDescripcion(e.target.value)} className="h-24 min-h-0 resize-none lg:h-auto lg:flex-1" />
            </div>
          </>
        )}

        <div className={cn('flex min-h-0 flex-col gap-1 lg:flex lg:flex-1', pestana !== 'nota' && 'hidden')}>
          <label htmlFor="nota" className="text-sm font-semibold">Nota</label>
          <Textarea id="nota" value={nota} maxLength={4000} placeholder="Qué cambiar, dudas o comentarios" onChange={(e) => setNota(e.target.value)} className="h-16 min-h-0 resize-none lg:h-auto lg:flex-1" />
        </div>

        <Input aria-label="Tu nombre (opcional)" placeholder="Tu nombre (opcional)" value={autor} maxLength={60} onChange={(e) => setAutor(e.target.value)} className="h-9" />

        <p role="status" className={cn('text-sm text-muted-foreground', mensaje?.mal && 'font-semibold text-destructive')}>
          {mensaje && !(sinGuardar && !mensaje.mal) ? (
            mensaje.texto
          ) : (
            <>
              <span className={cn('mr-2 rounded-full px-2.5 py-0.5 text-xs font-semibold', COLOR_ESTADO[revision.estado])}>{NOMBRE_ESTADO[revision.estado]}</span>
              {sinGuardar ? 'Cambios sin guardar' : firma}
            </>
          )}
        </p>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="px-2 text-destructive" disabled={guardando} onClick={() => guardar('desaprobado')}>Desaprobar</Button>
          <Button className="px-2" disabled={guardando || !sinGuardar} onClick={() => guardar(estadoAlGuardar)}>Guardar</Button>
          <Button className="bg-green-700 px-2 text-white hover:bg-green-800" disabled={guardando} onClick={() => guardar('aprobado')}>Aprobar</Button>
        </div>
      </div>
    </section>
  );
}
