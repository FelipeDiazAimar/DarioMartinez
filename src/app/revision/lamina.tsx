'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Move, Play } from 'lucide-react';
import type { Lamina } from '@/lib/revision-tipos';
import { nodosDeTexto, pedirHtml } from './comun';

// Solo los textos reciben el puntero: ninguna capa decorativa tapa el clic.
const ESTILO_EDICION = `
  body * { pointer-events: none !important; }
  dm-t {
    pointer-events: auto !important;
    display: inline-block;
    position: relative;
    cursor: text;
    outline: 3px dashed rgba(242, 188, 54, 0.72);
    outline-offset: 5px;
    border-radius: 6px;
    touch-action: manipulation;
  }
  dm-t:hover { outline-color: #f2bc36; }
  dm-t:focus { outline: 5px solid #f2bc36; background: rgba(242, 188, 54, 0.14); }
  dm-t:empty::after { content: '\\00a0\\00a0\\00a0'; }
`;

// El marco necesita allow-scripts para que Safari entregue los eventos que escucha esta página;
// la política dentro del documento impide que la pieza ejecute código propio.
const SIN_CODIGO = '<meta http-equiv="Content-Security-Policy" content="script-src \'none\'">';
const POS_PREFIX = '__pos_';

type Caja = { x: number; y: number; ancho: number; alto: number };

function parsePos(raw?: string): { x: number; y: number } {
  if (!raw) return { x: 0, y: 0 };
  const [xs, ys] = raw.split(',');
  const x = Number(xs);
  const y = Number(ys);
  return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
}

type Props = {
  lamina: Lamina;
  clave: string;
  nombre: string;
  /** Textos corregidos: número de texto → texto nuevo, y __pos_<n> → "dx,dy". */
  cambios?: Record<string, string>;
  /** Edición directa sobre la pieza (texto y posición). */
  alCambiar?: (cambios: Record<string, string>) => void;
  /** Opcional: zonas táctiles externas. */
  alTocar?: (indice: number, original: string) => void;
  /** Texto marcado como el que se está editando. */
  activo?: number;
  /** Los videos se pueden reproducir (vista grande). */
  conControles?: boolean;
  /** Dibujar sin esperar a que entre en pantalla. */
  yaMismo?: boolean;
  /** Rueda del mouse sobre la pieza: el marco no la deja pasar sola. */
  alRueda?: (e: WheelEvent) => void;
};

/** Una imagen de la pieza escalada para entrar en el espacio disponible. */
export function Pieza(props: Props) {
  return props.lamina.archivo ? <Archivo {...props} /> : <Editable {...props} />;
}

function Archivo({ lamina, nombre, conControles }: Props) {
  const { url, mime } = lamina.archivo!;
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!conControles) video.current?.pause();
  }, [conControles]);
  if (mime.startsWith('video/')) {
    return (
      <div className="relative flex h-full min-h-0 w-full items-center justify-center bg-black">
        {/* El #t pide un cuadro para usar de miniatura. */}
        <video
          ref={video}
          src={conControles ? url : `${url}#t=0.1`}
          controls={conControles}
          playsInline
          preload="metadata"
          muted={!conControles}
          className="max-h-full max-w-full"
        />
        {!conControles && <Play aria-hidden className="absolute h-12 w-12 fill-white text-white drop-shadow-lg" />}
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={nombre} loading="lazy" className="max-h-full max-w-full object-contain shadow-md" />
    </div>
  );
}

