import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getProductById, getVariant } from "@/lib/catalog";
import {
  checkoutRequestSchema,
  type CheckoutRequest,
} from "@/lib/checkout-schema";
import { getCommerceConfiguration, isAllowedCheckoutOrigin } from "@/lib/env";
import { siteConfig } from "@/lib/site";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

const maxCheckoutBodyBytes = 16_384;

function checkoutJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

class PayloadTooLargeError extends Error {}

async function readBoundedJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxCheckoutBodyBytes) {
    throw new PayloadTooLargeError();
  }

  if (!request.body) {
    throw new SyntaxError("Request body is empty.");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    totalBytes += value.byteLength;
    if (totalBytes > maxCheckoutBodyBytes) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return JSON.parse(text) as unknown;
}

function consolidateItems(items: CheckoutRequest["items"]) {
  const consolidated = new Map<string, CheckoutRequest["items"][number]>();

  for (const item of items) {
    const key = `${item.productId}:${item.variantId}`;
    const existing = consolidated.get(key);
    consolidated.set(key, {
      ...item,
      quantity: (existing?.quantity ?? 0) + item.quantity,
    });
  }

  return [...consolidated.values()];
}

export async function POST(request: Request) {
  const configuration = getCommerceConfiguration();

  if (!isAllowedCheckoutOrigin(request.headers.get("origin"), configuration)) {
    return checkoutJson(
      { error: "Checkout requests must come from the storefront." },
      403,
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return checkoutJson({ error: "Checkout requests must use JSON." }, 415);
  }

  let body: unknown;
  try {
    body = await readBoundedJson(request);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return checkoutJson({ error: "The checkout request is too large." }, 413);
    }

    return checkoutJson(
      { error: "The checkout request could not be read." },
      400,
    );
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return checkoutJson(
      { error: "Your cart contains invalid items or quantities." },
      400,
    );
  }

  if (!configuration.checkoutReady || !configuration.siteUrl) {
    console.warn(
      JSON.stringify({
        event: "checkout.configuration_unavailable",
        mode: configuration.mode,
        issues: configuration.issues,
      }),
    );

    return checkoutJson(
      {
        error: "Checkout is not configured yet. Please try again later.",
      },
      503,
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return checkoutJson({ error: "Checkout is temporarily unavailable." }, 503);
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;

  for (const item of consolidateItems(parsed.data.items)) {
    const product = getProductById(item.productId);
    const variant = product ? getVariant(product, item.variantId) : undefined;

    if (!product || !variant || product.availability !== "in_stock") {
      return checkoutJson(
        {
          error:
            "One of your items is no longer available. Refresh your cart and try again.",
        },
        400,
      );
    }

    subtotal += product.price * item.quantity;
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: product.price,
        tax_behavior: "exclusive",
        product_data: {
          name: product.name,
          description: variant.label,
          metadata: {
            product_id: product.id,
            product_slug: product.slug,
            variant_id: variant.id,
          },
        },
      },
    });
  }

  const shippingAmount =
    subtotal >= siteConfig.freeShippingThreshold
      ? 0
      : siteConfig.standardShippingAmount;

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        integration_identifier: "dopaberry-hosted-checkout",
        line_items: lineItems,
        success_url: `${configuration.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${configuration.siteUrl}/checkout/cancel?attempt_id=${encodeURIComponent(parsed.data.requestId)}`,
        client_reference_id: parsed.data.requestId,
        customer_creation: "always",
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        shipping_address_collection: {
          allowed_countries: ["US"],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name:
                shippingAmount === 0
                  ? "Free standard shipping"
                  : "Standard shipping",
              tax_behavior: "exclusive",
              fixed_amount: {
                amount: shippingAmount,
                currency: "usd",
              },
              delivery_estimate: {
                minimum: {
                  unit: "business_day",
                  value: siteConfig.standardDeliveryDays.minimum,
                },
                maximum: {
                  unit: "business_day",
                  value: siteConfig.standardDeliveryDays.maximum,
                },
              },
            },
          },
        ],
        phone_number_collection: {
          enabled: true,
        },
        metadata: {
          request_id: parsed.data.requestId,
          cart_version: "1",
        },
        payment_intent_data: {
          metadata: {
            request_id: parsed.data.requestId,
          },
        },
      },
      {
        idempotencyKey: `dopaberry-checkout-${parsed.data.requestId}`,
      },
    );

    if (session.status === "expired") {
      return checkoutJson(
        {
          code: "checkout_session_expired",
          error:
            "Your previous checkout session expired. Please open a new checkout.",
        },
        409,
      );
    }

    if (session.status === "complete") {
      return checkoutJson(
        {
          code: "checkout_session_completed",
          sessionId: session.id,
          error:
            "This checkout was already completed. Check your confirmation before trying again.",
        },
        409,
      );
    }

    if (!session.url) {
      throw new Error("Stripe did not return a hosted checkout URL.");
    }

    return checkoutJson({ url: session.url }, 201);
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "checkout.session.create_failed",
        requestId: parsed.data.requestId,
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    );

    return checkoutJson(
      { error: "Secure checkout could not be opened. Please try again." },
      502,
    );
  }
}
