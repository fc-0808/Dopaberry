import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { checkoutRequestIdSchema } from "@/lib/checkout-schema";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

const maxWebhookBodyBytes = 1_048_576;

class PayloadTooLargeError extends Error {}

async function readBoundedText(request: Request): Promise<string> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxWebhookBodyBytes) {
    throw new PayloadTooLargeError();
  }

  if (!request.body) {
    return "";
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
    if (totalBytes > maxWebhookBodyBytes) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }

    text += decoder.decode(value, { stream: true });
  }

  return text + decoder.decode();
}

function isDopaBerrySession(session: Stripe.Checkout.Session): boolean {
  return (
    session.metadata?.cart_version === "1" &&
    checkoutRequestIdSchema.safeParse(session.metadata.request_id).success
  );
}

function logCommerceEvent(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  outcome:
    | "payment_confirmed"
    | "payment_pending"
    | "payment_failed"
    | "checkout_expired",
) {
  console.info(
    JSON.stringify({
      event: "stripe.webhook.received",
      stripeEventId: event.id,
      stripeEventType: event.type,
      stripeCreatedAt: event.created,
      checkoutSessionId: session.id,
      paymentStatus: session.payment_status,
      requestId: session.metadata?.request_id ?? null,
      outcome,
    }),
  );
}

function recordCommerceEvent(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  outcome:
    | "payment_confirmed"
    | "payment_pending"
    | "payment_failed"
    | "checkout_expired",
) {
  if (isDopaBerrySession(session)) {
    logCommerceEvent(event, session, outcome);
  }
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhooks are not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  let payload: string;
  try {
    payload = await readBoundedText(request);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json(
        { error: "Webhook payload is too large." },
        { status: 413 },
      );
    }

    return NextResponse.json(
      { error: "Webhook payload could not be read." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: "stripe.webhook.signature_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    );
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      recordCommerceEvent(
        event,
        session,
        session.payment_status === "paid" ||
          session.payment_status === "no_payment_required"
          ? "payment_confirmed"
          : "payment_pending",
      );
      break;
    }
    case "checkout.session.async_payment_succeeded":
      recordCommerceEvent(event, event.data.object, "payment_confirmed");
      break;
    case "checkout.session.async_payment_failed":
      recordCommerceEvent(event, event.data.object, "payment_failed");
      break;
    case "checkout.session.expired":
      recordCommerceEvent(event, event.data.object, "checkout_expired");
      break;
    default:
      break;
  }

  return NextResponse.json(
    { received: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
