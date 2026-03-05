import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltan variables de Supabase para administrar categorías.');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const raw = requestUrl.searchParams.get('articulos') ?? '';
    const articleNumbers = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (articleNumbers.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('articulos_categorias')
      .select('articulo_numero, categoria_id')
      .in('articulo_numero', articleNumbers);

    if (error) {
      throw error;
    }

    const mapping = Object.fromEntries(
      (data ?? []).map((item) => [String(item.articulo_numero), item.categoria_id ? String(item.categoria_id) : null]),
    );

    return NextResponse.json({ success: true, data: mapping });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudieron obtener categorías por artículo.',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const articuloNumero = typeof body?.articuloNumero === 'string' ? body.articuloNumero.trim() : '';
    const categoriaId = typeof body?.categoriaId === 'string' ? body.categoriaId.trim() : null;

    if (!articuloNumero) {
      return NextResponse.json({ success: false, message: 'articuloNumero es obligatorio.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (!categoriaId) {
      const { error } = await supabase.from('articulos_categorias').delete().eq('articulo_numero', articuloNumero);

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true, data: null });
    }

    const { data, error } = await supabase
      .from('articulos_categorias')
      .upsert(
        {
          articulo_numero: articuloNumero,
          categoria_id: categoriaId,
        },
        { onConflict: 'articulo_numero' },
      )
      .select('articulo_numero, categoria_id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo guardar la categoría del artículo.',
      },
      { status: 500 },
    );
  }
}
