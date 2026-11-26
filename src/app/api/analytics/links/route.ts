import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function isAuthorized(request: NextRequest): boolean {
  return request.cookies.get('admin_auth')?.value === '1';
}

const VALID_CHANNELS = new Set(['whatsapp', 'facebook', 'instagram', 'google']);

const DEFAULT_PRESET_LINKS = [
  {
    id: -1,
    channel: 'whatsapp',
    name: 'Perfil / Estado WhatsApp (Inicio)',
    target_path: '/',
    utm_source: 'whatsapp',
    utm_medium: 'social',
    utm_campaign: 'perfil_whatsapp',
    ref_code: 'wa_perfil',
  },
  {
    id: -2,
    channel: 'whatsapp',
    name: 'WhatsApp Catálogo Productos',
    target_path: '/productos',
    utm_source: 'whatsapp',
    utm_medium: 'social',
    utm_campaign: 'catalogo_whatsapp',
    ref_code: 'wa_catalogo',
  },
  {
    id: -3,
    channel: 'instagram',
    name: 'Bio de Instagram (Inicio)',
    target_path: '/',
    utm_source: 'instagram',
    utm_medium: 'social',
    utm_campaign: 'bio_instagram',
    ref_code: 'ig_bio',
  },
  {
    id: -4,
    channel: 'instagram',
    name: 'Instagram Historias / Productos',
    target_path: '/productos',
    utm_source: 'instagram',
    utm_medium: 'social',
    utm_campaign: 'stories_instagram',
    ref_code: 'ig_stories',
  },
  {
    id: -5,
    channel: 'facebook',
    name: 'Página de Facebook (Inicio)',
    target_path: '/',
    utm_source: 'facebook',
    utm_medium: 'social',
    utm_campaign: 'perfil_facebook',
    ref_code: 'fb_perfil',
  },
  {
    id: -6,
    channel: 'facebook',
    name: 'Facebook POSBerry & Fiscales',
    target_path: '/posberry',
    utm_source: 'facebook',
    utm_medium: 'social',
    utm_campaign: 'posberry_facebook',
    ref_code: 'fb_posberry',
  },
  {
    id: -7,
    channel: 'google',
    name: 'Perfil de Google / Maps (Inicio)',
    target_path: '/',
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: 'google_maps_perfil',
    ref_code: 'g_maps',
  },
  {
    id: -8,
    channel: 'google',
    name: 'Google Servicio Técnico',
    target_path: '/servicios',
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: 'google_servicios',
    ref_code: 'g_servicios',
  },
];

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    msg.includes('could not find the table') ||
    msg.includes('does not exist')
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('referral_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (isMissingTableError(error)) {
      return NextResponse.json({
        links: DEFAULT_PRESET_LINKS,
        persisted: false,
      });
    }

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      links: data && data.length > 0 ? data : DEFAULT_PRESET_LINKS,
      persisted: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cargar enlaces';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const channel = typeof body.channel === 'string' && VALID_CHANNELS.has(body.channel) ? body.channel : 'whatsapp';
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const targetPath =
      typeof body.targetPath === 'string' && body.targetPath.startsWith('/')
        ? body.targetPath.trim().slice(0, 180)
        : '/';
    const utmMedium =
      typeof body.utmMedium === 'string' && body.utmMedium.trim()
        ? body.utmMedium.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 60)
        : channel === 'google'
          ? 'organic'
          : 'social';
    const utmCampaign =
      typeof body.utmCampaign === 'string' && body.utmCampaign.trim()
        ? body.utmCampaign.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 80)
        : `${channel}_campana`;
    const refCode =
      typeof body.refCode === 'string' && body.refCode.trim()
        ? body.refCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 60)
        : `${channel.slice(0, 2)}_${Date.now().toString(36)}`;

    if (!name) {
      return NextResponse.json({ error: 'Ingresá un nombre para identificar el enlace.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('referral_links')
      .insert({
        channel,
        name,
        target_path: targetPath,
        utm_source: channel,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        ref_code: refCode,
      })
      .select()
      .single();

    if (isMissingTableError(error)) {
      return NextResponse.json(
        {
          error:
            'Primero ejecutá el SQL de activación en Supabase (botón "Copiar SQL") para guardar enlaces personalizados.',
        },
        { status: 409 }
      );
    }

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ link: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear enlace';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const idParam = request.nextUrl.searchParams.get('id');
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('referral_links').delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar enlace';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
