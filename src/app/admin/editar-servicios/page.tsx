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
import { Wrench, PlusCircle, Trash2, Check, Undo2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase-client';

const serviceDetailSchema = z.string().min(10, { message: "El detalle es muy corto." });

const serviceSchema = z.object({
  title: z.string().min(5, { message: "El título es muy corto." }),
  description: z.string().min(10, { message: "La descripción es muy corta." }),
  details: z.array(serviceDetailSchema),
    imageUrl: z.string().optional(),
    imageFile: z.any().optional(),
});

const formSchema = z.object({
  services: z.array(serviceSchema),
});

const defaultServices = [
    {
        title: 'Reparación de PC y Notebooks',
        description: 'Diagnóstico y solución de problemas de hardware y software.',
        imageUrl: '',
        imageFile: undefined,
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
        imageUrl: '',
        imageFile: undefined,
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
        imageUrl: '',
        imageFile: undefined,
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
        imageUrl: '',
        imageFile: undefined,
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
        imageUrl: '',
        imageFile: undefined,
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
        imageUrl: '',
        imageFile: undefined,
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
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadServices = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('servicios')
                .select('*')
                .order('orden', { ascending: true });

            if (error) {
                toast({
                    title: 'Error al cargar',
                    description: error.message,
                    variant: 'destructive',
                });
                setIsLoading(false);
                return;
            }

            if (data && data.length > 0) {
                form.reset({
                    services: data.map((item: any) => ({
                        title: item.titulo || '',
                        description: item.descripcion || '',
                        details: Array.isArray(item.detalles) ? item.detalles : [],
                        imageUrl: item.imagen_url || '',
                        imageFile: undefined,
                    })),
                });
            }

            setIsLoading(false);
        };

        loadServices();
    }, [isAuthenticated, form, toast]);

    const slugify = (value: string) =>
        value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
            .trim();

    const uploadImage = async (file: File, serviceIndex: number) => {
        const maxFileSize = 15 * 1024 * 1024;
        if (file.size > maxFileSize) {
            throw new Error('La imagen supera 15MB. Comprimila e intentá nuevamente.');
        }

        const formData = new FormData();
        formData.append('serviceIndex', String(serviceIndex + 1));
        formData.append('file', file);

        const response = await fetch('/api/admin/servicios/upload', {
            method: 'POST',
            body: formData,
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload?.error || 'No se pudo subir la imagen del servicio.');
        }

        if (!payload?.publicUrl || typeof payload.publicUrl !== 'string') {
            throw new Error('El servidor no devolvió la URL pública de la imagen.');
        }

        return payload.publicUrl as string;
    };

    async function onSubmit(values: FormValues) {
        setIsSaving(true);
        try {
            const servicesWithImageUrls = await Promise.all(
                values.services.map(async (service, index) => {
                    if (service.imageFile instanceof File) {
                        const uploadedImageUrl = await uploadImage(service.imageFile, index);
                        return {
                            ...service,
                            imageUrl: uploadedImageUrl,
                        };
                    }

                    return service;
                })
            );

            const rows = servicesWithImageUrls.map((service, index) => ({
                titulo: service.title,
                descripcion: service.description,
                detalles: service.details,
                imagen_url: service.imageUrl || null,
                orden: index,
                slug: slugify(service.title || `servicio-${index + 1}`),
            }));

            const response = await fetch('/api/admin/servicios/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ services: rows }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload?.error || 'No se pudieron guardar los servicios.');
            }

            toast({
                title: 'Cambios guardados',
                description: 'Los servicios se actualizaron correctamente.',
            });
        } catch (err: any) {
            toast({
                title: 'Error al guardar',
                description: err?.message || 'Ocurrió un error inesperado.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (!isAuthenticated || isLoading) {
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
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-24">
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

                                        <FormField
                                            control={form.control}
                                            name={`services.${serviceIndex}.imageFile`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Imagen del Servicio</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            name={field.name}
                                                            ref={field.ref}
                                                            onBlur={field.onBlur}
                                                            onChange={(event) => {
                                                                const file = event.target.files?.[0];
                                                                field.onChange(file);
                                                                if (file) {
                                                                    const previewUrl = URL.createObjectURL(file);
                                                                    form.setValue(`services.${serviceIndex}.imageUrl`, previewUrl, { shouldDirty: true });
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch(`services.${serviceIndex}.imageUrl`) ? (
                                            <img
                                                src={form.watch(`services.${serviceIndex}.imageUrl`)}
                                                alt={`Preview servicio ${serviceIndex + 1}`}
                                                className="h-32 w-full rounded-md border object-cover"
                                            />
                                        ) : (
                                            <div className="h-32 w-full rounded-md border bg-muted/30" />
                                        )}

                                        <ServiceDetailsArray control={form.control} serviceIndex={serviceIndex} />
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => append({ title: "", description: "", details: [""], imageUrl: "", imageFile: undefined })}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Servicio
                            </Button>

                            <Separator />

                            {/* Floating Action Buttons */}
                            <div className="fixed bottom-6 right-6 z-50">
                                {/* Desktop buttons */}
                                <div className="hidden md:flex items-center gap-4">
                                    <Button type="button" variant="outline" size="lg" className="bg-background shadow-lg" onClick={() => form.reset({ services: defaultServices })} disabled={isSaving}>
                                        <Undo2 className="mr-2 h-5 w-5" />
                                        Deshacer Cambios
                                    </Button>
                                    <Button type="submit" size="lg" className="shadow-lg" disabled={isSaving}>
                                        <Check className="mr-2 h-5 w-5" />
                                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </div>
                                {/* Mobile buttons */}
                                <div className="md:hidden flex flex-col gap-3">
                                    <Button type="button" variant="outline" size="icon" className="h-14 w-14 rounded-full shadow-lg border-2 bg-background" onClick={() => form.reset({ services: defaultServices })} disabled={isSaving}>
                                        <Undo2 className="h-6 w-6" />
                                        <span className="sr-only">Deshacer Cambios</span>
                                    </Button>
                                    <Button type="submit" size="icon" className="h-14 w-14 rounded-full shadow-lg" disabled={isSaving}>
                                        <Check className="h-6 w-6" />
                                        <span className="sr-only">Guardar Cambios</span>
                                    </Button>
                                </div>
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
