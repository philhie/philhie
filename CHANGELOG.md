# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0.0] - 2026-08-21

Mobile. The relaunch was tuned on a desktop viewport and never adapted for a phone: the repository
contained no width-based media query, every fluid size sat frozen on its own floor, half the first
screen was empty, the ledger's title column was 189px wide, and the smallest touch target measured
9x23 pixels. This release fixes the token layer rather than the components, so the site stays fluid
instead of becoming a set of breakpoints.

### Added
- An edge token layer: `--gutter-x`, `--edge-top`, `--edge-bottom`, `--edge-x`. The `--edge-*` tokens
  fold in `env(safe-area-inset-*)`, so nothing sits under the notch or the home indicator. Four
  hand-copied position strings that had drifted 9px out of alignment with the content gutter now
  read from one value.
- `viewportFit: "cover"`, without which every safe-area inset resolves to `0px`.
- A `.tap-target` utility: an invisible 44px hit box for a control that is visually small. Every
  interactive element on every page now meets 44x44.
- A disclosure mark on each ledger row. The receipt reveal is pointer-only, so a touch device
  previously had no signal that a row opens.
- `docs/decisions/0001-mobile-responsive-foundations.md`, and a "Responsive and Mobile" section in
  DESIGN.md.
- `e2e/mobile.spec.ts` and seven device projects in `playwright.config.ts` (320, 375, 393, 412, 430,
  landscape, desktop). It fails on horizontal overflow, a sub-12px label, a sub-44px target, a
  clipped receipt, a title past two lines, or an overlay covering the dateline.
- `typecheck`, `test`, `test:watch` and `test:e2e` npm scripts. Vitest and Playwright were installed
  but not runnable.

### Changed
- Fluid type now uses a slope and intercept curve instead of a bare `vw`. `--text-monument` and the
  ledger role size are both fitted through their original desktop values, so desktop rendering is
  unchanged; on a phone the name goes from a frozen 52px to 59-72px, and the role size adapts at all
  for the first time.
- Micro-labels go to 12px at 0.14em tracking below `md`. They were a fixed 11px at 0.18em, and two
  were 10px.
- The ledger drops the year out of its column and onto a meta line below `md`, returning that width
  to the title: 189px to 287px at 375px. No title wraps past two lines at any reference width.
- The receipt reveal animates `grid-template-rows: 0fr → 1fr` instead of `max-h-10`, which was
  clipping the longest receipt by a pixel and would have clipped further on any narrower screen.
- The hero is `74svh` below `md` and `92svh` from `md`, and its top padding clears the theme toggle
  so the dateline gets the full measure and sets on one line.
- The dateline drops its leading "Phil Hie" below `md` — the `<h1>` saying exactly that sits
  directly beneath it.
- The sound control docks into the colophon below `md`. Fixed, it covered the ledger's year column
  and the copyright line, and no CSS can lift a bottom-fixed element clear of Safari's bottom
  toolbar.
- The `/thoughts` measure was double-inset by `90vw` plus its own padding. It now shares
  `--gutter-x` like every other page.
- `ThemeToggle` positions itself instead of taking a position from each of its four call sites.

### Fixed
- `<meta name="theme-color">` branched on `prefers-color-scheme` while the app forces a class-based
  light theme, so a visitor with a dark OS got a dark browser bar above a white page.
  `ThemeColorSync` now writes it from the resolved theme.
- Four hand-written `:hover` rules were not gated by `@media (hover: hover)`, so the underline and
  the colour change stuck after a tap. Tailwind gates its own `hover:` variant; plain CSS is not.
- Long code, wide tables and oversized images in `/thoughts` prose could exceed the measure.
- `overflow-x: clip` on `html, body` as a safety net.

### Removed
- `app/_home/Dispatches.tsx`. Imported nowhere, and carrying the same defects.

## [2.0.0.0] - 2026-07-05

The relaunch. A complete redesign and design-system takeover: the WebGL "weather" hero is gone, replaced by a quiet-luxury founder site built on shadcn/ui. Monochrome, precise, typographic. The record (Goldman Sachs, Grex, Adepto, Avelios, and a stealth company) reads as a clean editorial page.

