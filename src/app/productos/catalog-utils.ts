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
  brand?: string;
};

type ArticulosApiResponse = {
  success?: boolean;
  message?: string;
  data?: ProductRow[];
  pagination?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
};

type StockApiResponse = {
  success?: boolean;
  message?: string;
  data?: Record<string, { stock?: unknown }>;
};

type CatalogFetchResult = {
  endpointUsed: string;
  source: 'supabase' | 'api';
  allItems: CatalogItem[];
  visibleInStockItems: CatalogItem[];
};

export type CatalogPageFetchResult = {
  endpointUsed: string;
  source: 'supabase' | 'api';
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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

// Caché en memoria de servidor como respaldo rápido si aún no existe el espejo en Supabase
const FALLBACK_CACHE_TTL_MS = 60_000;
let fallbackCatalogCache: { expiresAt: number; result: CatalogFetchResult } | null = null;
let categoriesListCache: { expiresAt: number; categories: CategoryOption[] } | null = null;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function parseNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const cleaned = value.trim().replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseVisibility(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'si' || normalized === 'sí';
  }
  return false;
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  if (!normalized || normalized === '0' || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
    return undefined;
  }
  return normalized;
}

function normalizeIdentifierText(value: unknown) {
  if (value === null || value === undefined) return undefined;
  const normalized = String(value).trim();
  return normalized ? normalized : undefined;
}

function pickText(row: ProductRow, candidates: string[], fallback: string) {
  for (const candidate of candidates) {
    const value = normalizeOptionalText(row[candidate]);
    if (value) return value;
  }
  return fallback;
}

function pickOptionalText(row: ProductRow, candidates: string[]) {
  for (const candidate of candidates) {
    const value = normalizeOptionalText(row[candidate]);
    if (value) return value;
  }
  return undefined;
}

function pickRowValue(row: ProductRow, candidates: string[]) {
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(row, candidate)) return row[candidate];
    const lowered = candidate.toLowerCase();
    const match = Object.keys(row).find((key) => key.toLowerCase() === lowered);
    if (match) return row[match];
  }
  return undefined;
}

function normalizeImageUrl(value: unknown, apiBaseUrl: string) {
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^\/\//.test(raw)) return `https:${raw}`;
  if (/^file:\/\//i.test(raw) || /^[a-zA-Z]:\\/.test(raw) || raw.includes('\\')) return '';
  if (raw.startsWith('/')) {
    if (raw.startsWith('/brand-cards/') || raw.startsWith('/integrations/') || raw.startsWith('/LOGO')) {
      return raw;
    }
    const base = apiBaseUrl.replace(/\/$/, '');
    return base ? `${base}${raw}` : raw;
  }
  return '';
}

function mapMirrorRowToCatalogItem(row: Record<string, any>): CatalogItem {
  const code = String(row.codigo ?? row.id ?? '').trim();
  return {
    id: code,
    articleNumber: code,
    code,
    title: String(row.titulo ?? `Artículo ${code}`),
    stock: Number(row.stock ?? 0),
    imageUrl: typeof row.imagen_url === 'string' ? row.imagen_url.trim() : '',
    visibleInTestbd: Boolean(row.mostrar_en_web),
    descriptionAdditional: row.descripcion_web || undefined,
    notes: row.anotaciones_web || undefined,
    price: row.precio ? Number(row.precio) : undefined,
    priceCurrency: row.moneda || undefined,
    brand: row.marca || undefined,
  };
}

function parseJsonSafely(rawText: string) {
  const trimmed = rawText.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed.replace(/^\)\]\}',?\s*/, ''));
}

async function fetchArticulos(endpoint: string, apiToken: string) {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiToken}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
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

async function fetchStockMap(endpoint: string, apiToken: string): Promise<Record<string, number>> {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const rawText = await response.text();
    const payload = parseJsonSafely(rawText) as StockApiResponse | null;
    if (!response.ok || !payload?.success || !payload.data || typeof payload.data !== 'object') {
      return {};
    }
    return Object.fromEntries(Object.entries(payload.data).map(([code, info]) => [code.trim(), parseNumber(info?.stock)]));
  } catch {
    return {};
  }
}

