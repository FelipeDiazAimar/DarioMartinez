'use client';

import Link from 'next/link';
import { Instagram, ArrowRight, Clock, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BrandLogo } from '@/components/brand-logo';
import { Magnet } from '@/components/react-bits';
import { WhatsAppIcon } from './icons/whatsapp-icon';
import { FacebookIcon } from './icons/facebook-icon';
import { MapsIcon } from './icons/maps-icon';
import { LiveOpenStatus } from './live-open-status';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabase-client';
import { DEFAULT_CONTACT_INFO, getSharedContactInfo } from '@/lib/site-data-cache';
import { trackEvent } from '@/lib/analytics-client';

const defaultContactInfo = DEFAULT_CONTACT_INFO;

const defaultMapEmbedUrl =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3381.562307297089!2d-62.08365612436735!3d-31.42616239707323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95cb281ee145b20b%3A0xc3b53f6194c25bd!2sLibertador%20Nte.%20163%2C%20San%20Francisco%2C%20C%C3%B3rdoba!5e0!3m2!1sen!2sar!4v1721759868770!5m2!1sen!2sar';

const defaultFaqs = [
  {
    question: '¿Qué medios de pago aceptan?',
    answer:
      'Aceptamos efectivo, transferencia bancaria, tarjetas de débito y crédito. También podés pagar a través de Mercado Pago.',
  },
  {
    question: '¿Hacen envíos a domicilio?',
    answer:
      'Sí, realizamos envíos a domicilio en San Francisco y la zona. Consultanos por los costos y tiempos de entrega.',
  },
  {
    question: '¿Cuál es el horario de atención?',
    answer:
      'Nuestro horario de atención de Lunes a Jueves es de 7:30 a 12:30 y de 15:30 a 19:30 hs. Los Viernes es de 8:00 a 12:00 y de 15:30 a 19:30 hs. Los sábados el local permanece cerrado.',
  },
  {
    question: '¿Ofrecen garantía por las reparaciones?',
    answer:
      'Sí, todas nuestras reparaciones cuentan con una garantía de 90 días. La garantía cubre la mano de obra y los repuestos utilizados.',
  },
  {
    question: '¿Cuánto tiempo suelen tardar las reparaciones?',
    answer:
      'El tiempo de reparación varía según la complejidad del problema y la disponibilidad de repuestos. Para diagnósticos y reparaciones sencillas, el plazo suele ser de 24 a 72 horas. Si se requiere un repuesto específico, te informaremos el tiempo estimado de llegada.',
  },
  {
    question: '¿Es necesario que lleve mi equipo al local?',
    answer:
      'Para la mayoría de las reparaciones de hardware, sí es necesario que traigas el equipo a nuestro taller para un diagnóstico preciso. Para problemas de software o configuración, ofrecemos servicio de asistencia remota. ¡Contactanos y vemos la mejor opción para tu caso!',
  },
];

