'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';

export function WhatsAppFloatButton() {
  const pathname = usePathname();

  // No mostrar en rutas de admin
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <Link
      href="https://wa.me/5493564504977"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-green-500 p-3 text-white shadow-lg transition-colors hover:bg-green-600 sm:px-4 sm:py-3"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden sm:inline">WhatsApp</span>
    </Link>
  );
}