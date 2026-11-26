'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * React Bits–inspired SpotlightCard:
 * Renders a smooth pointer-tracking radial light bloom & subtle border illumination.
 */
type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement> & {
  spotlightColor?: string;
  children: React.ReactNode;
};

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(0, 48, 143, 0.14)',
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}: SpotlightCardProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--rb-x', `${e.clientX - rect.left}px`);
      el.style.setProperty('--rb-y', `${e.clientY - rect.top}px`);
    }
    onMouseMove?.(e);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      style={{ '--rb-spotlight': spotlightColor } as React.CSSProperties}
      className={cn('rb-spotlight-card relative overflow-hidden', className)}
      data-hovered={isHovered ? 'true' : 'false'}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background:
            'radial-gradient(420px circle at var(--rb-x, 50%) var(--rb-y, 50%), var(--rb-spotlight), transparent 68%)',
        }}
      />
      {children}
    </div>
  );
}

/**
 * React Bits–inspired Magnet wrapper:
 * Gently pulls buttons/actions toward the cursor with springy snap-back.
 */
type MagnetProps = {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  disabled?: boolean;
};

export function Magnet({ children, className, strength = 0.22, disabled = false }: MagnetProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [active, setActive] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    const maxShift = 10;
    setOffset({
      x: Math.max(-maxShift, Math.min(maxShift, dx)),
      y: Math.max(-maxShift, Math.min(maxShift, dy)),
    });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => !disabled && setActive(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setActive(false);
        setOffset({ x: 0, y: 0 });
      }}
      className={cn('inline-flex', className)}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: active
          ? 'transform 0.14s cubic-bezier(0.22, 1, 0.36, 1)'
          : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: active ? 'transform' : 'auto',
      }}
    >
      {children}
    </div>
  );
}

/**
 * React Bits–inspired CountUp:
 * Smoothly animates numbers once scrolled into view while rendering the final value on SSR
 * so hydration matches 100% cleanly.
 */
type CountUpProps = {
  to: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
};

export function CountUp({ to, prefix = '', suffix = '', durationMs = 1100, className }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [displayValue, setDisplayValue] = React.useState<number>(to);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    setDisplayValue(to);
  }, [to]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || startedRef.current) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const from = Math.max(0, Math.floor(to * 0.2));

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / durationMs);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(from + (to - from) * eased));
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              setDisplayValue(to);
            }
          };

          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, durationMs]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

/**
 * React Bits–inspired Aurora ambient backdrop for hero & cobalt bands.
 */
export function AuroraBackdrop({ variant = 'light' }: { variant?: 'light' | 'cobalt' }) {
  if (variant === 'cobalt') {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="rb-aurora-orb-1 absolute -right-24 -top-28 h-[420px] w-[420px] rounded-full bg-[#4B82FF]/30 blur-[90px]" />
        <div className="rb-aurora-orb-2 absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full bg-[#00A8E8]/20 blur-[95px]" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="rb-aurora-orb-1 absolute -right-20 -top-24 h-[440px] w-[440px] rounded-full bg-[#2D4CB0]/12 blur-[95px]" />
      <div className="rb-aurora-orb-2 absolute -bottom-24 left-[8%] h-[360px] w-[360px] rounded-full bg-[#38BDF8]/10 blur-[90px]" />
    </div>
  );
}
