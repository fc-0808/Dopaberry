"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getProductById, getVariant } from "@/lib/catalog";
import {
  checkoutItemSchema,
  checkoutRequestIdSchema,
  maxQuantityPerLine,
} from "@/lib/checkout-schema";

export interface CartItem {
  readonly productId: string;
  readonly variantId: string;
  readonly quantity: number;
}

interface CartState {
  items: CartItem[];
  checkoutAttemptId: string;
  pendingCheckoutAttemptIds: string[];
  hasHydrated: boolean;
  addItem: (productId: string, variantId: string) => AddItemResult;
  removeItem: (productId: string, variantId: string) => void;
  setQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  markCheckoutPending: (checkoutAttemptId: string) => void;
  renewCheckoutAttempt: () => void;
  cancelCheckout: (checkoutAttemptId: string) => void;
  completeCheckout: (
    checkoutAttemptId: string,
    purchasedItems: readonly CartItem[],
  ) => void;
  markHydrated: () => void;
}

const maxPendingCheckoutAttempts = 20;

export type AddItemResult = "added" | "limit" | "unavailable";

export function createCheckoutAttemptId(): string {
  return globalThis.crypto.randomUUID();
}

function sanitizeCheckoutAttemptId(value: unknown): string {
  const parsed = checkoutRequestIdSchema.safeParse(value);
  return parsed.success ? parsed.data : createCheckoutAttemptId();
}

function sanitizePendingCheckoutAttemptIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value.filter(
        (candidate): candidate is string =>
          checkoutRequestIdSchema.safeParse(candidate).success,
      ),
    ),
  ].slice(-maxPendingCheckoutAttempts);
}

function consolidatePurchasedItems(
  value: readonly CartItem[],
): ReadonlyMap<string, number> {
  const purchased = new Map<string, number>();

  for (const candidate of value) {
    const parsed = checkoutItemSchema.safeParse(candidate);
    if (!parsed.success) {
      continue;
    }

    const key = getCartLineKey(parsed.data.productId, parsed.data.variantId);
    purchased.set(
      key,
      Math.min(
        maxQuantityPerLine,
        (purchased.get(key) ?? 0) + parsed.data.quantity,
      ),
    );
  }

  return purchased;
}

function nextCheckoutAttempt() {
  return {
    checkoutAttemptId: createCheckoutAttemptId(),
  };
}

function isKnownCheckoutAttempt(
  state: Pick<CartState, "checkoutAttemptId" | "pendingCheckoutAttemptIds">,
  checkoutAttemptId: string,
): boolean {
  return (
    state.checkoutAttemptId === checkoutAttemptId ||
    state.pendingCheckoutAttemptIds.includes(checkoutAttemptId)
  );
}

