import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * The mobile contract. Every assertion here maps to a defect the site actually
 * shipped with: no horizontal overflow, no micro-label below 12px, no touch
 * target below 44px, no clipped receipt, no ledger title past two lines, and
 * no floating control sitting on top of the type.
 *
 * These run on every project in playwright.config.ts, desktop included — the
 * rules are not phone-only, the phone is just where they were being broken.
 */

const PAGES = ["/", "/stealth", "/thoughts"];
const TOUCH_MIN = 44;

/** The hit box a finger actually gets: the element, or its `.tap-target` pseudo. */
async function hitBox(el: Locator) {
  return el.evaluate((node) => {
    const r = node.getBoundingClientRect();
    let { width, height } = r;
    if ((node as HTMLElement).classList.contains("tap-target")) {
      const after = getComputedStyle(node, "::after");
      width = Math.max(width, parseFloat(after.minWidth) || 0);
      height = Math.max(height, parseFloat(after.minHeight) || 0);
    }
    return { width, height };
  });
}

async function isMobileWidth(page: Page) {
  return page.evaluate(() => window.innerWidth < 768);
}

for (const path of PAGES) {
  test.describe(path, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    });

    test("does not scroll horizontally", async ({ page }) => {
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test("every micro-label is at least 12px", async ({ page }) => {
      const sizes = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            ".label-mono, .thoughts-meta, .article-meta, .thoughts-back, .thoughts-sub",
          ),
        ].map((el) => ({
          text: (el.textContent ?? "").trim().slice(0, 24),
          size: parseFloat(getComputedStyle(el).fontSize),
        })),
      );
      expect(sizes.length).toBeGreaterThan(0);
      for (const { text, size } of sizes) {
        expect(size, `"${text}" is ${size}px`).toBeGreaterThanOrEqual(12);
      }
    });

    test("every interactive element is at least 44x44", async ({ page }) => {
      // Inline links inside running prose are exempt — they cannot be 44px
      // tall without destroying the leading of the paragraph they sit in.
      const targets = page.locator(
        'a:not(.prose-thoughts a), button, [role="button"], label:has(button)',
      );
      const n = await targets.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        const el = targets.nth(i);
        if (!(await el.isVisible())) continue;
        const { width, height } = await hitBox(el);
        const label = (await el.textContent())?.trim().slice(0, 24) || "(icon)";
        expect(height, `"${label}" is ${height}px tall`).toBeGreaterThanOrEqual(
          TOUCH_MIN,
        );
        expect(width, `"${label}" is ${width}px wide`).toBeGreaterThanOrEqual(
          TOUCH_MIN,
        );
      }
    });
  });
}

test.describe("home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("the name sets on one line", async ({ page }) => {
    const lines = await page.evaluate(() => {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector("h1")!);
      return range.getClientRects().length;
    });
    expect(lines).toBe(1);
  });

  test("the dateline never splits a place name", async ({ page }) => {
    const wraps = await page.evaluate(() =>
      [...document.querySelectorAll("header p > span")].map(
        (el) => getComputedStyle(el).whiteSpace,
      ),
    );
    expect(wraps.length).toBeGreaterThan(0);
    for (const w of wraps) expect(w).toBe("nowrap");
  });

  test("no ledger title runs past two lines", async ({ page }) => {
    const lines = await page.evaluate(() =>
      [...document.querySelectorAll("ol button")].map((b) => {
        const title = b.querySelector("span > span")!;
        const lh = parseFloat(getComputedStyle(title).lineHeight);
        return {
          text: (title.textContent ?? "").trim().slice(0, 32),
          lines: Math.round(title.getBoundingClientRect().height / lh),
        };
      }),
    );
    expect(lines.length).toBe(5);
    for (const { text, lines: n } of lines) {
      expect(n, `"${text}" wraps to ${n} lines`).toBeLessThanOrEqual(2);
    }
  });

  test("the year never wraps", async ({ page }) => {
    const years = await page.evaluate(() =>
      [...document.querySelectorAll("ol button")].map((b) => {
        const el = [...b.children].find((c) =>
          /\d{4}/.test(c.textContent ?? ""),
        ) as HTMLElement | undefined;
        if (!el) return null;
        const lh = parseFloat(getComputedStyle(el).lineHeight);
        return {
          nowrap: getComputedStyle(el).whiteSpace === "nowrap",
          lines: Math.round(el.getBoundingClientRect().height / lh),
        };
      }),
    );
    for (const y of years) {
      expect(y).not.toBeNull();
      expect(y!.nowrap).toBe(true);
      expect(y!.lines).toBe(1);
    }
  });

  test("an opened receipt is never clipped", async ({ page }) => {
    const rows = page.locator("ol button");
    const n = await rows.count();
    for (let i = 0; i < n; i++) {
      const row = rows.nth(i);
      await row.scrollIntoViewIfNeeded();
      await row.click();
      await expect(row).toHaveAttribute("aria-expanded", "true");
      await page.waitForTimeout(420);
      const clipped = await row.evaluate((b) => {
        const rec = b.querySelector("span.grid > span") as HTMLElement;
        return {
          overflow: rec.scrollHeight - rec.clientHeight,
          height: rec.clientHeight,
          text: rec.textContent,
        };
      });
      expect(
        clipped.overflow,
        `"${clipped.text}" is cut by ${clipped.overflow}px`,
      ).toBeLessThanOrEqual(1);
      expect(clipped.height).toBeGreaterThan(0);
      await row.click();
    }
  });

  test("the theme toggle never covers the dateline", async ({ page }) => {
    const clash = await page.evaluate(() => {
      const a = document.querySelector("label.fixed")!.getBoundingClientRect();
      const b = document.querySelector("header p")!.getBoundingClientRect();
      return {
        overlaps: !(
          a.right < b.left ||
          a.left > b.right ||
          a.bottom < b.top ||
          a.top > b.bottom
        ),
        gap: Math.round(b.top - a.bottom),
      };
    });
    expect(clash.overlaps, `only ${clash.gap}px of clearance`).toBe(false);
  });

  test("the sound control docks into the footer on a phone", async ({
    page,
  }) => {
    const sound = page.getByRole("button", {
      name: /sound on|listen|audio off/i,
    });
    const position = await sound.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe((await isMobileWidth(page)) ? "static" : "fixed");
  });
});
