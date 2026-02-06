import Image from 'next/image';
import Link from 'next/link';
import { ContactForm } from '@/components/contact-form';
import { Button } from '@/components/ui/button';
import { Instagram, Cog } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { FacebookIcon } from '@/components/icons/facebook-icon';

export default function ContactoPage() {
    return (
        <section
        id="contacto"
        className="w-full bg-white pt-12 pb-12 md:pt-24 md:pb-24 lg:pt-24 lg:pb-32"
      >
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <Image
                src="/LOGO1.png"
                alt="Darío Martínez Computación"
                width={200}
                height={200}
                className="mx-auto"
            />
            <h1 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
              Contactanos sin compromiso
            </h1>
            <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              ¿Tenés alguna duda o necesitás un presupuesto? Completá el
              formulario o envianos un WhatsApp.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-2">
            <ContactForm />
            <p className="text-xs text-foreground/70">
              Tu consulta es bienvenida. ¡Respondemos a la brevedad!
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Button asChild size="icon" className="rounded-full bg-[#25D366] text-white hover:bg-[#25D366]/90">
                <Link href="https://wa.me/5493564504977" target="_blank" aria-label="WhatsApp">
                  <WhatsAppIcon className="h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="icon" className="rounded-full bg-[#E4405F] text-white hover:bg-[#E4405F]/90">
                <Link href="https://www.instagram.com/dariomartinezcomputacion/" target="_blank" aria-label="Instagram">
                  <Instagram className="h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="icon" className="rounded-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90">
                <Link href="https://www.facebook.com/profile.php?id=61585160335205" target="_blank" aria-label="Facebook">
                  <FacebookIcon className="h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
}
