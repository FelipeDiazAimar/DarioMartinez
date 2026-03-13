'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Receipt, Undo2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { LoadingImage } from '@/components/loading-image';
import { supabase } from '@/lib/supabase-client';

const serviceSchema = z.object({
  title: z.string().min(3, 'El título es muy corto.'),
  description: z.string().min(10, 'La descripción es muy corta.'),
});

const featureSchema = z.object({
  title: z.string().min(3, 'El título es muy corto.'),
  description: z.string().min(10, 'La descripción es muy corta.'),
});

const brandSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto.'),
  logoUrl: z.string().optional(),
  controllerImageUrl: z.string().optional(),
  description: z.string().min(10, 'La descripción es muy corta.'),
  features: z.array(z.string().min(3, 'El texto es muy corto.')).length(4),
});

const formSchema = z.object({
  heroBadge: z.string().min(2, 'El texto es muy corto.'),
  heroTitle: z.string().min(3, 'El título es muy corto.'),
  heroDescription: z.string().min(10, 'La descripción es muy corta.'),
  heroButtonText: z.string().min(3, 'El texto es muy corto.'),
  heroButtonLink: z.string().min(3, 'El link es muy corto.'),
  heroBackgroundImageFile: z.any().optional(),
  heroBackgroundMobileImageFile: z.any().optional(),

  servicesBadge: z.string().min(2, 'El texto es muy corto.'),
  servicesTitle: z.string().min(3, 'El título es muy corto.'),
  servicesDescription: z.string().min(10, 'La descripción es muy corta.'),
  services: z.array(serviceSchema).length(6),

  featuresTitle: z.string().min(3, 'El título es muy corto.'),
  featuresDescription: z.string().min(10, 'La descripción es muy corta.'),
  featuresBackgroundImageFile: z.any().optional(),
  features: z.array(featureSchema).length(4),

  brandsTitle: z.string().min(3, 'El título es muy corto.'),
  brandsDescription: z.string().min(10, 'La descripción es muy corta.'),
  brand1LogoFile: z.any().optional(),
  brand1ControllerFile: z.any().optional(),
  brand2LogoFile: z.any().optional(),
  brand2ControllerFile: z.any().optional(),
  brand3LogoFile: z.any().optional(),
  brand3ControllerFile: z.any().optional(),
  brands: z.array(brandSchema).length(3),

  benefitsImageFile: z.any().optional(),
  benefitsBackgroundImageFile: z.any().optional(),
  benefitsBadge: z.string().min(2, 'El texto es muy corto.'),
  benefitsTitle: z.string().min(3, 'El título es muy corto.'),
  benefitsDescription: z.string().min(10, 'La descripción es muy corta.'),
  benefits: z.array(z.string().min(3, 'El beneficio es muy corto.')).length(6),
  benefitsButtonText: z.string().min(3, 'El texto es muy corto.'),
  benefitsButtonLink: z.string().min(3, 'El link es muy corto.'),

  ctaTitle: z.string().min(3, 'El título es muy corto.'),
  ctaDescription: z.string().min(10, 'La descripción es muy corta.'),
  ctaButtonText: z.string().min(3, 'El texto es muy corto.'),
  ctaButtonLink: z.string().min(3, 'El link es muy corto.'),
});

