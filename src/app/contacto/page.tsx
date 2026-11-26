'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ContactForm } from '@/components/contact-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Instagram, Mail, MapPin, Phone, Clock, Building2 } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { MapsIcon } from '@/components/icons/maps-icon';
import { LiveOpenStatus } from '@/components/live-open-status';
import { BrandLogo } from '@/components/brand-logo';
import { ScrollReveal } from '@/components/scroll-reveal';
import { DEFAULT_CONTACT_INFO, getSharedContactInfo } from '@/lib/site-data-cache';
import { trackEvent } from '@/lib/analytics-client';

const defaultContactInfo = DEFAULT_CONTACT_INFO;

export default function ContactoPage() {
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    getSharedContactInfo().then(setContactInfo);
  }, []);

  const whatsappLink = useMemo(
    () => `https://wa.me/${(contactInfo.whatsapp || '').replace(/\D/g, '')}`,
    [contactInfo.whatsapp]
  );

  const businessMailLink = useMemo(() => {
    const company = businessName.trim();
    const companySuffix = company ? ` - ${company}` : '';
    const subject = `Consulta empresarial${companySuffix}`;
    const body = company
      ? `Hola, somos ${company} y queremos recibir asesoramiento comercial.`
      : 'Hola, somos una empresa y queremos recibir asesoramiento comercial.';
    const safeEmail = (contactInfo.email || defaultContactInfo.email).trim();

    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: safeEmail,
      su: subject,
      body,
    });

    return `https://mail.google.com/mail/?${params.toString()}`;
  }, [businessName, contactInfo.email]);

  return (
    <div className="w-full bg-background text-foreground">
      <section className="bg-brand-soft w-full border-b border-border py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-4">
              <LiveOpenStatus />
              <h1 className="font-headline text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
                Contactanos sin compromiso
              </h1>
              <p className="text-base leading-relaxed text-foreground/75 md:text-lg">
                ¿Tenés alguna duda o necesitás un presupuesto? Completá el formulario o envianos un WhatsApp.
              </p>
            </div>
            <BrandLogo size="lg" className="hidden md:inline-flex" />
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-brand-mist w-full py-16 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Formulario principal */}
            <ScrollReveal direction="left" className="lg:col-span-7">
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <h2 className="font-headline text-2xl font-bold">Envianos tu consulta</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Tu consulta es bienvenida. ¡Respondemos a la brevedad!
                </p>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </div>
            </ScrollReveal>

            {/* Canales directos y contacto empresarial */}
            <ScrollReveal direction="right" className="space-y-6 lg:col-span-5">
              {/* Bloque empresas / email */}
              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-headline text-xl font-bold">¿Sos una empresa o comercio?</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O si preferís escribirnos directamente por mail para cotizaciones formales.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <Input
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="Nombre de tu empresa o comercio"
                    className="h-11 rounded-xl bg-surface"
                  />
                  <Button asChild size="lg" variant="outline" className="h-11 w-full rounded-full">
                    <a
                      href={businessMailLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('social_click', { label: 'Email Empresarial' })}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar mail comercial
                    </a>
                  </Button>
                </div>
              </div>

              {/* Datos del local */}
              <div className="divide-y divide-border rounded-2xl border border-border bg-background">
                <div className="flex items-start gap-3.5 p-5">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Dirección</p>
                    <Link
                      href={contactInfo.google_maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary hover:underline"
                    >
                      {contactInfo.address} — San Francisco, Córdoba
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-5">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-foreground">Teléfonos</p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                      Tel: {contactInfo.phone}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                      WhatsApp: {contactInfo.whatsapp}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-5">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-foreground">Horarios</p>
                    <p className="text-muted-foreground">{contactInfo.hours_mon_thu}</p>
                    <p className="text-muted-foreground">{contactInfo.hours_fri}</p>
                    <p className="text-muted-foreground">Sábados: Cerrado</p>
                  </div>
                </div>
              </div>

              {/* Redes sociales */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Button asChild variant="whatsapp" className="rounded-full px-5">
                  <Link
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('whatsapp_click', { label: 'Contacto Page Button' })}
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    WhatsApp
                  </Link>
                </Button>
                <Button asChild variant="instagram" className="rounded-full px-5">
                  <Link
                    href={contactInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    onClick={() => trackEvent('social_click', { label: 'Instagram Contacto' })}
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Link>
                </Button>
                <Link
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  onClick={() => trackEvent('social_click', { label: 'Facebook Contacto' })}
                  className="rb-glare rb-facebook-btn relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-primary/15 bg-white text-foreground/80"
                >
                  <FacebookIcon className="h-4 w-4" />
                </Link>
                <Link
                  href={contactInfo.google_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Maps"
                  onClick={() => trackEvent('social_click', { label: 'Maps Contacto' })}
                  className="rb-pill-interactive grid h-10 w-10 place-items-center rounded-full border border-primary/15 bg-white text-foreground/80 hover:border-primary hover:bg-primary hover:text-white"
                >
                  <MapsIcon className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
