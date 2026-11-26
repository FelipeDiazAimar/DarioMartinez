import * as React from 'react';
import { cn } from '@/lib/utils';

export function SkeletonBox({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('rb-skeleton rounded-xl', className)} />;
}

export function CatalogPageSkeleton() {
  return (
    <div className="bg-brand-mist w-full text-foreground">
      <section className="bg-brand-soft w-full border-b border-border py-12 lg:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="space-y-3">
              <SkeletonBox className="h-11 w-64 sm:w-80" />
              <SkeletonBox className="h-5 w-80 max-w-full sm:w-[420px]" />
            </div>
            <SkeletonBox className="h-12 w-full max-w-md rounded-full" />
          </div>
          <div className="mt-6 flex gap-2 overflow-hidden lg:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} className="h-8 w-24 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          <aside className="hidden lg:block">
            <div className="space-y-2.5 rounded-2xl border border-border bg-white p-5">
              <SkeletonBox className="mb-4 h-5 w-28" />
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonBox key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </aside>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-white">
                <SkeletonBox className="h-56 w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <SkeletonBox className="h-5 w-4/5" />
                  <SkeletonBox className="h-4 w-3/5" />
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <SkeletonBox className="h-6 w-20 rounded-full" />
                    <SkeletonBox className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="bg-brand-mist w-full py-10 lg:py-14">
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <SkeletonBox className="h-4 w-56" />
          <SkeletonBox className="h-9 w-36 rounded-full" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="border-b border-border p-6 sm:p-10 lg:col-span-7 lg:border-b-0 lg:border-r">
              <div className="flex justify-between">
                <SkeletonBox className="h-6 w-28 rounded-full" />
                <SkeletonBox className="h-8 w-24 rounded-full" />
              </div>
              <SkeletonBox className="my-6 h-[340px] w-full rounded-2xl sm:h-[420px]" />
              <div className="flex justify-between border-t border-border pt-4">
                <SkeletonBox className="h-4 w-40" />
                <SkeletonBox className="h-4 w-44" />
              </div>
            </div>

            <div className="space-y-6 bg-surface/40 p-6 sm:p-8 lg:col-span-5 lg:p-10">
              <div className="space-y-3">
                <SkeletonBox className="h-8 w-11/12" />
                <SkeletonBox className="h-7 w-44 rounded-full" />
              </div>
              <SkeletonBox className="h-16 w-full" />
              <div className="space-y-3 rounded-2xl border border-border bg-white p-5">
                <SkeletonBox className="h-10 w-full rounded-xl" />
                <SkeletonBox className="h-12 w-full rounded-full" />
                <div className="grid grid-cols-2 gap-2.5">
                  <SkeletonBox className="h-10 w-full rounded-full" />
                  <SkeletonBox className="h-10 w-full rounded-full" />
                </div>
              </div>
              <SkeletonBox className="h-48 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SectionPageSkeleton() {
  return (
    <div className="w-full bg-background">
      <section className="bg-brand-hero w-full border-b border-border py-16 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              <SkeletonBox className="h-7 w-44 rounded-full" />
              <SkeletonBox className="h-14 w-11/12 max-w-xl" />
              <SkeletonBox className="h-6 w-10/12 max-w-lg" />
              <div className="flex flex-wrap gap-3 pt-2">
                <SkeletonBox className="h-12 w-48 rounded-full" />
                <SkeletonBox className="h-12 w-40 rounded-full" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <SkeletonBox className="aspect-[16/10] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4 rounded-2xl border border-border bg-white p-6">
              <SkeletonBox className="h-11 w-11 rounded-xl" />
              <SkeletonBox className="h-6 w-3/4" />
              <SkeletonBox className="h-16 w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FaqListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3 rounded-2xl border border-primary/12 bg-white/95 p-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0">
          <SkeletonBox className="h-5 w-3/4" />
          <SkeletonBox className="h-4 w-4 rounded-full" />
        </div>
      ))}
    </div>
  );
}
