import { NextResponse } from 'next/server';
import { almacen, claveValida, leerPiezas, leerRevisiones } from '@/lib/revision-servidor';

export const dynamic = 'force-dynamic';

const UN_DIA = 60 * 60 * 24;

/** Todas las piezas (con enlaces temporales a los archivos cargados) y el estado de cada una. */
export async function GET(request: Request) {
  if (!claveValida(request)) return NextResponse.json({ error: 'Este enlace no es válido. Pedí el enlace completo de nuevo.' }, { status: 401 });

  try {
    const [piezas, revisiones] = await Promise.all([leerPiezas(), leerRevisiones()]);
    const archivos = piezas.flatMap((p) => p.laminas.flatMap((l) => (l.archivo ? [l.archivo] : [])));
    if (archivos.length) {
      const { data, error } = await almacen().createSignedUrls(archivos.map((a) => a.ruta), UN_DIA);
      if (error) throw error;
      const enlaces = new Map(data.map((d) => [d.path, d.signedUrl]));
      for (const archivo of archivos) archivo.url = enlaces.get(archivo.ruta);
    }
    return NextResponse.json({ piezas, revisiones }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[revision] no se pudieron leer las piezas', error);
    return NextResponse.json({ error: 'No se pudieron cargar las piezas.' }, { status: 500 });
  }
}
