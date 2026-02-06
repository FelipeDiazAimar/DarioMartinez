'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const products = [
  {
    imageId: 'fiscal-printer',
    title: 'Impresoras Fiscales',
    description:
      'Modelos homologados por AFIP. Ideales para todo tipo de comercios.',
  },
  {
    imageId: 'desktop-pc',
    title: 'PC de Escritorio',
    description:
      'Armamos equipos a medida para oficina, diseño, gaming o uso hogareño.',
  },
  {
    imageId: 'notebook',
    title: 'Notebooks',
    description:
      'Las mejores marcas y modelos para trabajar o estudiar desde donde quieras.',
  },
  {
    imageId: 'ticket-printer',
    title: 'Comanderas y Ticketeadoras',
    description:
      'Impresoras térmicas para comandas, recibos y tickets no fiscales.',
  },
  {
    imageId: 'barcode-scanner',
    title: 'Lectores de Códigos de Barra',
    description: 'Agilizá tus ventas y control de stock con lectores láser y 2D.',
  },
  {
    imageId: 'calculator',
    title: 'Calculadoras',
    description: 'Calculadoras científicas, comerciales y con impresor.',
  },
];

export default function ProductosPage() {
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
        <div className="mx-auto grid grid-cols-2 gap-x-4 gap-y-8 py-12 sm:gap-8 lg:grid-cols-3">
          {products.map((product) => {
            const productImage = PlaceHolderImages.find(
              (img) => img.id === product.imageId
            );
            return (
              <Link
                href="https://wa.me/5493564504977"
                target="_blank"
                className="group block"
                key={product.title}
              >
                <Card className="overflow-hidden rounded-lg transition-shadow duration-300 group-hover:shadow-xl">
                  {/* Desktop View */}
                  <div className="hidden sm:block">
                    <div className="overflow-hidden">
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
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{product.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{product.description}</CardDescription>
                    </CardContent>
                  </div>
                  {/* Mobile View */}
                  <div className="relative block aspect-video w-full sm:hidden">
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
                      fill
                      className="object-cover"
                    />
                  </div>
                </Card>
                <h3 className="mt-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary sm:hidden">
                  {product.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
