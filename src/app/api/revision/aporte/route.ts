import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { almacen, claveValida, guardarAporte } from '@/lib/revision-servidor';
import { ARCHIVOS_MAXIMOS, FORMATOS_APORTE, PESO_MAXIMO, TIPOS_APORTE, type Pieza } from '@/lib/revision-tipos';

export const dynamic = 'force-dynamic';

// La carga va en dos pasos porque el servidor no acepta archivos grandes: primero se piden
// permisos de subida, el navegador sube directo al almacén y después se registra el aporte.
// Las rutas las arma siempre el servidor.

const mime = z.string().refine((m) => m in FORMATOS_APORTE);
const rutaPropia = z.string().regex(/^aportes\/archivos\/[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|mov|webm)$/);

const preparar = z.object({
  accion: z.literal('preparar'),
  archivos: z.array(z.object({ mime, peso: z.number().int().positive().max(PESO_MAXIMO) })).min(1).max(ARCHIVOS_MAXIMOS),
});

const crear = z.object({
  accion: z.literal('crear'),
  tipo: z.enum(TIPOS_APORTE),
  texto: z.string().max(4000),
  autor: z.string().max(60),
  archivos: z
    .array(z.object({ ruta: rutaPropia, mime, ancho: z.number().int().min(1).max(20000), alto: z.number().int().min(1).max(20000) }))
    .max(ARCHIVOS_MAXIMOS),
});

const NOMBRES = { historia: 'Historia', publicacion: 'Publicación', video: 'Video', idea: 'Idea' } as const;

export async function POST(request: Request) {
  if (!claveValida(request)) return NextResponse.json({ error: 'Enlace no válido.' }, { status: 401 });

  const datos = z.discriminatedUnion('accion', [preparar, crear]).safeParse(await request.json().catch(() => null));
  if (!datos.success) return NextResponse.json({ error: 'No se pudo cargar: revisá el formato y que cada archivo pese menos de 50 MB.' }, { status: 400 });

  try {
    if (datos.data.accion === 'preparar') {
      const permisos = await Promise.all(
        datos.data.archivos.map(async (a) => {
          const { data, error } = await almacen().createSignedUploadUrl(`aportes/archivos/${randomUUID()}.${FORMATOS_APORTE[a.mime]}`);
          if (error) throw error;
          return { ruta: data.path, url: data.signedUrl };
        }),
      );
      return NextResponse.json({ permisos });
    }

    const { tipo, texto, autor, archivos } = datos.data;
    const completo =
      tipo === 'idea'
        ? texto.trim() && archivos.length === 0
        : archivos.length > 0 && archivos.every((a) => a.mime.startsWith(tipo === 'video' ? 'video/' : 'image/'));
    if (!completo) return NextResponse.json({ error: 'Falta el texto o el archivo que corresponde a ese tipo.' }, { status: 400 });

    const creado = new Date().toISOString();
    const id = `aporte-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const pieza: Pieza = {
      id,
      tipo,
      titulo: `${NOMBRES[tipo]}${autor.trim() ? ` de ${autor.trim()}` : ' del grupo'}`,
      dia: null,
      hora: null,
      laminas: archivos.map((a, i) => ({ id: `${id}-${i + 1}`, ancho: a.ancho, alto: a.alto, archivo: { ruta: a.ruta, mime: a.mime } })),
      descripcion: tipo === 'historia' && !texto.trim() ? null : texto,
      aporte: { autor: autor.trim(), creado },
    };
    await guardarAporte(pieza);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('[revision] no se pudo cargar el aporte', error);
    return NextResponse.json({ error: 'No se pudo cargar. Probá de nuevo.' }, { status: 500 });
  }
}
