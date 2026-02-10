'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  mainTitle: z.string().min(5, { message: "El título es muy corto." }),
  mainDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  aboutImage: z.any().optional(),
  workProcessTitle: z.string().min(5, { message: "El título es muy corto." }),
  workProcessDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  diagnosisTitle: z.string().min(5, { message: "El título es muy corto." }),
  diagnosisDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  solutionsTitle: z.string().min(5, { message: "El título es muy corto." }),
  solutionsDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  transparencyTitle: z.string().min(5, { message: "El título es muy corto." }),
  transparencyDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  postSaleTitle: z.string().min(5, { message: "El título es muy corto." }),
  postSaleDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  evolutionTitle: z.string().min(5, { message: "El título es muy corto." }),
  evolutionDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  pillar1: z.string().min(3, { message: "El pilar es muy corto." }),
  pillar2: z.string().min(3, { message: "El pilar es muy corto." }),
  pillar3: z.string().min(3, { message: "El pilar es muy corto." }),
  pillar4: z.string().min(3, { message: "El pilar es muy corto." }),
});

export default function EditAboutPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>("/FOTOFRENTE.jpeg");

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
    defaultValues: {
        mainTitle: "Casi 50 Años de Confianza y Tecnología",
        mainDescription: "Darío Martínez Computación nace en San Francisco con un objetivo claro: brindar soluciones reales y confiables. Hemos acompañado la evolución tecnológica desde sus inicios, consolidándonos como un referente de seriedad y conocimiento técnico en la región.",
        aboutImage: undefined,
        workProcessTitle: "Nuestra Forma de Trabajar",
        workProcessDescription: "Cada cliente y cada equipo es único. Por eso, nuestro proceso se basa en la escucha, el análisis detallado y la búsqueda de la solución más eficiente y duradera. No aplicamos recetas, resolvemos problemas.",
        diagnosisTitle: "Diagnóstico Preciso",
        diagnosisDescription: "Nos tomamos el tiempo para entender el problema a fondo, realizando todas las pruebas necesarias para dar con la causa raíz de la falla.",
        solutionsTitle: "Soluciones a Medida",
        solutionsDescription: "Te explicamos las opciones disponibles y te recomendamos la mejor alternativa en función de tu necesidad y presupuesto, ya sea una reparación, actualización o un equipo nuevo.",
        transparencyTitle: "Transparencia Total",
        transparencyDescription: "Hablamos en un lenguaje claro, sin tecnicismos innecesarios. Siempre sabrás qué se va a hacer, por qué y cuál es el costo, sin sorpresas.",
        postSaleTitle: "Compromiso Post-Venta",
        postSaleDescription: "Nuestro trabajo no termina con la entrega. Ofrecemos garantía y estamos a tu disposición para resolver cualquier duda o inconveniente posterior.",
        evolutionTitle: "Nuestra Evolución",
        evolutionDescription: "Adaptándonos a los nuevos tiempos, sin perder la esencia.",
        pillar1: "Experiencia",
        pillar2: "Conocimiento",
        pillar3: "Atención Cercana",
        pillar4: "Confianza",
    },
  });

  const watchedImage = form.watch("aboutImage");

  useEffect(() => {
    if (watchedImage && watchedImage instanceof File) {
      const fileUrl = URL.createObjectURL(watchedImage);
      setImagePreview(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    }
  }, [watchedImage]);

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
                {Array.from({ length: 16 }).map((_, i) => (
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
                    <Users className="h-8 w-8" />
                    Editar Página "Sobre Nosotros"
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contenido de la Página</CardTitle>
                    <CardDescription>
                        Actualizá los textos que se muestran en la sección "Sobre Nosotros". Este es un editor de demostración y los cambios no se guardarán.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección Principal</h3>
                                <FormField control={form.control} name="mainTitle" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título Principal</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="mainDescription" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción Principal</FormLabel>
                                        <FormControl><Textarea rows={4} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField
                                  control={form.control}
                                  name="aboutImage"
                                  render={({ field: { onChange, value, ...rest } }) => (
                                    <FormItem>
                                      <FormLabel>Imagen Principal</FormLabel>
                                       <div className="flex items-start gap-6">
                                            <Image
                                                src={imagePreview}
                                                alt="Vista previa de la imagen"
                                                width={120}
                                                height={150}
                                                className="aspect-[4/5] rounded-lg object-cover border"
                                            />
                                            <div className="flex-1 space-y-2">
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            onChange(file);
                                                        }}
                                                        {...rest}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Seleccioná una nueva imagen para reemplazar la actual. No hay límite de tamaño.
                                                </FormDescription>
                                            </div>
                                       </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Forma de Trabajar</h3>
                                 <FormField control={form.control} name="workProcessTitle" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="workProcessDescription" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl><Textarea rows={3} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <FormField control={form.control} name="diagnosisTitle" render={({ field }) => ( <FormItem><FormLabel>Título Diagnóstico</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        <FormField control={form.control} name="diagnosisDescription" render={({ field }) => ( <FormItem><FormLabel>Descripción Diagnóstico</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    </div>
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <FormField control={form.control} name="solutionsTitle" render={({ field }) => ( <FormItem><FormLabel>Título Soluciones</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        <FormField control={form.control} name="solutionsDescription" render={({ field }) => ( <FormItem><FormLabel>Descripción Soluciones</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    </div>
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <FormField control={form.control} name="transparencyTitle" render={({ field }) => ( <FormItem><FormLabel>Título Transparencia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        <FormField control={form.control} name="transparencyDescription" render={({ field }) => ( <FormItem><FormLabel>Descripción Transparencia</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    </div>
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <FormField control={form.control} name="postSaleTitle" render={({ field }) => ( <FormItem><FormLabel>Título Post-Venta</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        <FormField control={form.control} name="postSaleDescription" render={({ field }) => ( <FormItem><FormLabel>Descripción Post-Venta</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    </div>
                                </div>
                            </div>
                            
                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Nuestra Evolución</h3>
                                <FormField control={form.control} name="evolutionTitle" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="evolutionDescription" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl><Textarea rows={2} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                            
                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Pilares</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField control={form.control} name="pillar1" render={({ field }) => ( <FormItem><FormLabel>Pilar 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="pillar2" render={({ field }) => ( <FormItem><FormLabel>Pilar 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="pillar3" render={({ field }) => ( <FormItem><FormLabel>Pilar 3</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="pillar4" render={({ field }) => ( <FormItem><FormLabel>Pilar 4</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                </div>
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
