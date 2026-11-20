import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Acceso a Supabase para el panel, del lado del servidor y con la clave de servicio.
// El middleware exige sesión de admin para todo /api/admin/*, así que esta ruta no es pública.
// Lo usa src/lib/admin-db-client.ts, que imita la parte de supabase-js que usan las páginas del panel.

const ALLOWED_TABLES = new Set([
  'consultas',
  'contacto_info',
  'controladores_fiscales_content',
  'home_content',
  'imagenes',
  'posberry_content',
  'preguntas_frecuentes',
  'productos',
  'productos_categorias',
  'servicios',
  'sobre_nosotros',
]);

const ALLOWED_ACTIONS = new Set(['select', 'insert', 'update', 'upsert', 'delete']);
const COLUMN_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SELECT_PATTERN = /^[A-Za-z0-9_,\s*]+$/;

type Filter =
  | { op: 'eq'; column: string; value: unknown }
  | { op: 'in'; column: string; value: unknown[] }
  | { op: 'not'; column: string; operator: 'is' | 'eq'; value: unknown };

type DbRequest = {
  table: string;
  action: 'select' | 'insert' | 'update' | 'upsert' | 'delete';
  values?: unknown;
  columns?: string;
  returning?: string;
  filters?: Filter[];
  order?: { column: string; ascending?: boolean }[];
  limit?: number;
  mode?: 'single' | 'maybeSingle';
  onConflict?: string;
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function fail(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

function validColumn(value: unknown): value is string {
  return typeof value === 'string' && COLUMN_PATTERN.test(value);
}

function validSelect(value: unknown): value is string {
  return typeof value === 'string' && SELECT_PATTERN.test(value);
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail('Falta configurar Supabase en el servidor.', 500);

  let body: DbRequest;
  try {
    body = await request.json();
  } catch {
    return fail('Solicitud inválida.');
  }

  const { table, action } = body;
  if (!ALLOWED_TABLES.has(table)) return fail('Tabla no permitida.', 403);
  if (!ALLOWED_ACTIONS.has(action)) return fail('Operación no permitida.', 403);

  const filters = Array.isArray(body.filters) ? body.filters : [];
  const order = Array.isArray(body.order) ? body.order : [];

  // Un borrado o una actualización sin filtro tocaría la tabla entera: solo se acepta
  // si viene con algún filtro explícito (p. ej. preguntas frecuentes usa not id is null).
  if ((action === 'delete' || action === 'update') && filters.length === 0) {
    return fail('Falta un filtro para esta operación.');
  }

  for (const filter of filters) {
    if (!validColumn(filter?.column)) return fail('Columna de filtro inválida.');
    if (!['eq', 'in', 'not'].includes(filter.op)) return fail('Filtro no permitido.');
    if (filter.op === 'in' && !Array.isArray(filter.value)) return fail('El filtro "in" requiere una lista.');
    if (filter.op === 'not' && !['is', 'eq'].includes(filter.operator)) return fail('Filtro "not" no permitido.');
  }
  for (const item of order) {
    if (!validColumn(item?.column)) return fail('Columna de orden inválida.');
  }
  if (body.columns !== undefined && !validSelect(body.columns)) return fail('Columnas inválidas.');
  if (body.returning !== undefined && !validSelect(body.returning)) return fail('Columnas inválidas.');
  if (body.onConflict !== undefined && !validSelect(body.onConflict)) return fail('Columnas inválidas.');

  const base = supabase.from(table);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any;

  switch (action) {
    case 'select':
      query = base.select(body.columns ?? '*');
      break;
    case 'insert':
      query = base.insert(body.values as never);
      break;
    case 'update':
      query = base.update(body.values as never);
      break;
    case 'upsert':
      query = base.upsert(body.values as never, body.onConflict ? { onConflict: body.onConflict } : undefined);
      break;
    case 'delete':
      query = base.delete();
      break;
  }

  if (action !== 'select' && body.returning) {
    query = query.select(body.returning);
  }

  for (const filter of filters) {
    if (filter.op === 'eq') query = query.eq(filter.column, filter.value);
    else if (filter.op === 'in') query = query.in(filter.column, filter.value);
    else query = query.not(filter.column, filter.operator, filter.value);
  }
  for (const item of order) {
    query = query.order(item.column, { ascending: item.ascending !== false });
  }
  if (typeof body.limit === 'number' && body.limit > 0) {
    query = query.limit(Math.min(Math.floor(body.limit), 1000));
  }
  if (body.mode === 'single') query = query.single();
  else if (body.mode === 'maybeSingle') query = query.maybeSingle();

  const { data, error } = await query;

  if (error) {
    console.error('[admin-db]', table, action, error.message);
    return NextResponse.json({
      data: null,
      error: { message: error.message, code: error.code, details: error.details, hint: error.hint },
    });
  }

  return NextResponse.json({ data, error: null });
}
