'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Instant top navigation progress bar:
 * Fires the exact millisecond the user clicks an internal Next.js Link,
 * giving immediate tactile feedback while the target route loads.
 */
function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = React.useState<'idle' | 'loading' | 'finishing'>('idle');
  const timerRef = React.useRef<number | null>(null);

  // Reset to complete whenever URL actually finishes changing
  React.useEffect(() => {
    setState((prev) => (prev === 'loading' ? 'finishing' : 'idle'));
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setState('idle'), 280);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [pathname, searchParams]);

  // Listen globally for clicks on internal <a> links
  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest('a');
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
        return;
      }
      const currentFull = `${window.location.pathname}${window.location.search}`;
      if (href === currentFull || href === window.location.pathname) return;

      setState('loading');
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setState('idle'), 8000);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  if (state === 'idle') return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px] overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#00308F] via-[#3B82F6] to-[#25D366] shadow-[0_0_14px_rgba(59,130,246,0.9)] transition-all duration-500 ease-out"
        style={{
          width: state === 'loading' ? '78%' : '100%',
          opacity: state === 'finishing' ? 0 : 1,
        }}
      />
    </div>
  );
}

export function RouteProgressBar() {
  return (
    <React.Suspense fallback={null}>
      <RouteProgressInner />
    </React.Suspense>
  );
}
