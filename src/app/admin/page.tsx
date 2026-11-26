'use client';

import Link from 'next/link';
import {
  Home,
  Wrench,
  ShoppingBasket,
  Receipt,
  Users,
  Mail,
  BarChart3,
  HelpCircle,
  Inbox,
  Eye,
  Package,
  Database,
  Tags,
  DollarSign,
  ArrowUpRight,
  LayoutDashboard,
} from 'lucide-react';
import { AuroraBackdrop, SpotlightCard } from '@/components/react-bits';

const adminGroups = [
  {
    title: 'Analíticas, Enlaces y Consultas',
    description: 'Métricas reales de la web, enlaces UTM para redes y mensajes recibidos.',
    items: [
      {
        title: 'Estadísticas y Enlaces UTM',
        description: 'Visitas reales, orígenes y links para WhatsApp, Instagram, Facebook y Google',
        href: '/admin/estadisticas',
        icon: BarChart3,
        highlight: true,
      },
      {
        title: 'Bandeja de Consultas',
        description: 'Mensajes enviados desde el formulario de contacto',
        href: '/admin/consultas',
        icon: Inbox,
      },
      {
        title: 'Ver Sitio Web',
        description: 'Abrir la portada pública en el navegador',
        href: '/',
        icon: Eye,
      },
    ],
  },
  {
    title: 'Contenidos del Sitio (CMS)',
    description: 'Textos, imágenes, horarios y secciones editables en Supabase.',
    items: [
      { title: 'Editar Home', description: 'Carrusel, portada, cobertura y clientes', href: '/admin/editar-home', icon: Home },
      { title: 'Servicio Técnico', description: 'Servicios y detalles del taller', href: '/admin/editar-servicios', icon: Wrench },
      { title: 'Productos Destacados', description: 'Bloque de productos del Home', href: '/admin/editar-productos', icon: Package },
      { title: 'Posberry', description: 'Contenido e integraciones POSBerry', href: '/admin/editar-posberry', icon: ShoppingBasket },
      { title: 'Controladores Fiscales', description: 'Marcas, servicios y banners fiscales', href: '/admin/editar-controladores-fiscales', icon: Receipt },
      { title: 'Sobre Nosotros', description: 'Historia e identidad institucional', href: '/admin/editar-sobre-nosotros', icon: Users },
      { title: 'Contacto y Redes', description: 'WhatsApp, teléfonos, horarios y links', href: '/admin/editar-contacto', icon: Mail },
      { title: 'Preguntas Frecuentes', description: 'Listado de FAQs visibles al público', href: '/admin/editar-preguntas-frecuentes', icon: HelpCircle },
    ],
  },
  {
    title: 'Base de Datos y Catálogo',
    description: 'Gestión de artículos, stock, precios, categorías y verificación.',
    items: [
      { title: 'Artículos (BD)', description: 'Catálogo conectado a MySQL y espejo Supabase', href: '/admin/articulos', icon: Package },
      { title: 'Categorías', description: 'Clasificación del catálogo público', href: '/admin/categorias', icon: Tags },
      { title: 'Precios (BD)', description: 'Actualización de listas de precios', href: '/admin/precios', icon: DollarSign },
      { title: 'Kardex (BD)', description: 'Movimientos y trazabilidad de stock', href: '/admin/kardex', icon: Package },
      { title: 'TestBD', description: 'Vista de verificación de catálogo', href: '/admin/testbd', icon: Database },
    ],
  },
];

export default function AdminPage() {
  return (
    <div className="bg-brand-mist min-h-screen w-full">
      <section className="bg-brand-hero relative w-full overflow-hidden border-b border-border py-10 lg:py-12">
        <AuroraBackdrop variant="light" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <h1 className="flex items-center gap-3 font-headline text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#002878] to-[#2349B6] text-white shadow-md shadow-primary/25">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            Panel de Administración
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Gestioná métricas reales, enlaces de campaña, contenidos del sitio y base de datos desde un solo lugar.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {adminGroups.map((group) => (
          <section key={group.title} className="space-y-4">
            <div>
              <h2 className="font-headline text-xl font-bold text-foreground">{group.title}</h2>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isHighlight = 'highlight' in item && item.highlight;
                return (
                  <SpotlightCard
                    key={item.href}
                    spotlightColor={isHighlight ? 'rgba(120, 180, 255, 0.25)' : 'rgba(0, 48, 143, 0.13)'}
                    className={`rounded-2xl border transition-all duration-300 ease-expo hover:-translate-y-1 ${
                      isHighlight
                        ? 'bg-brand-cobalt border-primary/20 text-white shadow-[0_18px_40px_-18px_rgba(0,48,143,0.5)]'
                        : 'border-primary/12 bg-white shadow-xs hover:border-primary/45 hover:shadow-[0_18px_36px_-18px_rgba(0,48,143,0.24)]'
                    }`}
                  >
                    <Link href={item.href} className="group relative z-20 flex h-full flex-col justify-between gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                            isHighlight
                              ? 'bg-white/15 text-white'
                              : 'bg-primary/8 text-primary group-hover:bg-primary group-hover:text-white'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowUpRight
                          className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                            isHighlight ? 'text-white/80' : 'text-muted-foreground group-hover:text-primary'
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-headline text-base font-bold ${
                            isHighlight ? 'text-white' : 'text-foreground group-hover:text-primary'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <p
                          className={`mt-1 text-xs leading-relaxed ${
                            isHighlight ? 'text-white/80' : 'text-muted-foreground'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  </SpotlightCard>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
