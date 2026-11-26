'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { LoadingImage } from '@/components/loading-image';
import { trackEvent } from '@/lib/analytics-client';

type RelatedItem = {
  id: string;
  title: string;
  stock: number;
  imageUrl: string;
  descriptionAdditional?: string;
  categoryName?: string;
  price?: number;
};

type RelatedProductsCarouselProps = {
  items: RelatedItem[];
};

export function RelatedProductsCarousel({ items }: RelatedProductsCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>('[data-related-card]');
    const cardWidth = firstCard?.offsetWidth ?? 280;
    const gap = 16;
    const amount = (cardWidth + gap) * 2;

    track.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative mt-6">
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCards('left')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="Desplazar productos relacionados hacia la izquierda"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards('right')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label="Desplazar productos relacionados hacia la derecha"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {items.map((related) => (
          <Link
            key={related.id}
            href={`/productos/${encodeURIComponent(related.id)}`}
            data-related-card
            onClick={() =>
              trackEvent('product_click', {
                label: related.title,
                path: `/productos/${encodeURIComponent(related.id)}`,
              })
            }
            className="surface-lift-trigger group block min-w-[260px] flex-[0_0_85%] snap-start overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-primary/45 sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(25%-12px)]"
          >
            <article className="flex h-full flex-col">
              <div className="relative flex h-48 items-center justify-center overflow-hidden border-b border-border bg-white p-4">
                {related.imageUrl ? (
                  <LoadingImage
                    src={related.imageUrl}
                    alt={related.title}
                    width={480}
                    height={360}
                    className="surface-lift-inner h-full w-full object-contain"
                    spinnerSizeClassName="h-6 w-6 border-2"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="h-7 w-7 opacity-40" />
                    <span>Sin imagen</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
                <div className="space-y-1">
                  <h3 className="line-clamp-2 font-headline text-sm font-bold leading-snug text-foreground group-hover:text-primary">
                    {related.title}
                  </h3>
                  {related.descriptionAdditional && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {related.descriptionAdditional}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-800 tabular-nums">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Stock: {related.stock}
                  </span>
                  {related.categoryName && (
                    <span className="max-w-[130px] truncate rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted-foreground">
                      {related.categoryName}
                    </span>
                  )}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
