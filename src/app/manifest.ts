import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DopaBerry",
    short_name: "DopaBerry",
    description: "Colorful mobile accessories for everyday carry.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafdfc",
    theme_color: "#fafdfc",
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
