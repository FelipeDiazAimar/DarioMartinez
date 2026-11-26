'use client';

import { supabase } from '@/lib/supabase-client';

export type SiteContactInfo = {
  whatsapp: string;
  instagram: string;
  facebook: string;
  email: string;
  phone: string;
  address: string;
  google_maps: string;
  hours_mon_thu: string;
  hours_fri: string;
};

export const DEFAULT_CONTACT_INFO: SiteContactInfo = {
  whatsapp: '5493564504977',
  instagram: 'https://www.instagram.com/dariomartinez.computacion/',
  facebook: 'https://www.facebook.com/profile.php?id=61595361025236',
  email: 'dario.martinez.comp@email.com',
  phone: '03564 15-504977',
  address: 'Libertador Norte 163',
  google_maps: 'https://share.google/WFdtCtDtE7RPHKL5o',
  hours_mon_thu: 'Lunes a Jueves de 7:30 a 12:30 y de 15:30 a 19:30',
  hours_fri: 'Viernes de 8:00 a 12:00 y de 15:30 a 19:30',
};

let cachedContact: SiteContactInfo | null = null;
let inflightContactPromise: Promise<SiteContactInfo> | null = null;

/**
 * Deduplica las consultas repetidas a `contacto_info` entre Header, Footer,
 * WhatsAppFloatButton, ContactForm y páginas para evitar 4-5 roundtrips en cada carga.
 */
export function getSharedContactInfo(): Promise<SiteContactInfo> {
  if (cachedContact) {
    return Promise.resolve(cachedContact);
  }
  if (inflightContactPromise) {
    return inflightContactPromise;
  }

  inflightContactPromise = (async () => {
    try {
      const { data } = await supabase
        .from('contacto_info')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      cachedContact = data ? { ...DEFAULT_CONTACT_INFO, ...data } : DEFAULT_CONTACT_INFO;
      return cachedContact;
    } catch {
      return DEFAULT_CONTACT_INFO;
    } finally {
      inflightContactPromise = null;
    }
  })();

  return inflightContactPromise;
}
