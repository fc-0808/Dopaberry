export interface SecurityHeaderEnvironment {
  readonly nodeEnv: string | undefined;
  readonly siteUrl: string | undefined;
  readonly vercelEnv: string | undefined;
  readonly commerceMode: string | undefined;
}

export interface SecurityHeader {
  readonly key: string;
  readonly value: string;
}

function isHttpsOrigin(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === value.replace(/\/$/, "");
  } catch {
    return false;
  }
}

export function buildSecurityHeaders({
  nodeEnv,
  siteUrl,
  vercelEnv,
  commerceMode,
}: SecurityHeaderEnvironment): SecurityHeader[] {
  const developmentScriptPolicy =
    nodeEnv === "development" ? " 'unsafe-eval'" : "";
  const canonicalHttpsDeployment =
    isHttpsOrigin(siteUrl) &&
    (vercelEnv === "production" || commerceMode === "live");
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${developmentScriptPolicy} https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.stripe.com",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
    "form-action 'self' https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    ...(canonicalHttpsDeployment ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  return [
    {
      key: "Content-Security-Policy",
      value: contentSecurityPolicy,
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    ...(canonicalHttpsDeployment
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]
      : []),
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      key: "X-DNS-Prefetch-Control",
      value: "on",
    },
    {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin-allow-popups",
    },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()",
    },
  ];
}