### Added
- A full shadcn/ui design system (Base UI primitives, Tailwind v4 CSS-first tokens) with the palette taken over entirely: monochrome, soft-black ink (#1d1d1f), Apple-grade neutral grays, and a true OLED-black "after-hours" dark theme (next-themes).
- Satoshi as the one typeface: a self-hosted variable neo-grotesque at light-to-medium weights. Optical left-alignment cancels the display glyph's side-bearing so the type sits ink-flush with the gutter.
- The masthead: a San Francisco dateline that ticks the city's local time, the monumental name, "Building" (a link to the sealed page), and the follow row (X, LinkedIn, GitHub) at the bottom of the hero.
- Background — the five-role record as a contents page. Receipts reveal on hover/tap and stay in the DOM for accessibility and machine-readability; rows fade up as they enter the viewport.
- A CSS "focus pull" entrance: the name resolves from a soft blur, then the statement and follow row settle. Server-rendered (LCP-safe), reduced-motion aware.
- Native View Transitions morphing the "Phil Hie" masthead across / ↔ /thoughts ↔ /stealth.
- A sealed /stealth page, reached from "Building".
- A restyled soundtrack toggle (muted YouTube that unmutes on the first interaction).
- A machine-experience layer: schema.org Person JSON-LD (alumniOf Goldman Sachs, the full role graph, social profiles) and strict semantic HTML.

### Changed
- The /thoughts reading room moved from the dark serif room to the light editorial system (Satoshi titles, Fraunces prose).
- The Open Graph image, favicon, and Apple touch icon rebuilt to the monochrome identity.
- The it.philhie.com subdomain restyled to match.

### Removed
- The entire WebGL layer: the OGL single-shader engine, gradient poster, baked noise atlas, capability/pointer/empathy hooks, the IP-geo reader, and the dependencies (ogl, three, @react-three/*, postprocessing).
- Stale test files that referenced deleted modules.

## [1.0.0.0] - 2026-06-15

The relaunch. The site is rebuilt from scratch around one idea: a name made of weather.

### Added
- A new homepage. A living, GPU-light volumetric sky runs a dawn-to-night loop behind the name, drawn as a single fullscreen shader (OGL/GLSL) rather than a particle field. It adapts to the device: capable machines get the full atmosphere, weaker ones a still poster, and it falls back to the poster if the browser drops the WebGL context instead of freezing.
- A Provenance Ledger of five credentials (Founder, Founders Associate at Avelios, Co-Founder of Adepto, Investment Banker at Goldman Sachs, Co-Founder of Grex), each revealing its proof on hover or tap.
- "Your sky": the scene seeds the local time of day from the visitor's city-level location (Vercel headers), refined by live cloud cover and wind from Open-Meteo.
- A soundtrack via a muted YouTube embed that unmutes on the first interaction, with a beat clock driving subtle motion.
- /thoughts: a dark, serif reading room for essays (Markdown, statically generated), linked from the homepage. Ships with a "Coming Soon" placeholder.

### Changed
- Moved off the Three.js particle hero to the lighter single-shader engine. The render loop is frame-rate-capped (30fps) and the cloud noise is baked into a texture, so the scene stays smooth on weak hardware.

### Removed
- The old Three.js particle homepage and its components, the four prototype worlds, and an unused Web-Audio synth.

## [0.1.0.5] - 2026-05-31

### Fixed
- The WebGL scene now actually rests when idle. The canvas was rendering the full postprocessing chain at 60fps forever (the frame loop defaulted to "always", so the documented freeze-on-idle never took effect). It now renders on demand — through the entrance and while you interact — and stops after 10s of stillness. This removes the runaway main-thread/GPU work behind the sluggish interactivity (Interaction to Next Paint ~832ms) and battery drain seen in Speed Insights.
- The name "Phil Hie" now appears on schedule. It is the largest thing on screen, and on real visits it was taking up to ~25s to paint because heavy scene startup was starving the reveal timer (Largest Contentful Paint ~25s). Trimming the per-frame work frees the main thread so the name reveals with the entrance (~3s) as intended.

### Changed
- Lighter, smoother render path: device-pixel-ratio capped at 1.5, bloom now uses a half-float buffer, and particle density set to the design spec (2000 desktop / 800 mobile).
- First-visit name reveal tightened to 3.0s (0.5s after the reveal phase begins), matching the design system.
- Bloom intensity and threshold set to the design-system values (1.5 / 0.8 intensity, 0.3 threshold).

### Removed
- Chromatic aberration postprocessing pass — it was not part of the design system, and dropping it further lightens each frame.

## [0.1.0.4] - 2026-04-19

### Fixed
- Profile README widgets (streak, activity graph) forced to dark background (`#0d1117`) so the white numbers, labels, and lines are actually visible regardless of the viewer's GitHub light/dark theme. Previously everything was transparent + white, which rendered as invisible white-on-white in light mode.
- Snake contribution graph wrapped in a `<picture>` element so it swaps between the monochrome dark variant and GitHub's classic green light variant depending on the viewer's theme.
- Streak "Total Contributions / Longest Streak" side labels nudged to `#a3a3a3` (from `#737373`) so they sit at the right contrast level on the new dark background.

## [0.1.0.3] - 2026-04-19

### Changed
- Replaced Next.js boilerplate README with a GitHub profile composition. Since this repo doubles as the `philhie/philhie` profile repo, the README now renders on Phil's public profile: hero banner → streak widget → snake contribution graph → activity graph → three minimal links. Konami + career-year Easter eggs embedded as HTML comments.

### Added
- `.github/workflows/snake.yml` — daily cron (every 12h) using `Platane/snk/svg-only@v3` to generate a monochrome snake contribution graph, committed to an `output` branch as `github-snake.svg` and `github-snake-dark.svg`.

## [0.1.0.2] - 2026-04-19

### Added
- Public animated SVG banner at `/github-banner.svg` — dark-void particle field with monumental "Phil Hie" that fades in over ~55 drifting white particles. Pure SMIL animation, 10KB, no JavaScript. Intended as a GitHub profile README hero, usable anywhere the site's visual language needs to extend beyond the canvas.

## [0.1.0.1] - 2026-04-12

### Changed
- Tagline updated from "Building." to "Just doing things." across site, metadata, and tests
- Removed "building" from SEO keywords

## [0.1.0.0] - 2026-04-08

### Changed
- Bloom now renders at full resolution on desktop (was half-res by default), producing crisper particle glow
- Bloom luminance smoothing reduced from 0.9 to 0.3, matching the WebGPU-era tuning for selective glow instead of uniform haze
- Bloom intensity fine-tuned to 1.6/0.9 (desktop/mobile) for the higher-resolution pipeline
- EffectComposer upgraded to 32-bit float framebuffer for reduced banding in bloom calculations
- Shader precision explicitly set to highp in both vertex and fragment shaders for consistent quality across devices

### Fixed
- SoundToggle test updated to match bidirectional toggle behavior (listen/listening)
- Vitest config excludes e2e directory to prevent Playwright test loading conflicts
