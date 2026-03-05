import Link from 'next/link';
import { LoadingImage } from '@/components/loading-image';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';
import { fetchCatalogCategoryData, fetchCatalogItems } from './catalog-utils';

export const dynamic = 'force-dynamic';

type AdminTestBdPageProps = {
  searchParams?: Promise<{
    cat?: string;
  }>;
};

export default async function AdminTestBdPage({ searchParams }: AdminTestBdPageProps) {
  const apiBaseUrl = process.env.API_BASE_URL;
  const apiToken = process.env.API_TOKEN;

  if (!apiBaseUrl || !apiToken) {
    return (
      <main className="mx-auto w-full max-w-6xl p-6">
        <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          Faltan API_BASE_URL o API_TOKEN en variables de entorno.
        </section>
      </main>
    );
  }

  let endpointUsed = `${resolveApiBaseUrl(apiBaseUrl)}/articulos`;

  try {
    const resolvedSearchParams = await searchParams;
    const selectedCategoryId = typeof resolvedSearchParams?.cat === 'string' ? resolvedSearchParams.cat : 'all';

    const catalogResult = await fetchCatalogItems(apiBaseUrl, apiToken);
    endpointUsed = catalogResult.endpointUsed;
    const inStockItems = catalogResult.visibleInStockItems;

    const articleNumbers = inStockItems.map((item) => item.articleNumber).filter(Boolean);

    const categoryData = await fetchCatalogCategoryData(articleNumbers);
    const categories = categoryData.categories;
    const articleCategoryByNumber = categoryData.articleCategoryByNumber;
    const categoriesById = Object.fromEntries(categories.map((category) => [category.id, category.nombre]));

    const filteredItems =
      selectedCategoryId === 'all'
        ? inStockItems
        : inStockItems.filter((item) => {
            return articleCategoryByNumber[item.articleNumber] === selectedCategoryId;
          });

    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">TestBD · Catálogo en stock</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Mostrando únicamente productos con <span className="font-medium">cantidadUnidades &gt; 0</span> y marcados para visibilidad.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Endpoint: {endpointUsed}</p>
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/admin/articulos" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
                Ver tabla completa de artículos
              </Link>
              <Link href="/admin/categorias" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
                Administrar categorías
              </Link>
            </div>
          </div>
        </section>

        <section className="relative">
          <aside className="hidden lg:block absolute top-0 left-0 w-56">
            <div className="sticky top-24 rounded-2xl border bg-card p-4 shadow-sm">
              <h3 className="mb-3 border-b pb-2 text-lg font-semibold">Categorías</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin/testbd"
                    className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                      selectedCategoryId === 'all' ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Todas
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/admin/testbd?cat=${encodeURIComponent(category.id)}`}
                      className={`block rounded-md px-2 py-1 text-sm transition-colors ${
                        selectedCategoryId === category.id
                          ? 'bg-primary/10 font-semibold text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {category.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:ml-64">
            {inStockItems.length === 0 ? (
              <section className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
                No hay productos con stock disponible en este momento.
              </section>
            ) : filteredItems.length === 0 ? (
              <section className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
                No hay productos en esta categoría.
              </section>
            ) : (
              <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => {
                  const categoryId = articleCategoryByNumber[item.articleNumber];
                  const categoryName = categoryId ? categoriesById[categoryId] : undefined;

                  return (
                    <Link
                      key={item.id}
                      href={`/admin/testbd/${encodeURIComponent(item.id)}`}
                      className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <article>
                        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-muted/30 p-4">
                          {item.imageUrl ? (
                            <LoadingImage
                              src={item.imageUrl}
                              alt={item.title}
                              width={500}
                              height={400}
                              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                              spinnerSizeClassName="h-8 w-8 border-2"
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground">Sin imagen</div>
                          )}
                        </div>

                        <div className="space-y-2 p-4">
                          <h2 className="line-clamp-2 text-base font-semibold leading-tight">{item.title}</h2>
                          {item.descriptionAdditional && <p className="line-clamp-2 text-xs text-muted-foreground">{item.descriptionAdditional}</p>}
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium">
                              Stock disponible: {item.stock}
                            </div>
                            <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium">
                              {categoryName || 'Sin categoría'}
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </section>
            )}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    return (
      <main className="mx-auto w-full max-w-6xl p-6">
        <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
          <h1 className="text-lg font-semibold text-destructive">No se pudo generar el catálogo en stock.</h1>
          <p className="mt-2 text-sm text-destructive">Detalle técnico: {message}</p>
          <p className="mt-1 text-sm text-destructive">Endpoint consultado: {endpointUsed}</p>
        </section>
      </main>
    );
  }
}
