import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

interface PageMetadataOptions {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly image?: {
    readonly url: string;
    readonly alt: string;
  };
  readonly useRootDocumentTitle?: boolean;
}

const defaultSocialImage = {
  url: "/opengraph-image",
  alt: "DopaBerry colorful mobile accessories",
} as const;

export function createPageMetadata({
  path,
  title,
  description,
  image = defaultSocialImage,
  useRootDocumentTitle = false,
}: PageMetadataOptions): Metadata {
  return {
    ...(useRootDocumentTitle ? {} : { title }),
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: path,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: image.url,
          width: 1200,
          height: 630,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
