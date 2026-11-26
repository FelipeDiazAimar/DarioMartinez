import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';

type RawRow = Record<string, unknown>;

export type SyncResult = {
  ok: boolean;
  needsSetup?: boolean;
  skipped?: boolean;
  totalArticles: number;
  publishedInStock: number;
  insertedOrUpdated: number;
  deleted: number;
  lastKardexMovimiento: number;
  syncedAt: string;
  message: string;
};

const KNOWN_BRANDS = [
  'EPSON', 'HP', 'BROTHER', 'SAMSUNG', 'HASAR', 'CANON', 'KYOCERA', 'XEROX', 'RICOH',
  'LOGITECH', 'GENIUS', 'BKT', 'PHILIPS', 'LG', 'DELL', 'LENOVO', 'ASUS', 'ACER', 'BANGHO', 'CX', 'PERFORMANCE',
  'KINGSTON', 'HIKSEMI', 'HIKVISION', 'SANDISK', 'WD', 'SEAGATE', 'CRUCIAL', 'ADATA', 'PATRIOT', 'GIGABYTE', 'MSI', 'INTEL', 'AMD',
  'TP-LINK', 'MERCUSYS', 'D-LINK', 'UBIQUITI', 'TENDA', 'NISUTA', 'INT-CO', 'SHURE', '3NSTAR', 'GLOBAL', 'SENTEY', 'REDRAGON', 'HYPERX', 'NOGA',
  'CASIO', 'EXAKTUS', 'CIFRA', 'SHARP', 'OLIVETTI', 'TEXAS',
  'LEDESMA', 'AUTOR', 'BOREAL', 'RIVADAVIA', 'EXITO', 'PELIKAN', 'BIC', 'FABER', 'STAEDTLER', 'EZCO', 'SIFAP', 'TRABI', 'MAPED', 'PIZZINI', 'KANEX', 'MIT', 'SIMBALL', 'FILGO', 'SHARPIE', '3M', 'POST-IT', 'ENERGIZER', 'DURACELL', 'PHILCO', 'SONY', 'PANASONIC', 'COLLEGE', 'SYSTEL', 'KRETZ', 'TECHMAR',
];

export function detectProductBrand(text: string): string {
  const normalized = ` ${text.toUpperCase().replace(/TP\s+LINK|TPLINK/g, 'TP-LINK').replace(/INTCO/g, 'INT-CO').replace(/SEGATE/g, 'SEAGATE').replace(/PERFORMNCE/g, 'PERFORMANCE')} `;
  for (const brand of KNOWN_BRANDS) {
    if (
      normalized.includes(` ${brand} `) ||
      normalized.includes(` ${brand}-`) ||
      normalized.includes(`-${brand}`) ||
      normalized.includes(`/${brand}`) ||
      normalized.includes(`${brand}/`)
    ) {
      return brand;
    }
  }
  for (const brand of KNOWN_BRANDS) {
    if (brand.length >= 4 && normalized.includes(brand)) {
      return brand;
    }
  }
  return 'GENERICO';
}

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    msg.includes('could not find the table') ||
    msg.includes('does not exist')
  );
}

function parseNum(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const cleaned = value.trim().replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'si' || v === 'sí';
  }
  return false;
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const t = value.trim();
  if (!t || t === '0' || t.toLowerCase() === 'null' || t.toLowerCase() === 'undefined') return null;
  return t;
}

