import { ImageResponse } from "next/og";

import { BrandIconGraphic } from "@/components/brand-icon-graphic";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BrandIconGraphic size={size.width} />, size);
}
