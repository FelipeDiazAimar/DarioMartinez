'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

/** Alto realmente visible: se achica cuando aparece el teclado del celular. */
function useVentanaVisible() {
  const [caja, setCaja] = useState<{ top: number; alto: number } | null>(null);
  useEffect(() => {
    const vista = window.visualViewport;
    if (!vista) return;
    const medir = () => setCaja({ top: vista.offsetTop, alto: vista.height });
    medir();
    vista.addEventListener('resize', medir);
    vista.addEventListener('scroll', medir);
    return () => {
      vista.removeEventListener('resize', medir);
      vista.removeEventListener('scroll', medir);
    };
  }, []);
  return caja;
}

type Props = {
  titulo: string;
  valor: string;
  maximo: number;
  alCambiar: (valor: string) => void;
  alCerrar: () => void;
  /** La pieza, para ver el cambio mientras se escribe. */
  children?: React.ReactNode;
};

/** Campo grande para escribir en el celular, por encima de todo y a la altura del teclado. */
export function EditorMovil({ titulo, valor, maximo, alCambiar, alCerrar, children }: Props) {
  const caja = useVentanaVisible();
  // Va directo en el body: dentro de la vista quedaría por debajo del encabezado del sitio.
  return createPortal(
    <div role="dialog" aria-label={titulo} className="fixed inset-x-0 z-[60] flex flex-col bg-white" style={caja ? { top: caja.top, height: caja.alto } : { top: 0, bottom: 0 }}>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h3 className="font-semibold">{titulo}</h3>
        <Button size="sm" onClick={alCerrar}>Listo</Button>
      </div>
      {children && <div className="min-h-0 flex-1 bg-muted/40 p-2">{children}</div>}
      <textarea
        aria-label={titulo}
        autoFocus
        value={valor}
        maxLength={maximo}
        onChange={(e) => alCambiar(e.target.value)}
        // 16 px o más: con menos, iPhone acerca la pantalla al escribir.
        className={`w-full resize-none border-t p-3 text-lg outline-none ${children ? 'h-24 shrink-0' : 'min-h-0 flex-1'}`}
      />
    </div>,
    document.body,
  );
}
