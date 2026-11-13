import type { CSSProperties } from "react";
import clsx from "clsx";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/currency";

interface ProductVisualProps {
  readonly product: Product;
  readonly compact?: boolean;
  readonly decorative?: boolean;
}

export function ProductVisual({
  product,
  compact = false,
  decorative = false,
}: ProductVisualProps) {
  const style = {
    "--product-primary": product.palette.primary,
    "--product-secondary": product.palette.secondary,
    "--product-surface": product.palette.surface,
  } as CSSProperties;

  return (
    <div
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : `Illustration of ${product.name}`}
      className={clsx(
        "product-visual",
        `product-visual--${product.art}`,
        compact && "product-visual--compact",
      )}
      role={decorative ? undefined : "img"}
      style={style}
    >
      <span
        aria-hidden="true"
        className="product-visual__orb product-visual__orb--one"
      />
      <span
        aria-hidden="true"
        className="product-visual__orb product-visual__orb--two"
      />
      <span aria-hidden="true" className="product-visual__object">
        <span className="product-visual__detail" />
        <span className="product-visual__detail product-visual__detail--two" />
        <span className="product-visual__detail product-visual__detail--three" />
      </span>
    </div>
  );
}

export function ProductCard({ product }: { readonly product: Product }) {
  return (
    <article className="product-card">
      <div className="product-card__visual">
        {product.badge ? (
          <span
            className={
              product.badge === "New"
                ? "product-card__badge product-card__badge--new"
                : "product-card__badge"
            }
          >
            {product.badge}
          </span>
        ) : null}
        <ProductVisual compact decorative product={product} />
      </div>
      <div className="product-card__copy">
        <div>
          <p className="eyebrow">{product.eyebrow}</p>
          <h3 className="product-card__title">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>
        <div className="product-card__meta">
          <span>{formatPrice(product.price)}</span>
          <ArrowUpRight aria-hidden="true" size={18} strokeWidth={2} />
        </div>
      </div>
    </article>
  );
}
