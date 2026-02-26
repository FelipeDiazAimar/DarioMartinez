import Link from 'next/link';
import { LoadingImage } from '@/components/loading-image';
import { fetchCatalogItems } from './catalog-utils';

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

  let endpointUsed = `${apiBaseUrl.replace(/\/$/, '')}/articulos`;

  try {
    const catalogResult = await fetchCatalogItems(apiBaseUrl, apiToken);
    endpointUsed = catalogResult.endpointUsed;
    const inStockItems = catalogResult.visibleInStockItems;

    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">TestBD · Catálogo en stock</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Mostrando únicamente productos con <span className="font-medium">cantidadUnidades &gt; 0</span> y marcados para visibilidad.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Endpoint: {endpointUsed}</p>
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
              <Link
                key={item.id}
                href={`/admin/testbd/${encodeURIComponent(item.id)}`}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <article>
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
                    {item.descriptionAdditional && <p className="line-clamp-2 text-xs text-muted-foreground">{item.descriptionAdditional}</p>}
                    <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium">
                      Stock disponible: {item.stock}
                    </div>
                  </div>
                </article>
              </Link>
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
          <p className="mt-1 text-sm text-destructive">Endpoint consultado: {endpointUsed}</p>
        </section>
      </main>
    );
  }
}
