'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { Magnet } from '@/components/react-bits';
import { getSharedContactInfo } from '@/lib/site-data-cache';
import { trackEvent } from '@/lib/analytics-client';
import { cn } from '@/lib/utils';

export function WhatsAppFloatButton() {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState('5493564504977');
  const [liftAboveFooter, setLiftAboveFooter] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    getSharedContactInfo().then((data) => {
      if (data?.whatsapp) {
        const digits = String(data.whatsapp).replace(/\D/g, '');
        if (digits.length >= 10) setWhatsappNumber(digits);
      }
    });
  }, [pathname]);

  // Eleva suavemente el botón cuando aparece la barra inferior del footer para que nunca tape enlaces ni botones
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/admin-login') return;
    const footerBar = document.getElementById('footer-bottom-bar');
    if (!footerBar || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setLiftAboveFooter(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(footerBar);
    return () => observer.disconnect();
  }, [pathname]);

  if (pathname.startsWith('/admin') || pathname === '/admin-login') {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed right-4 z-50 transition-all duration-500 ease-expo sm:right-5',
        liftAboveFooter ? 'bottom-4 sm:bottom-20' : 'bottom-5'
      )}
    >
      <Magnet strength={0.28}>
        <Link
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp a Darío Martínez Computación"
          onClick={() => trackEvent('whatsapp_click', { label: 'Floating Button' })}
          className="rb-glare rb-whatsapp-btn rb-whatsapp-ring group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-4 py-3 text-sm font-semibold text-white transition-all duration-300 ease-expo hover:-translate-y-0.5 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <WhatsAppIcon className="h-5 w-5 transition-transform duration-300 ease-expo group-hover:rotate-6 group-hover:scale-110" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Link>
      </Magnet>
    </div>
  );
}
