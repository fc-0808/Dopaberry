import { describe, expect, it } from "vitest";

import {
  checkoutRequestSchema,
  isStripeCheckoutUrl,
} from "@/lib/checkout-schema";

const requestId = "0f62f15c-59cf-4e5d-bd57-25df99165f7b";
const item = {
  productId: "prod_bloom_case",
  variantId: "iphone-17-pro",
  quantity: 1,
};

describe("checkout request schema", () => {
  it("accepts the minimal trusted cart shape", () => {
    expect(
      checkoutRequestSchema.safeParse({ requestId, items: [item] }).success,
    ).toBe(true);
  });

  it("accepts only random UUID version 4 request ids", () => {
    expect(
      checkoutRequestSchema.safeParse({
        requestId: "00000000-0000-0000-0000-000000000001",
        items: [item],
      }).success,
    ).toBe(false);
  });

  it("rejects client-supplied pricing fields", () => {
    expect(
      checkoutRequestSchema.safeParse({
        requestId,
        items: [{ ...item, price: 1 }],
      }).success,
    ).toBe(false);
  });

  it("rejects excessive single-line quantities", () => {
    expect(
      checkoutRequestSchema.safeParse({
        requestId,
        items: [{ ...item, quantity: 11 }],
      }).success,
    ).toBe(false);
  });

  it("rejects duplicate lines whose combined quantity exceeds the limit", () => {
    expect(
      checkoutRequestSchema.safeParse({
        requestId,
        items: [
          { ...item, quantity: 6 },
          { ...item, quantity: 5 },
        ],
      }).success,
    ).toBe(false);
  });

  it("accepts only hosted Stripe Checkout URLs", () => {
    expect(
      isStripeCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_a1"),
    ).toBe(true);
    expect(
      isStripeCheckoutUrl("http://checkout.stripe.com/c/pay/cs_test_a1"),
    ).toBe(false);
    expect(isStripeCheckoutUrl("https://evil.example/checkout")).toBe(false);
    expect(isStripeCheckoutUrl("not a url")).toBe(false);
  });
});
