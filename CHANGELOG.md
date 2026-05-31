# Changelog

All notable changes to this project will be documented in this file.

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
