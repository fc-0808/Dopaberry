const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(cents: number): string {
  if (!Number.isInteger(cents) || cents < 0) {
    throw new RangeError("Price must be a non-negative integer in cents.");
  }

  return usdFormatter.format(cents / 100);
}
