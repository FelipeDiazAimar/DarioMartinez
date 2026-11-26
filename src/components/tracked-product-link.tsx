'use client';

import Link from 'next/link';
import * as React from 'react';
import { trackEvent } from '@/lib/analytics-client';

export function TrackedProductLink({
  href,
  productTitle,
  className,
  children,
}: {
  href: string;
  productTitle: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent('product_click', { label: productTitle, path: href })}
    >
      {children}
    </Link>
  );
}

export function TrackedWhatsAppLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvent('whatsapp_click', { label })}
    >
      {children}
    </Link>
  );
}
