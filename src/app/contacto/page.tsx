import Image from 'next/image';
import { ContactForm } from '@/components/contact-form';

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
          </div>
        </div>
      </section>
    );
}
