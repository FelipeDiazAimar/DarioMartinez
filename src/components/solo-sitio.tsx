'use client';

import { usePathname } from 'next/navigation';

/**
 * Muestra a sus hijos solo en el sitio. En /revision no van el encabezado, el pie ni
 * las etiquetas de analítica y anuncios: así la clave del enlace no queda registrada en terceros.
 */
export function SoloSitio({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith('/revision') ? null : <>{children}</>;
}
