'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import type { Lamina } from '@/lib/revision-tipos';
import { nodosDeTexto, pedirHtml } from './comun';

// Solo los textos reciben el puntero: ninguna capa decorativa tapa el clic.
const ESTILO_EDICION = `
  body * { pointer-events: none !important; }
  dm-t { pointer-events: auto !important; cursor: text; outline: 4px dashed transparent; outline-offset: 6px; }
  dm-t:hover { outline-color: #f2bc36; }
  dm-t:focus { outline: 5px solid #f2bc36; }
  dm-t:empty::after { content: '\\00a0\\00a0\\00a0'; }
`;

// El marco necesita allow-scripts para que Safari entregue los eventos que escucha esta página;
// la política dentro del documento impide que la pieza ejecute código propio.
const SIN_CODIGO = '<meta http-equiv="Content-Security-Policy" content="script-src \'none\'">';

type Caja = { x: number; y: number; ancho: number; alto: number };

type Props = {
  lamina: Lamina;
  clave: string;
  nombre: string;
  /** Textos corregidos: número de texto → texto nuevo. */
  cambios?: Record<string, string>;
  /** PC: se escribe directamente sobre la pieza. */
  alCambiar?: (cambios: Record<string, string>) => void;
  /** Celular: cada texto es una zona para tocar. */
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
        <video ref={video} src={conControles ? url : `${url}#t=0.1`} controls={conControles} playsInline preload="metadata" muted={!conControles} className="max-h-full max-w-full" />
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
  const caja = useRef<HTMLDivElement>(null);
  const marco = useRef<HTMLIFrameElement>(null);
  const originales = useRef<string[]>([]);
  const ultimo = useRef({ alCambiar, alRueda });
  ultimo.current = { alCambiar, alRueda };

  useEffect(() => {
    const elemento = caja.current;
    if (!elemento) return;
    const tamano = new ResizeObserver(([e]) => setEscala(Math.min(e.contentRect.width / lamina.ancho, e.contentRect.height / lamina.alto)));
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

  const elementos = useCallback(() => Array.from(marco.current?.contentDocument?.querySelectorAll('dm-t') ?? []), []);

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
    doc.addEventListener('input', () => {
      const nuevos: Record<string, string> = {};
      elementos().forEach((el, i) => {
        const texto = el.textContent ?? '';
        if (texto !== originales.current[i]) nuevos[i] = texto.slice(0, 600);
      });
      ultimo.current.alCambiar?.(nuevos);
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
    };
  }, [lista, editable, elementos]);

  // Aplicar las correcciones (solo lo que difiere, para no mover el cursor) y medir las zonas para tocar.
  const tocable = Boolean(alTocar);
  useEffect(() => {
    if (!lista) return;
    elementos().forEach((el, i) => {
      const texto = cambios?.[i] ?? originales.current[i];
      if (el.textContent !== texto) el.textContent = texto;
    });
    if (tocable) {
      setCajas(
        elementos().map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, ancho: r.width, alto: r.height };
        }),
      );
    }
  }, [cambios, lista, elementos, tocable]);

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
            style={{ width: lamina.ancho, height: lamina.alto, transform: `scale(${escala})`, opacity: lista ? 1 : 0, pointerEvents: alCambiar ? 'auto' : 'none' }}
          />
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
              style={{ left: c.x * escala - 3, top: c.y * escala - 3, width: c.ancho * escala + 6, height: c.alto * escala + 6 }}
            />
          ))}
      </div>
    </div>
  );
}
