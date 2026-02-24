import Link from 'next/link';
import { LoadingImage } from '@/components/loading-image';

type ProductRow = Record<string, unknown>;

type CatalogItem = {
  id: string;
  title: string;
  stock: number;
  imageUrl: string;
  visibleInTestbd: boolean;
  subtitle?: string;
};

function parseStock(value: unknown) {
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

function pickText(row: ProductRow, candidates: string[], fallback: string) {
  for (const candidate of candidates) {
    const value = row[candidate];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
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

function mapCatalogItem(row: ProductRow, index: number, apiBaseUrl: string): CatalogItem {
  const stock = parseStock(row.cantidadUnidades);
  const imageUrl = normalizeImageUrl(row.imagen, apiBaseUrl);
  const visibleInTestbd = parseVisibility(row.mostrar_en_testbd);

  const title = pickText(row, ['descripcion', 'nombre', 'producto', 'articulo', 'denominacion', 'detalle'], `Artículo #${index + 1}`);
  const subtitle = pickText(row, ['rubro', 'marca', 'codigo', 'categoria'], '');

  const rawId = row.id ?? row.codigo ?? row.cod ?? row.sku ?? row.nroArticulo ?? row.articulo;
  const id = rawId !== undefined && rawId !== null && String(rawId).trim() ? String(rawId) : `${title}-${index}`;

  return {
    id,
    title,
    stock,
    imageUrl,
    visibleInTestbd,
    subtitle: subtitle || undefined,
  };
}

export default async function AdminTestBdPage() {
  const apiBaseUrl = process.env.API_BASE_URL;
  const apiToken = process.env.API_TOKEN;

  if (!apiBaseUrl || !apiToken) {
    return (
      <main className="mx-auto w-full max-w-6xl p-6">
        <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          Faltan API_BASE_URL o API_TOKEN en variables de entorno.
        </section>
      </main>
    );
  }

  const endpoint = `${apiBaseUrl.replace(/\/$/, '')}/articulos`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      cache: 'no-store',
    });

    const payload = await response.json();

    if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
      throw new Error(payload?.message || 'La API no devolvió artículos válidos.');
    }

    const allRows = payload.data as ProductRow[];
    const inStockItems = allRows
      .map((row, index) => mapCatalogItem(row, index, apiBaseUrl))
      .filter((item) => item.stock > 0 && item.visibleInTestbd);

    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">TestBD · Catálogo en stock</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Mostrando únicamente productos con <span className="font-medium">cantidadUnidades &gt; 0</span> y marcados para visibilidad.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Endpoint: {endpoint}</p>
          <div className="mt-4">
            <Link href="/admin/articulos" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
              Ver tabla completa de artículos
            </Link>
          </div>
        </section>

        {inStockItems.length === 0 ? (
          <section className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
            No hay productos con stock disponible en este momento.
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inStockItems.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-muted/30 p-4">
                  {item.imageUrl ? (
                    <LoadingImage
                      src={item.imageUrl}
                      alt={item.title}
                      width={500}
                      height={400}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      spinnerSizeClassName="h-8 w-8 border-2"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">Sin imagen</div>
                  )}
                </div>

                <div className="space-y-2 p-4">
                  <h2 className="line-clamp-2 text-base font-semibold leading-tight">{item.title}</h2>
                  {item.subtitle && <p className="line-clamp-1 text-xs text-muted-foreground">{item.subtitle}</p>}
                  <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
                    Stock disponible: {item.stock}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    return (
      <main className="mx-auto w-full max-w-6xl p-6">
        <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
          <h1 className="text-lg font-semibold text-destructive">No se pudo generar el catálogo en stock.</h1>
          <p className="mt-2 text-sm text-destructive">Detalle técnico: {message}</p>
          <p className="mt-1 text-sm text-destructive">Endpoint consultado: {endpoint}</p>
        </section>
      </main>
    );
  }
}
