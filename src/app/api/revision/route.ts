import { NextResponse } from 'next/server';
import { claveValida, leerCatalogo, leerRevisiones } from '@/lib/revision-servidor';

export const dynamic = 'force-dynamic';

/** Catálogo de piezas y el estado de cada una. */
export async function GET(request: Request) {
  if (!claveValida(request)) return NextResponse.json({ error: 'Este enlace no es válido. Pedí el enlace completo de nuevo.' }, { status: 401 });

  try {
    const [piezas, revisiones] = await Promise.all([leerCatalogo(), leerRevisiones()]);
    return NextResponse.json({ piezas, revisiones }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[revision] no se pudo leer el catálogo', error);
    return NextResponse.json({ error: 'No se pudieron cargar las piezas.' }, { status: 500 });
  }
}
