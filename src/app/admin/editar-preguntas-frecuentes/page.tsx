'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const faqSchema = z.object({
  question: z.string().min(5, { message: "La pregunta es muy corta." }),
  answer: z.string().min(10, { message: "La respuesta es muy corta." }),
});

const formSchema = z.object({
  faqs: z.array(faqSchema),
});

const defaultFaqs = [
  {
    question: '¿Qué medios de pago aceptan?',
    answer: 'Aceptamos efectivo, transferencia bancaria, Mercado Pago (con QR en el local), y tarjetas de débito y crédito. Podés consultar por planes de financiación.',
  },
  {
    question: '¿Hacen envíos a domicilio?',
    answer: 'Sí, realizamos envíos a domicilio en San Francisco y la zona para la entrega de productos. Para el servicio técnico, ofrecemos la opción de retirar equipos a domicilio. Consultanos por los costos y la disponibilidad.',
  },
  {
    question: '¿Cuál es el horario de atención?',
    answer: 'Nuestro horario de atención de Lunes a Jueves es de 7:30 a 12:30 y de 15:30 a 19:30 hs. Los Viernes es de 8:00 a 12:00 y de 15:30 a 19:30 hs. Los sábados el local permanece cerrado.',
  },
  {
    question: '¿Ofrecen garantía por las reparaciones?',
    answer: 'Sí, todas nuestras reparaciones de hardware cuentan con una garantía de 90 días que cubre tanto la mano de obra como los repuestos utilizados. La garantía no cubre problemas de software o fallas causadas por mal uso.',
  },
  {
    question: '¿Cuánto tiempo suelen tardar las reparaciones?',
    answer: 'El tiempo de reparación varía según la complejidad del problema y la disponibilidad de repuestos. Para diagnósticos y reparaciones sencillas, el plazo suele ser de 24 a 72 horas. Si se requiere un repuesto específico, te informaremos el tiempo estimado de llegada.',
  },
  {
    question: '¿Es necesario que lleve mi equipo al local?',
    answer: 'Para la mayoría de las reparaciones de hardware, sí es necesario que traigas el equipo a nuestro taller para un diagnóstico preciso. Para problemas de software o configuración, ofrecemos servicio de asistencia remota. ¡Contactanos y vemos la mejor opción para tu caso!',
  },
  {
    question: '¿Trabajan con todas las marcas de notebooks y PC?',
    answer: 'Sí, trabajamos con la gran mayoría de las marcas del mercado, como HP, Dell, Lenovo, Acer, Asus, Apple (MacBook/iMac), entre otras. Nuestra experiencia nos permite diagnosticar y reparar una amplia gama de modelos.',
  },
  {
    question: '¿Qué pasa si mi equipo no tiene arreglo o es muy caro repararlo?',
    answer: 'La transparencia es uno de nuestros pilares. Si durante el diagnóstico determinamos que la reparación no es viable o su costo es antieconómico, te informaremos detalladamente las razones y te asesoraremos sobre las mejores alternativas, como la compra de un equipo nuevo o reacondicionado, sin ningún compromiso.',
  },
];


export default function EditFaqPage() {
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
    defaultValues: {
      faqs: defaultFaqs,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Guardado (simulación)",
      description: "Los cambios no se guardarán. Para aplicar los cambios, pedímelo directamente.",
    });
  }

  if (!isAuthenticated) {
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
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2 border-b pb-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-20 w-full" />
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
                    <HelpCircle className="h-8 w-8" />
                    Editar Preguntas Frecuentes
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gestor de Preguntas Frecuentes (FAQ)</CardTitle>
                    <CardDescription>
                        Añadí, editá o eliminá las preguntas que se muestran en la página. Este es un editor de demostración y los cambios no se guardarán.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-6">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-lg relative">
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name={`faqs.${index}.question`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Pregunta {index + 1}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`faqs.${index}.answer`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Respuesta</FormLabel>
                                                    <FormControl>
                                                        <Textarea rows={3} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                         <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => append({ question: "", answer: "" })}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Pregunta
                            </Button>

                            <Separator />

                            <div className="flex items-center gap-2 pt-4">
                                <Button type="submit">Guardar Cambios</Button>
                                <Button type="button" variant="outline" onClick={() => form.reset({ faqs: defaultFaqs })}>Deshacer Cambios</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
