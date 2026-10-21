import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre nosotros · Darío Martínez Computación',
  description: 'Casi 50 años de trayectoria en computación y tecnología en San Francisco, Córdoba.',
  alternates: { canonical: '/sobre-nosotros' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
