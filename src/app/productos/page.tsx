import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, Package } from 'lucide-react';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';
import { fetchCatalogCategoryData, fetchCatalogItemsPage } from './catalog-utils';
import { CatalogProductGrid } from './catalog-product-grid';

export const dynamic = 'force-dynamic';

type CatalogPageProps = {
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

export default async function ProductosCatalogPage({ searchParams }: CatalogPageProps) {
  const apiBaseUrl = process.env.API_BASE_URL || '';
  const apiToken = process.env.API_TOKEN || '';

  let endpointUsed = apiBaseUrl ? `${resolveApiBaseUrl(apiBaseUrl)}/articulos` : 'supabase://catalogo_productos';

  try {
    const resolvedSearchParams = await searchParams;
    const selectedCategoryId = typeof resolvedSearchParams?.cat === 'string' ? resolvedSearchParams.cat : 'all';
    const searchTerm = typeof resolvedSearchParams?.q === 'string' ? resolvedSearchParams.q.trim() : '';
    const currentPage = parsePositiveInt(resolvedSearchParams?.page, 1);
    const visibleRequested = parsePositiveInt(resolvedSearchParams?.visible, INITIAL_VISIBLE);

    const catalogPageResult = await fetchCatalogItemsPage(apiBaseUrl, apiToken, {
      page: currentPage,
      pageSize: MAX_VISIBLE_PER_PAGE,
      searchTerm: searchTerm || undefined,
      categoryId: selectedCategoryId,
    });

    endpointUsed = catalogPageResult.endpointUsed;
    const inStockItems = catalogPageResult.visibleInStockItems;
    const filteredItems = inStockItems;
    const totalPages = Math.max(1, catalogPageResult.totalPages);
    const effectivePage = Math.min(catalogPageResult.page, totalPages);
    const pageItemsWindow = filteredItems;

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

    const activeCategoryName = selectedCategoryId !== 'all' ? categoriesById[selectedCategoryId] : null;

    return (
      <div className="bg-brand-mist w-full text-foreground">
        {/* Cabecera del catálogo con degradé institucional */}
        <section className="bg-brand-soft w-full border-b border-border py-12 lg:py-16">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="space-y-3">
                <h1 className="font-headline text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
                  Nuestros Productos
                </h1>
                <p className="max-w-2xl text-base text-foreground/75 md:text-lg">
                  Equipamiento tecnológico para potenciar tu hogar o empresa.
                </p>
              </div>

              <form method="get" className="w-full max-w-md">
                {selectedCategoryId !== 'all' ? (
                  <input type="hidden" name="cat" value={selectedCategoryId} />
                ) : null}
                <input type="hidden" name="page" value="1" />
                <input type="hidden" name="visible" value={String(INITIAL_VISIBLE)} />
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    name="q"
                    defaultValue={searchTerm}
                    placeholder="Buscar productos por nombre o código..."
                    className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-24 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
                  />
                  <button
                    type="submit"
                    className="rb-glare absolute right-1.5 top-1/2 h-9 -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-r from-[#002878] to-[#2349B6] px-4 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-[0_8px_20px_-6px_rgba(0,48,143,0.55)] hover:brightness-110 active:scale-95"
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </div>

            {/* Filtro de categorías móvil y tablet (horizontal scrollable chips) */}
            {categories.length > 0 && (
              <div className="mt-6 lg:hidden">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                  <span>Categorías</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <Link
                    href={categoryHref('all')}
                    className={`rb-pill-interactive shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                      selectedCategoryId === 'all'
                        ? 'border-primary bg-gradient-to-r from-[#002878] to-[#2349B6] text-white shadow-sm'
                        : 'border-primary/15 bg-white text-foreground/80 hover:border-primary/45 hover:bg-[#EEF4FF] hover:text-primary'
                    }`}
                  >
                    Todas
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={categoryHref(category.id)}
                      className={`rb-pill-interactive shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold ${
                        selectedCategoryId === category.id
                          ? 'border-primary bg-gradient-to-r from-[#002878] to-[#2349B6] text-white shadow-sm'
                          : 'border-primary/15 bg-white text-foreground/80 hover:border-primary/45 hover:bg-[#EEF4FF] hover:text-primary'
                      }`}
                    >
                      {category.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(searchTerm || selectedCategoryId !== 'all') && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {activeCategoryName && (
                  <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                    Categoría: {activeCategoryName}
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground">
                    Búsqueda: “{searchTerm}”
                  </span>
                )}
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <X className="h-3 w-3" />
                  Quitar filtros
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Cuerpo del catálogo */}
        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-start lg:gap-8">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-border bg-background p-5">
                <h2 className="mb-3 border-b border-border pb-3 font-headline text-sm font-bold text-foreground">
                  Categorías
                </h2>
                <ul className="space-y-1.5">
                  <li>
                    <Link
                      href={categoryHref('all')}
                      className={`rb-pill-interactive block rounded-xl px-3.5 py-2 text-sm ${
                        selectedCategoryId === 'all'
                          ? 'bg-gradient-to-r from-[#002878] to-[#2349B6] text-white font-semibold shadow-sm'
                          : 'text-foreground/75 hover:bg-[#EEF4FF] hover:text-primary'
                      }`}
                    >
                      Todas
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={categoryHref(category.id)}
                        className={`rb-pill-interactive block rounded-xl px-3.5 py-2 text-sm ${
                          selectedCategoryId === category.id
                            ? 'bg-gradient-to-r from-[#002878] to-[#2349B6] text-white font-semibold shadow-sm'
                            : 'text-foreground/75 hover:bg-[#EEF4FF] hover:text-primary'
                        }`}
                      >
                        {category.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Grilla de productos */}
            <div>
              {inStockItems.length === 0 ? (
                <section className="rounded-2xl border border-border bg-background p-10 text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground/60" />
                  <p className="mt-3 text-base font-medium text-foreground">
                    No hay productos con stock disponible en este momento.
                  </p>
                </section>
              ) : searchTerm && filteredItems.length === 0 ? (
                <section className="rounded-2xl border border-border bg-background p-10 text-center">
                  <p className="text-base font-medium text-foreground">
                    No encontramos resultados para “{searchTerm}”.
                  </p>
                  <Link
                    href="/productos"
                    className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Ver todos los productos
                  </Link>
                </section>
              ) : filteredItems.length === 0 ? (
                <section className="rounded-2xl border border-border bg-background p-10 text-center">
                  <p className="text-base font-medium text-foreground">No hay productos en esta categoría.</p>
                  <Link
                    href="/productos"
                    className="mt-4 inline-flex rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium hover:border-primary"
                  >
                    Volver a todas las categorías
                  </Link>
                </section>
              ) : (
                <CatalogProductGrid
                  items={pageItemsWindow}
                  initialVisible={currentVisible}
                  articleCategoryByNumber={articleCategoryByNumber}
                  categoriesById={categoriesById}
                  effectivePage={effectivePage}
                  totalPages={totalPages}
                  hasPreviousPage={hasPreviousPage}
                  hasNextPage={hasNextPage}
                  previousPageHref={previousPageHref}
                  nextPageHref={nextPageHref}
                  pageNumberLinks={pageNumberLinks}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Catálogo no disponible', message, endpointUsed);

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16">
        <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h1 className="font-headline text-lg font-bold text-destructive">
            No se pudo cargar el catálogo en stock.
          </h1>
          <p className="mt-2 text-sm text-destructive/90">Detalle técnico: {message}</p>
          <p className="mt-1 font-mono text-xs text-destructive/80">Endpoint: {endpointUsed}</p>
        </section>
      </div>
    );
  }
}
