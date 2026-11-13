import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { AddToCart } from "@/components/add-to-cart";
import { JsonLd } from "@/components/json-ld";
import { ProductCard, ProductVisual } from "@/components/product-card";
import {
  getCategory,
  getProductBySlug,
  getRelatedProducts,
  products,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/currency";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import { productStructuredData } from "@/lib/structured-data";

interface ProductPageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return createPageMetadata({
    path: `/products/${product.slug}`,
    title: product.name,
    description: product.description,
    image: {
      url: `/products/${product.slug}/opengraph-image`,
      alt: `${product.name} by DopaBerry`,
    },
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = getCategory(product.category);
  const relatedProducts = getRelatedProducts(product);

  return (
    <>
      <JsonLd data={productStructuredData(product)} />

      <div className="page-shell">
        <nav aria-label="Breadcrumb" className="shell product-breadcrumbs">
          <ol>
            <li>
              <Link href="/shop">
                <ArrowLeft aria-hidden="true" size={16} />
                Shop
              </Link>
            </li>
            <li>
              <Link href={`/shop?category=${product.category}`}>
                {category?.name ?? "Collection"}
              </Link>
            </li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <section className="shell product-detail">
          <div className="product-detail__visual">
            {product.badge ? (
              <span
                className={
                  product.badge === "New"
                    ? "product-detail__badge product-detail__badge--new"
                    : "product-detail__badge"
                }
              >
                {product.badge}
              </span>
            ) : null}
            <ProductVisual product={product} />
          </div>

          <div className="product-detail__copy">
            <p className="eyebrow">{product.eyebrow}</p>
            <h1>{product.name}</h1>
            <p className="product-detail__price">
              {formatPrice(product.price)}
            </p>
            <p className="product-detail__description">{product.description}</p>

            <AddToCart product={product} />

            <div className="product-detail__promises">
              <div>
                <Truck aria-hidden="true" size={20} />
                <span>
                  <strong>
                    {`Free US shipping over ${formatPrice(siteConfig.freeShippingThreshold)}`}
                  </strong>
                  {`Standard delivery in ${siteConfig.standardDeliveryDays.minimum}–${siteConfig.standardDeliveryDays.maximum} business days`}
                </span>
              </div>
              <div>
                <RotateCcw aria-hidden="true" size={20} />
                <span>
                  <strong>{`${siteConfig.returnWindowDays}-day returns`}</strong>
                  Unused items in original condition
                </span>
              </div>
              <div>
                <ShieldCheck aria-hidden="true" size={20} />
                <span>
                  <strong>Secure payment</strong>
                  Encrypted checkout by Stripe
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="shell product-story">
          <div>
            <p className="eyebrow">The details</p>
            <h2>Made for daily use.</h2>
            <p>{product.story}</p>
          </div>
          <div className="feature-card">
            <h2>What it includes</h2>
            <ul>
              {product.features.map((feature) => (
                <li key={feature}>
                  <Check aria-hidden="true" size={17} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="shell section related-products">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Also in the collection</p>
                <h2>Related pieces</h2>
              </div>
            </div>
            <div className="product-grid product-grid--three">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
