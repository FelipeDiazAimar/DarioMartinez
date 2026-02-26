"use client";

import { useEffect, useMemo, useState } from 'react';
import { Receipt } from 'lucide-react';

type VentaRow = {
  id: number;
  nro_compra: string;
  fecha: string;
  nombre_apellido: string;
  telefono: string;
  metodo_pago: 'efectivo' | 'transferencia_mp' | 'tarjeta_mp';
  subtotal: number | string;
  total: number | string;
  estado: 'pendiente' | 'pagada' | 'cancelada';
  cantidad_items: number | string;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: VentaRow[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

function formatMoney(value: number | string) {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(String(value));
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function paymentLabel(method: VentaRow['metodo_pago']) {
  if (method === 'transferencia_mp') return 'Transferencia MP';
  if (method === 'tarjeta_mp') return 'Tarjeta MP';
  return 'Efectivo';
}

export default function AdminVentasPage() {
  const [rows, setRows] = useState<VentaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalAmount = useMemo(
    () => rows.reduce((acc, row) => acc + Number.parseFloat(String(row.total || 0)), 0),
    [rows],
  );

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/admin/ventas?page=1&pageSize=50', {
          cache: 'no-store',
        });
        const payload = (await response.json()) as ApiResponse;

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'No se pudieron cargar las ventas.');
        }

        setRows(Array.isArray(payload.data) ? payload.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Receipt className="h-7 w-7" />
          Ventas Admin
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Listado de compras registradas desde el carrito admin.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ventas listadas</p>
          <p className="mt-1 text-2xl font-semibold">{rows.length}</p>
        </article>
        <article className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Monto total listado</p>
          <p className="mt-1 text-2xl font-semibold">$ {formatMoney(totalAmount)}</p>
        </article>
      </section>

      {loading ? (
        <section className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Cargando ventas...</section>
      ) : error ? (
        <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">{error}</section>
      ) : rows.length === 0 ? (
        <section className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">Todavía no hay ventas registradas.</section>
      ) : (
        <section className="overflow-x-auto rounded-2xl border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nro. compra</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Pago</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{row.nro_compra}</td>
                  <td className="px-4 py-3">{formatDate(row.fecha)}</td>
                  <td className="px-4 py-3">{row.nombre_apellido}</td>
                  <td className="px-4 py-3">{row.telefono}</td>
                  <td className="px-4 py-3">{paymentLabel(row.metodo_pago)}</td>
                  <td className="px-4 py-3">{row.cantidad_items}</td>
                  <td className="px-4 py-3 font-semibold">$ {formatMoney(row.total)}</td>
                  <td className="px-4 py-3">{row.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
