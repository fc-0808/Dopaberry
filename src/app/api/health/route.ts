import { NextResponse } from "next/server";

import { products } from "@/lib/catalog";
import { getCommerceConfiguration } from "@/lib/env";

export function GET() {
  const commerce = getCommerceConfiguration();

  return NextResponse.json(
    {
      status: "ok",
      service: "dopaberry-storefront",
      readinessEndpoint: "/api/ready",
      checks: {
        catalog: {
          ready: products.length > 0,
          productCount: products.length,
        },
        commerce: {
          mode: commerce.mode,
          checkoutReady: commerce.checkoutReady,
          webhooksReady: commerce.webhooksReady,
          siteUrlConfigured: Boolean(commerce.siteUrl),
        },
      },
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
