"use client";

import { useEffect } from "react";

import { hydrateCartStore } from "@/lib/cart-hydration";
import { useCartStore, type CartItem } from "@/lib/cart-store";

export function ReconcileCartOnSuccess({
  checkoutAttemptId,
  purchasedItems,
}: {
  readonly checkoutAttemptId: string;
  readonly purchasedItems: readonly CartItem[];
}) {
  useEffect(() => {
    void hydrateCartStore().then(() => {
      useCartStore
        .getState()
        .completeCheckout(checkoutAttemptId, purchasedItems);
    });
  }, [checkoutAttemptId, purchasedItems]);

  return null;
}
