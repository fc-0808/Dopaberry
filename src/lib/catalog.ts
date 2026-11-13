export type CategorySlug = "iphone-cases" | "airpods-cases" | "extras";

export interface Category {
  readonly slug: CategorySlug;
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
}

export interface ProductVariant {
  readonly id: string;
  readonly label: string;
}

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly story: string;
  readonly category: CategorySlug;
  readonly price: number;
  readonly availability: "in_stock" | "preorder" | "out_of_stock";
  readonly featured: boolean;
  readonly badge?: "New" | "Limited";
  readonly art: "phone" | "airpods" | "grip" | "charm" | "cable";
  readonly palette: {
    readonly primary: string;
    readonly secondary: string;
    readonly surface: string;
  };
  readonly features: readonly string[];
  readonly variants: readonly ProductVariant[];
}

export const categories: readonly Category[] = [
  {
    slug: "iphone-cases",
    name: "iPhone cases",
    shortName: "iPhone",
    description:
      "Protective cases in saturated color, with precise openings for cameras and buttons.",
  },
  {
    slug: "airpods-cases",
    name: "AirPods cases",
    shortName: "AirPods",
    description: "Compact covers with a secure fit and open charging access.",
  },
  {
    slug: "extras",
    name: "Accessories",
    shortName: "Extras",
    description: "Grips, charms, and cable details that finish the setup.",
  },
] as const;

export const catalogRevisedOn = "2026-10-24";

const iphoneVariants: readonly ProductVariant[] = [
  { id: "iphone-18-pro-max", label: "iPhone 18 Pro Max" },
  { id: "iphone-18-pro", label: "iPhone 18 Pro" },
  { id: "iphone-17-pro-max", label: "iPhone 17 Pro Max" },
  { id: "iphone-17-pro", label: "iPhone 17 Pro" },
  { id: "iphone-16-pro-max", label: "iPhone 16 Pro Max" },
  { id: "iphone-16-pro", label: "iPhone 16 Pro" },
  { id: "iphone-15-pro-max", label: "iPhone 15 Pro Max" },
  { id: "iphone-15-pro", label: "iPhone 15 Pro" },
] as const;

const airpodsVariants: readonly ProductVariant[] = [
  { id: "airpods-pro-3", label: "AirPods Pro 3" },
  { id: "airpods-5", label: "AirPods 5" },
  { id: "airpods-pro-2", label: "AirPods Pro (2nd gen)" },
  { id: "airpods-4", label: "AirPods 4" },
  { id: "airpods-3", label: "AirPods (3rd gen)" },
] as const;

const standardVariant: readonly ProductVariant[] = [
  { id: "standard", label: "One size" },
] as const;

