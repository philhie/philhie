# Changelog

All notable changes to this project will be documented in this file.

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
