import { afterEach, describe, expect, it, vi } from "vitest";

import { getCommerceConfiguration, isAllowedCheckoutOrigin } from "@/lib/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("commerce environment", () => {
  it("keeps payments disabled by default", () => {
    vi.stubEnv("COMMERCE_MODE", "disabled");
    vi.stubEnv("STRIPE_SECRET_KEY", "");

    const configuration = getCommerceConfiguration();

    expect(configuration.mode).toBe("disabled");
    expect(configuration.checkoutReady).toBe(false);
    expect(configuration.webhooksReady).toBe(false);
  });

  it("accepts a complete Stripe test configuration", () => {
    vi.stubEnv("COMMERCE_MODE", "test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_1234567890abcdefghijkl");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_1234567890abcdefghijkl");

    const configuration = getCommerceConfiguration();

    expect(configuration.checkoutReady).toBe(true);
    expect(configuration.webhooksReady).toBe(true);
    expect(configuration.issues).toEqual([]);
  });

  it("accepts a restricted test key", () => {
    vi.stubEnv("COMMERCE_MODE", "test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("STRIPE_SECRET_KEY", "rk_test_1234567890abcdefghijkl");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_1234567890abcdefghijkl");

    const configuration = getCommerceConfiguration();

    expect(configuration.checkoutReady).toBe(true);
    expect(configuration.webhooksReady).toBe(true);
    expect(configuration.issues).toEqual([]);
  });

  it("rejects test keys and insecure URLs in live mode", () => {
    vi.stubEnv("COMMERCE_MODE", "live");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_1234567890abcdefghijkl");

    const configuration = getCommerceConfiguration();

    expect(configuration.checkoutReady).toBe(false);
    expect(configuration.issues).toHaveLength(2);
  });

  it("treats documented placeholder secrets as unconfigured", () => {
    vi.stubEnv("COMMERCE_MODE", "test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_replace_me");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_replace_me");

    const configuration = getCommerceConfiguration();

    expect(configuration.checkoutReady).toBe(false);
    expect(configuration.webhooksReady).toBe(false);
    expect(configuration.stripeSecretKey).toBeNull();
    expect(configuration.stripeWebhookSecret).toBeNull();
  });

  it("allows only configured storefront origins", () => {
    vi.stubEnv("COMMERCE_MODE", "test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.dopaberry.com");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_1234567890abcdefghijkl");

    const configuration = getCommerceConfiguration();

    expect(
      isAllowedCheckoutOrigin("https://preview.dopaberry.com", configuration),
    ).toBe(true);
    expect(isAllowedCheckoutOrigin("http://[::1]:3000", configuration)).toBe(
      false,
    );
    expect(isAllowedCheckoutOrigin("https://evil.example", configuration)).toBe(
      false,
    );
    expect(isAllowedCheckoutOrigin(null, configuration)).toBe(false);
  });

  it("allows loopback origins only for a local storefront", () => {
    vi.stubEnv("COMMERCE_MODE", "test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_1234567890abcdefghijkl");

    const configuration = getCommerceConfiguration();

    expect(
      isAllowedCheckoutOrigin("http://127.0.0.1:3000", configuration),
    ).toBe(true);
    expect(
      isAllowedCheckoutOrigin("https://preview.dopaberry.com", configuration),
    ).toBe(false);
  });
});
