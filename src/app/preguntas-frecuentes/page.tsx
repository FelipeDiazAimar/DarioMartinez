'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CreditCard, Truck, Clock, ShieldQuestion, Wrench, Package, Laptop, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

const allFaqs = [
  {
    question: '¿Qué medios de pago aceptan?',
    answer: 'Aceptamos efectivo, transferencia bancaria, Mercado Pago (con QR en el local), y tarjetas de débito y crédito. Podés consultar por planes de financiación.',
    icon: <CreditCard className="h-6 w-6 text-primary" />,
  },
  {
    question: '¿Hacen envíos a domicilio?',
    answer: 'Sí, realizamos envíos a domicilio en San Francisco y la zona para la entrega de productos. Para el servicio técnico, ofrecemos la opción de retirar equipos a domicilio. Consultanos por los costos y la disponibilidad.',
    icon: <Truck className="h-6 w-6 text-primary" />,
  },
  {
    question: '¿Cuál es el horario de atención?',
    answer: 'Nuestro horario de atención de Lunes a Jueves es de 7:30 a 12:30 y de 15:30 a 19:30 hs. Los Viernes es de 8:00 a 12:00 y de 15:30 a 19:30 hs. Los sábados el local permanece cerrado.',
    icon: <Clock className="h-6 w-6 text-primary" />,
  },
  {
    question: '¿Ofrecen garantía por las reparaciones?',
    answer: 'Sí, todas nuestras reparaciones de hardware cuentan con una garantía de 90 días que cubre tanto la mano de obra como los repuestos utilizados. La garantía no cubre problemas de software o fallas causadas por mal uso.',
    icon: <ShieldQuestion className="h-6 w-6 text-primary" />,
  },
  {
    question: '¿Cuánto tiempo suelen tardar las reparaciones?',
    answer: 'El tiempo de reparación varía según la complejidad del problema y la disponibilidad de repuestos. Para diagnósticos y reparaciones sencillas, el plazo suele ser de 24 a 72 horas. Si se requiere un repuesto específico, te informaremos el tiempo estimado de llegada.',
    icon: <Wrench className="h-6 w-6 text-primary" />,
  },
  {
    question: '¿Es necesario que lleve mi equipo al local?',
    answer: 'Para la mayoría de las reparaciones de hardware, sí es necesario que traigas el equipo a nuestro taller para un diagnóstico preciso. Para problemas de software o configuración, ofrecemos servicio de asistencia remota. ¡Contactanos y vemos la mejor opción para tu caso!',
    icon: <Package className="h-6 w-6 text-primary" />,
  },
  {
    question: '¿Trabajan con todas las marcas de notebooks y PC?',
    answer: 'Sí, trabajamos con la gran mayoría de las marcas del mercado, como HP, Dell, Lenovo, Acer, Asus, Apple (MacBook/iMac), entre otras. Nuestra experiencia nos permite diagnosticar y reparar una amplia gama de modelos.',
    icon: <Laptop className="h-6 w-6 text-primary" />,
  },
  {
    question: '¿Qué pasa si mi equipo no tiene arreglo o es muy caro repararlo?',
    answer: 'La transparencia es uno de nuestros pilares. Si durante el diagnóstico determinamos que la reparación no es viable o su costo es antieconómico, te informaremos detalladamente las razones y te asesoraremos sobre las mejores alternativas, como la compra de un equipo nuevo o reacondicionado, sin ningún compromiso.',
    icon: <AlertTriangle className="h-6 w-6 text-primary" />,
  },
];

const faqIcons = [
  <CreditCard className="h-6 w-6 text-primary" />,
  <Truck className="h-6 w-6 text-primary" />,
  <Clock className="h-6 w-6 text-primary" />,
  <ShieldQuestion className="h-6 w-6 text-primary" />,
  <Wrench className="h-6 w-6 text-primary" />,
  <Package className="h-6 w-6 text-primary" />,
  <Laptop className="h-6 w-6 text-primary" />,
  <AlertTriangle className="h-6 w-6 text-primary" />,
];

export default function FaqPage() {
  const [faqs, setFaqs] = React.useState(allFaqs);

  React.useEffect(() => {
    const loadFaqs = async () => {
      const { data } = await supabase
        .from('preguntas_frecuentes')
        .select('*')
        .order('orden', { ascending: true });

      if (data && data.length > 0) {
        const mapped = data.map((item: any, index: number) => ({
          question: item.pregunta,
          answer: item.respuesta,
          icon: faqIcons[index % faqIcons.length],
        }));
        setFaqs(mapped);
      }
    };

    loadFaqs();
  }, []);

  return (
    <section className="w-full bg-white py-12 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center space-y-4">
          <div className="inline-block rounded-full bg-muted px-3 py-1 text-sm">Sácate las dudas!</div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
            Preguntas Frecuentes
          </h1>
          <p className="max-w-2xl mx-auto text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Encontrá respuestas a las dudas más comunes sobre nuestros servicios y productos. Si no encontrás lo que buscás, no dudes en contactarnos.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12 w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="rounded-lg border bg-card transition-all hover:shadow-md">
              <AccordionTrigger className="flex w-full items-center gap-4 p-6 text-left text-lg font-semibold hover:no-underline">
                 <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary/10">
                    {faq.icon}
                </div>
                <span className="flex-1">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-6 text-base text-foreground/80 px-6 pl-[88px]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
