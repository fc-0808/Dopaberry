import { redirect } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { ShopClient } from "@/components/shop-client";
import { getCategory, type CategorySlug } from "@/lib/catalog";
import { createPageMetadata } from "@/lib/metadata";
import { collectionStructuredData } from "@/lib/structured-data";

export const metadata = createPageMetadata({
  path: "/shop",
  title: "Shop colorful mobile accessories",
  description:
    "Explore DopaBerry iPhone cases, AirPods cases, MagSafe grips, phone charms, and colorful mobile extras.",
});

interface ShopPageProps {
  readonly searchParams: Promise<{
    readonly category?: string | string[];
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categoryParam = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const category = categoryParam ? getCategory(categoryParam) : undefined;

  if (categoryParam && !category) {
    redirect("/shop");
  }

  const initialCategory: CategorySlug | "all" = category?.slug ?? "all";

  return (
    <>
      <JsonLd data={collectionStructuredData()} />
      <div className="page-shell">
        <section className="shop-hero shell">
          <p className="eyebrow">Shop</p>
          <h1>
            The color, <span>in hand.</span>
          </h1>
          <p>
            Cases, covers, charms, and grips in saturated color, made for the
            objects you pick up all day.
          </p>
        </section>
        <section
          aria-label="Product catalog"
          className="shell section section--shop"
        >
          <ShopClient initialCategory={initialCategory} key={initialCategory} />
        </section>
      </div>
    </>
  );
}
