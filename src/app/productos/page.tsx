'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const products = [
    {
      imageId: 'fiscal-printer',
      title: 'Impresoras Fiscales',
      description: 'Modelos homologados por AFIP. Ideales para todo tipo de comercios.',
    },
    {
      imageId: 'desktop-pc',
      title: 'PC de Escritorio',
      description: 'Armamos equipos a medida para oficina, diseño, gaming o uso hogareño.',
    },
    {
      imageId: 'notebook',
      title: 'Notebooks',
      description: 'Las mejores marcas y modelos para trabajar o estudiar desde donde quieras.',
    },
    {
      imageId: 'ticket-printer',
      title: 'Comanderas y Ticketeadoras',
      description: 'Impresoras térmicas para comandas, recibos y tickets no fiscales.',
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
          <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
               const productImage = PlaceHolderImages.find(img => img.id === product.imageId);
               return (
                  <Card key={product.title} className="flex flex-col overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <Image
                      src={productImage?.imageUrl || `https://picsum.photos/seed/${product.imageId}/600/400`}
                      data-ai-hint={productImage?.imageHint || product.imageId.replace('-', ' ')}
                      alt={product.title}
                      width={600}
                      height={400}
                      className="aspect-video object-cover w-full"
                    />
                    <CardHeader>
                      <CardTitle className="text-xl">{product.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription>{product.description}</CardDescription>
                    </CardContent>
                    <CardFooter>
                       <Button asChild className="w-full">
                          <Link href="https://wa.me/5493564504977" target="_blank">
                            Consultar
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                    </CardFooter>
                  </Card>
                );
            })}
          </div>
        </div>
      </section>
    );
}
