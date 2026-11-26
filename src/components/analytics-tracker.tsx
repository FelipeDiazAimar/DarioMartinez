'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics-client';

function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedKeyRef = useRef<string>('');

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;

    const queryKey = searchParams?.toString() || '';
    const key = `${pathname}?${queryKey}`;
    if (lastTrackedKeyRef.current === key) return;
    lastTrackedKeyRef.current = key;

    trackEvent('page_view', { path: pathname });
  }, [pathname, searchParams]);

  return null;
}

import { Suspense } from 'react';

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerInner />
    </Suspense>
  );
}
