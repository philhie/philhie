import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows overlay content", async ({ page }) => {
    await page.goto("/");

    // Wait for overlay to become visible (up to 5s for first visit)
    await expect(page.locator("h1")).toContainText("Phil Hie", { timeout: 6000 });
    await expect(page.locator("text=Building.")).toBeVisible({ timeout: 6000 });

    // Links are present
    await expect(page.locator('a[href*="github.com/philhie"]')).toBeVisible();
    await expect(page.locator('a[href*="linkedin.com/in/philhie"]')).toBeVisible();
  });

  test("sound toggle is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=listen")).toBeVisible({ timeout: 6000 });
  });

  test("links open in new tab", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Phil Hie", { timeout: 6000 });

    const github = page.locator('a[href*="github.com/philhie"]');
    await expect(github).toHaveAttribute("target", "_blank");
  });

  test("page has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Phil Hie/);
  });
});
