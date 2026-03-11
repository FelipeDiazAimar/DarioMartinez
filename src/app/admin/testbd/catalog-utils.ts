import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';
import { createClient } from '@supabase/supabase-js';

type ProductRow = Record<string, unknown>;

export type CatalogItem = {
  id: string;
  articleNumber: string;
  title: string;
  stock: number;
  imageUrl: string;
  visibleInTestbd: boolean;
  descriptionAdditional?: string;
  notes?: string;
  price?: number;
  priceCurrency?: string;
  code?: string;
};

type ArticulosApiResponse = {
  success?: boolean;
  message?: string;
  data?: ProductRow[];
};

type CatalogFetchResult = {
  endpointUsed: string;
  allItems: CatalogItem[];
  visibleInStockItems: CatalogItem[];
};

export type CategoryOption = {
  id: string;
  nombre: string;
};

export type CatalogCategoryData = {
  categories: CategoryOption[];
  articleCategoryByNumber: Record<string, string>;
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function parseNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  const cleaned = value
    .trim()
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '');

  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseVisibility(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'si' || normalized === 'sí';
  }

  return false;
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized === '0' || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return undefined;
  }

  return normalized;
}

function normalizeIdentifierText(value: unknown) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : undefined;
}

function pickText(row: ProductRow, candidates: string[], fallback: string) {
  for (const candidate of candidates) {
    const value = normalizeOptionalText(row[candidate]);
    if (value) {
      return value;
    }
  }

  return fallback;
}

function pickOptionalText(row: ProductRow, candidates: string[]) {
  for (const candidate of candidates) {
    const value = normalizeOptionalText(row[candidate]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function normalizeImageUrl(value: unknown, apiBaseUrl: string) {
  if (typeof value !== 'string') {
    return '';
  }

  const raw = value.trim();
  if (!raw) {
    return '';
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (/^\/\//.test(raw)) {
    return `https:${raw}`;
  }

  if (/^file:\/\//i.test(raw)) {
    return '';
  }

  if (/^[a-zA-Z]:\\/.test(raw) || raw.includes('\\')) {
    return '';
  }

  if (raw.startsWith('/')) {
    const base = apiBaseUrl.replace(/\/$/, '');
    return `${base}${raw}`;
  }

  if (/^[a-zA-Z0-9][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
    return raw;
  }

  return '';
}

function parseJsonSafely(rawText: string) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }

  const sanitized = trimmed.replace(/^\)\]\}',?\s*/, '');
  return JSON.parse(sanitized);
}

async function fetchArticulos(endpoint: string, apiToken: string) {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    cache: 'no-store',
  });

  const rawText = await response.text();
  let payload: ArticulosApiResponse | null = null;

  try {
    payload = parseJsonSafely(rawText) as ArticulosApiResponse | null;
  } catch {
    const preview = rawText.trim().slice(0, 180).replace(/\s+/g, ' ');
    throw new Error(`Respuesta no JSON desde API (${response.status}). Preview: ${preview || '[vacío]'}`);
  }

  if (!response.ok) {
    throw new Error(payload?.message || `La API respondió ${response.status}.`);
  }

  if (!payload?.success || !Array.isArray(payload?.data)) {
    throw new Error(payload?.message || 'La API no devolvió artículos válidos.');
  }

  return payload;
}

