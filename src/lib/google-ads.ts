// Los IDs salen de Google Ads > Objetivos > Conversiones > la acción
// "Clic a WhatsApp" > Configuración de etiqueta > "Usar Google Tag Manager",
// que muestra el ID de conversión y la etiqueta de conversión.
export const GOOGLE_ADS_ID = 'AW-18473054013';
export const GOOGLE_ADS_WHATSAPP_LABEL = 'lqfQCJuQ4KIdEL3e0ehE';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackWhatsAppConversion(): void {
  if (typeof window === 'undefined') return;
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_WHATSAPP_LABEL) return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_WHATSAPP_LABEL}`,
  });
}
