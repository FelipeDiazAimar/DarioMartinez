import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Controladores fiscales en San Francisco, Córdoba',
  description: 'Venta, instalación y service de controladores e impresoras fiscales Hasar y Epson para comercios de San Francisco, Córdoba y la zona.',
  alternates: { canonical: '/controladores-fiscales' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
