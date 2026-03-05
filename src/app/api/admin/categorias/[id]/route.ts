import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltan variables de Supabase para administrar categorías.');
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : '';

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID inválido.' }, { status: 400 });
    }

    if (!nombre) {
      return NextResponse.json({ success: false, message: 'El nombre es obligatorio.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('categorias_articulos')
      .update({ nombre })
      .eq('id', id)
      .select('id, nombre, created_at')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo actualizar la categoría.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID inválido.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error: relationDeleteError } = await supabase
      .from('articulos_categorias')
      .delete()
      .eq('categoria_id', id);

    if (relationDeleteError) {
      throw relationDeleteError;
    }

    const { error } = await supabase.from('categorias_articulos').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo eliminar la categoría.',
      },
      { status: 500 },
    );
  }
}