function normalizeRowForMirror(row: RawRow, stockMap: Record<string, number>) {
  const code = String(row.codigo ?? row.cod ?? row.sku ?? row.nroArticulo ?? row.articulo ?? row.id ?? '').trim();
  if (!code || code === '0') return null;

  const titulo =
    cleanText(row.descripcion) ||
    cleanText(row.nombre) ||
    cleanText(row.producto) ||
    cleanText(row.detalle) ||
    `Artículo ${code}`;

  const descripcion_web = cleanText(row.DescripcionWeb ?? row.descripcionweb ?? row.descripcionAdicional);
  const anotaciones_web = cleanText(row.AnotacionesWeb ?? row.anotacionesweb ?? row.anotaciones);
  const stockFromMap = stockMap[code];
  const stock = Number.isFinite(stockFromMap) ? stockFromMap : parseNum(row.stockKardex ?? row.stockkardex ?? 0);
  const precioRaw = parseNum(row.precio ?? row.costo ?? row.costoBase);
  const precio = precioRaw > 0 ? precioRaw : null;
  const moneda = cleanText(row.moneda ?? row.costoMoneda);
  const rawImg = typeof row.imagen === 'string' ? row.imagen.trim() : '';
  const imagen_url = /^https?:\/\//i.test(rawImg) || rawImg.startsWith('/') ? rawImg : '';
  const mostrar_en_web = parseBool(row.mostrar_en_testbd ?? row.mostrarEnTestbd ?? 0);
  const linea = row.linea !== undefined && row.linea !== null ? String(row.linea).trim() : null;
  const rubro = row.rubro !== undefined && row.rubro !== null ? String(row.rubro).trim() : null;
  const marca = detectProductBrand(`${titulo} ${descripcion_web || ''}`);

  const hashPayload = JSON.stringify({
    code,
    titulo,
    descripcion_web,
    anotaciones_web,
    stock,
    precio,
    moneda,
    imagen_url,
    mostrar_en_web,
    linea,
    rubro,
    marca,
  });

  const content_hash = crypto.createHash('sha256').update(hashPayload).digest('hex').slice(0, 32);

  return {
    codigo: code,
    id: code,
    titulo,
    descripcion_web,
    anotaciones_web,
    stock,
    precio,
    moneda,
    imagen_url,
    mostrar_en_web,
    linea,
    rubro,
    marca,
    content_hash,
    updated_at: new Date().toISOString(),
  };
}

