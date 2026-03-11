import { NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';

export async function GET() {
  try {
    const apiBaseUrl = process.env.API_BASE_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiBaseUrl || !apiToken) {
      throw new Error('Faltan API_BASE_URL o API_TOKEN en variables de entorno.');
    }

    const targetUrl = `${resolveApiBaseUrl(apiBaseUrl)}/articulos/stock`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiToken}` },
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