const defaultValues: z.infer<typeof formSchema> = {
  heroBadge: 'Tecnología Fiscal Avanzada',
  heroTitle: 'Controladores Fiscales',
  heroDescription: 'Soluciones de control fiscal homologadas por AFIP para garantizar el cumplimiento y optimizar la gestión de tu negocio.',
  heroButtonText: 'Consultar Precios',
  heroButtonLink: 'https://wa.me/5493564504977',
  heroBackgroundImageFile: undefined,
  heroBackgroundMobileImageFile: undefined,

  servicesBadge: 'Soporte técnico fiscal',
  servicesTitle: 'Servicios',
  servicesDescription: 'Soporte técnico especializado para operar tus controladores fiscales con máxima continuidad y cumplimiento.',
  services: [
    {
      title: 'Actualización de firmware para transparencia fiscal',
      description: 'Instalación y validación de versiones compatibles para mantener el equipo alineado con requisitos fiscales vigentes.',
    },
    {
      title: 'Renovación de certificados',
      description: 'Gestión completa de renovación para evitar interrupciones operativas y asegurar continuidad en la facturación.',
    },
    {
      title: 'Trámite de baja en ARCA',
      description: 'Asistencia técnica y administrativa para realizar la baja correctamente y sin demoras en el proceso.',
    },
    {
      title: 'Reparación de equipos',
      description: 'Diagnóstico, reemplazo de componentes y puesta a punto de controladores fiscales y periféricos asociados.',
    },
    {
      title: 'Presentación de informes de AFIP',
      description: 'Preparación y soporte para la presentación de reportes obligatorios con control de consistencia y formato.',
    },
    {
      title: 'Consultas técnicas y administrativas',
      description: 'Asesoramiento personalizado para resolver dudas sobre operación, normativa fiscal y configuración de controladores.',
    },
  ],

  featuresTitle: 'Características Principales',
  featuresDescription: 'Tecnología de vanguardia para el control fiscal de tu empresa.',
  featuresBackgroundImageFile: undefined,
  features: [
    {
      title: 'Cumplimiento AFIP',
      description: 'Equipos homologados que garantizan el cumplimiento de todas las normativas fiscales vigentes.',
    },
    {
      title: 'Alta Velocidad',
      description: 'Procesamiento rápido de transacciones para optimizar el flujo de trabajo en tu comercio.',
    },
    {
      title: 'Reportes Detallados',
      description: 'Generación automática de reportes Z, X y diarios para un control preciso de tus ventas.',
    },
    {
      title: 'Cálculos Automáticos',
      description: 'Cálculo automático de impuestos, descuentos y totales para evitar errores humanos.',
    },
  ],

  brandsTitle: 'Marcas con las que trabajamos',
  brandsDescription: 'Hasar, Samsung y Epson: soluciones confiables para tu control fiscal.',
  brand1LogoFile: undefined,
  brand1ControllerFile: undefined,
  brand2LogoFile: undefined,
  brand2ControllerFile: undefined,
  brand3LogoFile: undefined,
  brand3ControllerFile: undefined,
  brands: [
    {
      name: 'Hasar',
      logoUrl: '/hasarlogo.png',
      controllerImageUrl: 'https://picsum.photos/seed/hasar-controller/256/256',
      description: 'Controladores fiscales Hasar ofrecen alta confiabilidad y cumplimiento AFIP. Ideales para comercios de todo tipo con tecnología avanzada en impresión térmica.',
      features: ['Alta velocidad de impresión', 'Memoria fiscal integrada', 'Conectividad múltiple', 'Soporte técnico especializado'],
    },
    {
      name: 'Samsung',
      logoUrl: '/samsunglogo.png',
      controllerImageUrl: 'https://picsum.photos/seed/samsung-controller/256/256',
      description: 'Los controladores Samsung combinan innovación tecnológica con robustez. Perfectos para negocios que requieren integración con sistemas modernos.',
      features: ['Pantalla táctil intuitiva', 'Procesamiento rápido', 'Diseño ergonómico', 'Garantía extendida'],
    },
    {
      name: 'Epson',
      logoUrl: '/epsonlogo.png',
      controllerImageUrl: 'https://picsum.photos/seed/epson-controller/256/256',
      description: 'Epson proporciona controladores fiscales con calidad de impresión excepcional. Adecuados para entornos de alto volumen con durabilidad probada.',
      features: ['Calidad de impresión superior', 'Bajo mantenimiento', 'Compatibilidad amplia', 'Eficiencia energética'],
    },
  ],

  benefitsImageFile: undefined,
  benefitsBackgroundImageFile: undefined,
  benefitsBadge: 'Beneficios',
  benefitsTitle: '¿Por qué elegir nuestros controladores fiscales?',
  benefitsDescription: 'Optimiza tu negocio con soluciones fiscales confiables y eficientes.',
  benefits: [
    'Reducción de errores en facturación',
    'Cumplimiento automático con AFIP',
    'Ahorro de tiempo en reportes',
    'Mayor control de inventario',
    'Integración con sistemas existentes',
    'Soporte técnico especializado',
  ],
  benefitsButtonText: 'Más Información',
  benefitsButtonLink: '/contacto',

  ctaTitle: '¿Listo para modernizar tu control fiscal?',
  ctaDescription: 'Contactanos hoy mismo y descubre cómo nuestros controladores fiscales pueden impulsar tu negocio.',
  ctaButtonText: 'WhatsApp',
  ctaButtonLink: 'https://wa.me/5493564504977',
};

