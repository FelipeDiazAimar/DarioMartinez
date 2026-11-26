import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const PLATFORMS = ['instagram', 'facebook', 'google'] as const;
type Platform = (typeof PLATFORMS)[number];

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

function isAuthorized(request: NextRequest): boolean {
  return request.cookies.get('admin_auth')?.value === '1';
}

function isValidWeekKey(week: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(week);
}

function isValidPlatform(p: string): p is Platform {
  return (PLATFORMS as readonly string[]).includes(p);
}

export type WeeklyCaptureItem = {
  path: string;
  name: string;
  url: string;
  createdAt: string | null;
};

const ORDER_FILE_NAME = '_order.json';

async function readOrderFile(folder: string): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase.storage.from('images').download(`${folder}/${ORDER_FILE_NAME}`);
    if (error || !data) return [];
    const text = await data.text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
  } catch {
    return [];
  }
}

async function listPlatformImages(weekKey: string, platform: Platform): Promise<WeeklyCaptureItem[]> {
  const supabase = getSupabaseAdmin();
  const folder = `weekly-dashboards/${weekKey}/${platform}`;

  const [{ data, error }, savedOrder] = await Promise.all([
    supabase.storage.from('images').list(folder, {
      limit: 50,
      sortBy: { column: 'name', order: 'asc' },
    }),
    readOrderFile(folder),
  ]);

  if (error || !Array.isArray(data)) {
    return [];
  }

  const items = data
    .filter(
      (file) =>
        file.name &&
        !file.name.startsWith('.') &&
        file.name !== ORDER_FILE_NAME &&
        file.id !== null
    )
    .map((file) => {
      const fullPath = `${folder}/${file.name}`;
      const { data: pub } = supabase.storage.from('images').getPublicUrl(fullPath);
      return {
        path: fullPath,
        name: file.name,
        url: pub.publicUrl,
        createdAt: file.created_at || null,
      };
    });

  if (savedOrder.length === 0) {
    return items;
  }

  const rank = new Map<string, number>();
  savedOrder.forEach((p, idx) => rank.set(p, idx));
  return [...items].sort((a, b) => {
    const ra = rank.has(a.path) ? rank.get(a.path)! : Number.MAX_SAFE_INTEGER;
    const rb = rank.has(b.path) ? rank.get(b.path)! : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name);
  });
}

export async function GET(request: NextRequest) {
  const isAdmin = isAuthorized(request);
  const week = (request.nextUrl.searchParams.get('week') || '').trim();

  if (!isValidWeekKey(week)) {
    return NextResponse.json({ error: 'Parámetro week inválido (YYYY-MM-DD).' }, { status: 400 });
  }

  try {
    const [instagram, facebook, google] = await Promise.all([
      listPlatformImages(week, 'instagram'),
      listPlatformImages(week, 'facebook'),
      listPlatformImages(week, 'google'),
    ]);

    return NextResponse.json({
      week,
      isAdmin,
      dashboards: { instagram, facebook, google },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error listando dashboards semanales.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Solo el administrador puede cargar capturas.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const week = String(formData.get('week') || '').trim();
    const platform = String(formData.get('platform') || '').trim().toLowerCase();

    if (!isValidWeekKey(week) || !isValidPlatform(platform)) {
      return NextResponse.json({ error: 'Semana o plataforma inválida.' }, { status: 400 });
    }

    const files = formData.getAll('files').filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      const single = formData.get('file');
      if (single instanceof File) files.push(single);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No se recibieron imágenes.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const uploaded: WeeklyCaptureItem[] = [];

    for (let idx = 0; idx < files.length; idx += 1) {
      const file = files[idx];
      const mime = (file.type || '').toLowerCase();
      if (!ALLOWED_TYPES.has(mime)) {
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        continue;
      }

      const ext = mime.includes('png')
        ? 'png'
        : mime.includes('webp')
          ? 'webp'
          : mime.includes('gif')
            ? 'gif'
            : 'jpg';

      const baseSlug = (file.name || 'captura')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 32) || 'captura';

      const filename = `${Date.now()}-${String(idx).padStart(2, '0')}-${baseSlug}.${ext}`;
      const fullPath = `weekly-dashboards/${week}/${platform}/${filename}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage.from('images').upload(fullPath, buffer, {
        contentType: mime,
        upsert: false,
      });

      if (error) {
        throw new Error(error.message);
      }

      const { data: pub } = supabase.storage.from('images').getPublicUrl(fullPath);
      uploaded.push({
        path: fullPath,
        name: filename,
        url: pub.publicUrl,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ok: true,
      uploaded,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error subiendo capturas.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Solo el administrador puede guardar el orden.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const week = String(body?.week || '').trim();
    const platform = String(body?.platform || '').trim().toLowerCase();
    const order = Array.isArray(body?.order)
      ? body.order.filter((p: unknown): p is string => typeof p === 'string' && p.startsWith(`weekly-dashboards/${week}/${platform}/`))
      : [];

    if (!isValidWeekKey(week) || !isValidPlatform(platform)) {
      return NextResponse.json({ error: 'Semana o plataforma inválida.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const orderPath = `weekly-dashboards/${week}/${platform}/${ORDER_FILE_NAME}`;
    const payload = Buffer.from(JSON.stringify(order), 'utf8');

    const { error } = await supabase.storage.from('images').upload(orderPath, payload, {
      contentType: 'application/json',
      upsert: true,
      cacheControl: '0',
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, week, platform, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error guardando el orden del dashboard.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Solo el administrador puede eliminar capturas.' }, { status: 401 });
  }

  try {
    const filePath = (request.nextUrl.searchParams.get('path') || '').trim();
    if (!filePath.startsWith('weekly-dashboards/') || filePath.includes('..')) {
      return NextResponse.json({ error: 'Ruta de imagen inválida.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from('images').remove([filePath]);
    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, deleted: filePath });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error eliminando captura.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
