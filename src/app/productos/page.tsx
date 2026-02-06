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
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
              <div key={product.title}>
                {/* Desktop View */}
                <Link
                  href="https://wa.me/5493564504977"
                  target="_blank"
                  className="group hidden h-full sm:block"
                >
                  <Card className="flex h-full flex-col overflow-hidden rounded-lg transition-shadow duration-300 group-hover:shadow-xl">
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
                    <CardContent className="flex-grow">
                      <CardDescription>{product.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>

                {/* Mobile View */}
                <div className="block sm:hidden">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value={product.imageId}
                      className="group border-none"
                    >
                      <AccordionTrigger className="w-full p-0 text-left hover:no-underline [&>svg]:hidden">
                        <div className="flex w-full flex-col">
                          <div className="relative block aspect-[9/16] w-full overflow-hidden rounded-lg group-data-[state=open]:rounded-b-none">
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
                              sizes="50vw"
                            />
                          </div>
                          <h3 className="pt-3 text-left text-base font-semibold text-foreground group-data-[state=open]:hidden">
                            {product.title}
                          </h3>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="-mt-2 rounded-b-lg border border-t-0 bg-card p-4 shadow-sm">
                          <h3 className="mb-2 text-left text-lg font-semibold">
                            {product.title}
                          </h3>
                          <p className="mb-4 text-sm text-foreground/80">
                            {product.description}
                          </p>
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
                  </Accordion>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
