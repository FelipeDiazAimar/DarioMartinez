"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CreditCard, Receipt, ShoppingCart, Trash2, Wallet } from 'lucide-react';
import { LoadingImage } from '@/components/loading-image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  clearAdminCart,
  getAdminCartUpdatedEvent,
  readAdminCart,
  removeFromAdminCart,
  updateAdminCartItemQuantity,
  type AdminCartItem,
} from '@/lib/admin-cart';

type PaymentMethod = 'efectivo' | 'transferencia_mp' | 'tarjeta_mp';

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getItemUnitPrice(item: AdminCartItem) {
  return item.price && item.price > 0 ? item.price : 0;
}

function normalizePhoneInput(value: string) {
  return value.replace(/[^0-9+\-()\s]/g, '').slice(0, 24);
}

export function AdminCartWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<AdminCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [triggerAnimating, setTriggerAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [purchaseNumber, setPurchaseNumber] = useState('');

  const isAdminRoute = pathname.startsWith('/admin');

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + getItemUnitPrice(item) * item.quantity, 0);
  }, [cart]);

  const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const reloadCart = () => setCart(readAdminCart());

  useEffect(() => {
    if (!isAdminRoute) {
      return;
    }

    reloadCart();

    const eventName = getAdminCartUpdatedEvent();
    const handleUpdate = () => reloadCart();

    window.addEventListener(eventName, handleUpdate);
    return () => window.removeEventListener(eventName, handleUpdate);
  }, [isAdminRoute]);

  if (!isAdminRoute) {
    return null;
  }

  const isCheckoutReady = cart.length > 0 && !!customerName.trim() && !!customerPhone.trim();

  const onCartButtonClick = () => {
    setTriggerAnimating(true);
    setTimeout(() => {
      setTriggerAnimating(false);
    }, 450);
  };

  const onCheckout = async () => {
    if (!isCheckoutReady) {
      return;
    }

    try {
      setIsSubmitting(true);
      setCheckoutError('');
      setPurchaseNumber('');

      const response = await fetch('/api/admin/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          paymentMethod,
          items: cart.map((item) => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            stock: item.stock,
            imageUrl: item.imageUrl,
            descriptionAdditional: item.descriptionAdditional,
          })),
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'No se pudo registrar la compra.');
      }

      setPurchaseNumber(String(payload?.data?.nro_compra || ''));
      setConfirmOpen(true);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Error desconocido al confirmar compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            onClick={onCartButtonClick}
            className={`fixed bottom-6 right-6 z-50 h-14 rounded-full px-5 shadow-lg ${triggerAnimating ? 'animate-bounce' : ''}`}
          >
            <ShoppingCart className="h-5 w-5" />
            Carrito ({totalItems})
          </Button>
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Carrito y facturación
            </SheetTitle>
            <SheetDescription>Disponible sólo en rutas de administración.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Productos</h3>
              {cart.length === 0 ? (
                <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Todavía no agregaste productos al carrito.
                </div>
              ) : (
                cart.map((item) => (
                  <article key={item.id} className="rounded-xl border p-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-md border bg-muted/20 p-1">
                          {item.imageUrl ? (
                            <LoadingImage
                              src={item.imageUrl}
                              alt={item.title}
                              width={56}
                              height={56}
                              className="h-full w-full object-contain"
                              spinnerSizeClassName="h-4 w-4 border-2"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">Sin imagen</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-tight">{item.title}</p>
                          <p className="text-xs text-muted-foreground">Stock máximo: {item.stock}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFromAdminCart(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor={`qty-${item.id}`} className="text-xs text-muted-foreground">
                        Cant.
                      </Label>
                      <Input
                        id={`qty-${item.id}`}
                        type="number"
                        min={1}
                        max={Math.max(1, item.stock)}
                        value={item.quantity}
                        onChange={(event) => {
                          const parsed = Number.parseInt(event.target.value, 10);
                          if (Number.isFinite(parsed)) {
                            updateAdminCartItemQuantity(item.id, parsed);
                          }
                        }}
                        className="h-8 w-24 border-primary/60 focus-visible:ring-primary"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Precio unitario: {item.price ? `$ ${formatMoney(item.price)}` : 'No definido'}
                    </p>
                  </article>
                ))
              )}
            </section>

            <section className="space-y-3 rounded-xl border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold">Facturación</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>$ {formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>$ {formatMoney(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-name">Nombre y apellido</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="border-primary/60 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone">Teléfono</Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Ej: 03564 15-504977"
                  pattern="[0-9+\-()\s]{7,24}"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(normalizePhoneInput(e.target.value))}
                  className="border-primary/60 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label>Método de pago</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} className="gap-3">
                  <label className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <RadioGroupItem value="efectivo" id="pay-cash" />
                    <Wallet className="h-4 w-4" />
                    Efectivo
                  </label>
                  <label className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <RadioGroupItem value="transferencia_mp" id="pay-transfer" />
                    <Receipt className="h-4 w-4" />
                    Transferencia (Mercado Pago)
                  </label>
                  <label className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <RadioGroupItem value="tarjeta_mp" id="pay-card" />
                    <CreditCard className="h-4 w-4" />
                    Tarjeta (Mercado Pago)
                  </label>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => clearAdminCart()} disabled={cart.length === 0}>
                  Vaciar carrito
                </Button>
                <Button onClick={onCheckout} disabled={!isCheckoutReady || isSubmitting} className="flex-1">
                  {isSubmitting ? 'Procesando...' : 'Confirmar compra'}
                </Button>
              </div>

              {checkoutError && (
                <p className="text-xs text-destructive">{checkoutError}</p>
              )}
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compra lista para procesar</DialogTitle>
            <DialogDescription>
              Se generó el resumen para avanzar con {paymentMethod === 'efectivo' ? 'efectivo' : paymentMethod === 'transferencia_mp' ? 'transferencia por Mercado Pago' : 'tarjeta por Mercado Pago'}.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/20 p-3 text-sm space-y-1">
            <p><span className="font-medium">Nro. compra:</span> {purchaseNumber || 'Generado en backend'}</p>
            <p><span className="font-medium">Cliente:</span> {customerName}</p>
            <p><span className="font-medium">Teléfono:</span> {customerPhone || 'Sin teléfono'}</p>
            <p><span className="font-medium">Items:</span> {totalItems}</p>
            <p><span className="font-medium">Total:</span> $ {formatMoney(subtotal)}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cerrar</Button>
            <Button
              onClick={() => {
                clearAdminCart();
                setConfirmOpen(false);
                setOpen(false);
                setCustomerName('');
                setCustomerPhone('');
                setPaymentMethod('efectivo');
                setCheckoutError('');
                setPurchaseNumber('');
              }}
            >
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
