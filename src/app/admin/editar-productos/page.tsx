'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Control } from "react-hook-form";
import * as z from "zod";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Package, PlusCircle, Trash2, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const productDetailSchema = z.string().min(10, { message: "El detalle es muy corto." });

const productSchema = z.object({
  imageId: z.string(),
  title: z.string().min(5, { message: "El título es muy corto." }),
  description: z.string().min(10, { message: "La descripción es muy corta." }),
  details: z.array(productDetailSchema),
  image: z.any().optional(),
});

const formSchema = z.object({
  products: z.array(productSchema),
});

const defaultProducts = [
    { imageId: 'stationery', title: 'Artículos de Librería', description: 'Resmas de papel, cuadernos, bolígrafos y más.', details: ['Cuadernos, blocks de notas y agendas de distintos tamaños y formatos.', 'Bolígrafos, lápices, marcadores y todo para la escritura.', 'Papelería comercial, resmas de papel y cartulinas.'] },
    { imageId: 'headphones', title: 'Auriculares y Micrófonos', description: 'Audio de alta calidad para música, gaming y llamadas.', details: ['Auriculares con y sin cable, in-ear, on-ear y over-ear.', 'Headsets para gaming con sonido envolvente y micrófono integrado.', 'Micrófonos de escritorio y de solapa para streaming y conferencias.'] },
    { imageId: 'electronic-scales', title: 'Balanzas Electrónicas', description: 'Balanzas comerciales homologadas para pesar con precisión.', details: ['Balanzas para comercios con cálculo de precio e importe.', 'Modelos con impresor de etiquetas de código de barras y QR.', 'Homologadas y certificadas para uso comercial.'] },
    { imageId: 'cables', title: 'Cables y Conectividad', description: 'HDMI, USB, VGA, red y todo tipo de cables que necesites.', details: ['Cables de video: HDMI, DisplayPort, VGA, DVI en todas las longitudes.', 'Cables USB de todo tipo: A, B, C, micro, mini, y extensiones.', 'Cables de alimentación, audio, y de red (patch cords).'] },
    { imageId: 'safes', title: 'Cajas Fuertes', description: 'Protege tu dinero y documentos importantes.', details: ['Cajas de seguridad con cerradura electrónica, a llave o combinadas.', 'Distintos tamaños y niveles de seguridad para hogar y comercio.', 'Modelos para amurar, de sobreponer y con ranura buzón.'] },
    { imageId: 'cash-registers', title: 'Cajas Registradoras', description: 'Control fiscal y de ventas para tu comercio.', details: ['Registradoras fiscales homologadas por AFIP.', 'Modelos alfanuméricos con control de stock y reportes Z.', 'Servicio de inicialización y programación.'] },
    { imageId: 'calculator', title: 'Calculadoras Comerciales', description: 'Calculadoras con impresor y funciones comerciales.', details: ['Calculadoras comerciales y de escritorio para el día a día.', 'Modelos con rollo de papel para un registro físico de tus operaciones.', 'Funciones de cálculo de impuestos, costo, venta y margen.'] },
    { imageId: 'scientific-calculator', title: 'Calculadoras Científicas', description: 'Funciones avanzadas para estudiantes y profesionales.', details: ['Calculadoras con cientos de funciones científicas y estadísticas.', 'Modelos programables y graficadores para carreras técnicas.', 'Las marcas líderes del mercado: Casio, HP y más.'] },
    { imageId: 'webcams', title: 'Cámaras Web', description: 'Video en alta definición para streaming y videollamadas.', details: ['Cámaras HD, Full HD y 4K para una imagen nítida.', 'Ideales para teletrabajo, clases online, streaming y creación de contenido.', 'Modelos con micrófono incorporado y enfoque automático.'] },
    { imageId: 'printer-toner', title: 'Cartuchos y Toners', description: 'Consumibles originales y alternativos para todas las marcas.', details: ['Amplio stock de cartuchos de tinta y toners para impresoras.', 'Trabajamos con todas las marcas: HP, Epson, Brother, Canon, etc.', 'Opciones originales y alternativas de alta calidad y rendimiento.'] },
    { imageId: 'ticket-printer', title: 'Comanderas y Ticketeadoras', description: 'Impresoras térmicas para comandas, recibos y tickets no fiscales.', details: ['Impresoras térmicas de alta velocidad para puntos de venta y cocinas.', 'Ideales para emitir comandas, tickets no fiscales, recibos y resúmenes.', 'Fáciles de instalar y compatibles con los principales sistemas de gestión.'] },
    { imageId: 'pc-components', title: 'Componentes de PC', description: 'Procesadores, motherboards, memorias, fuentes y más.', details: ['Procesadores Intel y AMD, placas madre, memorias RAM.', 'Discos SSD y HDD, placas de video, fuentes de alimentación.', 'Gabinetes, coolers y todo para armar o actualizar tu PC.'] },
    { imageId: 'fiscal-printer', title: 'Impresoras Fiscales', description: 'Modelos homologados por AFIP para cumplir con todas las normativas vigentes.', details: ['Equipos fiscales de 1ra y 2da generación, para todo volumen de facturación.', 'Homologados por AFIP, garantizando cumplimiento y transacciones seguras.', 'Servicio técnico integral: inicialización, mantenimiento y reparaciones.'] },
    { imageId: 'printers', title: 'Impresoras Multifunción', description: 'Imprime, escanea y copia con un solo equipo. Tinta y láser.', details: ['Equipos inkjet y láser, monocromáticos y a color.', 'Funciones de impresión, copiado y escaneo en un solo dispositivo.', 'Modelos con conectividad WiFi y sistemas de tinta continua.'] },
    { imageId: 'office-supplies', title: 'Insumos para Oficina', description: 'Todo lo que necesitás para el día a día de tu oficina.', details: ['Artículos de librería, resmas de papel, carpetas y archivos.', 'Abrochadoras, perforadoras y todo para la organización de documentos.', 'Rollos de papel para ticketeadoras y calculadoras.'] },
    { imageId: 'keyboards', title: 'Teclados', description: 'Mecánicos, de membrana, ergonómicos e inalámbricos.', details: ['Teclados para oficina, gaming y uso general.', 'Modelos mecánicos, de membrana, con y sin pad numérico.', 'Opciones con cable USB o inalámbricos por Bluetooth o radiofrecuencia.'] },
    { imageId: 'barcode-scanner', title: 'Lectores de Códigos de Barra', description: 'Agilizá tus ventas y control de stock con lectores láser y 2D.', details: ['Lectores 1D y 2D (QR) para agilizar el cobro y la gestión de inventario.', 'Modelos de mano con cable, inalámbricos y fijos de mostrador.', 'Lectura rápida y precisa, incluso en códigos dañados o de baja calidad.'] },
    { imageId: 'mice', title: 'Mouses', description: 'Ópticos, láser, gamers y ergonómicos para cada necesidad.', details: ['Mouses ópticos y láser para todo tipo de superficies.', 'Diseños ergonómicos para prevenir lesiones y mejorar la comodidad.', 'Modelos para gaming con alta precisión (DPI) y botones programables.'] },
    { imageId: 'tech-backpacks', title: 'Mochilas para Notebooks', description: 'Transportá tus equipos de forma segura y con estilo.', details: ['Mochilas y maletines con compartimento acolchado para notebooks.', 'Disponibles en varios tamaños para distintos modelos de laptops.', 'Materiales resistentes y diseños ergonómicos para mayor comodidad.'] },
    { imageId: 'monitors', title: 'Monitores', description: 'Pantallas Full HD y 4K para trabajo, diseño y gaming.', details: ['Monitores LED y IPS de diferentes tamaños y resoluciones (HD, FHD, 4K).', 'Modelos para gaming con alta tasa de refresco y bajo tiempo de respuesta.', 'Opciones con diferentes tipos de conexión: HDMI, DisplayPort, VGA.'] },
    { imageId: 'mousepads', title: 'Mousepads', description: 'Superficies optimizadas para precisión y comodidad.', details: ['Mousepads de tela, rígidos y con reposamuñecas de gel.', 'Superficies diseñadas para un deslizamiento suave y preciso del mouse.', 'Modelos extendidos (XL y XXL) que cubren todo el escritorio.'] },
    { imageId: 'notebook', title: 'Notebooks', description: 'Las mejores marcas y modelos para trabajar o estudiar desde donde quieras.', details: ['Amplia variedad de las mejores marcas: HP, Dell, Lenovo, Asus y más.', 'Modelos para trabajo, estudio, diseño o gaming, adaptados a tu movilidad.', 'Garantía oficial y nuestro respaldo técnico especializado.'] },
    { imageId: 'usb-drives', title: 'Pendrives y Almacenamiento', description: 'Memorias USB y discos externos para tus archivos.', details: ['Pendrives de distintas capacidades y velocidades (USB 2.0, 3.0, 3.1).', 'Discos duros externos (HDD y SSD) para backups y almacenamiento masivo.', 'Tarjetas de memoria (SD y microSD) para cámaras y celulares.'] },
    { imageId: 'network-cards', title: 'Placas de Red', description: 'Añade o mejora la conexión a internet de tu PC.', details: ['Placas de red PCI Express para conexión por cable Ethernet.', 'Placas de red WiFi para conectar tu PC de escritorio de forma inalámbrica.', 'Modelos con las últimas tecnologías para mayor velocidad y estabilidad.'] },
    { imageId: 'routers', title: 'Routers y Repetidores', description: 'Mejora la cobertura y velocidad de tu señal WiFi.', details: ['Routers neutros para gestionar tu red y mejorar el rendimiento.', 'Repetidores y extensores de rango para eliminar zonas sin WiFi.', 'Sistemas Mesh para una cobertura total y sin interrupciones en casas grandes.'] },
    { imageId: 'office-chairs', title: 'Sillas de Escritorio', description: 'Sillas ergonómicas para cuidar tu postura durante el trabajo.', details: ['Sillas gerenciales y operativas con múltiples ajustes.', 'Diseños ergonómicos con soporte lumbar, apoyabrazos y apoyacabeza.', 'Sillas gamer para largas sesiones de juego con máximo confort.'] },
    { imageId: 'network-switch', title: 'Switches de Red', description: 'Expande tu red cableada de forma rápida y eficiente.', details: ['Switches de 5, 8, 16 y 24 puertos para redes domésticas y de oficina.', 'Multiplica los puntos de conexión de tu red cableada fácilmente.', 'Modelos no administrables (plug and play) y administrables.'] },
    { imageId: 'usb-adapters', title: 'Adaptadores USB WiFi/Bluetooth', description: 'Conectividad inalámbrica para cualquier equipo.', details: ['Adaptadores USB para agregar conectividad WiFi a PCs de escritorio.', 'Dongles Bluetooth para conectar periféricos inalámbricos.', 'Fáciles de instalar y compatibles con todos los sistemas operativos.'] },
];

