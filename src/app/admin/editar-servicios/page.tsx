'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Control } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const serviceDetailSchema = z.string().min(10, { message: "El detalle es muy corto." });

const serviceSchema = z.object({
  title: z.string().min(5, { message: "El título es muy corto." }),
  description: z.string().min(10, { message: "La descripción es muy corta." }),
  details: z.array(serviceDetailSchema),
});

const formSchema = z.object({
  services: z.array(serviceSchema),
});

const defaultServices = [
    {
        title: 'Reparación de PC y Notebooks',
        description: 'Diagnóstico y solución de problemas de hardware y software.',
        details: [
            'Diagnóstico preciso de fallas de hardware (placas madre, fuentes, discos) y software (virus, errores de sistema, drivers).',
            'Reemplazo de componentes dañados: pantallas, teclados, baterías, memorias RAM, discos duros y SSD.',
            'Solución experta a problemas de lentitud, sobrecalentamiento, reinicios inesperados y pantallas azules.',
            'Reparación de equipos de todas las marcas y modelos, tanto de escritorio como portátiles.',
            'Uso de repuestos originales o de primera calidad, con garantía en todas nuestras reparaciones.'
        ]
    },
    {
        title: 'Instalación de Windows y Software',
        description: 'Instalación y configuración de sistemas operativos y programas.',
        details: [
            'Instalación desde cero de Windows 11, 10 o la versión que necesites, con licencia original.',
            'Configuración inicial del sistema, incluyendo drivers, actualizaciones y optimización para máximo rendimiento.',
            'Instalación de paquete de software esencial: Office (Word, Excel, etc.), antivirus, compresores y lectores de PDF.',
            'Instalación de programas específicos a pedido, para diseño, arquitectura, edición de video, etc.',
            'Back-up y restauración de tus archivos personales para que no pierdas ninguna información importante.'
        ]
    },
    {
        title: 'Actualización de Hardware',
        description: 'Mejora el rendimiento con nuevos componentes (SSD, RAM).',
        details: [
            'Reemplazo de discos rígidos mecánicos (HDD) por unidades de estado sólido (SSD) para una velocidad hasta 10 veces mayor.',
            'Ampliación de la memoria RAM para mejorar la multitarea y el rendimiento general del sistema.',
            'Cambio de procesador (CPU) o placa de video (GPU) para potenciar tu equipo para gaming o trabajo profesional.',
            'Asesoramiento personalizado para elegir los componentes más adecuados según tus necesidades y presupuesto.',
            'Instalación y configuración de los nuevos componentes, asegurando la compatibilidad y estabilidad del sistema.'
        ]
    },
    {
        title: 'Mantenimiento Preventivo',
        description: 'Limpieza y optimización para alargar la vida útil de tus equipos.',
        details: [
            'Limpieza física interna completa para eliminar polvo y pelusa que causan sobrecalentamiento.',
            'Cambio de pasta térmica del procesador y placa de video para mantener temperaturas óptimas de funcionamiento.',
            'Limpieza de software: eliminación de archivos basura, temporales y desinstalación de programas innecesarios.',
            'Optimización del arranque del sistema y de los servicios para un inicio más rápido.',
            'Análisis y eliminación de virus, malware y spyware para proteger tu información y privacidad.'
        ]
    },
    {
        title: 'Redes, WiFi y Routers',
        description: 'Configuración y optimización de tu red doméstica o de oficina.',
        details: [
            'Instalación y configuración de routers y repetidores para ampliar la cobertura WiFi en toda tu casa u oficina.',
            'Solución a problemas de conexión a internet, cortes intermitentes y baja velocidad.',
            'Configuración de redes cableadas (Ethernet) para una conexión más estable y rápida.',
            'Aseguramos tu red WiFi con contraseñas robustas y protocolos de seguridad modernos para evitar intrusos.',
            'Asesoramiento para elegir el proveedor de internet y el equipamiento de red más conveniente para vos.'
        ]
    },
    {
        title: 'Asistencia Técnica',
        description: 'Soporte remoto y presencial para hogares y empresas.',
        details: [
            'Soporte técnico remoto a través de herramientas seguras para solucionar problemas de software de forma inmediata.',
            'Visitas a domicilio u oficina para resolver problemas de hardware o redes que requieran asistencia presencial.',
            'Planes de abono mensual para empresas, con soporte prioritario y mantenimiento preventivo periódico.',
            'Capacitación a usuarios para el manejo de nuevo software o hardware.',
            'Atención personalizada y seguimiento de cada caso hasta su completa resolución.'
        ]
    },
];

type FormValues = z.infer<typeof formSchema>;

export default function EditServicesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
    const localAuth = localStorage.getItem('isAdminAuthenticated');
    if (sessionAuth === 'true' || localAuth === 'true') {
        setIsAuthenticated(true);
    } else {
        router.replace('/admin-login');
    }
  }, [router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      services: defaultServices,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  function onSubmit(values: FormValues) {
    toast({
      title: "Guardado (simulación)",
      description: "Los cambios no se guardarán. Para aplicar los cambios, pedímelo directamente.",
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Skeleton className="h-10 w-1/2" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-4 border-b pb-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <div className="flex items-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline flex items-center gap-3">
                    <Wrench className="h-8 w-8" />
                    Editar Página "Servicio Técnico"
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gestor de Servicios</CardTitle>
                    <CardDescription>
                        Añadí, editá o eliminá los servicios que se muestran en la página. Este es un editor de demostración.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-6">
                                {fields.map((serviceField, serviceIndex) => (
                                    <div key={serviceField.id} className="p-4 border rounded-lg relative space-y-4">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7"
                                            onClick={() => remove(serviceIndex)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>

                                        <h3 className="font-semibold text-lg">Servicio #{serviceIndex + 1}</h3>

                                        <FormField
                                            control={form.control}
                                            name={`services.${serviceIndex}.title`}
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Título del Servicio</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`services.${serviceIndex}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Descripción Corta</FormLabel>
                                                <FormControl>
                                                    <Textarea rows={2} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <ServiceDetailsArray control={form.control} serviceIndex={serviceIndex} />
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => append({ title: "", description: "", details: [""] })}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Servicio
                            </Button>

                            <Separator />

                            <div className="flex items-center gap-2 pt-4">
                                <Button type="submit">Guardar Cambios</Button>
                                <Button type="button" variant="outline" onClick={() => form.reset({ services: defaultServices })}>Deshacer Cambios</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}

function ServiceDetailsArray({ control, serviceIndex }: { control: Control<FormValues>, serviceIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.details`
  });

  return (
    <div className="space-y-4 pl-6 border-l-2 border-muted">
        <FormLabel>Puntos de Detalle del Servicio</FormLabel>
        {fields.map((detailField, detailIndex) => (
            <div key={detailField.id} className="flex items-center gap-2">
                 <FormField
                    control={control}
                    name={`services.${serviceIndex}.details.${detailIndex}`}
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                        <FormControl>
                            <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(detailIndex)}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        ))}
         <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append("")}
        >
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Detalle
        </Button>
    </div>
  )
}
