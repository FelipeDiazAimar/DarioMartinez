'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingImage } from '@/components/loading-image';
import { CheckCircle, Shield, Zap, TrendingUp, Calculator, Receipt, ArrowRight } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';

type ServiceItem = {
  title: string;
  description: string;
};

type FeatureItem = {
  title: string;
  description: string;
};

type BrandItem = {
  name: string;
  logoUrl: string;
  controllerImageUrl: string;
  description: string;
  features: string[];
};

type ControladoresFiscalesContent = {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroBackgroundImageUrl: string;
  heroBackgroundMobileImageUrl: string;
  servicesBadge: string;
  servicesTitle: string;
  servicesDescription: string;
  services: ServiceItem[];
  featuresTitle: string;
  featuresDescription: string;
  featuresBackgroundImageUrl: string;
  features: FeatureItem[];
  brandsTitle: string;
  brandsDescription: string;
  brands: BrandItem[];
  benefitsImageUrl: string;
  benefitsBackgroundImageUrl: string;
  benefitsBadge: string;
  benefitsTitle: string;
  benefitsDescription: string;
  benefits: string[];
  benefitsButtonText: string;
  benefitsButtonLink: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
};

const defaultContent: ControladoresFiscalesContent = {
  heroBadge: 'Tecnología Fiscal Avanzada',
  heroTitle: 'Controladores Fiscales',
  heroDescription: 'Soluciones de control fiscal homologadas por AFIP para garantizar el cumplimiento y optimizar la gestión de tu negocio.',
  heroButtonText: 'Consultar Precios',
  heroButtonLink: 'https://wa.me/5493564504977',
  heroBackgroundImageUrl: '',
  heroBackgroundMobileImageUrl: '',
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
  featuresBackgroundImageUrl: '',
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
  brands: [
    {
      name: 'Hasar',
      logoUrl: '/hasarlogo.png',
      controllerImageUrl: '',
      description: 'Controladores fiscales Hasar ofrecen alta confiabilidad y cumplimiento AFIP. Ideales para comercios de todo tipo con tecnología avanzada en impresión térmica.',
      features: ['Alta velocidad de impresión', 'Memoria fiscal integrada', 'Conectividad múltiple', 'Soporte técnico especializado'],
    },
    {
      name: 'Samsung',
      logoUrl: '/samsunglogo.png',
      controllerImageUrl: '',
      description: 'Los controladores Samsung combinan innovación tecnológica con robustez. Perfectos para negocios que requieren integración con sistemas modernos.',
      features: ['Pantalla táctil intuitiva', 'Procesamiento rápido', 'Diseño ergonómico', 'Garantía extendida'],
    },
    {
      name: 'Epson',
      logoUrl: '/epsonlogo.png',
      controllerImageUrl: '',
      description: 'Epson proporciona controladores fiscales con calidad de impresión excepcional. Adecuados para entornos de alto volumen con durabilidad probada.',
      features: ['Calidad de impresión superior', 'Bajo mantenimiento', 'Compatibilidad amplia', 'Eficiencia energética'],
    },
  ],
  benefitsImageUrl: '',
  benefitsBackgroundImageUrl: '',
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

export default function ControladoresFiscalesPage() {
  const [content, setContent] = useState<ControladoresFiscalesContent>(defaultContent);
  const [heroBackgroundLoaded, setHeroBackgroundLoaded] = useState(false);
  const [heroMobileBackgroundLoaded, setHeroMobileBackgroundLoaded] = useState(false);
  const [featuresBackgroundLoaded, setFeaturesBackgroundLoaded] = useState(false);
  const [benefitsBackgroundLoaded, setBenefitsBackgroundLoaded] = useState(false);
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [servicesRef, servicesInView] = useInView({ threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1 });
  const [modelsRef, modelsInView] = useInView({ threshold: 0.1 });
  const [benefitsRef, benefitsInView] = useInView({ threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    const loadContent = async () => {
      const { data, error } = await supabase
        .from('controladores_fiscales_content')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      const { data: heroImageData } = await supabase
        .from('imagenes')
        .select('public_url')
        .eq('seccion', 'controladores-fiscales')
        .eq('etiqueta', 'hero-background')
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

      const { data: heroMobileImageData } = await supabase
        .from('imagenes')
        .select('public_url')
        .eq('seccion', 'controladores-fiscales')
        .eq('etiqueta', 'hero-background-mobile')
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

      const latestHeroImageUrl = typeof heroImageData?.public_url === 'string' && heroImageData.public_url.trim().length > 0
        ? heroImageData.public_url
        : defaultContent.heroBackgroundImageUrl;

      const latestFeaturesImageUrl = typeof featuresImageData?.public_url === 'string' && featuresImageData.public_url.trim().length > 0
        ? featuresImageData.public_url
        : defaultContent.featuresBackgroundImageUrl;

      const latestHeroMobileImageUrl = typeof heroMobileImageData?.public_url === 'string' && heroMobileImageData.public_url.trim().length > 0
        ? heroMobileImageData.public_url
        : defaultContent.heroBackgroundMobileImageUrl;

      const latestBenefitsBackgroundImageUrl = typeof benefitsBackgroundImageData?.public_url === 'string' && benefitsBackgroundImageData.public_url.trim().length > 0
        ? benefitsBackgroundImageData.public_url
        : defaultContent.benefitsBackgroundImageUrl;

      const heroBackgroundImageUrl = typeof data?.hero_background_image_url === 'string' && data.hero_background_image_url.trim().length > 0
        ? data.hero_background_image_url
        : latestHeroImageUrl;

      const heroBackgroundMobileImageUrl = typeof (data as any)?.hero_background_mobile_image_url === 'string' && (data as any).hero_background_mobile_image_url.trim().length > 0
        ? (data as any).hero_background_mobile_image_url
        : latestHeroMobileImageUrl || heroBackgroundImageUrl;

      const featuresBackgroundImageUrl = typeof data?.features_background_image_url === 'string' && data.features_background_image_url.trim().length > 0
        ? data.features_background_image_url
        : latestFeaturesImageUrl;

      const benefitsBackgroundImageUrl = typeof data?.benefits_background_image_url === 'string' && data.benefits_background_image_url.trim().length > 0
        ? data.benefits_background_image_url
        : latestBenefitsBackgroundImageUrl;

      if (error || !data) {
        setContent((previous) => ({
          ...previous,
          heroBackgroundImageUrl: latestHeroImageUrl,
          heroBackgroundMobileImageUrl: latestHeroMobileImageUrl || latestHeroImageUrl,
          featuresBackgroundImageUrl: latestFeaturesImageUrl,
          benefitsBackgroundImageUrl: latestBenefitsBackgroundImageUrl,
        }));
        return;
      }

      setContent({
        heroBadge: data.hero_badge ?? defaultContent.heroBadge,
        heroTitle: data.hero_title ?? defaultContent.heroTitle,
        heroDescription: data.hero_description ?? defaultContent.heroDescription,
        heroButtonText: data.hero_button_text ?? defaultContent.heroButtonText,
        heroButtonLink: data.hero_button_link ?? defaultContent.heroButtonLink,
        heroBackgroundImageUrl,
        heroBackgroundMobileImageUrl,
        servicesBadge: data.services_badge ?? defaultContent.servicesBadge,
        servicesTitle: data.services_title ?? defaultContent.servicesTitle,
        servicesDescription: data.services_description ?? defaultContent.servicesDescription,
        services: data.services ?? defaultContent.services,
        featuresTitle: data.features_title ?? defaultContent.featuresTitle,
        featuresDescription: data.features_description ?? defaultContent.featuresDescription,
        featuresBackgroundImageUrl,
        features: data.features ?? defaultContent.features,
        brandsTitle: data.brands_title ?? defaultContent.brandsTitle,
        brandsDescription: data.brands_description ?? defaultContent.brandsDescription,
        brands: data.brands ?? defaultContent.brands,
        benefitsImageUrl: data.benefits_image_url ?? defaultContent.benefitsImageUrl,
        benefitsBackgroundImageUrl,
        benefitsBadge: data.benefits_badge ?? defaultContent.benefitsBadge,
        benefitsTitle: data.benefits_title ?? defaultContent.benefitsTitle,
        benefitsDescription: data.benefits_description ?? defaultContent.benefitsDescription,
        benefits: data.benefits ?? defaultContent.benefits,
        benefitsButtonText: data.benefits_button_text ?? defaultContent.benefitsButtonText,
        benefitsButtonLink: data.benefits_button_link ?? defaultContent.benefitsButtonLink,
        ctaTitle: data.cta_title ?? defaultContent.ctaTitle,
        ctaDescription: data.cta_description ?? defaultContent.ctaDescription,
        ctaButtonText: data.cta_button_text ?? defaultContent.ctaButtonText,
        ctaButtonLink: data.cta_button_link ?? defaultContent.ctaButtonLink,
      });
    };

    loadContent();
  }, []);

  useEffect(() => {
    setHeroBackgroundLoaded(false);
    if (!content.heroBackgroundImageUrl) {
      return;
    }

    const image = new window.Image();
    image.onload = () => setHeroBackgroundLoaded(true);
    image.onerror = () => setHeroBackgroundLoaded(true);
    image.src = content.heroBackgroundImageUrl;
  }, [content.heroBackgroundImageUrl]);

  useEffect(() => {
    setHeroMobileBackgroundLoaded(false);
    if (!content.heroBackgroundMobileImageUrl) {
      return;
    }

    const image = new window.Image();
    image.onload = () => setHeroMobileBackgroundLoaded(true);
    image.onerror = () => setHeroMobileBackgroundLoaded(true);
    image.src = content.heroBackgroundMobileImageUrl;
  }, [content.heroBackgroundMobileImageUrl]);

  useEffect(() => {
    setFeaturesBackgroundLoaded(false);
    if (!content.featuresBackgroundImageUrl) {
      return;
    }

    const image = new window.Image();
    image.onload = () => setFeaturesBackgroundLoaded(true);
    image.onerror = () => setFeaturesBackgroundLoaded(true);
    image.src = content.featuresBackgroundImageUrl;
  }, [content.featuresBackgroundImageUrl]);

  useEffect(() => {
    setBenefitsBackgroundLoaded(false);
    if (!content.benefitsBackgroundImageUrl) {
      return;
    }

    const image = new window.Image();
    image.onload = () => setBenefitsBackgroundLoaded(true);
    image.onerror = () => setBenefitsBackgroundLoaded(true);
    image.src = content.benefitsBackgroundImageUrl;
  }, [content.benefitsBackgroundImageUrl]);

  const featureIcons = [Shield, Zap, Receipt, Calculator];

  return (
    <div className="flex flex-col min-h-screen">
      <section
        ref={heroRef}
        className={cn(
          'w-full bg-primary/10 pb-12 opacity-0 md:pb-24 lg:pb-32',
          heroInView && 'animate-fade-in'
        )}
      >
        <div
          className={cn('w-full overflow-hidden bg-muted opacity-0', heroInView && 'animate-fade-in')}
          style={{ animationDelay: '80ms' }}
        >
          <div className="relative w-full aspect-[9/16] md:aspect-auto md:h-[500px] lg:h-[600px]">
            {!heroBackgroundLoaded && !heroMobileBackgroundLoaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              </div>
            )}
            {content.heroBackgroundImageUrl ? (
              <>
                <div
                  className="h-full w-full bg-cover bg-center md:hidden"
                  style={{ backgroundImage: `url('${content.heroBackgroundMobileImageUrl || content.heroBackgroundImageUrl}')` }}
                />
                <div
                  className="hidden h-full w-full bg-cover bg-center md:block"
                  style={{ backgroundImage: `url('${content.heroBackgroundImageUrl}')` }}
                />
              </>
            ) : (
              <div className="h-full w-full bg-muted/30" />
            )}
          </div>
        </div>

        <div className="container px-4 md:px-6">
          <div className={cn('mt-8 flex flex-col items-center justify-center space-y-4 text-center opacity-0 md:mt-10', heroInView && 'animate-slide-in-from-bottom')}>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                {content.heroBadge}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {content.heroTitle}
              </h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {content.heroDescription}
              </p>
            </div>
            <div
              className={cn('flex flex-col gap-2 opacity-0 min-[400px]:flex-row', heroInView && 'animate-fade-in')}
              style={{ animationDelay: '120ms' }}
            >
              <Button asChild size="lg" className="rounded-full">
                <Link href={content.heroButtonLink} target={content.heroButtonLink.startsWith('http') ? '_blank' : undefined}>
                  {content.heroButtonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={servicesRef}
        className={cn('w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/40 opacity-0', servicesInView && 'animate-fade-in')}
      >
        <div className="container px-4 md:px-6">
          <div className={cn('flex flex-col items-center justify-center space-y-4 text-center opacity-0', servicesInView && 'animate-fade-in')}>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                {content.servicesBadge}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {content.servicesTitle}
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {content.servicesDescription}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            {content.services.map((service, index) => (
              <Card
                key={`${service.title}-${index}`}
                className={cn(
                  'relative h-full overflow-hidden border-border/70 bg-background/90 opacity-0',
                  servicesInView && 'animate-slide-in-from-bottom'
                )}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="h-1 w-full bg-primary/70" />
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                      SERVICIO {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed md:text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={featuresRef}
        className={cn('relative w-full py-12 md:py-24 lg:py-32 opacity-0', featuresInView && 'animate-fade-in')}
      >
        {!featuresBackgroundLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}
        {content.featuresBackgroundImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${content.featuresBackgroundImageUrl}')` }}
          />
        ) : (
          <div className="absolute inset-0 bg-muted/30" />
        )}
        <div className="absolute inset-0 bg-background/70" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className={cn('flex flex-col items-center justify-center space-y-4 text-center opacity-0', featuresInView && 'animate-fade-in')}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {content.featuresTitle}
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {content.featuresDescription}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {content.features.map((feature, index) => {
              const FeatureIcon = featureIcons[index] ?? Shield;

              return (
                <Card key={`${feature.title}-${index}`} className={cn('opacity-0', featuresInView && 'animate-slide-in-from-bottom')} style={{ animationDelay: `${index * 150}ms` }}>
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 text-primary">
                      <FeatureIcon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section
        ref={modelsRef}
        className={cn('w-full py-12 md:py-24 lg:py-32 bg-muted/50 opacity-0', modelsInView && 'animate-fade-in')}
      >
        <div className="container px-4 md:px-6">
          <div className={cn('flex flex-col items-center justify-center space-y-4 text-center opacity-0', modelsInView && 'animate-fade-in')}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {content.brandsTitle}
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {content.brandsDescription}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            {content.brands.map((brand, index) => (
              <Card key={`${brand.name}-${index}`} className={cn('relative opacity-0 h-full flex flex-col', modelsInView && 'animate-slide-in-from-bottom')} style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader className="text-center">
                  <div className="mx-auto h-[120px] w-[120px] overflow-hidden">
                    <LoadingImage
                      src={brand.logoUrl}
                      alt={`${brand.name} logo`}
                      width={120}
                      height={120}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="mx-auto h-32 w-32 overflow-hidden">
                      <LoadingImage
                        src={brand.controllerImageUrl}
                        alt={`${brand.name} controlador`}
                        width={128}
                        height={128}
                        className="h-full w-full object-contain mb-4"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      {brand.description}
                    </p>
                    <ul className="space-y-2">
                      {brand.features.map((feature, featureIndex) => (
                        <li key={`${feature}-${featureIndex}`} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="mt-4 w-full rounded-full" asChild>
                    <Link href="https://wa.me/5493564504977" target="_blank">
                      Consultar {brand.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={benefitsRef}
        className={cn('relative w-full py-12 md:py-24 lg:py-32 opacity-0', benefitsInView && 'animate-fade-in')}
      >
        {!benefitsBackgroundLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}
        {content.benefitsBackgroundImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${content.benefitsBackgroundImageUrl}')` }}
          />
        ) : (
          <div className="absolute inset-0 bg-muted/30" />
        )}
        <div className="absolute inset-0 bg-background/50" />
        <div className="container relative z-10 px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className={cn('opacity-0', benefitsInView && 'animate-slide-in-from-left')}>
              <LoadingImage
                src={content.benefitsImageUrl}
                alt="Control Fiscal"
                width={600}
                height={400}
                className="aspect-video rounded-lg object-cover"
              />
            </div>
            <div className={cn('space-y-4 opacity-0', benefitsInView && 'animate-slide-in-from-right')}>
              <div className="space-y-2">
                <Badge variant="secondary">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {content.benefitsBadge}
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                  {content.benefitsTitle}
                </h2>
                <p className="text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {content.benefitsDescription}
                </p>
              </div>
              <ul className="space-y-3">
                {content.benefits.map((benefit, index) => (
                  <li
                    key={`${benefit}-${index}`}
                    className={cn('flex items-center gap-3 opacity-0', benefitsInView && 'animate-slide-in-from-right')}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                className={cn('rounded-full opacity-0', benefitsInView && 'animate-fade-in')}
                style={{ animationDelay: `${content.benefits.length * 80 + 120}ms` }}
              >
                <Link href={content.benefitsButtonLink}>
                  {content.benefitsButtonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={ctaRef}
        className={cn('w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground opacity-0', ctaInView && 'animate-fade-in')}
      >
        <div className="container px-4 md:px-6">
          <div className={cn('flex flex-col items-center justify-center space-y-4 text-center opacity-0', ctaInView && 'animate-slide-in-from-bottom')}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                {content.ctaTitle}
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {content.ctaDescription}
              </p>
            </div>
            <div
              className={cn('flex flex-col gap-2 opacity-0 min-[400px]:flex-row', ctaInView && 'animate-fade-in')}
              style={{ animationDelay: '120ms' }}
            >
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link href={content.ctaButtonLink} target={content.ctaButtonLink.startsWith('http') ? '_blank' : undefined}>
                  {content.ctaButtonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
