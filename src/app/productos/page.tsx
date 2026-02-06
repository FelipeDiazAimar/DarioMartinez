'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Calculator,
  Cpu,
  Package,
  Printer,
  Puzzle,
  ScanLine,
  ShieldCheck,
  Wrench,
  Laptop,
  Briefcase,
  FileText,
  Zap,
  Hand,
  Activity,
  Sigma,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const products = [
  {
    imageId: 'fiscal-printer',
    title: 'Impresoras Fiscales',
    description:
      'Modelos homologados por AFIP para cumplir con todas las normativas vigentes.',
    details: [
      {
        icon: <Printer className="h-5 w-5 text-primary" />,
        text: 'Equipos fiscales de 1ra y 2da generación, para todo volumen de facturación.',
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-primary" />,
        text: 'Homologados por AFIP, garantizando cumplimiento y transacciones seguras.',
      },
      {
        icon: <Wrench className="h-5 w-5 text-primary" />,
        text: 'Servicio técnico integral: inicialización, mantenimiento y reparaciones.',
      },
    ],
  },
  {
    imageId: 'desktop-pc',
    title: 'PC de Escritorio',
    description:
      'Armamos equipos a medida para oficina, diseño, gaming o uso hogareño.',
    details: [
      {
        icon: <Cpu className="h-5 w-5 text-primary" />,
        text: 'Ensamblamos PCs personalizadas para gaming, diseño gráfico, oficina o uso doméstico.',
      },
      {
        icon: <Puzzle className="h-5 w-5 text-primary" />,
        text: 'Seleccionamos componentes de primeras marcas para asegurar rendimiento y durabilidad.',
      },
      {
        icon: <Package className="h-5 w-5 text-primary" />,
        text: 'También ofrecemos equipos de marca, listos para usar, con garantía oficial.',
      },
    ],
  },
  {
    imageId: 'notebook',
    title: 'Notebooks',
    description:
      'Las mejores marcas y modelos para trabajar o estudiar desde donde quieras.',
    details: [
      {
        icon: <Laptop className="h-5 w-5 text-primary" />,
        text: 'Amplia variedad de las mejores marcas: HP, Dell, Lenovo, Asus y más.',
      },
      {
        icon: <Briefcase className="h-5 w-5 text-primary" />,
        text: 'Modelos para trabajo, estudio, diseño o gaming, adaptados a tu movilidad.',
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-primary" />,
        text: 'Garantía oficial y nuestro respaldo técnico especializado.',
      },
    ],
  },
  {
    imageId: 'ticket-printer',
    title: 'Comanderas y Ticketeadoras',
    description:
      'Impresoras térmicas para comandas, recibos y tickets no fiscales.',
    details: [
      {
        icon: <Printer className="h-5 w-5 text-primary" />,
        text: 'Impresoras térmicas de alta velocidad para puntos de venta y cocinas.',
      },
      {
        icon: <FileText className="h-5 w-5 text-primary" />,
        text: 'Ideales para emitir comandas, tickets no fiscales, recibos y resúmenes.',
      },
      {
        icon: <Zap className="h-5 w-5 text-primary" />,
        text: 'Fáciles de instalar y compatibles con los principales sistemas de gestión.',
      },
    ],
  },
  {
    imageId: 'barcode-scanner',
    title: 'Lectores de Códigos de Barra',
    description: 'Agilizá tus ventas y control de stock con lectores láser y 2D.',
    details: [
      {
        icon: <ScanLine className="h-5 w-5 text-primary" />,
        text: 'Lectores 1D y 2D (QR) para agilizar el cobro y la gestión de inventario.',
      },
      {
        icon: <Hand className="h-5 w-5 text-primary" />,
        text: 'Modelos de mano con cable, inalámbricos y fijos de mostrador.',
      },
      {
        icon: <Activity className="h-5 w-5 text-primary" />,
        text: 'Lectura rápida y precisa, incluso en códigos dañados o de baja calidad.',
      },
    ],
  },
  {
    imageId: 'calculator',
    title: 'Calculadoras',
    description: 'Calculadoras científicas, comerciales y con impresor.',
    details: [
      {
        icon: <Calculator className="h-5 w-5 text-primary" />,
        text: 'Calculadoras comerciales y científicas para estudiantes y profesionales.',
      },
      {
        icon: <Printer className="h-5 w-5 text-primary" />,
        text: 'Modelos con rollo de papel para un registro físico de tus operaciones.',
      },
      {
        icon: <Sigma className="h-5 w-5 text-primary" />,
        text: 'Funciones financieras, estadísticas y de conversión de unidades.',
      },
    ],
  },
];

