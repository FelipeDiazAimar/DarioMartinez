'use client';

const VISITOR_STORAGE_KEY = 'dm_visitor_id';
const SESSION_STORAGE_KEY = 'dm_session_id';
const ATTRIBUTION_STORAGE_KEY = 'dm_session_attribution';

export type AnalyticsEventType =
  | 'page_view'
  | 'product_click'
  | 'whatsapp_click'
  | 'social_click'
  | 'contact_submit'
  | 'tool_download';

type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  refCode?: string;
  referrer?: string;
};

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!id) {
      id = generateId('v');
      localStorage.setItem(VISITOR_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id = generateId('s');
      sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return getVisitorId();
  }
}

function detectClientDevice(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function resolveSessionAttribution(): Attribution {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source')?.trim() || undefined;
  const utmMedium = params.get('utm_medium')?.trim() || undefined;
  const utmCampaign = params.get('utm_campaign')?.trim() || undefined;
  const refCode = params.get('ref')?.trim() || undefined;
  const rawReferrer = document.referrer?.trim() || undefined;

  let stored: Attribution = {};
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Attribution;
  } catch {
    stored = {};
  }

  const next: Attribution = {
    utmSource: utmSource || stored.utmSource,
    utmMedium: utmMedium || stored.utmMedium,
    utmCampaign: utmCampaign || stored.utmCampaign,
    refCode: refCode || stored.refCode,
    referrer: stored.referrer || rawReferrer,
  };

  try {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }

  return next;
}

export function trackEvent(
  eventType: AnalyticsEventType,
  options: {
    path?: string;
    label?: string;
    metadata?: Record<string, unknown>;
  } = {}
) {
  if (typeof window === 'undefined') return;
  const currentPath = options.path || window.location.pathname || '/';
  if (currentPath.startsWith('/admin')) return;

  const attribution = resolveSessionAttribution();
  const payload = JSON.stringify({
    eventType,
    path: currentPath,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    deviceType: detectClientDevice(),
    referrer: attribution.referrer || null,
    utmSource: attribution.utmSource || null,
    utmMedium: attribution.utmMedium || null,
    utmCampaign: attribution.utmCampaign || null,
    refCode: attribution.refCode || null,
    label: options.label || null,
    metadata: options.metadata || {},
  });

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/analytics/track', blob);
      if (sent) return;
    }
  } catch {
    // fallback to fetch
  }

  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // non-blocking analytics
  });
}
