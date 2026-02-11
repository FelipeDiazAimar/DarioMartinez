'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBasket } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const featureSchema = z.object({
  title: z.string().min(3, "El título es muy corto."),
  description: z.string().min(10, "La descripción es muy corta."),
});

const formSchema = z.object({
  heroTitle: z.string().min(5, "El título es muy corto."),
  heroDescription: z.string().min(10, "La descripción es muy corta."),
  
  whyChooseTitle: z.string().min(5, "El título es muy corto."),
  whyChooseDescription: z.string().min(10, "La descripción es muy corta."),
  whyChooseFeatures: z.array(featureSchema).length(3),

  coreFeaturesTitle: z.string().min(5, "El título es muy corto."),
  coreFeaturesDescription: z.string().min(10, "La descripción es muy corta."),
  coreFeatures: z.array(featureSchema).length(6),

  advancedFeaturesTitle: z.string().min(5, "El título es muy corto."),
  advancedFeaturesDescription: z.string().min(10, "La descripción es muy corta."),
  advancedFeatures: z.array(featureSchema).length(6),
});

const defaultValues = {
    heroTitle: "Simple, flexible y confiable",
    heroDescription: "Formá parte de una comunidad de más de 9,000 comercios exitosos. Funciona sin internet y se adapta a cualquier rubro.",
    
    whyChooseTitle: "¿Por qué los comercios eligen POSBerry?",
    whyChooseDescription: "Las ventajas que impulsan tu negocio todos los días",
    whyChooseFeatures: [
        { title: 'Siempre Operativo', description: 'Tu negocio nunca se detiene. POSBerry funciona perfectamente con o sin conexión a internet, garantizando 100% de disponibilidad para tus ventas.' },
        { title: 'Fácil de Usar', description: 'Interfaz intuitiva que tu equipo aprende en minutos. Sin complicaciones, solo resultados. Empezá a vender desde el primer día.' },
        { title: 'Precio Transparente', description: 'Un único precio mensual que incluye todo: actualizaciones, soporte y nuevas funcionalidades. Sin sorpresas, sin costos adicionales.' },
    ],
    
    coreFeaturesTitle: "Todo lo que necesitás para vender más",
    coreFeaturesDescription: "Un sistema completo que se adapta a tu negocio",
    coreFeatures: [
        { title: 'Ventas Rápidas', description: 'Procesá ventas en segundos. Múltiples medios de pago, descuentos automáticos y gestión de devoluciones.' },
        { title: 'Control de Stock', description: 'Inventario en tiempo real. Alertas de stock bajo, múltiples depósitos y trazabilidad completa.' },
        { title: 'Reportes Inteligentes', description: 'Dashboards en tiempo real. Análisis de ventas, productos más vendidos y proyecciones para tomar decisiones basadas en datos.' },
        { title: 'Gestión de Clientes', description: 'CRM integrado. Historial de compras, cuentas corrientes y programa de fidelización para fidelizar a tus clientes.' },
        { title: 'Facturación Electrónica ARCA', description: 'Totalmente integrado con ARCA. Facturas A, B, C, Notas de Crédito/Débito. Homologado y siempre actualizado.' },
        { title: 'Multi-Sucursal', description: 'Gestión centralizada para escalar sin límites. Sincronización automática, reportes consolidados y control total.' },
    ],

    advancedFeaturesTitle: "Potenciá tu Negocio",
    advancedFeaturesDescription: "Características avanzadas que marcan la diferencia",
    advancedFeatures: [
        { title: 'Respaldo Automático', description: 'Cambiá de PC sin perder nada. Instalá POSBerry en cualquier equipo y tus datos se descargan automáticamente desde la nube.' },
        { title: 'Integraciones de Pago', description: 'Conectado con los principales procesadores: Mercado Pago QR y Point, Fiserv, Clover, Payway, PVS-SuperPOS, y QR Bind.' },
        { title: 'Promociones Inteligentes', description: 'Creá esquemas de descuentos y recargos automáticos. Happy hours, descuentos por cantidad, promociones por día de la semana.' },
        { title: 'Impresiones Completas', description: 'Soporte total para tu negocio: Fiscales 1ra y 2da generación, códigos de barra, etiquetas de precios y comandas de cocina.' },
        { title: 'Seguridad Total', description: 'Tus datos siempre protegidos con backups periódicos automáticos, encriptación y sincronización segura en la nube.' },
        { title: 'Gestión Avanzada', description: 'Control total de tu negocio con cierres de turno, control de cajas múltiples, y reportes detallados por vendedor.' },
    ],
};

export default function EditPosberryPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    defaultValues: defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Guardado (simulación)",
      description: "Los cambios no se guardarán. Para aplicar los cambios, pedímelo directamente.",
    });
  }
  
  if (!isAuthenticated) {
    // Skeleton loading state
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
                <div className="space-y-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-4 border-b pb-4">
                            <Skeleton className="h-8 w-1/3" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                             <div className="space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-20 w-full" />
                            </div>
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
                    <ShoppingBasket className="h-8 w-8" />
                    Editar Página "Posberry"
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contenido de la Página Posberry</CardTitle>
                    <CardDescription>
                        Actualizá los textos que se muestran en la sección "Posberry". Este es un editor de demostración y los cambios no se guardarán.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            
                            {/* Hero Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección Principal (Hero)</h3>
                                <FormField control={form.control} name="heroTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="heroDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción Principal</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>

                            <Separator />

                            {/* Why Choose Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "¿Por qué elegirnos?"</h3>
                                 <FormField control={form.control} name="whyChooseTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="whyChooseDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                    {defaultValues.whyChooseFeatures.map((_, index) => (
                                        <div key={`why-${index}`} className="space-y-4 p-4 border rounded-lg">
                                            <FormField control={form.control} name={`whyChooseFeatures.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Título Característica {index + 1}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name={`whyChooseFeatures.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <Separator />

                             {/* Core Features Section */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "Características Principales"</h3>
                                 <FormField control={form.control} name="coreFeaturesTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="coreFeaturesDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                    {defaultValues.coreFeatures.map((_, index) => (
                                        <div key={`core-${index}`} className="space-y-4 p-4 border rounded-lg">
                                            <FormField control={form.control} name={`coreFeatures.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Título Característica {index + 1}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name={`coreFeatures.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />
                            
                             {/* Advanced Features Section */}
                             <div className="space-y-4">
                                <h3 className="text-xl font-semibold">Sección "Características Avanzadas"</h3>
                                 <FormField control={form.control} name="advancedFeaturesTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="advancedFeaturesDescription" render={({ field }) => (
                                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                    {defaultValues.advancedFeatures.map((_, index) => (
                                        <div key={`advanced-${index}`} className="space-y-4 p-4 border rounded-lg">
                                            <FormField control={form.control} name={`advancedFeatures.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Título Característica {index + 1}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                            <FormField control={form.control} name={`advancedFeatures.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-2 pt-4">
                                <Button type="submit">Guardar Cambios</Button>
                                <Button type="button" variant="outline" onClick={() => form.reset()}>Deshacer Cambios</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
