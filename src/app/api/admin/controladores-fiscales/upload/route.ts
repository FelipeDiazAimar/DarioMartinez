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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const file = formData.get('file');

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'El campo name es obligatorio.' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'El campo file es obligatorio.' }, { status: 400 });
    }

    const maxFileSize = 15 * 1024 * 1024;
    if (file.size > maxFileSize) {
      return NextResponse.json({ error: 'La imagen supera 15MB. Comprimila e intentá nuevamente.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const ext = file.name.split('.').pop() || 'jpg';
    const cleanName = name.trim();
    const filePath = `controladores-fiscales/${cleanName}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || undefined,
        cacheControl: '3600',
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { data: existingImageRow, error: existingImageError } = await supabase
      .from('imagenes')
      .select('id')
      .eq('seccion', 'controladores-fiscales')
      .eq('etiqueta', cleanName)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingImageError) {
      return NextResponse.json({ error: existingImageError.message }, { status: 400 });
    }

    if (existingImageRow?.id) {
      const { error: updateImageError } = await supabase
        .from('imagenes')
        .update({
          bucket: 'images',
          path: filePath,
          public_url: publicUrl,
        })
        .eq('id', existingImageRow.id);

      if (updateImageError) {
        return NextResponse.json({ error: updateImageError.message }, { status: 400 });
      }
    } else {
      const { error: insertImageError } = await supabase
        .from('imagenes')
        .insert({
          bucket: 'images',
          path: filePath,
          public_url: publicUrl,
          seccion: 'controladores-fiscales',
          etiqueta: cleanName,
        });

      if (insertImageError) {
        return NextResponse.json({ error: insertImageError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ publicUrl, filePath });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al subir imagen.' },
      { status: 500 }
    );
  }
}
