'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Cpu,
  ShieldCheck,
  Wrench,
  Wifi,
  Users,
  HardDrive,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ContactForm } from '@/components/contact-form';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const services = [
  {
    icon: <Wrench className="h-10 w-10" />,
    title: 'Reparación de PC y Notebooks',
    description: 'Diagnóstico y solución de problemas de hardware y software.',
  },
  {
    icon: <HardDrive className="h-10 w-10" />,
    title: 'Instalación de Windows y Software',
    description:
      'Instalación y configuración de sistemas operativos y programas.',
  },
  {
    icon: <Cpu className="h-10 w-10" />,
    title: 'Actualización de Hardware',
    description: 'Mejora el rendimiento con nuevos componentes (SSD, RAM).',
  },
  {
    icon: <ShieldCheck className="h-10 w-10" />,
    title: 'Mantenimiento Preventivo',
    description:
      'Limpieza y optimización para alargar la vida útil de tus equipos.',
  },
  {
    icon: <Wifi className="h-10 w-10" />,
    title: 'Redes, WiFi y Routers',
    description: 'Configuración y optimización de tu red doméstica o de oficina.',
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: 'Asistencia Técnica',
    description: 'Soporte remoto y presencial para hogares y empresas.',
  },
];

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

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');
  const carouselImages = PlaceHolderImages.filter(img => img.id.startsWith('carousel-'));
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <>
      <section className="w-full">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {carouselImages.map((image, index) => (
              <CarouselItem key={image.id}>
                <div className="relative h-[400px] w-full md:h-[500px] lg:h-[600px]">
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    data-ai-hint={image.imageHint}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/30 text-white border-none hover:bg-black/50 transition-colors sm:h-12 sm:w-12" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/30 text-white border-none hover:bg-black/50 transition-colors sm:h-12 sm:w-12" />
        </Carousel>
      </section>

      <section id="inicio" className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  Tu Aliado en Soluciones Tecnológicas
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  Ofrecemos servicio técnico y una amplia gama de productos tecnológicos para satisfacer todas tus necesidades.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="https://wa.me/5491123456789" target="_blank">
                    <WhatsAppIcon className="mr-2 h-5 w-5" />
                    Contactar por WhatsApp
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#servicios">Servicio Técnico</Link>
                </Button>
              </div>
            </div>
            <Image
              src={heroImage?.imageUrl || "https://picsum.photos/seed/computer-repair-tools/600/400"}
              data-ai-hint={heroImage?.imageHint || "computer repair"}
              alt="Hero"
              width="600"
              height="400"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            />
          </div>
        </div>
      </section>

      <section
        id="servicios"
        className="w-full bg-muted py-12 md:py-24 lg:py-32"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Servicio Técnico
              </h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Ofrecemos una amplia gama de servicios para mantener tus equipos
                en perfecto estado y optimizar tu entorno tecnológico.
              </p>
            </div>
          </div>
          <div className="mx-auto grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.title}
                className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="productos" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Nuestros Productos
              </h2>
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
                          <Link href="https://wa.me/5491123456789" target="_blank">
                            Ver más
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

      <section
        id="sobre-nosotros"
        className="w-full py-12 md:py-24 lg:py-32"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Sobre Nosotros
              </h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Somos una empresa con más de 20 años de experiencia en el sector tecnológico, brindando soluciones integrales a nuestros clientes. Nuestro compromiso es ofrecer un servicio de calidad, con atención personalizada y los mejores productos del mercado.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <Image
              src="https://picsum.photos/seed/team-working/600/400"
              data-ai-hint="team working"
              alt="Sobre Nosotros"
              width="600"
              height="400"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
            />
            <div className="flex flex-col justify-center space-y-4">
              <ul className="grid gap-6">
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Misión</h3>
                    <p className="text-foreground/80">
                      Facilitar el acceso a la tecnología, ofreciendo productos y servicios de vanguardia que impulsen el desarrollo de nuestros clientes.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Visión</h3>
                    <p className="text-foreground/80">
                      Ser la empresa líder en soluciones tecnológicas en la región, reconocida por nuestra innovación, confiabilidad y compromiso con el cliente.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Valores</h3>
                    <p className="text-foreground/80">
                      Confianza, Experiencia, Innovación y Atención Personalizada.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contacto"
        className="w-full bg-muted py-12 md:py-24 lg:py-32"
      >
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <Image
                src="/LOGO1.png"
                alt="Darío Martínez Computación"
                width={150}
                height={150}
                className="mx-auto"
            />
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              Contactanos sin compromiso
            </h2>
            <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              ¿Tenés alguna duda o necesitás un presupuesto? Completá el
              formulario o enviame un WhatsApp.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <ContactForm />
            <p className="text-xs text-foreground/70">
              Tu consulta es bienvenida. ¡Respondemos a la brevedad!
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
