export type CheckoutConfirmation =
  "confirmed" | "processing" | "expired" | "incomplete" | "unverified";

export function classifyCheckoutSession(
  session: {
    readonly status: string | null;
    readonly payment_status: string | null;
  } | null,
): CheckoutConfirmation {
  if (!session) {
    return "unverified";
  }

  if (session.status === "expired") {
    return "expired";
  }

  if (session.status !== "complete") {
    return "incomplete";
  }

  if (
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required"
  ) {
    return "confirmed";
  }

  return "processing";
}

export function shouldReconcileCheckout(
  confirmation: CheckoutConfirmation,
): boolean {
  return confirmation === "confirmed" || confirmation === "processing";
}
