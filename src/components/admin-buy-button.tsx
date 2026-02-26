"use client";

import { useMemo, useState } from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { addToAdminCart } from '@/lib/admin-cart';

type AdminBuyButtonProps = {
  product: {
    id: string;
    title: string;
    stock: number;
    imageUrl: string;
    descriptionAdditional?: string;
    price?: number;
    priceCurrency?: string;
  };
};

export function AdminBuyButton({ product }: AdminBuyButtonProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [added, setAdded] = useState(false);
  const [triggerAnimating, setTriggerAnimating] = useState(false);

  const maxQuantity = useMemo(() => Math.max(1, Math.floor(product.stock)), [product.stock]);

  const onAddToCart = () => {
    const parsed = Number.parseInt(quantity, 10);
    const safeQuantity = Number.isFinite(parsed) ? Math.max(1, Math.min(parsed, maxQuantity)) : 1;

    addToAdminCart(
      {
        id: product.id,
        title: product.title,
        stock: product.stock,
        imageUrl: product.imageUrl,
        descriptionAdditional: product.descriptionAdditional,
        price: product.price,
        priceCurrency: product.priceCurrency,
      },
      safeQuantity,
    );

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setOpen(false);
    }, 900);
  };

  const onTriggerClick = () => {
    setTriggerAnimating(true);
    setTimeout(() => {
      setTriggerAnimating(false);
    }, 450);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={onTriggerClick}
          className={`h-11 px-6 text-base transition-transform duration-300 hover:scale-105 ${triggerAnimating ? 'animate-bounce' : ''}`}
        >
          <ShoppingCart className="h-4 w-4" />
          Comprar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Agregar al carrito
          </DialogTitle>
          <DialogDescription>
            Elegí cuántas unidades querés comprar de {product.title}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{product.title}</p>
            <p className="text-muted-foreground">Stock disponible: {product.stock}</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="qty" className="text-sm font-medium">
              Cantidad
            </label>
            <Input
              id="qty"
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onAddToCart} className={added ? 'animate-pulse' : ''}>
            {added ? 'Agregado ✓' : 'Agregar al carrito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
