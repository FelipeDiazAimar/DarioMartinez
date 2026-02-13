'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Zap, TrendingUp, Calculator, Receipt, ArrowRight } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

export default function ControladoresFiscalesPage() {
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1 });
  const [modelsRef, modelsInView] = useInView({ threshold: 0.1 });
  const [benefitsRef, benefitsInView] = useInView({ threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.1 });

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Cumplimiento AFIP',
      description: 'Equipos homologados que garantizan el cumplimiento de todas las normativas fiscales vigentes.',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Alta Velocidad',
      description: 'Procesamiento rápido de transacciones para optimizar el flujo de trabajo en tu comercio.',
    },
    {
      icon: <Receipt className="h-8 w-8" />,
      title: 'Reportes Detallados',
      description: 'Generación automática de reportes Z, X y diarios para un control preciso de tus ventas.',
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: 'Cálculos Automáticos',
      description: 'Cálculo automático de impuestos, descuentos y totales para evitar errores humanos.',
    },
  ];

  const models = [
    {
      name: 'Controlador Fiscal Básico',
      image: 'fiscal-printer',
      price: 'Desde $150.000',
      features: ['Impresión térmica', 'Memoria fiscal', 'Conectividad USB', 'Garantía 2 años'],
      popular: false,
    },
    {
      name: 'Controlador Fiscal Avanzado',
      image: 'ticket-printer',
      price: 'Desde $250.000',
      features: ['Doble impresora', 'Lector de códigos', 'Pantalla táctil', 'Soporte remoto', 'Garantía 3 años'],
      popular: true,
    },
    {
      name: 'Controlador Fiscal Premium',
      image: 'cash-registers',
      price: 'Desde $400.000',
      features: ['Sistema completo', 'Integración POS', 'Múltiples periféricos', 'Capacitación incluida', 'Garantía 5 años'],
      popular: false,
    },
  ];

  const benefits = [
    'Reducción de errores en facturación',
    'Cumplimiento automático con AFIP',
    'Ahorro de tiempo en reportes',
    'Mayor control de inventario',
    'Integración con sistemas existentes',
    'Soporte técnico especializado',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
        <div className="container px-4 md:px-6">
          <div className={cn("flex flex-col items-center justify-center space-y-4 text-center opacity-0", heroInView && "animate-fade-in")}>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                Tecnología Fiscal Avanzada
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Controladores Fiscales
              </h1>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Soluciones de control fiscal homologadas por AFIP para garantizar el cumplimiento y optimizar la gestión de tu negocio.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="rounded-full">
                <Link href="https://wa.me/5493564504977" target="_blank">
                  Consultar Precios
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full">
                <Link href="/contacto">
                  Solicitar Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className={cn("flex flex-col items-center justify-center space-y-4 text-center opacity-0", featuresInView && "animate-fade-in")}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Características Principales
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Tecnología de vanguardia para el control fiscal de tu empresa.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className={cn("opacity-0", featuresInView && "animate-slide-in-from-bottom")} style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section ref={modelsRef} className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className={cn("flex flex-col items-center justify-center space-y-4 text-center opacity-0", modelsInView && "animate-fade-in")}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                Modelos Disponibles
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Encuentra el controlador fiscal perfecto para tu negocio.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            {models.map((model, index) => (
              <Card key={index} className={cn("relative opacity-0", modelsInView && "animate-slide-in-from-bottom", model.popular && "border-primary")} style={{ animationDelay: `${index * 150}ms` }}>
                {model.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={`https://picsum.photos/seed/${model.image}/256/256`}
                      alt={model.name}
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl">{model.name}</CardTitle>
                  <div className="text-2xl font-bold text-primary">{model.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {model.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-4 w-full rounded-full" asChild>
                    <Link href="https://wa.me/5493564504977" target="_blank">
                      Consultar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className={cn("opacity-0", benefitsInView && "animate-slide-in-from-left")}>
              <Image
                src="https://picsum.photos/seed/fiscal-control/600/400"
                alt="Control Fiscal"
                width={600}
                height={400}
                className="aspect-video rounded-lg object-cover"
              />
            </div>
            <div className={cn("space-y-4 opacity-0", benefitsInView && "animate-slide-in-from-right")}>
              <div className="space-y-2">
                <Badge variant="secondary">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Beneficios
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  ¿Por qué elegir nuestros controladores fiscales?
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Optimiza tu negocio con soluciones fiscales confiables y eficientes.
                </p>
              </div>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="rounded-full">
                <Link href="/contacto">
                  Más Información
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className={cn("flex flex-col items-center justify-center space-y-4 text-center opacity-0", ctaInView && "animate-fade-in")}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                ¿Listo para modernizar tu control fiscal?
              </h2>
              <p className="max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Contactanos hoy mismo y descubre cómo nuestros controladores fiscales pueden impulsar tu negocio.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link href="https://wa.me/5493564504977" target="_blank">
                  WhatsApp
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href="/contacto">
                  Contacto
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}