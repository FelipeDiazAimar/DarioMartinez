'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type BusinessStatus = {
  isOpen: boolean;
  label: string;
  detail: string;
};

function computeArgentinaBusinessStatus(now: Date): BusinessStatus {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Cordoba',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value || '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value || '0');
  const mins = hour * 60 + minute;

  const isMonThu = ['Mon', 'Tue', 'Wed', 'Thu'].includes(weekday);
  const isFri = weekday === 'Fri';

  if (isMonThu) {
    // 7:30-12:30 (450-750) y 15:30-19:30 (930-1170)
    if (mins >= 450 && mins < 750) {
      return { isOpen: true, label: 'Abierto ahora', detail: 'Hasta las 12:30 hs' };
    }
    if (mins >= 930 && mins < 1170) {
      return { isOpen: true, label: 'Abierto ahora', detail: 'Hasta las 19:30 hs' };
    }
    if (mins < 450) {
      return { isOpen: false, label: 'Cerrado', detail: 'Abrimos hoy a las 7:30 hs' };
    }
    if (mins >= 750 && mins < 930) {
      return { isOpen: false, label: 'Cerrado al mediodía', detail: 'Volvemos a las 15:30 hs' };
    }
    return {
      isOpen: false,
      label: 'Cerrado',
      detail: weekday === 'Thu' ? 'Abrimos mañana a las 8:00 hs' : 'Abrimos mañana a las 7:30 hs',
    };
  }

  if (isFri) {
    // 8:00-12:00 (480-720) y 15:30-19:30 (930-1170)
    if (mins >= 480 && mins < 720) {
      return { isOpen: true, label: 'Abierto ahora', detail: 'Hasta las 12:00 hs' };
    }
    if (mins >= 930 && mins < 1170) {
      return { isOpen: true, label: 'Abierto ahora', detail: 'Hasta las 19:30 hs' };
    }
    if (mins < 480) {
      return { isOpen: false, label: 'Cerrado', detail: 'Abrimos hoy a las 8:00 hs' };
    }
    if (mins >= 720 && mins < 930) {
      return { isOpen: false, label: 'Cerrado al mediodía', detail: 'Volvemos a las 15:30 hs' };
    }
    return { isOpen: false, label: 'Cerrado', detail: 'Abrimos el lunes a las 7:30 hs' };
  }

  return { isOpen: false, label: 'Cerrado', detail: 'Abrimos el lunes a las 7:30 hs' };
}

export function LiveOpenStatus({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [status, setStatus] = React.useState<BusinessStatus | null>(null);

  React.useEffect(() => {
    const refresh = () => setStatus(computeArgentinaBusinessStatus(new Date()));
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!status) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground',
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        San Francisco, Córdoba
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        status.isOpen
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-border bg-surface text-foreground/80',
        className
      )}
    >
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full',
          status.isOpen ? 'bg-emerald-600' : 'bg-muted-foreground/50'
        )}
      />
      <span>{status.label}</span>
      {!compact && (
        <span className="hidden font-mono text-xs opacity-75 sm:inline tabular-nums">
          {status.detail}
        </span>
      )}
    </span>
  );
}