export function mapCatalogItem(row: ProductRow, index: number, apiBaseUrl: string): CatalogItem {
  const stock = parseNumber(row.cantidadUnidades);
  const imageUrl = normalizeImageUrl(row.imagen, apiBaseUrl);
  const visibleInTestbd = parseVisibility(row.mostrar_en_testbd);

  const title = pickText(row, ['descripcion', 'nombre', 'producto', 'articulo', 'denominacion', 'detalle'], `Artículo #${index + 1}`);
  const articleNumber =
    normalizeIdentifierText(row.codigo) ??
    normalizeIdentifierText(row.cod) ??
    normalizeIdentifierText(row.sku) ??
    normalizeIdentifierText(row.nroArticulo) ??
    normalizeIdentifierText(row.articulo) ??
    normalizeIdentifierText(row.id) ??
    `articulo-${index}`;

  const code =
    normalizeIdentifierText(row.codigo) ??
    normalizeIdentifierText(row.cod) ??
    normalizeIdentifierText(row.sku) ??
    normalizeIdentifierText(row.nroArticulo) ??
    normalizeIdentifierText(row.articulo);

  const rawId = code ?? row.id;
  const id = rawId !== undefined && rawId !== null && String(rawId).trim() ? String(rawId).trim() : `${title}-${index}`;

  const price = parseNumber(row.precio ?? row.costo ?? row.costoBase);
  const descriptionAdditional = pickOptionalText(row, ['DescripcionWeb', 'descripcionweb', 'descripcionAdicional']);
  const notes = pickOptionalText(row, ['AnotacionesWeb', 'anotacionesweb', 'anotaciones']);
  const priceCurrency = pickOptionalText(row, ['moneda', 'costoMoneda']);

  return {
    id,
    articleNumber,
    title,
    stock,
    imageUrl,
    visibleInTestbd,
    descriptionAdditional,
    notes,
    price: price > 0 ? price : undefined,
    priceCurrency,
    code,
  };
}

export async function fetchCatalogItems(apiBaseUrl: string, apiToken: string): Promise<CatalogFetchResult> {
  const primaryBase = resolveApiBaseUrl(apiBaseUrl);
  const primaryEndpoint = `${primaryBase}/articulos`;
  const fallbackEndpoint = 'http://127.0.0.1:3001/articulos';
  const endpointsToTry = Array.from(new Set([primaryEndpoint, fallbackEndpoint]));

  let endpointUsed = primaryEndpoint;
  let payload: ArticulosApiResponse | null = null;
  let lastError: Error | null = null;

  for (const endpoint of endpointsToTry) {
    try {
      payload = await fetchArticulos(endpoint, apiToken);
      endpointUsed = endpoint;
      break;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  if (!payload || !Array.isArray(payload.data)) {
    throw lastError || new Error('No se pudo obtener respuesta válida de la API.');
  }

  const allItems = payload.data.map((row, index) => mapCatalogItem(row, index, primaryBase));
  const visibleInStockItems = allItems.filter((item) => item.stock > 0 && item.visibleInTestbd);

  return {
    endpointUsed,
    allItems,
    visibleInStockItems,
  };
}

export async function fetchCatalogCategoryData(articleNumbers: string[]): Promise<CatalogCategoryData> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      categories: [],
      articleCategoryByNumber: {},
    };
  }

  const uniqueArticleNumbers = Array.from(new Set(articleNumbers.map((value) => value.trim()).filter(Boolean)));

  const [categoriesResult, relationsResult] = await Promise.all([
    supabase
      .from('categorias_articulos')
      .select('id, nombre')
      .order('nombre', { ascending: true }),
    uniqueArticleNumbers.length > 0
      ? supabase
          .from('articulos_categorias')
          .select('articulo_numero, categoria_id')
          .in('articulo_numero', uniqueArticleNumbers)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message || 'No se pudieron cargar categorías.');
  }

  if (relationsResult.error) {
    throw new Error(relationsResult.error.message || 'No se pudieron cargar asignaciones de categorías.');
  }

  const categories = (categoriesResult.data ?? []).map((item) => ({
    id: String(item.id),
    nombre: String(item.nombre),
  }));

  const articleCategoryByNumber = Object.fromEntries(
    (relationsResult.data ?? [])
      .filter((item) => item?.articulo_numero && item?.categoria_id)
      .map((item) => [String(item.articulo_numero), String(item.categoria_id)]),
  );

  return {
    categories,
    articleCategoryByNumber,
  };
}