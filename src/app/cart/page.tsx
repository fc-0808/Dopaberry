import type { Metadata } from "next";

import { CartPageClient } from "@/components/cart-page-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your DopaBerry cart and continue to secure checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <div className="page-shell">
      <div className="shell cart-page">
        <CartPageClient />
      </div>
    </div>
  );
}
