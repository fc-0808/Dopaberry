import { describe, expect, it } from "vitest";

import {
  classifyCheckoutSession,
  shouldReconcileCheckout,
} from "@/lib/checkout-status";

describe("checkout confirmation", () => {
  it("confirms settled payments and reconciles them", () => {
    const confirmation = classifyCheckoutSession({
      status: "complete",
      payment_status: "paid",
    });

    expect(confirmation).toBe("confirmed");
    expect(shouldReconcileCheckout(confirmation)).toBe(true);
  });

  it("keeps a completed delayed payment out of the cart", () => {
    const confirmation = classifyCheckoutSession({
      status: "complete",
      payment_status: "unpaid",
    });

    expect(confirmation).toBe("processing");
    expect(shouldReconcileCheckout(confirmation)).toBe(true);
  });

  it("leaves expired and open sessions in the cart", () => {
    expect(
      shouldReconcileCheckout(
        classifyCheckoutSession({
          status: "expired",
          payment_status: "unpaid",
        }),
      ),
    ).toBe(false);
    expect(
      shouldReconcileCheckout(
        classifyCheckoutSession({ status: "open", payment_status: "unpaid" }),
      ),
    ).toBe(false);
    expect(shouldReconcileCheckout(classifyCheckoutSession(null))).toBe(false);
  });
});
