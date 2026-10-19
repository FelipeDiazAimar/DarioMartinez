'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { GOOGLE_ADS_ID, trackWhatsAppConversion } from '@/lib/google-ads';

export function GoogleAdsTag() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/admin-login');

  useEffect(() => {
    if (!GOOGLE_ADS_ID || isAdmin) return;
    function handleClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest('a');
      const href = anchor?.getAttribute('href') ?? '';
      if (href.includes('wa.me/') || href.includes('api.whatsapp.com')) {
        trackWhatsAppConversion();
      }
    }
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isAdmin]);

  if (!GOOGLE_ADS_ID || isAdmin) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
