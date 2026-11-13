import { ImageResponse } from "next/og";

import { BrandIconGraphic } from "@/components/brand-icon-graphic";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(BrandIconGraphic({ size: 192 }), {
    width: 192,
    height: 192,
  });
}
