"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Check, ShoppingBag } from "lucide-react";

import type { Product } from "@/lib/catalog";
import { useCartHydration } from "@/lib/cart-hydration";
import { useCartStore } from "@/lib/cart-store";
import { maxQuantityPerLine } from "@/lib/checkout-schema";

export function AddToCart({ product }: { readonly product: Product }) {
  const hasHydrated = useCartHydration();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const [notice, setNotice] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const available = product.availability === "in_stock";

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  function handleAddToCart() {
    if (!variantId || !available || !hasHydrated) {
      return;
    }

    const result = addItem(product.id, variantId);
    if (result !== "added") {
      setAdded(false);
      setNotice(
        result === "limit"
          ? `You can add up to ${maxQuantityPerLine} of this item.`
          : "This item is not available.",
      );
      return;
    }

    setNotice("");
    setAdded(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => setAdded(false), 2_000);
  }

  return (
    <div className="add-to-cart">
      <label className="field-label" htmlFor="product-variant">
        Choose your fit
      </label>
      <div className="select-wrap">
        <select
          disabled={!available}
          id="product-variant"
          onChange={(event) => setVariantId(event.target.value)}
          value={variantId}
        >
          {product.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.label}
            </option>
          ))}
        </select>
      </div>

      <button
        className={clsx(
          "button button--primary button--wide",
          added && "button--success",
        )}
        disabled={!variantId || !available || !hasHydrated}
        onClick={handleAddToCart}
        type="button"
      >
        {!hasHydrated ? (
          "Loading cart…"
        ) : !available ? (
          "Currently unavailable"
        ) : added ? (
          <>
            <Check aria-hidden="true" size={19} />
            Added to cart
          </>
        ) : (
          <>
            <ShoppingBag aria-hidden="true" size={19} />
            Add to cart
          </>
        )}
      </button>
      {notice ? (
        <p className="add-to-cart__notice" role="status">
          {notice}
        </p>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {added ? `${product.name} added to cart.` : ""}
      </p>
    </div>
  );
}
