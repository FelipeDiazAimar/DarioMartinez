'use client';

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
  ArrowUpRight,
  Instagram,
  Target,
  Eye,
  Gem,
  Clock,
  Search,
  MapPin,
  CheckCircle2,
  Package,
  Receipt,
  ShoppingBasket,
  Download,
  MonitorCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ContactForm } from '@/components/contact-form';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { LoadingImage } from '@/components/loading-image';
import { BrandLogo } from '@/components/brand-logo';
import { ScrollReveal } from '@/components/scroll-reveal';
import { LiveOpenStatus } from '@/components/live-open-status';
import { AuroraBackdrop, CountUp, Magnet, SpotlightCard } from '@/components/react-bits';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';
import { DEFAULT_CONTACT_INFO, getSharedContactInfo } from '@/lib/site-data-cache';
import { trackEvent } from '@/lib/analytics-client';

const services = [
  {
    icon: Wrench,
    title: 'Reparación de PC y Notebooks',
    description: 'Diagnóstico y solución de problemas de hardware y software.',
  },
  {
    icon: HardDrive,
    title: 'Instalación de Windows y Software',
    description: 'Instalación y configuración de sistemas operativos y programas.',
  },
  {
    icon: Cpu,
    title: 'Actualización de Hardware',
    description: 'Mejora el rendimiento con nuevos componentes (SSD, RAM).',
  },
  {
    icon: ShieldCheck,
    title: 'Mantenimiento Preventivo',
    description: 'Limpieza y optimización para alargar la vida útil de tus equipos.',
  },
  {
    icon: Wifi,
    title: 'Redes, WiFi y Routers',
    description: 'Configuración y optimización de tu red doméstica o de oficina.',
  },
  {
    icon: Users,
    title: 'Asistencia Técnica',
    description: 'Soporte remoto y presencial para hogares y empresas.',
  },
];

// Logos de procesadores de pago de POSBerry que estaban cargados como placeholder en home_content.clients
// (en el repo original la sección "Nuestros clientes" estaba oculta en commit 3bb03f6 hasta cargar clientes reales).
const PLACEHOLDER_CLIENT_SRCS = new Set([
  '/bind.png',
  '/fiserv.png',
  '/mercadopago.png',
  '/payway.png',
  '/pvs.png',
  '/clover.png',
  '/posberry.png',
  '/posberry2.png',
]);

const defaultCoverageLocations = [
  'San Francisco',
  'Alicia',
  'Altos de Chipión',
  'Arroyito',
  'Balnearia',
  'Brinkmann',
  'Clucellas',
  'Colonia San Bartolomé',
  'Devoto',
  'El Tío',
  'Freyre',
  'Josefina',
  'La Francia',
  'La Paquita',
  'La Para',
  'Las Varillas',
  'Miramar de Ansenuza',
  'Morteros',
  'Porteña',
  'Quebracho Herrado',
  'Suardi',
  'Tránsito',
  'Sastre',
  'Saturnino M. Laspiur',
];

const quickDivisions = [
  {
    title: 'Servicio Técnico',
    summary: 'Taller propio, diagnóstico y asistencia remota',
    href: '/servicios',
    icon: Wrench,
  },
  {
    title: 'Catálogo de Productos',
    summary: 'Equipamiento y stock actualizado en vivo',
    href: '/productos',
    icon: Package,
  },
  {
    title: 'POSBerry',
    summary: 'Punto de venta con facturación ARCA',
    href: '/posberry',
    icon: ShoppingBasket,
  },
  {
    title: 'Controladores Fiscales',
    summary: 'Hasar, Epson y Samsung homologados',
    href: '/controladores-fiscales',
    icon: Receipt,
  },
];

type HomeProduct = {
  imageId: string;
  title: string;
  description: string;
  imageUrl?: string;
};

