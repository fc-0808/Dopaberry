import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import { getProductBySlug, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/currency";

export const alt = "DopaBerry product";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function ProductShareArt({
  art,
  primary,
  secondary,
}: {
  readonly art: Product["art"];
  readonly primary: string;
  readonly secondary: string;
}) {
  if (art === "airpods") {
    return (
      <div
        style={{
          background: primary,
          border: "1px solid rgba(28, 25, 23, 0.18)",
          borderRadius: 70,
          display: "flex",
          height: 210,
          position: "relative",
          transform: "rotate(-6deg)",
          width: 280,
        }}
      >
        <div
          style={{
            background: "#171310",
            display: "flex",
            height: 3,
            left: 0,
            position: "absolute",
            right: 0,
            top: 76,
          }}
        />
        <div
          style={{
            background: secondary,
            border: "1px solid rgba(28, 25, 23, 0.18)",
            borderRadius: 999,
            display: "flex",
            height: 28,
            left: 32,
            position: "absolute",
            right: 32,
            top: 24,
          }}
        />
      </div>
    );
  }

  if (art === "grip") {
    return (
      <div
        style={{
          alignItems: "center",
          background: primary,
          border: "1px solid rgba(28, 25, 23, 0.18)",
          borderRadius: 999,
          display: "flex",
          height: 260,
          justifyContent: "center",
          transform: "rotate(8deg)",
          width: 260,
        }}
      >
        <div
          style={{
            border: `16px solid ${secondary}`,
            borderRadius: 999,
            display: "flex",
            height: 150,
            width: 150,
          }}
        />
      </div>
    );
  }

  if (art === "charm") {
    return (
      <div
        style={{
          border: `22px dotted ${primary}`,
          borderRadius: 999,
          display: "flex",
          height: 330,
          position: "relative",
          transform: "rotate(14deg)",
          width: 190,
        }}
      >
        <div
          style={{
            background: secondary,
            border: "1px solid rgba(28, 25, 23, 0.18)",
            borderRadius: 999,
            bottom: 4,
            display: "flex",
            height: 70,
            position: "absolute",
            right: -24,
            width: 70,
          }}
        />
      </div>
    );
  }

  if (art === "cable") {
    return (
      <div
        style={{
          border: `20px solid ${primary}`,
          borderRadius: 999,
          display: "flex",
          height: 280,
          position: "relative",
          transform: "rotate(-18deg)",
          width: 250,
        }}
      >
        <div
          style={{
            background: secondary,
            border: "1px solid rgba(28, 25, 23, 0.18)",
            borderRadius: 14,
            bottom: -34,
            display: "flex",
            height: 72,
            position: "absolute",
            right: -20,
            width: 90,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: primary,
        border: "1px solid rgba(28, 25, 23, 0.18)",
        borderRadius: 52,
        display: "flex",
        height: 360,
        position: "relative",
        transform: "rotate(8deg)",
        width: 210,
      }}
    >
      <div
        style={{
          background: secondary,
          border: "1px solid rgba(28, 25, 23, 0.18)",
          borderRadius: 28,
          display: "flex",
          height: 74,
          left: 18,
          position: "absolute",
          top: 18,
          width: 74,
        }}
      />
      <div
        style={{
          bottom: 52,
          color: "#171310",
          display: "flex",
          fontSize: 44,
          fontWeight: 900,
          left: 24,
          lineHeight: 0.86,
          position: "absolute",
        }}
      >
        DOPA
        <br />
        POP
      </div>
    </div>
  );
}

export default async function ProductOpenGraphImage({
  params,
}: {
  readonly params: Promise<{ readonly slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primary = product.palette.primary;
  const secondary = product.palette.secondary;
  const surface = product.palette.surface;

  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#fafdfc",
        color: "#182039",
        display: "flex",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "70px 82px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 600,
        }}
      >
        <div
          style={{
            color: "#ff5c93",
            display: "flex",
            fontFamily: "Arial, sans-serif",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: 3,
            marginBottom: 28,
            textTransform: "uppercase",
          }}
        >
          DopaBerry
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 500,
            letterSpacing: -1.5,
            lineHeight: 1,
          }}
        >
          {product.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 27,
            lineHeight: 1.4,
            marginTop: 28,
          }}
        >
          {product.description}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 800,
            marginTop: 30,
          }}
        >
          {formatPrice(product.price)}
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          background: surface,
          borderRadius: 28,
          display: "flex",
          height: 470,
          justifyContent: "center",
          position: "relative",
          width: 390,
        }}
      >
        <ProductShareArt
          art={product.art}
          primary={primary}
          secondary={secondary}
        />
      </div>
    </div>,
    size,
  );
}
