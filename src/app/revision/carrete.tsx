'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Pieza as DatosPieza, Revision } from '@/lib/revision-tipos';
import { Pieza } from './lamina';

const SEPARACION = 10;
// Parte del alto que ocupa la pieza actual; el resto deja asomar la de arriba y la de abajo.
const PARTE = 0.84;
// Piezas dibujadas a cada lado de la actual; las demás ocupan su lugar vacías.
const CERCANAS = 2;

type Props = {
  piezas: DatosPieza[];
  actual: number;
  alElegir: (indice: number) => void;
  clave: string;
  escritorio: boolean;
  textosDe: (pieza: DatosPieza) => Revision['textos'];
  descripcionDe: (pieza: DatosPieza) => string;
  alCambiar: (laminaId: string, cambios: Record<string, string>) => void;
  alTocar: (lamina: number, indice: number, original: string) => void;
};

/** Las piezas en columna: la actual queda centrada y se pasa de una a otra desplazando. */
export function Carrete({ piezas, actual, alElegir, clave, escritorio, textosDe, descripcionDe, alCambiar, alTocar }: Props) {
  const pista = useRef<HTMLDivElement>(null);
  const [tamano, setTamano] = useState({ ancho: 0, alto: 0 });
  const [imagen, setImagen] = useState(0);
  const centrada = useRef(-1);
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rueda = useRef({ hasta: 0 });
  const tocando = useRef(false);
  const estado = useRef({ actual, total: piezas.length, alElegir });
  estado.current = { actual, total: piezas.length, alElegir };

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const medir = new ResizeObserver(([e]) => setTamano({ ancho: e.contentRect.width, alto: e.contentRect.height }));
    medir.observe(el);
    return () => medir.disconnect();
  }, []);

  // En PC los carruseles se ven completos; en celular, de a una imagen.
  const visibles = (p: DatosPieza) => (escritorio ? Math.max(p.laminas.length, 1) : 1);

  /** Tamaño de cada pieza: la más grande que entra a lo ancho y deja ver las vecinas. */
  const medidaDe = (p: DatosPieza) => {
    const [primera] = p.laminas;
    const proporcion = primera ? primera.ancho / primera.alto : 4 / 5;
    const botones = !escritorio && p.laminas.length > 1 ? 44 : 0;
    const n = visibles(p);
    const huecos = 12 * (n - 1);
    const ancho = Math.min(tamano.ancho - 24, (tamano.alto * PARTE - botones) * proporcion * n + huecos);
    return { width: Math.round(ancho), height: Math.round((ancho - huecos) / n / proporcion + botones) };
  };

  const centrar = useCallback((indice: number, suave: boolean) => {
    const el = pista.current;
    const hoja = el?.querySelector<HTMLElement>(`[data-hoja="${indice}"]`);
    if (!el || !hoja) return;
    el.scrollTo({ top: hoja.offsetTop - (el.clientHeight - hoja.offsetHeight) / 2, behavior: suave ? 'smooth' : 'auto' });
  }, []);

  // Al cambiar de pieza (flechas, teclado) o de tamaño, volver a centrar.
  const medidaAnterior = useRef('');
  useEffect(() => {
    if (!tamano.ancho) return;
    const medida = `${tamano.ancho}x${tamano.alto}`;
    const cambioMedida = medida !== medidaAnterior.current;
    medidaAnterior.current = medida;
    if (cambioMedida || centrada.current !== actual) centrar(actual, !cambioMedida);
    centrada.current = actual;
    setImagen(0);
  }, [actual, tamano, centrar]);

  /** Cuando el desplazamiento se detiene, la pieza más cercana al centro pasa a ser la actual. */
  function alDesplazar() {
    clearTimeout(espera.current);
    espera.current = setTimeout(() => {
      const el = pista.current;
      // Con el dedo todavía apoyado no se acomoda nada.
      if (!el || tocando.current) return;
      const medio = el.scrollTop + el.clientHeight / 2;
      const hojas = Array.from(el.querySelectorAll<HTMLElement>('[data-hoja]'));
      const distancia = (h: HTMLElement) => Math.abs(h.offsetTop + h.offsetHeight / 2 - medio);
      const cercana = hojas.reduce((mejor, h) => (distancia(h) < distancia(mejor) ? h : mejor));
      const indice = Number(cercana.dataset.hoja);
      if (indice !== estado.current.actual) {
        centrada.current = indice;
        estado.current.alElegir(indice);
      }
      // Si quedó a mitad de camino, terminar de centrarla.
      if (Math.abs(cercana.offsetTop - (el.clientHeight - cercana.offsetHeight) / 2 - el.scrollTop) > 2) centrar(indice, true);
    }, 140);
  }

  const paso = useCallback((direccion: number) => {
    const { actual, total, alElegir } = estado.current;
    const destino = Math.min(total - 1, Math.max(0, actual + direccion));
    if (destino !== actual) alElegir(destino);
  }, []);

  // Rueda o panel táctil: un gesto, una pieza.
  const alRueda = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 8) return;
      const ahora = Date.now();
      const sigueElGesto = ahora < rueda.current.hasta;
      rueda.current.hasta = ahora + 220;
      if (!sigueElGesto) paso(Math.sign(delta));
    },
    [paso],
  );

  useEffect(() => {
    const el = pista.current;
    const teclas = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return;
      const direccion = ['ArrowDown', 'PageDown'].includes(e.key) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
      if (!direccion) return;
      e.preventDefault();
      paso(direccion);
    };
    el?.addEventListener('wheel', alRueda, { passive: false });
    window.addEventListener('keydown', teclas);
    return () => {
      el?.removeEventListener('wheel', alRueda);
      window.removeEventListener('keydown', teclas);
      clearTimeout(espera.current);
    };
  }, [alRueda, paso]);

  const margen = (p: DatosPieza) => Math.max(0, (tamano.alto - medidaDe(p).height) / 2 - SEPARACION);

  return (
    <div
      ref={pista}
      onScroll={alDesplazar}
      onTouchStart={() => (tocando.current = true)}
      onTouchEnd={() => {
        tocando.current = false;
        alDesplazar();
      }}
      onTouchCancel={() => {
        tocando.current = false;
        alDesplazar();
      }}
      aria-label="Piezas"
      className="relative flex min-h-0 flex-1 snap-y snap-mandatory flex-col items-center overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none]"
      style={{ gap: SEPARACION }}
    >
      {tamano.ancho > 0 && (
        <>
          <div aria-hidden className="w-full shrink-0" style={{ height: margen(piezas[0]) }} />
          {piezas.map((pieza, i) => {
            const enFoco = i === actual;
            const textos = textosDe(pieza);
            return (
              <div
                key={pieza.id}
                data-hoja={i}
                aria-current={enFoco || undefined}
                className={cn('relative flex shrink-0 snap-center snap-always flex-col transition-opacity duration-300', !enFoco && 'opacity-40')}
                style={medidaDe(pieza)}
              >
                {Math.abs(i - actual) > CERCANAS ? null : pieza.laminas.length === 0 ? (
                  <div className="flex min-h-0 flex-1 items-center">
                    <p className="max-h-full w-full overflow-hidden whitespace-pre-wrap rounded-2xl border bg-amber-50 p-6 text-lg shadow-sm">{descripcionDe(pieza)}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex min-h-0 flex-1 gap-3">
                      {pieza.laminas.map((lamina, n) => (
                        <div key={lamina.id} className={cn('min-h-0 min-w-0 flex-1', !escritorio && n !== (enFoco ? imagen : 0) && 'hidden')}>
                          <Pieza
                            lamina={lamina}
                            clave={clave}
                            nombre={`${pieza.titulo}, imagen ${n + 1}`}
                            yaMismo
                            conControles={enFoco}
                            cambios={textos[lamina.id]}
                            alRueda={alRueda}
                            alCambiar={enFoco ? (cambios) => alCambiar(lamina.id, cambios) : undefined}
                          />
                        </div>
                      ))}
                    </div>
                    {!escritorio && enFoco && pieza.laminas.length > 1 && (
                      <div className="flex justify-center gap-2 pt-2">
                        {pieza.laminas.map((lamina, n) => (
                          <Button key={lamina.id} size="sm" variant={n === imagen ? 'default' : 'outline'} onClick={() => setImagen(n)}>Imagen {n + 1}</Button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {!enFoco && (
                  <button type="button" className="absolute inset-0 cursor-pointer" aria-label={`Ir a ${pieza.titulo}`} onClick={() => alElegir(i)} />
                )}
              </div>
            );
          })}
          <div aria-hidden className="w-full shrink-0" style={{ height: margen(piezas[piezas.length - 1]) }} />
        </>
      )}
    </div>
  );
}
