import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

beforeEach(() => {
  vi.resetModules();
  const localStorage = createMemoryStorage();
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("cart hydration", () => {
  it("marks hydration complete after restoring storage", async () => {
    const { useCartStore } = await import("@/lib/cart-store");
    const { hydrateCartStore } = await import("@/lib/cart-hydration");
    vi.spyOn(useCartStore.persist, "rehydrate").mockResolvedValue();

    await hydrateCartStore();

    expect(useCartStore.getState().hasHydrated).toBe(true);
  });

  it("fails open with an empty usable cart when storage cannot be read", async () => {
    const { useCartStore } = await import("@/lib/cart-store");
    const { hydrateCartStore } = await import("@/lib/cart-hydration");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(useCartStore.persist, "rehydrate").mockRejectedValue(
      new Error("Storage unavailable"),
    );

    await expect(hydrateCartStore()).resolves.toBeUndefined();

    expect(useCartStore.getState().hasHydrated).toBe(true);
    expect(log).toHaveBeenCalledOnce();
  });
});
