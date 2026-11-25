import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Revisión de contenido · Darío Martínez Computación',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function RevisionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
