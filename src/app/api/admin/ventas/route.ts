import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type PaymentMethod = 'efectivo' | 'transferencia_mp' | 'tarjeta_mp';

type VentaItemInput = {
  id: string;
  title: string;
  quantity: number;
  price?: number;
  stock?: number;
  imageUrl?: string;
  descriptionAdditional?: string;
};

type VentaBody = {
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  items: VentaItemInput[];
};

type VentaRow = {
  id: number;
  nro_compra: string;
  fecha: string;
  nombre_apellido: string;
  telefono: string;
  metodo_pago: PaymentMethod;
  subtotal: number;
  total: number;
  estado: 'pendiente' | 'pagada' | 'cancelada';
};

const paymentMethods: PaymentMethod[] = ['efectivo', 'transferencia_mp', 'tarjeta_mp'];

function normalizePhone(value: string) {
  return value.replace(/[^0-9+\-()\s]/g, '').trim();
}

function hasMinPhoneDigits(value: string, minDigits = 7) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= minDigits;
}

function toSafeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para registrar ventas.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function generateNroCompra(supabaseAdmin: ReturnType<typeof getSupabaseAdmin>) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  const prefix = `CMP-${datePart}-`;

  const { data, error } = await supabaseAdmin
    .from('ventas_admin')
    .select('nro_compra')
    .like('nro_compra', `${prefix}%`)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  const lastNro = typeof data?.nro_compra === 'string' ? data.nro_compra : '';
  const lastSequence = Number.parseInt(lastNro.slice(prefix.length), 10);
  const nextSequence = Number.isFinite(lastSequence) ? lastSequence + 1 : 1;

  return `${prefix}${String(nextSequence).padStart(6, '0')}`;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const pageRaw = Number.parseInt(requestUrl.searchParams.get('page') ?? '1', 10);
    const pageSizeRaw = Number.parseInt(requestUrl.searchParams.get('pageSize') ?? '20', 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const pageSize = Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 ? Math.min(pageSizeRaw, 100) : 20;

    const supabaseAdmin = getSupabaseAdmin();

    const countResult = await supabaseAdmin.from('ventas_admin').select('id', { count: 'exact', head: true });

    if (countResult.error) {
      throw new Error(countResult.error.message);
    }

    const total = countResult.count ?? 0;
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;
    const normalizedPage = Math.min(page, totalPages);
    const from = (normalizedPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const ventasResult = await supabaseAdmin
      .from('ventas_admin')
      .select('id, nro_compra, fecha, nombre_apellido, telefono, metodo_pago, subtotal, total, estado')
      .order('id', { ascending: false })
      .range(from, to);

    if (ventasResult.error) {
      throw new Error(ventasResult.error.message);
    }

    const ventas = (ventasResult.data ?? []) as VentaRow[];
    const ventaIds = ventas.map((venta) => venta.id);

    let itemCountByVentaId = new Map<number, number>();

    if (ventaIds.length > 0) {
      const itemsResult = await supabaseAdmin.from('ventas_admin_items').select('venta_id, cantidad').in('venta_id', ventaIds);

      if (itemsResult.error) {
        throw new Error(itemsResult.error.message);
      }

      itemCountByVentaId = (itemsResult.data ?? []).reduce((acc, row: any) => {
        const ventaId = Number(row.venta_id);
        const cantidad = Number(row.cantidad ?? 0);
        acc.set(ventaId, (acc.get(ventaId) ?? 0) + (Number.isFinite(cantidad) ? cantidad : 0));
        return acc;
      }, new Map<number, number>());
    }

    const data = ventas.map((venta) => ({
      ...venta,
      cantidad_items: itemCountByVentaId.get(venta.id) ?? 0,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: normalizedPage,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo listar las ventas.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<VentaBody>;

    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerPhoneRaw = typeof body.customerPhone === 'string' ? body.customerPhone : '';
    const customerPhone = normalizePhone(customerPhoneRaw);
    const paymentMethod = body.paymentMethod;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!customerName) {
      return NextResponse.json({ success: false, message: 'Nombre y apellido es obligatorio.' }, { status: 400 });
    }

    if (!customerPhone) {
      return NextResponse.json({ success: false, message: 'Teléfono es obligatorio.' }, { status: 400 });
    }

    if (!hasMinPhoneDigits(customerPhone)) {
      return NextResponse.json({ success: false, message: 'Teléfono inválido. Debe contener al menos 7 dígitos.' }, { status: 400 });
    }

    if (!paymentMethod || !paymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ success: false, message: 'Método de pago inválido.' }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'El carrito no tiene productos.' }, { status: 400 });
    }

    const normalizedItems = items.map((item) => {
      const id = typeof item.id === 'string' ? item.id.trim() : '';
      const title = typeof item.title === 'string' ? item.title.trim() : '';
      const quantity = Math.max(1, Math.floor(toSafeNumber(item.quantity)));
      const price = Math.max(0, toSafeNumber(item.price));
      const stock = Math.max(0, Math.floor(toSafeNumber(item.stock)));
      const imageUrl = typeof item.imageUrl === 'string' ? item.imageUrl.trim() : '';
      const descriptionAdditional = typeof item.descriptionAdditional === 'string' ? item.descriptionAdditional.trim() : '';

      return {
        id,
        title,
        quantity,
        price,
        stock,
        imageUrl,
        descriptionAdditional,
      };
    });

    if (normalizedItems.some((item) => !item.id || !item.title)) {
      return NextResponse.json({ success: false, message: 'Hay productos inválidos en el carrito.' }, { status: 400 });
    }

    const subtotal = normalizedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal;

    const supabaseAdmin = getSupabaseAdmin();
    const nroCompra = await generateNroCompra(supabaseAdmin);

    const ventaResult = await supabaseAdmin
      .from('ventas_admin')
      .insert({
        nro_compra: nroCompra,
        nombre_apellido: customerName,
        telefono: customerPhone,
        metodo_pago: paymentMethod,
        subtotal,
        total,
        estado: 'pendiente',
      })
      .select('id')
      .single();

    if (ventaResult.error || !ventaResult.data?.id) {
      throw new Error(ventaResult.error?.message || 'No se pudo crear la venta.');
    }

    const ventaId = Number(ventaResult.data.id);

    const itemsPayload = normalizedItems.map((item) => ({
      venta_id: ventaId,
      producto_id: item.id,
      producto_nombre: item.title,
      precio_unitario: item.price,
      cantidad: item.quantity,
      stock_al_momento: item.stock,
      imagen_url: item.imageUrl || null,
      descripcion_adicional: item.descriptionAdditional || null,
    }));

    const itemsInsert = await supabaseAdmin.from('ventas_admin_items').insert(itemsPayload);

    if (itemsInsert.error) {
      await supabaseAdmin.from('ventas_admin').delete().eq('id', ventaId);
      throw new Error(itemsInsert.error.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Compra registrada correctamente.',
      data: {
        id: ventaId,
        nro_compra: nroCompra,
        total,
        items: normalizedItems.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'No se pudo registrar la compra.',
      },
      { status: 500 },
    );
  }
}
