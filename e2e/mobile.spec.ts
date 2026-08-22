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

/**
 * The hit box a finger actually gets. Three things can widen it beyond the
 * element's own border box: a `.tap-target` pseudo-element, a `.tap-target`
 * ancestor, and a wrapping `<label>` (a click anywhere in the label forwards
 * to the control inside it).
 */
async function hitBox(el: Locator) {
  return el.evaluate((node) => {
    const box = (n: Element) => {
      const r = n.getBoundingClientRect();
      let { width, height } = r;
      if ((n as HTMLElement).classList.contains("tap-target")) {
        const after = getComputedStyle(n, "::after");
        width = Math.max(width, parseFloat(after.minWidth) || 0);
        height = Math.max(height, parseFloat(after.minHeight) || 0);
      }
      return { width, height };
    };
    const own = box(node);
    const label = node.closest("label");
    if (!label || label === node) return own;
    const outer = box(label);
    return {
      width: Math.max(own.width, outer.width),
      height: Math.max(own.height, outer.height),
    };
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

    test("every micro-label is at least 12px on a phone", async ({ page }) => {
      test.skip(
        !(await isMobileWidth(page)),
        "the 12px floor is a phone rule; desktop keeps 11px by design",
      );
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
        'a:not(.prose-thoughts a), button, [role="button"], [role="switch"]',
      );
      const n = await targets.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        const el = targets.nth(i);
        if (!(await el.isVisible())) continue;
        const { width, height } = await hitBox(el);
        const label = await el.evaluate(
          (n) =>
            (n.textContent ?? "").trim().slice(0, 24) ||
            n.getAttribute("aria-label") ||
            `<${n.tagName.toLowerCase()} class="${String(n.className).slice(0, 40)}">`,
        );
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

  /**
   * Composition, not just defects.
   *
   * The first mobile pass fixed every measurable defect — nothing overflowed,
   * nothing was clipped, every target was 44px — and the page still looked
   * wrong, because the name was small against a wide measure and the stack was
   * bottom-anchored behind a large void. These two assertions are what
   * "looks right" reduces to, and they are the ones a screenshot review caught
   * that the defect tests did not.
   */
  test("the name fills the measure on a phone", async ({ page }) => {
    test.skip(!(await isMobileWidth(page)), "a phone-composition rule");
    const fill = await page.evaluate(() => {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector("h1")!);
      const text = Math.max(
        ...[...range.getClientRects()].map((r) => r.width),
      );
      const main = document.querySelector("main")!;
      const measure =
        main.getBoundingClientRect().width -
        parseFloat(getComputedStyle(main).paddingLeft) * 2;
      return Math.round((text / measure) * 100);
    });
    expect(fill, `the name fills only ${fill}% of the measure`).toBeGreaterThan(
      68,
    );
  });

  test("the hero has no dead vertical gap on a phone", async ({ page }) => {
    test.skip(!(await isMobileWidth(page)), "a phone-composition rule");
    const gap = await page.evaluate(() => {
      const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      return Math.round(
        box("h1").top - box('header [data-slot="separator"]').bottom,
      );
    });
    expect(
      gap,
      `${gap}px of empty white between the rule and the name`,
    ).toBeLessThanOrEqual(80);
  });

  /**
   * The gap between the follow row and "Background" is a SECTION BREAK, not a
   * hero gap, and the two want opposite things. An earlier version of this file
   * held both to one ceiling, so the break was squeezed to 62px and the record
   * read as a continuation of the hero rather than a new section. A break needs
   * a floor as well as a ceiling: wide enough to separate, tight enough to
   * leave the heading near the fold as the scroll cue.
   */
  test("the hero owns the whole screen and the record starts below the fold", async ({
    page,
  }) => {
    test.skip(!(await isMobileWidth(page)), "a phone-composition rule");
    const { heroHeight, headingTop, followBottom, viewport } =
      await page.evaluate(() => {
        const box = (s: string) =>
          document.querySelector(s)!.getBoundingClientRect();
        return {
          heroHeight: Math.round(box("header").height),
          headingTop: Math.round(box("#index-heading").top),
          followBottom: Math.round(box("nav").bottom),
          viewport: window.innerHeight,
        };
      });
    // The hero is the opening screen, not a block that happens to sit on it.
    expect(
      heroHeight,
      `the hero is ${heroHeight}px on a ${viewport}px screen`,
    ).toBeGreaterThanOrEqual(viewport - 1);
    // Nothing from the record may appear on the opening screen.
    expect(
      headingTop,
      `"Background" is visible at ${headingTop}px on a ${viewport}px screen`,
    ).toBeGreaterThanOrEqual(viewport);
    // The follow row anchors to the bottom edge, so the screen reads as a
    // composed cover rather than a clump of type with dead space beneath it.
    expect(
      viewport - followBottom,
      `the follow row ends ${viewport - followBottom}px above the fold — it should sit on it`,
    ).toBeLessThanOrEqual(72);
  });

  /**
   * Below `md` the control is docked in the masthead row, so it shares the
   * dateline's baseline by construction and cannot overlap. From `md` up it
   * floats over the page, which is where a collision is possible — that is the
   * case this guards.
   */
  test("the theme toggle never covers the dateline", async ({ page }) => {
    const clash = await page.evaluate(() => {
      const toggle = document.querySelector("label");
      if (!toggle || getComputedStyle(toggle).position !== "fixed") {
        return { overlaps: false, gap: Infinity, docked: true };
      }
      const a = toggle.getBoundingClientRect();
      // The <p> is a full-width block. What can actually be covered is the
      // text inside it, so measure the rendered line boxes.
      const range = document.createRange();
      range.selectNodeContents(document.querySelector("header p")!);
      const lines = [...range.getClientRects()];
      const b = {
        left: Math.min(...lines.map((r) => r.left)),
        right: Math.max(...lines.map((r) => r.right)),
        top: Math.min(...lines.map((r) => r.top)),
        bottom: Math.max(...lines.map((r) => r.bottom)),
      };
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

  /**
   * A `position: fixed` element is positioned against the viewport only if no
   * ancestor has a transform, filter, or containment — any of those become its
   * containing block instead. The hero's `.press-in` entrance animates a
   * transform, so wrapping the control in it silently moved it from 64px off
   * the viewport edge to 64px off that box, i.e. 128px, on desktop. Nothing
   * overlapped, so the collision test stayed green.
   */
  test("the floating control is positioned against the viewport, not an ancestor", async ({
    page,
  }) => {
    test.skip(await isMobileWidth(page), "the control is docked below md");
    const { offset, gutter } = await page.evaluate(() => {
      const toggle = document.querySelector("label")!;
      const main = document.querySelector("main")!;
      return {
        offset: Math.round(
          window.innerWidth - toggle.getBoundingClientRect().right,
        ),
        gutter: Math.round(parseFloat(getComputedStyle(main).paddingLeft)),
      };
    });
    expect(
      offset,
      `the control is ${offset}px from the edge but the gutter is ${gutter}px — a transformed ancestor is capturing it`,
    ).toBe(gutter);
  });

  test("the after-hours control sits on the dateline's baseline on a phone", async ({
    page,
  }) => {
    test.skip(!(await isMobileWidth(page)), "a phone-composition rule");
    const row = await page.evaluate(() => {
      const centre = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      };
      const toggle = document.querySelector("label")!;
      return {
        position: getComputedStyle(toggle).position,
        drift: Math.abs(centre(toggle) - centre(document.querySelector("header p")!)),
      };
    });
    // Docked, not floating in a band of its own above the row.
    expect(row.position).toBe("static");
    expect(
      row.drift,
      `the control is ${Math.round(row.drift)}px off the dateline's centre`,
    ).toBeLessThanOrEqual(3);
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
