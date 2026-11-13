import type { Metadata, Viewport } from "next";
import { Fredoka, Geist } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fredoka({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "DopaBerry | Colorful mobile accessories",
    template: "%s | DopaBerry",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "colorful iPhone cases",
    "AirPods cases",
    "phone charms",
    "MagSafe accessories",
    "mobile accessories",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: "DopaBerry | Colorful mobile accessories",
    description: siteConfig.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DopaBerry | Colorful mobile accessories",
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fafdfc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html className={`${sans.variable} ${display.variable}`} lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
