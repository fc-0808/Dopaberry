import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/health", () => {
  it("reports liveness and commerce readiness without external calls", async () => {
    vi.stubEnv("COMMERCE_MODE", "disabled");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

    const response = GET();
    const payload = (await response.json()) as {
      status: string;
      checks: {
        catalog: { ready: boolean; productCount: number };
        commerce: { checkoutReady: boolean; mode: string };
      };
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload.status).toBe("ok");
    expect(payload.checks.catalog.ready).toBe(true);
    expect(payload.checks.catalog.productCount).toBeGreaterThan(0);
    expect(payload.checks.commerce).toMatchObject({
      mode: "disabled",
      checkoutReady: false,
    });
  });
});
