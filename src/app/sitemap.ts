import type { MetadataRoute } from "next";

import { policies } from "@/app/policies/[slug]/page";
import { catalogRevisedOn, products } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

function revisionDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const catalogModified = revisionDate(catalogRevisedOn);
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: catalogModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/shop`,
      lastModified: catalogModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: catalogModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...policies.map((policy) => ({
      url: `${siteConfig.url}/policies/${policy.slug}`,
      lastModified: revisionDate(policy.updatedOn),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}/products/${product.slug}`,
    lastModified: catalogModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
