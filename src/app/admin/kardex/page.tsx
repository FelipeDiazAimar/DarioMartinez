import Link from 'next/link';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';
import { AdminScrollableTable } from '@/components/admin-scrollable-table';

export const dynamic = 'force-dynamic';

const KARDEX_PAGE_SIZE = 30;

type ProductRow = Record<string, unknown>;

type LoadErrorDetails = {
  title: string;
  step: string;
  technicalDetail: string;
  nextActions: string[];
};

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}

function buildLoadErrorDetails(step: string, rawMessage: string, endpoint: string | null): LoadErrorDetails {
  const normalized = rawMessage.toLowerCase();
  const technicalDetail = rawMessage;
  const endpointText = endpoint ?? 'No disponible';

  if (normalized.includes('api_base_url') || normalized.includes('api_token')) {
    return {
      title: 'Faltan datos de configuración para conectar la API.',
      step,
      technicalDetail,
      nextActions: [
        'Abrí Vercel → Project Settings → Environment Variables.',
        'Verificá que API_BASE_URL y API_TOKEN existan y estén activos en el entorno actual.',
        'Guardá cambios y redeployá el proyecto.',
      ],
    };
  }

  if (normalized.includes('fetch failed') || normalized.includes('failed to fetch')) {
    return {
      title: 'No se pudo contactar al servidor de datos.',
      step,
      technicalDetail,
      nextActions: [
        `Comprobá que la API esté levantada y respondiendo en: ${endpointText}.`,
        'Si usás tunnel (Railway/Render/local), verificá que la URL no haya cambiado.',
        'Probá recargar en 10 segundos. Si persiste, reiniciá la API backend.',
      ],
    };
  }

  if (normalized.includes('unexpected token') || normalized.includes('json')) {
    return {
      title: 'La API respondió, pero el formato de datos no fue válido.',
      step,
      technicalDetail,
      nextActions: [
        'Revisá el endpoint /kardex en la API para confirmar que devuelve JSON válido.',
        'Comprobá que la respuesta incluya success=true y data como arreglo.',
        'Si hubo cambios recientes en backend, revertí o ajustá el contrato de respuesta.',
      ],
    };
  }

  return {
    title: 'Ocurrió un error al cargar la tabla de kardex.',
    step,
    technicalDetail,
    nextActions: [
      'Actualizá la página para reintentar la carga.',
      'Verificá conectividad de la API y credenciales del proyecto.',
      'Si continúa fallando, compartí el detalle técnico con soporte/desarrollo.',
    ],
  };
}

function toCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

type AdminKardexPageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    column?: string;
    query?: string;
    order?: string;
  }>;
};

