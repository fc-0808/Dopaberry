import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { CancelCheckoutAttempt } from "@/components/cancel-checkout-attempt";
import { checkoutRequestIdSchema } from "@/lib/checkout-schema";

export const metadata: Metadata = {
  title: "Checkout canceled",
  robots: {
    index: false,
    follow: false,
  },
};

interface CheckoutCancelPageProps {
  readonly searchParams: Promise<{
    readonly attempt_id?: string | string[];
  }>;
}

export default async function CheckoutCancelPage({
  searchParams,
}: CheckoutCancelPageProps) {
  const params = await searchParams;
  const attemptId = Array.isArray(params.attempt_id)
    ? params.attempt_id[0]
    : params.attempt_id;
  const parsedAttemptId = checkoutRequestIdSchema.safeParse(attemptId);

  return (
    <div className="page-shell">
      {parsedAttemptId.success ? (
        <CancelCheckoutAttempt checkoutAttemptId={parsedAttemptId.data} />
      ) : null}
      <section className="shell checkout-result">
        <div
          aria-hidden="true"
          className="checkout-result__icon checkout-result__icon--pending"
        >
          <ShoppingBag size={30} />
        </div>
        <p className="eyebrow">Checkout paused</p>
        <h1>Your cart is still saved.</h1>
        <p>
          Nothing was charged. Return to your cart, or continue through the
          collection.
        </p>
        <div className="checkout-result__actions">
          <Link className="button button--primary" href="/cart">
            <ArrowLeft aria-hidden="true" size={18} />
            Return to cart
          </Link>
          <Link className="button button--secondary" href="/shop">
            Keep shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
