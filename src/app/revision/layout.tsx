import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Condensed } from 'next/font/google';

const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--rv-texto' });
const barlowCondensada = Barlow_Condensed({ subsets: ['latin'], weight: ['700'], variable: '--rv-titulo' });

export const metadata: Metadata = {
  title: 'Revisión de contenido · Darío Martínez Computación',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export const viewport: Viewport = { themeColor: '#0c132f' };

export default function RevisionLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${barlow.variable} ${barlowCondensada.variable}`}>{children}</div>;
}
