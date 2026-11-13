import { expect, test } from "@playwright/test";

test("home page exposes the primary shopping journey", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/DopaBerry/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Everyday color/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Shop the collection/i }),
  ).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /opengraph-image/,
  );
});

test("catalog filters products by category", async ({ page }) => {
  await page.goto("/shop");

  await page.getByRole("button", { name: "AirPods cases" }).click();
  await expect(page).toHaveURL(/\/shop\?category=airpods-cases$/);
  await expect(page.getByRole("status")).toContainText("2 products");
  await expect(
    page.getByRole("heading", { name: "Cloud Nine AirPods Case" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    "Shop colorful mobile accessories",
  );
});

test("a selected product persists into the cart", async ({ page }) => {
  await page.goto("/products/dopamine-bloom-iphone-case");

  await page.getByLabel("Choose your fit").selectOption("iphone-17-pro");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(
    page.getByRole("button", { name: "Added to cart" }),
  ).toBeVisible();

  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { level: 1, name: "Your cart" }),
  ).toBeVisible();
  await expect(page.getByText("Dopamine Bloom Case")).toBeVisible();
});

test("mobile navigation manages focus and closes with Escape", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Open navigation" });

  if (testInfo.project.name !== "mobile-chrome") {
    await expect(menuButton).toBeHidden();
    return;
  }

  await menuButton.click();
  const mobileNavigation = page.locator("#mobile-navigation");
  const firstLink = mobileNavigation.getByRole("link", { name: "Shop all" });

  await expect(mobileNavigation).toBeVisible();
  await expect(firstLink).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    mobileNavigation.getByRole("link", { name: "About" }),
  ).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(mobileNavigation).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.setViewportSize({ width: 1_000, height: 800 });
  await expect(mobileNavigation).toBeHidden();
  await page.setViewportSize({ width: 412, height: 915 });
  await expect(mobileNavigation).toBeHidden();
});

test("clearing a bag requires explicit confirmation", async ({ page }) => {
  await page.goto("/products/dopamine-bloom-iphone-case");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/cart");

  await page.getByRole("button", { name: "Clear cart" }).click();
  await expect(page.getByRole("button", { name: "Yes, clear" })).toBeFocused();
  await page.getByRole("button", { name: "Keep items" }).click();
  await expect(page.getByText("Dopamine Bloom Case")).toBeVisible();

  await page.getByRole("button", { name: "Clear cart" }).click();
  await page.getByRole("button", { name: "Yes, clear" }).click();
  await expect(
    page.getByRole("heading", { name: "Nothing here yet." }),
  ).toBeVisible();
});

test("checkout fails safely when commerce is disabled", async ({ page }) => {
  await page.goto("/products/dopamine-bloom-iphone-case");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/cart");
  await page.getByRole("button", { name: "Checkout securely" }).click();

  await expect(page.locator(".checkout-error")).toContainText(
    "Checkout is not configured yet",
  );
});

test("health and not-found routes expose safe responses", async ({
  page,
  request,
}) => {
  const health = await request.get("/api/health");
  const payload = (await health.json()) as {
    status: string;
    checks: { commerce: { checkoutReady: boolean } };
  };

  expect(health.ok()).toBe(true);
  expect(payload.status).toBe("ok");
  expect(payload.checks.commerce.checkoutReady).toBe(false);
  expect(health.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(health.headers()["x-content-type-options"]).toBe("nosniff");
  expect(health.headers()["strict-transport-security"]).toBeUndefined();

  const readiness = await request.get("/api/ready");
  expect(readiness.ok()).toBe(true);

  const installIcon = await request.get("/icon-192");
  expect(installIcon.ok()).toBe(true);
  expect(installIcon.headers()["content-type"]).toBe("image/png");

  await page.goto("/this-page-does-not-exist");
  await expect(
    page.getByRole("heading", { name: "This page is not available." }),
  ).toBeVisible();
});
