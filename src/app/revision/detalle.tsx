'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Printer, RotateCcw, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Estado, Pieza as DatosPieza, Revision } from '@/lib/revision-tipos';
import { NOMBRE_ESTADO, NOMBRE_TIPO } from './comun';
import { EditorMovil } from './editor-movil';
import { MarcaEstado } from './estado';
import { imprimir } from './imprimir';
import { Pieza } from './lamina';

const AUTOR_GUARDADO = 'dm-revision-autor';
// PC con mouse: se escribe sobre la pieza. El resto (celular, tableta) usa el campo grande.
const ESCRITORIO = '(min-width: 1024px) and (pointer: fine)';

type Borrador = { textos: Revision['textos']; descripcion: string; nota: string };
type Editando = { que: 'texto'; lamina: number; indice: number; original: string } | { que: 'descripcion' } | { que: 'nota' };

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
  const [escritorio] = useState(() => window.matchMedia(ESCRITORIO).matches);
  const [indice, setIndice] = useState(0);
  const [borrador, setBorrador] = useState<Borrador>({
    textos: revision.textos,
    descripcion: revision.descripcion ?? pieza.descripcion ?? '',
    nota: revision.nota,
  });
  const [historial, setHistorial] = useState<Borrador[]>([]);
  const ultimoPaso = useRef({ grupo: '', momento: 0 });
  const [editando, setEditando] = useState<Editando | null>(null);
  const [autor, setAutor] = useState('');
  const [base, setBase] = useState(revision.actualizado);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; mal?: boolean } | null>(null);

  const { textos, descripcion, nota } = borrador;
  const llevaDescripcion = pieza.descripcion !== null;
  const nombreDescripcion = pieza.tipo === 'idea' ? 'Idea' : 'Descripción';
  const descripcionNueva = !llevaDescripcion || descripcion === pieza.descripcion ? null : descripcion;
  const sinGuardar =
    nota !== revision.nota || descripcionNueva !== revision.descripcion || JSON.stringify(textos) !== JSON.stringify(revision.textos);
  const distintaDelOriginal = Object.keys(textos).length > 0 || descripcionNueva !== null;

  /** Un paso de "Deshacer" por cada campo tocado; lo que se escribe de corrido cuenta como uno solo. */
  function cambiar(parte: Partial<Borrador>, grupo: string) {
    const ahora = Date.now();
    if (ultimoPaso.current.grupo !== grupo || ahora - ultimoPaso.current.momento > 1200) {
      setHistorial((h) => [...h.slice(-99), borrador]);
    }
    ultimoPaso.current = { grupo, momento: ahora };
    setBorrador((b) => ({ ...b, ...parte }));
    setMensaje(null);
  }

  function cambiarTextos(laminaId: string, cambios: Record<string, string>) {
    const antes = textos[laminaId] ?? {};
    const tocado = [...new Set([...Object.keys(antes), ...Object.keys(cambios)])].find((i) => antes[i] !== cambios[i]);
    if (tocado === undefined) return;
    const nuevos = { ...textos };
    if (Object.keys(cambios).length) nuevos[laminaId] = cambios;
    else delete nuevos[laminaId];
    cambiar({ textos: nuevos }, `${laminaId}:${tocado}`);
  }

  function deshacer() {
    const previo = historial.at(-1);
    if (!previo) return;
    setHistorial(historial.slice(0, -1));
    setBorrador(previo);
    ultimoPaso.current = { grupo: '', momento: 0 };
  }

  /** Vuelve la pieza a como se produjo. También se puede deshacer. */
  function deshacerTodo() {
    ultimoPaso.current = { grupo: '', momento: 0 };
    cambiar({ textos: {}, descripcion: pieza.descripcion ?? '' }, 'todo');
    ultimoPaso.current = { grupo: '', momento: 0 };
  }

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
  const hayCorrecciones = Boolean(nota.trim()) || distintaDelOriginal;
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

  const editables = pieza.laminas.some((l) => l.html);
  const imprimible = pieza.laminas.length > 0 && pieza.laminas.every((l) => !l.archivo?.mime.startsWith('video/'));
  const copiar = () => navigator.clipboard.writeText(descripcion).then(() => setMensaje({ texto: 'Copiado.' }));
  const laminaEditada = editando?.que === 'texto' ? pieza.laminas[editando.lamina] : null;

  return (
    <section aria-label={pieza.titulo} className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-1">
      <div className="flex min-h-0 flex-1 flex-col" style={{ backgroundColor: 'rgb(217 225 242 / 30%)' }}>
        <div className="flex items-center gap-1 border-b bg-white px-2 py-1.5">
          <Button variant="ghost" size="icon" onClick={() => salir(null)} aria-label="Volver a la lista"><X /></Button>
          <MarcaEstado estado={revision.estado} className="rounded-full px-3 py-1 text-sm" />
          <span className="min-w-0 flex-1 truncate pl-1 text-sm text-muted-foreground">{pieza.aporte?.autor ? `${NOMBRE_TIPO[pieza.tipo]} de ${pieza.aporte.autor}` : NOMBRE_TIPO[pieza.tipo]}</span>
          {imprimible && (
            <Button variant="outline" size="sm" aria-label="Imprimir" onClick={() => imprimir(pieza, textos, clave).catch(() => setMensaje({ texto: 'No se pudo preparar la impresión.', mal: true }))}>
              <Printer className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Imprimir</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" disabled={!anterior} onClick={() => salir(anterior!)} aria-label="Pieza anterior"><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" disabled={!siguiente} onClick={() => salir(siguiente!)} aria-label="Pieza siguiente"><ChevronRight /></Button>
        </div>

        {editables && (
          <p className="px-3 pt-2 text-center text-sm text-muted-foreground">
            {escritorio ? 'Hacé clic en cualquier texto de la imagen y escribí encima.' : 'Tocá un texto de la imagen para cambiarlo.'}
          </p>
        )}

        {pieza.laminas.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            <p className="max-h-full w-full max-w-xl overflow-hidden whitespace-pre-wrap rounded-2xl border bg-white p-6 text-lg shadow-sm">{descripcion}</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-3 p-3">
            {pieza.laminas.map((lamina, i) => (
              <div key={lamina.id} className={cn('min-h-0 min-w-0 flex-1', i !== indice && 'hidden lg:block')}>
                <Pieza
                  lamina={lamina}
                  clave={clave}
                  nombre={`${pieza.titulo}, imagen ${i + 1}`}
                  conControles
                  cambios={textos[lamina.id]}
                  alCambiar={escritorio ? (cambios) => cambiarTextos(lamina.id, cambios) : undefined}
                  alTocar={escritorio ? undefined : (n, original) => setEditando({ que: 'texto', lamina: i, indice: n, original })}
                />
              </div>
            ))}
          </div>
        )}

        {pieza.laminas.length > 1 && (
          <div className="flex justify-center gap-2 pb-2 lg:hidden">
            {pieza.laminas.map((lamina, i) => (
              <Button key={lamina.id} size="sm" variant={i === indice ? 'default' : 'outline'} onClick={() => setIndice(i)}>Imagen {i + 1}</Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-col gap-2 border-t bg-white p-3 lg:gap-3 lg:border-l lg:border-t-0 lg:p-4">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" disabled={!historial.length} onClick={deshacer}>
            <Undo2 className="mr-1.5 h-4 w-4" /> Deshacer
          </Button>
          <Button variant="outline" size="sm" disabled={!distintaDelOriginal} onClick={deshacerTodo}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Deshacer todo
          </Button>
        </div>

        {/* Celular: los campos se abren en grande al tocarlos. */}
        <div className={cn('grid gap-2 lg:hidden', llevaDescripcion ? 'grid-cols-2' : 'grid-cols-1')}>
          {llevaDescripcion && <Button variant="secondary" onClick={() => setEditando({ que: 'descripcion' })}>Editar {nombreDescripcion.toLowerCase()}</Button>}
          <Button variant="secondary" onClick={() => setEditando({ que: 'nota' })}>{nota.trim() ? 'Ver nota' : 'Agregar nota'}</Button>
        </div>

        {llevaDescripcion && (
          <div className="hidden min-h-0 flex-[2] flex-col gap-1 lg:flex">
            <div className="flex items-center justify-between">
              <label htmlFor="descripcion" className="text-sm font-semibold">{nombreDescripcion}</label>
              <Button variant="ghost" size="sm" className="h-7" onClick={copiar}><Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar</Button>
            </div>
            <Textarea id="descripcion" value={descripcion} maxLength={4000} onChange={(e) => cambiar({ descripcion: e.target.value }, 'descripcion')} className="min-h-0 flex-1 resize-none" />
          </div>
        )}

        <div className="hidden min-h-0 flex-1 flex-col gap-1 lg:flex">
          <label htmlFor="nota" className="text-sm font-semibold">Nota</label>
          <Textarea id="nota" value={nota} maxLength={4000} placeholder="Qué cambiar, dudas o comentarios" onChange={(e) => cambiar({ nota: e.target.value }, 'nota')} className="min-h-0 flex-1 resize-none" />
        </div>

        <Input aria-label="Tu nombre (opcional)" placeholder="Tu nombre (opcional)" value={autor} maxLength={60} onChange={(e) => setAutor(e.target.value)} className="h-10" />

        {(mensaje || sinGuardar) && (
          <p role="status" className={cn('text-sm text-muted-foreground', mensaje?.mal && 'font-semibold text-destructive')}>
            {mensaje?.texto ?? 'Cambios sin guardar.'}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="px-2 text-destructive" disabled={guardando} onClick={() => guardar('desaprobado')}>Desaprobar</Button>
          <Button className="px-2" disabled={guardando || !sinGuardar} onClick={() => guardar(estadoAlGuardar)}>Guardar</Button>
          <Button className="bg-green-700 px-2 text-white hover:bg-green-800" disabled={guardando} onClick={() => guardar('aprobado')}>Aprobar</Button>
        </div>
      </div>

      {editando?.que === 'texto' && laminaEditada && (
        <EditorMovil
          titulo="Texto de la imagen"
          maximo={600}
          valor={textos[laminaEditada.id]?.[editando.indice] ?? editando.original}
          alCambiar={(valor) => {
            const cambios = { ...textos[laminaEditada.id] };
            if (valor === editando.original) delete cambios[editando.indice];
            else cambios[editando.indice] = valor;
            cambiarTextos(laminaEditada.id, cambios);
          }}
          alCerrar={() => setEditando(null)}
        >
          <Pieza
            lamina={laminaEditada}
            clave={clave}
            nombre={pieza.titulo}
            cambios={textos[laminaEditada.id]}
            activo={editando.indice}
            alTocar={(n, original) => setEditando({ ...editando, indice: n, original })}
          />
        </EditorMovil>
      )}
      {editando?.que === 'descripcion' && (
        <EditorMovil titulo={nombreDescripcion} maximo={4000} valor={descripcion} alCambiar={(v) => cambiar({ descripcion: v }, 'descripcion')} alCerrar={() => setEditando(null)} />
      )}
      {editando?.que === 'nota' && (
        <EditorMovil titulo="Nota" maximo={4000} valor={nota} alCambiar={(v) => cambiar({ nota: v }, 'nota')} alCerrar={() => setEditando(null)} />
      )}
    </section>
  );
}
