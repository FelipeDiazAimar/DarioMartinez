'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { supabase } from '@/lib/supabase-client';

const defaultPosberryContent = {
  heroTitle: 'Simple, flexible y confiable',
  heroDescription: 'Formá parte de una comunidad de más de 9,000 comercios exitosos. Funciona sin internet y se adapta a cualquier rubro.',
  whyChooseTitle: '¿Por qué los comercios eligen POSBerry?',
  whyChooseDescription: 'Las ventajas que impulsan tu negocio todos los días',
  whyChooseFeatures: [
    {
      title: 'Siempre Operativo',
      description: 'Tu negocio nunca se detiene. POSBerry funciona perfectamente con o sin conexión a internet, garantizando 100% de disponibilidad para tus ventas.',
    },
    {
      title: 'Fácil de Usar',
      description: 'Interfaz intuitiva que tu equipo aprende en minutos. Sin complicaciones, solo resultados. Empezá a vender desde el primer día.',
    },
    {
      title: 'Precio Transparente',
      description: 'Un único precio mensual que incluye todo: actualizaciones, soporte y nuevas funcionalidades. Sin sorpresas, sin costos adicionales.',
    },
  ],
  coreFeaturesTitle: 'Todo lo que necesitás para vender más',
  coreFeaturesDescription: 'Un sistema completo que se adapta a tu negocio',
  coreFeatures: [
    {
      title: 'Ventas Rápidas',
      description: 'Procesá ventas en segundos. Múltiples medios de pago, descuentos automáticos y gestión de devoluciones.',
    },
    {
      title: 'Control de Stock',
      description: 'Inventario en tiempo real. Alertas de stock bajo, múltiples depósitos y trazabilidad completa.',
    },
    {
      title: 'Reportes Inteligentes',
      description: 'Dashboards en tiempo real. Análisis de ventas, productos más vendidos y proyecciones para tomar decisiones basadas en datos.',
    },
    {
      title: 'Gestión de Clientes',
      description: 'CRM integrado. Historial de compras, cuentas corrientes y programa de fidelización para fidelizar a tus clientes.',
    },
    {
      title: 'Facturación Electrónica ARCA',
      description: 'Totalmente integrado con ARCA. Facturas A, B, C, Notas de Crédito/Débito. Homologado y siempre actualizado.',
    },
    {
      title: 'Multi-Sucursal',
      description: 'Gestión centralizada para escalar sin límites. Sincronización automática, reportes consolidados y control total.',
    },
  ],
  advancedFeaturesTitle: 'Potenciá tu Negocio',
  advancedFeaturesDescription: 'Características avanzadas que marcan la diferencia',
  advancedFeatures: [
    {
      title: 'Respaldo Automático',
      description: 'Cambiá de PC sin perder nada. Instalá POSBerry en cualquier equipo y tus datos se descargan automáticamente desde la nube.',
    },
    {
      title: 'Integraciones de Pago',
      description: 'Conectado con los principales procesadores: Mercado Pago QR y Point, Fiserv, Clover, Payway, PVS-SuperPOS, y QR Bind.',
    },
    {
      title: 'Promociones Inteligentes',
      description: 'Creá esquemas de descuentos y recargos automáticos. Happy hours, descuentos por cantidad, promociones por día de la semana.',
    },
    {
      title: 'Impresiones Completas',
      description: 'Soporte total para tu negocio: Fiscales 1ra y 2da generación, códigos de barra, etiquetas de precios y comandas de cocina.',
    },
    {
      title: 'Seguridad Total',
      description: 'Tus datos siempre protegidos con backups periódicos automáticos, encriptación y sincronización segura en la nube.',
    },
    {
      title: 'Gestión Avanzada',
      description: 'Control total de tu negocio con cierres de turno, control de cajas múltiples, y reportes detallados por vendedor.',
    },
  ],
};

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
          advancedFeaturesDescription: data.advanced_features_description ?? defaultPosberryContent.advancedFeaturesDescription,
          advancedFeatures: data.advanced_features ?? defaultPosberryContent.advancedFeatures,
        });
      }
    };

    loadPosberry();
  }, []);

  const whyChooseIcons = [
    <WifiOff className="h-10 w-10 text-primary" />,
    <Smile className="h-10 w-10 text-primary" />,
    <DollarSign className="h-10 w-10 text-primary" />,
  ];

  const coreIcons = [
    <Zap className="h-8 w-8" />,
    <ShoppingBag className="h-8 w-8" />,
    <LineChart className="h-8 w-8" />,
    <Users className="h-8 w-8" />,
    <Printer className="h-8 w-8" />,
    <Globe className="h-8 w-8" />,
  ];

  const advancedIcons = [
    <Cloud className="h-8 w-8 text-primary" />,
    <CreditCard className="h-8 w-8 text-primary" />,
    <Gift className="h-8 w-8 text-primary" />,
    <Printer className="h-8 w-8 text-primary" />,
    <Lock className="h-8 w-8 text-primary" />,
    <Cpu className="h-8 w-8 text-primary" />,
  ];

  const whyChooseFeatures = (content.whyChooseFeatures?.length ? content.whyChooseFeatures : defaultPosberryContent.whyChooseFeatures)
    .map((feature: any, index: number) => ({
      icon: whyChooseIcons[index] ?? whyChooseIcons[0],
      title: feature?.title ?? defaultPosberryContent.whyChooseFeatures[index]?.title,
      description: feature?.description ?? defaultPosberryContent.whyChooseFeatures[index]?.description,
    }));

  const coreFeatures = (content.coreFeatures?.length ? content.coreFeatures : defaultPosberryContent.coreFeatures)
    .map((feature: any, index: number) => ({
      icon: coreIcons[index] ?? coreIcons[0],
      title: feature?.title ?? defaultPosberryContent.coreFeatures[index]?.title,
      description: feature?.description ?? defaultPosberryContent.coreFeatures[index]?.description,
      link: index === 0 ? 'Ver integraciones de pago' : undefined,
    }));

  const advancedFeatures = (content.advancedFeatures?.length ? content.advancedFeatures : defaultPosberryContent.advancedFeatures)
    .map((feature: any, index: number) => ({
      icon: advancedIcons[index] ?? advancedIcons[0],
      title: feature?.title ?? defaultPosberryContent.advancedFeatures[index]?.title,
      description: feature?.description ?? defaultPosberryContent.advancedFeatures[index]?.description,
    }));

  return (
    <div className="bg-white text-foreground">
      {/* Hero Section */}
      <section className="relative bg-white text-foreground py-20 md:py-32">
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-center lg:text-left">
              <Image
                src="/LOGOBOSBERRY3.png"
                alt="POSBerry Logo"
                width={200}
                height={50}
                className="mx-auto lg:mx-0 h-auto w-auto"
              />
              <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl font-headline">
                {content.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg text-foreground/80 md:text-xl mx-auto lg:mx-0">
                {content.heroDescription}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" variant="secondary" className="rounded-full">
                  <Link href="https://wa.me/5493564504977" target="_blank">
                    <WhatsAppIcon className="mr-2 h-5 w-5" />
                    Consultanos
                  </Link>
                </Button>
                <div className="flex items-center justify-center gap-2 text-sm text-foreground/90">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>Facturación electrónica ARCA integrada</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/POSBERRY2.png"
                alt="POSBerry en una computadora"
                width={512}
                height={384}
                className="w-full max-w-lg mx-auto"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
              {content.whyChooseTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/70">
              {content.whyChooseDescription}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {whyChooseFeatures.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-2 text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="bg-muted py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
              {content.coreFeaturesTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/70">
              {content.coreFeaturesDescription}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature) => (
              <Card key={feature.title} className="transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70">{feature.description}</p>
                  {feature.link && (
                     <Link href="#integrations" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
                        {feature.link}
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

        {/* Advanced Features Section */}
        <section className="py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                    {content.advancedFeaturesTitle}
                    </h2>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/70">
                    {content.advancedFeaturesDescription}
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {advancedFeatures.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4">
                        <div className="flex-shrink-0">{feature.icon}</div>
                        <div>
                        <h3 className="text-lg font-bold">{feature.title}</h3>
                        <p className="mt-1 text-foreground/70">{feature.description}</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </section>


      {/* Integrations Section */}
      <section id="integrations" className="bg-muted py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
              Integraciones de Pago
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/70">
              Conectado con los principales procesadores del país.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <Image src="/mercadopago.png" alt="Mercado Pago" width={150} height={40} className="h-10 w-auto" />
            <Image src="/fiserv.png" alt="Fiserv" width={120} height={40} className="h-10 w-auto" />
            <Image src="/clover.png" alt="Clover" width={140} height={40} className="h-10 w-auto" />
            <Image src="/payway.png" alt="Payway" width={130} height={40} className="h-10 w-auto" />
            <Image src="/pvs.png" alt="PVS SuperPOS" width={100} height={40} className="h-10 w-auto" />
            <Image src="/bind.png" alt="QR Bind" width={90} height={40} className="h-10 w-auto" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Descubrí cómo POSBerry puede simplificar tu gestión y potenciar tus ventas. ¡Hablemos!
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary" className="rounded-full text-lg px-8 py-6">
              <Link href="https://wa.me/5493564504977" target="_blank">
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                Consultanos
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
