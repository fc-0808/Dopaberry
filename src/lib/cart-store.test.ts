import { afterEach, describe, expect, it } from "vitest";

import { products } from "@/lib/catalog";
import {
  createCheckoutAttemptId,
  getCartItemCount,
  getCartSubtotal,
  sanitizeCartItems,
  useCartStore,
} from "@/lib/cart-store";

afterEach(() => {
  useCartStore.setState({
    items: [],
    checkoutAttemptId: createCheckoutAttemptId(),
    pendingCheckoutAttemptIds: [],
    hasHydrated: false,
  });
});

describe("cart data", () => {
  const product = products[0];
  const variant = product?.variants[0];

  it("drops malformed and stale browser data", () => {
    const items = sanitizeCartItems([
      null,
      { productId: "missing", variantId: "missing", quantity: 1 },
      { productId: 7, variantId: "standard", quantity: 1 },
      { productId: "valid", variantId: "valid", quantity: 1.5 },
    ]);

    expect(items).toEqual([]);
  });

  it("deduplicates valid lines and caps their quantity", () => {
    expect(product).toBeDefined();
    expect(variant).toBeDefined();

    if (!product || !variant) {
      return;
    }

    const items = sanitizeCartItems([
      { productId: product.id, variantId: variant.id, quantity: 7 },
      { productId: product.id, variantId: variant.id, quantity: 7 },
    ]);

    expect(items).toEqual([
      { productId: product.id, variantId: variant.id, quantity: 10 },
    ]);
  });

  it("calculates item count and subtotal from trusted catalog prices", () => {
    expect(product).toBeDefined();
    expect(variant).toBeDefined();

    if (!product || !variant) {
      return;
    }

    const items = [
      { productId: product.id, variantId: variant.id, quantity: 2 },
    ];

    expect(getCartItemCount(items)).toBe(2);
    expect(getCartSubtotal(items)).toBe(product.price * 2);
  });

  it("rotates checkout idempotency only when the cart changes", () => {
    expect(product).toBeDefined();
    expect(variant).toBeDefined();

    if (!product || !variant) {
      return;
    }

    const originalAttempt = createCheckoutAttemptId();
    useCartStore.setState({
      items: [],
      checkoutAttemptId: originalAttempt,
      pendingCheckoutAttemptIds: [],
      hasHydrated: true,
    });

    useCartStore.getState().addItem(product.id, variant.id);
    const updatedAttempt = useCartStore.getState().checkoutAttemptId;

    expect(updatedAttempt).not.toBe(originalAttempt);

    useCartStore.getState().addItem("missing", "missing");
    expect(useCartStore.getState().checkoutAttemptId).toBe(updatedAttempt);

    useCartStore.getState().setQuantity(product.id, variant.id, 1);
    expect(useCartStore.getState().checkoutAttemptId).toBe(updatedAttempt);
  });

  it("reconciles a paid checkout without deleting later cart changes", () => {
    expect(product).toBeDefined();
    expect(variant).toBeDefined();

    if (!product || !variant) {
      return;
    }

    useCartStore.setState({
      items: [],
      checkoutAttemptId: createCheckoutAttemptId(),
      pendingCheckoutAttemptIds: [],
      hasHydrated: true,
    });
    useCartStore.getState().addItem(product.id, variant.id);

    const paidAttempt = useCartStore.getState().checkoutAttemptId;
    useCartStore.getState().markCheckoutPending(paidAttempt);
    useCartStore.getState().addItem(product.id, variant.id);

    const laterAttempt = useCartStore.getState().checkoutAttemptId;
    useCartStore
      .getState()
      .completeCheckout(paidAttempt, [
        { productId: product.id, variantId: variant.id, quantity: 1 },
      ]);

    const state = useCartStore.getState();
    expect(state.items).toEqual([
      { productId: product.id, variantId: variant.id, quantity: 1 },
    ]);
    expect(state.pendingCheckoutAttemptIds).not.toContain(paidAttempt);
    expect(state.checkoutAttemptId).not.toBe(laterAttempt);
  });

  it("ignores unknown success links and rotates canceled attempts", () => {
    const currentAttempt = useCartStore.getState().checkoutAttemptId;
    const unknownAttempt = createCheckoutAttemptId();

    useCartStore.getState().completeCheckout(unknownAttempt, []);
    expect(useCartStore.getState().checkoutAttemptId).toBe(currentAttempt);

    useCartStore.getState().markCheckoutPending(currentAttempt);
    useCartStore.getState().cancelCheckout(currentAttempt);

    expect(useCartStore.getState().checkoutAttemptId).not.toBe(currentAttempt);
    expect(useCartStore.getState().pendingCheckoutAttemptIds).toContain(
      currentAttempt,
    );

    useCartStore.getState().completeCheckout(currentAttempt, []);
    expect(useCartStore.getState().pendingCheckoutAttemptIds).not.toContain(
      currentAttempt,
    );
  });

  it("does not announce a quantity that the cart refused", () => {
    expect(product).toBeDefined();
    expect(variant).toBeDefined();

    if (!product || !variant) {
      return;
    }

    useCartStore.setState({
      items: [{ productId: product.id, variantId: variant.id, quantity: 10 }],
      checkoutAttemptId: createCheckoutAttemptId(),
      pendingCheckoutAttemptIds: [],
      hasHydrated: true,
    });

    expect(useCartStore.getState().addItem(product.id, variant.id)).toBe(
      "limit",
    );
    expect(useCartStore.getState().items[0]?.quantity).toBe(10);
  });
});