export function mapCatalogItem(row: ProductRow, index: number, apiBaseUrl: string): CatalogItem {
  const stock = parseNumber(pickRowValue(row, ['stockKardex', 'stockkardex', 'stock_kardex', 'stock_kardex_total']) ?? 0);
  const imageUrl = normalizeImageUrl(row.imagen, apiBaseUrl);
  const visibleInTestbd = parseVisibility(pickRowValue(row, ['mostrar_en_testbd', 'mostrarEnTestbd', 'mostrarentestbd']) ?? 0);
  const title = pickText(row, ['descripcion', 'nombre', 'producto', 'articulo', 'denominacion', 'detalle'], `Artículo #${index + 1}`);
  const code =
    normalizeIdentifierText(row.codigo) ??
    normalizeIdentifierText(row.cod) ??
    normalizeIdentifierText(row.sku) ??
    normalizeIdentifierText(row.nroArticulo) ??
    normalizeIdentifierText(row.articulo);
  const articleNumber = code ?? normalizeIdentifierText(row.id) ?? `articulo-${index}`;
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

/**
 * Lectura principal ultra-rápida desde Supabase `catalogo_productos` (espejo sin dependencia del servidor local).
 * Si la tabla aún no fue creada o está vacía, cae automáticamente a la API con caché en memoria.
 */
async function tryFetchMirrorPage(options: {
  page: number;
  pageSize: number;
  searchTerm?: string;
  categoryId?: string;
}): Promise<CatalogPageFetchResult | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    let categoryArticleNumbers: string[] | null = null;
    if (options.categoryId && options.categoryId !== 'all') {
      const { data: rels, error: relErr } = await supabase
        .from('articulos_categorias')
        .select('articulo_numero')
        .eq('categoria_id', options.categoryId);

      if (relErr) return null;
      categoryArticleNumbers = (rels || []).map((r: any) => String(r.articulo_numero)).filter(Boolean);
      if (categoryArticleNumbers.length === 0) {
        return {
          endpointUsed: 'supabase://catalogo_productos',
          source: 'supabase',
          page: 1,
          pageSize: options.pageSize,
          total: 0,
          totalPages: 1,
          allItems: [],
          visibleInStockItems: [],
        };
      }
    }

    // Verificar si la tabla espejo tiene datos
    let query = supabase
      .from('catalogo_productos')
      .select('*', { count: 'exact' })
      .eq('mostrar_en_web', true)
      .gt('stock', 0);

    if (categoryArticleNumbers) {
      query = query.in('codigo', categoryArticleNumbers);
    }

    if (options.searchTerm && options.searchTerm.trim().length > 0) {
      const safeQ = options.searchTerm.trim().replace(/[%(),]/g, ' ');
      query = query.or(`titulo.ilike.%${safeQ}%,descripcion_web.ilike.%${safeQ}%,codigo.ilike.%${safeQ}%,marca.ilike.%${safeQ}%`);
    }

    const from = (options.page - 1) * options.pageSize;
    const to = from + options.pageSize - 1;

    const { data, count, error } = await query
      .order('stock', { ascending: false })
      .order('titulo', { ascending: true })
      .range(from, to);

    if (error) {
      return null;
    }

    const total = Number(count ?? 0);
    // Si sin filtros devuelve 0 filas, verificar si el espejo todavía está vacío
    if (total === 0 && !options.searchTerm && (!options.categoryId || options.categoryId === 'all')) {
      const anyRow = await supabase.from('catalogo_productos').select('codigo').limit(1);
      if (!anyRow.data || anyRow.data.length === 0) {
        return null;
      }
    }

    const items = (data || []).map(mapMirrorRowToCatalogItem);
    const totalPages = Math.max(1, Math.ceil(total / options.pageSize));

    return {
      endpointUsed: 'supabase://catalogo_productos',
      source: 'supabase',
      page: Math.min(options.page, totalPages),
      pageSize: options.pageSize,
      total,
      totalPages,
      allItems: items,
      visibleInStockItems: items,
    };
  } catch {
    return null;
  }
}

