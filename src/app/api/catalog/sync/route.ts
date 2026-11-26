import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { syncCatalogChangesToSupabase } from '@/lib/catalog-sync';

function isSyncAuthorized(request: NextRequest): boolean {
  if (request.cookies.get('admin_auth')?.value === '1') {
    return true;
  }
  const apiToken = process.env.API_TOKEN;
  if (!apiToken) return false;

  const authHeader = request.headers.get('authorization') || '';
  const syncHeader = request.headers.get('x-sync-token') || '';
  return authHeader === `Bearer ${apiToken}` || syncHeader === apiToken;
}

export async function GET(request: NextRequest) {
  if (!isSyncAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('catalogo_sync_state')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (error.code === '42P01' || error.code === 'PGRST205' || msg.includes('could not find')) {
        return NextResponse.json({ needsSetup: true, state: null });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ needsSetup: false, state: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error consultando estado de sincronización';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSyncAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const result = await syncCatalogChangesToSupabase();
    return NextResponse.json(result, { status: result.needsSetup ? 409 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al sincronizar catálogo';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
