import { z } from "zod";

export const maxQuantityPerLine = 10;
export const checkoutRequestIdSchema = z.uuidv4();
export const checkoutSessionIdSchema = z
  .string()
  .regex(/^cs_(?:test_|live_)?[A-Za-z0-9_]+$/);

export const checkoutItemSchema = z
  .object({
    productId: z.string().trim().min(1).max(80),
    variantId: z.string().trim().min(1).max(80),
    quantity: z.number().int().min(1).max(maxQuantityPerLine),
  })
  .strict();

export const checkoutRequestSchema = z
  .object({
    requestId: checkoutRequestIdSchema,
    items: z.array(checkoutItemSchema).min(1).max(20),
  })
  .strict()
  .superRefine(({ items }, context) => {
    const quantities = new Map<string, number>();

    for (const [index, item] of items.entries()) {
      const key = `${item.productId}:${item.variantId}`;
      const quantity = (quantities.get(key) ?? 0) + item.quantity;
      quantities.set(key, quantity);

      if (quantity > maxQuantityPerLine) {
        context.addIssue({
          code: "custom",
          message: `A cart line cannot exceed ${maxQuantityPerLine} items.`,
          path: ["items", index, "quantity"],
        });
      }
    }
  });

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export function isStripeCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
}
