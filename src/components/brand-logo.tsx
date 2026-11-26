'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  className?: string;
  align?: 'left' | 'center';
};

/**
 * Renders the official Darío Martínez Computación transparent PNG logo
 * (tightly cropped, true alpha transparency in both light & dark variants).
 */
export function BrandLogo({
  size = 'md',
  variant = 'light',
  className,
  align = 'left',
}: BrandLogoProps) {
  const heightClasses: Record<NonNullable<BrandLogoProps['size']>, string> = {
    sm: 'h-9 w-auto',
    md: 'h-11 w-auto sm:h-12',
    lg: 'h-14 w-auto sm:h-16',
    xl: 'h-16 w-auto sm:h-20',
  };

  const src = variant === 'dark' ? '/LOGO_OSCURO.png' : '/LOGO_CLARO.png';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center',
        align === 'center' ? 'justify-center' : 'justify-start',
        className
      )}
    >
      <img
        src={src}
        alt="Darío Martínez Computación"
        className={cn('object-contain select-none', heightClasses[size])}
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
