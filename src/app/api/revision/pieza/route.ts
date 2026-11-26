import { NextResponse } from 'next/server';
import { z } from 'zod';
import { claveValida, guardarRevision, leerPiezas, leerRevision, puedeAprobar } from '@/lib/revision-servidor';
import { ESTADOS, type Revision } from '@/lib/revision-tipos';

export const dynamic = 'force-dynamic';

const cuerpo = z.object({
  id: z.string().max(100),
  estado: z.enum(ESTADOS),
  nota: z.string().max(4000),
  descripcion: z.string().max(4000).nullable(),
  textos: z.record(z.record(z.string().max(600))),
  autor: z.string().max(60),
  /** Fecha del estado que el navegador tenía a la vista. */
  base: z.string().nullable(),
});

/** Guarda la revisión de una pieza. */
export async function PUT(request: Request) {
  if (!claveValida(request)) return NextResponse.json({ error: 'Enlace no válido.' }, { status: 401 });

  const datos = cuerpo.safeParse(await request.json().catch(() => null));
  if (!datos.success) return NextResponse.json({ error: 'No se pudo guardar: datos incompletos o demasiado largos.' }, { status: 400 });

  const { id, base, ...cambios } = datos.data;
  if ((cambios.estado === 'aprobado' || cambios.estado === 'desaprobado') && !puedeAprobar(request)) {
    return NextResponse.json(
      { error: 'PIN incorrecto. Solo la administración puede aprobar o desaprobar.', requierePin: true },
      { status: 403 },
    );
  }
  try {
    const pieza = (await leerPiezas()).find((p) => p.id === id);
    if (!pieza) return NextResponse.json({ error: 'Esa pieza no existe.' }, { status: 404 });

    // Si otra persona guardó mientras tanto, no pisar lo suyo.
    const actual = await leerRevision(id);
    if (actual.actualizado !== base) {
      return NextResponse.json(
        { error: `${actual.autor || 'Otra persona'} guardó cambios en esta pieza mientras la tenías abierta.`, actual },
        { status: 409 },
      );
    }

    const revision: Revision = {
      ...cambios,
      descripcion: pieza.descripcion === null ? null : cambios.descripcion,
      actualizado: new Date().toISOString(),
    };
    await guardarRevision(id, revision);
    return NextResponse.json({ revision });
  } catch (error) {
    console.error('[revision] no se pudo guardar', error);
    return NextResponse.json({ error: 'No se pudo guardar. Probá de nuevo.' }, { status: 500 });
  }
}
