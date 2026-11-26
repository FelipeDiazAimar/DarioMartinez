import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reparación de PC y notebooks en San Francisco, Córdoba',
  description: 'Reparación de PC y notebooks de todas las marcas, cambio a SSD, ampliación de RAM y mantenimiento en nuestro taller de San Francisco, Córdoba.',
  alternates: { canonical: '/servicios' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
