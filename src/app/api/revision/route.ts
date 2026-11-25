import { NextResponse } from 'next/server';
import { almacen, claveValida, leerCatalogo, leerRevisiones } from '@/lib/revision-servidor';

export const dynamic = 'force-dynamic';

const UNA_HORA = 60 * 60;

/** Catálogo con enlaces temporales a las imágenes y el estado de cada pieza. */
export async function GET(request: Request) {
  if (!claveValida(request)) return NextResponse.json({ error: 'Este enlace no es válido. Pedí el enlace completo de nuevo.' }, { status: 401 });

  try {
    const [piezas, revisiones] = await Promise.all([leerCatalogo(), leerRevisiones()]);
    const rutas = piezas.flatMap((pieza) => pieza.laminas.map((lamina) => lamina.imagen));
    const { data, error } = await almacen().createSignedUrls(rutas, UNA_HORA);
    if (error) throw error;
    const enlaces = new Map(data.map((d) => [d.path, d.signedUrl]));
    for (const pieza of piezas) {
      for (const lamina of pieza.laminas) lamina.url = enlaces.get(lamina.imagen);
    }
    return NextResponse.json({ piezas, revisiones }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[revision] no se pudo leer el catálogo', error);
    return NextResponse.json({ error: 'No se pudieron cargar las piezas.' }, { status: 500 });
  }
}
