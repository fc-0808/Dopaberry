"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  retry,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly retry: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        event: "ui.error_boundary",
        digest: error.digest ?? null,
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Unexpected UI error",
      }),
    );
  }, [error]);

  return (
    <div className="page-shell">
      <section className="shell not-found">
        <span aria-hidden="true" className="not-found__code">
          Error
        </span>
        <p className="eyebrow">Something interrupted this page</p>
        <h1>Something did not load.</h1>
        <p>
          Try that again. If the issue sticks around, the shop is still here.
        </p>
        <div className="checkout-result__actions">
          <button
            className="button button--primary"
            onClick={() => retry()}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={18} />
            Try again
          </button>
          <Link className="button button--secondary" href="/shop">
            Visit the shop
          </Link>
        </div>
      </section>
    </div>
  );
}
