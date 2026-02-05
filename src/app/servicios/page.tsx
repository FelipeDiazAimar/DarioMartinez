
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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 py-12">
          {services.map((service) => (
            <Card
              key={service.title}
              className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  {service.icon}
                </div>
                <div className="flex-1 space-y-1.5">
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
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