export async function fetchCatalogItemById(
  id: string,
  apiBaseUrl?: string,
  apiToken?: string
): Promise<{ item: CatalogItem | null; relatedItems: CatalogItem[]; source: 'supabase' | 'api' }> {
  const decodedId = decodeURIComponent(id).trim();
  const supabase = getSupabaseAdmin();

  // 1. Camino ultra-rápido desde Supabase (1 sola consulta por clave primaria)
  if (supabase) {
    try {
      const { data: row, error } = await supabase
        .from('catalogo_productos')
        .select('*')
        .eq('codigo', decodedId)
        .maybeSingle();

      if (!error && row) {
        const item = mapMirrorRowToCatalogItem(row);

        // Relacionados por misma categoría o misma línea/marca
        const { data: catRel } = await supabase
          .from('articulos_categorias')
          .select('categoria_id')
          .eq('articulo_numero', item.articleNumber)
          .maybeSingle();

        let relatedRows: any[] = [];
        if (catRel?.categoria_id) {
          const { data: siblings } = await supabase
            .from('articulos_categorias')
            .select('articulo_numero')
            .eq('categoria_id', catRel.categoria_id)
            .neq('articulo_numero', item.articleNumber)
            .limit(40);

          const siblingCodes = (siblings || []).map((s: any) => String(s.articulo_numero));
          if (siblingCodes.length > 0) {
            const { data: relProds } = await supabase
              .from('catalogo_productos')
              .select('*')
              .in('codigo', siblingCodes)
              .eq('mostrar_en_web', true)
              .gt('stock', 0)
              .limit(16);
            relatedRows = relProds || [];
          }
        }

        if (relatedRows.length < 6) {
          const { data: fallbackRel } = await supabase
            .from('catalogo_productos')
            .select('*')
            .eq('mostrar_en_web', true)
            .gt('stock', 0)
            .neq('codigo', item.articleNumber)
            .order('stock', { ascending: false })
            .limit(16);
          const seen = new Set(relatedRows.map((r) => r.codigo));
          for (const fr of fallbackRel || []) {
            if (!seen.has(fr.codigo) && relatedRows.length < 16) {
              relatedRows.push(fr);
              seen.add(fr.codigo);
            }
          }
        }

        return {
          item,
          relatedItems: relatedRows.map(mapMirrorRowToCatalogItem),
          source: 'supabase',
        };
      }
    } catch {
      // fallback to API below
    }
  }

  // 2. Fallback a API (con caché en memoria de 60s para no re-descargar 1.473 filas en cada clic)
  if (!apiBaseUrl || !apiToken) {
    return { item: null, relatedItems: [], source: 'api' };
  }

  const catalogResult = await fetchCatalogItems(apiBaseUrl, apiToken);
  const item =
    catalogResult.allItems.find((candidate) => candidate.id === decodedId || candidate.articleNumber === decodedId) ||
    null;

  if (!item) {
    return { item: null, relatedItems: [], source: catalogResult.source };
  }

  const pool = catalogResult.visibleInStockItems.filter((candidate) => candidate.id !== item.id);
  return {
    item,
    relatedItems: pool.slice(0, 16),
    source: catalogResult.source,
  };
}

export async function fetchCatalogItems(apiBaseUrl: string, apiToken: string): Promise<CatalogFetchResult> {
  // Intentar primero espejo completo en Supabase
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('catalogo_productos')
        .select('*')
        .eq('mostrar_en_web', true)
        .gt('stock', 0)
        .order('stock', { ascending: false })
        .limit(2000);

      if (!error && data && data.length > 0) {
        const mapped = data.map(mapMirrorRowToCatalogItem);
        return {
          endpointUsed: 'supabase://catalogo_productos',
          source: 'supabase',
          allItems: mapped,
          visibleInStockItems: mapped,
        };
      }
    } catch {
      // fallback to API
    }
  }

  // Respaldo con caché en memoria (60s)
  if (fallbackCatalogCache && Date.now() < fallbackCatalogCache.expiresAt) {
    return fallbackCatalogCache.result;
  }

  const primaryBase = resolveApiBaseUrl(apiBaseUrl);
  const primaryEndpoint = `${primaryBase}/articulos?page=1&pageSize=200`;
  const primaryStockEndpoint = `${primaryBase}/articulos/stock`;

  const [firstPayload, stockByCode] = await Promise.all([
    fetchArticulos(primaryEndpoint, apiToken),
    fetchStockMap(primaryStockEndpoint, apiToken),
  ]);

  const rawRows: ProductRow[] = [...(firstPayload.data || [])];
  const totalPages = Number(firstPayload.pagination?.totalPages || 1);
  if (totalPages > 1) {
    const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const rest = await Promise.all(
      pages.map((p) => fetchArticulos(`${primaryBase}/articulos?page=${p}&pageSize=200`, apiToken))
    );
    for (const r of rest) {
      if (Array.isArray(r.data)) rawRows.push(...r.data);
    }
  }

  const allItems = rawRows.map((row, index) => {
    const mapped = mapCatalogItem(row, index, primaryBase);
    const normalizedCode = mapped.code?.trim() ?? mapped.articleNumber.trim();
    const stockFromMap = normalizedCode ? stockByCode[normalizedCode] : undefined;
    return {
      ...mapped,
      stock: Number.isFinite(stockFromMap) ? (stockFromMap as number) : mapped.stock,
    };
  });

  const visibleInStockItems = allItems.filter((item) => item.stock > 0 && item.visibleInTestbd);
  const result: CatalogFetchResult = {
    endpointUsed: primaryEndpoint,
    source: 'api',
    allItems,
    visibleInStockItems,
  };

  fallbackCatalogCache = {
    expiresAt: Date.now() + FALLBACK_CACHE_TTL_MS,
    result,
  };

  return result;
}

