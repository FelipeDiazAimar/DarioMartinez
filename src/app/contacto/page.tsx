'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ContactForm } from '@/components/contact-form';
import { Button } from '@/components/ui/button';
import { Instagram, Mail } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { FacebookIcon } from '@/components/icons/facebook-icon';
import { LoadingImage } from '@/components/loading-image';
import { supabase } from '@/lib/supabase-client';

const defaultContactInfo = {
  whatsapp: '5493564504977',
  instagram: 'https://www.instagram.com/dariomartinezcomputacion/',
  facebook: 'https://www.facebook.com/profile.php?id=61585160335205',
  email: 'dario.martinez.comp@email.com',
  phone: '03564 15-504977',
  address: 'Libertador Norte 163',
  google_maps: 'https://share.google/WFdtCtDtE7RPHKL5o',
  hours_mon_thu: 'Lunes a Jueves de 7:30 a 12:30 y de 15:30 a 19:30',
  hours_fri: 'Viernes de 8:00 a 12:00 y de 15:30 a 19:30',
};

export default function ContactoPage() {
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [businessName, setBusinessName] = useState('');

    useEffect(() => {
      const loadContactInfo = async () => {
        const { data } = await supabase
          .from('contacto_info')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (data) {
          setContactInfo({
            ...defaultContactInfo,
            ...data,
          });
        }
      };

      loadContactInfo();
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
        <section
        id="contacto"
        className="w-full bg-white pt-12 pb-12 md:pt-24 md:pb-24 lg:pt-24 lg:pb-32"
      >
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <LoadingImage
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
          <div className="mx-auto w-full max-w-sm space-y-3">
            <ContactForm />
            <p className="text-xs text-foreground/70">
              Tu consulta es bienvenida. ¡Respondemos a la brevedad!
            </p>

            <div className="mt-32 text-center">
              <h2 className="text-4xl font-bold tracking-tight" style={{ marginTop: '70px' }}>Eres una empresa?</h2>
              <p className="mt-2 text-lg text-muted-foreground">
                O quieres contactarte por mail
              </p>
            </div>

            <div className="mt-6 rounded-2xl border bg-card/70 p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mt-4 space-y-3">
                <input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Nombre de la empresa"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition-all duration-200 ring-offset-background placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring"
                />

                <Button asChild className="w-full transition-transform duration-200 hover:scale-[1.01]">
                  <a href={businessMailLink} target="_blank" rel="noopener noreferrer">
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar mail
                  </a>
                </Button>
              </div>
            </div>

            <div className="pt-8 flex justify-center gap-4">
              <Button asChild size="icon" className="rounded-full bg-[#25D366] text-white hover:bg-[#25D366]/90">
                <Link href={whatsappLink} target="_blank" aria-label="WhatsApp">
                  <WhatsAppIcon className="h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="icon" className="rounded-full bg-[#E4405F] text-white hover:bg-[#E4405F]/90">
                <Link href={contactInfo.instagram} target="_blank" aria-label="Instagram">
                  <Instagram className="h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="icon" className="rounded-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90">
                <Link href={contactInfo.facebook} target="_blank" aria-label="Facebook">
                  <FacebookIcon className="h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
}
