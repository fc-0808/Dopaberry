import { describe, expect, it } from "vitest";

import { getLiveDeploymentIssues } from "@/lib/deploy-environment";

describe("live deployment environment", () => {
  it("does not require Stripe when commerce is explicitly disabled", () => {
    expect(
      getLiveDeploymentIssues({
        commerceMode: "disabled",
        siteUrl: undefined,
        stripeSecretKey: undefined,
        stripeWebhookSecret: undefined,
      }),
    ).toEqual([]);
  });

  it("accepts a complete public live configuration", () => {
    expect(
      getLiveDeploymentIssues({
        commerceMode: "live",
        siteUrl: "https://dopaberry.com",
        stripeSecretKey: "sk_live_1234567890abcdefghijkl",
        stripeWebhookSecret: "whsec_1234567890abcdefghijkl",
      }),
    ).toEqual([]);
  });

  it("accepts a restricted live key", () => {
    expect(
      getLiveDeploymentIssues({
        commerceMode: "live",
        siteUrl: "https://dopaberry.com",
        stripeSecretKey: "rk_live_1234567890abcdefghijkl",
        stripeWebhookSecret: "whsec_1234567890abcdefghijkl",
      }),
    ).toEqual([]);
  });

  it("rejects local URLs, test keys, and placeholder webhooks", () => {
    const issues = getLiveDeploymentIssues({
      commerceMode: "live",
      siteUrl: "https://127.0.0.1",
      stripeSecretKey: "sk_test_1234567890abcdefghijkl",
      stripeWebhookSecret: "whsec_replace_me",
    });

    expect(issues).toHaveLength(3);
  });
});
