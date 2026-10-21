import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes · Darío Martínez Computación',
  description: 'Respuestas sobre reparaciones, envíos y horarios de Darío Martínez Computación en San Francisco, Córdoba.',
  alternates: { canonical: '/preguntas-frecuentes' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
