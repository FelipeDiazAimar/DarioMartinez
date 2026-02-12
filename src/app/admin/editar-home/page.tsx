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
import { Home, Check, Undo2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';

const formSchema = z.object({
  carouselImage1: z.any().optional(),
  carouselImage2: z.any().optional(),
  carouselImage3: z.any().optional(),
  carouselMobileImage1: z.any().optional(),
  carouselMobileImage2: z.any().optional(),
  carouselMobileImage3: z.any().optional(),

  heroTitle: z.string().min(5, { message: "El título es muy corto." }),
  heroDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  heroSectionImage: z.any().optional(),

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
    carouselImage1: undefined,
    carouselImage2: undefined,
    carouselImage3: undefined,
    carouselMobileImage1: undefined,
    carouselMobileImage2: undefined,
    carouselMobileImage3: undefined,
    heroSectionImage: undefined,
};

type FormValues = z.infer<typeof formSchema>;

export default function EditHomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');
  const carouselImage1 = PlaceHolderImages.find(img => img.id === 'carousel-1');
  const carouselImage2 = PlaceHolderImages.find(img => img.id === 'carousel-2');
  const carouselImage3 = PlaceHolderImages.find(img => img.id === 'carousel-3');
  const fallbackImage = 'https://placehold.co/600x400?text=Sin+imagen';

  const [currentImages, setCurrentImages] = useState({
    hero: heroImage?.imageUrl || fallbackImage,
    carousel1: carouselImage1?.imageUrl || fallbackImage,
    carousel2: carouselImage2?.imageUrl || fallbackImage,
    carousel3: carouselImage3?.imageUrl || fallbackImage,
    carouselMobile1: carouselImage1?.imageUrl || fallbackImage,
    carouselMobile2: carouselImage2?.imageUrl || fallbackImage,
    carouselMobile3: carouselImage3?.imageUrl || fallbackImage,
  });
  
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
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadHomeContent = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        toast({
          title: 'Error al cargar',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (data) {
        form.reset({
          heroTitle: data.hero_title ?? defaultValues.heroTitle,
          heroDescription: data.hero_description ?? defaultValues.heroDescription,
          servicesTitle: data.services_title ?? defaultValues.servicesTitle,
          servicesDescription: data.services_description ?? defaultValues.servicesDescription,
          productsTitle: data.products_title ?? defaultValues.productsTitle,
          productsDescription: data.products_description ?? defaultValues.productsDescription,
          aboutTitle: data.about_title ?? defaultValues.aboutTitle,
          aboutDescription: data.about_description ?? defaultValues.aboutDescription,
          missionTitle: data.mission_title ?? defaultValues.missionTitle,
          missionDescription: data.mission_description ?? defaultValues.missionDescription,
          visionTitle: data.vision_title ?? defaultValues.visionTitle,
          visionDescription: data.vision_description ?? defaultValues.visionDescription,
          valuesTitle: data.values_title ?? defaultValues.valuesTitle,
          valuesDescription: data.values_description ?? defaultValues.valuesDescription,
          scheduleTitle: data.schedule_title ?? defaultValues.scheduleTitle,
          scheduleMonThu: data.schedule_mon_thu ?? defaultValues.scheduleMonThu,
          scheduleFri: data.schedule_fri ?? defaultValues.scheduleFri,
          scheduleSat: data.schedule_sat ?? defaultValues.scheduleSat,
          contactTitle: data.contact_title ?? defaultValues.contactTitle,
          contactDescription: data.contact_description ?? defaultValues.contactDescription,
          carouselImage1: undefined,
          carouselImage2: undefined,
          carouselImage3: undefined,
          carouselMobileImage1: undefined,
          carouselMobileImage2: undefined,
          carouselMobileImage3: undefined,
          heroSectionImage: undefined,
        });

        setCurrentImages({
          hero: data.hero_image_url || heroImage?.imageUrl || fallbackImage,
          carousel1: data.carousel_image1_url || carouselImage1?.imageUrl || fallbackImage,
          carousel2: data.carousel_image2_url || carouselImage2?.imageUrl || fallbackImage,
          carousel3: data.carousel_image3_url || carouselImage3?.imageUrl || fallbackImage,
          carouselMobile1: data.carousel_mobile_image1_url || data.carousel_image1_url || carouselImage1?.imageUrl || fallbackImage,
          carouselMobile2: data.carousel_mobile_image2_url || data.carousel_image2_url || carouselImage2?.imageUrl || fallbackImage,
          carouselMobile3: data.carousel_mobile_image3_url || data.carousel_image3_url || carouselImage3?.imageUrl || fallbackImage,
        });
      }

      setIsLoading(false);
    };

    loadHomeContent();
  }, [isAuthenticated, form, toast, heroImage, carouselImage1, carouselImage2, carouselImage3]);

  const uploadImage = async (file: File, name: string) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `home/${name}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    await supabase.from('imagenes').insert({
      bucket: 'images',
      path: filePath,
      public_url: publicUrl,
      seccion: 'home',
      etiqueta: name,
    });

    return publicUrl;
  };

  async function onSubmit(values: FormValues) {
    setIsSaving(true);
    try {
      const heroUrl = values.heroSectionImage instanceof File
        ? await uploadImage(values.heroSectionImage, 'hero')
        : currentImages.hero;

      const carousel1Url = values.carouselImage1 instanceof File
        ? await uploadImage(values.carouselImage1, 'carousel-1')
        : currentImages.carousel1;

      const carousel2Url = values.carouselImage2 instanceof File
        ? await uploadImage(values.carouselImage2, 'carousel-2')
        : currentImages.carousel2;

      const carousel3Url = values.carouselImage3 instanceof File
        ? await uploadImage(values.carouselImage3, 'carousel-3')
        : currentImages.carousel3;

      const carouselMobile1Url = values.carouselMobileImage1 instanceof File
        ? await uploadImage(values.carouselMobileImage1, 'carousel-mobile-1')
        : currentImages.carouselMobile1;

      const carouselMobile2Url = values.carouselMobileImage2 instanceof File
        ? await uploadImage(values.carouselMobileImage2, 'carousel-mobile-2')
        : currentImages.carouselMobile2;

      const carouselMobile3Url = values.carouselMobileImage3 instanceof File
        ? await uploadImage(values.carouselMobileImage3, 'carousel-mobile-3')
        : currentImages.carouselMobile3;

      const { error } = await supabase.from('home_content').upsert({
        id: 1,
        hero_title: values.heroTitle,
        hero_description: values.heroDescription,
        hero_image_url: heroUrl,
        services_title: values.servicesTitle,
        services_description: values.servicesDescription,
        products_title: values.productsTitle,
        products_description: values.productsDescription,
        about_title: values.aboutTitle,
        about_description: values.aboutDescription,
        mission_title: values.missionTitle,
        mission_description: values.missionDescription,
        vision_title: values.visionTitle,
        vision_description: values.visionDescription,
        values_title: values.valuesTitle,
        values_description: values.valuesDescription,
        schedule_title: values.scheduleTitle,
        schedule_mon_thu: values.scheduleMonThu,
        schedule_fri: values.scheduleFri,
        schedule_sat: values.scheduleSat,
        contact_title: values.contactTitle,
        contact_description: values.contactDescription,
        carousel_image1_url: carousel1Url,
        carousel_image2_url: carousel2Url,
        carousel_image3_url: carousel3Url,
        carousel_mobile_image1_url: carouselMobile1Url,
        carousel_mobile_image2_url: carouselMobile2Url,
        carousel_mobile_image3_url: carouselMobile3Url,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message);
      }

      setCurrentImages({
        hero: heroUrl,
        carousel1: carousel1Url,
        carousel2: carousel2Url,
        carousel3: carousel3Url,
        carouselMobile1: carouselMobile1Url,
        carouselMobile2: carouselMobile2Url,
        carouselMobile3: carouselMobile3Url,
      });

      toast({
        title: 'Cambios guardados',
        description: 'La página Home se actualizó correctamente.',
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
                        Actualizá los textos y las imágenes de las distintas secciones de la página de inicio.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-24">
                            
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Carrusel de Imágenes</h3>
                                <ImageUploadField form={form} name="carouselImage1" label="Imagen 1 del Carrusel" currentImageUrl={currentImages.carousel1} imageAlt="Imagen 1 del Carrusel" aspectRatio="aspect-[9/16] sm:aspect-video" />
                                <ImageUploadField form={form} name="carouselImage2" label="Imagen 2 del Carrusel" currentImageUrl={currentImages.carousel2} imageAlt="Imagen 2 del Carrusel" aspectRatio="aspect-[9/16] sm:aspect-video" />
                                <ImageUploadField form={form} name="carouselImage3" label="Imagen 3 del Carrusel" currentImageUrl={currentImages.carousel3} imageAlt="Imagen 3 del Carrusel" aspectRatio="aspect-[9/16] sm:aspect-video" />
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-xl font-semibold">Carrusel de Imágenes (Vista Móvil)</h3>
                              <ImageUploadField form={form} name="carouselMobileImage1" label="Imagen 1 del Carrusel Móvil" currentImageUrl={currentImages.carouselMobile1} imageAlt="Imagen 1 del Carrusel Móvil" aspectRatio="aspect-[9/16]" />
                              <ImageUploadField form={form} name="carouselMobileImage2" label="Imagen 2 del Carrusel Móvil" currentImageUrl={currentImages.carouselMobile2} imageAlt="Imagen 2 del Carrusel Móvil" aspectRatio="aspect-[9/16]" />
                              <ImageUploadField form={form} name="carouselMobileImage3" label="Imagen 3 del Carrusel Móvil" currentImageUrl={currentImages.carouselMobile3} imageAlt="Imagen 3 del Carrusel Móvil" aspectRatio="aspect-[9/16]" />
                            </div>

                            <Separator />
                            
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección Principal (Inicio)</h3>
                                <FormField control={form.control} name="heroTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="heroDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <ImageUploadField form={form} name="heroSectionImage" label="Imagen de la Sección" currentImageUrl={currentImages.hero} imageAlt="Imagen principal" />
                            </div>

                            <Separator />
                            
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

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "Nuestros Horarios"</h3>
                                <FormField control={form.control} name="scheduleTitle" render={({ field }) => ( <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="scheduleMonThu" render={({ field }) => ( <FormItem><FormLabel>Horario Lunes a Jueves</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="scheduleFri" render={({ field }) => ( <FormItem><FormLabel>Horario Viernes</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="scheduleSat" render={({ field }) => ( <FormItem><FormLabel>Horario Sábados</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "Contacto"</h3>
                                <FormField control={form.control} name="contactTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="contactDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>

                            {/* Floating Action Buttons */}
                            <div className="fixed bottom-6 right-6 z-50">
                              {/* Desktop buttons */}
                              <div className="hidden md:flex items-center gap-4">
                                <Button type="button" variant="outline" size="lg" className="bg-background shadow-lg" onClick={() => form.reset()} disabled={isSaving}>
                                  <Undo2 className="mr-2 h-5 w-5" />
                                  Deshacer Cambios
                                </Button>
                                <Button type="submit" size="lg" className="shadow-lg" disabled={isSaving}>
                                  <Check className="mr-2 h-5 w-5" />
                                  Guardar Cambios
                                </Button>
                              </div>
                              {/* Mobile buttons */}
                              <div className="md:hidden flex flex-col gap-3">
                                <Button type="button" variant="outline" size="icon" className="h-14 w-14 rounded-full shadow-lg border-2 bg-background" onClick={() => form.reset()} disabled={isSaving}>
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

function ImageUploadField({
  form,
  name,
  label,
  currentImageUrl,
  imageAlt,
  aspectRatio = "aspect-video",
}: {
  form: any;
  name: string;
  label: string;
  currentImageUrl: string;
  imageAlt: string;
  aspectRatio?: string;
}) {
  const [preview, setPreview] = useState(currentImageUrl);
  const watchedFile = form.watch(name);

  useEffect(() => {
    if (watchedFile && watchedFile instanceof File) {
      const fileUrl = URL.createObjectURL(watchedFile);
      setPreview(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    } else if (!watchedFile) {
        setPreview(currentImageUrl || 'https://placehold.co/600x400?text=Sin+imagen');
    }
  }, [watchedFile, currentImageUrl]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange, value, ...rest } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex items-start gap-6">
            <Image
              src={preview}
              alt={imageAlt}
              width={160}
              height={90}
              className={cn("rounded-lg object-cover border", aspectRatio)}
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
                Seleccioná una nueva imagen. Sin límite de tamaño.
              </FormDescription>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
