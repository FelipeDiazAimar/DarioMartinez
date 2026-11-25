'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

type Props = {
  lamina: Lamina;
  clave: string;
  /** Textos corregidos: número de texto → texto nuevo. */
  cambios: Record<string, string>;
  /** Si está, los textos se editan escribiendo sobre la pieza. */
  alCambiar?: (cambios: Record<string, string>) => void;
  nombre: string;
};

/** La pieza (su HTML) escalada para entrar en el espacio disponible. */
export function Pieza({ lamina, clave, cambios, alCambiar, nombre }: Props) {
  const [cerca, setCerca] = useState(Boolean(alCambiar));
  const [html, setHtml] = useState<string | null>(null);
  const [falla, setFalla] = useState(false);
  const [lista, setLista] = useState(false);
  const [escala, setEscala] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  const marco = useRef<HTMLIFrameElement>(null);
  const originales = useRef<string[]>([]);
  const ultimo = useRef({ cambios, alCambiar });
  ultimo.current = { cambios, alCambiar };

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
      .then((texto) => vigente && setHtml(texto))
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
      if (ultimo.current.alCambiar) {
        envoltura.setAttribute('contenteditable', 'plaintext-only');
        envoltura.setAttribute('spellcheck', 'false');
      }
    }
    if (ultimo.current.alCambiar) {
      const estilo = doc.createElement('style');
      estilo.textContent = ESTILO_EDICION;
      doc.head.appendChild(estilo);
      doc.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault());
      doc.addEventListener('input', () => {
        const nuevos: Record<string, string> = {};
        elementos().forEach((el, i) => {
          const texto = el.textContent ?? '';
          if (texto !== originales.current[i]) nuevos[i] = texto.slice(0, 600);
        });
        ultimo.current.alCambiar?.(nuevos);
      });
    }
    await doc.fonts.ready;
    setLista(true);
  }

  // Aplicar las correcciones. Solo se toca lo que difiere, para no mover el cursor de quien escribe.
  useEffect(() => {
    if (!lista) return;
    elementos().forEach((el, i) => {
      const texto = cambios[i] ?? originales.current[i];
      if (el.textContent !== texto) el.textContent = texto;
    });
  }, [cambios, lista, elementos]);

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
            sandbox="allow-same-origin"
            tabIndex={alCambiar ? 0 : -1}
            onLoad={preparar}
            className="absolute left-0 top-0 max-w-none origin-top-left border-0"
            style={{ width: lamina.ancho, height: lamina.alto, transform: `scale(${escala})`, opacity: lista ? 1 : 0, pointerEvents: alCambiar ? 'auto' : 'none' }}
          />
        )}
      </div>
    </div>
  );
}