export async function fetchCatalogCategoryData(articleNumbers: string[]): Promise<CatalogCategoryData> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { categories: [], articleCategoryByNumber: {} };
  }

  const uniqueArticleNumbers = Array.from(new Set(articleNumbers.map((value) => value.trim()).filter(Boolean)));

  const categoriesPromise =
    categoriesListCache && Date.now() < categoriesListCache.expiresAt
      ? Promise.resolve({ data: categoriesListCache.categories, error: null })
      : supabase
          .from('categorias_articulos')
          .select('id, nombre')
          .order('nombre', { ascending: true });

  const [categoriesResult, relationsResult] = await Promise.all([
    categoriesPromise,
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

  const categories = (categoriesResult.data ?? []).map((item: any) => ({
    id: String(item.id),
    nombre: String(item.nombre),
  }));

  categoriesListCache = {
    expiresAt: Date.now() + 5 * 60_000,
    categories,
  };

  const articleCategoryByNumber = Object.fromEntries(
    (relationsResult.data ?? [])
      .filter((item: any) => item?.articulo_numero && item?.categoria_id)
      .map((item: any) => [String(item.articulo_numero), String(item.categoria_id)])
  );

  return { categories, articleCategoryByNumber };
}

export async function fetchCatalogItemsPage(
  apiBaseUrl: string,
  apiToken: string,
  options: { page: number; pageSize: number; searchTerm?: string; categoryId?: string }
): Promise<CatalogPageFetchResult> {
  const safePage = Number.isFinite(options.page) && options.page > 0 ? Math.floor(options.page) : 1;
  const safePageSize =
    Number.isFinite(options.pageSize) && options.pageSize > 0 ? Math.min(Math.floor(options.pageSize), 200) : 60;

  // 1. Intentar espejo Supabase primero (instantáneo y 100% independiente del servidor local)
  const mirrorPage = await tryFetchMirrorPage({
    page: safePage,
    pageSize: safePageSize,
    searchTerm: options.searchTerm,
    categoryId: options.categoryId,
  });

  if (mirrorPage) {
    return mirrorPage;
  }

  // 2. Fallback rápido desde caché en memoria / API local
  const allRes = await fetchCatalogItems(apiBaseUrl, apiToken);
  let filtered = allRes.visibleInStockItems;

  if (options.categoryId && options.categoryId !== 'all') {
    const nums = filtered.map((i) => i.articleNumber).filter(Boolean);
    const catData = await fetchCatalogCategoryData(nums);
    filtered = filtered.filter((i) => catData.articleCategoryByNumber[i.articleNumber] === options.categoryId);
  }

  if (options.searchTerm && options.searchTerm.trim().length > 0) {
    const q = options.searchTerm.trim().toLowerCase();
    filtered = filtered.filter((i) =>
      [i.title, i.descriptionAdditional, i.articleNumber].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const effectivePage = Math.min(safePage, totalPages);
  const start = (effectivePage - 1) * safePageSize;
  const slice = filtered.slice(start, start + safePageSize);

  return {
    endpointUsed: allRes.endpointUsed,
    source: allRes.source,
    page: effectivePage,
    pageSize: safePageSize,
    total,
    totalPages,
    allItems: slice,
    visibleInStockItems: slice,
  };
}