export const products: readonly Product[] = [
  {
    id: "prod_bloom_case",
    slug: "dopamine-bloom-iphone-case",
    name: "Dopamine Bloom Case",
    eyebrow: "Protective iPhone case",
    description: "A high-contrast floral case with a shock-absorbing shell.",
    story:
      "Oversized blooms cover a protective shell made for daily carry, with raised edges around the camera and screen.",
    category: "iphone-cases",
    price: 3_400,
    availability: "in_stock",
    featured: true,
    badge: "New",
    art: "phone",
    palette: {
      primary: "#ff4f9a",
      secondary: "#ffec5c",
      surface: "#ffd5e8",
    },
    features: [
      "Raised camera and screen edges",
      "Soft-touch, anti-slip finish",
      "Wireless charging compatible",
      "Printed with durable, fade-resistant inks",
    ],
    variants: iphoneVariants,
  },
  {
    id: "prod_swirl_case",
    slug: "serotonin-swirl-iphone-case",
    name: "Serotonin Swirl Case",
    eyebrow: "Protective iPhone case",
    description: "A citrus-pink swirl on a protective two-layer case.",
    story:
      "Fluid color bands sit on a grippy shell with precise openings for buttons, ports, and wireless charging.",
    category: "iphone-cases",
    price: 3_600,
    availability: "in_stock",
    featured: true,
    art: "phone",
    palette: {
      primary: "#ff6a3d",
      secondary: "#ffb6db",
      surface: "#fff0c7",
    },
    features: [
      "Dual-layer impact protection",
      "Comfortable grippy side rails",
      "Wireless charging compatible",
      "Precise button and port access",
    ],
    variants: iphoneVariants,
  },
  {
    id: "prod_mood_case",
    slug: "mood-ring-magsafe-case",
    name: "Mood Ring MagSafe Case",
    eyebrow: "MagSafe iPhone case",
    description:
      "Electric blue and grape, with a magnetic ring for charging alignment.",
    story:
      "A saturated color study with an integrated magnetic ring for dependable charging and accessory alignment.",
    category: "iphone-cases",
    price: 3_800,
    availability: "in_stock",
    featured: true,
    badge: "Limited",
    art: "phone",
    palette: {
      primary: "#6857ff",
      secondary: "#58e6ff",
      surface: "#d9d4ff",
    },
    features: [
      "Built-in MagSafe-compatible magnetic ring",
      "Shock-absorbing bumper",
      "Raised camera and screen edges",
      "Soft microfiber interior",
    ],
    variants: iphoneVariants,
  },
  {
    id: "prod_cloud_airpods",
    slug: "cloud-nine-airpods-case",
    name: "Cloud Nine AirPods Case",
    eyebrow: "Protective AirPods case",
    description: "A blue shell with a clip, cut for the charging case.",
    story:
      "A two-piece shell covers the charging case, leaves the port open, and includes a color-matched clip.",
    category: "airpods-cases",
    price: 2_600,
    availability: "in_stock",
    featured: true,
    art: "airpods",
    palette: {
      primary: "#36b8ff",
      secondary: "#ffffff",
      surface: "#cceeff",
    },
    features: [
      "Impact-resistant shell",
      "Includes color-matched carabiner",
      "Charging port access",
      "Wireless charging compatible",
    ],
    variants: airpodsVariants,
  },
  {
    id: "prod_check_airpods",
    slug: "cosmic-check-airpods-case",
    name: "Cosmic Check AirPods Case",
    eyebrow: "Protective AirPods case",
    description: "A checkerboard remix in cherry red and deep-space purple.",
    story:
      "Classic checks get a high-energy palette and a durable finish built for bags, pockets, and the occasional drop.",
    category: "airpods-cases",
    price: 2_400,
    availability: "in_stock",
    featured: false,
    art: "airpods",
    palette: {
      primary: "#ef3f63",
      secondary: "#3a176d",
      surface: "#ffd4dd",
    },
    features: [
      "Snug two-piece construction",
      "Includes a removable carabiner",
      "Visible charging indicator",
      "Wireless charging compatible",
    ],
    variants: airpodsVariants,
  },
  {
    id: "prod_orbit_grip",
    slug: "orbit-magsafe-grip",
    name: "Orbit MagSafe Grip",
    eyebrow: "Magnetic phone grip",
    description:
      "A magnetic grip that works as a stand and removes for charging.",
    story:
      "The collapsible grip snaps onto MagSafe-compatible cases and removes cleanly when it is time to charge.",
    category: "extras",
    price: 1_800,
    availability: "in_stock",
    featured: true,
    badge: "New",
    art: "grip",
    palette: {
      primary: "#ffcf24",
      secondary: "#ff5e4d",
      surface: "#fff0a8",
    },
    features: [
      "Strong magnetic attachment",
      "Two comfortable grip positions",
      "Removable for wireless charging",
      "Works as a portrait or landscape stand",
    ],
    variants: standardVariant,
  },
  {
    id: "prod_joy_charm",
    slug: "joy-loop-phone-charm",
    name: "Joy Loop Phone Charm",
    eyebrow: "Beaded phone charm",
    description: "A lightweight beaded loop for cases with a charm eyelet.",
    story:
      "A hand-strung mix of translucent and opaque beads adds an easy carry loop and a hit of color to compatible cases.",
    category: "extras",
    price: 1_600,
    availability: "in_stock",
    featured: false,
    art: "charm",
    palette: {
      primary: "#ff72ba",
      secondary: "#70e7a8",
      surface: "#ffe0f0",
    },
    features: [
      "Durable woven attachment loop",
      "Lightweight acrylic beads",
      "Approximately 8 inches long",
      "Compatible with cases featuring a charm eyelet",
    ],
    variants: standardVariant,
  },
  {
    id: "prod_cable_kit",
    slug: "color-rush-cable-kit",
    name: "Color Rush Cable Kit",
    eyebrow: "Cable accessory set",
    description:
      "Four silicone protectors for the ends of common USB-C cables.",
    story:
      "Flexible protectors wrap common USB-C cable ends to add color and help reduce everyday bending at the connector.",
    category: "extras",
    price: 1_400,
    availability: "in_stock",
    featured: false,
    art: "cable",
    palette: {
      primary: "#63e5c1",
      secondary: "#8058ff",
      surface: "#d5fff2",
    },
    features: [
      "Set of four mixed colors",
      "Flexible silicone construction",
      "Designed for common USB-C cable ends",
      "Reusable and easy to install",
    ],
    variants: standardVariant,
  },
] as const;

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return products.filter((product) => product.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getVariant(
  product: Product,
  variantId: string,
): ProductVariant | undefined {
  return product.variants.find((variant) => variant.id === variantId);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id && candidate.category === product.category,
    )
    .slice(0, limit);
}
