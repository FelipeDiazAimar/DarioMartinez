'use client';

import { usePathname } from 'next/navigation';

/**
 * Oculta a sus hijos en /revision: ahí no van la analítica ni los anuncios (la clave del enlace
 * no queda registrada en terceros) ni el botón flotante de WhatsApp, que taparía los controles.
 */
export function SoloSitio({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith('/revision') ? null : <>{children}</>;
}
