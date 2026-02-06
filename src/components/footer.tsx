import Link from "next/link";
import Image from "next/image";
import { Instagram, ArrowRight, Clock } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppIcon } from "./icons/whatsapp-icon";
import { FacebookIcon } from "./icons/facebook-icon";
import { MapsIcon } from "./icons/maps-icon";
import { Button } from "./ui/button";

const faqs = [
  {
    question: "¿Qué medios de pago aceptan?",
    answer: "Aceptamos efectivo, transferencia bancaria, tarjetas de débito y crédito. También podés pagar a través de Mercado Pago.",
  },
  {
    question: "¿Hacen envíos a domicilio?",
    answer: "Sí, realizamos envíos a domicilio en San Francisco y la zona. Consultanos por los costos y tiempos de entrega.",
  },
  {
    question: "¿Cuál es el horario de atención?",
    answer: "Nuestro horario de atención de Lunes a Jueves es de 7:30 a 12:30 y de 15:30 a 19:30 hs. Los Viernes es de 8:00 a 12:00 y de 15:30 a 19:30 hs. Los sábados el local permanece cerrado.",
  },
  {
    question: "¿Ofrecen garantía por las reparaciones?",
    answer: "Sí, todas nuestras reparaciones cuentan con una garantía de 90 días. La garantía cubre la mano de obra y los repuestos utilizados.",
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40 text-foreground">
      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-4 lg:gap-8">
        {/* Logo and Socials */}
        <div className="flex flex-col items-start gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-[72px] w-[72px]">
              <Image
                src="/LOGO1.png"
                alt="Darío Martínez Computación"
                width={72}
                height={72}
              />
            </div>
          </Link>
          <p className="text-sm text-foreground/70">
            Tu aliado en soluciones tecnológicas desde hace más de 50 años.
          </p>
          <div className="text-sm text-foreground/70 space-y-1">
            <h4 className="font-semibold flex items-center gap-2 text-foreground/90"><Clock className="h-4 w-4" /> Horarios de atención</h4>
            <p>Lunes a Jueves: 7:30-12:30 y 15:30-19:30 hs.</p>
            <p>Viernes: 8:00-12:00 y 15:30-19:30 hs.</p>
            <p>Sábados: Cerrado</p>
          </div>
          <div className="flex gap-4 pt-2">
            <Link href="https://wa.me/5493564504977" target="_blank" aria-label="WhatsApp" className="text-foreground/80 hover:text-primary transition-colors">
              <WhatsAppIcon className="h-6 w-6" />
            </Link>
            <Link href="https://www.instagram.com/dariomartinezcomputacion/" target="_blank" aria-label="Instagram" className="text-foreground/80 hover:text-primary transition-colors">
              <Instagram className="h-6 w-6" />
            </Link>
            <Link href="https://www.facebook.com/profile.php?id=61585160335205" target="_blank" aria-label="Facebook" className="text-foreground/80 hover:text-primary transition-colors">
              <FacebookIcon className="h-6 w-6" />
            </Link>
            <Link href="https://share.google/WFdtCtDtE7RPHKL5o" target="_blank" aria-label="Google Maps" className="text-foreground/80 hover:text-primary transition-colors">
              <MapsIcon className="h-6 w-6" />
            </Link>
          </div>
          <Button asChild className="rounded-full px-8">
            <Link href="https://wa.me/5493564504977" target="_blank">
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                Enviar Mensaje
            </Link>
          </Button>
        </div>

        {/* FAQs */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">
            <Link href="/preguntas-frecuentes" className="hover:text-primary transition-colors">
              Preguntas Frecuentes
            </Link>
          </h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-b-foreground/10">
                <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-foreground/80">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-6">
            <Button asChild className="rounded-full">
              <Link href="/preguntas-frecuentes">
                Ver más
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Map */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Encontranos</h3>
          <div className="overflow-hidden rounded-md border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3381.562307297089!2d-62.08365612436735!3d-31.42616239707323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95cb281ee145b20b%3A0xc3b53f6194c25bd!2sLibertador%20Nte.%20163%2C%20San%20Francisco%2C%20C%C3%B3rdoba!5e0!3m2!1sen!2sar!4v1721759868770!5m2!1sen!2sar"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación en Libertador Norte 163"
            ></iframe>
          </div>
           <Link
            href="https://share.google/WFdtCtDtE7RPHKL5o"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-primary"
          >
            <MapsIcon className="h-4 w-4 flex-shrink-0" />
            <span>Libertador Norte 163</span>
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-foreground/10">
        <div className="container mx-auto flex h-14 items-center justify-center px-4 md:px-6">
          <p className="text-sm text-foreground/60" suppressHydrationWarning>
            © {new Date().getFullYear()} Darío Martínez Computación. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
