import type { Metadata } from 'next';
import './globals.css';
import { SITE_URL, BUSINESS } from '@/lib/site';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { WhatsAppFloatButton } from '@/components/whatsapp-float-button';
import { GoogleAdsTag } from '@/components/google-ads-tag';
import { AdminCartWidget } from '@/components/admin-cart-widget';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Darío Martínez Computación · San Francisco, Córdoba',
  description:
    'Venta y reparación de PC, notebooks e impresoras, controladores fiscales y Posberry en San Francisco, Córdoba. Consultas por WhatsApp.',
  keywords: 'reparación pc, servicio técnico, computación, redes, wifi, software, hardware, notebooks, impresoras, calculadoras',
  openGraph: { siteName: BUSINESS.name, locale: 'es_AR', type: 'website' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'ComputerStore',
    name: BUSINESS.name,
    url: SITE_URL,
    telephone: BUSINESS.phone,
    image: `${SITE_URL}/LOGO1.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.locality,
      addressRegion: BUSINESS.region,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.country,
    },
    areaServed: 'San Francisco, Córdoba',
    sameAs: [BUSINESS.instagram],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '07:30',
        closes: '12:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '15:30',
        closes: '19:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Friday'],
        opens: '08:00',
        closes: '12:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Friday'],
        opens: '15:30',
        closes: '19:30',
      },
    ],
  };
  return (
    <html lang="es" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <div className="relative flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
        <WhatsAppFloatButton />
        <AdminCartWidget />
        <Analytics />
        <SpeedInsights />
        <GoogleAdsTag />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      </body>
    </html>
  );
}
