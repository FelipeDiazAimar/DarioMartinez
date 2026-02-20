'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Home, Check, Undo2, Pencil, PlusCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';

type CarouselEditorItem = {
  id: string;
  url: string;
  file?: File;
};

const createCarouselEditorItem = (url: string): CarouselEditorItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  url,
});

const normalizeCarouselUrls = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
};

const moveCarouselItem = (items: CarouselEditorItem[], index: number, direction: 'up' | 'down') => {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const nextItems = [...items];
  const [moved] = nextItems.splice(index, 1);
  nextItems.splice(targetIndex, 0, moved);
  return nextItems;
};

const defaultClients = [
  { name: 'Bind', logoUrl: '/bind.png' },
  { name: 'Fiserv', logoUrl: '/fiserv.png' },
  { name: 'Mercado Pago', logoUrl: '/mercadopago.png' },
  { name: 'Payway', logoUrl: '/payway.png' },
  { name: 'PVS', logoUrl: '/pvs.png' },
  { name: 'Clover', logoUrl: '/clover.png' },
  { name: 'Posberry', logoUrl: '/POSBERRY.png' },
  { name: 'Posberry 2', logoUrl: '/POSBERRY2.png' },
];

const clientSchema = z.object({
  name: z.string().min(1, { message: 'El nombre del cliente es obligatorio.' }),
  logoUrl: z.string().min(1, { message: 'La URL del logo es obligatoria.' }),
});

