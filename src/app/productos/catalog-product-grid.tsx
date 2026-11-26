'use client';

import * as React from 'react';
import { Package, ChevronDown } from 'lucide-react';
import { LoadingImage } from '@/components/loading-image';
import { TrackedProductLink } from '@/components/tracked-product-link';
import { Magnet } from '@/components/react-bits';
import type { CatalogItem } from './catalog-utils';

type CatalogProductGridProps = {
  items: CatalogItem[];
  initialVisible: number;
  articleCategoryByNumber: Record<string, string>;
  categoriesById: Record<string, string>;
  effectivePage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousPageHref: string;
  nextPageHref: string;
  pageNumberLinks: Array<{ page: number; href: string }>;
};

export function CatalogProductGrid({
  items,
  initialVisible,
  articleCategoryByNumber,
  categoriesById,
  effectivePage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  previousPageHref,
  nextPageHref,
  pageNumberLinks,
}: CatalogProductGridProps) {
  const [visibleCount, setVisibleCount] = React.useState(Math.min(initialVisible, items.length));

  React.useEffect(() => {
    setVisibleCount(Math.min(initialVisible, items.length));
  }, [items, initialVisible]);

  const paginatedItems = items.slice(0, visibleCount);
  const hasMoreWithinPage = visibleCount < items.length;
  const showPageNavigation = !hasMoreWithinPage && totalPages > 1;

  return (
    <>
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {paginatedItems.map((item) => {
          const categoryId = articleCategoryByNumber[item.articleNumber];
          const categoryName = categoryId ? categoriesById[categoryId] : undefined;

          return (
            <TrackedProductLink
              key={item.id}
              href={`/productos/${encodeURIComponent(item.id)}`}
              productTitle={item.title}
              className="surface-lift-trigger group block overflow-hidden rounded-2xl border border-primary/12 bg-background shadow-sm transition-all duration-300 ease-expo hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_22px_44px_-20px_rgba(0,48,143,0.28)]"
            >
              <article className="flex h-full flex-col">
                <div className="relative flex h-56 items-center justify-center overflow-hidden border-b border-border bg-white p-5">
                  {item.imageUrl ? (
                    <LoadingImage
                      src={item.imageUrl}
                      alt={item.title}
                      width={500}
                      height={400}
                      className="surface-lift-inner h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                      <Package className="h-8 w-8 opacity-40" />
                      <span>Sin imagen</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                  <div className="space-y-1.5">
                    <h2 className="line-clamp-2 font-headline text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </h2>
                    {item.descriptionAdditional && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.descriptionAdditional}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-800 tabular-nums">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Stock: {item.stock}
                    </span>
                    {categoryName && (
                      <span className="truncate rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {categoryName}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </TrackedProductLink>
          );
        })}
      </section>

      <div className="mt-10 flex flex-col items-center gap-4">
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          Mostrando {paginatedItems.length} de {items.length} productos · Página {effectivePage} de {totalPages}
        </p>

        {hasMoreWithinPage ? (
          <Magnet strength={0.2}>
            <button
              type="button"
              onClick={() => setVisibleCount(items.length)}
              className="rb-glare rb-star-cta rb-pill-interactive relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#002878] via-[#00308F] to-[#2349B6] px-8 py-3 text-sm font-semibold text-white"
            >
              <span>Cargar más productos ({items.length - visibleCount} más)</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </Magnet>
        ) : showPageNavigation ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {hasPreviousPage ? (
              <a
                href={previousPageHref}
                className="rb-pill-interactive rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:bg-[#EEF4FF] hover:text-primary"
              >
                Anterior
              </a>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {pageNumberLinks.map((item) => (
                <a
                  key={item.page}
                  href={item.href}
                  className={`rb-pill-interactive min-w-9 rounded-full border px-3 py-2 text-center font-mono text-xs font-semibold tabular-nums ${
                    item.page === effectivePage
                      ? 'border-primary bg-gradient-to-r from-[#002878] to-[#2349B6] text-white shadow-sm'
                      : 'border-border bg-white text-foreground hover:border-primary hover:bg-[#EEF4FF] hover:text-primary'
                  }`}
                  aria-current={item.page === effectivePage ? 'page' : undefined}
                >
                  {item.page}
                </a>
              ))}
            </div>

            {hasNextPage ? (
              <a
                href={nextPageHref}
                className="rb-pill-interactive rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:bg-[#EEF4FF] hover:text-primary"
              >
                Siguiente
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
