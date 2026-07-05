import { test, expect } from "@playwright/test";

test.describe("Monograph homepage", () => {
  test("renders the masthead: name, the 'Building' link, adaptive dateline", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Phil Hie", {
      timeout: 6000,
    });
    const building = page.getByRole("link", { name: /^building$/i });
    await expect(building).toBeVisible({ timeout: 6000 });
    await expect(building).toHaveAttribute("href", "/stealth");
    await expect(page.getByText(/San Francisco/i)).toBeVisible();
  });

  test("the Index carries the record with receipts present in the DOM", async ({
    page,
  }) => {
    await page.goto("/");
    // Receipts stay in the DOM (agent-readable) even before hover.
    await expect(page.getByText(/Sequoia-backed/)).toBeAttached();
    await expect(page.getByText(/115,000/)).toBeAttached();
  });

  test("follow links point out and open in a new tab", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator('a[href*="github.com/philhie"]'),
    ).toHaveAttribute("target", "_blank");
    await expect(
      page.locator('a[href*="linkedin.com/in/philhie"]'),
    ).toHaveAttribute("target", "_blank");
    await expect(page.locator('a[href*="x.com/philhie"]')).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  test("sound toggle is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("sound on")).toBeVisible({ timeout: 6000 });
  });

  test("has the monograph title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Phil Hie/);
  });

  test("deep pages resolve: /thoughts and /stealth", async ({ page }) => {
    await page.goto("/thoughts");
    await expect(page.locator("h1")).toContainText("Thoughts");
    await page.goto("/stealth");
    await expect(page.locator("h1")).toContainText("Sealed");
  });
});
