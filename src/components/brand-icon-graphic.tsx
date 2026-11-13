import { createElement, type CSSProperties, type ReactElement } from "react";

import { brandBurstDots, brandPalette } from "@/lib/brand-mark";

export function BrandIconGraphic({
  size,
}: {
  readonly size: number;
}): ReactElement {
  const box = Math.round(size * 0.62);

  return createElement(
    "div",
    {
      style: {
        alignItems: "center",
        background: brandPalette.paper,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      } satisfies CSSProperties,
    },
    createElement(
      "div",
      {
        style: {
          display: "flex",
          height: box,
          position: "relative",
          width: box,
        } satisfies CSSProperties,
      },
      brandBurstDots.map((dot) =>
        createElement("div", {
          key: `${dot.color}-${dot.x}-${dot.y}`,
          style: {
            background: brandPalette[dot.color],
            borderRadius: 999,
            height: (dot.size / 100) * box,
            left: (dot.x / 100) * box,
            position: "absolute",
            top: (dot.y / 100) * box,
            width: (dot.size / 100) * box,
          } satisfies CSSProperties,
        }),
      ),
    ),
  );
}
