import { NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';

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

function buildHeaders(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`,
  };
}

export async function GET(request: Request) {
  let targetUrl = '';
  try {
    const { apiBaseUrl, apiToken } = getApiConfig();
    const requestUrl = new URL(request.url);
    const page = requestUrl.searchParams.get('page');
    const pageSize = requestUrl.searchParams.get('pageSize');

    const requestedPage = Number.parseInt(page ?? '1', 10);
    const requestedPageSize = Number.parseInt(pageSize ?? '30', 10);
    const safePage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const safePageSize = Number.isFinite(requestedPageSize)
      ? Math.min(Math.max(requestedPageSize, 1), 200)
      : 30;

    const backendUrl = new URL(`${apiBaseUrl}/articulos`);

    if (page) {
      backendUrl.searchParams.set('page', page);
    }

    if (pageSize) {
      backendUrl.searchParams.set('pageSize', pageSize);
    }

    targetUrl = backendUrl.toString();

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: buildHeaders(apiToken),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({} as any));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    const data = Array.isArray(payload?.data) ? payload.data : [];

    const backendHasPagination =
      payload?.pagination &&
      Number.isFinite(Number(payload.pagination.page)) &&
      Number.isFinite(Number(payload.pagination.pageSize)) &&
      Number.isFinite(Number(payload.pagination.total));

    if (backendHasPagination) {
      return NextResponse.json(payload, { status: response.status });
    }

    const total = data.length;
    const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 1;
    const normalizedPage = Math.min(Math.max(safePage, 1), totalPages);
    const offset = (normalizedPage - 1) * safePageSize;
    const paginatedData = data.slice(offset, offset + safePageSize);

    return NextResponse.json(
      {
        ...payload,
        success: true,
        data: paginatedData,
        pagination: {
          page: normalizedPage,
          pageSize: safePageSize,
          total,
          totalPages,
        },
      },
      { status: response.status },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudieron obtener los artículos.',
        targetUrl: targetUrl || process.env.API_BASE_URL || 'sin definir',
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiBaseUrl, apiToken } = getApiConfig();

    const response = await fetch(`${apiBaseUrl}/articulos`, {
      method: 'POST',
      headers: {
        ...buildHeaders(apiToken),
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
        message: error?.message || 'No se pudo crear el artículo.',
      },
      { status: 500 },
    );
  }
}
