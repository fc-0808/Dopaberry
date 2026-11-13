import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleCheckBig, Mail, Package } from "lucide-react";
import type Stripe from "stripe";

import { ReconcileCartOnSuccess } from "@/components/reconcile-cart-on-success";
import {
  checkoutRequestIdSchema,
  checkoutSessionIdSchema,
} from "@/lib/checkout-schema";
import {
  classifyCheckoutSession,
  shouldReconcileCheckout,
} from "@/lib/checkout-status";
import { getPurchasedItems } from "@/lib/purchased-items";
import { siteConfig } from "@/lib/site";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: {
    index: false,
    follow: false,
  },
};

interface SuccessPageProps {
  readonly searchParams: Promise<{
    readonly session_id?: string | string[];
  }>;
}

async function retrieveSession(value: string | undefined): Promise<{
  readonly session: Stripe.Checkout.Session;
  readonly purchasedItems: ReturnType<typeof getPurchasedItems>;
} | null> {
  if (!value || !checkoutSessionIdSchema.safeParse(value).success) {
    return null;
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(value);
    if (
      session.metadata?.cart_version !== "1" ||
      !checkoutRequestIdSchema.safeParse(session.metadata.request_id).success
    ) {
      return null;
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(value, {
      limit: 100,
      expand: ["data.price.product"],
    });

    return {
      session,
      purchasedItems: getPurchasedItems(lineItems),
    };
  } catch (error) {
    console.warn(
      JSON.stringify({
        event: "checkout.session.retrieve_failed",
        sessionSuffix: value.slice(-8),
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    );
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;
  const verifiedCheckout = await retrieveSession(sessionId);
  const session = verifiedCheckout?.session;
  const checkoutAttemptId = session?.metadata?.request_id;
  const confirmation = classifyCheckoutSession(
    session
      ? { status: session.status, payment_status: session.payment_status }
      : null,
  );
  const reference = session ? session.id.slice(-8).toUpperCase() : null;
  const purchasedItems = verifiedCheckout?.purchasedItems ?? [];
  const reconcileCart =
    shouldReconcileCheckout(confirmation) && Boolean(checkoutAttemptId);

  if (confirmation !== "confirmed") {
    const pendingCopy = {
      processing: {
        eyebrow: "Payment status",
        title: "Your payment is still processing.",
        body: "Stripe has this order. The purchased items are removed from your cart so they are not charged again. Refresh this page after the payment settles, or contact support if it does not.",
      },
      expired: {
        eyebrow: "Checkout expired",
        title: "This checkout expired.",
        body: "Nothing was charged, and your cart is unchanged.",
      },
      incomplete: {
        eyebrow: "Checkout incomplete",
        title: "This checkout was not completed.",
        body: "Nothing was charged. You can return to your cart and try again.",
      },
      unverified: {
        eyebrow: "Payment status",
        title: "We could not verify this checkout link.",
        body: "If you completed payment, check your email for the Stripe receipt or contact us and we will help confirm it.",
      },
    }[confirmation];

    return (
      <div className="page-shell">
        {reconcileCart ? (
          <ReconcileCartOnSuccess
            checkoutAttemptId={checkoutAttemptId ?? ""}
            purchasedItems={purchasedItems}
          />
        ) : null}
        <section className="shell checkout-result">
          <div
            aria-hidden="true"
            className="checkout-result__icon checkout-result__icon--pending"
          >
            <Mail size={30} />
          </div>
          <p className="eyebrow">{pendingCopy.eyebrow}</p>
          <h1>{pendingCopy.title}</h1>
          <p>{pendingCopy.body}</p>
          <div className="checkout-result__actions">
            <a
              className="button button--primary"
              href={`mailto:${siteConfig.email}`}
            >
              Contact support
            </a>
            <Link className="button button--secondary" href="/shop">
              Return to shop
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <ReconcileCartOnSuccess
        checkoutAttemptId={checkoutAttemptId ?? ""}
        purchasedItems={purchasedItems}
      />
      <section className="shell checkout-result">
        <div aria-hidden="true" className="checkout-result__icon">
          <CircleCheckBig size={34} />
        </div>
        <p className="eyebrow">Order confirmed</p>
        <h1>Your order is confirmed.</h1>
        <p>
          Thank you. Stripe has confirmed this payment, and the receipt is on
          its way.
        </p>

        <div className="confirmation-card">
          <div>
            <Package aria-hidden="true" size={22} />
            <span>
              <small>Order reference</small>
              <strong>{reference}</strong>
            </span>
          </div>
          <p>Save this reference in case you need help with your purchase.</p>
        </div>

        <div className="checkout-result__actions">
          <Link className="button button--primary" href="/shop">
            Continue shopping
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <a
            className="button button--secondary"
            href={`mailto:${siteConfig.email}`}
          >
            Need help?
          </a>
        </div>
      </section>
    </div>
  );
}
