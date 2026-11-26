'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoadingImage } from '@/components/loading-image';
import { ScrollReveal } from '@/components/scroll-reveal';
import { AuroraBackdrop, Magnet, SpotlightCard } from '@/components/react-bits';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import {
  CheckCircle2,
  Shield,
  Zap,
  Calculator,
  Receipt,
  ArrowRight,
  Wrench,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { trackEvent } from '@/lib/analytics-client';

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
  heroDescription:
    'Soluciones de control fiscal homologadas por AFIP para garantizar el cumplimiento y optimizar la gestión de tu negocio.',
  heroButtonText: 'Consultar Precios',
  heroButtonLink: 'https://wa.me/5493564504977',
  heroBackgroundImageUrl: '',
  heroBackgroundMobileImageUrl: '',
  servicesBadge: 'Soporte técnico fiscal',
  servicesTitle: 'Servicios',
  servicesDescription:
    'Soporte técnico especializado para operar tus controladores fiscales con máxima continuidad y cumplimiento.',
  services: [
    {
      title: 'Actualización de firmware para transparencia fiscal',
      description:
        'Instalación y validación de versiones compatibles para mantener el equipo alineado con requisitos fiscales vigentes.',
    },
    {
      title: 'Renovación de certificados',
      description:
        'Gestión completa de renovación para evitar interrupciones operativas y asegurar continuidad en la facturación.',
    },
    {
      title: 'Trámite de baja en ARCA',
      description:
        'Asistencia técnica y administrativa para realizar la baja correctamente y sin demoras en el proceso.',
    },
    {
      title: 'Reparación de equipos',
      description:
        'Diagnóstico, reemplazo de componentes y puesta a punto de controladores fiscales y periféricos asociados.',
    },
    {
      title: 'Presentación de informes de AFIP',
      description:
        'Preparación y soporte para la presentación de reportes obligatorios con control de consistencia y formato.',
    },
    {
      title: 'Consultas técnicas y administrativas',
      description:
        'Asesoramiento personalizado para resolver dudas sobre operación, normativa fiscal y configuración de controladores.',
    },
  ],
  featuresTitle: 'Características Principales',
  featuresDescription: 'Tecnología de vanguardia para el control fiscal de tu empresa.',
  featuresBackgroundImageUrl: '',
  features: [
    {
      title: 'Cumplimiento AFIP',
      description:
        'Equipos homologados que garantizan el cumplimiento de todas las normativas fiscales vigentes.',
    },
    {
      title: 'Alta Velocidad',
      description:
        'Procesamiento rápido de transacciones para optimizar el flujo de trabajo en tu comercio.',
    },
    {
      title: 'Reportes Detallados',
      description:
        'Generación automática de reportes Z, X y diarios para un control preciso de tus ventas.',
    },
    {
      title: 'Cálculos Automáticos',
      description:
        'Cálculo automático de impuestos, descuentos y totales para evitar errores humanos.',
    },
  ],
  brandsTitle: 'Marcas con las que trabajamos',
  brandsDescription: 'Hasar, Samsung y Epson: soluciones confiables para tu control fiscal.',
  brands: [
    {
      name: 'Hasar',
      logoUrl: '/hasarlogo.png',
      controllerImageUrl: '',
      description:
        'Controladores fiscales Hasar ofrecen alta confiabilidad y cumplimiento AFIP. Ideales para comercios de todo tipo con tecnología avanzada en impresión térmica.',
      features: [
        'Alta velocidad de impresión',
        'Memoria fiscal integrada',
        'Conectividad múltiple',
        'Soporte técnico especializado',
      ],
    },
    {
      name: 'Samsung',
      logoUrl: '/samsunglogo.png',
      controllerImageUrl: '',
      description:
        'Los controladores Samsung combinan innovación tecnológica con robustez. Perfectos para negocios que requieren integración con sistemas modernos.',
      features: [
        'Pantalla táctil intuitiva',
        'Procesamiento rápido',
        'Diseño ergonómico',
        'Garantía extendida',
      ],
    },
    {
      name: 'Epson',
      logoUrl: '/epsonlogo.png',
      controllerImageUrl: '',
      description:
        'Epson proporciona controladores fiscales con calidad de impresión excepcional. Adecuados para entornos de alto volumen con durabilidad probada.',
      features: [
        'Calidad de impresión superior',
        'Bajo mantenimiento',
        'Compatibilidad amplia',
        'Eficiencia energética',
      ],
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
  ctaDescription:
    'Contactanos hoy mismo y descubre cómo nuestros controladores fiscales pueden impulsar tu negocio.',
  ctaButtonText: 'WhatsApp',
  ctaButtonLink: 'https://wa.me/5493564504977',
};

const featureIcons = [Shield, Zap, Receipt, Calculator];

export default function ControladoresFiscalesPage() {
  const [content, setContent] = useState<ControladoresFiscalesContent>(defaultContent);

  useEffect(() => {
    const loadContent = async () => {
      const [contentRes, heroImgRes, heroMobRes, featuresImgRes, benefitsImgRes] = await Promise.all([
        supabase.from('controladores_fiscales_content').select('*').eq('id', 1).maybeSingle(),
        supabase
          .from('imagenes')
          .select('public_url')
          .eq('seccion', 'controladores-fiscales')
          .eq('etiqueta', 'hero-background')
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('imagenes')
          .select('public_url')
          .eq('seccion', 'controladores-fiscales')
          .eq('etiqueta', 'hero-background-mobile')
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('imagenes')
          .select('public_url')
          .eq('seccion', 'controladores-fiscales')
          .eq('etiqueta', 'features-background')
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('imagenes')
          .select('public_url')
          .eq('seccion', 'controladores-fiscales')
          .eq('etiqueta', 'benefits-background')
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const data = contentRes.data;
      const latestHero = heroImgRes.data?.public_url?.trim() || '';
      const latestHeroMobile = heroMobRes.data?.public_url?.trim() || '';
      const latestFeatures = featuresImgRes.data?.public_url?.trim() || '';
      const latestBenefits = benefitsImgRes.data?.public_url?.trim() || '';

      if (!data) {
        setContent((prev) => ({
          ...prev,
          heroBackgroundImageUrl: latestHero,
          heroBackgroundMobileImageUrl: latestHeroMobile || latestHero,
          featuresBackgroundImageUrl: latestFeatures,
          benefitsBackgroundImageUrl: latestBenefits,
        }));
        return;
      }

      const heroBg = data.hero_background_image_url?.trim() || latestHero;
      const heroMobBg = (data as any).hero_background_mobile_image_url?.trim() || latestHeroMobile || heroBg;

      setContent({
        heroBadge: data.hero_badge ?? defaultContent.heroBadge,
        heroTitle: data.hero_title ?? defaultContent.heroTitle,
        heroDescription: data.hero_description ?? defaultContent.heroDescription,
        heroButtonText: data.hero_button_text ?? defaultContent.heroButtonText,
        heroButtonLink: data.hero_button_link ?? defaultContent.heroButtonLink,
        heroBackgroundImageUrl: heroBg,
        heroBackgroundMobileImageUrl: heroMobBg,
        servicesBadge: data.services_badge ?? defaultContent.servicesBadge,
        servicesTitle: data.services_title ?? defaultContent.servicesTitle,
        servicesDescription: data.services_description ?? defaultContent.servicesDescription,
        services: data.services ?? defaultContent.services,
        featuresTitle: data.features_title ?? defaultContent.featuresTitle,
        featuresDescription: data.features_description ?? defaultContent.featuresDescription,
        featuresBackgroundImageUrl: data.features_background_image_url?.trim() || latestFeatures,
        features: data.features ?? defaultContent.features,
        brandsTitle: data.brands_title ?? defaultContent.brandsTitle,
        brandsDescription: data.brands_description ?? defaultContent.brandsDescription,
        brands: data.brands ?? defaultContent.brands,
        benefitsImageUrl: data.benefits_image_url ?? defaultContent.benefitsImageUrl,
        benefitsBackgroundImageUrl: data.benefits_background_image_url?.trim() || latestBenefits,
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

  return (
    <div className="w-full bg-background text-foreground">
      {/* Banner CMS a ancho completo (100% edge-to-edge sin barras laterales) */}
      {content.heroBackgroundImageUrl && (
        <div className="w-full overflow-hidden border-b border-border bg-surface">
          <div className="relative aspect-[9/14] w-full md:hidden">
            <LoadingImage
              src={content.heroBackgroundMobileImageUrl || content.heroBackgroundImageUrl}
              alt={content.heroTitle}
              fill
              priority
              className="h-full w-full object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="relative hidden h-[380px] w-full md:block lg:h-[480px] xl:h-[540px]">
            <LoadingImage
              src={content.heroBackgroundImageUrl}
              alt={content.heroTitle}
              fill
              priority
              className="h-full w-full object-cover object-center"
              sizes="100vw"
            />
          </div>
        </div>
      )}

      {/* Hero Editorial con degradé institucional + Aurora */}
      <section className="bg-brand-hero relative w-full overflow-hidden border-b border-border py-16 lg:py-24">
        <AuroraBackdrop variant="light" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              <h1 className="font-headline text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {content.heroTitle}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-foreground/75 md:text-xl">
                {content.heroDescription}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Magnet strength={0.2}>
                  <Button asChild size="lg" className="rb-star-cta h-12 rounded-full px-7 text-white">
                    <Link
                      href={content.heroButtonLink}
                      target={content.heroButtonLink.startsWith('http') ? '_blank' : undefined}
                      onClick={() => trackEvent('whatsapp_click', { label: 'Fiscales Hero CTA' })}
                    >
                      {content.heroButtonText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Magnet>
                <div className="flex items-center gap-5 pl-1">
                  <img src="/hasarlogo.png" alt="Hasar" className="h-7 w-auto object-contain" />
                  <img src="/epsonlogo.png" alt="Epson" className="h-6 w-auto object-contain" />
                  <img src="/samsunglogo.png" alt="Samsung" className="h-6 w-auto object-contain" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-brand-cobalt rounded-2xl border border-primary/20 p-6 text-white shadow-[0_24px_56px_-24px_rgba(0,48,143,0.45)] sm:p-7">
                <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4">
                  <span className="font-headline text-lg font-bold">Servicio Técnico Fiscal Oficial</span>
                  <Shield className="h-6 w-6 text-emerald-300" />
                </div>
                <ul className="mt-5 space-y-3 text-sm text-white/90">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                    Equipos homologados por AFIP / ARCA (2da generación)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                    Actualización de firmware, certificados y trámite de baja
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                    Presentación de reportes semanales y mantenimiento integral
                  </li>
                </ul>
                <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-white px-5 py-3.5">
                  <img src="/hasarlogo.png" alt="Hasar" className="h-7 w-auto object-contain" />
                  <img src="/epsonlogo.png" alt="Epson" className="h-6 w-auto object-contain" />
                  <img src="/samsunglogo.png" alt="Samsung" className="h-6 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Técnicos Fiscales */}
      <section className="w-full border-b border-border bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl lg:text-5xl">
                {content.servicesTitle}
              </h2>
              <p className="text-base leading-relaxed text-foreground/75 md:text-lg">
                {content.servicesDescription}
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {content.services.map((service, index) => (
              <ScrollReveal key={`${service.title}-${index}`} delayMs={index * 55} className="bg-background p-6 sm:p-7">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="font-headline text-lg font-bold leading-snug text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="w-full border-b border-border bg-surface py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                {content.featuresTitle}
              </h2>
              <p className="text-base text-foreground/75 md:text-lg">{content.featuresDescription}</p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.features.map((feature, index) => {
              const Icon = featureIcons[index] ?? Shield;
              return (
                <ScrollReveal key={`${feature.title}-${index}`} delayMs={index * 60}>
                  <div className="h-full rounded-2xl border border-border bg-background p-6">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-headline text-lg font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Marcas con las que trabajamos */}
      <section className="w-full border-b border-border bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                {content.brandsTitle}
              </h2>
              <p className="text-base text-foreground/75 md:text-lg">{content.brandsDescription}</p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {content.brands.map((brand, index) => (
              <ScrollReveal key={`${brand.name}-${index}`} delayMs={index * 70}>
                <SpotlightCard
                  spotlightColor="rgba(0, 48, 143, 0.14)"
                  className="flex h-full flex-col justify-between rounded-2xl border border-primary/15 bg-gradient-to-b from-white to-[#F5F8FF] p-6 shadow-sm transition-all duration-300 ease-expo hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[0_22px_44px_-20px_rgba(0,48,143,0.28)] sm:p-7"
                >
                  <div className="relative z-20">
                    <div className="flex h-20 items-center justify-center rounded-xl border border-border bg-white px-4">
                      <LoadingImage
                        src={brand.logoUrl}
                        alt={`${brand.name} logo`}
                        width={140}
                        height={60}
                        className="max-h-12 w-auto object-contain"
                      />
                    </div>

                    {brand.controllerImageUrl && (
                      <div className="mt-5 flex h-36 items-center justify-center rounded-xl border border-border bg-white p-3">
                        <LoadingImage
                          src={brand.controllerImageUrl}
                          alt={`${brand.name} controlador`}
                          width={160}
                          height={140}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}

                    <p className="mt-5 text-sm leading-relaxed text-foreground/80">
                      {brand.description}
                    </p>

                    <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                      {brand.features.map((feat, i) => (
                        <li key={`${feat}-${i}`} className="flex items-start gap-2.5 text-sm text-foreground/85">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button asChild variant="whatsapp" className="relative z-20 mt-6 h-11 w-full rounded-full">
                    <Link
                      href={`https://wa.me/5493564504977?text=${encodeURIComponent(
                        `Hola, quiero consultar por controladores fiscales ${brand.name}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('whatsapp_click', { label: `Marca Fiscal: ${brand.name}` })}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Consultar {brand.name}
                    </Link>
                  </Button>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios — Contraste corregido y alta legibilidad */}
      <section className="bg-brand-soft w-full border-b border-border py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <ScrollReveal direction="left" className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                {content.benefitsImageUrl ? (
                  <LoadingImage
                    src={content.benefitsImageUrl}
                    alt="Control Fiscal"
                    width={640}
                    height={420}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="bg-brand-cobalt flex aspect-video w-full flex-col items-center justify-center gap-3 p-8 text-center text-white">
                    <Receipt className="h-12 w-12 text-emerald-300" />
                    <p className="font-headline text-xl font-bold">Cumplimiento Fiscal Garantizado</p>
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="space-y-6 lg:col-span-6">
              <div className="space-y-3">
                <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] text-foreground sm:text-4xl">
                  {content.benefitsTitle}
                </h2>
                <p className="text-base leading-relaxed text-foreground/75 md:text-lg">
                  {content.benefitsDescription}
                </p>
              </div>

              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {content.benefits.map((benefit, index) => (
                  <li
                    key={`${benefit}-${index}`}
                    className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3.5 text-sm font-medium text-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" className="h-12 rounded-full px-7">
                <Link href={content.benefitsButtonLink || '/contacto'}>
                  {content.benefitsButtonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-brand-cobalt relative w-full overflow-hidden py-20 text-primary-foreground lg:py-24">
        <AuroraBackdrop variant="cobalt" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] text-white sm:text-4xl">
            {content.ctaTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {content.ctaDescription}
          </p>
          <div className="mt-8">
            <Magnet strength={0.22}>
              <Button asChild variant="whatsapp" size="lg" className="h-12 rounded-full px-8 text-base">
                <Link
                  href={content.ctaButtonLink}
                  target={content.ctaButtonLink.startsWith('http') ? '_blank' : undefined}
                  onClick={() => trackEvent('whatsapp_click', { label: 'Fiscales CTA Bottom' })}
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {content.ctaButtonText}
                </Link>
              </Button>
            </Magnet>
          </div>
        </div>
      </section>
    </div>
  );
}
