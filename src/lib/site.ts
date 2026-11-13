const fallbackSiteUrl = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined): string {
  try {
    return new URL(value ?? fallbackSiteUrl).origin;
  } catch {
    return fallbackSiteUrl;
  }
}

export const siteConfig = {
  name: "DopaBerry",
  tagline: "Color you reach for.",
  description:
    "DopaBerry makes dopamine-inspired iPhone cases, AirPods cases, charms, and mobile accessories in saturated color, with a practical everyday fit.",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  email: "hello@dopaberry.com",
  currency: "USD",
  locale: "en_US",
  freeShippingThreshold: 5_000,
  standardShippingAmount: 495,
  shippingCountry: "US",
  returnWindowDays: 30,
  orderPreparationDays: {
    minimum: 2,
    maximum: 4,
  },
  standardDeliveryDays: {
    minimum: 3,
    maximum: 7,
  },
} as const;
