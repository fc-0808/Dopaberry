import "server-only";

import Stripe from "stripe";

import { getCommerceConfiguration } from "@/lib/env";

let stripeClient: Stripe | undefined;
let stripeClientKey: string | undefined;

export function getStripeClient(): Stripe | null {
  const configuration = getCommerceConfiguration();
  const secretKey = configuration.stripeSecretKey;

  if (!configuration.checkoutReady || !secretKey) {
    return null;
  }

  if (!stripeClient || stripeClientKey !== secretKey) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-09-30.endive",
      appInfo: {
        name: "DopaBerry Storefront",
        version: "0.1.0",
        url: "https://dopaberry.com",
      },
      maxNetworkRetries: 2,
      timeout: 20_000,
    });
    stripeClientKey = secretKey;
  }

  return stripeClient;
}

export function getStripeWebhookSecret(): string | null {
  const configuration = getCommerceConfiguration();
  return configuration.webhooksReady ? configuration.stripeWebhookSecret : null;
}
