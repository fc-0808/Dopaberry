import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/ready", () => {
  it("treats an intentionally disabled storefront as ready", async () => {
    vi.stubEnv("COMMERCE_MODE", "disabled");

    const response = GET();
    const payload = (await response.json()) as {
      status: string;
      issues: string[];
    };

    expect(response.status).toBe(200);
    expect(payload.status).toBe("ready");
    expect(payload.issues).toEqual([]);
  });

  it("returns 503 when enabled commerce is incomplete", async () => {
    vi.stubEnv("COMMERCE_MODE", "live");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_replace_me");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_replace_me");

    const response = GET();
    const payload = (await response.json()) as {
      status: string;
      issues: string[];
    };

    expect(response.status).toBe(503);
    expect(payload.status).toBe("not_ready");
    expect(payload.issues.length).toBeGreaterThan(0);
  });

  it("reports a complete test-commerce deployment as ready", async () => {
    vi.stubEnv("COMMERCE_MODE", "test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_1234567890abcdefghijkl");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_1234567890abcdefghijkl");

    const response = GET();

    expect(response.status).toBe(200);
  });
});
