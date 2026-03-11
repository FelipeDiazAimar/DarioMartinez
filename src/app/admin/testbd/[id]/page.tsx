import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LoadingImage } from '@/components/loading-image';
import { AdminBuyButton } from '@/components/admin-buy-button';
import { fetchCatalogItems } from '../catalog-utils';

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatPrice(value?: number, currency?: string) {
  if (!value || value <= 0) {
    return 'Sin precio cargado';
  }

  const amount = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  if (currency && currency.toUpperCase().includes('U$S')) {
    return `U$S ${amount}`;
  }

  return `$ ${amount}`;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
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

  try {
    const catalogResult = await fetchCatalogItems(apiBaseUrl, apiToken);
    const item = catalogResult.allItems.find((candidate) => candidate.id === decodeURIComponent(id));

    if (!item) {
      notFound();
    }

    const relatedItems = catalogResult.visibleInStockItems
      .filter((candidate) => candidate.id !== item.id)
      .filter((candidate) => {
        if (item.descriptionAdditional && candidate.descriptionAdditional) {
          return candidate.descriptionAdditional.toLowerCase() === item.descriptionAdditional.toLowerCase();
        }

        if (item.code && candidate.code) {
          return candidate.code.slice(0, 2) === item.code.slice(0, 2);
        }

        return true;
      })
      .slice(0, 8);

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 p-6">
        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <Link href="/admin/testbd" className="text-sm text-muted-foreground hover:underline">
            ← Volver al catálogo en stock
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">Endpoint: {catalogResult.endpointUsed}</p>
        </section>

        <section className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm lg:grid-cols-[1.15fr,1fr]">
          <div className="flex min-h-[360px] items-center justify-center rounded-xl border bg-muted/30 p-5">
            {item.imageUrl ? (
              <LoadingImage
                src={item.imageUrl}
                alt={item.title}
                width={700}
                height={700}
                className="h-full w-full object-contain"
                spinnerSizeClassName="h-10 w-10 border-2"
              />
            ) : (
              <div className="text-sm text-muted-foreground">Sin imagen disponible</div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight">{item.title}</h1>
              {item.descriptionAdditional && <p className="mt-2 text-base text-muted-foreground">{item.descriptionAdditional}</p>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Precio</p>
                <p className="text-lg font-semibold">{formatPrice(item.price, item.priceCurrency)}</p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Stock</p>
                <p className="text-lg font-semibold">{item.stock}</p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">Código</p>
                <p className="text-lg font-semibold">{item.code || 'Sin código'}</p>
              </div>
            </div>

            <div className="pt-1">
              <AdminBuyButton
                product={{
                  id: item.id,
                  title: item.title,
                  stock: item.stock,
                  imageUrl: item.imageUrl,
                  descriptionAdditional: item.descriptionAdditional,
                  price: item.price,
                  priceCurrency: item.priceCurrency,
                }}
              />
            </div>

            <section className="rounded-xl border bg-muted/10 p-4">
              <h2 className="text-sm font-semibold">Descripción (DescripcionWeb en BD)</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.descriptionAdditional || 'Sin descripción cargada.'}</p>
            </section>

            <section className="rounded-xl border bg-muted/10 p-4">
              <h2 className="text-sm font-semibold">Descripción adicional (AnotacionesWeb en BD)</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.notes || 'Sin anotaciones cargadas.'}</p>
            </section>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">Productos relacionados</h2>
          <p className="mt-1 text-sm text-muted-foreground">Más opciones para seguir comprando.</p>

          {relatedItems.length === 0 ? (
            <div className="mt-4 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              No encontramos productos relacionados por el momento.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((related) => (
                <Link
                  key={related.id}
                  href={`/admin/testbd/${encodeURIComponent(related.id)}`}
                  className="overflow-hidden rounded-xl border bg-card transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <article>
                    <div className="flex h-36 items-center justify-center bg-muted/20 p-3">
                      {related.imageUrl ? (
                        <LoadingImage
                          src={related.imageUrl}
                          alt={related.title}
                          width={220}
                          height={180}
                          className="h-full w-full object-contain"
                          spinnerSizeClassName="h-5 w-5 border-2"
                        />
                      ) : (
                        <div className="text-xs text-muted-foreground">Sin imagen</div>
                      )}
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="line-clamp-2 text-sm font-semibold leading-tight">{related.title}</p>
                      <p className="text-xs text-muted-foreground">Stock: {related.stock}</p>
                      <p className="text-sm font-medium">
                        {related.price && related.price > 0
                          ? `$ ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(related.price)}`
                          : 'Precio no disponible'}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    return (
      <main className="mx-auto w-full max-w-6xl p-6">
        <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
          <h1 className="text-lg font-semibold text-destructive">No se pudo cargar el detalle del producto.</h1>
          <p className="mt-2 text-sm text-destructive">Detalle técnico: {message}</p>
        </section>
      </main>
    );
  }
}
