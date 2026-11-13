"use client";

import { useEffect } from "react";

import { useCartStore } from "@/lib/cart-store";

let hydrationPromise: Promise<void> | null = null;
let storageSubscriberCount = 0;
let removeStorageListener: (() => void) | null = null;

function reportHydrationError(error: unknown) {
  console.error(
    JSON.stringify({
      event: "cart.hydration_failed",
      message:
        error instanceof Error
          ? error.message
          : "Cart storage could not be read.",
    }),
  );
}

async function syncCartStore(): Promise<void> {
  try {
    await Promise.resolve(useCartStore.persist.rehydrate());
  } catch (error) {
    reportHydrationError(error);
  }
}

function subscribeToCartStorage(): () => void {
  storageSubscriberCount += 1;

  if (storageSubscriberCount === 1) {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "dopaberry-cart") {
        void syncCartStore();
      }
    };

    window.addEventListener("storage", handleStorage);
    removeStorageListener = () =>
      window.removeEventListener("storage", handleStorage);
  }

  return () => {
    storageSubscriberCount = Math.max(0, storageSubscriberCount - 1);
    if (storageSubscriberCount === 0) {
      removeStorageListener?.();
      removeStorageListener = null;
    }
  };
}

export function hydrateCartStore(): Promise<void> {
  if (useCartStore.getState().hasHydrated) {
    return Promise.resolve();
  }

  hydrationPromise ??= syncCartStore().finally(() => {
    useCartStore.getState().markHydrated();
    hydrationPromise = null;
  });

  return hydrationPromise;
}

export function useCartHydration(): boolean {
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  useEffect(() => {
    void hydrateCartStore();
    return subscribeToCartStorage();
  }, []);

  return hasHydrated;
}
