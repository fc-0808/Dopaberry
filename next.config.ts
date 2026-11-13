import type { NextConfig } from "next";

import { getLiveDeploymentIssues } from "./src/lib/deploy-environment";
import { buildSecurityHeaders } from "./src/lib/security-headers";

const liveDeploymentIssues = getLiveDeploymentIssues({
  commerceMode: process.env.COMMERCE_MODE,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
});

if (liveDeploymentIssues.length > 0) {
  throw new Error(
    `Live commerce configuration is invalid:\n- ${liveDeploymentIssues.join("\n- ")}`,
  );
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    const securityHeaders = buildSecurityHeaders({
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      vercelEnv: process.env.VERCEL_ENV,
      commerceMode: process.env.COMMERCE_MODE,
    });

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