function removePurchasedItems(
  items: readonly CartItem[],
  purchasedItems: readonly CartItem[],
): CartItem[] {
  const purchased = consolidatePurchasedItems(purchasedItems);

  return items.flatMap((item) => {
    const purchasedQuantity =
      purchased.get(getCartLineKey(item.productId, item.variantId)) ?? 0;
    const quantity = item.quantity - purchasedQuantity;

    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
}

function pendingAttemptsWithout(
  attempts: readonly string[],
  checkoutAttemptId: string,
): string[] {
  return attempts.filter((attempt) => attempt !== checkoutAttemptId);
}

function isCheckoutAttemptId(value: string): boolean {
  return checkoutRequestIdSchema.safeParse(value).success;
}

export function getCartLineKey(productId: string, variantId: string): string {
  return `${productId}:${variantId}`;
}

export function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const lines = new Map<string, CartItem>();

  for (const candidate of value) {
    if (
      typeof candidate !== "object" ||
      candidate === null ||
      !("productId" in candidate) ||
      !("variantId" in candidate) ||
      !("quantity" in candidate) ||
      typeof candidate.productId !== "string" ||
      typeof candidate.variantId !== "string" ||
      typeof candidate.quantity !== "number" ||
      !Number.isInteger(candidate.quantity)
    ) {
      continue;
    }

    const product = getProductById(candidate.productId);
    if (
      !product ||
      product.availability !== "in_stock" ||
      !getVariant(product, candidate.variantId)
    ) {
      continue;
    }

    const key = getCartLineKey(candidate.productId, candidate.variantId);
    const existingQuantity = lines.get(key)?.quantity ?? 0;

    lines.set(key, {
      productId: candidate.productId,
      variantId: candidate.variantId,
      quantity: Math.min(
        maxQuantityPerLine,
        Math.max(1, existingQuantity + candidate.quantity),
      ),
    });
  }

  return [...lines.values()];
}

export function getCartItemCount(items: readonly CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items: readonly CartItem[]): number {
  return items.reduce((total, item) => {
    const product = getProductById(item.productId);
    return product ? total + product.price * item.quantity : total;
  }, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      checkoutAttemptId: createCheckoutAttemptId(),
      pendingCheckoutAttemptIds: [],
      hasHydrated: false,
      addItem: (productId, variantId) => {
        const product = getProductById(productId);
        if (
          !product ||
          product.availability !== "in_stock" ||
          !getVariant(product, variantId)
        ) {
          return "unavailable";
        }

        let result: AddItemResult = "unavailable";

        set((state) => {
          const key = getCartLineKey(productId, variantId);
          const existing = state.items.find(
            (item) => getCartLineKey(item.productId, item.variantId) === key,
          );

          if (existing) {
            const quantity = Math.min(
              maxQuantityPerLine,
              existing.quantity + 1,
            );
            if (quantity === existing.quantity) {
              result = "limit";
              return state;
            }

            result = "added";
            return {
              items: state.items.map((item) =>
                getCartLineKey(item.productId, item.variantId) === key
                  ? {
                      ...item,
                      quantity,
                    }
                  : item,
              ),
              ...nextCheckoutAttempt(),
            };
          }

          result = "added";
          return {
            items: [...state.items, { productId, variantId, quantity: 1 }],
            ...nextCheckoutAttempt(),
          };
        });

        return result;
      },
      removeItem: (productId, variantId) => {
        const key = getCartLineKey(productId, variantId);
        set((state) => {
          const items = state.items.filter(
            (item) => getCartLineKey(item.productId, item.variantId) !== key,
          );

          return items.length === state.items.length
            ? state
            : { items, ...nextCheckoutAttempt() };
        });
      },
      setQuantity: (productId, variantId, quantity) => {
        const key = getCartLineKey(productId, variantId);

        if (quantity <= 0) {
          set((state) => {
            const items = state.items.filter(
              (item) => getCartLineKey(item.productId, item.variantId) !== key,
            );

            return items.length === state.items.length
              ? state
              : { items, ...nextCheckoutAttempt() };
          });
          return;
        }

        set((state) => {
          const nextQuantity = Math.min(
            maxQuantityPerLine,
            Math.max(1, Math.floor(quantity)),
          );
          const existing = state.items.find(
            (item) => getCartLineKey(item.productId, item.variantId) === key,
          );

          if (!existing || existing.quantity === nextQuantity) {
            return state;
          }

          return {
            items: state.items.map((item) =>
              getCartLineKey(item.productId, item.variantId) === key
                ? { ...item, quantity: nextQuantity }
                : item,
            ),
            ...nextCheckoutAttempt(),
          };
        });
      },
      clearCart: () =>
        set((state) =>
          state.items.length === 0
            ? state
            : { items: [], ...nextCheckoutAttempt() },
        ),
      markCheckoutPending: (checkoutAttemptId) => {
        if (!isCheckoutAttemptId(checkoutAttemptId)) {
          return;
        }

        set((state) =>
          state.pendingCheckoutAttemptIds.includes(checkoutAttemptId)
            ? state
            : {
                pendingCheckoutAttemptIds: [
                  ...state.pendingCheckoutAttemptIds,
                  checkoutAttemptId,
                ].slice(-maxPendingCheckoutAttempts),
              },
        );
      },
      renewCheckoutAttempt: () => set(nextCheckoutAttempt()),
      cancelCheckout: (checkoutAttemptId) => {
        if (!isCheckoutAttemptId(checkoutAttemptId)) {
          return;
        }

        set((state) => {
          const isCurrent = state.checkoutAttemptId === checkoutAttemptId;
          const isPending =
            state.pendingCheckoutAttemptIds.includes(checkoutAttemptId);

          if (!isCurrent && !isPending) {
            return state;
          }

          return {
            pendingCheckoutAttemptIds: isPending
              ? state.pendingCheckoutAttemptIds
              : [...state.pendingCheckoutAttemptIds, checkoutAttemptId].slice(
                  -maxPendingCheckoutAttempts,
                ),
            ...(isCurrent ? nextCheckoutAttempt() : {}),
          };
        });
      },
      completeCheckout: (checkoutAttemptId, purchasedItems) => {
        if (!isCheckoutAttemptId(checkoutAttemptId)) {
          return;
        }

        set((state) => {
          if (!isKnownCheckoutAttempt(state, checkoutAttemptId)) {
            return state;
          }

          return {
            items:
              state.checkoutAttemptId === checkoutAttemptId
                ? []
                : removePurchasedItems(state.items, purchasedItems),
            pendingCheckoutAttemptIds: pendingAttemptsWithout(
              state.pendingCheckoutAttemptIds,
              checkoutAttemptId,
            ),
            ...nextCheckoutAttempt(),
          };
        });
      },
      markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "dopaberry-cart",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        checkoutAttemptId: state.checkoutAttemptId,
        pendingCheckoutAttemptIds: state.pendingCheckoutAttemptIds,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | {
              items?: unknown;
              checkoutAttemptId?: unknown;
              pendingCheckoutAttemptIds?: unknown;
            }
          | undefined;
        return {
          ...currentState,
          items: sanitizeCartItems(persisted?.items),
          checkoutAttemptId: sanitizeCheckoutAttemptId(
            persisted?.checkoutAttemptId,
          ),
          pendingCheckoutAttemptIds: sanitizePendingCheckoutAttemptIds(
            persisted?.pendingCheckoutAttemptIds,
          ),
        };
      },
    },
  ),
);
