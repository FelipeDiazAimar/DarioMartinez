import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Da un permiso de subida firmado (de un solo uso) para el bucket de imágenes.
// El navegador sube el archivo directo a Supabase con ese permiso, así no hace falta
// que la clave pública tenga permiso de escritura y no se choca con el límite de
// tamaño de las funciones de Vercel. Protegida por el middleware (/api/admin/*).

const ALLOWED_BUCKETS = new Set(['images']);
const PATH_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/_.\-]{0,300}$/;

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ data: null, error: { message: 'Falta configurar Supabase en el servidor.' } }, { status: 500 });
  }

  let bucket = '';
  let path = '';
  let upsert = false;
  try {
    const body = await request.json();
    bucket = String(body?.bucket ?? '');
    path = String(body?.path ?? '');
    upsert = body?.upsert === true;
  } catch {
    return NextResponse.json({ data: null, error: { message: 'Solicitud inválida.' } }, { status: 400 });
  }

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ data: null, error: { message: 'Bucket no permitido.' } }, { status: 403 });
  }
  if (!PATH_PATTERN.test(path) || path.includes('..')) {
    return NextResponse.json({ data: null, error: { message: 'Ruta de archivo inválida.' } }, { status: 400 });
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path, { upsert });

  if (error || !data) {
    console.error('[admin-storage]', bucket, path, error?.message);
    return NextResponse.json({ data: null, error: { message: error?.message ?? 'No se pudo preparar la subida.' } });
  }

  return NextResponse.json({ data: { path: data.path, token: data.token }, error: null });
}
