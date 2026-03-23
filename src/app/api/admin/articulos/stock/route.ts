import { NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';

const DEFAULT_CATALOG_API_BASE_URL = 'https://dariomartinezcomputacion.com/api/admin';

export async function GET() {
  try {
    const apiBaseUrl = process.env.API_BASE_URL?.trim() || DEFAULT_CATALOG_API_BASE_URL;
    const apiToken = process.env.API_TOKEN?.trim();

    const targetUrl = `${resolveApiBaseUrl(apiBaseUrl)}/articulos/stock`;

    const headers: Record<string, string> = {};
    if (apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));

    return NextResponse.json(payload, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, message },
      { status: 502 },
    );
  }
}
