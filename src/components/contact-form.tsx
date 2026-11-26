'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import * as React from 'react';
import { CheckCircle2, ExternalLink, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { supabase } from '@/lib/supabase-client';
import { getSharedContactInfo } from '@/lib/site-data-cache';
import { trackEvent } from '@/lib/analytics-client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  lastname: z.string().min(2, {
    message: 'El apellido debe tener al menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor, ingresá una dirección de email válida.',
  }),
  message: z.string().min(10, {
    message: 'El mensaje debe tener al menos 10 caracteres.',
  }),
});

export function ContactForm() {
  const { toast } = useToast();
  const [whatsAppNumber, setWhatsAppNumber] = React.useState('5493564504977');
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = React.useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = React.useState(false);

  React.useEffect(() => {
    getSharedContactInfo().then((data) => {
      if (data?.whatsapp) {
        const digits = String(data.whatsapp).replace(/\D/g, '');
        if (digits.length >= 10) setWhatsAppNumber(digits);
      }
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lastname: '',
      email: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, lastname, email, message } = values;
    const text = `¡Hola! Soy ${name} ${lastname}.\nMi email es: ${email}.\n\nConsulta: ${message}`;
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${whatsAppNumber}?text=${encodedText}`;

    // 1. Abrir WhatsApp de forma síncrona dentro del gesto del clic para evitar bloqueo de popups.
    setLastWhatsAppUrl(url);
    let openedWindow: Window | null = null;
    try {
      openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      openedWindow = null;
    }

    const wasBlocked = !openedWindow || openedWindow.closed;
    setPopupBlocked(wasBlocked);

    // 2. Registrar consulta en Supabase en paralelo sin trabar la salida hacia WhatsApp.
    let savedToDb = false;
    try {
      const { error } = await supabase.from('consultas').insert({
        nombre: name.trim(),
        apellido: lastname.trim(),
        email: email.trim(),
        mensaje: message.trim(),
        created_at: new Date().toISOString(),
      });
      savedToDb = !error;
    } catch {
      savedToDb = false;
    }

    trackEvent('contact_submit', { label: savedToDb ? 'Formulario Contacto' : 'Formulario Contacto (solo WA)' });
    trackEvent('whatsapp_click', { label: 'Formulario WhatsApp' });

    toast({
      title: wasBlocked ? 'Tu mensaje está listo para WhatsApp' : 'Consulta preparada en WhatsApp',
      description: wasBlocked
        ? 'Tocá el botón verde "Abrir WhatsApp ahora" para enviar tu consulta.'
        : 'Abrimos WhatsApp con tu consulta lista para enviar.',
    });

    form.reset();
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3.5 text-left" noValidate>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground/80">Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" className="h-11 rounded-xl bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground/80">Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu apellido" className="h-11 rounded-xl bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    className="h-11 rounded-xl bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">Consulta</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Contanos en qué podemos ayudarte..."
                    className="min-h-[112px] resize-none rounded-xl bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="mt-1 h-12 rounded-full bg-gradient-to-r from-[#00308F] to-[#2349B6] text-white shadow-sm transition-all hover:opacity-95"
          >
            <Send className="mr-2 h-4 w-4" />
            {form.formState.isSubmitting ? 'Abriendo WhatsApp...' : 'Enviar por WhatsApp'}
          </Button>
        </form>
      </Form>

      {lastWhatsAppUrl && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-left sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5 text-emerald-950">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="text-xs leading-relaxed sm:text-sm">
              <p className="font-semibold">
                {popupBlocked
                  ? 'Tu navegador bloqueó la ventana emergente.'
                  : '¡Consulta registrada y lista en WhatsApp!'}
              </p>
              <p className="text-emerald-900/80">
                Si no se abrió automáticamente, tocá el botón para continuar la conversación.
              </p>
            </div>
          </div>
          <a
            href={lastWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1FAF5A] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#19964C]"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Abrir WhatsApp ahora
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
