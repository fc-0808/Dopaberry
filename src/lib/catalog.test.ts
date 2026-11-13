import { describe, expect, it } from "vitest";

import {
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  products,
} from "@/lib/catalog";

describe("product catalog", () => {
  it("uses unique stable identifiers and slugs", () => {
    expect(new Set(products.map((product) => product.id)).size).toBe(
      products.length,
    );
    expect(new Set(products.map((product) => product.slug)).size).toBe(
      products.length,
    );
  });

  it("stores prices as positive integer cents", () => {
    for (const product of products) {
      expect(Number.isInteger(product.price)).toBe(true);
      expect(product.price).toBeGreaterThan(0);
    }
  });

  it("includes the current iPhone Pro and AirPods models", () => {
    const labels = products.flatMap((product) =>
      product.variants.map((variant) => variant.label),
    );

    expect(labels).toEqual(
      expect.arrayContaining([
        "iPhone 18 Pro",
        "iPhone 18 Pro Max",
        "AirPods 5",
        "AirPods Pro 3",
      ]),
    );
  });

  it("provides at least one unique variant for every product", () => {
    for (const product of products) {
      expect(product.variants.length).toBeGreaterThan(0);
      expect(new Set(product.variants.map((variant) => variant.id)).size).toBe(
        product.variants.length,
      );
    }
  });

  it("resolves products by either public or internal identifier", () => {
    const product = products[0];
    expect(product).toBeDefined();

    if (!product) {
      return;
    }

    expect(getProductById(product.id)).toEqual(product);
    expect(getProductBySlug(product.slug)).toEqual(product);
  });

  it("never recommends the current product", () => {
    const product = products[0];
    expect(product).toBeDefined();

    if (!product) {
      return;
    }

    expect(getRelatedProducts(product)).not.toContainEqual(product);
  });
});
