import { resolveApiBaseUrl } from '@/lib/resolve-api-base-url';

type ProductRow = Record<string, unknown>;

export type CatalogItem = {
  id: string;
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
  const code = pickOptionalText(row, ['codigo', 'cod', 'sku', 'nroArticulo', 'articulo']);
  const rawId = code ?? row.id;
  const id = rawId !== undefined && rawId !== null && String(rawId).trim() ? String(rawId).trim() : `${title}-${index}`;

  const price = parseNumber(row.precio ?? row.costo ?? row.costoBase);
  const descriptionAdditional = pickOptionalText(row, ['descripcionAdicional']);
  const notes = pickOptionalText(row, ['anotaciones']);
  const priceCurrency = pickOptionalText(row, ['moneda', 'costoMoneda']);

  return {
    id,
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