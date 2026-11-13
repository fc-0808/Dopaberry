"use client";

import { useEffect } from "react";

import { hydrateCartStore } from "@/lib/cart-hydration";
import { useCartStore } from "@/lib/cart-store";

export function CancelCheckoutAttempt({
  checkoutAttemptId,
}: {
  readonly checkoutAttemptId: string;
}) {
  useEffect(() => {
    void hydrateCartStore().then(() => {
      useCartStore.getState().cancelCheckout(checkoutAttemptId);
    });
  }, [checkoutAttemptId]);

  return null;
}
