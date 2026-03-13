import Link from 'next/link';
import { Search } from 'lucide-react';
import { LoadingImage } from '@/components/loading-image';
import { Footer } from '@/components/footer';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';
import { fetchCatalogCategoryData, fetchCatalogItems } from './catalog-utils';

export const dynamic = 'force-dynamic';

type AdminTestBdPageProps = {
  searchParams?: Promise<{
    cat?: string;
    q?: string;
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
    const searchTerm = typeof resolvedSearchParams?.q === 'string' ? resolvedSearchParams.q.trim() : '';

    const catalogResult = await fetchCatalogItems(apiBaseUrl, apiToken);
    endpointUsed = catalogResult.endpointUsed;
    const inStockItems = catalogResult.visibleInStockItems;

    const articleNumbers = inStockItems.map((item) => item.articleNumber).filter(Boolean);

    const categoryData = await fetchCatalogCategoryData(articleNumbers);
    const categories = categoryData.categories;
    const articleCategoryByNumber = categoryData.articleCategoryByNumber;
    const categoriesById = Object.fromEntries(categories.map((category) => [category.id, category.nombre]));

    const filteredByCategoryItems =
      selectedCategoryId === 'all'
        ? inStockItems
        : inStockItems.filter((item) => {
            return articleCategoryByNumber[item.articleNumber] === selectedCategoryId;
          });

    const normalizedSearchTerm = searchTerm.toLowerCase();
    const filteredItems =
      normalizedSearchTerm.length === 0
        ? filteredByCategoryItems
        : filteredByCategoryItems.filter((item) => {
            const searchableText = [item.title, item.descriptionAdditional, item.articleNumber].filter(Boolean).join(' ').toLowerCase();
            return searchableText.includes(normalizedSearchTerm);
          });

    return (
      <div className="min-h-screen w-full" style={{ backgroundColor: 'rgb(217 225 242 / 30%)' }}>
        <main className="mx-auto w-full max-w-7xl space-y-6 p-6">
          <section className="rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Nuestros Productos</h1>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Equipamiento tecnológico para potenciar tu hogar o empresa.
              </p>
            </div>
          </div>

          <form method="get" className="mt-8 flex justify-center">
            {selectedCategoryId !== 'all' ? <input type="hidden" name="cat" value={selectedCategoryId} /> : null}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={searchTerm}
                placeholder="Buscar productos..."
                className="h-12 w-full rounded-full border bg-white pl-12 pr-24 text-base shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-full border bg-background px-4 text-sm font-medium hover:bg-muted"
              >
                Buscar
              </button>
            </div>
          </form>
          {(searchTerm || selectedCategoryId !== 'all') && (
            <div className="mt-3 flex justify-center">
              <Link href="/admin/testbd" className="rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted">
                Quitar filtros
              </Link>
            </div>
          )}
          </section>

          <section className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border bg-white p-4 shadow-sm">
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

          <div>
            {inStockItems.length === 0 ? (
              <section className="rounded-2xl border bg-white p-6 text-center text-muted-foreground">
                No hay productos con stock disponible en este momento.
              </section>
            ) : searchTerm && filteredItems.length === 0 ? (
              <section className="rounded-2xl border bg-white p-6 text-center text-muted-foreground">
                No encontramos resultados para "{searchTerm}".
              </section>
            ) : filteredItems.length === 0 ? (
              <section className="rounded-2xl border bg-white p-6 text-center text-muted-foreground">
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
                      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <article>
                        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-white p-4">
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
        <Footer forceShow />
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    return (
      <div className="min-h-screen w-full" style={{ backgroundColor: 'rgb(217 225 242 / 30%)' }}>
        <main className="mx-auto w-full max-w-6xl p-6">
          <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
            <h1 className="text-lg font-semibold text-destructive">No se pudo generar el catálogo en stock.</h1>
            <p className="mt-2 text-sm text-destructive">Detalle técnico: {message}</p>
            <p className="mt-1 text-sm text-destructive">Endpoint consultado: {endpointUsed}</p>
          </section>

        </main>
        <Footer forceShow />
      </div>
    );
  }
}
