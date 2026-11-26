import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCatalogCategoryData, fetchCatalogItemById } from '../catalog-utils';
import { ProductDetailClient } from './product-detail-client';
import { RelatedProductsCarousel } from './related-products-carousel';

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const apiBaseUrl = process.env.API_BASE_URL;
  const apiToken = process.env.API_TOKEN;

  try {
    const { item, relatedItems } = await fetchCatalogItemById(id, apiBaseUrl, apiToken);

    if (!item) {
      notFound();
    }

    const articleNumbers = Array.from(
      new Set([item.articleNumber, ...relatedItems.map((r) => r.articleNumber)].filter(Boolean))
    );
    const categoryData = await fetchCatalogCategoryData(articleNumbers);
    const articleCategoryByNumber = categoryData.articleCategoryByNumber;
    const categoriesById = Object.fromEntries(categoryData.categories.map((category) => [category.id, category.nombre]));

    const itemCategoryId = articleCategoryByNumber[item.articleNumber];
    const itemCategoryName = itemCategoryId ? categoriesById[itemCategoryId] : undefined;

    const relatedItemsWithCategory = relatedItems.map((related) => {
      const categoryId = articleCategoryByNumber[related.articleNumber];
      return {
        ...related,
        categoryName: categoryId ? categoriesById[categoryId] : undefined,
      };
    });

    return (
      <div className="w-full bg-surface/60 py-8 text-foreground lg:py-12">
        <div className="mx-auto max-w-[1440px] space-y-10 px-4 sm:px-6 lg:px-8">
          <ProductDetailClient
            item={{
              id: item.id,
              articleNumber: item.articleNumber,
              code: item.code,
              title: item.title,
              stock: item.stock,
              imageUrl: item.imageUrl,
              descriptionAdditional: item.descriptionAdditional,
              notes: item.notes,
            }}
            categoryId={itemCategoryId}
            categoryName={itemCategoryName}
          />

          <section className="rounded-3xl border border-border bg-background p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-headline text-2xl font-bold tracking-tight">Productos relacionados</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Otras opciones con stock disponible en nuestra tienda.
                </p>
              </div>
              <Link
                href={itemCategoryId ? `/productos?cat=${encodeURIComponent(itemCategoryId)}` : '/productos'}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Ver todo el catálogo
              </Link>
            </div>

            {relatedItemsWithCategory.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
                <p>No encontramos productos relacionados por el momento.</p>
                <Link
                  href="/productos"
                  className="mt-3 inline-flex rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary"
                >
                  Explorar catálogo completo
                </Link>
              </div>
            ) : (
              <RelatedProductsCarousel items={relatedItemsWithCategory} />
            )}
          </section>
        </div>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';

    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16">
        <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h1 className="font-headline text-lg font-bold text-destructive">
            No se pudo cargar el detalle del producto.
          </h1>
          <p className="mt-2 text-sm text-destructive/90">Detalle técnico: {message}</p>
        </section>
      </div>
    );
  }
}