type FormValues = z.infer<typeof formSchema>;

export default function EditProductsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('a-z');

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAdminAuthenticated');
    const localAuth = localStorage.getItem('isAdminAuthenticated');
    if (sessionAuth === 'true' || localAuth === 'true') {
        setIsAuthenticated(true);
    } else {
        router.replace('/admin-login');
    }
  }, [router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products: defaultProducts,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const watchedProducts = form.watch('products');
  const displayProductFields = useMemo(() => {
    let productsWithIndex = fields.map((field, index) => ({
      ...field,
      ...(watchedProducts[index] || {}),
      originalIndex: index,
    }));

    if (searchTerm) {
      productsWithIndex = productsWithIndex.filter(p => 
        (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    productsWithIndex.sort((a, b) => {
      const titleA = a.title || '';
      const titleB = b.title || '';
      if (sortOrder === 'a-z') {
        return titleA.localeCompare(titleB);
      } else {
        return titleB.localeCompare(titleA);
      }
    });

    return productsWithIndex;
  }, [fields, watchedProducts, searchTerm, sortOrder]);


  function onSubmit(values: FormValues) {
    toast({
      title: "Guardado (simulación)",
      description: "Los cambios no se guardarán. Para aplicar los cambios, pedímelo directamente.",
    });
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Skeleton className="h-10 w-1/2" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-4 border-b pb-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
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
                    <Package className="h-8 w-8" />
                    Editar Página "Productos"
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gestor de Productos</CardTitle>
                    <CardDescription>
                        Añadí, editá o eliminá los productos que se muestran en la página. Este es un editor de demostración.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por título o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Ordenar" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="a-z">Ordenar: A-Z</SelectItem>
                            <SelectItem value="z-a">Ordenar: Z-A</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-6">
                                {displayProductFields.map((productInfo) => {
                                    const productIndex = productInfo.originalIndex;
                                    const productField = productInfo;
                                    const productImage = PlaceHolderImages.find(p => p.id === productField.imageId);
                                    return (
                                        <div key={productField.id} className="p-4 border rounded-lg relative space-y-4">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-7 w-7"
                                                onClick={() => remove(productIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>

                                            <h3 className="font-semibold text-lg">Producto #{productIndex + 1}</h3>

                                            <FormField
                                                control={form.control}
                                                name={`products.${productIndex}.title`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Título del Producto</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`products.${productIndex}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                    <FormLabel>Descripción Corta</FormLabel>
                                                    <FormControl>
                                                        <Textarea rows={2} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            
                                            <ImageUploadField 
                                                form={form} 
                                                name={`products.${productIndex}.image`}
                                                label="Imagen del Producto"
                                                currentImageUrl={productImage?.imageUrl || ''}
                                                imageAlt={productImage?.description || ''}
                                            />

                                            <ProductDetailsArray control={form.control} productIndex={productIndex} />
                                        </div>
                                    )
                                })}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => append({ imageId: `new-product-${fields.length}`, title: "", description: "", details: [""] })}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Producto
                            </Button>

                            <Separator />

                            <div className="flex items-center gap-2 pt-4">
                                <Button type="submit">Guardar Cambios</Button>
                                <Button type="button" variant="outline" onClick={() => form.reset({ products: defaultProducts })}>Deshacer Cambios</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}

function ProductDetailsArray({ control, productIndex }: { control: Control<FormValues>, productIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `products.${productIndex}.details`
  });

  return (
    <div className="space-y-4 pl-6 border-l-2 border-muted">
        <FormLabel>Puntos de Detalle del Producto</FormLabel>
        {fields.map((detailField, detailIndex) => (
            <div key={detailField.id} className="flex items-center gap-2">
                 <FormField
                    control={control}
                    name={`products.${productIndex}.details.${detailIndex}`}
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                        <FormControl>
                            <Textarea rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(detailIndex)}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        ))}
         <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append("")}
        >
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Detalle
        </Button>
    </div>
  )
}

function ImageUploadField({ form, name, label, currentImageUrl, imageAlt, aspectRatio = "aspect-video" }: { form: any; name: string; label: string; currentImageUrl: string; imageAlt: string; aspectRatio?: string; }) {
  const [preview, setPreview] = useState(currentImageUrl);
  const watchedFile = form.watch(name);

  useEffect(() => {
    if (watchedFile && watchedFile instanceof File) {
      const fileUrl = URL.createObjectURL(watchedFile);
      setPreview(fileUrl);
      return () => URL.revokeObjectURL(fileUrl);
    } else if (!watchedFile) {
        setPreview(currentImageUrl);
    }
  }, [watchedFile, currentImageUrl]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange, value, ...rest } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex items-start gap-6">
            <Image
              src={preview || 'https://picsum.photos/seed/placeholder/160/90'}
              alt={imageAlt || 'Image preview'}
              width={160}
              height={90}
              className={cn("rounded-lg object-cover border", aspectRatio)}
            />
            <div className="flex-1 space-y-2">
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onChange(file);
                  }}
                  {...rest}
                />
              </FormControl>
              <FormDescription>
                Seleccioná una nueva imagen. Sin límite de tamaño.
              </FormDescription>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
