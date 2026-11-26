'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Award,
  BrainCircuit,
  Handshake,
  Shield,
  Search,
  Wrench,
  Eye,
  Heart,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingImage } from '@/components/loading-image';
import { BrandLogo } from '@/components/brand-logo';
import { ScrollReveal } from '@/components/scroll-reveal';
import { LiveOpenStatus } from '@/components/live-open-status';
import { AuroraBackdrop, CountUp, Magnet, SpotlightCard } from '@/components/react-bits';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { supabase } from '@/lib/supabase-client';
import { trackEvent } from '@/lib/analytics-client';

const defaultAboutContent = {
  titulo: 'Casi 50 Años de Confianza y Tecnología',
  descripcion:
    'Darío Martínez Computación nace en San Francisco con un objetivo claro: brindar soluciones reales y confiables. Hemos acompañado la evolución tecnológica desde sus inicios, consolidándonos como un referente de seriedad y conocimiento técnico en la región.',
  historia:
    'Cada cliente y cada equipo es único. Por eso, nuestro proceso se basa en la escucha, el análisis detallado y la búsqueda de la solución más eficiente y duradera. No aplicamos recetas, resolvemos problemas.',
};

const workflowSteps = [
  {
    icon: Search,
    title: 'Diagnóstico Preciso',
    description:
      'Nos tomamos el tiempo para entender el problema a fondo, realizando todas las pruebas necesarias para dar con la causa raíz de la falla.',
  },
  {
    icon: Wrench,
    title: 'Soluciones a Medida',
    description:
      'Te explicamos las opciones disponibles y te recomendamos la mejor alternativa en función de tu necesidad y presupuesto, ya sea una reparación, actualización o un equipo nuevo.',
  },
  {
    icon: Eye,
    title: 'Transparencia Total',
    description:
      'Hablamos en un lenguaje claro, sin tecnicismos innecesarios. Siempre sabrás qué se va a hacer, por qué y cuál es el costo, sin sorpresas.',
  },
  {
    icon: Heart,
    title: 'Compromiso Post-Venta',
    description:
      'Nuestro trabajo no termina con la entrega. Ofrecemos garantía y estamos a tu disposición para resolver cualquier duda o inconveniente posterior.',
  },
];

const pillars = [
  { icon: Award, label: 'Experiencia' },
  { icon: BrainCircuit, label: 'Conocimiento' },
  { icon: Handshake, label: 'Atención Cercana' },
  { icon: Shield, label: 'Confianza' },
];

