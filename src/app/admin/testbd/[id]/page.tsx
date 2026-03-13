import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LoadingImage } from '@/components/loading-image';
import { AdminBuyButton } from '@/components/admin-buy-button';
import { Footer } from '@/components/footer';
import { fetchCatalogCategoryData, fetchCatalogItems } from '../catalog-utils';
import { RelatedProductsCarousel } from './related-products-carousel';

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

function shuffleItems<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = temp;
  }

  return copy;
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

    const articleNumbers = Array.from(new Set(catalogResult.allItems.map((candidate) => candidate.articleNumber).filter(Boolean)));
    const categoryData = await fetchCatalogCategoryData(articleNumbers);
    const articleCategoryByNumber = categoryData.articleCategoryByNumber;
    const categoriesById = Object.fromEntries(categoryData.categories.map((category) => [category.id, category.nombre]));

    const pool = catalogResult.visibleInStockItems.filter((candidate) => candidate.id !== item.id);
    const itemCategoryId = articleCategoryByNumber[item.articleNumber];

    const sameCategoryItems = itemCategoryId
      ? pool.filter((candidate) => articleCategoryByNumber[candidate.articleNumber] === itemCategoryId)
      : [];

    const relatedItems = (sameCategoryItems.length > 0 ? sameCategoryItems : shuffleItems(pool)).slice(0, 20);
    const relatedItemsWithCategory = relatedItems.map((related) => {
      const categoryId = articleCategoryByNumber[related.articleNumber];
      return {
        ...related,
        categoryName: categoryId ? categoriesById[categoryId] : undefined,
      };
    });

    return (
      <div className="min-h-screen w-full" style={{ backgroundColor: 'rgba(217, 225, 242, 0.3)' }}>
        <main className="mx-auto w-full max-w-6xl space-y-6 p-6">
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <Link
            href="/admin/testbd"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver al catálogo
          </Link>
          </section>

          <section
            className="grid gap-6 rounded-2xl border bg-white p-6 shadow-sm lg:grid-cols-[1.15fr,1fr]"
            style={{ backgroundColor: 'rgba(217, 225, 242, 0.3)' }}
          >
          <div className="flex min-h-[360px] items-center justify-center rounded-xl border bg-white p-5">
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
              <div className="rounded-xl border bg-white p-3">
                <p className="text-xs text-muted-foreground">Precio</p>
                <p className="text-lg font-semibold">{formatPrice(item.price, item.priceCurrency)}</p>
              </div>
              <div className="rounded-xl border bg-white p-3">
                <p className="text-xs text-muted-foreground">Stock</p>
                <p className="text-lg font-semibold">{item.stock}</p>
              </div>
              <div className="rounded-xl border bg-white p-3">
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

            <section className="rounded-xl border bg-white p-4">
              <h2 className="text-sm font-semibold">Descripción (DescripcionWeb en BD)</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.descriptionAdditional || 'Sin descripción cargada.'}</p>
            </section>

            <section className="rounded-xl border bg-white p-4">
              <h2 className="text-sm font-semibold">Descripción adicional (AnotacionesWeb en BD)</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.notes || 'Sin anotaciones cargadas.'}</p>
            </section>
          </div>
          </section>

          <section
            className="rounded-2xl border bg-white p-6 shadow-sm"
            style={{ backgroundColor: 'rgba(217, 225, 242, 0.3)' }}
          >
          <h2 className="text-xl font-semibold tracking-tight">Productos relacionados</h2>
          <p className="mt-1 text-sm text-muted-foreground">Más opciones para seguir comprando.</p>

          {relatedItems.length === 0 ? (
            <div
              className="mt-4 rounded-xl border bg-white p-4 text-sm text-muted-foreground"
              style={{ backgroundColor: 'rgba(217, 225, 242, 0.3)' }}
            >
              <p>No encontramos productos relacionados por el momento.</p>
              <Link href="/admin/testbd" className="mt-3 inline-flex rounded-full border bg-white px-4 py-2 text-sm font-medium hover:bg-muted">
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <RelatedProductsCarousel items={relatedItemsWithCategory} />
          )}
          </section>
        </main>
        <Footer forceShow />
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    return (
      <div className="min-h-screen w-full" style={{ backgroundColor: 'rgba(217, 225, 242, 0.3)' }}>
        <main className="mx-auto w-full max-w-6xl p-6">
          <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
            <h1 className="text-lg font-semibold text-destructive">No se pudo cargar el detalle del producto.</h1>
            <p className="mt-2 text-sm text-destructive">Detalle técnico: {message}</p>
          </section>
        </main>
        <Footer forceShow />
      </div>
    );
  }
}
