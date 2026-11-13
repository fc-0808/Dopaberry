import Link from "next/link";
import {
  ArrowRight,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { HomeHero } from "@/components/home-hero";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { categories, getFeaturedProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/currency";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";
import { storeStructuredData } from "@/lib/structured-data";

export const metadata = createPageMetadata({
  path: "/",
  title: "DopaBerry | Colorful mobile accessories",
  description: siteConfig.description,
  useRootDocumentTitle: true,
});

export default function HomePage() {
  const featuredProducts = getFeaturedProducts().slice(0, 4);

  return (
    <>
      <JsonLd data={storeStructuredData()} />

      <HomeHero />

      <section aria-label="Shopping benefits" className="benefit-strip">
        <div className="shell benefit-strip__grid">
          <div>
            <Truck aria-hidden="true" />
            <span>
              <strong>Free US shipping</strong>
              Over {formatPrice(siteConfig.freeShippingThreshold)}
            </span>
          </div>
          <div>
            <RotateCcw aria-hidden="true" />
            <span>
              <strong>{`${siteConfig.returnWindowDays}-day returns`}</strong>
              Simple and stress-free
            </span>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <span>
              <strong>Secure checkout</strong>
              Powered by Stripe
            </span>
          </div>
          <div>
            <PackageCheck aria-hidden="true" />
            <span>
              <strong>Made for daily use</strong>
              Fit, protection, and finish
            </span>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pick your color</p>
            <h2>Color, first.</h2>
          </div>
          <Link className="arrow-link" href="/shop">
            View all
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section section--tint">
        <div className="shell">
          <div className="section-heading section-heading--center">
            <div>
              <p className="eyebrow">Collections</p>
              <h2>Pick a collection.</h2>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <Link
                className={`category-card category-card--${index + 1}`}
                href={`/shop?category=${category.slug}`}
                key={category.slug}
              >
                <span className="category-card__count">0{index + 1} / 03</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="category-card__link">
                  Browse
                  <ArrowRight aria-hidden="true" size={17} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="manifesto">
        <div className="shell manifesto__grid">
          <div className="manifesto__art" aria-hidden="true">
            <span>DO</span>
            <span>PA</span>
            <span>POP</span>
          </div>
          <div className="manifesto__copy">
            <p className="eyebrow">Why DopaBerry</p>
            <h2>A little color, every time.</h2>
            <p>
              DopaBerry makes phone cases and small accessories for people who
              want their everyday objects to feel brighter. Saturated palettes,
              precise fit, and details you notice when you pick them up.
            </p>
            <Link className="button button--dark" href="/about">
              About the brand
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