export default function ProductosPage() {
  const [openItemId, setOpenItemId] = React.useState<string | null>(null);

  const mobileProducts = React.useMemo(() => {
    if (!openItemId) {
      return products;
    }
    const openItem = products.find((p) => p.imageId === openItemId);
    if (!openItem) {
      return products;
    }
    return [openItem, ...products.filter((p) => p.imageId !== openItemId)];
  }, [openItemId]);

  return (
    <section id="productos" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              Nuestros Productos
            </h1>
            <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Equipamiento tecnológico para potenciar tu hogar o empresa.
            </p>
          </div>
        </div>

        {/* Desktop grid */}
        <Accordion
          type="single"
          collapsible
          className="mx-auto hidden py-12 sm:grid sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
          value={openItemId || ''}
          onValueChange={(value) => setOpenItemId(value || null)}
        >
          {products.map((product) => {
            const productImage = PlaceHolderImages.find(
              (img) => img.id === product.imageId
            );
            const isExpanded = openItemId === product.imageId;
            return (
              <AccordionItem
                value={product.imageId}
                key={product.imageId + '-desktop'}
                className={cn(
                  'group/item rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-out hover:shadow-xl',
                  isExpanded && 'shadow-xl'
                )}
              >
                <AccordionTrigger className="group/trigger w-full p-0 text-left hover:no-underline [&>svg]:hidden">
                  <div className="flex w-full flex-col">
                    <div
                      className={cn(
                        'overflow-hidden rounded-t-lg',
                        isExpanded && 'rounded-b-none'
                      )}
                    >
                      <Image
                        src={
                          productImage?.imageUrl ||
                          `https://picsum.photos/seed/${product.imageId}/600/400`
                        }
                        data-ai-hint={
                          productImage?.imageHint ||
                          product.imageId.replace('-', ' ')
                        }
                        alt={product.title}
                        width={600}
                        height={400}
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                      />
                    </div>
                    <div className="flex-grow p-6">
                      <h3 className="text-xl font-semibold leading-none tracking-tight">
                        {product.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="border-t p-6">
                    <ul className="mb-6 space-y-4 text-foreground/80">
                      {product.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0">{detail.icon}</div>
                          <span>{detail.text}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full rounded-full">
                      <Link
                        href="https://wa.me/5493564504977"
                        target="_blank"
                      >
                        Consultar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Mobile Accordion Grid */}
        <div className="mx-auto block py-12 sm:hidden">
          <Accordion
            type="single"
            collapsible
            className="grid grid-cols-2 gap-x-4 gap-y-8"
            value={openItemId || ''}
            onValueChange={(value) => setOpenItemId(value || null)}
          >
            {mobileProducts.map((product) => {
              const productImage = PlaceHolderImages.find(
                (img) => img.id === product.imageId
              );
              const isExpanded = openItemId === product.imageId;
              return (
                <AccordionItem
                  value={product.imageId}
                  key={product.imageId}
                  className={cn(
                    'group border-none',
                    isExpanded && 'col-span-2'
                  )}
                >
                  <AccordionTrigger className="w-full p-0 text-left hover:no-underline [&>svg]:hidden">
                    <div className="flex w-full flex-col">
                      <div
                        className={cn(
                          'relative block aspect-[9/16] w-full overflow-hidden rounded-lg',
                          isExpanded && 'rounded-b-none'
                        )}
                      >
                        <Image
                          src={
                            productImage?.imageUrl ||
                            `https://picsum.photos/seed/${product.imageId}/450/800`
                          }
                          data-ai-hint={
                            productImage?.imageHint ||
                            product.imageId.replace('-', ' ')
                          }
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes={isExpanded ? '100vw' : '50vw'}
                        />
                      </div>
                      <h3
                        className={cn(
                          'pt-3 text-left text-base font-semibold text-foreground',
                          isExpanded && 'hidden'
                        )}
                      >
                        {product.title}
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="-mt-2 rounded-b-lg border border-t-0 bg-card p-4 shadow-sm">
                      <h3 className="mb-4 text-left text-2xl font-bold">
                        {product.title}
                      </h3>
                      <ul className="mb-6 space-y-4 text-foreground/80">
                        {product.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="flex-shrink-0">{detail.icon}</div>
                            <span>{detail.text}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="w-full rounded-full">
                        <Link
                          href="https://wa.me/5493564504977"
                          target="_blank"
                        >
                          Consultar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
