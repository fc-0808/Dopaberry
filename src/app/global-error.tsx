"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly retry: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        event: "ui.global_error_boundary",
        digest: error.digest ?? null,
        message:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Unexpected UI error",
      }),
    );
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fafdfc",
          color: "#182039",
          fontFamily: "Fredoka, ui-rounded, Trebuchet MS, sans-serif",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "36rem" }}>
          <p style={{ fontWeight: 800, letterSpacing: "0.08em" }}>DOPABERRY</p>
          <h1>Something did not load.</h1>
          <p>
            Try that again. If the issue sticks around, the shop is still here.
          </p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: "1rem",
              padding: "0.8rem 1.1rem",
              border: "1.5px solid #182039",
              borderRadius: "999px",
              background: "#ff7838",
              boxShadow: "4px 4px 0 #b7e4ff",
              color: "#182039",
              fontFamily: "Fredoka, ui-rounded, Trebuchet MS, sans-serif",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
