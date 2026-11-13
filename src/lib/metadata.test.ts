import { describe, expect, it } from "vitest";

import { createPageMetadata } from "@/lib/metadata";

describe("page metadata", () => {
  it("emits complete Open Graph and Twitter fields", () => {
    const metadata = createPageMetadata({
      path: "/shop",
      title: "Shop",
      description: "Shop the collection.",
    });

    expect(metadata.alternates).toEqual({ canonical: "/shop" });
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "/shop",
      title: "Shop",
      siteName: "DopaBerry",
      images: [
        expect.objectContaining({
          url: "/opengraph-image",
          width: 1200,
          height: 630,
        }),
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Shop",
      images: ["/opengraph-image"],
    });
  });

  it("can retain the root document title on the home page", () => {
    const metadata = createPageMetadata({
      path: "/",
      title: "DopaBerry",
      description: "Colorful accessories.",
      useRootDocumentTitle: true,
    });

    expect(metadata.title).toBeUndefined();
  });
});
