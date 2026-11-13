import "server-only";

import { z } from "zod";

import { isConfiguredStripeSecretKey } from "@/lib/deploy-environment";

const commerceModeSchema = z.enum(["disabled", "test", "live"]);

const rawEnvironmentSchema = z.object({
  COMMERCE_MODE: commerceModeSchema.default("disabled"),
  NEXT_PUBLIC_SITE_URL: z.string().trim().optional(),
  STRIPE_SECRET_KEY: z.string().trim().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().trim().optional(),
  VERCEL_BRANCH_URL: z.string().trim().optional(),
  VERCEL_URL: z.string().trim().optional(),
});

export type CommerceMode = z.infer<typeof commerceModeSchema>;

export interface CommerceConfiguration {
  readonly mode: CommerceMode;
  readonly siteUrl: string | null;
  readonly stripeSecretKey: string | null;
  readonly stripeWebhookSecret: string | null;
  readonly checkoutReady: boolean;
  readonly webhooksReady: boolean;
  readonly issues: readonly string[];
}

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

function configuredValue(value: string | undefined): string | null {
  return value && !value.includes("replace_me") ? value : null;
}

export function getCommerceConfiguration(): CommerceConfiguration {
  const parsed = rawEnvironmentSchema.safeParse({
    COMMERCE_MODE: process.env.COMMERCE_MODE,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  });

  if (!parsed.success) {
    return {
      mode: "disabled",
      siteUrl: null,
      stripeSecretKey: null,
      stripeWebhookSecret: null,
      checkoutReady: false,
      webhooksReady: false,
      issues: ["Commerce environment values could not be parsed."],
    };
  }

  const mode = parsed.data.COMMERCE_MODE;
  const siteUrl = normalizeOrigin(parsed.data.NEXT_PUBLIC_SITE_URL);
  const stripeSecretKey = configuredValue(parsed.data.STRIPE_SECRET_KEY);
  const stripeWebhookSecret = configuredValue(
    parsed.data.STRIPE_WEBHOOK_SECRET,
  );
  const issues: string[] = [];

  if (mode === "disabled") {
    return {
      mode,
      siteUrl,
      stripeSecretKey: null,
      stripeWebhookSecret: null,
      checkoutReady: false,
      webhooksReady: false,
      issues,
    };
  }

  const siteHostname = siteUrl ? new URL(siteUrl).hostname.toLowerCase() : "";
  const localSiteUrl =
    siteHostname === "localhost" ||
    siteHostname.endsWith(".localhost") ||
    siteHostname === "::1" ||
    siteHostname === "0.0.0.0" ||
    siteHostname.startsWith("127.");
  const siteUrlValid =
    Boolean(siteUrl) &&
    (mode !== "live" ||
      (new URL(siteUrl ?? "").protocol === "https:" && !localSiteUrl));

  if (!siteUrl) {
    issues.push("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  } else if (!siteUrlValid) {
    issues.push("Live commerce requires a non-local HTTPS site URL.");
  }

  const stripeKeyValid = isConfiguredStripeSecretKey(
    stripeSecretKey,
    mode === "live" ? "live" : "test",
  );
  if (!stripeKeyValid) {
    issues.push(
      mode === "live"
        ? "COMMERCE_MODE=live requires an sk_live_ or rk_live_ Stripe key."
        : "COMMERCE_MODE=test requires an sk_test_ or rk_test_ Stripe key.",
    );
  }

  const webhookSecretValid = Boolean(
    stripeWebhookSecret?.startsWith("whsec_") &&
    stripeWebhookSecret.length > "whsec_".length + 12,
  );
  if (stripeWebhookSecret && !webhookSecretValid) {
    issues.push("STRIPE_WEBHOOK_SECRET is not a valid signing secret.");
  }

  const checkoutReady = siteUrlValid && stripeKeyValid;
  const webhooksReady = checkoutReady && webhookSecretValid;

  return {
    mode,
    siteUrl,
    stripeSecretKey,
    stripeWebhookSecret,
    checkoutReady,
    webhooksReady,
    issues,
  };
}

export function getAllowedCheckoutOrigins(
  configuration = getCommerceConfiguration(),
): ReadonlySet<string> {
  const origins = new Set<string>();

  if (configuration.siteUrl) {
    origins.add(configuration.siteUrl);
  }

  const siteHostname = configuration.siteUrl
    ? new URL(configuration.siteUrl).hostname.toLowerCase()
    : "";
  const loopbackSite =
    siteHostname === "localhost" ||
    siteHostname.endsWith(".localhost") ||
    siteHostname === "::1" ||
    siteHostname === "0.0.0.0" ||
    siteHostname.startsWith("127.");

  if (configuration.mode !== "live" && loopbackSite) {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
    origins.add("http://[::1]:3000");
  }

  if (configuration.mode !== "live") {
    for (const value of [
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
    ]) {
      const origin = normalizeOrigin(value ? `https://${value}` : undefined);
      if (origin) {
        origins.add(origin);
      }
    }
  }

  return origins;
}

export function isAllowedCheckoutOrigin(
  origin: string | null,
  configuration = getCommerceConfiguration(),
): boolean {
  const normalizedOrigin = normalizeOrigin(origin ?? undefined);
  return Boolean(
    normalizedOrigin &&
    getAllowedCheckoutOrigins(configuration).has(normalizedOrigin),
  );
}
