import { ImageResponse } from "next/og";

import { BrandIconGraphic } from "@/components/brand-icon-graphic";
import { brandPalette } from "@/lib/brand-mark";

export const alt = "DopaBerry colorful mobile accessories";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: brandPalette.paper,
        color: brandPalette.ink,
        display: "flex",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 80px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 760,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontWeight: 800,
          }}
        >
          Dopa
          <span style={{ color: brandPalette.pink }}>Berry</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.15,
            marginTop: 48,
          }}
        >
          Everyday color,
        </div>
        <div
          style={{
            color: brandPalette.pink,
            display: "flex",
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          on purpose.
        </div>
        <div
          style={{
            color: "#586480",
            display: "flex",
            fontSize: 28,
            marginTop: 32,
          }}
        >
          Saturated color for the things you reach for.
        </div>
      </div>
      <div style={{ display: "flex", height: 280, width: 280 }}>
        <BrandIconGraphic size={280} />
      </div>
    </div>,
    size,
  );
}
