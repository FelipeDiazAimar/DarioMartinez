import Link from 'next/link';
import { Search } from 'lucide-react';
import { LoadingImage } from '@/components/loading-image';
import { Footer } from '@/components/footer';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';
import { fetchCatalogCategoryData, fetchCatalogItems, fetchCatalogItemsPage } from './catalog-utils';

export const dynamic = 'force-dynamic';

type AdminTestBdPageProps = {
  searchParams?: Promise<{
    cat?: string;
    q?: string;
    page?: string;
    visible?: string;
  }>;
};

const INITIAL_VISIBLE = 30;
const MAX_VISIBLE_PER_PAGE = 60;

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function normalizeVisible(value: number) {
  if (value <= INITIAL_VISIBLE) {
    return INITIAL_VISIBLE;
  }
  return MAX_VISIBLE_PER_PAGE;
}

function buildCatalogHref(options: {
  page?: number;
  visible?: number;
  cat?: string;
  q?: string;
}) {
  const params = new URLSearchParams();

  const page = options.page ?? 1;
  const visible = options.visible ?? INITIAL_VISIBLE;

  if (options.cat && options.cat !== 'all') {
    params.set('cat', options.cat);
  }

  if (options.q && options.q.trim().length > 0) {
    params.set('q', options.q.trim());
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  if (visible > INITIAL_VISIBLE) {
    params.set('visible', String(normalizeVisible(visible)));
  }

  const query = params.toString();
  return query ? `/productos?${query}` : '/productos';
}

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
    const currentPage = parsePositiveInt(resolvedSearchParams?.page, 1);
    const visibleRequested = parsePositiveInt(resolvedSearchParams?.visible, INITIAL_VISIBLE);
    const useFastMode = selectedCategoryId === 'all';

    let inStockItems: Awaited<ReturnType<typeof fetchCatalogItems>>['visibleInStockItems'] = [];
    let filteredItems: typeof inStockItems = [];
    let totalPages = 1;
    let effectivePage = 1;
    let pageItemsWindow: typeof inStockItems = [];

    if (useFastMode) {
      const catalogPageResult = await fetchCatalogItemsPage(apiBaseUrl, apiToken, {
        page: currentPage,
        pageSize: MAX_VISIBLE_PER_PAGE,
        searchTerm: searchTerm || undefined,
      });

      endpointUsed = catalogPageResult.endpointUsed;
      inStockItems = catalogPageResult.visibleInStockItems;
      filteredItems = inStockItems;
      totalPages = Math.max(1, catalogPageResult.totalPages);
      effectivePage = Math.min(catalogPageResult.page, totalPages);
      pageItemsWindow = filteredItems;
    } else {
      const catalogResult = await fetchCatalogItems(apiBaseUrl, apiToken);
      endpointUsed = catalogResult.endpointUsed;
      inStockItems = catalogResult.visibleInStockItems;

      const articleNumbersForCategoryFilter = inStockItems.map((item) => item.articleNumber).filter(Boolean);
      const categoryDataForFilter = await fetchCatalogCategoryData(articleNumbersForCategoryFilter);
      const articleCategoryMapForFilter = categoryDataForFilter.articleCategoryByNumber;

      const filteredByCategoryItems = inStockItems.filter((item) => {
        return articleCategoryMapForFilter[item.articleNumber] === selectedCategoryId;
      });

      const normalizedSearchTerm = searchTerm.toLowerCase();
      filteredItems =
        normalizedSearchTerm.length === 0
          ? filteredByCategoryItems
          : filteredByCategoryItems.filter((item) => {
              const searchableText = [item.title, item.descriptionAdditional, item.articleNumber].filter(Boolean).join(' ').toLowerCase();
              return searchableText.includes(normalizedSearchTerm);
            });

      totalPages = Math.max(1, Math.ceil(filteredItems.length / MAX_VISIBLE_PER_PAGE));
      effectivePage = Math.min(currentPage, totalPages);
      const pageWindowStart = (effectivePage - 1) * MAX_VISIBLE_PER_PAGE;
      const pageWindowEnd = pageWindowStart + MAX_VISIBLE_PER_PAGE;
      pageItemsWindow = filteredItems.slice(pageWindowStart, pageWindowEnd);
    }

    const articleNumbers = pageItemsWindow.map((item) => item.articleNumber).filter(Boolean);

    const categoryData = await fetchCatalogCategoryData(articleNumbers);
    const categories = categoryData.categories;
    const articleCategoryByNumber = categoryData.articleCategoryByNumber;
    const categoriesById = Object.fromEntries(categories.map((category) => [category.id, category.nombre]));

    const normalizedVisible = normalizeVisible(visibleRequested);
    const currentVisible = Math.min(normalizedVisible, pageItemsWindow.length || INITIAL_VISIBLE);
    const paginatedItems = pageItemsWindow.slice(0, currentVisible);
    const hasPreviousPage = effectivePage > 1;
    const hasMoreWithinPage = currentVisible < Math.min(MAX_VISIBLE_PER_PAGE, pageItemsWindow.length);
    const hasNextPage = effectivePage < totalPages;
    const showLoadMoreOnly = hasMoreWithinPage;
    const showPageNavigation = !hasMoreWithinPage && totalPages > 1;

    const previousPageHref = buildCatalogHref({
      page: Math.max(1, effectivePage - 1),
      visible: INITIAL_VISIBLE,
      cat: selectedCategoryId,
      q: searchTerm,
    });

    const nextPageHref = buildCatalogHref({
      page: Math.min(totalPages, effectivePage + 1),
      visible: INITIAL_VISIBLE,
      cat: selectedCategoryId,
      q: searchTerm,
    });

    const loadMoreHref = buildCatalogHref({
      page: effectivePage,
      visible: MAX_VISIBLE_PER_PAGE,
      cat: selectedCategoryId,
      q: searchTerm,
    });

    const pageNumberLinks = Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      return {
        page,
        href: buildCatalogHref({
          page,
          visible: INITIAL_VISIBLE,
          cat: selectedCategoryId,
          q: searchTerm,
        }),
      };
    });

    const categoryHref = (categoryId: string) =>
      buildCatalogHref({
        page: 1,
        visible: INITIAL_VISIBLE,
        cat: categoryId,
        q: searchTerm,
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
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="visible" value={String(INITIAL_VISIBLE)} />
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
              <Link href="/productos" className="rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted">
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
                    href={categoryHref('all')}
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
                      href={categoryHref(category.id)}
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
              <>
                <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedItems.map((item) => {
                  const categoryId = articleCategoryByNumber[item.articleNumber];
                  const categoryName = categoryId ? categoriesById[categoryId] : undefined;

                  return (
                    <Link
                      key={item.id}
                      href={`/productos/${encodeURIComponent(item.id)}`}
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

                <div className="mt-6 flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {paginatedItems.length} de {pageItemsWindow.length} en esta página. Página {effectivePage} de {totalPages}.
                  </p>
                  {showLoadMoreOnly ? (
                    <Link
                      href={loadMoreHref}
                      scroll={false}
                      className="rounded-full border border-blue-600 bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                      Ver más
                    </Link>
                  ) : showPageNavigation ? (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {hasPreviousPage ? (
                        <Link
                          href={previousPageHref}
                          className="rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                          Anterior página
                        </Link>
                      ) : null}

                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {pageNumberLinks.map((item) => (
                          <Link
                            key={item.page}
                            href={item.href}
                            className={`min-w-9 rounded-full border px-3 py-2 text-center text-sm font-medium transition-colors ${
                              item.page === effectivePage
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
                            }`}
                            aria-current={item.page === effectivePage ? 'page' : undefined}
                          >
                            {item.page}
                          </Link>
                        ))}
                      </div>

                      {hasNextPage ? (
                        <Link
                          href={nextPageHref}
                          className="rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                          Siguiente página
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </>
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
