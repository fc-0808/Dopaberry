import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";

import { POST } from "./route";

vi.mock("@/lib/stripe", () => ({
  getStripeClient: vi.fn(),
  getStripeWebhookSecret: vi.fn(),
}));

function webhookRequest(
  signature?: string,
  additionalHeaders: Record<string, string> = {},
) {
  const headers = new Headers(additionalHeaders);
  if (signature) {
    headers.set("stripe-signature", signature);
  }

  return new Request("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    body: "{}",
    headers,
  });
}

beforeEach(() => {
  vi.mocked(getStripeClient).mockReset();
  vi.mocked(getStripeWebhookSecret).mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/webhooks/stripe", () => {
  it("reports unavailable webhook configuration", async () => {
    vi.mocked(getStripeClient).mockReturnValue(null);
    vi.mocked(getStripeWebhookSecret).mockReturnValue(null);

    const response = await POST(webhookRequest("signature"));

    expect(response.status).toBe(503);
  });

  it("requires a Stripe signature", async () => {
    vi.mocked(getStripeClient).mockReturnValue({} as never);
    vi.mocked(getStripeWebhookSecret).mockReturnValue("whsec_valid");

    const response = await POST(webhookRequest());

    expect(response.status).toBe(400);
  });

  it("rejects failed signature verification", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(getStripeClient).mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => {
          throw new Error("Invalid signature");
        }),
      },
    } as never);
    vi.mocked(getStripeWebhookSecret).mockReturnValue("whsec_valid");

    const response = await POST(webhookRequest("invalid"));

    expect(response.status).toBe(400);
    expect(warning).toHaveBeenCalledOnce();
  });

  it.each(["paid", "no_payment_required"])(
    "classifies %s checkout as payment confirmed",
    async (paymentStatus) => {
      const info = vi.spyOn(console, "info").mockImplementation(() => {});
      const event = {
        id: "evt_123",
        type: "checkout.session.completed",
        created: 1_786_640_000,
        data: {
          object: {
            id: "cs_test_123",
            payment_status: paymentStatus,
            metadata: {
              cart_version: "1",
              request_id: "0f62f15c-59cf-4e5d-bd57-25df99165f7b",
            },
          },
        },
      };
      vi.mocked(getStripeClient).mockReturnValue({
        webhooks: {
          constructEvent: vi.fn(() => event),
        },
      } as never);
      vi.mocked(getStripeWebhookSecret).mockReturnValue("whsec_valid");

      const response = await POST(webhookRequest("valid"));
      const loggedEvent = JSON.parse(String(info.mock.calls[0]?.[0])) as Record<
        string,
        unknown
      >;

      expect(response.status).toBe(200);
      expect(loggedEvent.outcome).toBe("payment_confirmed");
      expect(loggedEvent.stripeEventId).toBe("evt_123");
    },
  );

  it("ignores checkout sessions not created by DopaBerry", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.mocked(getStripeClient).mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          id: "evt_other",
          type: "checkout.session.completed",
          created: 1_786_640_000,
          data: {
            object: {
              id: "cs_test_other",
              payment_status: "paid",
              metadata: {},
            },
          },
        })),
      },
    } as never);
    vi.mocked(getStripeWebhookSecret).mockReturnValue("whsec_valid");

    const response = await POST(webhookRequest("valid"));

    expect(response.status).toBe(200);
    expect(info).not.toHaveBeenCalled();
  });

  it("rejects oversized payloads before signature verification", async () => {
    const constructEvent = vi.fn();
    vi.mocked(getStripeClient).mockReturnValue({
      webhooks: { constructEvent },
    } as never);
    vi.mocked(getStripeWebhookSecret).mockReturnValue("whsec_valid");

    const response = await POST(
      webhookRequest("valid", { "Content-Length": "2000000" }),
    );

    expect(response.status).toBe(413);
    expect(constructEvent).not.toHaveBeenCalled();
  });
});
