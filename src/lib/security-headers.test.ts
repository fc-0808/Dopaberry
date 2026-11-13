import { describe, expect, it } from "vitest";

import { buildSecurityHeaders } from "@/lib/security-headers";

function toHeaderMap(
  headers: ReturnType<typeof buildSecurityHeaders>,
): Map<string, string> {
  return new Map(headers.map((header) => [header.key, header.value]));
}

describe("security header profiles", () => {
  it("supports local Next development without enabling HSTS", () => {
    const headers = toHeaderMap(
      buildSecurityHeaders({
        nodeEnv: "development",
        siteUrl: "http://localhost:3000",
        vercelEnv: undefined,
        commerceMode: "disabled",
      }),
    );

    expect(headers.get("Content-Security-Policy")).toContain("'unsafe-eval'");
    expect(headers.has("Strict-Transport-Security")).toBe(false);
    expect(headers.get("Content-Security-Policy")).not.toContain(
      "upgrade-insecure-requests",
    );
  });

  it("enables strict transport controls on the canonical live origin", () => {
    const headers = toHeaderMap(
      buildSecurityHeaders({
        nodeEnv: "production",
        siteUrl: "https://dopaberry.com",
        vercelEnv: "production",
        commerceMode: "live",
      }),
    );

    expect(headers.get("Strict-Transport-Security")).toContain(
      "includeSubDomains",
    );
    expect(headers.get("Content-Security-Policy")).toContain(
      "upgrade-insecure-requests",
    );
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
  });

  it("does not enable HSTS for a malformed canonical URL", () => {
    const headers = toHeaderMap(
      buildSecurityHeaders({
        nodeEnv: "production",
        siteUrl: "https://dopaberry.com/store",
        vercelEnv: "production",
        commerceMode: "live",
      }),
    );

    expect(headers.has("Strict-Transport-Security")).toBe(false);
  });
});
