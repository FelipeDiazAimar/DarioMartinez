import { NextResponse } from 'next/server';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';

const DEFAULT_CATALOG_API_BASE_URL = 'https://dariomartinezcomputacion.com/api/admin';

function getApiConfig() {
  const apiBaseUrl = process.env.API_BASE_URL?.trim() || DEFAULT_CATALOG_API_BASE_URL;
  const apiToken = process.env.API_TOKEN?.trim();

  return {
    apiBaseUrl: resolveApiBaseUrl(apiBaseUrl),
    apiToken,
  };
}

function buildHeaders(apiToken?: string) {
  if (!apiToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${apiToken}`,
  };
}

function toComparableValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  const text = String(value).trim();
  const asNumber = Number(text.replace(',', '.'));
  if (!Number.isNaN(asNumber) && text !== '') {
    return asNumber;
  }

  return text.toLowerCase();
}

function getRowValueByColumn(row: Record<string, unknown>, column: string) {
  const direct = row[column];
  if (direct !== undefined) {
    return direct;
  }

  const lowered = column.toLowerCase();
  const foundKey = Object.keys(row).find((key) => key.toLowerCase() === lowered);
  return foundKey ? row[foundKey] : undefined;
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
    const searchFieldRaw = requestUrl.searchParams.get('searchField')?.trim() || 'all';
    const searchField = searchFieldRaw.toLowerCase();
    const sortByRaw = requestUrl.searchParams.get('sortBy')?.trim() || '';
    const sortDirectionRaw = requestUrl.searchParams.get('sortDirection')?.trim().toLowerCase() || 'asc';
    const sortDirection = sortDirectionRaw === 'desc' ? 'desc' : 'asc';
    const hasSearch = Boolean(search && search.trim());
    const hasSort = Boolean(sortByRaw);

    const backendUrl = new URL(`${apiBaseUrl}/articulos`);

    // When searching or sorting, fetch all rows so we can process locally
    // (the remote backend may not support these params)
    if (!hasSearch && !hasSort) {
      if (page) backendUrl.searchParams.set('page', page);
      if (pageSize) backendUrl.searchParams.set('pageSize', pageSize);
    }

    if (hasSearch) {
      backendUrl.searchParams.set('search', search);
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

    // If we have a search term or sort, always process + paginate locally.
    if (hasSearch || hasSort) {
      const term = (search ?? '').toLowerCase().trim();
      const sourceRows = hasSearch
        ? data.filter((row: Record<string, unknown>) => {
            if (searchField === 'all') {
              return Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term));
            }

            const value = getRowValueByColumn(row, searchFieldRaw);
            return String(value ?? '').toLowerCase().includes(term);
          })
        : data;

      const sorted = hasSort
        ? [...sourceRows].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const valueA = toComparableValue(getRowValueByColumn(a, sortByRaw));
            const valueB = toComparableValue(getRowValueByColumn(b, sortByRaw));

            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          })
        : sourceRows;

      const total = sorted.length;
      const totalPages = total > 0 ? Math.ceil(total / safePageSize) : 1;
      const normalizedPage = Math.min(Math.max(safePage, 1), totalPages);
      const offset = (normalizedPage - 1) * safePageSize;
      const paginatedData = sorted.slice(offset, offset + safePageSize);

      return NextResponse.json({
        success: true,
        data: paginatedData,
        pagination: { page: normalizedPage, pageSize: safePageSize, total, totalPages },
      });
    }

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