async function fetchJsonAuth(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} en ${url}`);
  }
  return res.json();
}

export async function syncCatalogChangesToSupabase(): Promise<SyncResult> {
  const apiBaseUrl = process.env.API_BASE_URL;
  const apiToken = process.env.API_TOKEN;
  if (!apiBaseUrl || !apiToken) {
    throw new Error('Faltan API_BASE_URL o API_TOKEN para sincronizar.');
  }

  const supabase = getSupabaseAdmin();
  const base = resolveApiBaseUrl(apiBaseUrl);

  // Verificar que exista la tabla espejo en Supabase
  const existingRes = await supabase
    .from('catalogo_productos')
    .select('codigo, content_hash');

  if (isMissingTableError(existingRes.error)) {
    return {
      ok: false,
      needsSetup: true,
      totalArticles: 0,
      publishedInStock: 0,
      insertedOrUpdated: 0,
      deleted: 0,
      lastKardexMovimiento: 0,
      syncedAt: new Date().toISOString(),
      message: 'Ejecutá docs/supabase-catalog-mirror.sql en Supabase para activar el espejo de catálogo.',
    };
  }
  if (existingRes.error) {
    throw new Error(existingRes.error.message);
  }

  const existingHashes = new Map<string, string>(
    (existingRes.data || []).map((row: { codigo: string; content_hash: string }) => [
      row.codigo,
      row.content_hash,
    ])
  );

  // Obtener stock, artículos y último movimiento de kardex desde el servidor local
  const [stockJson, firstArtJson, firstKardexJson] = await Promise.all([
    fetchJsonAuth(`${base}/articulos/stock`, apiToken),
    fetchJsonAuth(`${base}/articulos?page=1&pageSize=200`, apiToken),
    fetchJsonAuth(`${base}/kardex?page=1&pageSize=1`, apiToken).catch(() => null),
  ]);

  const stockMap: Record<string, number> = {};
  if (stockJson?.data && typeof stockJson.data === 'object') {
    for (const [code, info] of Object.entries(stockJson.data as Record<string, { stock?: unknown }>)) {
      stockMap[code.trim()] = parseNum(info?.stock);
    }
  }

  const allRaw: RawRow[] = [...(Array.isArray(firstArtJson?.data) ? firstArtJson.data : [])];
  const totalPages = Number(firstArtJson?.pagination?.totalPages || 1);
  if (totalPages > 1) {
    const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const results = await Promise.all(
      pages.map((p) => fetchJsonAuth(`${base}/articulos?page=${p}&pageSize=200`, apiToken))
    );
    for (const r of results) {
      if (Array.isArray(r?.data)) allRaw.push(...r.data);
    }
  }

  // Obtener último movimiento del kardex (si disponible)
  let lastKardexMovimiento = 0;
  try {
    const kPages = Number(firstKardexJson?.pagination?.totalPages || 1);
    if (kPages > 0) {
      const lastK = await fetchJsonAuth(`${base}/kardex?page=${kPages}&pageSize=1`, apiToken);
      const lastRow = Array.isArray(lastK?.data) ? lastK.data[lastK.data.length - 1] : null;
      lastKardexMovimiento = Number(lastRow?.movimiento || 0);
    }
  } catch {
    lastKardexMovimiento = 0;
  }

  const mirrorMap = new Map<string, NonNullable<ReturnType<typeof normalizeRowForMirror>>>();
  for (const row of allRaw) {
    const normalized = normalizeRowForMirror(row, stockMap);
    if (normalized) {
      mirrorMap.set(normalized.codigo, normalized);
    }
  }

  const allNormalized = Array.from(mirrorMap.values());
  const changedRows = allNormalized.filter(
    (item) => existingHashes.get(item.codigo) !== item.content_hash
  );
  const removedCodes = Array.from(existingHashes.keys()).filter((code) => !mirrorMap.has(code));

  const publishedInStock = allNormalized.filter((i) => i.mostrar_en_web && i.stock > 0).length;
  const nowIso = new Date().toISOString();

  // Si NO hay cambios reales, no escribimos ninguna fila en catalogo_productos
  if (changedRows.length === 0 && removedCodes.length === 0) {
    await supabase
      .from('catalogo_sync_state')
      .upsert({
        id: 1,
        last_kardex_movimiento: lastKardexMovimiento,
        total_articles: allNormalized.length,
        published_in_stock: publishedInStock,
        last_changed_count: 0,
        last_checked_at: nowIso,
      })
      .select();

    return {
      ok: true,
      skipped: true,
      totalArticles: allNormalized.length,
      publishedInStock,
      insertedOrUpdated: 0,
      deleted: 0,
      lastKardexMovimiento,
      syncedAt: nowIso,
      message: 'Sin cambios detectados: el espejo en Supabase ya estaba 100% actualizado.',
    };
  }

  // Replicar únicamente las filas que cambiaron (en lotes de 200)
  for (let i = 0; i < changedRows.length; i += 200) {
    const batch = changedRows.slice(i, i + 200);
    const { error } = await supabase
      .from('catalogo_productos')
      .upsert(batch, { onConflict: 'codigo' });
    if (error) {
      throw new Error(`Error replicando lote a Supabase: ${error.message}`);
    }
  }

  // Eliminar códigos borrados en MySQL
  for (let i = 0; i < removedCodes.length; i += 200) {
    const batch = removedCodes.slice(i, i + 200);
    await supabase.from('catalogo_productos').delete().in('codigo', batch);
  }

  const globalChecksum = crypto
    .createHash('sha256')
    .update(allNormalized.map((i) => `${i.codigo}:${i.content_hash}`).sort().join('|'))
    .digest('hex')
    .slice(0, 32);

  await supabase.from('catalogo_sync_state').upsert({
    id: 1,
    last_kardex_movimiento: lastKardexMovimiento,
    last_checksum: globalChecksum,
    total_articles: allNormalized.length,
    published_in_stock: publishedInStock,
    last_changed_count: changedRows.length + removedCodes.length,
    last_checked_at: nowIso,
    last_synced_at: nowIso,
  });

  return {
    ok: true,
    skipped: false,
    totalArticles: allNormalized.length,
    publishedInStock,
    insertedOrUpdated: changedRows.length,
    deleted: removedCodes.length,
    lastKardexMovimiento,
    syncedAt: nowIso,
    message: `Replicados ${changedRows.length} artículos modificados y ${removedCodes.length} eliminados.`,
  };
}
