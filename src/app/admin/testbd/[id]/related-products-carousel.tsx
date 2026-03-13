'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { LoadingImage } from '@/components/loading-image';

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
    if (!track) {
      return;
    }

    const firstCard = track.querySelector<HTMLElement>('[data-related-card]');
    const cardWidth = firstCard?.offsetWidth ?? 260;
    const gap = 16;
    const amount = (cardWidth + gap) * 2;

    track.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative mt-4 px-1 sm:px-2 lg:px-6">
      <button
        type="button"
        onClick={() => scrollByCards('left')}
        className="absolute left-[-18px] top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-sm transition hover:-translate-y-1/2 hover:shadow-md lg:inline-flex"
        aria-label="Desplazar relacionados hacia la izquierda"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => scrollByCards('right')}
        className="absolute right-[-18px] top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-sm transition hover:-translate-y-1/2 hover:shadow-md lg:inline-flex"
        aria-label="Desplazar relacionados hacia la derecha"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div className="mb-3 flex items-center justify-end gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => scrollByCards('left')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          aria-label="Desplazar relacionados hacia la izquierda"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollByCards('right')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          aria-label="Desplazar relacionados hacia la derecha"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {items.map((related) => (
          <Link
            key={related.id}
            href={`/admin/testbd/${encodeURIComponent(related.id)}`}
            data-related-card
            className="group block min-w-[260px] flex-[0_0_100%] snap-start overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(25%-12px)]"
          >
            <article>
              <div className="relative flex h-52 items-center justify-center overflow-hidden bg-white p-4">
                {related.imageUrl ? (
                  <LoadingImage
                    src={related.imageUrl}
                    alt={related.title}
                    width={500}
                    height={400}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    spinnerSizeClassName="h-5 w-5 border-2"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">Sin imagen</div>
                )}
              </div>

              <div className="space-y-2 p-4">
                <h3 className="line-clamp-2 text-base font-semibold leading-tight">{related.title}</h3>
                {related.descriptionAdditional && <p className="line-clamp-2 text-xs text-muted-foreground">{related.descriptionAdditional}</p>}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium">
                    Stock disponible: {related.stock}
                  </div>
                  <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium">
                    {related.categoryName || 'Sin categoría'}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