type FormValues = z.infer<typeof formSchema>;
const fallbackHeroBackgroundImageUrl = 'https://picsum.photos/seed/controladores-fiscales-bg/1920/1080';
const fallbackHeroBackgroundMobileImageUrl = fallbackHeroBackgroundImageUrl;
const fallbackFeaturesBackgroundImageUrl = 'https://picsum.photos/seed/controladores-fiscales-features-bg/1920/1080';
const fallbackBenefitsImageUrl = 'https://picsum.photos/seed/fiscal-control/600/400';

const imageFileFieldByBrand = [
  { logoField: 'brand1LogoFile', controllerField: 'brand1ControllerFile' },
  { logoField: 'brand2LogoFile', controllerField: 'brand2ControllerFile' },
  { logoField: 'brand3LogoFile', controllerField: 'brand3ControllerFile' },
] as const;

const pickText = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const normalizeServices = (value: unknown) => {
  const raw = Array.isArray(value) ? value : [];

  return defaultValues.services.map((defaultService, index) => {
    const item = raw[index] as any;
    return {
      title: pickText(item?.title, defaultService.title),
      description: pickText(item?.description, defaultService.description),
    };
  });
};

const normalizeFeatures = (value: unknown) => {
  const raw = Array.isArray(value) ? value : [];

  return defaultValues.features.map((defaultFeature, index) => {
    const item = raw[index] as any;
    return {
      title: pickText(item?.title, defaultFeature.title),
      description: pickText(item?.description, defaultFeature.description),
    };
  });
};

const normalizeBrands = (value: unknown) => {
  const raw = Array.isArray(value) ? value : [];

  return defaultValues.brands.map((defaultBrand, index) => {
    const item = raw[index] as any;
    const rawFeatures = Array.isArray(item?.features) ? item.features : [];

    return {
      name: pickText(item?.name, defaultBrand.name),
      logoUrl: pickText(item?.logoUrl, defaultBrand.logoUrl),
      controllerImageUrl: pickText(item?.controllerImageUrl, defaultBrand.controllerImageUrl),
      description: pickText(item?.description, defaultBrand.description),
      features: defaultBrand.features.map((defaultFeature, featureIndex) =>
        pickText(rawFeatures[featureIndex], defaultFeature)
      ),
    };
  });
};

const normalizeBenefits = (value: unknown) => {
  const raw = Array.isArray(value) ? value : [];

  return defaultValues.benefits.map((defaultBenefit, index) =>
    pickText(raw[index], defaultBenefit)
  );
};

