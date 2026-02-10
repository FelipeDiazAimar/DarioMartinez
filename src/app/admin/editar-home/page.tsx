'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  heroTitle: z.string().min(5, { message: "El título es muy corto." }),
  heroDescription: z.string().min(10, { message: "La descripción es muy corta." }),

  servicesTitle: z.string().min(5, { message: "El título es muy corto." }),
  servicesDescription: z.string().min(10, { message: "La descripción es muy corta." }),

  productsTitle: z.string().min(5, { message: "El título es muy corto." }),
  productsDescription: z.string().min(10, { message: "La descripción es muy corta." }),

  aboutTitle: z.string().min(5, { message: "El título es muy corto." }),
  aboutDescription: z.string().min(10, { message: "La descripción es muy corta." }),

  missionTitle: z.string().min(5, { message: "El título es muy corto." }),
  missionDescription: z.string().min(10, { message: "La descripción es muy corta." }),

  visionTitle: z.string().min(5, { message: "El título es muy corto." }),
  visionDescription: z.string().min(10, { message: "La descripción es muy corta." }),

  valuesTitle: z.string().min(5, { message: "El título es muy corto." }),
  valuesDescription: z.string().min(10, { message: "El texto de valores es muy corto." }),
  
  scheduleTitle: z.string().min(5, { message: "El título es muy corto." }),
  scheduleMonThu: z.string().min(5, { message: "El horario es muy corto." }),
  scheduleFri: z.string().min(5, { message: "El horario es muy corto." }),
  scheduleSat: z.string().min(5, { message: "El horario es muy corto." }),

  contactTitle: z.string().min(5, { message: "El título es muy corto." }),
  contactDescription: z.string().min(10, { message: "La descripción es muy corta." }),
});

const defaultValues = {
    heroTitle: "Tu Aliado en Soluciones Tecnológicas",
    heroDescription: "Ofrecemos servicio técnico y una amplia gama de productos tecnológicos para satisfacer todas tus necesidades.",
    servicesTitle: "Servicio Técnico",
    servicesDescription: "Ofrecemos una amplia gama de servicios para mantener tus equipos en perfecto estado y optimizar tu entorno tecnológico.",
    productsTitle: "Nuestros Productos",
    productsDescription: "Equipamiento tecnológico para potenciar tu hogar o empresa.",
    aboutTitle: "Sobre Nosotros",
    aboutDescription: "Somos una empresa con más de 20 años de experiencia en el sector tecnológico, brindando soluciones integrales a nuestros clientes. Nuestro compromiso es ofrecer un servicio de calidad, con atención personalizada y los mejores productos del mercado.",
    missionTitle: "Misión",
    missionDescription: "Facilitar el acceso a la tecnología, ofreciendo productos y servicios de vanguardia que impulsen el desarrollo de nuestros clientes.",
    visionTitle: "Visión",
    visionDescription: "Ser la empresa líder en soluciones tecnológicas en la región, reconocida por nuestra innovación, confiabilidad y compromiso con el cliente.",
    valuesTitle: "Valores",
    valuesDescription: "Confianza, Experiencia, Innovación y Atención Personalizada.",
    scheduleTitle: "Nuestros Horarios",
    scheduleMonThu: "Lunes a Jueves: 7:30 a 12:30 y 15:30 a 19:30 hs.",
    scheduleFri: "Viernes: 8:00 a 12:00 y de 15:30 a 19:30 hs.",
    scheduleSat: "Sábados: Cerrado",
    contactTitle: "Contactanos sin compromiso",
    contactDescription: "¿Tenés alguna duda o necesitás un presupuesto? Completá el formulario o envianos un WhatsApp.",
};

export default function EditHomePage() {
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Guardado (simulación)",
      description: "Los cambios no se guardarán. Para aplicar los cambios, pedímelo directamente.",
    });
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <Skeleton className="h-10 w-1/2" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <Skeleton className="h-10 w-full" />
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
                    <Home className="h-8 w-8" />
                    Editar Página Principal (Home)
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contenido de la Página Principal</CardTitle>
                    <CardDescription>
                        Actualizá los textos de las distintas secciones de la página de inicio. Este es un editor de demostración.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            
                            {/* Hero Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección Principal (Inicio)</h3>
                                <FormField control={form.control} name="heroTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="heroDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>

                            <Separator />
                            
                            {/* Services Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "Servicio Técnico"</h3>
                                <FormField control={form.control} name="servicesTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="servicesDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>

                            <Separator />

                            {/* Products Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "Nuestros Productos"</h3>
                                <FormField control={form.control} name="productsTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="productsDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>

                            <Separator />

                            {/* About Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "Sobre Nosotros"</h3>
                                <FormField control={form.control} name="aboutTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="aboutDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <FormField control={form.control} name="missionTitle" render={({ field }) => ( <FormItem><FormLabel>Título Misión</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        <FormField control={form.control} name="missionDescription" render={({ field }) => ( <FormItem><FormLabel>Descripción Misión</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    </div>
                                    <div className="space-y-2">
                                        <FormField control={form.control} name="visionTitle" render={({ field }) => ( <FormItem><FormLabel>Título Visión</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        <FormField control={form.control} name="visionDescription" render={({ field }) => ( <FormItem><FormLabel>Descripción Visión</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    </div>
                                    <div className="space-y-2">
                                        <FormField control={form.control} name="valuesTitle" render={({ field }) => ( <FormItem><FormLabel>Título Valores</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        <FormField control={form.control} name="valuesDescription" render={({ field }) => ( <FormItem><FormLabel>Descripción Valores</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    </div>
                                </div>
                            </div>
                            
                            <Separator />

                            {/* Schedule Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "Nuestros Horarios"</h3>
                                <FormField control={form.control} name="scheduleTitle" render={({ field }) => ( <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="scheduleMonThu" render={({ field }) => ( <FormItem><FormLabel>Horario Lunes a Jueves</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="scheduleFri" render={({ field }) => ( <FormItem><FormLabel>Horario Viernes</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="scheduleSat" render={({ field }) => ( <FormItem><FormLabel>Horario Sábados</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            </div>

                            <Separator />

                            {/* Contact Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "Contacto"</h3>
                                <FormField control={form.control} name="contactTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="contactDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>

                            <div className="flex items-center gap-2 pt-4">
                                <Button type="submit">Guardar Cambios</Button>
                                <Button type="button" variant="outline" onClick={() => form.reset()}>Deshacer Cambios</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