const normalizeClients = (value: unknown) => {
  const raw = Array.isArray(value) ? value : [];
  const source = raw.length > 0 ? raw : defaultClients;

  return source.map((item: any, index: number) => ({
    name: typeof item?.name === 'string' && item.name.trim().length > 0
      ? item.name.trim()
      : defaultClients[index]?.name ?? '',
    logoUrl: typeof item?.logoUrl === 'string' && item.logoUrl.trim().length > 0
      ? item.logoUrl.trim()
      : defaultClients[index]?.logoUrl ?? '',
  }));
};

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

  controladoresTitle: z.string().min(5, { message: "El título es muy corto." }),
  controladoresDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  controladoresFeature1: z.string().min(5, { message: "El punto es muy corto." }),
  controladoresFeature2: z.string().min(5, { message: "El punto es muy corto." }),
  controladoresFeature3: z.string().min(5, { message: "El punto es muy corto." }),
  controladoresButtonText: z.string().min(2, { message: "El texto del botón es muy corto." }),
  controladoresButtonLink: z.string().min(1, { message: "El enlace es obligatorio." }),
  controladoresSectionImage: z.any().optional(),

  coverageTitle: z.string().min(5, { message: "El título es muy corto." }),
  coverageDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  coverageLocationsText: z.string().min(5, { message: "Agregá al menos una localidad." }),
  coverageMapEmbedUrl: z.string().min(10, { message: "El enlace del mapa es muy corto." }),
  coverageOverlayText: z.string().min(5, { message: "El texto es muy corto." }),
  coverageOverlayButtonText: z.string().min(2, { message: "El texto del botón es muy corto." }),
  coverageFooterText: z.string().min(5, { message: "El texto es muy corto." }),
  coverageFooterLinkText: z.string().min(2, { message: "El texto del enlace es muy corto." }),
  coverageFooterLinkUrl: z.string().min(1, { message: "El enlace es obligatorio." }),

  clientsTitle: z.string().min(5, { message: "El título es muy corto." }),
  clientsDescription: z.string().min(10, { message: "La descripción es muy corta." }),
  clients: z.array(clientSchema).min(1, { message: 'Debe haber al menos un cliente.' }),

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
    controladoresTitle: "Controladores Fiscales",
    controladoresDescription: "Equipos homologados por AFIP para garantizar el cumplimiento fiscal y optimizar la gestión de tu negocio. Tecnología avanzada para reportes automáticos y control preciso.",
    controladoresFeature1: "Cumplimiento total con normativas AFIP",
    controladoresFeature2: "Procesamiento rápido de transacciones",
    controladoresFeature3: "Reportes automáticos y detallados",
    controladoresButtonText: "Ver Más",
    controladoresButtonLink: "/controladores-fiscales",
    controladoresSectionImage: undefined,
    coverageTitle: "Lugares donde trabajamos",
    coverageDescription: "Conocé las zonas y localidades a las que llegamos con instalación, soporte técnico y soluciones comerciales.",
    coverageLocationsText: "Alicia\nAltos de Chipión\nArroyito\nBalnearia\nBrinkmann\nClucellas\nColonia San Bartolomé\nDevoto\nEl Tío\nFreyre\nJosefina\nLa Francia\nLa Paquita\nLa Para\nLas Varillas\nMiramar de Ansenuza\nMorteros\nPorteña\nQuebracho Herrado\nSuardi\nTránsito\nSastre\nSaturnino M. Laspiur",
    coverageMapEmbedUrl: "https://www.google.com/maps/d/u/0/embed?mid=1CqBXj8VZZZaSNDT8zIsZWvNGqVY0PLg&ehbc=2E312F",
    coverageOverlayText: "Averigua las localidades donde trabajamos y conoce si llegamos hasta tu casa u oficina.",
    coverageOverlayButtonText: "Ver mapa",
    coverageFooterText: "¿No encuentras tu localidad en el mapa? Consultanos para verificar si podemos llegar hasta tu zona y ofrecerte nuestros servicios.",
    coverageFooterLinkText: "Contactanos",
    coverageFooterLinkUrl: "/contacto",
    clientsTitle: "Nuestros clientes",
    clientsDescription: "Empresas y comercios que confían en nuestras soluciones tecnológicas.",
    clients: defaultClients,
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
  const [expandedClientIndex, setExpandedClientIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');
  const carouselImage1 = PlaceHolderImages.find(img => img.id === 'carousel-1');
  const carouselImage2 = PlaceHolderImages.find(img => img.id === 'carousel-2');
  const carouselImage3 = PlaceHolderImages.find(img => img.id === 'carousel-3');
  const fallbackImage = 'https://placehold.co/600x400?text=Sin+imagen';

  const [currentImages, setCurrentImages] = useState({
    hero: heroImage?.imageUrl || fallbackImage,
    controladores: '/POSBERRY2.png',
  });

  const [carouselDesktopItems, setCarouselDesktopItems] = useState<CarouselEditorItem[]>([
    createCarouselEditorItem(carouselImage1?.imageUrl || fallbackImage),
    createCarouselEditorItem(carouselImage2?.imageUrl || fallbackImage),
    createCarouselEditorItem(carouselImage3?.imageUrl || fallbackImage),
  ]);

  const [carouselMobileItems, setCarouselMobileItems] = useState<CarouselEditorItem[]>([
    createCarouselEditorItem(carouselImage1?.imageUrl || fallbackImage),
    createCarouselEditorItem(carouselImage2?.imageUrl || fallbackImage),
    createCarouselEditorItem(carouselImage3?.imageUrl || fallbackImage),
  ]);
  
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

  const {
    fields: clientFields,
    append: appendClient,
    remove: removeClient,
  } = useFieldArray({
    control: form.control,
    name: 'clients',
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
        const desktopFromArray = normalizeCarouselUrls((data as any).carousel_images);
        const mobileFromArray = normalizeCarouselUrls((data as any).carousel_mobile_images);

        const desktopFallback = [
          data.carousel_image1_url,
          data.carousel_image2_url,
          data.carousel_image3_url,
        ].filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

        const mobileFallback = [
          data.carousel_mobile_image1_url,
          data.carousel_mobile_image2_url,
          data.carousel_mobile_image3_url,
        ].filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

        const desktopUrls = desktopFromArray.length > 0
          ? desktopFromArray
          : desktopFallback.length > 0
            ? desktopFallback
            : [carouselImage1?.imageUrl || fallbackImage];

        const mobileUrls = mobileFromArray.length > 0
          ? mobileFromArray
          : mobileFallback.length > 0
            ? mobileFallback
            : desktopUrls;

        form.reset({
          heroTitle: data.hero_title ?? defaultValues.heroTitle,
          heroDescription: data.hero_description ?? defaultValues.heroDescription,
          servicesTitle: data.services_title ?? defaultValues.servicesTitle,
          servicesDescription: data.services_description ?? defaultValues.servicesDescription,
          productsTitle: data.products_title ?? defaultValues.productsTitle,
          productsDescription: data.products_description ?? defaultValues.productsDescription,
          controladoresTitle: data.controladores_title ?? defaultValues.controladoresTitle,
          controladoresDescription: data.controladores_description ?? defaultValues.controladoresDescription,
          controladoresFeature1: data.controladores_feature_1 ?? defaultValues.controladoresFeature1,
          controladoresFeature2: data.controladores_feature_2 ?? defaultValues.controladoresFeature2,
          controladoresFeature3: data.controladores_feature_3 ?? defaultValues.controladoresFeature3,
          controladoresButtonText: data.controladores_button_text ?? defaultValues.controladoresButtonText,
          controladoresButtonLink: data.controladores_button_link ?? defaultValues.controladoresButtonLink,
          controladoresSectionImage: undefined,
          coverageTitle: data.coverage_title ?? defaultValues.coverageTitle,
          coverageDescription: data.coverage_description ?? defaultValues.coverageDescription,
          coverageLocationsText: (data.coverage_locations_text ?? defaultValues.coverageLocationsText).replace(/\\n/g, '\n'),
          coverageMapEmbedUrl: data.coverage_map_embed_url ?? defaultValues.coverageMapEmbedUrl,
          coverageOverlayText: data.coverage_overlay_text ?? defaultValues.coverageOverlayText,
          coverageOverlayButtonText: data.coverage_overlay_button_text ?? defaultValues.coverageOverlayButtonText,
          coverageFooterText: data.coverage_footer_text ?? defaultValues.coverageFooterText,
          coverageFooterLinkText: data.coverage_footer_link_text ?? defaultValues.coverageFooterLinkText,
          coverageFooterLinkUrl: data.coverage_footer_link_url ?? defaultValues.coverageFooterLinkUrl,
          clientsTitle: data.clients_title ?? defaultValues.clientsTitle,
          clientsDescription: data.clients_description ?? defaultValues.clientsDescription,
          clients: normalizeClients(data.clients),
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
          controladores: data.controladores_image_url || '/POSBERRY2.png',
        });

        setCarouselDesktopItems(desktopUrls.map((url) => createCarouselEditorItem(url)));
        setCarouselMobileItems(mobileUrls.map((url) => createCarouselEditorItem(url)));
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
      if (carouselDesktopItems.length < 1 || carouselMobileItems.length < 1) {
        throw new Error('Debe haber al menos 1 imagen en cada carrusel (desktop y móvil).');
      }

      const heroUrl = values.heroSectionImage instanceof File
        ? await uploadImage(values.heroSectionImage, 'hero')
        : currentImages.hero;

      const desktopCarouselUrls = await Promise.all(
        carouselDesktopItems.map(async (item, index) => (
          item.file instanceof File
            ? uploadImage(item.file, `carousel-${index + 1}`)
            : item.url
        ))
      );

      const mobileCarouselUrls = await Promise.all(
        carouselMobileItems.map(async (item, index) => (
          item.file instanceof File
            ? uploadImage(item.file, `carousel-mobile-${index + 1}`)
            : item.url
        ))
      );

      const controladoresUrl = values.controladoresSectionImage instanceof File
        ? await uploadImage(values.controladoresSectionImage, 'controladores-home')
        : currentImages.controladores;

      const { error } = await supabase.from('home_content').upsert({
        id: 1,
        hero_title: values.heroTitle,
        hero_description: values.heroDescription,
        hero_image_url: heroUrl,
        services_title: values.servicesTitle,
        services_description: values.servicesDescription,
        products_title: values.productsTitle,
        products_description: values.productsDescription,
        controladores_title: values.controladoresTitle,
        controladores_description: values.controladoresDescription,
        controladores_feature_1: values.controladoresFeature1,
        controladores_feature_2: values.controladoresFeature2,
        controladores_feature_3: values.controladoresFeature3,
        controladores_button_text: values.controladoresButtonText,
        controladores_button_link: values.controladoresButtonLink,
        controladores_image_url: controladoresUrl,
        coverage_title: values.coverageTitle,
        coverage_description: values.coverageDescription,
        coverage_locations_text: values.coverageLocationsText.replace(/\r\n/g, '\n'),
        coverage_map_embed_url: values.coverageMapEmbedUrl,
        coverage_overlay_text: values.coverageOverlayText,
        coverage_overlay_button_text: values.coverageOverlayButtonText,
        coverage_footer_text: values.coverageFooterText,
        coverage_footer_link_text: values.coverageFooterLinkText,
        coverage_footer_link_url: values.coverageFooterLinkUrl,
        clients_title: values.clientsTitle,
        clients_description: values.clientsDescription,
        clients: values.clients,
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
        carousel_images: desktopCarouselUrls,
        carousel_mobile_images: mobileCarouselUrls,
        carousel_image1_url: desktopCarouselUrls[0] ?? null,
        carousel_image2_url: desktopCarouselUrls[1] ?? null,
        carousel_image3_url: desktopCarouselUrls[2] ?? null,
        carousel_mobile_image1_url: mobileCarouselUrls[0] ?? null,
        carousel_mobile_image2_url: mobileCarouselUrls[1] ?? null,
        carousel_mobile_image3_url: mobileCarouselUrls[2] ?? null,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message);
      }

      setCurrentImages({
        hero: heroUrl,
        controladores: controladoresUrl,
      });

      setCarouselDesktopItems(desktopCarouselUrls.map((url) => createCarouselEditorItem(url)));
      setCarouselMobileItems(mobileCarouselUrls.map((url) => createCarouselEditorItem(url)));

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
                                {carouselDesktopItems.map((item, index) => (
                                  <CarouselImageItemEditor
                                    key={item.id}
                                    label={`Imagen ${index + 1} del Carrusel`}
                                    imageAlt={`Imagen ${index + 1} del Carrusel`}
                                    item={item}
                                    aspectRatio="aspect-[9/16] sm:aspect-video"
                                    canMoveUp={index > 0}
                                    canMoveDown={index < carouselDesktopItems.length - 1}
                                    onFileChange={(file) => {
                                      setCarouselDesktopItems((prev) => prev.map((current) => (
                                        current.id === item.id
                                          ? { ...current, file }
                                          : current
                                      )));
                                    }}
                                    onMoveUp={() => {
                                      setCarouselDesktopItems((prev) => moveCarouselItem(prev, index, 'up'));
                                    }}
                                    onMoveDown={() => {
                                      setCarouselDesktopItems((prev) => moveCarouselItem(prev, index, 'down'));
                                    }}
                                    onRemove={() => {
                                      if (carouselDesktopItems.length <= 1) {
                                        toast({
                                          title: 'No se puede eliminar',
                                          description: 'Debe quedar al menos 1 imagen en el carrusel.',
                                          variant: 'destructive',
                                        });
                                        return;
                                      }
                                      setCarouselDesktopItems((prev) => prev.filter((current) => current.id !== item.id));
                                    }}
                                  />
                                ))}

                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setCarouselDesktopItems((prev) => [...prev, createCarouselEditorItem(fallbackImage)])}
                                >
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Agregar imagen al carrusel
                                </Button>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-xl font-semibold">Carrusel de Imágenes (Vista Móvil)</h3>
                              {carouselMobileItems.map((item, index) => (
                                <CarouselImageItemEditor
                                  key={item.id}
                                  label={`Imagen ${index + 1} del Carrusel Móvil`}
                                  imageAlt={`Imagen ${index + 1} del Carrusel Móvil`}
                                  item={item}
                                  aspectRatio="aspect-[9/16]"
                                  canMoveUp={index > 0}
                                  canMoveDown={index < carouselMobileItems.length - 1}
                                  onFileChange={(file) => {
                                    setCarouselMobileItems((prev) => prev.map((current) => (
                                      current.id === item.id
                                        ? { ...current, file }
                                        : current
                                    )));
                                  }}
                                  onMoveUp={() => {
                                    setCarouselMobileItems((prev) => moveCarouselItem(prev, index, 'up'));
                                  }}
                                  onMoveDown={() => {
                                    setCarouselMobileItems((prev) => moveCarouselItem(prev, index, 'down'));
                                  }}
                                  onRemove={() => {
                                    if (carouselMobileItems.length <= 1) {
                                      toast({
                                        title: 'No se puede eliminar',
                                        description: 'Debe quedar al menos 1 imagen en el carrusel móvil.',
                                        variant: 'destructive',
                                      });
                                      return;
                                    }
                                    setCarouselMobileItems((prev) => prev.filter((current) => current.id !== item.id));
                                  }}
                                />
                              ))}

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCarouselMobileItems((prev) => [...prev, createCarouselEditorItem(fallbackImage)])}
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar imagen al carrusel móvil
                              </Button>
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
                              <h3 className="text-xl font-semibold">Sección "Controladores Fiscales"</h3>
                              <FormField control={form.control} name="controladoresTitle" render={({ field }) => (
                                <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="controladoresDescription" render={({ field }) => (
                                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="controladoresFeature1" render={({ field }) => (
                                <FormItem><FormLabel>Punto 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="controladoresFeature2" render={({ field }) => (
                                <FormItem><FormLabel>Punto 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="controladoresFeature3" render={({ field }) => (
                                <FormItem><FormLabel>Punto 3</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField control={form.control} name="controladoresButtonText" render={({ field }) => (
                                  <FormItem><FormLabel>Texto del botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="controladoresButtonLink" render={({ field }) => (
                                  <FormItem><FormLabel>Enlace del botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                              </div>
                              <ImageUploadField form={form} name="controladoresSectionImage" label="Imagen de la Sección" currentImageUrl={currentImages.controladores} imageAlt="Controladores Fiscales" />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <h3 className="text-xl font-semibold">Sección "Lugares donde trabajamos"</h3>
                              <FormField control={form.control} name="coverageTitle" render={({ field }) => (
                                <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="coverageDescription" render={({ field }) => (
                                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="coverageLocationsText" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Localidades (una por línea)</FormLabel>
                                  <FormControl><Textarea rows={8} {...field} /></FormControl>
                                  <FormDescription>Estas localidades se usan en la tira animada de la sección.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}/>
                              <FormField control={form.control} name="coverageMapEmbedUrl" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Enlace embebido del mapa</FormLabel>
                                  <FormControl><Input {...field} /></FormControl>
                                  <FormDescription>Pegá la URL del `iframe` de Google Maps.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}/>
                              <FormField control={form.control} name="coverageOverlayText" render={({ field }) => (
                                <FormItem><FormLabel>Texto sobre el mapa bloqueado</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="coverageOverlayButtonText" render={({ field }) => (
                                <FormItem><FormLabel>Texto del botón del mapa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="coverageFooterText" render={({ field }) => (
                                <FormItem><FormLabel>Texto final de ayuda</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField control={form.control} name="coverageFooterLinkText" render={({ field }) => (
                                  <FormItem><FormLabel>Texto del enlace final</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="coverageFooterLinkUrl" render={({ field }) => (
                                  <FormItem><FormLabel>URL del enlace final</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                              <h3 className="text-xl font-semibold">Sección "Nuestros clientes"</h3>
                              <FormField control={form.control} name="clientsTitle" render={({ field }) => (
                                <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>
                              <FormField control={form.control} name="clientsDescription" render={({ field }) => (
                                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                              )}/>

                              <div className="grid grid-cols-1 gap-4">
                                {clientFields.map((clientField, index) => {
                                  const clientName = form.watch(`clients.${index}.name`) || `Cliente ${index + 1}`;
                                  const isExpanded = expandedClientIndex === index;

                                  return (
                                    <div key={clientField.id} className="rounded-lg border">
                                      <div className="flex items-center justify-between gap-3 p-4">
                                        <div className="min-w-0">
                                          <p className="truncate font-medium">{clientName}</p>
                                          <p className="truncate text-sm text-muted-foreground">
                                            {form.watch(`clients.${index}.logoUrl`) || 'Sin URL de logo'}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setExpandedClientIndex(isExpanded ? null : index)}
                                          >
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Editar cliente</span>
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={clientFields.length <= 1}
                                            onClick={() => {
                                              removeClient(index);
                                              if (expandedClientIndex === index) {
                                                setExpandedClientIndex(null);
                                              } else if (expandedClientIndex !== null && expandedClientIndex > index) {
                                                setExpandedClientIndex(expandedClientIndex - 1);
                                              }
                                            }}
                                          >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Eliminar cliente</span>
                                          </Button>
                                        </div>
                                      </div>

                                      {isExpanded ? (
                                        <div className="space-y-3 border-t p-4">
                                          <FormField
                                            control={form.control}
                                            name={`clients.${index}.name`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Cliente {index + 1} - Nombre</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                          <FormField
                                            control={form.control}
                                            name={`clients.${index}.logoUrl`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Cliente {index + 1} - URL del logo</FormLabel>
                                                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  appendClient({ name: '', logoUrl: '' });
                                  setExpandedClientIndex(clientFields.length);
                                }}
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar cliente
                              </Button>
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

function CarouselImageItemEditor({
  label,
  imageAlt,
  item,
  canMoveUp,
  canMoveDown,
  onFileChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  aspectRatio = 'aspect-video',
}: {
  label: string;
  imageAlt: string;
  item: CarouselEditorItem;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onFileChange: (file?: File) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  aspectRatio?: string;
}) {
  const [preview, setPreview] = useState(item.url || 'https://placehold.co/600x400?text=Sin+imagen');

  useEffect(() => {
    if (item.file instanceof File) {
      const fileUrl = URL.createObjectURL(item.file);
      setPreview(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    }

    setPreview(item.url || 'https://placehold.co/600x400?text=Sin+imagen');
    return undefined;
  }, [item.file, item.url]);

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium">{label}</p>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" disabled={!canMoveUp} onClick={onMoveUp}>
            <ArrowUp className="h-4 w-4" />
            <span className="sr-only">Subir imagen</span>
          </Button>
          <Button type="button" variant="ghost" size="icon" disabled={!canMoveDown} onClick={onMoveDown}>
            <ArrowDown className="h-4 w-4" />
            <span className="sr-only">Bajar imagen</span>
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Eliminar imagen</span>
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-6">
        <Image
          src={preview}
          alt={imageAlt}
          width={160}
          height={90}
          className={cn('rounded-lg border object-cover', aspectRatio)}
        />
        <div className="flex-1 space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              onFileChange(file);
            }}
          />
          <FormDescription>
            Seleccioná una nueva imagen. Sin límite de tamaño.
          </FormDescription>
        </div>
      </div>
    </div>
  );
}
