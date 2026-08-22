# Design System — Phil Hie Personal Website

## Product Context
- **What this is:** A personal monograph. One name, one statement, one record. It reads like the cover and contents page of a magazine, not like a portfolio.
- **Who it's for:** Founders, investors, designers, strangers. It signals taste and restraint before it signals credentials.
- **Project type:** Marketing site. Server-rendered, typographic, near-zero JavaScript.

## Aesthetic Direction
- **Direction:** Quiet luxury. Editorial monochrome.
- **Decoration level:** None. Type, space, and one hairline rule do all the work.
- **Mood:** Precision. Restraint. What you leave out matters more than what you add.
- **Anti-patterns:** No cards. No gradients. No shadows. No icon rows. No hero image. No colour accents.

## Typography
One typeface carries the site. Weight and scale make the hierarchy, not colour.

- **Display and body:** Satoshi, self-hosted variable (`app/_fonts/Satoshi-Variable.woff2`, weights 300–900, `display: swap`). Token `--font-display` / `--font-sans`.
- **Metadata and code:** Geist Mono. Token `--font-mono`. Used only inside long-form writing and on the sound control.
- **Long-form prose:** Fraunces, on `/thoughts` only. Loaded in `app/thoughts/layout.tsx`.

Four scale steps, all fluid:

| Step | Token or value | Range |
|---|---|---|
| Monument (the name) | `--text-monument` | 56px → 192px |
| Role (ledger rows) | `clamp(1.375rem, 2.88vw + 0.8rem, 2.85rem)` | 22px → 45.6px |
| Body | `0.95rem` – `1.05rem` | 15px → 17px |
| Label (`.label-mono`) | `--text-label` | 12px phone, 11px from `md` |

Fluid type uses a **slope and intercept** curve, not a bare `vw`. Write `clamp(min, Avw + Brem, max)`.
A bare `vw` sits on its own floor across every phone width, so the type stops adapting. Both display
curves are fitted through their original desktop value, so desktop rendering does not move.

- `.optical-left` cancels Satoshi's cap side-bearing (`-0.085em`) so display type sits ink-flush with the gutter. Apply it to any monument-scale heading.
- `.label-mono` is the micro-label: uppercase, 500 weight, wide tracking, muted. It is a sans face despite the name.
- `.nums` turns on tabular figures. Use it on any label that contains a number.

## Color
Monochrome. `--signal` is an alias of ink and is no longer a red accent.

| Token | Light | Dark |
|---|---|---|
| `--paper` (background) | `#ffffff` | `#000000` |
| `--ink` (foreground) | `#1d1d1f` | `#f5f5f7` |
| `--mono-muted` | `#6e6e73` | `#86868b` |
| `--hairline` | `#e6e6e4` | `#2a2a2c` |

- Light is canonical. Dark is "after hours", reached only by the toggle.
- Theme is class-based (`next-themes`, `attribute="class"`, `enableSystem: false`). It does **not** follow the OS.
- Because the OS scheme is ignored, `<meta name="theme-color">` must not branch on `prefers-color-scheme`. `ThemeColorSync` in `components/theme-provider.tsx` writes it from the resolved theme.

## Spacing and Layout
- **Max content width:** `max-w-[88rem]` (1408px), centred.
- **Gutter:** `--gutter-x: clamp(1.5rem, 5vw, 5rem)`. Every page uses this token. Do not write a new gutter value.
- **Screen edges:** `--edge-top`, `--edge-bottom`, `--edge-x`. These fold in `env(safe-area-inset-*)`. Any element anchored to a screen edge must read from them.
- **Hero:** bottom-anchored (`mt-auto`) inside `min-h-[74svh]`, or `92svh` from `md`. Use `svh`, never `vh` — `vh` is wrong under the iOS URL bar.
- **Border radius:** none, except the shadcn switch.

## Responsive and Mobile
The system is fluid first. **Refine the `clamp()` curve; do not add a breakpoint.** Two breakpoints
exist and no more:

- `md` (48rem / 768px) — the ledger's column layout, the pointer-only hover reveal, and the fixed sound control.
- `@media (width < 48rem)` in `globals.css` — token overrides only (`--text-label`, label tracking). No layout rules live there.

Rules that hold at every width:

