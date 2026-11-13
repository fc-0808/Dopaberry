"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatPrice } from "@/lib/currency";
import { siteConfig } from "@/lib/site";

const swatches = [
  { id: "pink", label: "Pink", color: "#FF5C93", stage: "#FFE8F1" },
  { id: "citrus", label: "Citrus", color: "#FF7838", stage: "#D6F3FF" },
  { id: "violet", label: "Violet", color: "#9B6BFF", stage: "#EFE8FF" },
] as const;

type SwatchId = (typeof swatches)[number]["id"];

export function HomeHero() {
  const [activeId, setActiveId] = useState<SwatchId>("citrus");
  const active = swatches.find((swatch) => swatch.id === activeId);

  if (!active) {
    return null;
  }

  return (
    <section className="hero">
      <div className="shell hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">Dopamine, visually</p>
          <h1>
            Everyday color,
            <span style={{ color: active.color }}>on purpose.</span>
          </h1>
          <p className="hero__lede">
            Cases and small accessories in saturated color, so the things you
            reach for all day feel a little brighter. The fit stays practical.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/shop">
              Shop the collection
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <Link
              className="button button--secondary"
              href="/shop?category=iphone-cases"
            >
              Shop iPhone cases
            </Link>
          </div>
          <p className="hero__microcopy">
            Free US shipping over {formatPrice(siteConfig.freeShippingThreshold)}{" "}
            · {siteConfig.returnWindowDays}-day returns · Secure checkout
          </p>
        </div>

        <div
          className="hero-art"
          style={{ "--stage": active.stage } as CSSProperties}
        >
          <div className="hero-art__frame">
            <p className="hero-art__kicker">Color, daily</p>
            <div
              aria-hidden="true"
              className="hero-case"
              style={{ "--case": active.color } as CSSProperties}
            >
              <span className="hero-case__rail hero-case__rail--silent" />
              <span className="hero-case__rail hero-case__rail--volume" />
              <span className="hero-case__rail hero-case__rail--power" />
              <span className="hero-case__camera">
                <i />
                <i />
                <i />
              </span>
              <span className="hero-case__ring" />
              <span className="hero-case__mark">DopaBerry</span>
            </div>
            <div
              aria-label="Preview a case color"
              className="hero-art__footer"
              role="group"
            >
              {swatches.map((swatch) => (
                <button
                  aria-pressed={swatch.id === activeId}
                  className="dopa-swatch-pill"
                  key={swatch.id}
                  onClick={() => setActiveId(swatch.id)}
                  style={{ "--swatch": swatch.color } as CSSProperties}
                  type="button"
                >
                  <i aria-hidden="true" />
                  {swatch.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