function Editable({ lamina, clave, nombre, cambios, alCambiar, alTocar, activo, yaMismo, alRueda }: Props) {
  const [cerca, setCerca] = useState(Boolean(yaMismo || alCambiar || alTocar));
  const [html, setHtml] = useState<string | null>(null);
  const [falla, setFalla] = useState(false);
  const [lista, setLista] = useState(false);
  const [escala, setEscala] = useState(0);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [focusedBox, setFocusedBox] = useState<Caja | null>(null);
  const [draggingMove, setDraggingMove] = useState(false);

  const caja = useRef<HTMLDivElement>(null);
  const marco = useRef<HTMLIFrameElement>(null);
  const originales = useRef<string[]>([]);
  const cambiosRef = useRef<Record<string, string>>(cambios ?? {});
  cambiosRef.current = cambios ?? {};
  const ultimo = useRef({ alCambiar, alRueda });
  ultimo.current = { alCambiar, alRueda };

  const dragStateRef = useRef<{
    idx: number;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    const elemento = caja.current;
    if (!elemento) return;
    const tamano = new ResizeObserver(([e]) =>
      setEscala(Math.min(e.contentRect.width / lamina.ancho, e.contentRect.height / lamina.alto)),
    );
    const vista = new IntersectionObserver(([e]) => e.isIntersecting && setCerca(true), { rootMargin: '600px' });
    tamano.observe(elemento);
    vista.observe(elemento);
    return () => {
      tamano.disconnect();
      vista.disconnect();
    };
  }, [lamina.ancho, lamina.alto]);

  useEffect(() => {
    if (!cerca) return;
    let vigente = true;
    pedirHtml(lamina, clave)
      .then((texto) => vigente && setHtml(texto.replace('<head>', `<head>${SIN_CODIGO}`)))
      .catch(() => vigente && setFalla(true));
    return () => {
      vigente = false;
    };
  }, [cerca, lamina, clave]);

  const elementos = useCallback(
    () => Array.from(marco.current?.contentDocument?.querySelectorAll<HTMLElement>('dm-t') ?? []),
    [],
  );

  const measureFocused = useCallback(
    (idx: number | null) => {
      if (idx === null) {
        setFocusedBox(null);
        return;
      }
      const el = elementos()[idx];
      if (!el) {
        setFocusedBox(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setFocusedBox({ x: r.x, y: r.y, ancho: r.width, alto: r.height });
    },
    [elementos],
  );

  const buildCambiosSnapshot = useCallback(
    (overridePos?: { idx: number; x: number; y: number }) => {
      const nuevos: Record<string, string> = {};
      elementos().forEach((el, i) => {
        const texto = el.textContent ?? '';
        if (texto !== originales.current[i]) {
          nuevos[String(i)] = texto.slice(0, 600);
        }
        const posKey = `${POS_PREFIX}${i}`;
        if (overridePos && overridePos.idx === i) {
          const rx = Math.round(overridePos.x);
          const ry = Math.round(overridePos.y);
          if (rx !== 0 || ry !== 0) {
            nuevos[posKey] = `${rx},${ry}`;
          }
        } else if (cambiosRef.current[posKey]) {
          nuevos[posKey] = cambiosRef.current[posKey];
        }
      });
      return nuevos;
    },
    [elementos],
  );

  async function preparar() {
    const doc = marco.current?.contentDocument;
    if (!doc?.body) return;
    const nodos = nodosDeTexto(doc);
    if (!nodos.length) return;
    originales.current = nodos.map((n) => n.nodeValue ?? '');
    for (const nodo of nodos) {
      const envoltura = doc.createElement('dm-t');
      nodo.replaceWith(envoltura);
      envoltura.appendChild(nodo);
    }
    doc.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault());
    doc.addEventListener('wheel', (e) => ultimo.current.alRueda?.(e), { passive: false });
    doc.addEventListener('focusin', (e) => {
      const target = (e.target as HTMLElement | null)?.closest('dm-t');
      if (!target) return;
      const idx = elementos().indexOf(target as HTMLElement);
      if (idx !== -1) {
        setFocusedIdx(idx);
        const r = target.getBoundingClientRect();
        setFocusedBox({ x: r.x, y: r.y, ancho: r.width, alto: r.height });
      }
    });
    doc.addEventListener('input', () => {
      ultimo.current.alCambiar?.(buildCambiosSnapshot());
      const activeEl = doc.activeElement?.closest('dm-t') as HTMLElement | null;
      if (activeEl) {
        const r = activeEl.getBoundingClientRect();
        setFocusedBox({ x: r.x, y: r.y, ancho: r.width, alto: r.height });
      }
    });
    await doc.fonts.ready;
    setLista(true);
  }

  // La edición directa se enciende y se apaga sin volver a cargar la pieza.
  const editable = Boolean(alCambiar);
  useEffect(() => {
    const doc = marco.current?.contentDocument;
    if (!lista || !doc || !editable) return;
    const estilo = doc.createElement('style');
    estilo.textContent = ESTILO_EDICION;
    doc.head.appendChild(estilo);
    for (const el of elementos()) {
      el.setAttribute('contenteditable', 'plaintext-only');
      el.setAttribute('spellcheck', 'false');
    }
    return () => {
      estilo.remove();
      for (const el of elementos()) el.removeAttribute('contenteditable');
      setFocusedIdx(null);
      setFocusedBox(null);
    };
  }, [lista, editable, elementos]);

  // Aplicar las correcciones (texto + posición) y medir zonas.
  const tocable = Boolean(alTocar);
  useEffect(() => {
    if (!lista) return;
    elementos().forEach((el, i) => {
      const texto = cambios?.[i] ?? originales.current[i];
      if (el.textContent !== texto) el.textContent = texto;
      const pos = parsePos(cambios?.[`${POS_PREFIX}${i}`]);
      el.style.transform = pos.x !== 0 || pos.y !== 0 ? `translate(${pos.x}px, ${pos.y}px)` : '';
    });
    if (focusedIdx !== null) {
      measureFocused(focusedIdx);
    }
    if (tocable) {
      setCajas(
        elementos().map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, ancho: r.width, alto: r.height };
        }),
      );
    }
  }, [cambios, lista, elementos, tocable, focusedIdx, measureFocused]);

  const handleMovePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (focusedIdx === null || !escala) return;
    e.preventDefault();
    e.stopPropagation();
    const cur = parsePos(cambiosRef.current[`${POS_PREFIX}${focusedIdx}`]);
    dragStateRef.current = {
      idx: focusedIdx,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: cur.x,
      origY: cur.y,
    };
    setDraggingMove(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleMovePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const st = dragStateRef.current;
    if (!st || !escala) return;
    e.preventDefault();
    e.stopPropagation();
    const dx = (e.clientX - st.startClientX) / escala;
    const dy = (e.clientY - st.startClientY) / escala;
    const nx = st.origX + dx;
    const ny = st.origY + dy;
    const el = elementos()[st.idx];
    if (el) {
      el.style.transform = `translate(${Math.round(nx)}px, ${Math.round(ny)}px)`;
      const r = el.getBoundingClientRect();
      setFocusedBox({ x: r.x, y: r.y, ancho: r.width, alto: r.height });
    }
  };

  const handleMovePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const st = dragStateRef.current;
    if (!st || !escala) return;
    e.preventDefault();
    e.stopPropagation();
    const dx = (e.clientX - st.startClientX) / escala;
    const dy = (e.clientY - st.startClientY) / escala;
    const nx = st.origX + dx;
    const ny = st.origY + dy;
    dragStateRef.current = null;
    setDraggingMove(false);
    ultimo.current.alCambiar?.(buildCambiosSnapshot({ idx: st.idx, x: nx, y: ny }));
  };

  return (
    <div ref={caja} className="relative flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden">
      <div className="absolute overflow-hidden shadow-md" style={{ width: lamina.ancho * escala, height: lamina.alto * escala }}>
        {!lista && !falla && <div aria-hidden className="dm-skeleton absolute inset-0" />}
        {falla && <p className="p-3 text-center text-sm text-destructive">No se pudo abrir la pieza. Recargá la página.</p>}
        {html && (
          <iframe
            ref={marco}
            title={nombre}
            srcDoc={html}
            sandbox="allow-same-origin allow-scripts"
            tabIndex={alCambiar ? 0 : -1}
            onLoad={preparar}
            className="absolute left-0 top-0 max-w-none origin-top-left border-0"
            style={{
              width: lamina.ancho,
              height: lamina.alto,
              transform: `scale(${escala})`,
              opacity: lista ? 1 : 0,
              pointerEvents: alCambiar ? 'auto' : 'none',
            }}
          />
        )}

        {/* Manija flotante para mover el texto seleccionado con dedo o mouse */}
        {editable && focusedIdx !== null && focusedBox && escala > 0 && (
          <button
            type="button"
            onPointerDown={handleMovePointerDown}
            onPointerMove={handleMovePointerMove}
            onPointerUp={handleMovePointerUp}
            onPointerCancel={handleMovePointerUp}
            aria-label="Arrastrar para mover este texto"
            title="Arrastrá para mover este texto"
            className={`absolute z-20 inline-flex touch-none select-none items-center gap-1 rounded-full border border-white/80 bg-[#00308F] px-2.5 py-1 text-[11px] font-semibold text-white shadow-md transition-transform ${
              draggingMove ? 'scale-105 cursor-grabbing bg-[#2349B6]' : 'cursor-grab hover:bg-[#1D44B2]'
            }`}
            style={{
              left: Math.max(6, Math.min(lamina.ancho * escala - 82, focusedBox.x * escala)),
              top: Math.max(6, focusedBox.y * escala - 32),
            }}
          >
            <Move className="h-3 w-3" />
            <span>Mover</span>
          </button>
        )}

        {alTocar &&
          cajas.map((c, i) => (
            <button
              key={i}
              type="button"
              data-zona={i}
              aria-label={`Editar el texto ${originales.current[i]?.trim()}`}
              onClick={() => alTocar(i, originales.current[i])}
              className={`absolute rounded border-2 ${activo === i ? 'border-solid border-amber-400 bg-amber-300/20' : 'border-dashed border-amber-400/80'}`}
              style={{
                left: c.x * escala - 3,
                top: c.y * escala - 3,
                width: c.ancho * escala + 6,
                height: c.alto * escala + 6,
              }}
            />
          ))}
      </div>
    </div>
  );
}
