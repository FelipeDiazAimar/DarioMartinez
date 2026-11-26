'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Cpu,
  ShieldCheck,
  Wrench,
  Wifi,
  Users,
  HardDrive,
  ArrowRight,
  ChevronDown,
  Check,
  Download,
  MessageCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LoadingImage } from '@/components/loading-image';
import { ScrollReveal } from '@/components/scroll-reveal';
import { AuroraBackdrop, Magnet } from '@/components/react-bits';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { supabase } from '@/lib/supabase-client';
import { trackEvent } from '@/lib/analytics-client';

const defaultServices = [
  {
    icon: Wrench,
    title: 'Reparación de PC y Notebooks',
    description: 'Diagnóstico y solución de problemas de hardware y software.',
    imageId: 'service-pc-repair',
    imageUrl: '',
    details: [
      'Diagnóstico preciso de fallas de hardware (placas madre, fuentes, discos) y software (virus, errores de sistema, drivers).',
      'Reemplazo de componentes dañados: pantallas, teclados, baterías, memorias RAM, discos duros y SSD.',
      'Solución experta a problemas de lentitud, sobrecalentamiento, reinicios inesperados y pantallas azules.',
      'Reparación de equipos de todas las marcas y modelos, tanto de escritorio como portátiles.',
      'Uso de repuestos originales o de primera calidad, con garantía en todas nuestras reparaciones.',
    ],
  },
  {
    icon: HardDrive,
    title: 'Instalación de Windows y Software',
    description: 'Instalación y configuración de sistemas operativos y programas.',
    imageId: 'service-software-install',
    imageUrl: '',
    details: [
      'Instalación desde cero de Windows 11, 10 o la versión que necesites, con licencia original.',
      'Configuración inicial del sistema, incluyendo drivers, actualizaciones y optimización para máximo rendimiento.',
      'Instalación de paquete de software esencial: Office (Word, Excel, etc.), antivirus, compresores y lectores de PDF.',
      'Instalación de programas específicos a pedido, para diseño, arquitectura, edición de video, etc.',
      'Back-up y restauración de tus archivos personales para que no pierdas ninguna información importante.',
    ],
  },
  {
    icon: Cpu,
    title: 'Actualización de Hardware',
    description: 'Mejora el rendimiento con nuevos componentes (SSD, RAM).',
    imageId: 'service-hardware-upgrade',
    imageUrl: '',
    details: [
      'Reemplazo de discos rígidos mecánicos (HDD) por unidades de estado sólido (SSD) para una velocidad hasta 10 veces mayor.',
      'Ampliación de la memoria RAM para mejorar la multitarea y el rendimiento general del sistema.',
      'Cambio de procesador (CPU) o placa de video (GPU) para potenciar tu equipo para gaming o trabajo profesional.',
      'Asesoramiento personalizado para elegir los componentes más adecuados según tus necesidades y presupuesto.',
      'Instalación y configuración de los nuevos componentes, asegurando la compatibilidad y estabilidad del sistema.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Mantenimiento Preventivo',
    description: 'Limpieza y optimización para alargar la vida útil de tus equipos.',
    imageId: 'service-maintenance',
    imageUrl: '',
    details: [
      'Limpieza física interna completa para eliminar polvo y pelusa que causan sobrecalentamiento.',
      'Cambio de pasta térmica del procesador y placa de video para mantener temperaturas óptimas de funcionamiento.',
      'Limpieza de software: eliminación de archivos basura, temporales y desinstalación de programas innecesarios.',
      'Optimización del arranque del sistema y de los servicios para un inicio más rápido.',
      'Análisis y eliminación de virus, malware y spyware para proteger tu información y privacidad.',
    ],
  },
  {
    icon: Wifi,
    title: 'Redes, WiFi y Routers',
    description: 'Configuración y optimización de tu red doméstica o de oficina.',
    imageId: 'service-networking',
    imageUrl: '',
    details: [
      'Instalación y configuración de routers y repetidores para ampliar la cobertura WiFi en toda tu casa u oficina.',
      'Solución a problemas de conexión a internet, cortes intermitentes y baja velocidad.',
      'Configuración de redes cableadas (Ethernet) para una conexión más estable y rápida.',
      'Aseguramos tu red WiFi con contraseñas robustas y protocolos de seguridad modernos para evitar intrusos.',
      'Asesoramiento para elegir el proveedor de internet y el equipamiento de red más conveniente para vos.',
    ],
  },
  {
    icon: Users,
    title: 'Asistencia Técnica',
    description: 'Soporte remoto y presencial para hogares y empresas.',
    imageId: 'service-tech-support',
    imageUrl: '',
    details: [
      'Soporte técnico remoto a través de herramientas seguras para solucionar problemas de software de forma inmediata.',
      'Visitas a domicilio u oficina para resolver problemas de hardware o redes que requieran asistencia presencial.',
      'Planes de abono mensual para empresas, con soporte prioritario y mantenimiento preventivo periódico.',
      'Capacitación a usuarios para el manejo de nuevo software o hardware.',
      'Atención personalizada y seguimiento de cada caso hasta su completa resolución.',
    ],
  },
];

const iconMap: Record<string, typeof Wrench> = {
  wrench: Wrench,
  harddrive: HardDrive,
  cpu: Cpu,
  shieldcheck: ShieldCheck,
  wifi: Wifi,
  users: Users,
};

const normalizeDetails = (detalles: unknown, fallback: string[]) => {
  if (Array.isArray(detalles) && detalles.length > 0) {
    return detalles
      .map((item: any) => (typeof item === 'string' ? item : item?.texto || item?.text || ''))
      .filter(Boolean);
  }
  return fallback;
};

export default function ServiciosPage() {
  const [servicesData, setServicesData] = React.useState(defaultServices);

  React.useEffect(() => {
    const loadServices = async () => {
      const { data } = await supabase
        .from('servicios')
        .select('*')
        .order('orden', { ascending: true });

      if (data && data.length > 0) {
        const mapped = data.map((item: any, index: number) => {
          const fallback = defaultServices[index] || defaultServices[0];
          return {
            icon: iconMap[(item.icono || '').toLowerCase()] || fallback.icon,
            title: item.titulo || fallback.title,
            description: item.descripcion || fallback.description,
            imageId: item.slug || fallback.imageId,
            imageUrl: item.imagen_url || '',
            details: normalizeDetails(item.detalles, fallback.details),
          };
        });
        setServicesData(mapped);
      }
    };

    loadServices();
  }, []);

  return (
    <div className="w-full bg-background text-foreground">
      {/* Encabezado con degradé institucional y foto real de taller */}
      <section className="bg-brand-hero relative w-full overflow-hidden border-b border-border py-16 lg:py-24">
        <AuroraBackdrop variant="light" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              <h1 className="font-headline text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                Servicio Técnico
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-foreground/75 md:text-xl">
                Ofrecemos una amplia gama de servicios para mantener tus equipos en perfecto estado y optimizar tu entorno tecnológico.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Magnet strength={0.2}>
                  <Button asChild variant="whatsapp" size="lg" className="h-12 rounded-full px-7">
                    <Link
                      href="https://wa.me/5493564504977?text=Hola%2C%20necesito%20consultar%20por%20servicio%20t%C3%A9cnico."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('whatsapp_click', { label: 'Servicios Hero' })}
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      Consultar por WhatsApp
                    </Link>
                  </Button>
                </Magnet>
                <Magnet strength={0.18}>
                  <Button asChild size="lg" variant="outline" className="h-12 rounded-full bg-white/90 px-7">
                    <Link href="#asistencia-remota">
                      <Download className="h-4 w-4" />
                      Asistencia remota
                    </Link>
                  </Button>
                </Magnet>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-brand-cobalt overflow-hidden rounded-2xl border border-primary/20 text-white shadow-[0_20px_50px_-24px_rgba(0,48,143,0.4)]">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <LoadingImage
                    src={servicesData[0]?.imageUrl || '/FOTOFRENTE.jpeg'}
                    alt="Taller propio de Servicio Técnico"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001C57] via-[#001C57]/25 to-transparent" />
                </div>
                <div className="grid grid-cols-3 divide-x divide-white/15 p-4 text-center">
                  <div>
                    <p className="font-headline text-base font-bold text-white tabular-nums">90 días</p>
                    <p className="text-xs text-white/75">Garantía</p>
                  </div>
                  <div>
                    <p className="font-headline text-base font-bold text-white tabular-nums">24–72 hs</p>
                    <p className="text-xs text-white/75">Diagnóstico</p>
                  </div>
                  <div>
                    <p className="font-headline text-base font-bold text-white">Remoto</p>
                    <p className="text-xs text-white/75">AnyDesk / TV</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acordeón detallado de servicios */}
      <section id="servicios" className="w-full border-b border-border bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible defaultValue={`${servicesData[0]?.imageId || 'servicio'}-0`} className="space-y-4">
            {servicesData.map((service, index) => {
              const Icon = service.icon;
              const serviceImage = PlaceHolderImages.find((img) => img.id === service.imageId);
              const serviceKey = `${service.imageId || service.title || 'servicio'}-${index}`;
              const resolvedImage = service.imageUrl || serviceImage?.imageUrl || '';

              return (
                <ScrollReveal key={serviceKey} delayMs={index * 55}>
                  <AccordionItem
                    value={serviceKey}
                    className="overflow-hidden rounded-2xl border border-border bg-background transition-colors data-[state=open]:border-primary/40"
                  >
                    <AccordionTrigger className="group flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-surface/60 hover:no-underline sm:p-6 [&>svg:last-child]:hidden">
                      <div className="flex items-start gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/8 text-primary sm:h-14 sm:w-14">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h2 className="font-headline text-lg font-bold text-foreground sm:text-xl">
                            {service.title}
                          </h2>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-expo group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
                    </AccordionTrigger>

                    <AccordionContent className="border-t border-border bg-surface/50 px-5 py-6 sm:px-6">
                      <div className="grid gap-6 md:grid-cols-12">
                        {resolvedImage && (
                          <div className="md:col-span-4">
                            <LoadingImage
                              src={resolvedImage}
                              alt={service.title}
                              width={600}
                              height={400}
                              className="aspect-video w-full rounded-xl border border-border object-cover md:aspect-[4/3]"
                            />
                          </div>
                        )}
                        <div className={resolvedImage ? 'md:col-span-8' : 'md:col-span-12'}>
                          <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/80 sm:text-base">
                            {service.details.map((point, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </ScrollReveal>
              );
            })}
          </Accordion>

          {/* Herramientas de Asistencia Remota */}
          <ScrollReveal className="mt-12">
            <div
              id="asistencia-remota"
              className="bg-brand-cobalt scroll-mt-24 rounded-2xl border border-primary/20 p-6 text-primary-foreground shadow-lg sm:p-8"
            >
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="space-y-2">
                  <h2 className="font-headline text-2xl font-bold text-white">
                    Herramientas de Asistencia Remota
                  </h2>
                  <p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                    Para recibir soporte a distancia, descargá una de las siguientes herramientas y contactanos.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Magnet strength={0.2}>
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-[#EF443B] to-[#D93229] text-white shadow-[0_10px_26px_-8px_rgba(239,68,59,0.6)] hover:shadow-[0_16px_32px_-8px_rgba(239,68,59,0.75)]"
                    >
                      <Link
                        href="https://anydesk.com/es/downloads/windows"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('tool_download', { label: 'AnyDesk' })}
                      >
                        <Download className="h-4 w-4" />
                        Descargar AnyDesk
                      </Link>
                    </Button>
                  </Magnet>
                  <Magnet strength={0.2}>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-full border-white/25 bg-white text-primary hover:bg-white/95 hover:text-primary"
                    >
                      <Link
                        href="https://www.teamviewer.com/es/descarga/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent('tool_download', { label: 'TeamViewer' })}
                      >
                        <Download className="h-4 w-4" />
                        Descargar TeamViewer
                      </Link>
                    </Button>
                  </Magnet>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-12 flex justify-center">
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8">
              <Link href="/contacto">
                Ir al formulario de contacto
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
