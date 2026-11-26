import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const ALLOWED_EVENTS = new Set([
  'page_view',
  'product_click',
  'whatsapp_click',
  'social_click',
  'contact_submit',
  'tool_download',
]);

function normalizeChannel(rawSource?: string | null, rawReferrer?: string | null, rawRef?: string | null): string {
  const combined = `${rawSource || ''} ${rawRef || ''} ${rawReferrer || ''}`.toLowerCase();

  if (combined.includes('whatsapp') || combined.includes('wa.me') || combined.startsWith('wa_')) {
    return 'whatsapp';
  }
  if (combined.includes('instagram') || combined.includes('l.instagram.com') || combined.startsWith('ig_')) {
    return 'instagram';
  }
  if (combined.includes('facebook') || combined.includes('fbclid') || combined.includes('fb.com') || combined.startsWith('fb_')) {
    return 'facebook';
  }
  if (combined.includes('google') || combined.includes('gclid') || combined.startsWith('g_')) {
    return 'google';
  }
  if (rawSource && rawSource.trim().length > 0 && rawSource.trim().toLowerCase() !== 'direct') {
    return rawSource.trim().toLowerCase().slice(0, 32);
  }
  if (rawReferrer && rawReferrer.trim().length > 0) {
    try {
      const url = new URL(rawReferrer);
      const host = url.hostname.replace(/^www\./, '').toLowerCase();
      if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('dariomartinez')) {
        return 'direct';
      }
      return 'other';
    } catch {
      return 'direct';
    }
  }
  return 'direct';
}

function detectDevice(userAgent: string, clientDevice?: string): 'mobile' | 'tablet' | 'desktop' {
  if (clientDevice === 'mobile' || clientDevice === 'tablet' || clientDevice === 'desktop') {
    return clientDevice;
  }
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function isBotUserAgent(userAgent: string): boolean {
  return /bot|crawler|spider|crawling|headless|lighthouse|pingdom|uptime/i.test(userAgent);
}

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    if (isBotUserAgent(userAgent)) {
      return NextResponse.json({ ok: true, ignored: 'bot' });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Payload inválido' }, { status: 400 });
    }

    const eventType = typeof body.eventType === 'string' && ALLOWED_EVENTS.has(body.eventType)
      ? body.eventType
      : 'page_view';

    const rawPath = typeof body.path === 'string' ? body.path.trim() : '/';
    const path = rawPath.startsWith('/') ? rawPath.slice(0, 200) : `/${rawPath.slice(0, 199)}`;

    // Ignorar rutas internas de administración
    if (path.startsWith('/admin')) {
      return NextResponse.json({ ok: true, ignored: 'admin' });
    }

    const visitorId = typeof body.visitorId === 'string' && body.visitorId.trim().length > 0
      ? body.visitorId.trim().slice(0, 80)
      : 'anon';

    const sessionId = typeof body.sessionId === 'string' && body.sessionId.trim().length > 0
      ? body.sessionId.trim().slice(0, 80)
      : visitorId;

    const utmSource = typeof body.utmSource === 'string' && body.utmSource.trim() ? body.utmSource.trim().slice(0, 80) : null;
    const utmMedium = typeof body.utmMedium === 'string' && body.utmMedium.trim() ? body.utmMedium.trim().slice(0, 80) : null;
    const utmCampaign = typeof body.utmCampaign === 'string' && body.utmCampaign.trim() ? body.utmCampaign.trim().slice(0, 120) : null;
    const refCode = typeof body.refCode === 'string' && body.refCode.trim() ? body.refCode.trim().slice(0, 80) : null;
    const referrer = typeof body.referrer === 'string' && body.referrer.trim() ? body.referrer.trim().slice(0, 400) : null;
    const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim().slice(0, 180) : null;
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};

    const source = normalizeChannel(utmSource, referrer, refCode);
    const deviceType = detectDevice(userAgent, typeof body.deviceType === 'string' ? body.deviceType : undefined);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('web_analytics_events').insert({
      event_type: eventType,
      path,
      visitor_id: visitorId,
      session_id: sessionId,
      device_type: deviceType,
      referrer,
      source,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      ref_code: refCode,
      label,
      metadata,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al registrar evento';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
