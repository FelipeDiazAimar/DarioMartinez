'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Contact, Check, Undo2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

const formSchema = z.object({
  whatsapp: z.string().min(10, { message: "Debe tener al menos 10 dígitos." }),
  instagram: z.string().url({ message: "Por favor, ingresá una URL válida." }),
  facebook: z.string().url({ message: "Por favor, ingresá una URL válida." }),
  email: z.string().email({ message: "Por favor, ingresá un email válido."}),
  phone: z.string().min(5, { message: "El teléfono es muy corto." }),
  address: z.string().min(5, { message: "La dirección es muy corta." }),
  googleMaps: z.string().url({ message: "Por favor, ingresá una URL válida." }),
  hoursMonThu: z.string().min(5, { message: "El horario es muy corto." }),
  hoursFri: z.string().min(5, { message: "El horario es muy corto." }),
});

export default function EditContactPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
    const localAuth = localStorage.getItem('isAdminAuthenticated');
    if (sessionAuth === 'true' || localAuth === 'true') {
        setIsAuthenticated(true);
    } else {
        router.replace('/admin-login');
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whatsapp: "5493564504977",
      instagram: "https://www.instagram.com/dariomartinezcomputacion/",
      facebook: "https://www.facebook.com/profile.php?id=61585160335205",
      email: "dario.martinez.comp@email.com",
      phone: "03564 15-504977",
      address: "Libertador Norte 163",
      googleMaps: "https://share.google/WFdtCtDtE7RPHKL5o",
      hoursMonThu: "Lunes a Jueves de 7:30 a 12:30 y de 15:30 a 19:30",
      hoursFri: "Viernes de 8:00 a 12:00 y de 15:30 a 19:30",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadContact = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contacto_info')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        toast({
          title: 'Error al cargar',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (data) {
        form.reset({
          whatsapp: data.whatsapp ?? "5493564504977",
          instagram: data.instagram ?? "https://www.instagram.com/dariomartinezcomputacion/",
          facebook: data.facebook ?? "https://www.facebook.com/profile.php?id=61585160335205",
          email: data.email ?? "dario.martinez.comp@email.com",
          phone: data.phone ?? "03564 15-504977",
          address: data.address ?? "Libertador Norte 163",
          googleMaps: data.google_maps ?? "https://share.google/WFdtCtDtE7RPHKL5o",
          hoursMonThu: data.hours_mon_thu ?? "Lunes a Jueves de 7:30 a 12:30 y de 15:30 a 19:30",
          hoursFri: data.hours_fri ?? "Viernes de 8:00 a 12:00 y de 15:30 a 19:30",
        });
      }

      setIsLoading(false);
    };

    loadContact();
  }, [isAuthenticated, form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('contacto_info').upsert({
        id: 1,
        whatsapp: values.whatsapp,
        instagram: values.instagram,
        facebook: values.facebook,
        email: values.email,
        phone: values.phone,
        address: values.address,
        google_maps: values.googleMaps,
        hours_mon_thu: values.hoursMonThu,
        hours_fri: values.hoursFri,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: 'Cambios guardados',
        description: 'La información de contacto se actualizó correctamente.',
      });
    } catch (err: any) {
      toast({
        title: 'Error al guardar',
        description: err?.message || 'Ocurrió un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <Skeleton className="h-10 w-1/2" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
             <div className="flex items-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline flex items-center gap-3">
                    <Contact className="h-8 w-8" />
                    Editar Información de Contacto
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Datos de Contacto y Redes</CardTitle>
                    <CardDescription>
                        Actualizá los datos que se muestran en el sitio web. Este es un editor de demostración y los cambios no se guardarán.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
                            <FormField
                                control={form.control}
                                name="whatsapp"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Número de WhatsApp (con cód. país)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 5493564504977" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="instagram"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>URL de Instagram</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://instagram.com/usuario" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="facebook"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>URL de Facebook</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://facebook.com/usuario" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email de Contacto</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input placeholder="03564 15-504977" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Libertador Norte 163" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="googleMaps"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>URL de Google Maps</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://maps.app.goo.gl/..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursMonThu"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Horario Lunes a Jueves</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 7:30 a 12:30 y de 15:30 a 19:30" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursFri"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Horario Viernes</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 8:00 a 12:00 y de 15:30 a 19:30" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Floating Action Buttons */}
                            <div className="fixed bottom-6 right-6 z-50">
                              {/* Desktop buttons */}
                              <div className="hidden md:flex items-center gap-4">
                                <Button type="button" variant="outline" size="lg" className="bg-background shadow-lg" onClick={() => form.reset()} disabled={isSaving}>
                                  <Undo2 className="mr-2 h-5 w-5" />
                                  Deshacer Cambios
                                </Button>
                                <Button type="submit" size="lg" className="shadow-lg" disabled={isSaving}>
                                  <Check className="mr-2 h-5 w-5" />
                                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                              </div>
                              {/* Mobile buttons */}
                              <div className="md:hidden flex flex-col gap-3">
                                <Button type="button" variant="outline" size="icon" className="h-14 w-14 rounded-full shadow-lg border-2 bg-background" onClick={() => form.reset()} disabled={isSaving}>
                                  <Undo2 className="h-6 w-6" />
                                  <span className="sr-only">Deshacer Cambios</span>
                                </Button>
                                <Button type="submit" size="icon" className="h-14 w-14 rounded-full shadow-lg" disabled={isSaving}>
                                  <Check className="h-6 w-6" />
                                  <span className="sr-only">Guardar Cambios</span>
                                </Button>
                              </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
