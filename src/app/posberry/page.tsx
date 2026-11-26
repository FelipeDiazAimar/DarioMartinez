'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Cloud,
  Cpu,
  CreditCard,
  DollarSign,
  Gift,
  Globe,
  LineChart,
  Lock,
  Printer,
  ShoppingBag,
  Smile,
  Users,
  WifiOff,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingImage } from '@/components/loading-image';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { ScrollReveal } from '@/components/scroll-reveal';
import { AuroraBackdrop, CountUp, Magnet, SpotlightCard } from '@/components/react-bits';
import { supabase } from '@/lib/supabase-client';
import { trackEvent } from '@/lib/analytics-client';

const defaultPosberryContent = {
  heroTitle: 'Simple, flexible y confiable',
  heroDescription:
    'Formá parte de una comunidad de más de 9,000 comercios exitosos. Funciona sin internet y se adapta a cualquier rubro.',
  whyChooseTitle: '¿Por qué los comercios eligen POSBerry?',
  whyChooseDescription: 'Las ventajas que impulsan tu negocio todos los días',
  whyChooseFeatures: [
    {
      title: 'Siempre Operativo',
      description:
        'Tu negocio nunca se detiene. POSBerry funciona perfectamente con o sin conexión a internet, garantizando 100% de disponibilidad para tus ventas.',
    },
    {
      title: 'Fácil de Usar',
      description:
        'Interfaz intuitiva que tu equipo aprende en minutos. Sin complicaciones, solo resultados. Empezá a vender desde el primer día.',
    },
    {
      title: 'Precio Transparente',
      description:
        'Un único precio mensual que incluye todo: actualizaciones, soporte y nuevas funcionalidades. Sin sorpresas, sin costos adicionales.',
    },
  ],
  coreFeaturesTitle: 'Todo lo que necesitás para vender más',
  coreFeaturesDescription: 'Un sistema completo que se adapta a tu negocio',
  coreFeatures: [
    {
      title: 'Ventas Rápidas',
      description:
        'Procesá ventas en segundos. Múltiples medios de pago, descuentos automáticos y gestión de devoluciones.',
    },
    {
      title: 'Control de Stock',
      description:
        'Inventario en tiempo real. Alertas de stock bajo, múltiples depósitos y trazabilidad completa.',
    },
    {
      title: 'Reportes Inteligentes',
      description:
        'Dashboards en tiempo real. Análisis de ventas, productos más vendidos y proyecciones para tomar decisiones basadas en datos.',
    },
    {
      title: 'Gestión de Clientes',
      description:
        'CRM integrado. Historial de compras, cuentas corrientes y programa de fidelización para fidelizar a tus clientes.',
    },
    {
      title: 'Facturación Electrónica ARCA',
      description:
        'Totalmente integrado con ARCA. Facturas A, B, C, Notas de Crédito/Débito. Homologado y siempre actualizado.',
    },
    {
      title: 'Multi-Sucursal',
      description:
        'Gestión centralizada para escalar sin límites. Sincronización automática, reportes consolidados y control total.',
    },
  ],
  advancedFeaturesTitle: 'Potenciá tu Negocio',
  advancedFeaturesDescription: 'Características avanzadas que marcan la diferencia',
  advancedFeatures: [
    {
      title: 'Respaldo Automático',
      description:
        'Cambiá de PC sin perder nada. Instalá POSBerry en cualquier equipo y tus datos se descargan automáticamente desde la nube.',
    },
    {
      title: 'Integraciones de Pago',
      description:
        'Conectado con los principales procesadores: Mercado Pago QR y Point, Fiserv, Clover, Payway, PVS-SuperPOS, y QR Bind.',
    },
    {
      title: 'Promociones Inteligentes',
      description:
        'Creá esquemas de descuentos y recargos automáticos. Happy hours, descuentos por cantidad, promociones por día de la semana.',
    },
    {
      title: 'Impresiones Completas',
      description:
        'Soporte total para tu negocio: Fiscales 1ra y 2da generación, códigos de barra, etiquetas de precios y comandas de cocina.',
    },
    {
      title: 'Seguridad Total',
      description:
        'Tus datos siempre protegidos con backups periódicos automáticos, encriptación y sincronización segura en la nube.',
    },
    {
      title: 'Gestión Avanzada',
      description:
        'Control total de tu negocio con cierres de turno, control de cajas múltiples, y reportes detallados por vendedor.',
    },
  ],
};