const defaultProducts: HomeProduct[] = [
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
  hero_description:
    'Ofrecemos servicio técnico y una amplia gama de productos tecnológicos para satisfacer todas tus necesidades.',
  services_title: 'Servicio Técnico',
  services_description:
    'Ofrecemos una amplia gama de servicios para mantener tus equipos en perfecto estado y optimizar tu entorno tecnológico.',
  products_title: 'Nuestros Productos',
  products_description: 'Equipamiento tecnológico para potenciar tu hogar o empresa.',
  controladores_title: 'Controladores Fiscales',
  controladores_description:
    'Equipos homologados por AFIP para garantizar el cumplimiento fiscal y optimizar la gestión de tu negocio. Tecnología avanzada para reportes automáticos y control preciso.',
  controladores_feature_1: 'Cumplimiento total con normativas AFIP',
  controladores_feature_2: 'Procesamiento rápido de transacciones',
  controladores_feature_3: 'Reportes automáticos y detallados',
  controladores_button_text: 'Ver Más',
  controladores_button_link: '/controladores-fiscales',
  controladores_image_url: '',
  coverage_title: 'Lugares donde trabajamos',
  coverage_description:
    'Conocé las zonas y localidades a las que llegamos con instalación, soporte técnico y soluciones comerciales.',
  coverage_locations_text: defaultCoverageLocations.join('\n'),
  coverage_map_embed_url:
    'https://www.google.com/maps/d/u/0/embed?mid=1CqBXj8VZZZaSNDT8zIsZWvNGqVY0PLg&ehbc=2E312F',
  coverage_overlay_text:
    'Averigua las localidades donde trabajamos y conoce si llegamos hasta tu casa u oficina.',
  coverage_overlay_button_text: 'Ver mapa',
  coverage_footer_text:
    '¿No encuentras tu localidad en el mapa? Consultanos para verificar si podemos llegar hasta tu zona y ofrecerte nuestros servicios.',
  coverage_footer_link_text: 'Contactanos',
  coverage_footer_link_url: '/contacto',
  clients_title: 'Nuestros clientes',
  clients_description: 'Empresas y comercios que confían en nuestras soluciones tecnológicas.',
  clients: [] as Array<{ name: string; logoUrl: string }>,
  about_title: 'Sobre Nosotros',
  about_description:
    'Somos una empresa con casi 50 años de experiencia en el sector tecnológico, brindando soluciones integrales a nuestros clientes. Nuestro compromiso es ofrecer un servicio de calidad, con atención personalizada y los mejores productos del mercado.',
  mission_title: 'Misión',
  mission_description:
    'Facilitar el acceso a la tecnología, ofreciendo productos y servicios de vanguardia que impulsen el desarrollo de nuestros clientes.',
  vision_title: 'Visión',
  vision_description:
    'Ser la empresa líder en soluciones tecnológicas en la región, reconocida por nuestra innovación, confiabilidad y compromiso con el cliente.',
  values_title: 'Valores',
  values_description: 'Confianza, Experiencia, Innovación y Atención Personalizada.',
  schedule_title: 'Nuestros Horarios',
  schedule_mon_thu: 'Lunes a Jueves: 7:30 a 12:30 y 15:30 a 19:30 hs.',
  schedule_fri: 'Viernes: 8:00 a 12:00 y de 15:30 a 19:30 hs.',
  schedule_sat: 'Sábados: Cerrado',
  contact_title: 'Contactanos sin compromiso',
  contact_description:
    '¿Tenés alguna duda o necesitás un presupuesto? Completá el formulario o envianos un WhatsApp.',
  hero_image_url: '',
  carousel_images: [] as string[],
  carousel_mobile_images: [] as string[],
  carousel_image1_url: '',
  carousel_image2_url: '',
  carousel_image3_url: '',
  carousel_mobile_image1_url: '',
  carousel_mobile_image2_url: '',
  carousel_mobile_image3_url: '',
};

