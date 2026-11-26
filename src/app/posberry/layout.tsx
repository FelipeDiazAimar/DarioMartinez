import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Posberry: sistema de punto de venta en San Francisco',
  description: 'Sistema Posberry para facturar y vender, con gavetas, lectores e impresoras térmicas. Asesoramiento en San Francisco, Córdoba.',
  alternates: { canonical: '/posberry' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
