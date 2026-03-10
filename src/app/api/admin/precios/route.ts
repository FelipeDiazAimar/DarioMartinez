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

    const search = requestUrl.searchParams.get('search');

    const backendUrl = new URL(`${apiBaseUrl}/precios`);

    if (!search) {
      if (page) backendUrl.searchParams.set('page', page);
      if (pageSize) backendUrl.searchParams.set('pageSize', pageSize);
    }

    if (search) {
      backendUrl.searchParams.set('search', search);
    }

    targetUrl = backendUrl.toString();

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: buildHeaders(apiToken),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({} as Record<string, unknown>));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    const data = Array.isArray(payload?.data) ? payload.data : [];

    if (search) {
      const term = search.toLowerCase();
      const filtered = data.filter((row: Record<string, unknown>) => {
        const art = String(row.articulo ?? '').toLowerCase();
        const lin = String(row.linea ?? '').toLowerCase();
        const rub = String(row.rubro ?? '').toLowerCase();
        const mon = String(row.moneda ?? '').toLowerCase();
        return art.includes(term) || lin.includes(term) || rub.includes(term) || mon.includes(term);
      });

      const total = filtered.length;
      const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 1;
      const normalizedPage = Math.min(Math.max(safePage, 1), totalPages);
      const offset = (normalizedPage - 1) * safePageSize;
      const paginatedData = filtered.slice(offset, offset + safePageSize);

      return NextResponse.json({
        success: true,
        data: paginatedData,
        pagination: { page: normalizedPage, pageSize: safePageSize, total, totalPages },
      });
    }

    const backendHasPagination =
      payload?.pagination &&
      Number.isFinite(Number((payload.pagination as Record<string, unknown>).page)) &&
      Number.isFinite(Number((payload.pagination as Record<string, unknown>).total));

    if (backendHasPagination) {
      return NextResponse.json(payload, { status: response.status });
    }

    const total = data.length;
    const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 1;
    const normalizedPage = Math.min(Math.max(safePage, 1), totalPages);
    const offset = (normalizedPage - 1) * safePageSize;
    const paginatedData = data.slice(offset, offset + safePageSize);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: { page: normalizedPage, pageSize: safePageSize, total, totalPages },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'No se pudieron obtener los precios.';
    return NextResponse.json(
      {
        success: false,
        message,
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

    const response = await fetch(`${apiBaseUrl}/precios`, {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el precio.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { apiBaseUrl, apiToken } = getApiConfig();
    const requestUrl = new URL(request.url);
    const body = await request.json();

    const backendUrl = new URL(`${apiBaseUrl}/precios`);
    backendUrl.searchParams.set('linea', requestUrl.searchParams.get('linea') ?? '');
    backendUrl.searchParams.set('rubro', requestUrl.searchParams.get('rubro') ?? '');
    backendUrl.searchParams.set('articulo', requestUrl.searchParams.get('articulo') ?? '');
    backendUrl.searchParams.set('mercado', requestUrl.searchParams.get('mercado') ?? '');

    const response = await fetch(backendUrl.toString(), {
      method: 'PUT',
      headers: {
        ...buildHeaders(apiToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el precio.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { apiBaseUrl, apiToken } = getApiConfig();
    const requestUrl = new URL(request.url);

    const backendUrl = new URL(`${apiBaseUrl}/precios`);
    backendUrl.searchParams.set('linea', requestUrl.searchParams.get('linea') ?? '');
    backendUrl.searchParams.set('rubro', requestUrl.searchParams.get('rubro') ?? '');
    backendUrl.searchParams.set('articulo', requestUrl.searchParams.get('articulo') ?? '');
    backendUrl.searchParams.set('mercado', requestUrl.searchParams.get('mercado') ?? '');

    const response = await fetch(backendUrl.toString(), {
      method: 'DELETE',
      headers: buildHeaders(apiToken),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el precio.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
