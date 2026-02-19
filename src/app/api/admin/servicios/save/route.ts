import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getSupabaseServerClient = () => {
  if (!supabaseUrl) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL en variables de entorno.');
  }

  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!key) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY en variables de entorno.');
  }

  return createClient(supabaseUrl, key);
};

type ServiceRowInput = {
  titulo: string;
  descripcion: string;
  detalles: string[];
  imagen_url: string | null;
  orden: number;
  slug: string;
};

const sanitizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const services = Array.isArray(body?.services) ? body.services : null;

    if (!services || services.length === 0) {
      return NextResponse.json({ error: 'La lista de servicios es obligatoria.' }, { status: 400 });
    }

    const rows: ServiceRowInput[] = services.map((item: any, index: number) => {
      const detalles = Array.isArray(item?.detalles)
        ? item.detalles.map((detail: unknown) => sanitizeText(detail)).filter(Boolean)
        : [];

      return {
        titulo: sanitizeText(item?.titulo),
        descripcion: sanitizeText(item?.descripcion),
        detalles,
        imagen_url: sanitizeText(item?.imagen_url) || null,
        orden: Number.isFinite(item?.orden) ? Number(item.orden) : index,
        slug: sanitizeText(item?.slug),
      };
    });

    if (rows.some((row) => !row.titulo || !row.descripcion || !row.slug)) {
      return NextResponse.json({ error: 'Cada servicio debe tener título, descripción y slug.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error: deleteError } = await supabase
      .from('servicios')
      .delete()
      .not('id', 'is', null);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('servicios')
      .insert(rows);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al guardar servicios.' },
      { status: 500 }
    );
  }
}