const whyChooseIcons = [WifiOff, Smile, DollarSign];
const coreIcons = [Zap, ShoppingBag, LineChart, Users, Printer, Globe];
const advancedIcons = [Cloud, CreditCard, Gift, Printer, Lock, Cpu];

const integrationsList = [
  { src: '/mercadopago.png', alt: 'Mercado Pago' },
  { src: '/fiserv.png', alt: 'Fiserv' },
  { src: '/clover.png', alt: 'Clover' },
  { src: '/payway.png', alt: 'Payway' },
  { src: '/pvs.png', alt: 'PVS SuperPOS' },
  { src: '/bind.png', alt: 'QR Bind' },
];

export default function PosberryPage() {
  const [content, setContent] = useState(defaultPosberryContent);

  useEffect(() => {
    const loadPosberry = async () => {
      const { data } = await supabase
        .from('posberry_content')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (data) {
        setContent({
          ...defaultPosberryContent,
          heroTitle: data.hero_title ?? defaultPosberryContent.heroTitle,
          heroDescription: data.hero_description ?? defaultPosberryContent.heroDescription,
          whyChooseTitle: data.why_choose_title ?? defaultPosberryContent.whyChooseTitle,
          whyChooseDescription: data.why_choose_description ?? defaultPosberryContent.whyChooseDescription,
          whyChooseFeatures: data.why_choose_features ?? defaultPosberryContent.whyChooseFeatures,
          coreFeaturesTitle: data.core_features_title ?? defaultPosberryContent.coreFeaturesTitle,
          coreFeaturesDescription: data.core_features_description ?? defaultPosberryContent.coreFeaturesDescription,
          coreFeatures: data.core_features ?? defaultPosberryContent.coreFeatures,
          advancedFeaturesTitle: data.advanced_features_title ?? defaultPosberryContent.advancedFeaturesTitle,
          advancedFeaturesDescription:
            data.advanced_features_description ?? defaultPosberryContent.advancedFeaturesDescription,
          advancedFeatures: data.advanced_features ?? defaultPosberryContent.advancedFeatures,
        });
      }
    };

    loadPosberry();
  }, []);

  const whyChooseFeatures = (
    content.whyChooseFeatures?.length ? content.whyChooseFeatures : defaultPosberryContent.whyChooseFeatures
  ).map((feature: any, index: number) => ({
    Icon: whyChooseIcons[index] ?? WifiOff,
    title: feature?.title ?? defaultPosberryContent.whyChooseFeatures[index]?.title,
    description: feature?.description ?? defaultPosberryContent.whyChooseFeatures[index]?.description,
  }));

  const coreFeatures = (
    content.coreFeatures?.length ? content.coreFeatures : defaultPosberryContent.coreFeatures
  ).map((feature: any, index: number) => ({
    Icon: coreIcons[index] ?? Zap,
    title: feature?.title ?? defaultPosberryContent.coreFeatures[index]?.title,
    description: feature?.description ?? defaultPosberryContent.coreFeatures[index]?.description,
    link: index === 0 ? 'Ver integraciones de pago' : undefined,
  }));

  const advancedFeatures = (
    content.advancedFeatures?.length ? content.advancedFeatures : defaultPosberryContent.advancedFeatures
  ).map((feature: any, index: number) => ({
    Icon: advancedIcons[index] ?? Cloud,
    title: feature?.title ?? defaultPosberryContent.advancedFeatures[index]?.title,
    description: feature?.description ?? defaultPosberryContent.advancedFeatures[index]?.description,
  }));

  return (
    <div className="w-full bg-background text-foreground">
      {/* Hero con degradé + Aurora */}
      <section className="bg-brand-hero relative w-full overflow-hidden border-b border-border py-16 lg:py-24">
        <AuroraBackdrop variant="light" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-6">
              <div className="inline-flex items-center gap-3">
                <LoadingImage
                  src="/LOGOBOSBERRY3.png"
                  alt="POSBerry Logo"
                  width={44}
                  height={44}
                  priority
                  className="h-11 w-11 object-contain"
                />
                <span className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
                  POSBerry
                </span>
              </div>
              <h1 className="font-headline text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {content.heroTitle}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-foreground/75 md:text-xl">
                {content.heroDescription}
              </p>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <Magnet strength={0.2}>
                  <Button asChild variant="whatsapp" size="lg" className="h-12 rounded-full px-7">
                    <Link
                      href="https://wa.me/5493564504977?text=Hola%2C%20quiero%20recibir%20informaci%C3%B3n%20sobre%20POSBerry."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('whatsapp_click', { label: 'Posberry Hero' })}
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      Consultanos
                    </Link>
                  </Button>
                </Magnet>
                <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/85">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span>Facturación electrónica ARCA integrada</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <LoadingImage
                  src="/POSBERRY2.png"
                  alt="POSBerry en una computadora"
                  width={900}
                  height={640}
                  priority
                  className="mx-auto max-h-[420px] w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué eligen POSBerry */}
      <section className="bg-brand-soft w-full border-b border-border py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                {content.whyChooseTitle}
              </h2>
              <p className="text-base text-foreground/75 md:text-lg">{content.whyChooseDescription}</p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {whyChooseFeatures.map((feature, index) => {
              const Icon = feature.Icon;
              return (
                <ScrollReveal key={feature.title} delayMs={index * 70} className="bg-background p-7 sm:p-8">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {feature.description}
                  </p>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Funcionalidades Principales + Panel de Arquitectura */}
      <section className="bg-brand-mist w-full border-b border-border py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-6">
                <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                  {content.coreFeaturesTitle}
                </h2>
                <p className="text-base text-foreground/75 md:text-lg">{content.coreFeaturesDescription}</p>
              </div>
              <div className="lg:col-span-6">
                <div className="bg-brand-cobalt grid grid-cols-2 gap-3 rounded-2xl border border-primary/20 p-5 text-white shadow-[0_20px_50px_-24px_rgba(0,48,143,0.4)] sm:p-6">
                  <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="font-headline text-2xl font-extrabold text-white">
                      <CountUp to={9000} prefix="+" />
                    </p>
                    <p className="mt-1 text-xs text-white/80">Comercios operando con POSBerry</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="font-headline text-2xl font-extrabold text-emerald-300">100%</p>
                    <p className="mt-1 text-xs text-white/80">Operativo con o sin internet</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="font-headline text-lg font-bold text-white">ARCA / AFIP</p>
                    <p className="mt-1 text-xs text-white/80">Facturación electrónica homologada</p>
                  </div>
                  <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <p className="font-headline text-lg font-bold text-white">Nube Segura</p>
                    <p className="mt-1 text-xs text-white/80">Backups automáticos y multi-sucursal</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.Icon;
              return (
                <ScrollReveal key={feature.title} delayMs={index * 55}>
                  <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface/60 p-6 transition-colors hover:border-primary/35 hover:bg-background">
                    <div>
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-headline text-lg font-bold">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    {feature.link && (
                      <Link
                        href="#integrations"
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        {feature.link}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Características Avanzadas */}
      <section className="w-full border-b border-border bg-surface py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                {content.advancedFeaturesTitle}
              </h2>
              <p className="text-base text-foreground/75 md:text-lg">{content.advancedFeaturesDescription}</p>
            </div>
          </ScrollReveal>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.Icon;
              return (
                <ScrollReveal key={feature.title} delayMs={index * 55}>
                  <div className="flex items-start gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-headline text-base font-bold sm:text-lg">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integraciones de Pago */}
      <section id="integrations" className="scroll-mt-20 w-full border-b border-border bg-background py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl space-y-2 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                Integraciones de Pago
              </h2>
              <p className="text-base text-foreground/75">
                Conectado con los principales procesadores del país.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {integrationsList.map((integration, index) => (
              <ScrollReveal key={integration.alt} delayMs={index * 50}>
                <div className="flex h-20 items-center justify-center rounded-xl border border-border bg-surface p-4">
                  <LoadingImage
                    src={integration.src}
                    alt={integration.alt}
                    width={130}
                    height={40}
                    className="max-h-9 w-auto object-contain"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-brand-cobalt relative w-full overflow-hidden py-20 text-primary-foreground lg:py-24">
        <AuroraBackdrop variant="cobalt" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-headline text-3xl font-bold tracking-[-0.025em] text-white sm:text-4xl">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Descubrí cómo POSBerry puede simplificar tu gestión y potenciar tus ventas. ¡Hablemos!
          </p>
          <div className="mt-8">
            <Magnet strength={0.22}>
              <Button asChild variant="whatsapp" size="lg" className="h-12 rounded-full px-8 text-base">
                <Link
                  href="https://wa.me/5493564504977?text=Hola%2C%20quiero%20una%20demo%20o%20presupuesto%20de%20POSBerry."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click', { label: 'Posberry CTA Bottom' })}
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Consultanos
                </Link>
              </Button>
            </Magnet>
          </div>
        </div>
      </section>
    </div>
  );
}
