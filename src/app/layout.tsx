import type { Metadata } from 'next';
import { Archivo, Public_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { WhatsAppFloatButton } from '@/components/whatsapp-float-button';
import { RouteProgressBar } from '@/components/route-progress';
import { PageTransition } from '@/components/page-transition';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { cn } from '@/lib/utils';
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
  return (
    <html
      lang="es"
      className={cn('scroll-smooth', archivo.variable, publicSans.variable, jetbrainsMono.variable)}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <RouteProgressBar />
        <AnalyticsTracker />
        <div className="relative flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </div>
        <Toaster />
        <WhatsAppFloatButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