export default function SobreNosotrosPage() {
  const [aboutContent, setAboutContent] = React.useState(defaultAboutContent);

  React.useEffect(() => {
    const loadAboutContent = async () => {
      const { data } = await supabase
        .from('sobre_nosotros')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (data) {
        setAboutContent({
          ...defaultAboutContent,
          titulo: data.titulo || defaultAboutContent.titulo,
          descripcion: data.descripcion || defaultAboutContent.descripcion,
          historia: data.historia || defaultAboutContent.historia,
        });
      }
    };

    loadAboutContent();
  }, []);

  return (
    <div className="w-full bg-background text-foreground">
      {/* Encabezado editorial con presencia visual real y evolución de marca */}
      <section className="bg-brand-hero relative w-full overflow-hidden border-b border-border py-16 lg:py-24">
        <AuroraBackdrop variant="light" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <LiveOpenStatus />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/85 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  San Francisco, Córdoba
                </span>
              </div>

              <h1 className="font-headline text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {aboutContent.titulo}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-foreground/75 md:text-xl">
                {aboutContent.descripcion}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Magnet strength={0.2}>
                  <Button asChild variant="whatsapp" size="lg" className="h-12 rounded-full px-7">
                    <Link
                      href="https://wa.me/5493564504977?text=Hola%2C%20quiero%20hacerles%20una%20consulta."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('whatsapp_click', { label: 'Sobre Nosotros Hero' })}
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      Escribinos por WhatsApp
                    </Link>
                  </Button>
                </Magnet>
                <Magnet strength={0.18}>
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-full bg-white/90 px-7">
                    <Link href="/productos">
                      Explorar catálogo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Magnet>
              </div>
            </div>

            {/* Tarjeta de trayectoria y evolución de marca en el Hero */}
            <div className="lg:col-span-5">
              <SpotlightCard
                spotlightColor="rgba(120, 175, 255, 0.25)"
                className="bg-brand-cobalt rounded-3xl border border-primary/20 p-6 text-white shadow-[0_24px_56px_-22px_rgba(0,48,143,0.45)] sm:p-7"
              >
                <div className="relative z-20 space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                      Historia y evolución
                    </span>
                    <span className="font-mono text-xs text-emerald-300">Desde hace ~50 años</span>
                  </div>

                  {/* Evolución visual del logo sobre lienzo limpio */}
                  <div className="flex items-center justify-center gap-4 rounded-2xl bg-white px-5 py-6 shadow-inner sm:gap-6">
                    <img
                      src="/LOGO3.png"
                      alt="Logo histórico de Darío Martínez Computación"
                      className="h-16 w-auto object-contain sm:h-20"
                    />
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EEF4FF] text-primary">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                    <BrandLogo size="md" align="center" />
                  </div>

                  {/* Indicadores reales animados */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-3 backdrop-blur-sm">
                      <p className="font-headline text-lg font-extrabold text-white">
                        <CountUp to={50} prefix="~" />
                      </p>
                      <p className="mt-0.5 text-xs text-white/75">Años de oficio</p>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-3 backdrop-blur-sm">
                      <p className="font-headline text-lg font-extrabold text-white">
                        <CountUp to={35} prefix="+" />
                      </p>
                      <p className="mt-0.5 text-xs text-white/75">Localidades</p>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-3 backdrop-blur-sm">
                      <p className="font-headline text-lg font-extrabold text-emerald-300">
                        <CountUp to={90} suffix="d" />
                      </p>
                      <p className="mt-0.5 text-xs text-white/75">Garantía taller</p>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* Cuerpo editorial */}
      <section id="sobre-nosotros" className="bg-brand-mist w-full py-16 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            <div className="space-y-14 lg:col-span-7">
              <ScrollReveal>
                <div className="space-y-4">
                  <h2 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl">
                    Nuestra Forma de Trabajar
                  </h2>
                  <p className="text-base leading-relaxed text-foreground/75">{aboutContent.historia}</p>
                </div>

                <div className="mt-8 space-y-3">
                  {workflowSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <SpotlightCard
                        key={step.title}
                        spotlightColor="rgba(0, 48, 143, 0.12)"
                        className="rounded-2xl border border-primary/12 bg-white shadow-xs transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                      >
                        <div className="relative z-20 flex items-start gap-4 p-6">
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/14 to-accent/5 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-headline text-lg font-bold">{step.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </SpotlightCard>
                    );
                  })}
                </div>
              </ScrollReveal>

              {/* Evolución de marca */}
              <ScrollReveal>
                <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-[#F5F8FF] to-[#EBF2FE] p-6 sm:p-8">
                  <h2 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl">
                    Nuestra Evolución
                  </h2>
                  <p className="mt-2 text-base text-foreground/75">
                    Adaptándonos a los nuevos tiempos, sin perder la esencia.
                  </p>
                  <div className="mt-8 flex flex-row items-center justify-center gap-6 rounded-xl border border-border bg-white p-6 shadow-xs sm:gap-10">
                    <img
                      src="/LOGO3.png"
                      alt="Logo histórico de Darío Martínez Computación"
                      className="h-20 w-auto object-contain sm:h-28"
                    />
                    <ArrowRight className="h-7 w-7 shrink-0 text-primary sm:h-10 sm:w-10" />
                    <BrandLogo size="lg" align="center" />
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Columna derecha fija */}
            <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-md">
                <LoadingImage
                  src="/FOTOFRENTE.jpeg"
                  alt="Frente del local Darío Martínez Computación"
                  width={600}
                  height={720}
                  priority
                  className="aspect-[4/5] w-full object-cover object-center"
                />
              </div>

              <div className="rounded-2xl border border-primary/12 bg-white p-6 shadow-xs">
                <h3 className="font-headline text-lg font-bold">Nuestros Pilares</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {pillars.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <SpotlightCard
                        key={pillar.label}
                        spotlightColor="rgba(0, 48, 143, 0.14)"
                        className="rounded-xl border border-primary/12 bg-gradient-to-b from-white to-[#F4F8FF] p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
                      >
                        <div className="relative z-20 flex flex-col items-center gap-2">
                          <Icon className="h-6 w-6 text-primary" />
                          <p className="text-sm font-semibold text-foreground">{pillar.label}</p>
                        </div>
                      </SpotlightCard>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-[#F4F8FF] to-[#EAF1FE] p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 font-headline text-lg font-bold">
                    <Clock className="h-5 w-5 text-primary" />
                    Nuestros Horarios
                  </h3>
                  <LiveOpenStatus compact />
                </div>
                <div className="mt-4 space-y-2.5 text-sm text-foreground/80">
                  <p>
                    <span className="font-semibold text-foreground">Lunes a Jueves:</span> 7:30 a 12:30 y 15:30 a 19:30 hs.
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Viernes:</span> 8:00 a 12:00 y 15:30 a 19:30 hs.
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Sábados:</span> Cerrado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
