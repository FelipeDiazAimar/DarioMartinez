'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, X } from 'lucide-react';
import type { Estado, Lamina, Pieza, Revision } from '@/lib/revision-tipos';
import { NOMBRE_ESTADO, NOMBRE_TIPO, nombreDia } from './comun';
import estilos from './revision.module.css';

const AUTOR_GUARDADO = 'dm-revision-autor';

type Props = {
  pieza: Pieza;
  revision: Revision;
  clave: string;
  /** Piezas entre las que se puede avanzar y retroceder. */
  lista: Pieza[];
  alGuardar: (revision: Revision) => void;
  alIr: (id: string | null) => void;
};

/** Textos visibles de la pieza, en el orden en que aparecen en el documento. */
function nodosDeTexto(doc: Document) {
  const recorrido = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const nodos: Text[] = [];
  while (recorrido.nextNode()) {
    const nodo = recorrido.currentNode as Text;
    if (nodo.nodeValue?.trim() && !nodo.parentElement?.closest('style,script')) nodos.push(nodo);
  }
  return nodos;
}

export function Detalle({ pieza, revision, clave, lista, alGuardar, alIr }: Props) {
  const [indice, setIndice] = useState(0);
  const [nota, setNota] = useState(revision.nota);
  const [descripcion, setDescripcion] = useState(revision.descripcion ?? pieza.descripcion ?? '');
  const [textos, setTextos] = useState(revision.textos);
  const [autor, setAutor] = useState('');
  const [base, setBase] = useState(revision.actualizado);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; mal?: boolean } | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialogo.current?.open) dialogo.current?.showModal();
    document.body.style.overflow = 'hidden';
    try {
      setAutor(localStorage.getItem(AUTOR_GUARDADO) ?? '');
    } catch {}
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const descripcionNueva = pieza.descripcion === null || descripcion === pieza.descripcion ? null : descripcion;
  const sinGuardar =
    nota !== revision.nota || descripcionNueva !== revision.descripcion || JSON.stringify(textos) !== JSON.stringify(revision.textos);

  const salir = (destino: string | null) => {
    if (sinGuardar && !window.confirm('Hay cambios sin guardar. ¿Salir igual?')) return;
    alIr(destino);
  };

  const posicion = lista.findIndex((p) => p.id === pieza.id);
  const anterior = lista[posicion - 1];
  const siguiente = lista[posicion + 1];

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
        setMensaje({ texto: `${datos.error} Lo que escribiste sigue acá: revisalo y volvé a guardar.`, mal: true });
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

  const lamina = pieza.laminas[indice];
  const firma = revision.actualizado
    ? `${revision.autor ? `${revision.autor}, ` : ''}${new Date(revision.actualizado).toLocaleString('es-AR', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    : '';

  return (
    <dialog
      ref={dialogo}
      className={estilos.detalle}
      aria-label={pieza.titulo}
      onCancel={(e) => {
        e.preventDefault();
        salir(null);
      }}
    >
      <div className={estilos.barra}>
        <button type="button" className={estilos.icono} onClick={() => salir(null)} aria-label="Volver a la lista"><X /></button>
        <div className={estilos.barraTitulo}>
          <h2>{pieza.titulo}</h2>
          <p>{NOMBRE_TIPO[pieza.tipo]}{pieza.dia ? `, ${nombreDia(pieza.dia).toLowerCase()} a las ${pieza.hora}` : ''}</p>
        </div>
        <button type="button" className={estilos.icono} disabled={!anterior} onClick={() => salir(anterior.id)} aria-label="Pieza anterior"><ChevronLeft /></button>
        <button type="button" className={estilos.icono} disabled={!siguiente} onClick={() => salir(siguiente.id)} aria-label="Pieza siguiente"><ChevronRight /></button>
      </div>

      <div className={estilos.cuerpo}>
        <Escenario
          key={lamina.id}
          lamina={lamina}
          clave={clave}
          cambios={textos[lamina.id] ?? {}}
          alCambiar={(cambios) =>
            setTextos((antes) => {
              const nuevos = { ...antes };
              if (Object.keys(cambios).length) nuevos[lamina.id] = cambios;
              else delete nuevos[lamina.id];
              return nuevos;
            })
          }
          paginas={pieza.laminas.length}
          pagina={indice}
          alPaginar={setIndice}
        />

        {pieza.descripcion !== null && (
          <section className={estilos.bloque} style={{ gridArea: 'descripcion' }}>
            <div className={estilos.encabezadoBloque}>
              <label htmlFor="descripcion">Descripción de la publicación</label>
              <button
                type="button"
                className={estilos.enlace}
                onClick={() => navigator.clipboard.writeText(descripcion).then(() => setMensaje({ texto: 'Descripción copiada.' }))}
              >
                <Copy aria-hidden /> Copiar
              </button>
            </div>
            <textarea id="descripcion" rows={12} value={descripcion} maxLength={4000} onChange={(e) => setDescripcion(e.target.value)} />
            {descripcionNueva !== null && (
              <button type="button" className={estilos.enlace} onClick={() => setDescripcion(pieza.descripcion ?? '')}>Volver a la original</button>
            )}
          </section>
        )}

        <section className={estilos.bloque} style={{ gridArea: 'nota' }}>
          <label htmlFor="nota">Nota</label>
          <textarea id="nota" rows={3} value={nota} maxLength={4000} placeholder="Qué cambiar, dudas o comentarios" onChange={(e) => setNota(e.target.value)} />
          <label htmlFor="autor">Tu nombre (opcional)</label>
          <input id="autor" value={autor} maxLength={60} onChange={(e) => setAutor(e.target.value)} />
        </section>
      </div>

      <footer className={estilos.acciones}>
        <p className={estilos.mensaje} role="status" data-mal={mensaje?.mal || undefined}>
          {mensaje && !(sinGuardar && !mensaje.mal) ? (
            mensaje.texto
          ) : (
            <>
              <span className={estilos.estado} data-estado={revision.estado}>{NOMBRE_ESTADO[revision.estado]}</span>{' '}
              {sinGuardar ? 'Cambios sin guardar' : firma}
            </>
          )}
        </p>
        <div className={estilos.botones}>
          <button type="button" className={estilos.rechazar} disabled={guardando} onClick={() => guardar('desaprobado')}>Desaprobar</button>
          <button type="button" className={estilos.boton} disabled={guardando || !sinGuardar} onClick={() => guardar(estadoAlGuardar)}>Guardar</button>
          <button type="button" className={estilos.aprobar} disabled={guardando} onClick={() => guardar('aprobado')}>Aprobar</button>
        </div>
      </footer>
    </dialog>
  );
}

type EscenarioProps = {
  lamina: Lamina;
  clave: string;
  cambios: Record<string, string>;
  alCambiar: (cambios: Record<string, string>) => void;
  paginas: number;
  pagina: number;
  alPaginar: (pagina: number) => void;
};

/** La pieza en grande y, si es editable, los campos de sus textos. */
function Escenario({ lamina, clave, cambios, alCambiar, paginas, pagina, alPaginar }: EscenarioProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [falla, setFalla] = useState('');
  const [originales, setOriginales] = useState<string[] | null>(null);
  const [escala, setEscala] = useState(0);
  const marco = useRef<HTMLIFrameElement>(null);
  const observador = useRef<ResizeObserver | null>(null);

  const medir = useCallback(
    (caja: HTMLDivElement | null) => {
      observador.current?.disconnect();
      if (!caja) return;
      observador.current = new ResizeObserver(([e]) =>
        setEscala(Math.min(e.contentRect.width / lamina.ancho, e.contentRect.height / lamina.alto)),
      );
      observador.current.observe(caja);
    },
    [lamina.ancho, lamina.alto],
  );

  useEffect(() => {
    if (!lamina.html) return;
    let vigente = true;
    fetch(`/api/revision/lamina?id=${encodeURIComponent(lamina.id)}`, { headers: { 'x-revision-clave': clave } })
      .then(async (r) => {
        const datos = await r.json();
        if (!r.ok) throw new Error(datos.error);
        if (vigente) setHtml(datos.html);
      })
      .catch(() => vigente && setFalla('No se pudo abrir el texto editable. Cerrá la pieza y volvé a entrar.'));
    return () => {
      vigente = false;
    };
  }, [lamina.id, lamina.html, clave]);

  useEffect(() => {
    const doc = marco.current?.contentDocument;
    if (!doc || !originales) return;
    nodosDeTexto(doc).forEach((nodo, i) => {
      const nuevo = cambios[i] ?? originales[i];
      // Un texto vaciado conserva un espacio para que la numeración de los demás no se corra.
      nodo.nodeValue = nuevo || '​';
    });
  }, [cambios, originales]);

  const sin = (i: number) => {
    const nuevos = { ...cambios };
    delete nuevos[i];
    return nuevos;
  };

  return (
    <>
      <div className={estilos.escenario}>
        <div className={estilos.lienzo} ref={medir}>
          <div className={estilos.caja} style={{ width: lamina.ancho * escala, height: lamina.alto * escala }}>
            {/* La imagen final queda de fondo hasta que el HTML editable termina de dibujarse. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lamina.url} alt="Pieza en grande" />
            {html && (
              <iframe
                ref={marco}
                title="Pieza con los textos editados"
                srcDoc={html}
                sandbox="allow-same-origin"
                tabIndex={-1}
                style={{ width: lamina.ancho, height: lamina.alto, transform: `scale(${escala})`, opacity: originales ? 1 : 0 }}
                onLoad={async () => {
                  const doc = marco.current?.contentDocument;
                  if (!doc) return;
                  await doc.fonts.ready;
                  setOriginales(nodosDeTexto(doc).map((n) => n.nodeValue ?? ''));
                }}
              />
            )}
          </div>
        </div>
        {paginas > 1 && (
          <div className={estilos.paginas}>
            {Array.from({ length: paginas }, (_, i) => (
              <button key={i} type="button" aria-pressed={i === pagina} onClick={() => alPaginar(i)}>Imagen {i + 1}</button>
            ))}
          </div>
        )}
      </div>

      <section className={estilos.bloque} style={{ gridArea: 'textos' }}>
        <h3>Textos de la imagen</h3>
        {!lamina.html && <p className={estilos.ayuda}>Esta pieza está solo como imagen. Escribí la corrección en la nota.</p>}
        {falla && <p className={estilos.ayuda} role="alert">{falla}</p>}
        {lamina.html && !falla && !originales && <div className="dm-skeleton h-24 rounded-md" />}
        {originales?.map((original, i) => (
          <div key={i} className={estilos.campo} data-cambiado={i in cambios || undefined}>
            <textarea
              aria-label={`Texto ${i + 1}: ${original}`}
              rows={1}
              maxLength={600}
              value={cambios[i] ?? original}
              onChange={(e) => alCambiar(e.target.value === original ? sin(i) : { ...cambios, [i]: e.target.value })}
            />
            {i in cambios && (
              <button type="button" className={estilos.enlace} onClick={() => alCambiar(sin(i))}>
                Antes decía “{original.trim()}”. Deshacer
              </button>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
