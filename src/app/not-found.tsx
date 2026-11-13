import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested DopaBerry page could not be found.",
};

export default function NotFound() {
  return (
    <div className="page-shell">
      <section className="shell not-found">
        <span aria-hidden="true" className="not-found__code">
          404
        </span>
        <p className="eyebrow">404</p>
        <h1>This page is not available.</h1>
        <p>
          The link may have moved, but the collection is exactly where we left
          it.
        </p>
        <Link className="button button--primary" href="/shop">
          <ArrowLeft aria-hidden="true" size={18} />
          Back to the shop
        </Link>
      </section>
    </div>
  );
}
