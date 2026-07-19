import { test, expect } from "@playwright/test";

// Golden-path e2e test: register -> browse -> add to cart -> checkout ->
// redirected to Paystack. Stops short of completing a real card payment
// on Paystack's own hosted UI (third-party, not ours to automate
// reliably) — that final step is the manual verification described in
// the Phase 1 handoff checklist, using Paystack test-mode card details.
//
// Requires a seeded product (via `npm run prisma:migrate seed` / the
// admin UI) and real Paystack test-mode keys in .env to reach the final
// assertion — see docs/TRD.md 8.11 on why this exists before Phase 2.
test("customer can register, add a product to cart, and reach Paystack checkout", async ({ page }) => {
  const uniqueEmail = `e2e-${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Full name").fill("E2E Test Customer");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Phone number").fill("08012345678");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/account/, { timeout: 15000 });

  await page.goto("/products");
  const firstProductCard = page.locator("a[href^='/products/']").first();
  await firstProductCard.click();

  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page.getByRole("button", { name: /added to cart/i })).toBeVisible();

  await page.goto("/checkout");
  await page.getByPlaceholder("Recipient name").fill("E2E Test Customer");
  await page.getByPlaceholder("Street address").fill("1 Test Street");
  await page.getByPlaceholder("City").fill("Lagos");
  await page.getByPlaceholder("State").fill("Lagos");
  await page.getByPlaceholder("Contact phone number for this address").fill("08012345678");

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes("/api/checkout")),
    page.getByRole("button", { name: /pay now/i }).click(),
  ]);

  expect(response.ok()).toBeTruthy();
  await expect(page).toHaveURL(/paystack\.com/, { timeout: 15000 });
});
