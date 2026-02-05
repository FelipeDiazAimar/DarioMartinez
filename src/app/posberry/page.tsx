
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

const whyChooseFeatures = [
  {
    icon: <WifiOff className="h-10 w-10 text-primary" />,
    title: 'Siempre Operativo',
    description: 'Tu negocio nunca se detiene. POSBerry funciona perfectamente con o sin conexión a internet, garantizando 100% de disponibilidad para tus ventas.',
  },
  {
    icon: <Smile className="h-10 w-10 text-primary" />,
    title: 'Fácil de Usar',
    description: 'Interfaz intuitiva que tu equipo aprende en minutos. Sin complicaciones, solo resultados. Empezá a vender desde el primer día.',
  },
  {
    icon: <DollarSign className="h-10 w-10 text-primary" />,
    title: 'Precio Transparente',
    description: 'Un único precio mensual que incluye todo: actualizaciones, soporte y nuevas funcionalidades. Sin sorpresas, sin costos adicionales.',
  },
];

const coreFeatures = [
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Ventas Rápidas',
    description: 'Procesá ventas en segundos. Múltiples medios de pago, descuentos automáticos y gestión de devoluciones.',
    link: 'Ver integraciones de pago',
  },
  {
    icon: <ShoppingBag className="h-8 w-8" />,
    title: 'Control de Stock',
    description: 'Inventario en tiempo real. Alertas de stock bajo, múltiples depósitos y trazabilidad completa.',
    link: 'Ver capacidades avanzadas',
  },
  {
    icon: <LineChart className="h-8 w-8" />,
    title: 'Reportes Inteligentes',
    description: 'Dashboards en tiempo real. Análisis de ventas, productos más vendidos y proyecciones para tomar decisiones basadas en datos.',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Gestión de Clientes',
    description: 'CRM integrado. Historial de compras, cuentas corrientes y programa de fidelización para fidelizar a tus clientes.',
  },
  {
    icon: <Printer className="h-8 w-8" />,
    title: 'Facturación Electrónica ARCA',
    description: 'Totalmente integrado con ARCA. Facturas A, B, C, Notas de Crédito/Débito. Homologado y siempre actualizado.',
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: 'Multi-Sucursal',
    description: 'Gestión centralizada para escalar sin límites. Sincronización automática, reportes consolidados y control total.',
  },
];

const advancedFeatures = [
    {
      icon: <Cloud className="h-8 w-8 text-primary" />,
      title: 'Respaldo Automático',
      description: 'Cambiá de PC sin perder nada. Instalá POSBerry en cualquier equipo y tus datos se descargan automáticamente desde la nube.',
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: 'Integraciones de Pago',
      description: 'Conectado con los principales procesadores: Mercado Pago QR y Point, Fiserv, Clover, Payway, PVS-SuperPOS, y QR Bind.',
    },
    {
      icon: <Gift className="h-8 w-8 text-primary" />,
      title: 'Promociones Inteligentes',
      description: 'Creá esquemas de descuentos y recargos automáticos. Happy hours, descuentos por cantidad, promociones por día de la semana.',
    },
    {
      icon: <Printer className="h-8 w-8 text-primary" />,
      title: 'Impresiones Completas',
      description: 'Soporte total para tu negocio: Fiscales 1ra y 2da generación, códigos de barra, etiquetas de precios y comandas de cocina.',
    },
    {
        icon: <Lock className="h-8 w-8 text-primary" />,
        title: 'Seguridad Total',
        description: 'Tus datos siempre protegidos con backups periódicos automáticos, encriptación y sincronización segura en la nube.',
    },
    {
        icon: <Cpu className="h-8 w-8 text-primary" />,
        title: 'Gestión Avanzada',
        description: 'Control total de tu negocio con cierres de turno, control de cajas múltiples, y reportes detallados por vendedor.',
    },
  ];

export default function PosberryPage() {
  return (
    <div className="bg-white text-foreground">
      {/* Hero Section */}
      <section className="relative bg-white text-foreground py-20 md:py-32">
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-center lg:text-left">
              <Image src="/LOGOBOSBERRY3.png" alt="POSBerry Logo" width={200} height={50} className="mx-auto lg:mx-0"/>
              <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl font-headline">
                Simple, flexible y confiable
              </h1>
              <p className="max-w-2xl text-lg text-foreground/80 md:text-xl mx-auto lg:mx-0">
                Formá parte de una comunidad de más de 9,000 comercios exitosos. Funciona sin internet y se adapta a cualquier rubro.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" variant="secondary" className="rounded-full">
                  <Link href="https://wa.me/5493564504977?text=Hola,%20quisiera%20probar%20POSBerry%20gratis" target="_blank">
                    <WhatsAppIcon className="mr-2 h-5 w-5" />
                    Probar Gratis
                  </Link>
                </Button>
                <div className="flex items-center justify-center gap-2 text-sm text-foreground/90">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span>Sin tarjeta de crédito</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/POSBERRY2.png"
                alt="POSBerry en una computadora"
                width={600}
                height={450}
                className=""
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
              ¿Por qué los comercios eligen POSBerry?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/70">
              Las ventajas que impulsan tu negocio todos los días
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
              Todo lo que necesitás para vender más
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/70">
              Un sistema completo que se adapta a tu negocio
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
                    Potenciá tu Negocio
                    </h2>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-foreground/70">
                    Características avanzadas que marcan la diferencia
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
            <Image src="/integrations/mercado-pago.svg" alt="Mercado Pago" width={150} height={40} className="grayscale hover:grayscale-0 transition-all"/>
            <Image src="/integrations/fiserv.svg" alt="Fiserv" width={120} height={40} className="grayscale hover:grayscale-0 transition-all"/>
            <Image src="/integrations/clover.svg" alt="Clover" width={140} height={40} className="grayscale hover:grayscale-0 transition-all"/>
            <Image src="/integrations/payway.svg" alt="Payway" width={130} height={40} className="grayscale hover:grayscale-0 transition-all"/>
            <Image src="/integrations/pvs.svg" alt="PVS SuperPOS" width={100} height={40} className="grayscale hover:grayscale-0 transition-all"/>
            <Image src="/integrations/bind.svg" alt="QR Bind" width={90} height={40} className="grayscale hover:grayscale-0 transition-all"/>
          </div>
        </div>
      </section>

      {/* Pricing and CTA Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-4xl rounded-xl border bg-white p-8 text-center text-foreground shadow-2xl md:p-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Empezá hoy mismo
            </h2>
            <p className="mt-4 text-lg">
                Desde <span className="font-bold text-3xl">$42.000</span> /mes
            </p>
            <p className="mt-2 text-foreground/80">Usalo gratis hasta el 10 del próximo mes.</p>
            <Button asChild size="lg" variant="primary" className="mt-8 rounded-full px-12">
              <Link href="https://wa.me/5493564504977?text=Hola,%20quisiera%20más%20información%20sobre%20POSBerry" target="_blank">
                Contactar para más info
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
