import { NextResponse } from 'next/server';
import { claveValida, leerCatalogo, leerTexto } from '@/lib/revision-servidor';

export const dynamic = 'force-dynamic';

/** HTML editable de una lámina. */
export async function GET(request: Request) {
  if (!claveValida(request)) return NextResponse.json({ error: 'Enlace no válido.' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id');
  try {
    // La ruta sale del catálogo, nunca de lo que manda el navegador.
    const lamina = (await leerCatalogo()).flatMap((p) => p.laminas).find((l) => l.id === id);
    if (!lamina?.html) return NextResponse.json({ error: 'Esa pieza no tiene texto editable.' }, { status: 404 });
    return NextResponse.json({ html: await leerTexto(lamina.html) });
  } catch (error) {
    console.error('[revision] no se pudo leer la lámina', error);
    return NextResponse.json({ error: 'No se pudo abrir la pieza.' }, { status: 500 });
  }
}
