export interface DeploymentEnvironment {
  readonly commerceMode: string | undefined;
  readonly siteUrl: string | undefined;
  readonly stripeSecretKey: string | undefined;
  readonly stripeWebhookSecret: string | undefined;
}

function isPublicHttpsOrigin(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const localHostname =
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "::1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("127.");

    return (
      url.protocol === "https:" &&
      url.origin === value.replace(/\/$/, "") &&
      !localHostname
    );
  } catch {
    return false;
  }
}

const minimumStripeSecretSuffixLength = 12;

export function isConfiguredStripeSecretKey(
  value: string | null | undefined,
  mode: "test" | "live",
): boolean {
  if (!value) {
    return false;
  }

  const prefixes =
    mode === "live"
      ? (["sk_live_", "rk_live_"] as const)
      : (["sk_test_", "rk_test_"] as const);

  return prefixes.some(
    (prefix) =>
      value.startsWith(prefix) &&
      value.length > prefix.length + minimumStripeSecretSuffixLength,
  );
}

export function getLiveDeploymentIssues({
  commerceMode,
  siteUrl,
  stripeSecretKey,
  stripeWebhookSecret,
}: DeploymentEnvironment): string[] {
  if (commerceMode !== "live") {
    return [];
  }

  const issues: string[] = [];

  if (!isPublicHttpsOrigin(siteUrl)) {
    issues.push(
      "NEXT_PUBLIC_SITE_URL must be a public HTTPS origin in live mode.",
    );
  }

  if (!isConfiguredStripeSecretKey(stripeSecretKey, "live")) {
    issues.push(
      "STRIPE_SECRET_KEY must be a configured live key in live mode.",
    );
  }

  if (
    !stripeWebhookSecret?.startsWith("whsec_") ||
    stripeWebhookSecret.length <= "whsec_".length + 12
  ) {
    issues.push("STRIPE_WEBHOOK_SECRET must be configured in live mode.");
  }

  return issues;
}