1. **Touch targets are at least 44×44.** Reach that with `min-h-11` plus padding, or with the `.tap-target` utility when padding would move the layout. Never by enlarging the font.
2. **No micro-label goes below 12px** on a phone. `--text-label` handles this.
3. **`env(safe-area-inset-*)` needs `viewportFit: "cover"`** in `app/layout.tsx`. Without it every inset resolves to `0px` and the tokens silently do nothing.
4. **Every hand-written `:hover` must be wrapped in `@media (hover: hover) and (pointer: fine)`.** Tailwind's `hover:` variant is already gated; plain CSS in `globals.css` and `reading.css` is not, and an ungated rule sticks after a tap.
5. **Nothing is `position: fixed` at the bottom of a phone screen.** `env(safe-area-inset-bottom)` clears the home indicator but cannot clear Safari's bottom toolbar. Dock the control in the footer below `md` instead, as `Colophon` does with the sound toggle.
6. **A reveal animates `grid-template-rows: 0fr → 1fr`, never a fixed `max-height`.** A magic pixel height clips as soon as the text wraps one line further.
7. **Below `md` the vertical rhythm is fixed `rem`, not `vh`.** A `vh` gap grows on a tall phone, which is backwards — a taller screen should hold more content, not more air. `vh` spacing stays on desktop, where the viewport is wide and short.
8. **Below `md` the hero is sized by its content.** No `min-h`, no `mt-auto`. Bottom-anchoring is a gallery-label placement that reads well on a wide desktop viewport; on a tall phone it drops the whole stack to the bottom of the box and leaves dead white above it.
9. **The name fills at least 70% of the measure on a phone.** A desktop-fitted curve gives about 60%, which reads as small type stranded in a wide column. `.text-monument` is therefore overridden inside the phone query — see the `@theme inline` note below.
10. **Reference widths:** 320, 375, 393, 430 portrait, and 734×343 landscape. `playwright.config.ts` runs every spec at all of them.

> **A transformed ancestor captures `position: fixed`.** The hero's `.press-in` entrance animates a transform, so any `fixed` descendant is positioned against that box, not the viewport. Keep floating controls out of animated wrappers. Nothing overlaps when this breaks, so a collision test will not catch it — assert the offset instead.

> **`@theme inline` compiles the value into the utility.** `text-monument` emits `font-size: clamp(...)`, not `var(--text-monument)`, so overriding that token in a media query does nothing. Override the *utility* (`.text-monument { … }`). Tokens consumed by hand-written CSS — `--text-label` inside `.label-mono` — do respond to a token override.

## Motion
- **Entrance:** `.press-in` — a CSS "focus pull". The name resolves from an 18px blur; the statement and follow row settle after it. Delay is set per element through `--press-delay`. Server HTML, so the LCP element is never hidden behind JavaScript.
- **Scroll:** `.rule-draw` and `.reveal-up`, both driven by `animation-timeline: view()` behind an `@supports` guard.
- **Links:** `.link-underline` draws a 1px rule in over 260ms on `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Route change:** native View Transitions morph the masthead across `/` ↔ `/thoughts` ↔ `/stealth`.
- **`prefers-reduced-motion`:** every animation above is inside a `no-preference` query. Reduced motion shows the final state immediately.

## Accessibility
- All content is real server-rendered HTML. Ledger receipts stay in the DOM when collapsed.
- Focus ring: `2px` ink at 55% with a `3px` offset, on `:focus-visible` only.
- Touch targets: 44×44 minimum. Enforced by `e2e/mobile.spec.ts`.
- Contrast: ink on paper is 15.9:1. Muted on paper is 4.8:1.
- The ledger rows are `<button aria-expanded>`. The `+` / `−` mark is `aria-hidden`; the state is on the button.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-05 | Quiet-luxury relaunch on shadcn/ui | The WebGL experience was a demo, not a monograph. Type and restraint age better. |
| 2026-07-05 | Satoshi as the single typeface | One voice. Weight and scale carry the hierarchy; a second face would dilute it. |
| 2026-07-05 | Monochrome, `--signal` aliased to ink | The red accent was the only thing on the page that dated it. |
| 2026-08-21 | Fluid curves use slope + intercept | A bare `vw` bottoms out on its floor across every phone, so the type froze. See `docs/decisions/0001-mobile-responsive-foundations.md`. |
| 2026-08-21 | `--gutter-x` / `--edge-*` token layer | Four hand-copied position strings had already drifted 9px out of alignment with the content gutter. |
| 2026-08-21 | Sound control docks in the colophon below `md` | No CSS can lift a bottom-fixed element clear of Safari's bottom toolbar. |
| 2026-08-22 | Phone hero is content-sized, with a fixed-rem rhythm | Measurements can all pass while the page still looks wrong. Bottom-anchoring plus `vh` gaps left the name small and stranded between two voids. |
| 2026-08-22 | The after-hours control docks into the masthead row below `md` | Floating, it sat in a band of its own above the dateline with an empty corner beside it. Docked, the row reads as one masthead: dateline left, control right, one rule under both. |
| 2026-08-22 | A section break is not a hero gap | Holding both to one ceiling squeezed the break to 62px, and the record read as a continuation of the hero. A break needs a floor (96px) as well as a ceiling (200px). |

### Superseded
The 2026-03-27 system ("The Encounter": a four-phase WebGL particle field, Geist Sans 800, pure black
only, a `(pointer: fine)` custom cursor, and a Web Audio synthesiser) was removed in v2.0.0.0. It is
recorded here so that older commits stay legible. None of it exists in the codebase.
