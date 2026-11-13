import { describe, expect, it } from "vitest";
import type Stripe from "stripe";

import { getPurchasedItems } from "@/lib/purchased-items";

function lineItem(
  product: Stripe.LineItem["price"],
  quantity: number | null,
): Stripe.LineItem {
  return {
    price: product,
    quantity,
  } as Stripe.LineItem;
}

describe("purchased checkout lines", () => {
  it("keeps catalog identifiers stored on the Stripe product", () => {
    const items = getPurchasedItems({
      data: [
        lineItem(
          {
            product: {
              metadata: {
                product_id: "prod_bloom_case",
                variant_id: "iphone-18-pro",
              },
            },
          } as unknown as Stripe.LineItem["price"],
          2,
        ),
      ],
    });

    expect(items).toEqual([
      {
        productId: "prod_bloom_case",
        variantId: "iphone-18-pro",
        quantity: 2,
      },
    ]);
  });

  it("drops lines that are not a trusted catalog reference", () => {
    const items = getPurchasedItems({
      data: [
        lineItem(
          { product: "prod_unexpanded" } as unknown as Stripe.LineItem["price"],
          1,
        ),
        lineItem(null, 1),
      ],
    });

    expect(items).toEqual([]);
  });
});
