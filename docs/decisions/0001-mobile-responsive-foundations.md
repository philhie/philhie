# 0001 — Mobile responsive foundations

- **Status:** Accepted
- **Date:** 2026-08-21
- **Applies to:** every page and every future visual change

## Context

The site shipped in v2.0.0.0 with no mobile adaptation. Measurement at 320, 375, 393 and 430px
found these defects:

1. The repository contained no width-based media query. It contained two `md:` utilities in total.
2. Every fluid size used a bare `vw` inside `clamp()`. Each curve sat on its own floor across the
   full phone range, so the type never adapted. The name was 52px from 320px to 385px.
3. The hero filled 92svh and anchored its content to the bottom. More than half of the first screen
   was empty.
4. The ledger's title column was 189px wide at 375px. "Co-Founder, Adepto" broke at the hyphen.
   "Investment Banker, Goldman Sachs" wrapped to three lines.
5. The receipt reveal used `max-h-10` (40px). The longest receipt needed 41px. `overflow: hidden`
   cut it with no warning.
6. Touch targets were far below the 44px minimum. The "X" link measured 9×23px. The sound control
   measured 62×15px.
7. Micro-labels were a fixed 11px at 0.18em tracking. Two were 10px.
8. No file used `env(safe-area-inset-*)`. The two floating controls sat 20px from the screen edge,
   inside the iOS home indicator.
9. `.link-underline:hover` was hand-written CSS. Tailwind gates its own `hover:` variant; plain CSS
   is not gated, so the underline stayed drawn after a tap.
10. `playwright.config.ts` declared no device project. All tests ran at 1280×720.

## Decision

**Fix the token layer, not the components.** Five changes carry the work:

1. **Fluid curves use slope and intercept.** Write `clamp(min, Avw + Brem, max)`. Fit the curve
   through the original desktop value so desktop rendering does not move. `--text-monument` becomes
   `clamp(3.5rem, 11.85vw + 1.32rem, 12rem)`, which gives 172.8px at 1280px — the same as before —
   and 59px at 320px instead of 52px.
2. **One token layer owns every screen edge.** `--gutter-x`, `--edge-top`, `--edge-bottom` and
   `--edge-x` live in `:root`. `--edge-*` fold in `env(safe-area-inset-*)`. `app/layout.tsx` sets
   `viewportFit: "cover"`, without which every inset resolves to `0px`.
3. **One phone media query, and it holds tokens only.** `@media (width < 48rem)` overrides
   `--text-label` and the label tracking. Layout adapts through `md:` utilities at the component.
4. **A reveal animates `grid-template-rows: 0fr → 1fr`.** No fixed `max-height` anywhere.
5. **Nothing is fixed to the bottom of a phone screen.** The sound control docks into the colophon
   below `md` and stays fixed from `md` up.

## Consequences

- Two breakpoints now exist: `md` for layout, and the phone query for tokens. Add no others.
- Any new element anchored to a screen edge must read from an `--edge-*` token.
- Any new hand-written `:hover` must be wrapped in `@media (hover: hover) and (pointer: fine)`.
- `e2e/mobile.spec.ts` runs at seven viewports and fails the build on a regression in overflow,
  label size, touch target, receipt clipping, title wrap, or overlay collision.
- The ledger title curve is larger between 768px and 1140px than it was. Above 1140px it is identical.

## Alternatives rejected

- **A media query per component.** It would read as a generic responsive template and would fight
  the `clamp()` system the design is built on. The curve is the design; a breakpoint discards it.
- **Show every receipt below `md` instead of adding a disclosure mark.** The rows are
  `<button aria-expanded>`. Always-open content would make that attribute a lie to a screen reader.
- **Pad the `<body>` with the safe-area insets.** Cheaper, but it does not reach `position: fixed`
  children and it breaks the full-bleed rule above the colophon.
- **Keep the sound control fixed and give it a scrim.** A scrim hides the collision with the ledger
  but not the collision with Safari's bottom toolbar, which no CSS can clear.
