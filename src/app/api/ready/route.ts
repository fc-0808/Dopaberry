import { NextResponse } from "next/server";

import { products } from "@/lib/catalog";
import { getCommerceConfiguration } from "@/lib/env";

export function GET() {
  const commerce = getCommerceConfiguration();
  const catalogReady =
    products.length > 0 &&
    products.every(
      (product) => product.variants.length > 0 && product.price > 0,
    );
  const commerceRequired = commerce.mode !== "disabled";
  const commerceReady =
    !commerceRequired || (commerce.checkoutReady && commerce.webhooksReady);
  const ready = catalogReady && commerceReady;

  return NextResponse.json(
    {
      status: ready ? "ready" : "not_ready",
      checks: {
        catalog: catalogReady,
        commerce: commerceReady,
      },
      issues: commerceRequired ? commerce.issues : [],
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
