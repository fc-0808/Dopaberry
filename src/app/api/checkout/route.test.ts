import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getStripeClient } from "@/lib/stripe";

import { POST } from "./route";

vi.mock("@/lib/stripe", () => ({
  getStripeClient: vi.fn(),
}));

const requestId = "0f62f15c-59cf-4e5d-bd57-25df99165f7b";
const validBody = {
  requestId,
  items: [
    {
      productId: "prod_bloom_case",
      variantId: "iphone-17-pro",
      quantity: 2,
    },
  ],
};

function checkoutRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      ...headers,
    },
  });
}

beforeEach(() => {
  vi.stubEnv("COMMERCE_MODE", "test");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_1234567890abcdefghijkl");
  vi.mocked(getStripeClient).mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/checkout", () => {
  it("rejects requests without an allowed Origin", async () => {
    const request = checkoutRequest(JSON.stringify(validBody));
    request.headers.delete("origin");

    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it("requires a JSON content type", async () => {
    const response = await POST(
      checkoutRequest(JSON.stringify(validBody), {
        "Content-Type": "text/plain",
      }),
    );

    expect(response.status).toBe(415);
  });

  it("rejects oversized request bodies before parsing", async () => {
    const response = await POST(
      checkoutRequest("{}", { "Content-Length": "20000" }),
    );

    expect(response.status).toBe(413);
  });

  it("rejects malformed and invalid carts", async () => {
    const malformed = await POST(checkoutRequest("{"));
    const invalid = await POST(
      checkoutRequest(JSON.stringify({ requestId, items: [] })),
    );

    expect(malformed.status).toBe(400);
    expect(invalid.status).toBe(400);
  });

  it("returns a safe unavailable response when commerce is disabled", async () => {
    vi.stubEnv("COMMERCE_MODE", "disabled");

    const response = await POST(checkoutRequest(JSON.stringify(validBody)));
    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(503);
    expect(payload.error).not.toContain("STRIPE_SECRET_KEY");
  });

  it("rejects stale catalog identifiers", async () => {
    vi.mocked(getStripeClient).mockReturnValue({} as never);

    const response = await POST(
      checkoutRequest(
        JSON.stringify({
          requestId,
          items: [
            {
              productId: "missing",
              variantId: "missing",
              quantity: 1,
            },
          ],
        }),
      ),
    );

    expect(response.status).toBe(400);
  });

  it("creates Stripe line items from server-owned catalog data", async () => {
    const createSession = vi.fn().mockResolvedValue({
      status: "open",
      url: "https://checkout.stripe.com/c/pay/test",
    });
    vi.mocked(getStripeClient).mockReturnValue({
      checkout: { sessions: { create: createSession } },
    } as never);

    const response = await POST(checkoutRequest(JSON.stringify(validBody)));
    const payload = (await response.json()) as { url: string };

    expect(response.status).toBe(201);
    expect(payload.url).toBe("https://checkout.stripe.com/c/pay/test");
    expect(createSession).toHaveBeenCalledOnce();
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        integration_identifier: "dopaberry-hosted-checkout",
        cancel_url: `http://localhost:3000/checkout/cancel?attempt_id=${requestId}`,
        line_items: [
          expect.objectContaining({
            quantity: 2,
            price_data: expect.objectContaining({
              unit_amount: 3_400,
              tax_behavior: "exclusive",
            }),
          }),
        ],
      }),
      { idempotencyKey: `dopaberry-checkout-${requestId}` },
    );
  });

  it("lets the client recover from an expired idempotent session", async () => {
    vi.mocked(getStripeClient).mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            status: "expired",
            url: "https://checkout.stripe.com/c/pay/expired",
          }),
        },
      },
    } as never);

    const response = await POST(checkoutRequest(JSON.stringify(validBody)));
    const payload = (await response.json()) as {
      code: string;
      error: string;
    };

    expect(response.status).toBe(409);
    expect(payload.code).toBe("checkout_session_expired");
  });

  it("returns a verified session id when checkout was already completed", async () => {
    vi.mocked(getStripeClient).mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: "cs_test_complete123",
            status: "complete",
            url: null,
          }),
        },
      },
    } as never);

    const response = await POST(checkoutRequest(JSON.stringify(validBody)));
    const payload = (await response.json()) as {
      code: string;
      sessionId: string;
    };

    expect(response.status).toBe(409);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(payload.code).toBe("checkout_session_completed");
    expect(payload.sessionId).toBe("cs_test_complete123");
  });
});
