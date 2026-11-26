// Almacén de la sección /revision: un bucket privado de Supabase con el catálogo,
// las piezas y un archivo de estado por pieza. Solo se usa desde rutas del servidor.
import { createHash, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { REVISION_VACIA, type Pieza, type Revision } from '@/lib/revision-tipos';

const BUCKET = 'revision';

// Huella SHA-256 de la clave que viaja en el enlace (la clave es aleatoria y no está en el repositorio).
// Para cambiar el enlace: generar otra clave y reemplazar esta huella.
const HUELLA_CLAVE = '81ab37eee63ee386facfa6177b443902b13f512735e9ad8ae6dcd8ddd5166031';
// Huella SHA-256 del PIN exclusivo para aprobar o desaprobar piezas (solo admin o jefa).
const HUELLA_PIN_APROBACION = 'f45b5e982551402070a055ded1b77b706363eab0ded6960ad0d621911aae08db';

export function esAdminCookie(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  return /(?:^|;\s*)admin_auth=1(?:;|$)/.test(cookieHeader);
}

export function claveValida(request: Request) {
  if (esAdminCookie(request)) {
    return true;
  }
  const clave = request.headers.get('x-revision-clave') ?? '';
  const huella = createHash('sha256').update(clave).digest();
  return timingSafeEqual(huella, Buffer.from(HUELLA_CLAVE, 'hex'));
}

export function puedeAprobar(request: Request) {
  if (esAdminCookie(request)) {
    return true;
  }
  const pin = (request.headers.get('x-revision-pin') ?? '').trim();
  if (!pin) return false;
  const huella = createHash('sha256').update(pin).digest();
  return timingSafeEqual(huella, Buffer.from(HUELLA_PIN_APROBACION, 'hex'));
}

export function almacen() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  }).storage.from(BUCKET);
}

export async function leerTexto(ruta: string) {
  const { data, error } = await almacen().download(ruta);
  if (error) throw error;
  return data.text();
}

export async function leerCatalogo(): Promise<Pieza[]> {
  const { data, error } = await almacen().list('catalogo', { limit: 1, sortBy: { column: 'name', order: 'desc' } });
  if (error) throw error;
  if (!data?.length) throw new Error('No hay catálogo cargado.');
  return JSON.parse(await leerTexto(`catalogo/${data[0].name}`)).piezas;
}

// Cada guardado crea un archivo nuevo (estado/<id>__<momento>.json): el almacén cachea las
// descargas, y sobrescribir el mismo nombre devolvería por un rato la versión anterior.
async function versiones() {
  const { data, error } = await almacen().list('estado', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
  if (error) throw error;
  const porPieza = new Map<string, string[]>();
  for (const { name } of data ?? []) {
    const [id, resto] = name.split('__');
    if (resto) porPieza.set(id, [...(porPieza.get(id) ?? []), name].sort());
  }
  return porPieza;
}

async function leerArchivo(nombre: string): Promise<Revision> {
  return { ...REVISION_VACIA, ...JSON.parse(await leerTexto(`estado/${nombre}`)) };
}

export async function leerRevision(id: string): Promise<Revision> {
  const nombre = (await versiones()).get(id)?.at(-1);
  return nombre ? leerArchivo(nombre) : REVISION_VACIA;
}

/** Lo que cargó el grupo: un archivo por aporte, que no se vuelve a escribir. Lo más nuevo primero. */
async function leerAportes(): Promise<Pieza[]> {
  const { data, error } = await almacen().list('aportes', { limit: 1000 });
  if (error) throw error;
  const nombres = (data ?? []).map((a) => a.name).filter((n) => n.endsWith('.json')).sort().reverse();
  return Promise.all(nombres.map(async (n) => JSON.parse(await leerTexto(`aportes/${n}`)) as Pieza));
}

export async function guardarAporte(pieza: Pieza) {
  const { error } = await almacen().upload(`aportes/${pieza.id}.json`, JSON.stringify(pieza), { contentType: 'application/json' });
  if (error) throw error;
}

/** Los aportes del grupo y las piezas producidas. */
export async function leerPiezas(): Promise<Pieza[]> {
  const [aportes, catalogo] = await Promise.all([leerAportes(), leerCatalogo()]);
  return [...aportes, ...catalogo];
}

/** Estados guardados. Las piezas sin archivo están pendientes. */
export async function leerRevisiones(): Promise<Record<string, Revision>> {
  const pares = await Promise.all(
    [...(await versiones())].map(async ([id, nombres]) => [id, await leerArchivo(nombres[nombres.length - 1])] as const),
  );
  return Object.fromEntries(pares);
}

export async function guardarRevision(id: string, revision: Revision) {
  const anteriores = (await versiones()).get(id) ?? [];
  const { error } = await almacen().upload(`estado/${id}__${Date.now()}.json`, JSON.stringify(revision), {
    contentType: 'application/json',
  });
  if (error) throw error;
  // Se conservan las últimas diez versiones por si hay que recuperar algo.
  const sobran = anteriores.slice(0, -9).map((nombre) => `estado/${nombre}`);
  if (sobran.length) await almacen().remove(sobran);
}
