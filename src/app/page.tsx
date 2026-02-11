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
  Instagram,
  Target,
  Eye,
  Gem,
  Cog,
  Clock,
  ChevronDown,
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
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';

const services = [
  {
    icon: <Wrench className="h-8 w-8 sm:h-10 sm:w-10" />,
    title: 'Reparación de PC y Notebooks',
    description: 'Diagnóstico y solución de problemas de hardware y software.',
  },
  {
    icon: <HardDrive className="h-8 w-8 sm:h-10 sm:w-10" />,
    title: 'Instalación de Windows y Software',
    description:
      'Instalación y configuración de sistemas operativos y programas.',
  },
  {
    icon: <Cpu className="h-8 w-8 sm:h-10 sm:w-10" />,
    title: 'Actualización de Hardware',
    description: 'Mejora el rendimiento con nuevos componentes (SSD, RAM).',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" />,
    title: 'Mantenimiento Preventivo',
    description:
      'Limpieza y optimización para alargar la vida útil de tus equipos.',
  },
  {
    icon: <Wifi className="h-8 w-8 sm:h-10 sm:w-10" />,
    title: 'Redes, WiFi y Routers',
    description: 'Configuración y optimización de tu red doméstica o de oficina.',
  },
  {
    icon: <Users className="h-8 w-8 sm:h-10 sm:w-10" />,
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

const defaultHomeContent = {
  hero_title: 'Tu Aliado en Soluciones Tecnológicas',
  hero_description: 'Ofrecemos servicio técnico y una amplia gama de productos tecnológicos para satisfacer todas tus necesidades.',
  services_title: 'Servicio Técnico',
  services_description: 'Ofrecemos una amplia gama de servicios para mantener tus equipos en perfecto estado y optimizar tu entorno tecnológico.',
  products_title: 'Nuestros Productos',
  products_description: 'Equipamiento tecnológico para potenciar tu hogar o empresa.',
  about_title: 'Sobre Nosotros',
  about_description: 'Somos una empresa con más de 20 años de experiencia en el sector tecnológico, brindando soluciones integrales a nuestros clientes. Nuestro compromiso es ofrecer un servicio de calidad, con atención personalizada y los mejores productos del mercado.',
  mission_title: 'Misión',
  mission_description: 'Facilitar el acceso a la tecnología, ofreciendo productos y servicios de vanguardia que impulsen el desarrollo de nuestros clientes.',
  vision_title: 'Visión',
  vision_description: 'Ser la empresa líder en soluciones tecnológicas en la región, reconocida por nuestra innovación, confiabilidad y compromiso con el cliente.',
  values_title: 'Valores',
  values_description: 'Confianza, Experiencia, Innovación y Atención Personalizada.',
  schedule_title: 'Nuestros Horarios',
  schedule_mon_thu: 'Lunes a Jueves: 7:30 a 12:30 y 15:30 a 19:30 hs.',
  schedule_fri: 'Viernes: 8:00 a 12:00 y de 15:30 a 19:30 hs.',
  schedule_sat: 'Sábados: Cerrado',
  contact_title: 'Contactanos sin compromiso',
  contact_description: '¿Tenés alguna duda o necesitás un presupuesto? Completá el formulario o envianos un WhatsApp.',
  hero_image_url: '',
  carousel_image1_url: '',
  carousel_image2_url: '',
  carousel_image3_url: '',
};

export default function Home() {
  const [homeContent, setHomeContent] = React.useState(defaultHomeContent);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');
  const carouselImages = PlaceHolderImages.filter(img => img.id.startsWith('carousel-'));
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const [inicioRef, inicioInView] = useInView({ threshold: 0.2 });
  const [serviciosRef, serviciosInView] = useInView({ threshold: 0.1 });
  const [productosRef, productosInView] = useInView({ threshold: 0.1 });
  const [sobreNosotrosRef, sobreNosotrosInView] = useInView({ threshold: 0.2 });
  const [contactoRef, contactoInView] = useInView({ threshold: 0.1 });

  React.useEffect(() => {
    const loadHomeContent = async () => {
      const { data } = await supabase
        .from('home_content')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (data) {
        setHomeContent({
          ...defaultHomeContent,
          ...data,
        });
      }
    };

    loadHomeContent();
  }, []);

  const savedCarouselImages = [
    homeContent.carousel_image1_url,
    homeContent.carousel_image2_url,
    homeContent.carousel_image3_url,
  ].filter(Boolean);

  const carouselImagesToRender = savedCarouselImages.length > 0
    ? savedCarouselImages.map((url, index) => ({
        id: `carousel-${index + 1}`,
        imageUrl: url,
        description: `Imagen ${index + 1} del carrusel`,
        imageHint: 'home carousel',
      }))
    : carouselImages;

  return (
    <>
      <section className="w-full relative">
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
            {carouselImagesToRender.map((image, index) => (
              <CarouselItem key={image.id}>
                <div className="relative w-full aspect-[9/16] md:aspect-auto md:h-[500px] lg:h-[600px]">
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    data-ai-hint={image.imageHint}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="100vw"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/30 text-white border-none hover:bg-black/50 transition-colors sm:h-12 sm:w-12" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/30 text-white border-none hover:bg-black/50 transition-colors sm:h-12 sm:w-12" />
        </Carousel>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <Link href="#inicio" aria-label="Bajar a la siguiente sección">
            <ChevronDown className="h-12 w-12 text-primary animate-bounce rounded-full bg-background/70 p-2 backdrop-blur-sm" />
          </Link>
        </div>
      </section>

      <section ref={inicioRef} id="inicio" className="w-full py-12 md:py-20 lg:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className={cn("w-full max-w-md mx-auto sm:max-w-none opacity-0", inicioInView && "animate-slide-in-from-left")}>
                <Image
                src={homeContent.hero_image_url || heroImage?.imageUrl || "https://picsum.photos/seed/computer-repair-tools/600/400"}
                data-ai-hint={heroImage?.imageHint || "computer repair"}
                alt="Hero"
                width={600}
                height={400}
                className="mx-auto aspect-video w-full max-w-full overflow-hidden rounded-xl object-cover"
                />
            </div>
            <div className={cn("flex flex-col justify-center space-y-4 lg:order-first opacity-0", inicioInView && "animate-slide-in-from-right")}>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  {homeContent.hero_title}
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  {homeContent.hero_description}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="https://wa.me/5493564504977" target="_blank">
                    <WhatsAppIcon className="mr-2 h-5 w-5" />
                    Contactar por WhatsApp
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href="/servicios">Servicio Técnico</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={serviciosRef}
        id="servicios"
        className="w-full bg-muted py-12 md:py-24 lg:py-32"
      >
        <div className="container px-4 md:px-6">
          <div className={cn("flex flex-col items-center justify-center space-y-4 text-center opacity-0", serviciosInView && "animate-fade-in")}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {homeContent.services_title}
              </h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {homeContent.services_description}
              </p>
            </div>
          </div>
          <div className="mx-auto grid grid-cols-1 gap-4 py-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {services.map((service, index) => (
              <Link href="/servicios" key={service.title} className={cn("block h-full opacity-0", serviciosInView && "animate-slide-in-from-bottom")} style={{ animationDelay: `${index * 150}ms` }}>
                <Card
                  className="h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <CardHeader className="flex flex-row items-center gap-4 p-4 sm:p-6">
                    <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:h-16 sm:w-16">
                      {service.icon}
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="hidden sm:block">
                    <CardDescription>{service.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className={cn("mt-8 flex justify-center opacity-0", serviciosInView && "animate-fade-in")} style={{ animationDelay: `${services.length * 150}ms` }}>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/servicios">
                Ver más
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section ref={productosRef} id="productos" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className={cn("flex flex-col items-center justify-center space-y-4 text-center opacity-0", productosInView && 'animate-fade-in')}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {homeContent.products_title}
              </h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {homeContent.products_description}
              </p>
            </div>
          </div>
          <div className="mx-auto grid grid-cols-2 gap-4 py-12 sm:gap-8 lg:grid-cols-3">
            {products.map((product, index) => {
               const productImage = PlaceHolderImages.find(img => img.id === product.imageId);
               return (
                  <div key={product.title} className={cn("opacity-0", productosInView && 'animate-slide-in-from-bottom')} style={{animationDelay: `${index * 150}ms`}}>
                    <Card className="flex flex-col h-full overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
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
                      <CardContent className="flex-grow p-0 sm:px-6 sm:pb-6">
                        <CardDescription className="hidden sm:block">{product.description}</CardDescription>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full rounded-full">
                            <Link href="https://wa.me/5493564504977" target="_blank">
                              Ver más
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                      </CardFooter>
                    </Card>
                  </div>
                );
            })}
          </div>
        </div>
      </section>

      <section
        ref={sobreNosotrosRef}
        id="sobre-nosotros"
        className="w-full py-12 md:py-24 lg:py-32"
      >
        <div className="container px-4 md:px-6">
          <div className={cn("flex flex-col items-center justify-center space-y-4 text-center opacity-0", sobreNosotrosInView && "animate-fade-in")}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {homeContent.about_title}
              </h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {homeContent.about_description}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <div className={cn("opacity-0", sobreNosotrosInView && "animate-slide-in-from-right")}>
              <Image
                src="/FOTOFRENTE.jpeg"
                alt="Frente del local Darío Martínez Computación"
                width="600"
                height="700"
                className="mx-auto aspect-[4/5] overflow-hidden rounded-xl object-cover object-center w-full lg:order-last"
              />
            </div>
            <div className={cn("flex flex-col justify-center space-y-4 opacity-0", sobreNosotrosInView && "animate-slide-in-from-left")}>
              <ul className="grid gap-6">
                <li>
                  <div className="grid gap-2">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Target className="h-6 w-6 text-primary" />
                      {homeContent.mission_title}
                    </h3>
                    <p className="text-foreground/80 pl-[36px]">
                      {homeContent.mission_description}
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-2">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Eye className="h-6 w-6 text-primary" />
                      {homeContent.vision_title}
                    </h3>
                    <p className="text-foreground/80 pl-[36px]">
                      {homeContent.vision_description}
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-2">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Gem className="h-6 w-6 text-primary" />
                      {homeContent.values_title}
                    </h3>
                    <p className="text-foreground/80 pl-[36px]">
                      {homeContent.values_description}
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-6 rounded-lg border bg-muted/50 p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                      <Clock className="h-6 w-6 text-primary" />
                      {homeContent.schedule_title}
                  </h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{homeContent.schedule_mon_thu}</p>
                      <p>{homeContent.schedule_fri}</p>
                      <p>{homeContent.schedule_sat}</p>
                    </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={contactoRef}
        id="contacto"
        className={cn("w-full bg-muted pt-6 pb-12 md:pt-12 md:pb-24 lg:pt-16 lg:pb-32 opacity-0", contactoInView && "animate-fade-in")}
      >
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <Image
                src="/LOGO1.png"
                alt="Darío Martínez Computación"
                width={200}
                height={200}
                className="mx-auto"
            />
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              {homeContent.contact_title}
            </h2>
            <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {homeContent.contact_description}
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <ContactForm />
            <p className="text-xs text-foreground/70">
              Tu consulta es bienvenida. ¡Respondemos a la brevedad!
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Button asChild size="icon" className="rounded-full bg-[#25D366] text-white hover:bg-[#25D366]/90">
                <Link href="https://wa.me/5493564504977" target="_blank" aria-label="WhatsApp">
                  <WhatsAppIcon className="h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="icon" className="rounded-full bg-[#E4405F] text-white hover:bg-[#E4405F]/90">
                <Link href="https://www.instagram.com/dariomartinezcomputacion/" target="_blank" aria-label="Instagram">
                  <Instagram className="h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="icon" className="rounded-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90">
                <Link href="https://www.facebook.com/profile.php?id=61585160335205" target="_blank" aria-label="Facebook">
                  <FacebookIcon className="h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
