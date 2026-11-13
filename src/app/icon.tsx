import { ImageResponse } from "next/og";

import { BrandIconGraphic } from "@/components/brand-icon-graphic";

export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<BrandIconGraphic size={size.width} />, size);
}
