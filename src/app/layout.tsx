import type { Metadata } from 'next';
import { Archivo, Public_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SITE_URL, BUSINESS } from '@/lib/site';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { WhatsAppFloatButton } from '@/components/whatsapp-float-button';
import { RouteProgressBar } from '@/components/route-progress';
import { PageTransition } from '@/components/page-transition';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { cn } from '@/lib/utils';
import { SoloSitio } from '@/components/solo-sitio';
import { GoogleAdsTag } from '@/components/google-ads-tag';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-headline',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Darío Martínez Computación | Tecnología, Servicio Técnico y Sistemas Fiscales',
  description:
    'Soluciones en computación, redes y tecnología en San Francisco, Córdoba. Venta de equipos, reparación de PC y notebooks, POSBerry y controladores fiscales homologados.',
  keywords:
    'reparación pc, servicio técnico, computación, San Francisco Córdoba, POSBerry, controladores fiscales, AFIP, ARCA, notebooks, impresoras, calculadoras',
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
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicio técnico',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Reparación de PC y notebooks de todas las marcas' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Limpieza interna y cambio de pasta térmica' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Formateo e instalación de Windows y programas' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cambio a disco SSD y ampliación de memoria' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Service de impresoras láser y de tinta' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Service de controladores fiscales' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Service de relojes de personal y contadoras de billetes' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Redes, WiFi y routers' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Asistencia remota con AnyDesk o TeamViewer' } },
      ],
    },
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
    <html
      lang="es"
      className={cn('scroll-smooth', archivo.variable, publicSans.variable, jetbrainsMono.variable)}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
        />
        <RouteProgressBar />
        <SoloSitio>
          <AnalyticsTracker />
          <GoogleAdsTag />
        </SoloSitio>
        <div className="relative flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </div>
        <Toaster />
        <SoloSitio>
          <WhatsAppFloatButton />
          <Analytics />
          <SpeedInsights />
        </SoloSitio>
      </body>
    </html>
  );
}
