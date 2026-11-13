import type Stripe from "stripe";

import { checkoutItemSchema } from "@/lib/checkout-schema";

export function getPurchasedItems(
  lineItems: { readonly data: readonly Stripe.LineItem[] } | null | undefined,
) {
  if (!lineItems) {
    return [];
  }

  return lineItems.data.flatMap((lineItem) => {
    const stripeProduct = lineItem.price?.product;
    if (
      !stripeProduct ||
      typeof stripeProduct === "string" ||
      !("metadata" in stripeProduct)
    ) {
      return [];
    }

    const parsed = checkoutItemSchema.safeParse({
      productId: stripeProduct.metadata.product_id,
      variantId: stripeProduct.metadata.variant_id,
      quantity: lineItem.quantity,
    });

    return parsed.success ? [parsed.data] : [];
  });
}
