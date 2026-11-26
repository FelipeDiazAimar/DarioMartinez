'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Truck,
  Clock,
  ShieldQuestion,
  Wrench,
  Package,
  Laptop,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { Magnet } from '@/components/react-bits';
import { FaqListSkeleton } from '@/components/skeletons';
import { supabase } from '@/lib/supabase-client';
import { trackEvent } from '@/lib/analytics-client';

const faqIconList = [
  CreditCard,
  Truck,
  Clock,
  ShieldQuestion,
  Wrench,
  Package,
  Laptop,
  AlertTriangle,
];

const allFaqs = [
  {
    question: '¿Qué medios de pago aceptan?',
    answer:
      'Aceptamos efectivo, transferencia bancaria, Mercado Pago (con QR en el local), y tarjetas de débito y crédito. Podés consultar por planes de financiación.',
  },
  {
    question: '¿Hacen envíos a domicilio?',
    answer:
      'Sí, realizamos envíos a domicilio en San Francisco y la zona para la entrega de productos. Para el servicio técnico, ofrecemos la opción de retirar equipos a domicilio. Consultanos por los costos y la disponibilidad.',
  },
  {
    question: '¿Cuál es el horario de atención?',
    answer:
      'Nuestro horario de atención de Lunes a Jueves es de 7:30 a 12:30 y de 15:30 a 19:30 hs. Los Viernes es de 8:00 a 12:00 y de 15:30 a 19:30 hs. Los sábados el local permanece cerrado.',
  },
  {
    question: '¿Ofrecen garantía por las reparaciones?',
    answer:
      'Sí, todas nuestras reparaciones de hardware cuentan con una garantía de 90 días que cubre tanto la mano de obra como los repuestos utilizados. La garantía no cubre problemas de software o fallas causadas por mal uso.',
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
  {
    question: '¿Trabajan con todas las marcas de notebooks y PC?',
    answer:
      'Sí, trabajamos con la gran mayoría de las marcas del mercado, como HP, Dell, Lenovo, Acer, Asus, Apple (MacBook/iMac), entre otras. Nuestra experiencia nos permite diagnosticar y reparar una amplia gama de modelos.',
  },
  {
    question: '¿Qué pasa si mi equipo no tiene arreglo o es muy caro repararlo?',
    answer:
      'La transparencia es uno de nuestros pilares. Si durante el diagnóstico determinamos que la reparación no es viable o su costo es antieconómico, te informaremos detalladamente las razones y te asesoraremos sobre las mejores alternativas, como la compra de un equipo nuevo o reacondicionado, sin ningún compromiso.',
  },
];

export default function FaqPage() {
  const [faqs, setFaqs] = React.useState(allFaqs);
  const [isLoadingFaqs, setIsLoadingFaqs] = React.useState(true);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const loadFaqs = async () => {
      try {
        const { data } = await supabase
          .from('preguntas_frecuentes')
          .select('*')
          .order('orden', { ascending: true });

        if (data && data.length > 0) {
          const seen = new Set<string>();
          const unique: Array<{ question: string; answer: string }> = [];
          for (const item of data as Array<{ pregunta?: string; respuesta?: string }>) {
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
            unique.push({ question: q, answer: a });
          }
          if (unique.length > 0) {
            setFaqs(unique);
          }
        }
      } finally {
        setIsLoadingFaqs(false);
      }
    };

    loadFaqs();
  }, []);

  const filteredFaqs = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [faqs, query]);

  return (
    <div className="w-full bg-background text-foreground">
      <section className="bg-brand-soft w-full border-b border-border py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-headline text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            Preguntas Frecuentes
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/75 md:text-lg">
            Encontrá respuestas a las dudas más comunes sobre nuestros servicios y productos. Si no encontrás lo que buscás, no dudes en contactarnos.
          </p>

          <div className="relative mt-8 max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar una duda (ej: garantía, envíos, horarios...)"
              className="h-12 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-14 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {isLoadingFaqs ? (
            <FaqListSkeleton count={6} />
          ) : filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No encontramos preguntas que coincidan con “{query}”.
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link
                  href={`https://wa.me/5493564504977?text=${encodeURIComponent(`Hola, tengo una consulta sobre: ${query}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="mr-2 h-4 w-4" />
                  Preguntar por WhatsApp
                </Link>
              </Button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredFaqs.map((faq, index) => {
                const Icon = faqIconList[index % faqIconList.length];
                return (
                  <AccordionItem
                    value={`item-${index}`}
                    key={`${faq.question}-${index}`}
                    className="overflow-hidden rounded-2xl border border-border bg-background transition-colors data-[state=open]:border-primary/40"
                  >
                    <AccordionTrigger className="flex w-full items-center gap-4 px-5 py-5 text-left text-base font-semibold hover:bg-surface/60 hover:no-underline sm:px-6 sm:text-lg">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="flex-1">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="border-t border-border bg-surface/40 px-5 py-5 text-sm leading-relaxed text-foreground/80 sm:px-6 sm:pl-[76px] sm:text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          <div className="bg-brand-cobalt mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 p-6 text-primary-foreground sm:flex-row sm:p-8">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="font-headline text-xl font-bold text-white">¿Te quedó alguna otra consulta?</h2>
              <p className="text-sm text-white/80">
                Escribinos directo por WhatsApp y te respondemos en horario comercial.
              </p>
            </div>
            <Magnet strength={0.2}>
              <Button asChild variant="whatsapp" size="lg" className="shrink-0 rounded-full px-7">
                <Link
                  href="https://wa.me/5493564504977"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_click', { label: 'FAQ Bottom CTA' })}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Escribir por WhatsApp
                </Link>
              </Button>
            </Magnet>
          </div>
        </div>
      </section>
    </div>
  );
}
