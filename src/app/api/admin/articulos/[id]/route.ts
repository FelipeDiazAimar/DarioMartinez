import { NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function getApiConfig() {
  const apiBaseUrl = process.env.API_BASE_URL;
  const apiToken = process.env.API_TOKEN;

  if (!apiBaseUrl || !apiToken) {
    throw new Error('Faltan API_BASE_URL o API_TOKEN en variables de entorno.');
  }

  return {
    apiBaseUrl: resolveApiBaseUrl(apiBaseUrl),
    apiToken,
  };
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { apiBaseUrl, apiToken } = getApiConfig();
    const requestUrl = new URL(request.url);
    const by = requestUrl.searchParams.get('by');

    const backendUrl = new URL(`${apiBaseUrl}/articulos/${encodeURIComponent(id)}`);
    if (by) {
      backendUrl.searchParams.set('by', by);
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));

    return NextResponse.json(payload, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo actualizar el artículo.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { apiBaseUrl, apiToken } = getApiConfig();
    const requestUrl = new URL(request.url);
    const by = requestUrl.searchParams.get('by');

    const backendUrl = new URL(`${apiBaseUrl}/articulos/${encodeURIComponent(id)}`);
    if (by) {
      backendUrl.searchParams.set('by', by);
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));

    return NextResponse.json(payload, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo eliminar el artículo.',
      },
      { status: 500 },
    );
  }
}
