import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto · Darío Martínez Computación, San Francisco',
  description: 'Escribinos por WhatsApp o visitanos en Av. del Libertador Norte 163, San Francisco, Córdoba. Horarios y ubicación.',
  alternates: { canonical: '/contacto' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
