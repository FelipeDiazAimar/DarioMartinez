'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Cpu,
  ShieldCheck,
  Wrench,
  Wifi,
  Users,
  HardDrive,
  ArrowRight,
  ChevronRight,
  Check,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const services = [
    {
        icon: <Wrench className="h-10 w-10" />,
        title: 'Reparación de PC y Notebooks',
        description: 'Diagnóstico y solución de problemas de hardware y software.',
        imageId: 'service-pc-repair',
        details: [
            'Diagnóstico preciso de fallas de hardware (placas madre, fuentes, discos) y software (virus, errores de sistema, drivers).',
            'Reemplazo de componentes dañados: pantallas, teclados, baterías, memorias RAM, discos duros y SSD.',
            'Solución experta a problemas de lentitud, sobrecalentamiento, reinicios inesperados y pantallas azules.',
            'Reparación de equipos de todas las marcas y modelos, tanto de escritorio como portátiles.',
            'Uso de repuestos originales o de primera calidad, con garantía en todas nuestras reparaciones.'
        ]
    },
    {
        icon: <HardDrive className="h-10 w-10" />,
        title: 'Instalación de Windows y Software',
        description:
        'Instalación y configuración de sistemas operativos y programas.',
        imageId: 'service-software-install',
        details: [
            'Instalación desde cero de Windows 11, 10 o la versión que necesites, con licencia original.',
            'Configuración inicial del sistema, incluyendo drivers, actualizaciones y optimización para máximo rendimiento.',
            'Instalación de paquete de software esencial: Office (Word, Excel, etc.), antivirus, compresores y lectores de PDF.',
            'Instalación de programas específicos a pedido, para diseño, arquitectura, edición de video, etc.',
            'Back-up y restauración de tus archivos personales para que no pierdas ninguna información importante.'
        ]
    },
    {
        icon: <Cpu className="h-10 w-10" />,
        title: 'Actualización de Hardware',
        description: 'Mejora el rendimiento con nuevos componentes (SSD, RAM).',
        imageId: 'service-hardware-upgrade',
        details: [
            'Reemplazo de discos rígidos mecánicos (HDD) por unidades de estado sólido (SSD) para una velocidad hasta 10 veces mayor.',
            'Ampliación de la memoria RAM para mejorar la multitarea y el rendimiento general del sistema.',
            'Cambio de procesador (CPU) o placa de video (GPU) para potenciar tu equipo para gaming o trabajo profesional.',
            'Asesoramiento personalizado para elegir los componentes más adecuados según tus necesidades y presupuesto.',
            'Instalación y configuración de los nuevos componentes, asegurando la compatibilidad y estabilidad del sistema.'
        ]
    },
    {
        icon: <ShieldCheck className="h-10 w-10" />,
        title: 'Mantenimiento Preventivo',
        description:
        'Limpieza y optimización para alargar la vida útil de tus equipos.',
        imageId: 'service-maintenance',
        details: [
            'Limpieza física interna completa para eliminar polvo y pelusa que causan sobrecalentamiento.',
            'Cambio de pasta térmica del procesador y placa de video para mantener temperaturas óptimas de funcionamiento.',
            'Limpieza de software: eliminación de archivos basura, temporales y desinstalación de programas innecesarios.',
            'Optimización del arranque del sistema y de los servicios para un inicio más rápido.',
            'Análisis y eliminación de virus, malware y spyware para proteger tu información y privacidad.'
        ]
    },
    {
        icon: <Wifi className="h-10 w-10" />,
        title: 'Redes, WiFi y Routers',
        description: 'Configuración y optimización de tu red doméstica o de oficina.',
        imageId: 'service-networking',
        details: [
            'Instalación y configuración de routers y repetidores para ampliar la cobertura WiFi en toda tu casa u oficina.',
            'Solución a problemas de conexión a internet, cortes intermitentes y baja velocidad.',
            'Configuración de redes cableadas (Ethernet) para una conexión más estable y rápida.',
            'Aseguramos tu red WiFi con contraseñas robustas y protocolos de seguridad modernos para evitar intrusos.',
            'Asesoramiento para elegir el proveedor de internet y el equipamiento de red más conveniente para vos.'
        ]
    },
    {
        icon: <Users className="h-10 w-10" />,
        title: 'Asistencia Técnica',
        description: 'Soporte remoto y presencial para hogares y empresas.',
        imageId: 'service-tech-support',
        details: [
            'Soporte técnico remoto a través de herramientas seguras para solucionar problemas de software de forma inmediata.',
            'Visitas a domicilio u oficina para resolver problemas de hardware o redes que requieran asistencia presencial.',
            'Planes de abono mensual para empresas, con soporte prioritario y mantenimiento preventivo periódico.',
            'Capacitación a usuarios para el manejo de nuevo software o hardware.',
            'Atención personalizada y seguimiento de cada caso hasta su completa resolución.'
        ]
    },
];

export default function ServiciosPage() {
  return (
    <section
      id="servicios"
      className="w-full bg-white py-12 md:py-24 lg:py-32"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
              Servicio Técnico
            </h1>
            <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Ofrecemos una amplia gama de servicios para mantener tus equipos
              en perfecto estado y optimizar tu entorno tecnológico.
            </p>
          </div>
        </div>
        <Accordion type="single" collapsible className="mx-auto grid max-w-3xl grid-cols-1 gap-6 pt-12">
          {services.map((service, index) => {
            const serviceImage = PlaceHolderImages.find(img => img.id === service.imageId);
            return(
                <AccordionItem value={`item-${index}`} key={service.title} className="border-b-0">
                    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                        <AccordionTrigger className="group w-full p-6 text-left hover:no-underline [&>svg]:hidden">
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                                        {service.icon}
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <CardTitle className="text-xl">{service.title}</CardTitle>
                                        <CardDescription>{service.description}</CardDescription>
                                    </div>
                                </div>
                                <ChevronRight className="ml-4 h-8 w-8 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:scale-110 group-hover:text-primary group-data-[state=open]:rotate-90" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <CardContent className="pt-4">
                                <div className="grid gap-6 md:grid-cols-3">
                                    <div className="md:col-span-1">
                                        <Image
                                        src={serviceImage?.imageUrl || `https://picsum.photos/seed/${service.imageId}/600/400`}
                                        alt={service.title}
                                        width={600}
                                        height={400}
                                        className="w-full rounded-lg object-cover aspect-video"
                                        data-ai-hint={serviceImage?.imageHint || service.imageId.replace('-', ' ')}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <ul className="space-y-2 text-foreground/80">
                                        {service.details.map((point, i) => (
                                            <li key={i} className="flex items-start">
                                            <Check className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                                            <span>{point}</span>
                                            </li>
                                        ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            )
          })}
        </Accordion>
        
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 pt-6">
            <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                <CardHeader className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Download className="h-10 w-10" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <CardTitle className="text-xl">Herramientas de Asistencia Remota</CardTitle>
                            <CardDescription>Para recibir soporte a distancia, descargá una de las siguientes herramientas y contactanos.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                   <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild className="w-full rounded-full">
                            <Link href="https://anydesk.com/es/downloads/windows" target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-5 w-5" />
                                Descargar AnyDesk
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full rounded-full">
                            <Link href="https://www.teamviewer.com/es/descarga/" target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-5 w-5" />
                                Descargar TeamViewer
                            </Link>
                        </Button>
                   </div>
                </CardContent>
            </Card>
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/contacto">
              Contactar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