export default function EditControladoresFiscalesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [heroBackgroundPreviewUrl, setHeroBackgroundPreviewUrl] = useState(fallbackHeroBackgroundImageUrl);
  const [heroBackgroundMobilePreviewUrl, setHeroBackgroundMobilePreviewUrl] = useState(fallbackHeroBackgroundMobileImageUrl);
  const [featuresBackgroundPreviewUrl, setFeaturesBackgroundPreviewUrl] = useState(fallbackFeaturesBackgroundImageUrl);
  const [benefitsImagePreviewUrl, setBenefitsImagePreviewUrl] = useState(fallbackBenefitsImageUrl);
  const [benefitsBackgroundPreviewUrl, setBenefitsBackgroundPreviewUrl] = useState(fallbackBenefitsImageUrl);
  const [brandLogoPreviewUrls, setBrandLogoPreviewUrls] = useState(() =>
    defaultValues.brands.map((brand) => brand.logoUrl)
  );
  const [brandControllerPreviewUrls, setBrandControllerPreviewUrls] = useState(() =>
    defaultValues.brands.map((brand) => brand.controllerImageUrl)
  );
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
    defaultValues,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadContent = async () => {
      setIsLoading(true);
      console.log('[CF Admin] loadContent:start');

      const { data, error } = await supabase
        .from('controladores_fiscales_content')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      console.log('[CF Admin] loadContent:content-row', { hasData: !!data, error });

      if (error) {
        toast({
          title: 'Error al cargar',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { data: heroImageData } = await supabase
        .from('imagenes')
        .select('public_url')
        .eq('seccion', 'controladores-fiscales')
        .eq('etiqueta', 'hero-background')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: heroMobileImageData } = await supabase
        .from('imagenes')
        .select('public_url')
        .eq('seccion', 'controladores-fiscales')
        .eq('etiqueta', 'hero-background-mobile')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: featuresImageData } = await supabase
        .from('imagenes')
        .select('public_url')
        .eq('seccion', 'controladores-fiscales')
        .eq('etiqueta', 'features-background')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: benefitsBackgroundImageData } = await supabase
        .from('imagenes')
        .select('public_url')
        .eq('seccion', 'controladores-fiscales')
        .eq('etiqueta', 'benefits-background')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('[CF Admin] loadContent:image-rows', {
        heroImageData,
        heroMobileImageData,
        featuresImageData,
        benefitsBackgroundImageData,
      });

      setHeroBackgroundPreviewUrl(
        pickText(
          data?.hero_background_image_url,
          pickText(heroImageData?.public_url, fallbackHeroBackgroundImageUrl)
        )
      );
      setFeaturesBackgroundPreviewUrl(
        pickText(
          data?.features_background_image_url,
          pickText(featuresImageData?.public_url, fallbackFeaturesBackgroundImageUrl)
        )
      );
      setHeroBackgroundMobilePreviewUrl(
        pickText(
          (data as any)?.hero_background_mobile_image_url,
          pickText(heroMobileImageData?.public_url, fallbackHeroBackgroundMobileImageUrl)
        )
      );
      setBenefitsImagePreviewUrl(
        pickText(data?.benefits_image_url, fallbackBenefitsImageUrl)
      );
      setBenefitsBackgroundPreviewUrl(
        pickText(
          data?.benefits_background_image_url,
          pickText(benefitsBackgroundImageData?.public_url, fallbackBenefitsImageUrl)
        )
      );

      if (data) {
        const normalizedServices = normalizeServices(data.services);
        const normalizedFeatures = normalizeFeatures(data.features);
        const normalizedBrands = normalizeBrands(data.brands);
        const normalizedBenefits = normalizeBenefits(data.benefits);

        setBrandLogoPreviewUrls(
          normalizedBrands.map((brand, index) => pickText(brand.logoUrl, defaultValues.brands[index].logoUrl))
        );
        setBrandControllerPreviewUrls(
          normalizedBrands.map((brand, index) => pickText(brand.controllerImageUrl, defaultValues.brands[index].controllerImageUrl))
        );

        form.reset({
          heroBadge: pickText(data.hero_badge, defaultValues.heroBadge),
          heroTitle: pickText(data.hero_title, defaultValues.heroTitle),
          heroDescription: pickText(data.hero_description, defaultValues.heroDescription),
          heroButtonText: pickText(data.hero_button_text, defaultValues.heroButtonText),
          heroButtonLink: pickText(data.hero_button_link, defaultValues.heroButtonLink),
          heroBackgroundImageFile: undefined,
          heroBackgroundMobileImageFile: undefined,
          servicesBadge: pickText(data.services_badge, defaultValues.servicesBadge),
          servicesTitle: pickText(data.services_title, defaultValues.servicesTitle),
          servicesDescription: pickText(data.services_description, defaultValues.servicesDescription),
          services: normalizedServices,
          featuresTitle: pickText(data.features_title, defaultValues.featuresTitle),
          featuresDescription: pickText(data.features_description, defaultValues.featuresDescription),
          featuresBackgroundImageFile: undefined,
          features: normalizedFeatures,
          brandsTitle: pickText(data.brands_title, defaultValues.brandsTitle),
          brandsDescription: pickText(data.brands_description, defaultValues.brandsDescription),
          brand1LogoFile: undefined,
          brand1ControllerFile: undefined,
          brand2LogoFile: undefined,
          brand2ControllerFile: undefined,
          brand3LogoFile: undefined,
          brand3ControllerFile: undefined,
          brands: normalizedBrands,
          benefitsImageFile: undefined,
          benefitsBackgroundImageFile: undefined,
          benefitsBadge: pickText(data.benefits_badge, defaultValues.benefitsBadge),
          benefitsTitle: pickText(data.benefits_title, defaultValues.benefitsTitle),
          benefitsDescription: pickText(data.benefits_description, defaultValues.benefitsDescription),
          benefits: normalizedBenefits,
          benefitsButtonText: pickText(data.benefits_button_text, defaultValues.benefitsButtonText),
          benefitsButtonLink: pickText(data.benefits_button_link, defaultValues.benefitsButtonLink),
          ctaTitle: pickText(data.cta_title, defaultValues.ctaTitle),
          ctaDescription: pickText(data.cta_description, defaultValues.ctaDescription),
          ctaButtonText: pickText(data.cta_button_text, defaultValues.ctaButtonText),
          ctaButtonLink: pickText(data.cta_button_link, defaultValues.ctaButtonLink),
        });
      }

      setIsLoading(false);
      console.log('[CF Admin] loadContent:done');
    };

    loadContent();
  }, [form, isAuthenticated, toast]);

  const uploadImage = async (file: File, name: string) => {
    console.log('[CF Admin] uploadImage:start', {
      name,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    const maxFileSize = 15 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw new Error('La imagen supera 15MB. Comprimila e intentá nuevamente.');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    const response = await fetch('/api/admin/controladores-fiscales/upload', {
      method: 'POST',
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('[CF Admin] uploadImage:api-error', { status: response.status, payload });
      throw new Error(payload?.error || 'No se pudo subir la imagen desde el servidor.');
    }

    const publicUrl = payload?.publicUrl as string | undefined;
    const filePath = payload?.filePath as string | undefined;

    if (!publicUrl) {
      throw new Error('El servidor no devolvió la URL pública de la imagen.');
    }

    console.log('[CF Admin] uploadImage:public-url', { name, filePath, publicUrl });

    console.log('[CF Admin] uploadImage:done', { name, publicUrl });
    return publicUrl;
  };

  async function onSubmit(values: FormValues) {
    setIsSaving(true);
    console.log('[CF Admin] onSubmit:start', {
      hasHeroFile: values.heroBackgroundImageFile instanceof File,
      hasHeroMobileFile: values.heroBackgroundMobileImageFile instanceof File,
      hasFeaturesFile: values.featuresBackgroundImageFile instanceof File,
      hasBenefitsFile: values.benefitsImageFile instanceof File,
      hasBenefitsBackgroundFile: values.benefitsBackgroundImageFile instanceof File,
    });

    try {
      if (!(values.heroBackgroundImageFile instanceof File) && !heroBackgroundPreviewUrl) {
        throw new Error('La imagen de fondo es obligatoria.');
      }

      if (!(values.benefitsImageFile instanceof File) && !benefitsImagePreviewUrl) {
        throw new Error('La imagen de beneficios es obligatoria.');
      }

      const heroBackgroundImageUrl = values.heroBackgroundImageFile instanceof File
        ? await uploadImage(values.heroBackgroundImageFile, 'hero-background')
        : heroBackgroundPreviewUrl;

      const heroBackgroundMobileImageUrl = values.heroBackgroundMobileImageFile instanceof File
        ? await uploadImage(values.heroBackgroundMobileImageFile, 'hero-background-mobile')
        : heroBackgroundMobilePreviewUrl;

      const featuresBackgroundImageUrl = values.featuresBackgroundImageFile instanceof File
        ? await uploadImage(values.featuresBackgroundImageFile, 'features-background')
        : featuresBackgroundPreviewUrl;

      const benefitsImageUrl = values.benefitsImageFile instanceof File
        ? await uploadImage(values.benefitsImageFile, 'benefits-image')
        : benefitsImagePreviewUrl;

      const benefitsBackgroundImageUrl = values.benefitsBackgroundImageFile instanceof File
        ? await uploadImage(values.benefitsBackgroundImageFile, 'benefits-background')
        : benefitsBackgroundPreviewUrl;

      console.log('[CF Admin] onSubmit:resolved-image-urls', {
        heroBackgroundImageUrl,
        heroBackgroundMobileImageUrl,
        featuresBackgroundImageUrl,
        benefitsImageUrl,
        benefitsBackgroundImageUrl,
      });

      const updatedBrands = await Promise.all(
        values.brands.map(async (brand, index) => {
          const fields = imageFileFieldByBrand[index];
          const logoFile = values[fields.logoField];
          const controllerFile = values[fields.controllerField];

          const logoUrl = logoFile instanceof File
            ? await uploadImage(logoFile, `brand-${index + 1}-logo`)
            : brand.logoUrl;

          const controllerImageUrl = controllerFile instanceof File
            ? await uploadImage(controllerFile, `brand-${index + 1}-controller`)
            : brand.controllerImageUrl;

          return {
            ...brand,
            logoUrl,
            controllerImageUrl,
          };
        })
      );

      const { error } = await supabase.from('controladores_fiscales_content').upsert({
        id: 1,
        hero_badge: values.heroBadge,
        hero_title: values.heroTitle,
        hero_description: values.heroDescription,
        hero_button_text: values.heroButtonText,
        hero_button_link: values.heroButtonLink,
        hero_background_image_url: heroBackgroundImageUrl,
        services_badge: values.servicesBadge,
        services_title: values.servicesTitle,
        services_description: values.servicesDescription,
        services: values.services,
        features_title: values.featuresTitle,
        features_description: values.featuresDescription,
        features_background_image_url: featuresBackgroundImageUrl,
        features: values.features,
        brands_title: values.brandsTitle,
        brands_description: values.brandsDescription,
        brands: updatedBrands,
        benefits_image_url: benefitsImageUrl,
        benefits_background_image_url: benefitsBackgroundImageUrl,
        benefits_badge: values.benefitsBadge,
        benefits_title: values.benefitsTitle,
        benefits_description: values.benefitsDescription,
        benefits: values.benefits,
        benefits_button_text: values.benefitsButtonText,
        benefits_button_link: values.benefitsButtonLink,
        cta_title: values.ctaTitle,
        cta_description: values.ctaDescription,
        cta_button_text: values.ctaButtonText,
        cta_button_link: values.ctaButtonLink,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('[CF Admin] onSubmit:upsert-error', error);
        throw new Error(error.message);
      }

      console.log('[CF Admin] onSubmit:upsert-success');

      setHeroBackgroundPreviewUrl(heroBackgroundImageUrl);
      setHeroBackgroundMobilePreviewUrl(heroBackgroundMobileImageUrl);
      setFeaturesBackgroundPreviewUrl(featuresBackgroundImageUrl);
      setBenefitsImagePreviewUrl(benefitsImageUrl);
      setBenefitsBackgroundPreviewUrl(benefitsBackgroundImageUrl);

      toast({
        title: 'Cambios guardados',
        description: 'La página de Controladores Fiscales se actualizó correctamente.',
      });
    } catch (err: any) {
      console.error('[CF Admin] onSubmit:catch-error', err);
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
              <div className="space-y-8">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-3 border-b pb-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
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
            <Receipt className="h-8 w-8" />
            Editar Página "Controladores Fiscales"
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contenido e imágenes de Controladores Fiscales</CardTitle>
            <CardDescription>
              Editá todo el contenido de la página pública de controladores fiscales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-24">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Hero</h3>
                  <FormField control={form.control} name="heroBadge" render={({ field }) => (
                    <FormItem><FormLabel>Badge</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="heroTitle" render={({ field }) => (
                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="heroDescription" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="heroButtonText" render={({ field }) => (
                    <FormItem><FormLabel>Texto botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="heroButtonLink" render={({ field }) => (
                    <FormItem><FormLabel>Link botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="heroBackgroundImageFile" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjuntar imagen de fondo</FormLabel>
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
                              setHeroBackgroundPreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="heroBackgroundMobileImageFile" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjuntar imagen de fondo (móvil)</FormLabel>
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
                              setHeroBackgroundMobilePreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <p className="text-sm text-muted-foreground">Imagen actual cargada. Solo seleccioná archivo si querés reemplazarla.</p>
                  {heroBackgroundPreviewUrl ? (
                    <LoadingImage
                      src={heroBackgroundPreviewUrl}
                      alt="Preview hero"
                      width={800}
                      height={400}
                      className="h-40 w-full rounded-md object-cover"
                      spinnerSizeClassName="h-8 w-8"
                    />
                  ) : null}
                  <p className="text-sm text-muted-foreground">Imagen móvil actual cargada. Solo seleccioná archivo si querés reemplazarla.</p>
                  {heroBackgroundMobilePreviewUrl ? (
                    <LoadingImage
                      src={heroBackgroundMobilePreviewUrl}
                      alt="Preview hero móvil"
                      width={800}
                      height={400}
                      className="h-40 w-full rounded-md object-cover"
                      spinnerSizeClassName="h-8 w-8"
                    />
                  ) : null}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Servicios</h3>
                  <FormField control={form.control} name="servicesBadge" render={({ field }) => (
                    <FormItem><FormLabel>Badge</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="servicesTitle" render={({ field }) => (
                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="servicesDescription" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {defaultValues.services.map((_, index) => (
                      <div key={index} className="space-y-3 rounded-lg border p-4">
                        <FormField control={form.control} name={`services.${index}.title`} render={({ field }) => (
                          <FormItem><FormLabel>Servicio {index + 1} - Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`services.${index}.description`} render={({ field }) => (
                          <FormItem><FormLabel>Servicio {index + 1} - Descripción</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Características Principales</h3>
                  <FormField control={form.control} name="featuresBackgroundImageFile" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjuntar imagen de fondo</FormLabel>
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
                              setFeaturesBackgroundPreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <p className="text-sm text-muted-foreground">Imagen actual cargada. Solo seleccioná archivo si querés reemplazarla.</p>
                  {featuresBackgroundPreviewUrl ? (
                    <LoadingImage
                      src={featuresBackgroundPreviewUrl}
                      alt="Preview fondo características"
                      width={800}
                      height={400}
                      className="h-40 w-full rounded-md object-cover"
                      spinnerSizeClassName="h-8 w-8"
                    />
                  ) : null}
                  <FormField control={form.control} name="featuresTitle" render={({ field }) => (
                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="featuresDescription" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {defaultValues.features.map((_, index) => (
                      <div key={index} className="space-y-3 rounded-lg border p-4">
                        <FormField control={form.control} name={`features.${index}.title`} render={({ field }) => (
                          <FormItem><FormLabel>Característica {index + 1} - Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`features.${index}.description`} render={({ field }) => (
                          <FormItem><FormLabel>Característica {index + 1} - Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Marcas e imágenes</h3>
                  <FormField control={form.control} name="brandsTitle" render={({ field }) => (
                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="brandsDescription" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  {defaultValues.brands.map((_, brandIndex) => (
                    <div key={brandIndex} className="space-y-4 rounded-lg border p-4">
                      <FormField control={form.control} name={`brands.${brandIndex}.name`} render={({ field }) => (
                        <FormItem><FormLabel>Marca {brandIndex + 1} - Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={imageFileFieldByBrand[brandIndex].logoField} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca {brandIndex + 1} - Adjuntar logo</FormLabel>
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
                                  setBrandLogoPreviewUrls((previous) => {
                                    const next = [...previous];
                                    next[brandIndex] = URL.createObjectURL(file);
                                    return next;
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <p className="text-sm text-muted-foreground">Logo actual cargado. Solo seleccioná archivo si querés reemplazarlo.</p>
                      {brandLogoPreviewUrls[brandIndex] ? (
                        <LoadingImage
                          src={brandLogoPreviewUrls[brandIndex]}
                          alt={`Preview logo ${brandIndex + 1}`}
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded object-contain"
                          spinnerSizeClassName="h-5 w-5"
                        />
                      ) : null}
                      <FormField control={form.control} name={imageFileFieldByBrand[brandIndex].controllerField} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca {brandIndex + 1} - Adjuntar imagen controlador</FormLabel>
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
                                  setBrandControllerPreviewUrls((previous) => {
                                    const next = [...previous];
                                    next[brandIndex] = URL.createObjectURL(file);
                                    return next;
                                  });
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <p className="text-sm text-muted-foreground">Imagen de controlador actual cargada. Solo seleccioná archivo si querés reemplazarla.</p>
                      {brandControllerPreviewUrls[brandIndex] ? (
                        <LoadingImage
                          src={brandControllerPreviewUrls[brandIndex]}
                          alt={`Preview controlador ${brandIndex + 1}`}
                          width={96}
                          height={96}
                          className="h-24 w-24 rounded object-contain"
                          spinnerSizeClassName="h-5 w-5"
                        />
                      ) : null}
                      <FormField control={form.control} name={`brands.${brandIndex}.description`} render={({ field }) => (
                        <FormItem><FormLabel>Marca {brandIndex + 1} - Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map((featureIndex) => (
                          <FormField
                            key={featureIndex}
                            control={form.control}
                            name={`brands.${brandIndex}.features.${featureIndex}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Marca {brandIndex + 1} - Punto {featureIndex + 1}</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Beneficios</h3>
                  <FormField control={form.control} name="benefitsImageFile" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjuntar imagen de beneficios</FormLabel>
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
                              setBenefitsImagePreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <p className="text-sm text-muted-foreground">Imagen actual cargada. Solo seleccioná archivo si querés reemplazarla.</p>
                  {benefitsImagePreviewUrl ? (
                    <LoadingImage
                      src={benefitsImagePreviewUrl}
                      alt="Preview beneficios"
                      width={800}
                      height={400}
                      className="h-40 w-full rounded-md object-cover"
                      spinnerSizeClassName="h-8 w-8"
                    />
                  ) : null}
                  <FormField control={form.control} name="benefitsBackgroundImageFile" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjuntar imagen de fondo</FormLabel>
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
                              setBenefitsBackgroundPreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <p className="text-sm text-muted-foreground">Imagen actual cargada. Solo seleccioná archivo si querés reemplazarla.</p>
                  {benefitsBackgroundPreviewUrl ? (
                    <LoadingImage
                      src={benefitsBackgroundPreviewUrl}
                      alt="Preview fondo beneficios"
                      width={800}
                      height={400}
                      className="h-40 w-full rounded-md object-cover"
                      spinnerSizeClassName="h-8 w-8"
                    />
                  ) : null}
                  <FormField control={form.control} name="benefitsBadge" render={({ field }) => (
                    <FormItem><FormLabel>Badge</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="benefitsTitle" render={({ field }) => (
                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="benefitsDescription" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[0, 1, 2, 3, 4, 5].map((benefitIndex) => (
                      <FormField
                        key={benefitIndex}
                        control={form.control}
                        name={`benefits.${benefitIndex}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beneficio {benefitIndex + 1}</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormField control={form.control} name="benefitsButtonText" render={({ field }) => (
                    <FormItem><FormLabel>Texto botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="benefitsButtonLink" render={({ field }) => (
                    <FormItem><FormLabel>Link botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">CTA final</h3>
                  <FormField control={form.control} name="ctaTitle" render={({ field }) => (
                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="ctaDescription" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="ctaButtonText" render={({ field }) => (
                    <FormItem><FormLabel>Texto botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="ctaButtonLink" render={({ field }) => (
                    <FormItem><FormLabel>Link botón</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <Separator />

                <div className="fixed bottom-6 right-6 z-50">
                  <div className="hidden md:flex items-center gap-4">
                    <Button type="button" variant="outline" size="lg" className="bg-background shadow-lg" onClick={() => {
                      form.reset(defaultValues);
                      setHeroBackgroundPreviewUrl(fallbackHeroBackgroundImageUrl);
                      setFeaturesBackgroundPreviewUrl(fallbackFeaturesBackgroundImageUrl);
                      setBenefitsImagePreviewUrl(fallbackBenefitsImageUrl);
                      setBenefitsBackgroundPreviewUrl(fallbackBenefitsImageUrl);
                      setBrandLogoPreviewUrls(defaultValues.brands.map((brand) => brand.logoUrl));
                      setBrandControllerPreviewUrls(defaultValues.brands.map((brand) => brand.controllerImageUrl));
                    }} disabled={isSaving}>
                      <Undo2 className="mr-2 h-5 w-5" />
                      Deshacer Cambios
                    </Button>
                    <Button type="submit" size="lg" className="shadow-lg" disabled={isSaving}>
                      <Check className="mr-2 h-5 w-5" />
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                  <div className="md:hidden flex flex-col gap-3">
                    <Button type="submit" size="icon" className="rounded-full h-14 w-14 shadow-lg" disabled={isSaving}>
                      <Check className="h-6 w-6" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="rounded-full h-14 w-14 bg-background shadow-lg" onClick={() => {
                      form.reset(defaultValues);
                      setHeroBackgroundPreviewUrl(fallbackHeroBackgroundImageUrl);
                      setFeaturesBackgroundPreviewUrl(fallbackFeaturesBackgroundImageUrl);
                      setBenefitsImagePreviewUrl(fallbackBenefitsImageUrl);
                      setBenefitsBackgroundPreviewUrl(fallbackBenefitsImageUrl);
                      setBrandLogoPreviewUrls(defaultValues.brands.map((brand) => brand.logoUrl));
                      setBrandControllerPreviewUrls(defaultValues.brands.map((brand) => brand.controllerImageUrl));
                    }} disabled={isSaving}>
                      <Undo2 className="h-6 w-6" />
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
