'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
  delayMs?: number;
};

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [state, setState] = React.useState<'idle' | 'hidden' | 'visible'>('idle');

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setState('visible');
      return;
    }

    const rect = el.getBoundingClientRect();
    // Si ya está visible o cerca del primer pantallazo, mantenerlo completamente visible
    if (rect.top < window.innerHeight * 1.08) {
      setState('visible');
      return;
    }

    setState('hidden');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.01, rootMargin: '80px 0px 60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={state === 'idle' ? undefined : state}
      data-direction={direction}
      style={delayMs > 0 ? { transitionDelay: `${Math.min(delayMs, 420)}ms` } : undefined}
      className={cn('reveal-block', className)}
    >
      {children}
    </div>
  );
}
