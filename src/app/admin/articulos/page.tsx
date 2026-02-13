import { getProductos } from '@/lib/mysql';
import Link from 'next/link';
import { AdminScrollableTable } from '@/components/admin-scrollable-table';

type ProductRow = Record<string, unknown>;

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

type AdminArticulosPageProps = {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    column?: string;
    query?: string;
    order?: string;
  }>;
};

export default async function AdminArticulosPage({ searchParams }: AdminArticulosPageProps) {
  const basePath = '/admin/articulos';

  try {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams?.page ?? '1');
    const pageSize = Number(resolvedSearchParams?.pageSize ?? '200');
    const selectedColumn = resolvedSearchParams?.column;
    const query = resolvedSearchParams?.query;
    const order = resolvedSearchParams?.order ?? 'asc';

    const {
      schema,
      tableName,
      rows,
      total,
      totalPages,
      page: currentPage,
      pageSize: currentPageSize,
      availableColumns,
      searchColumn,
      searchTerm,
    } = await getProductos(page, pageSize, {
      tableName: 'articulos',
      searchColumn: selectedColumn,
      searchTerm: query,
      orderBy: selectedColumn,
      orderDirection: order as 'asc' | 'desc',
    });

    const products = rows as ProductRow[];
    const columns = availableColumns;
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
          <h1 className="text-2xl font-semibold tracking-tight">Base de datos de Dario Martinez Computación (Artículos)</h1>
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
    const message = error instanceof Error ? error.message : 'Error desconocido';

    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Conexión con la base de datos de Dario Martinez Computación</h1>
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          No se pudo leer la tabla: {message}
        </p>
      </main>
    );
  }
}
