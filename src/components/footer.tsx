import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppIcon } from "./icons/whatsapp-icon";
import { FacebookIcon } from "./icons/facebook-icon";
import { MapsIcon } from "./icons/maps-icon";

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
    answer: "Nuestro horario de atención es de lunes a viernes de 8:30 a 12:30 y de 16:00 a 20:00. Sábados de 9:00 a 13:00.",
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
            <Image
              src="/LOGO1.png"
              alt="Darío Martínez Computación"
              width={60}
              height={60}
            />
          </Link>
          <p className="text-sm text-foreground/70">
            Tu aliado en soluciones tecnológicas desde hace más de 20 años.
          </p>
          <div className="flex gap-4">
            <Link href="https://wa.me/5493564504977" target="_blank" aria-label="WhatsApp" className="text-foreground/80 hover:text-primary transition-colors">
              <WhatsAppIcon className="h-6 w-6" />
            </Link>
            <Link href="https://www.instagram.com" target="_blank" aria-label="Instagram" className="text-foreground/80 hover:text-primary transition-colors">
              <Instagram className="h-6 w-6" />
            </Link>
            <Link href="https://www.facebook.com" target="_blank" aria-label="Facebook" className="text-foreground/80 hover:text-primary transition-colors">
              <FacebookIcon className="h-6 w-6" />
            </Link>
            <Link href="https://www.google.com/maps/place/Av.+del+Libertador+(N)+163,+X2400+San+Francisco,+C%C3%B3rdoba,+Argentina" target="_blank" aria-label="Google Maps" className="text-foreground/80 hover:text-primary transition-colors">
              <MapsIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Preguntas Frecuentes</h3>
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
        </div>

        {/* Map */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Encontranos</h3>
          <div className="overflow-hidden rounded-md border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3381.56037194451!2d-62.08375602498263!3d-31.42621009707241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95cb281ee0d8d2d1%3A0x39a039777591667!2sAv.%20del%20Libertador%20(N)%2C%20San%20Francisco%2C%20C%C3%B3rdoba!5e0!3m2!1ses-419!2sar!4v1719522055694!5m2!1ses-419!2sar"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación en Google Maps"
            ></iframe>
          </div>
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