export default async function AdminKardexPage({ searchParams }: AdminKardexPageProps) {
  const basePath = '/admin/kardex';
  let currentStep = '1) Preparando configuración de conexión';
  let endpoint: string | null = null;

  try {
    currentStep = '2) Leyendo variables de entorno';
    const apiBaseUrl = process.env.API_BASE_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiBaseUrl || !apiToken) {
      throw new Error('Faltan API_BASE_URL o API_TOKEN en variables de entorno de Vercel.');
    }

    currentStep = '3) Procesando parámetros de búsqueda';
    const resolvedSearchParams = await searchParams;
    const requestedPage = Number(resolvedSearchParams?.page ?? '1');
    const selectedColumn = resolvedSearchParams?.column?.trim();
    const query = resolvedSearchParams?.query?.trim();
    const order = resolvedSearchParams?.order ?? 'asc';

    const safePageSize = KARDEX_PAGE_SIZE;
    const safePage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;

    const endpointUrl = new URL(`${resolveApiBaseUrl(apiBaseUrl)}/kardex`);
    endpointUrl.searchParams.set('page', String(safePage));
    endpointUrl.searchParams.set('pageSize', String(safePageSize));

    if (selectedColumn) {
      endpointUrl.searchParams.set('column', selectedColumn);
    }

    if (query) {
      endpointUrl.searchParams.set('query', query);
    }

    if (order) {
      endpointUrl.searchParams.set('order', order);
    }

    endpoint = endpointUrl.toString();
    currentStep = '4) Consultando API de kardex';
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      cache: 'no-store',
    });

    currentStep = '5) Interpretando respuesta de la API';
    const payload = await response.json();

    currentStep = '6) Validando estructura de datos recibida';
    if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
      throw new Error(payload?.message || 'La API no devolvió un resultado válido para kardex.');
    }

    currentStep = '7) Preparando datos para mostrar en tabla';
    const allRows = payload.data as ProductRow[];
    const apiPagination = payload?.pagination;
    const columns = Array.from(
      allRows.reduce((acc, row) => {
        Object.keys(row).forEach((key) => acc.add(key));
        return acc;
      }, new Set<string>()),
    );

    const searchColumn = selectedColumn && columns.includes(selectedColumn) ? selectedColumn : undefined;
    const searchTerm = query && query.length > 0 ? query : undefined;

    const total = Number(apiPagination?.total ?? allRows.length);
    const totalPages = Number(apiPagination?.totalPages ?? 1);
    const currentPage = Number(apiPagination?.page ?? safePage);
    const currentPageSize = Number(apiPagination?.pageSize ?? safePageSize);
    const products = allRows;
    const schema = 'api';
    const tableName = 'kardex';

    const displayRows = products.map((product) => {
      const row: Record<string, string> = {};

      for (const column of columns) {
        row[column] = toCellValue(product[column]);
      }

      return row;
    });
    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    const buildHref = (targetPage: number) => {
      const params = new URLSearchParams();
      params.set('page', String(targetPage));
      params.set('pageSize', String(currentPageSize));

      if (searchColumn) {
        params.set('column', searchColumn);
      }

      if (searchTerm) {
        params.set('query', searchTerm);
      }

      if (order !== 'asc') {
        params.set('order', order);
      }

      return `${basePath}?${params.toString()}`;
    };

    return (
      <main className="mx-auto w-full max-w-[1400px] space-y-6 p-6">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Base de datos de Dario Martinez Computación (Kardex)</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tabla: {schema}.{tableName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Mostrando {products.length} de {total} registros · Página {currentPage} de {totalPages}
          </p>

          <form action={basePath} method="get" className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <input type="hidden" name="pageSize" value={String(currentPageSize)} />
            <select
              name="column"
              defaultValue={searchColumn ?? ''}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Selecciona una columna</option>
              {columns.map((column: string) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>

            <input
              name="query"
              defaultValue={searchTerm ?? ''}
              placeholder="Buscar en la columna seleccionada..."
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />

            <select
              name="order"
              defaultValue={order}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="asc">Ascendente (menor a mayor / A-Z)</option>
              <option value="desc">Descendente (mayor a menor / Z-A)</option>
            </select>

            <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              Buscar
            </button>

            <Link href={`${basePath}?page=1&pageSize=${currentPageSize}`} className="h-10 rounded-md border px-4 text-sm leading-10">
              Limpiar
            </Link>
          </form>

          <div className="mt-4 flex items-center gap-2">
            {hasPrev ? (
              <Link className="rounded-md border px-3 py-1 text-sm hover:bg-muted" href={buildHref(currentPage - 1)}>
                Anterior
              </Link>
            ) : (
              <span className="rounded-md border px-3 py-1 text-sm text-muted-foreground">Anterior</span>
            )}

            {hasNext ? (
              <Link className="rounded-md border px-3 py-1 text-sm hover:bg-muted" href={buildHref(currentPage + 1)}>
                Siguiente
              </Link>
            ) : (
              <span className="rounded-md border px-3 py-1 text-sm text-muted-foreground">Siguiente</span>
            )}
          </div>
        </section>

        <AdminScrollableTable
          columns={columns}
          rows={displayRows}
          emptyMessage={`No hay registros en la tabla ${tableName}.`}
        />
      </main>
    );
  } catch (error) {
    const message = normalizeErrorMessage(error);
    const details = buildLoadErrorDetails(currentStep, message, endpoint);

    console.error('[ADMIN][KARDEX] Error de carga', {
      step: currentStep,
      endpoint,
      message,
      error,
    });

    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Conexión con la base de datos de Dario Martinez Computación</h1>
        <section className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <p className="font-semibold text-destructive">{details.title}</p>
          <p className="mt-2 text-destructive">Paso donde falló: {details.step}</p>
          <p className="mt-2 text-destructive">Detalle técnico: {details.technicalDetail}</p>

          <div className="mt-3">
            <p className="font-medium text-destructive">Cómo proceder:</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-destructive">
              {details.nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    );
  }
}
