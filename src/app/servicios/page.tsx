'use client';

import Link from 'next/link';
import {
  Cpu,
  ShieldCheck,
  Wrench,
  Wifi,
  Users,
  HardDrive,
  ArrowRight,
  ChevronRight,
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

const services = [
  {
    icon: <Wrench className="h-10 w-10" />,
    title: 'Reparación de PC y Notebooks',
    description: 'Diagnóstico y solución de problemas de hardware y software.',
    details: 'Realizamos un diagnóstico completo para identificar la falla, ya sea de hardware (componentes dañados) o software (virus, errores de sistema). Utilizamos repuestos de primera calidad y ofrecemos garantía en todas nuestras reparaciones.'
  },
  {
    icon: <HardDrive className="h-10 w-10" />,
    title: 'Instalación de Windows y Software',
    description:
      'Instalación y configuración de sistemas operativos y programas.',
    details: 'Instalamos la última versión de Windows o la que prefieras, junto con los programas esenciales que necesites (Office, antivirus, navegadores, etc.). Dejamos tu equipo listo para usar, optimizado para el mejor rendimiento.'
  },
  {
    icon: <Cpu className="h-10 w-10" />,
    title: 'Actualización de Hardware',
    description: 'Mejora el rendimiento con nuevos componentes (SSD, RAM).',
    details: 'Si tu equipo está lento, una actualización de hardware puede ser la solución. Aumentamos la memoria RAM, cambiamos tu viejo disco rígido por un SSD ultra rápido o mejoramos otros componentes para darle una nueva vida a tu PC o notebook.'
  },
  {
    icon: <ShieldCheck className="h-10 w-10" />,
    title: 'Mantenimiento Preventivo',
    description:
      'Limpieza y optimización para alargar la vida útil de tus equipos.',
    details: 'No esperes a que tu computadora falle. Con nuestro servicio de mantenimiento preventivo, realizamos una limpieza física y de software, optimizamos el sistema y prevenimos futuros problemas, asegurando un funcionamiento óptimo y prolongando su durabilidad.'
  },
  {
    icon: <Wifi className="h-10 w-10" />,
    title: 'Redes, WiFi y Routers',
    description: 'Configuración y optimización de tu red doméstica o de oficina.',
    details: '¿Problemas con tu conexión a internet? Configuramos y optimizamos tu red WiFi para una máxima cobertura y velocidad. Solucionamos problemas de conexión, instalamos routers y repetidores, y aseguramos tu red contra intrusos.'
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: 'Asistencia Técnica',
    description: 'Soporte remoto y presencial para hogares y empresas.',
    details: 'Ofrecemos abonos de soporte técnico para empresas y asistencia personalizada para usuarios particulares. Resolvemos tus dudas y problemas de forma rápida y eficiente, ya sea de forma remota o visitándote en tu domicilio u oficina.'
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
        <Accordion type="single" collapsible className="mx-auto grid max-w-3xl grid-cols-1 gap-6 py-12">
          {services.map((service, index) => (
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
                        <CardContent className="pt-0">
                            <p className="text-foreground/80">{service.details}</p>
                        </CardContent>
                    </AccordionContent>
                </Card>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-8 flex justify-center">
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