export function Footer({ forceShow }: { forceShow?: boolean } = {}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [faqs, setFaqs] = useState(defaultFaqs);

  useEffect(() => {
    const loadFooterData = async () => {
      const [contact, faqsRes] = await Promise.all([
        getSharedContactInfo(),
        supabase.from('preguntas_frecuentes').select('pregunta, respuesta').order('orden', { ascending: true }).limit(24),
      ]);

      setContactInfo(contact);

      if (faqsRes.data && faqsRes.data.length > 0) {
        const seen = new Set<string>();
        const uniqueFaqs: Array<{ question: string; answer: string }> = [];
        for (const item of faqsRes.data as Array<{ pregunta?: string; respuesta?: string }>) {
          const q = String(item.pregunta || '').trim().replace(/\?s$/i, '?');
          const a = String(item.respuesta || '').trim();
          if (!q || !a) continue;
          const key = q
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\bs$/g, '')
            .trim();
          if (seen.has(key)) continue;
          seen.add(key);
          uniqueFaqs.push({ question: q, answer: a });
          if (uniqueFaqs.length >= 6) break;
        }
        if (uniqueFaqs.length > 0) {
          setFaqs(uniqueFaqs);
        }
      }
    };

    loadFooterData();
  }, []);

  const whatsappLink = useMemo(
    () => `https://wa.me/${(contactInfo.whatsapp || '').replace(/\D/g, '')}`,
    [contactInfo.whatsapp]
  );

  const mapEmbedUrl = useMemo(() => {
    if (contactInfo.google_maps?.includes('google.com/maps/embed')) {
      return contactInfo.google_maps;
    }
    return defaultMapEmbedUrl;
  }, [contactInfo.google_maps]);

  if ((isAdmin || pathname === '/admin-login') && !forceShow) {
    return null;
  }

  return (
    <footer className="bg-brand-footer w-full border-t border-border text-foreground">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Columna Identidad + Contacto */}
          <div className="space-y-6 lg:col-span-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="inline-flex items-center transition-transform duration-300 ease-expo hover:scale-[1.03]">
                <BrandLogo size="xl" />
              </Link>
              <LiveOpenStatus compact />
            </div>

            <p className="max-w-md text-sm leading-relaxed text-foreground/75">
              Tu aliado en soluciones tecnológicas desde hace más de 50 años.
            </p>

            <div className="grid gap-4 rounded-2xl border border-primary/12 bg-white/95 p-5 shadow-sm sm:grid-cols-2">
              <div className="space-y-1.5 text-sm">
                <h4 className="flex items-center gap-2 font-headline text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Horarios de atención
                </h4>
                <p className="leading-snug text-foreground/75">{contactInfo.hours_mon_thu}</p>
                <p className="leading-snug text-foreground/75">{contactInfo.hours_fri}</p>
                <p className="text-foreground/60">Sábados: Cerrado</p>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="flex items-center gap-2 font-headline text-sm font-semibold text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  Contacto directo
                </h4>
                <p>
                  <a
                    href={`tel:${(contactInfo.phone || '').replace(/\s/g, '')}`}
                    className="font-mono text-xs text-foreground/80 transition-colors hover:text-primary tabular-nums"
                  >
                    Tel: {contactInfo.phone}
                  </a>
                </p>
                <p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('whatsapp_click', { label: 'Footer Phone Link' })}
                    className="font-mono text-xs text-foreground/80 transition-colors hover:text-primary tabular-nums"
                  >
                    WA: {contactInfo.whatsapp}
                  </a>
                </p>
                <p className="truncate">
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="inline-flex items-center gap-1.5 text-xs text-foreground/80 transition-colors hover:text-primary"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{contactInfo.email}</span>
                  </a>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Magnet strength={0.2}>
                <Button asChild variant="whatsapp" className="rounded-full px-5">
                  <Link
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('whatsapp_click', { label: 'Footer Button' })}
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Enviar Mensaje
                  </Link>
                </Button>
              </Magnet>

              <Magnet strength={0.2}>
                <Button asChild variant="instagram" className="rounded-full px-5">
                  <Link
                    href={contactInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    onClick={() => trackEvent('social_click', { label: 'Instagram Footer' })}
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Link>
                </Button>
              </Magnet>

              <div className="flex items-center gap-2">
                <Link
                  href={contactInfo.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  onClick={() => trackEvent('social_click', { label: 'Facebook Footer' })}
                  className="rb-glare rb-facebook-btn relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-primary/15 bg-white text-foreground/80"
                >
                  <FacebookIcon className="h-4 w-4" />
                </Link>
                <Link
                  href={contactInfo.google_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Maps"
                  onClick={() => trackEvent('social_click', { label: 'Google Maps Footer' })}
                  className="rb-pill-interactive grid h-10 w-10 place-items-center rounded-full border border-primary/15 bg-white text-foreground/80 hover:border-primary hover:bg-primary hover:text-white"
                >
                  <MapsIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Columna FAQs */}
          <div className="lg:col-span-7">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="font-headline text-xl font-bold tracking-tight">
                <Link href="/preguntas-frecuentes" className="transition-colors hover:text-primary">
                  Preguntas Frecuentes
                </Link>
              </h3>
              <Link
                href="/preguntas-frecuentes"
                className="rb-pill-interactive inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-primary hover:border-primary/45 hover:bg-[#EEF4FF]"
              >
                Ver todas
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <Accordion
              type="single"
              collapsible
              className="w-full divide-y divide-border rounded-2xl border border-primary/12 bg-white/95 px-5 shadow-sm"
            >
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-b-0">
                  <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary hover:no-underline sm:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-foreground/75">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Mapa de ubicación */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-primary/12 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h3 className="font-headline text-base font-bold">Encontranos en San Francisco</h3>
            <Link
              href={contactInfo.google_maps}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('social_click', { label: 'Google Maps Address' })}
              className="rb-pill-interactive inline-flex items-center gap-2 rounded-full border border-primary/15 bg-[#F4F8FF] px-3.5 py-1.5 text-xs font-semibold text-primary hover:border-primary/45 hover:bg-[#E8F0FF]"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{contactInfo.address}</span>
            </Link>
          </div>
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="320"
            style={{ border: 0, display: 'block' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación en Libertador Norte 163"
          />
        </div>
      </div>

      {/* Barra inferior con glowup y espacio libre garantizado para que WhatsApp nunca tape nada */}
      <div
        id="footer-bottom-bar"
        className="border-t border-primary/12 bg-gradient-to-r from-[#0B1733] via-[#0E1E42] to-[#0B1733] text-white/85"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 pb-20 pt-6 text-xs sm:flex-row sm:px-6 sm:pb-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <p className="text-white/75" suppressHydrationWarning>
              © {new Date().getFullYear()} Darío Martínez Computación. Todos los derechos reservados.
            </p>
            <span className="hidden text-white/25 sm:inline" aria-hidden="true">
              •
            </span>
            {/* Acceso interno ubicado en el bloque izquierdo como pill interactivo — imposible de quedar tapado */}
            <Link
              href="/admin-login"
              className="rb-glare rb-pill-interactive relative inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:border-white/45 hover:bg-white/20"
              aria-label="Acceso administración"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              <span>Acceso interno</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 lg:pr-40">
            {[
              { href: '/servicios', label: 'Servicio Técnico' },
              { href: '/productos', label: 'Productos' },
              { href: '/posberry', label: 'Posberry' },
              { href: '/controladores-fiscales', label: 'Fiscales' },
              { href: '/contacto', label: 'Contacto' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rb-pill-interactive rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:border-white/30 hover:bg-white/15 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
