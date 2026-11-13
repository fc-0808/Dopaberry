import { describe, expect, it } from "vitest";

import { formatPrice } from "@/lib/currency";

describe("formatPrice", () => {
  it("formats integer cents as US dollars", () => {
    expect(formatPrice(0)).toBe("$0");
    expect(formatPrice(1_400)).toBe("$14");
    expect(formatPrice(1_499)).toBe("$14.99");
  });

  it("rejects invalid price representations", () => {
    expect(() => formatPrice(-1)).toThrow(RangeError);
    expect(() => formatPrice(10.5)).toThrow(RangeError);
  });
});
