'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Expand,
  MapPin,
  Minus,
  Package,
  Plus,
  Share2,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { LoadingImage } from '@/components/loading-image';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { LiveOpenStatus } from '@/components/live-open-status';
import { Magnet } from '@/components/react-bits';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { trackEvent } from '@/lib/analytics-client';
import { useToast } from '@/hooks/use-toast';

export type ProductDetailViewProps = {
  item: {
    id: string;
    articleNumber: string;
    code?: string;
    title: string;
    stock: number;
    imageUrl: string;
    descriptionAdditional?: string;
    notes?: string;
  };
  categoryId?: string;
  categoryName?: string;
  whatsappNumber?: string;
};

export function ProductDetailClient({
  item,
  categoryId,
  categoryName,
  whatsappNumber = '5493564504977',
}: ProductDetailViewProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = React.useState(1);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);
  const [currentPageUrl, setCurrentPageUrl] = React.useState('');

  React.useEffect(() => {
    setCurrentPageUrl(window.location.href);
  }, []);

  const maxQty = Math.max(1, Math.min(99, Math.floor(item.stock)));
  const isLowStock = item.stock > 0 && item.stock <= 3;

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => Math.min(maxQty, q + 1));

  const codeLabel = item.code || item.articleNumber;

  const buildWhatsAppHref = () => {
    const qtyText = quantity > 1 ? ` (Cantidad: ${quantity} unidades)` : '';
    const codeText = codeLabel ? ` [Cód. ${codeLabel}]` : '';
    const pageUrl = currentPageUrl ? `\nEnlace: ${currentPageUrl}` : '';
    const message = `Hola, quiero consultar o encargar el producto: ${item.title}${codeText}${qtyText}.${pageUrl}`;
    return `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const handleCopyOrShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: 'Enlace copiado',
        description: 'Ya podés compartir este producto por WhatsApp o redes.',
      });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast({
        title: 'No se pudo copiar el enlace',
        variant: 'destructive',
      });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `${item.title} — Darío Martínez Computación`,
          text: item.descriptionAdditional || `Mirá ${item.title} en Darío Martínez Computación`,
          url: window.location.href,
        });
        return;
      } catch {
        // user cancelled share
      }
    }
    handleCopyOrShare();
  };

  const specLines = React.useMemo(() => {
    if (!item.notes) return [];
    return item.notes
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
  }, [item.notes]);

  const showRealImage = Boolean(item.imageUrl) && !imageFailed;

  return (
    <>
      {/* Breadcrumb + botón volver */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/productos" className="transition-colors hover:text-primary">
            Productos
          </Link>
          {categoryName && categoryId && (
            <>
              <span>/</span>
              <Link
                href={`/productos?cat=${encodeURIComponent(categoryId)}`}
                className="transition-colors hover:text-primary"
              >
                {categoryName}
              </Link>
            </>
          )}
        </nav>

        <Link
          href="/productos"
          className="rb-pill-interactive inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-foreground hover:border-primary hover:bg-[#EEF4FF] hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al catálogo
        </Link>
      </div>

      {/* Ficha principal del producto */}
      <section className="overflow-hidden rounded-3xl border border-border bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Galería / Visor interactivo */}
          <div className="relative flex flex-col justify-between border-b border-border bg-white p-6 sm:p-10 lg:col-span-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-2">
              {categoryName && categoryId ? (
                <Link
                  href={`/productos?cat=${encodeURIComponent(categoryId)}`}
                  className="inline-flex items-center rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary"
                >
                  {categoryName}
                </Link>
              ) : (
                <span />
              )}

              {showRealImage && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                  aria-label="Ampliar imagen del producto"
                >
                  <Expand className="h-3.5 w-3.5" />
                  <span>Ampliar</span>
                </button>
              )}
            </div>

            <div className="group relative my-6 flex min-h-[300px] items-center justify-center sm:min-h-[420px]">
              {showRealImage ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="flex h-full w-full cursor-zoom-in items-center justify-center focus-visible:rounded-2xl"
                  aria-label={`Ver imagen ampliada de ${item.title}`}
                >
                  <LoadingImage
                    src={item.imageUrl}
                    alt={item.title}
                    width={780}
                    height={780}
                    priority
                    className="max-h-[440px] w-full object-contain transition-transform duration-500 ease-expo group-hover:scale-[1.03]"
                    onError={() => setImageFailed(true)}
                  />
                </button>
              ) : (
                <div className="bg-brand-soft flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-10 py-14 text-center">
                  <Package className="h-12 w-12 text-primary/45" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Imagen ilustrativa · Consultanos fotos reales por WhatsApp
                  </p>
                </div>
              )}
            </div>

            {/* Metadatos técnicos inferiores */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
              {codeLabel && (
                <span className="font-mono tabular-nums">
                  Código de artículo: <strong className="text-foreground">{codeLabel}</strong>
                </span>
              )}
              <span>Stock actualizado desde sistema interno</span>
            </div>
          </div>

          {/* Panel de decisión, consulta y especificaciones */}
          <div className="flex flex-col justify-between space-y-6 bg-surface/40 p-6 sm:p-8 lg:col-span-5 lg:p-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="font-headline text-2xl font-extrabold leading-tight tracking-[-0.025em] text-foreground sm:text-3xl">
                  {item.title}
                </h1>

                {/* Estado de disponibilidad real */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 font-mono text-xs font-semibold text-emerald-900 tabular-nums">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Disponible ({item.stock} {item.stock === 1 ? 'unidad' : 'unidades'})
                  </span>
                  {isLowStock && (
                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
                      Últimas unidades
                    </span>
                  )}
                </div>
              </div>

              {item.descriptionAdditional && (
                <p className="text-sm leading-relaxed text-foreground/80 sm:text-base">
                  {item.descriptionAdditional}
                </p>
              )}

              {/* Selector de cantidad + CTA WhatsApp */}
              <div className="space-y-3 rounded-2xl border border-border bg-background p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground">Cantidad a consultar</span>
                  <div className="inline-flex items-center rounded-full border border-border bg-surface p-1">
                    <button
                      type="button"
                      onClick={decreaseQty}
                      disabled={quantity <= 1}
                      aria-label="Disminuir cantidad"
                      className="grid h-8 w-8 place-items-center rounded-full text-foreground transition-colors hover:bg-background disabled:opacity-35"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-bold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={increaseQty}
                      disabled={quantity >= maxQty}
                      aria-label="Aumentar cantidad"
                      className="grid h-8 w-8 place-items-center rounded-full text-foreground transition-colors hover:bg-background disabled:opacity-35"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Magnet strength={0.14} className="w-full">
                  <Button
                    asChild
                    variant="whatsapp"
                    size="lg"
                    className="h-12 w-full rounded-full text-sm font-semibold"
                  >
                    <a
                      href={buildWhatsAppHref()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent('whatsapp_click', {
                          label: `Producto Detalle: ${item.title} (x${quantity})`,
                        })
                      }
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      Consultar precio o encargar por WhatsApp
                    </a>
                  </Button>
                </Magnet>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyOrShare}
                    className="h-10 rounded-full text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar enlace
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleNativeShare}
                    className="h-10 rounded-full text-xs"
                  >
                    <Share2 className="mr-1.5 h-3.5 w-3.5" />
                    Compartir
                  </Button>
                </div>
              </div>

              {/* Beneficios reales del local */}
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background text-xs">
                <div className="flex items-start gap-3 p-4">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">Retiro en local</span>
                      <LiveOpenStatus compact className="py-0.5" />
                    </div>
                    <p className="text-muted-foreground">Libertador Norte 163, San Francisco, Córdoba.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Envíos en San Francisco y la región</p>
                    <p className="text-muted-foreground">Coordinamos entregas en más de 23 localidades cercanas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Todos los medios de pago</p>
                    <p className="text-muted-foreground">Efectivo, transferencia, Mercado Pago, débito y crédito.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Respaldo y asesoramiento técnico</p>
                    <p className="text-muted-foreground">Casi 50 años acompañando hogares y comercios de la zona.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección inferior de especificaciones detalladas si existen */}
        {(item.descriptionAdditional || specLines.length > 0) && (
          <div className="grid grid-cols-1 divide-y divide-border border-t border-border bg-background md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="p-6 sm:p-8">
              <h2 className="font-headline text-base font-bold text-foreground">Descripción del producto</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-foreground/80">
                {item.descriptionAdditional ||
                  'Consultanos por WhatsApp para recibir asesoramiento técnico, compatibilidad y cotización actualizada de este artículo.'}
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <h2 className="font-headline text-base font-bold text-foreground">Especificaciones y detalles</h2>
              {specLines.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                  {specLines.map((line, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2.5 text-sm text-muted-foreground">
                  Si necesitás ficha técnica, compatibilidad o factura A/B, escribinos directo por WhatsApp.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Lightbox para ver imagen en alta resolución */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl border-border bg-white p-4 sm:p-6 [&>button]:hidden">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <DialogTitle className="truncate font-headline text-base font-bold text-foreground">
              {item.title}
            </DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={() => setLightboxOpen(false)}
              aria-label="Cerrar vista ampliada"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex max-h-[75vh] min-h-[320px] items-center justify-center p-2">
            <LoadingImage
              src={item.imageUrl}
              alt={item.title}
              width={1200}
              height={900}
              className="max-h-[70vh] w-auto object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