const defaultContactInfo = {
  whatsapp: '5493564504977',
  instagram: 'https://www.instagram.com/dariomartinezcomputacion/',
  facebook: 'https://www.facebook.com/profile.php?id=61585160335205',
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function Home() {
  const [homeContent, setHomeContent] = React.useState(defaultHomeContent);
  const [homeProducts, setHomeProducts] = React.useState<HomeProduct[]>(defaultProducts);
  const [workshopImageUrl, setWorkshopImageUrl] = React.useState<string>('');
  const [contactInfo, setContactInfo] = React.useState(defaultContactInfo);
  const [isHomeContentLoaded, setIsHomeContentLoaded] = React.useState(false);
  const [isCoverageMapUnlocked, setIsCoverageMapUnlocked] = React.useState(false);
  const [locationQuery, setLocationQuery] = React.useState('');

  const desktopPlugin = React.useRef(Autoplay({ delay: 4200, stopOnInteraction: true }));
  const mobilePlugin = React.useRef(Autoplay({ delay: 4200, stopOnInteraction: true }));

  const normalizeCarouselUrls = React.useCallback((value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }, []);

  React.useEffect(() => {
    const loadHomeContent = async () => {
      try {
        const [homeRes, productsRes, serviceImgRes, contact] = await Promise.all([
          supabase.from('home_content').select('*').eq('id', 1).maybeSingle(),
          supabase
            .from('productos')
            .select('slug, titulo, descripcion, imagen_url, orden')
            .order('orden', { ascending: true })
            .limit(6),
          supabase
            .from('servicios')
            .select('imagen_url')
            .order('orden', { ascending: true })
            .limit(1)
            .maybeSingle(),
          getSharedContactInfo(),
        ]);

        if (homeRes.data) {
          setHomeContent({
            ...defaultHomeContent,
            ...homeRes.data,
          });
        }

        if (serviceImgRes.data?.imagen_url) {
          setWorkshopImageUrl(String(serviceImgRes.data.imagen_url).trim());
        }

        if (productsRes.data && productsRes.data.length > 0) {
          setHomeProducts(
            productsRes.data.map((item: any, index: number) => ({
              imageId: item.slug || `product-${index + 1}`,
              title: item.titulo || '',
              description: item.descripcion || '',
              imageUrl:
                typeof item.imagen_url === 'string' &&
                item.imagen_url.trim().length > 0 &&
                !item.imagen_url.includes('unsplash.com')
                  ? item.imagen_url.trim()
                  : undefined,
            }))
          );
        }

        setContactInfo({
          whatsapp: contact.whatsapp || DEFAULT_CONTACT_INFO.whatsapp,
          instagram: contact.instagram || DEFAULT_CONTACT_INFO.instagram,
          facebook: contact.facebook || DEFAULT_CONTACT_INFO.facebook,
        });
      } finally {
        setIsHomeContentLoaded(true);
      }
    };

    loadHomeContent();
  }, []);

  const whatsappDigits = (contactInfo.whatsapp || defaultContactInfo.whatsapp).replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappDigits}`;

  const savedCarouselImages = (() => {
    const fromArray = normalizeCarouselUrls((homeContent as any).carousel_images);
    if (fromArray.length > 0) return fromArray;
    return [
      homeContent.carousel_image1_url,
      homeContent.carousel_image2_url,
      homeContent.carousel_image3_url,
    ].filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  })();

  const savedMobileCarouselImages = (() => {
    const fromArray = normalizeCarouselUrls((homeContent as any).carousel_mobile_images);
    if (fromArray.length > 0) return fromArray;
    return [
      homeContent.carousel_mobile_image1_url,
      homeContent.carousel_mobile_image2_url,
      homeContent.carousel_mobile_image3_url,
    ].filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  })();

  const carouselImagesToRender = savedCarouselImages.map((url, index) => ({
    id: `carousel-${index + 1}`,
    imageUrl: url,
    description: `Novedad ${index + 1} de Darío Martínez Computación`,
  }));

  const mobileCarouselImagesToRender =
    savedMobileCarouselImages.length > 0
      ? savedMobileCarouselImages.map((url, index) => ({
          id: `carousel-mobile-${index + 1}`,
          imageUrl: url,
          description: `Novedad ${index + 1} móvil de Darío Martínez Computación`,
        }))
      : carouselImagesToRender;

  // Deduplicar localidades (evita duplicados como "María Juana" en BD y errores de React key)
  const coverageLocations = React.useMemo(() => {
    const normalizedText = (
      homeContent.coverage_locations_text || defaultHomeContent.coverage_locations_text
    ).replace(/\\n/g, '\n');

    const seen = new Set<string>();
    const list: string[] = [];
    for (const raw of normalizedText.split(/\r?\n/)) {
      const clean = raw.replace(/\t+/g, ' ').trim();
      if (!clean) continue;
      const key = normalizeText(clean);
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(clean);
    }
    return list;
  }, [homeContent.coverage_locations_text]);

  const normalizedQuery = normalizeText(locationQuery);
  const matchingLocations = normalizedQuery
    ? coverageLocations.filter((loc) => normalizeText(loc).includes(normalizedQuery))
    : coverageLocations;

  // Solo mostrar "Nuestros clientes" si hay clientes reales cargados desde Admin (no los placeholders de medios de pago/POSBerry)
  const realClients = React.useMemo(() => {
    const rawClients = Array.isArray((homeContent as any).clients) ? (homeContent as any).clients : [];
    return rawClients
      .map((client: any) => ({
        name: typeof client?.name === 'string' ? client.name.trim() : '',
        src: typeof client?.logoUrl === 'string' ? client.logoUrl.trim() : '',
      }))
      .filter(
        (client: { name: string; src: string }) =>
          client.name.length > 0 &&
          client.src.length > 0 &&
          !PLACEHOLDER_CLIENT_SRCS.has(client.src.toLowerCase())
      );
  }, [homeContent]);

  const marqueeItems = React.useMemo(() => {
    if (realClients.length === 0) return [];
    const repeatCount = Math.max(2, Math.ceil(10 / Math.max(realClients.length, 1)));
    return Array.from({ length: repeatCount }, () => realClients).flat();
  }, [realClients]);

  return (
    <div className="w-full bg-background text-foreground">
      {/* 1. Banner / Carrusel gestionado desde CMS */}
      {isHomeContentLoaded && carouselImagesToRender.length > 0 && (
        <section aria-label="Destacados" className="w-full overflow-hidden border-b border-border bg-surface">
          <Carousel
            plugins={[desktopPlugin.current]}
            className="hidden w-full md:block"
            onMouseEnter={desktopPlugin.current.stop}
            onMouseLeave={desktopPlugin.current.reset}
            opts={{ loop: true }}
          >
            <CarouselContent>
              {carouselImagesToRender.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="relative h-[420px] w-full lg:h-[540px]">
                    <LoadingImage
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="100vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {carouselImagesToRender.length > 1 && (
              <>
                <CarouselPrevious className="left-5 h-11 w-11 border-white/25 bg-ink/45 text-white backdrop-blur-sm hover:bg-ink/70" />
                <CarouselNext className="right-5 h-11 w-11 border-white/25 bg-ink/45 text-white backdrop-blur-sm hover:bg-ink/70" />
              </>
            )}
          </Carousel>

          <Carousel
            plugins={[mobilePlugin.current]}
            className="block w-full md:hidden"
            onMouseEnter={mobilePlugin.current.stop}
            onMouseLeave={mobilePlugin.current.reset}
            opts={{ loop: true }}
          >
            <CarouselContent>
              {mobileCarouselImagesToRender.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="relative aspect-[9/14] w-full">
                    <LoadingImage
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="100vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {mobileCarouselImagesToRender.length > 1 && (
              <>
                <CarouselPrevious className="left-3 h-9 w-9 border-white/25 bg-ink/45 text-white backdrop-blur-sm hover:bg-ink/70" />
                <CarouselNext className="right-3 h-9 w-9 border-white/25 bg-ink/45 text-white backdrop-blur-sm hover:bg-ink/70" />
              </>
            )}
          </Carousel>
        </section>
      )}

      {/* 2. Apertura Editorial con degradé azul-blanco luminoso + Aurora React Bits */}
      <section id="inicio" className="bg-brand-hero relative w-full overflow-hidden border-b border-border">
        <AuroraBackdrop variant="light" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:py-20 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-7 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <LiveOpenStatus />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Libertador Norte 163, San Francisco
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="font-headline text-4xl font-extrabold leading-[1.04] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
                  {homeContent.hero_title}
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg md:text-xl">
                  {homeContent.hero_description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Magnet strength={0.2}>
                  <Button asChild size="lg" className="h-12 w-full rounded-full px-7 text-base sm:w-auto">
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('whatsapp_click', { label: 'Home Hero Primary' })}
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      Contactar por WhatsApp
                    </Link>
                  </Button>
                </Magnet>
                <Magnet strength={0.18}>
                  <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-full bg-white/90 px-7 text-base backdrop-blur-sm sm:w-auto">
                    <Link href="/productos">
                      Ver catálogo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Magnet>
                <Button asChild variant="ghost" size="lg" className="h-12 rounded-full px-5 text-base text-primary">
                  <Link href="/servicios">Servicio Técnico</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <SpotlightCard
                spotlightColor="rgba(0, 48, 143, 0.14)"
                className="rounded-2xl border border-primary/15 bg-white shadow-[0_24px_56px_-24px_rgba(0,48,143,0.24)] transition-shadow duration-300 hover:shadow-[0_30px_68px_-22px_rgba(0,48,143,0.34)]"
              >
                <LoadingImage
                  src={homeContent.hero_image_url || '/FOTOFRENTE.jpeg'}
                  alt="Darío Martínez Computación en San Francisco"
                  width={720}
                  height={540}
                  priority
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-gradient-to-r from-white via-[#F5F8FF] to-white text-center">
                  <div className="px-3 py-3.5">
                    <p className="font-headline text-lg font-bold text-primary sm:text-xl">
                      <CountUp to={50} prefix="~" suffix=" años" />
                    </p>
                    <p className="text-xs text-muted-foreground">Trayectoria</p>
                  </div>
                  <div className="px-3 py-3.5">
                    <p className="font-headline text-lg font-bold text-primary sm:text-xl">
                      <CountUp to={coverageLocations.length} prefix="+" />
                    </p>
                    <p className="text-xs text-muted-foreground">Localidades</p>
                  </div>
                  <div className="px-3 py-3.5">
                    <p className="font-headline text-lg font-bold text-primary sm:text-xl">
                      <CountUp to={90} suffix=" días" />
                    </p>
                    <p className="text-xs text-muted-foreground">Garantía taller</p>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>

          {/* Barra arquitectónica de 4 accesos directos con SpotlightCard */}
          <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickDivisions.map((div) => {
              const Icon = div.icon;
              return (
                <SpotlightCard
                  key={div.href}
                  spotlightColor="rgba(0, 48, 143, 0.14)"
                  className="rounded-2xl border border-primary/15 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 ease-expo hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_18px_36px_-18px_rgba(0,48,143,0.3)]"
                >
                  <Link
                    href={div.href}
                    className="group relative z-20 flex h-full items-start justify-between gap-4 p-5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 text-primary">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/8 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                          <Icon className="h-4 w-4 shrink-0" />
                        </span>
                        <span className="font-headline text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                          {div.title}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{div.summary}</p>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-expo group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
                  </Link>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Servicio Técnico — Panel real de taller + retícula de 6 especialidades */}
      <section id="servicios" className="bg-brand-soft w-full border-b border-border py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl lg:text-5xl">
                  {homeContent.services_title}
                </h2>
                <p className="max-w-2xl text-base leading-relaxed text-foreground/75 md:text-lg">
                  {homeContent.services_description}
                </p>
              </div>
              <div className="lg:col-span-5 lg:justify-self-end">
                <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-[#00308F] to-[#2349B6] px-7 text-white hover:opacity-95">
                  <Link href="/servicios">
                    Ver detalle y herramientas remotas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            {/* Panel completo del taller — sin espacios vacíos, con foto real, garantías y soporte remoto */}
            <ScrollReveal direction="left" className="flex lg:col-span-5">
              <div className="bg-brand-cobalt flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-primary/20 text-white shadow-[0_24px_56px_-24px_rgba(0,48,143,0.45)]">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <LoadingImage
                    src={workshopImageUrl || '/FOTOFRENTE.jpeg'}
                    alt="Taller propio de Servicio Técnico Darío Martínez Computación"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001C57] via-[#001C57]/35 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#001C57]/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      <MonitorCheck className="h-3.5 w-3.5 text-emerald-300" />
                      Taller propio y asistencia remota
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-7">
                  <div className="space-y-3">
                    <h3 className="font-headline text-2xl font-bold leading-tight text-white">
                      Diagnóstico preciso en taller y soporte a distancia
                    </h3>
                    <p className="text-sm leading-relaxed text-white/80">
                      Atendemos hogares, comercios y empresas con repuestos de primera calidad, mantenimiento preventivo y conexión remota segura.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-3 backdrop-blur-sm">
                      <p className="font-headline text-base font-bold text-white tabular-nums">90 días</p>
                      <p className="mt-0.5 text-xs text-white/75">Garantía escrita</p>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-3 backdrop-blur-sm">
                      <p className="font-headline text-base font-bold text-white tabular-nums">24–72 hs</p>
                      <p className="mt-0.5 text-xs text-white/75">Diagnóstico</p>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-3 backdrop-blur-sm">
                      <p className="font-headline text-base font-bold text-white">Remoto</p>
                      <p className="mt-0.5 text-xs text-white/75">En el día</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border-t border-white/15 pt-5">
                    <p className="text-xs font-semibold text-white/75">
                      ¿Necesitás soporte remoto ahora? Descargá una herramienta:
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <a
                        href="https://anydesk.com/es/downloads/windows"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('tool_download', { label: 'AnyDesk Home' })}
                        className="rb-glare rb-pill-interactive relative inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#EF443B] to-[#D93229] px-3.5 py-2.5 text-xs font-semibold text-white shadow-md hover:shadow-[0_12px_26px_-8px_rgba(239,68,59,0.6)]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        AnyDesk
                      </a>
                      <a
                        href="https://www.teamviewer.com/es/descarga/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('tool_download', { label: 'TeamViewer Home' })}
                        className="rb-glare rb-pill-interactive relative inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3.5 py-2.5 text-xs font-semibold text-primary shadow-md hover:bg-white/95"
                      >
                        <Download className="h-3.5 w-3.5" />
                        TeamViewer
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Directorio interactivo de los 6 servicios con SpotlightCard */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:col-span-7">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <ScrollReveal key={service.title} delayMs={index * 60}>
                    <SpotlightCard
                      spotlightColor="rgba(0, 48, 143, 0.13)"
                      className="h-full rounded-2xl border border-primary/12 bg-white shadow-sm transition-all duration-300 ease-expo hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_18px_36px_-18px_rgba(0,48,143,0.28)]"
                    >
                      <Link
                        href="/servicios"
                        className="group relative z-20 flex h-full flex-col justify-between p-6"
                      >
                        <div className="space-y-3">
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-gradient-to-br from-primary/12 to-accent/5 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-white">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="font-headline text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                            {service.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                          Ver alcance
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-expo group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </SpotlightCard>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Nuestros Productos — Imágenes a sangre completa ocupando el 100% de su contenedor */}
      <section id="productos" className="bg-brand-mist w-full border-b border-border py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="space-y-3">
                <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl lg:text-5xl">
                  {homeContent.products_title}
                </h2>
                <p className="max-w-2xl text-base leading-relaxed text-foreground/75 md:text-lg">
                  {homeContent.products_description}
                </p>
              </div>
              <Button asChild size="lg" variant="outline" className="w-fit rounded-full bg-white px-7">
                <Link href="/productos">
                  Ver todos los productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {homeProducts.map((product, index) => (
              <ScrollReveal key={`${product.imageId}-${index}`} delayMs={index * 65}>
                <SpotlightCard
                  spotlightColor="rgba(0, 48, 143, 0.14)"
                  className="group flex h-full flex-col rounded-2xl border border-primary/12 bg-white shadow-sm transition-all duration-300 ease-expo hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[0_24px_48px_-20px_rgba(0,48,143,0.28)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border bg-surface">
                    {product.imageUrl ? (
                      <LoadingImage
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        className="h-full w-full object-cover transition-transform duration-500 ease-expo group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="bg-brand-soft flex h-full w-full items-center justify-center text-primary/40">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                  </div>

                  <div className="relative z-20 flex flex-1 flex-col justify-between p-6">
                    <div className="space-y-2">
                      <h3 className="font-headline text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {product.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                      <Link
                        href={`/productos?q=${encodeURIComponent(product.title.split(' ')[0])}`}
                        onClick={() => trackEvent('product_click', { label: product.title })}
                        className="group/link inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-[#1D44B2]"
                      >
                        Explorar catálogo
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-expo group-hover/link:translate-x-1" />
                      </Link>
                      <Link
                        href={`${whatsappUrl}?text=${encodeURIComponent(`Hola, quiero consultar por ${product.title}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          trackEvent('product_click', { label: product.title });
                          trackEvent('whatsapp_click', { label: `Producto Home: ${product.title}` });
                        }}
                        className="rb-glare rb-pill-interactive relative inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:border-transparent hover:bg-[#1FAF5A] hover:text-white"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                        Consultar
                      </Link>
                    </div>
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Bloque Azul Institucional con degradé profundo + Aurora */}
      <section className="bg-brand-cobalt relative w-full overflow-hidden py-20 text-primary-foreground lg:py-28">
        <AuroraBackdrop variant="cobalt" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <ScrollReveal direction="left" className="space-y-6 lg:col-span-6">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] text-white sm:text-4xl lg:text-5xl">
                {homeContent.controladores_title}
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
                {homeContent.controladores_description}
              </p>

              <ul className="space-y-3 pt-1">
                {[
                  homeContent.controladores_feature_1,
                  homeContent.controladores_feature_2,
                  homeContent.controladores_feature_3,
                ]
                  .filter(Boolean)
                  .map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-white/95 sm:text-base">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-white px-7 text-base font-semibold text-primary shadow-md hover:bg-white/92"
                >
                  <Link
                    href={homeContent.controladores_button_link || '/controladores-fiscales'}
                    target={homeContent.controladores_button_link?.startsWith('http') ? '_blank' : undefined}
                  >
                    {homeContent.controladores_button_text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/35 bg-white/5 px-7 text-base text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
                >
                  <Link href="/posberry">Conocer POSBerry</Link>
                </Button>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl border border-white/20 bg-white text-foreground shadow-[0_24px_60px_-16px_rgba(0,0,0,0.45)]">
                {homeContent.controladores_image_url &&
                homeContent.controladores_image_url !== '/POSBERRY2.png' ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <LoadingImage
                      src={homeContent.controladores_image_url}
                      alt="Controladores Fiscales homologados"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="bg-brand-soft flex aspect-[16/10] w-full flex-col items-center justify-center gap-4 p-8 text-center">
                    <Receipt className="h-14 w-14 text-primary" />
                    <p className="font-headline text-xl font-bold text-foreground">
                      Equipos Fiscales 2da Generación Homologados
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-gradient-to-r from-white via-[#F6F9FF] to-white px-6 py-4">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Marcas homologadas y soporte técnico fiscal
                  </span>
                  <div className="flex items-center gap-6">
                    <img src="/hasarlogo.png" alt="Hasar" className="h-7 w-auto object-contain sm:h-8" />
                    <img src="/epsonlogo.png" alt="Epson" className="h-6 w-auto object-contain sm:h-7" />
                    <img src="/samsunglogo.png" alt="Samsung" className="h-6 w-auto object-contain sm:h-7" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 6. Sobre Nosotros — Fotografía real del local + Misión, Visión, Valores y Horarios */}
      <section id="sobre-nosotros" className="bg-brand-mist w-full border-b border-border py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl lg:text-5xl">
                {homeContent.about_title}
              </h2>
              <p className="text-base leading-relaxed text-foreground/75 md:text-lg">
                {homeContent.about_description}
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <ScrollReveal direction="left" className="space-y-6 lg:col-span-7">
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                {[
                  { icon: Target, title: homeContent.mission_title, desc: homeContent.mission_description },
                  { icon: Eye, title: homeContent.vision_title, desc: homeContent.vision_description },
                  { icon: Gem, title: homeContent.values_title, desc: homeContent.values_description },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-4 p-6">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/12 to-accent/5 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-headline text-lg font-bold text-foreground">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-[#F4F8FF] to-[#EBF2FE] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2.5 font-headline text-lg font-bold">
                    <Clock className="h-5 w-5 text-primary" />
                    {homeContent.schedule_title}
                  </h3>
                  <LiveOpenStatus />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-foreground/80">
                  <p>{homeContent.schedule_mon_thu}</p>
                  <p>{homeContent.schedule_fri}</p>
                  <p className="text-muted-foreground">{homeContent.schedule_sat}</p>
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <Link
                    href="/sobre-nosotros"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Conocé nuestra historia y evolución
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-md">
                <LoadingImage
                  src="/FOTOFRENTE.jpeg"
                  alt="Frente del local Darío Martínez Computación"
                  width={600}
                  height={720}
                  className="aspect-[4/5] w-full object-cover object-center"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 7. Nuestros Clientes — Solo visible cuando se carguen clientes reales desde el panel de administración */}
      {realClients.length > 0 && (
        <section id="nuestros-clientes" className="bg-brand-soft w-full border-b border-border py-16 lg:py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl space-y-2 text-center">
                <h2 className="font-headline text-2xl font-bold tracking-[-0.02em] sm:text-3xl lg:text-4xl">
                  {homeContent.clients_title}
                </h2>
                <p className="text-sm text-foreground/75 sm:text-base">
                  {homeContent.clients_description}
                </p>
              </div>
            </ScrollReveal>
          </div>

          <div className="marquee-pause mt-10 overflow-hidden">
            <div className="clients-marquee-left flex w-max items-center will-change-transform">
              {[0, 1].map((dupIndex) => (
                <div
                  key={`clients-dup-${dupIndex}`}
                  aria-hidden={dupIndex === 1}
                  className="flex shrink-0 items-center gap-5 pr-5"
                >
                  {marqueeItems.map((logo, idx) => (
                    <div
                      key={`client-${dupIndex}-${logo.name}-${idx}`}
                      className="flex h-16 shrink-0 items-center justify-center rounded-xl border border-border bg-white px-6 shadow-xs"
                    >
                      <img
                        src={logo.src}
                        alt={logo.name}
                        title={logo.name}
                        className="max-h-9 w-auto max-w-[140px] object-contain"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Cobertura Regional — Localidades centradas y estáticas (no clickeables) */}
      <section id="donde-trabajamos" className="bg-brand-soft w-full border-b border-border py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl lg:text-5xl">
                {homeContent.coverage_title}
              </h2>
              <p className="text-base leading-relaxed text-foreground/75 md:text-lg">
                {homeContent.coverage_description}
              </p>

              {/* Buscador opcional para verificar una localidad puntual */}
              <div className="mx-auto max-w-md pt-2">
                <label htmlFor="coverage-search" className="sr-only">
                  Buscar tu localidad
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="coverage-search"
                    type="search"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Verificá tu localidad (ej: Arroyito, Brinkmann, Morteros...)"
                    className="h-11 w-full rounded-full border border-primary/20 bg-white pl-11 pr-4 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Localidades centradas, ordenadas y NO interactivas */}
          <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-primary/15 bg-white/85 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            {normalizedQuery.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-[#F3F7FF] p-4">
                {matchingLocations.length > 0 ? (
                  <>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      <p className="text-sm font-medium text-foreground">
                        Sí, cubrimos{' '}
                        <span className="font-bold text-primary">
                          {matchingLocations.slice(0, 3).join(', ')}
                          {matchingLocations.length > 3 ? ` y ${matchingLocations.length - 3} más` : ''}
                        </span>{' '}
                        con instalación, soporte técnico y envíos.
                      </p>
                    </div>
                    <Button asChild size="sm" className="rounded-full">
                      <Link
                        href={`${whatsappUrl}?text=${encodeURIComponent(
                          `Hola, quiero consultar por atención/envío en ${matchingLocations[0]}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent('whatsapp_click', { label: `Cobertura: ${matchingLocations[0]}` })
                        }
                      >
                        <WhatsAppIcon className="mr-2 h-4 w-4" />
                        Consultar para {matchingLocations[0]}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-foreground/80">
                      No vemos <strong>{locationQuery}</strong> en la lista rápida, pero consultanos: coordinamos visitas y envíos en toda la región.
                    </p>
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link
                        href={`${whatsappUrl}?text=${encodeURIComponent(
                          `Hola, quería consultar si llegan con servicio o envío a ${locationQuery}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('whatsapp_click', { label: `Cobertura consulta: ${locationQuery}` })}
                      >
                        Consultar mi zona
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2.5 text-center">
              {matchingLocations.map((location, index) => (
                <span
                  key={`${location}-${index}`}
                  className="pointer-events-none inline-flex cursor-default select-none items-center gap-1.5 rounded-full border border-border/80 bg-gradient-to-b from-white to-[#F4F8FF] px-3.5 py-1.5 text-xs font-medium text-foreground/80"
                >
                  <MapPin className="h-3 w-3 text-primary/70" />
                  {location}
                </span>
              ))}
            </div>
          </div>

          {/* Mapa interactivo de cobertura */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm">
            <div className="relative aspect-[4/3] w-full md:aspect-[21/9]">
              <iframe
                src={homeContent.coverage_map_embed_url}
                width="100%"
                height="100%"
                title="Mapa de cobertura de servicios"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className={cn(
                  'absolute left-0 top-[-56px] h-[calc(100%+56px)] w-full border-0',
                  isCoverageMapUnlocked ? 'pointer-events-auto' : 'pointer-events-none'
                )}
              />
              {!isCoverageMapUnlocked && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[3px]">
                  <div className="max-w-md space-y-4 rounded-2xl border border-white/15 bg-background/95 p-6 text-center shadow-lg">
                    <p className="text-sm font-medium leading-relaxed text-foreground sm:text-base">
                      {homeContent.coverage_overlay_text}
                    </p>
                    <Button
                      type="button"
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-[#00308F] to-[#2349B6] px-7 text-white"
                      onClick={() => setIsCoverageMapUnlocked(true)}
                    >
                      {homeContent.coverage_overlay_button_text}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="max-w-2xl text-sm text-muted-foreground">{homeContent.coverage_footer_text}</p>
            <Link
              href={homeContent.coverage_footer_link_url || '/contacto'}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {homeContent.coverage_footer_link_text}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Contacto Final */}
      <section id="contacto" className="bg-brand-mist w-full py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 rounded-3xl border border-primary/15 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(0,48,143,0.18)] sm:p-10 lg:grid-cols-12 lg:p-14">
            <ScrollReveal direction="left" className="space-y-6 lg:col-span-5">
              <BrandLogo size="xl" />
              <div className="space-y-3">
                <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                  {homeContent.contact_title}
                </h2>
                <p className="text-base leading-relaxed text-foreground/75">
                  {homeContent.contact_description}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Tu consulta es bienvenida. ¡Respondemos a la brevedad!
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Magnet strength={0.2}>
                  <Button asChild variant="whatsapp" className="h-11 rounded-full px-5">
                    <Link
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp"
                      onClick={() => trackEvent('whatsapp_click', { label: 'Home Contact Icon' })}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      WhatsApp
                    </Link>
                  </Button>
                </Magnet>
                <Magnet strength={0.2}>
                  <Button asChild variant="instagram" className="h-11 rounded-full px-5">
                    <Link
                      href={contactInfo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      onClick={() => trackEvent('social_click', { label: 'Instagram Home Contact' })}
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Link>
                  </Button>
                </Magnet>
                <Link
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  onClick={() => trackEvent('social_click', { label: 'Facebook Home Contact' })}
                  className="rb-glare rb-facebook-btn relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-primary/15 bg-white text-foreground/80"
                >
                  <FacebookIcon className="h-5 w-5" />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="lg:col-span-7">
              <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-[#F5F8FF] via-white to-[#EEF4FF] p-6 sm:p-8">
                <ContactForm />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
