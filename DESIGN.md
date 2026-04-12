# Design System — Phil Hie Personal Website

## Product Context
- **What this is:** A personal website that creates a genuine "magic moment" for anyone who visits. A 4-phase choreographed WebGL experience called "The Encounter."
- **Who it's for:** Everyone. Founders, investors, designers, friends, strangers. Optimized for emotional impact, not credibility signaling.
- **Space/industry:** Personal/founder websites. Positioned against the category norm of developer portfolios and LinkedIn-style landing pages.
- **Project type:** Marketing site (single-page landing, brand-forward, experience-first)

## Aesthetic Direction
- **Direction:** Luxury Minimal
- **Decoration level:** Minimal. Particles are the experience, not decoration.
- **Mood:** Gravity. Mystery. Restraint. Like walking into a dark room where something important is about to happen. The absence of information creates presence. What you don't show matters more than what you do.
- **Anti-patterns:** No developer portfolio vibes. No card grids. No feature lists. No timeline. No resume. This is art, not a brochure.

## Typography
- **Display/Name:** Geist Sans — weight 800, `clamp(4.5rem, 10vw, 10rem)`, tracking -0.04em, line-height 0.9. Monumental. The name dominates the viewport.
- **Tagline:** Geist Sans — weight 400, `clamp(0.875rem, 1.2vw, 1rem)`, color neutral-400. Whispered, not shouted.
- **Links:** Geist Mono — weight 400, 0.75rem (12px), tracking 0.05em, uppercase. Discoverable, not prominent.
- **UI (sound toggle):** Geist Mono — weight 400, 0.625rem (10px). "listen" in neutral-600.
- **Loading:** Both fonts loaded via `next/font/google` (already in layout.tsx). Zero external requests.
- **Scale:** Name (72-160px) > Tagline (14-16px) > Links (12px) > Toggle (10px). Four levels only.

## Color
- **Approach:** Restrained (monochrome + adaptive temperature)
- **Background:** `#000000` (pure black)
- **Text primary:** `#ffffff` (pure white, name only)
- **Text muted:** `#a3a3a3` (neutral-400, tagline)
- **Text dim:** `#737373` (neutral-500, links default)
- **Text hover:** `#ffffff` (links on hover)
- **Text subtle:** `#525252` (neutral-600, sound toggle)
- **Particle base:** `#ffffff` (shifted by time-of-day)
- **Time-of-day warm:** `#fef3c7` (amber-100, dawn/dusk shift)
- **Time-of-day cool:** `#dbeafe` (blue-100, night shift)
- **Time-of-day neutral:** `#ffffff` (midday, no shift)
- **Bloom glow:** `#ffffff` at 0.3 threshold, 1.5 intensity (desktop), 0.8 (mobile)
- **Loading glow:** `rgba(255, 255, 255, 0.02)` radial gradient, 3s breathing
- **Dark mode:** Always dark. No light mode. The black void is the design.
- **Contrast:** White on black = 21:1 ratio (exceeds WCAG AAA)

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)
- **Overlay position:** Bottom-left corner (gallery-label style)
  - `--overlay-bottom: clamp(2rem, 5vh, 4rem)`
  - `--overlay-left: clamp(1.5rem, 4vw, 3rem)`
  - `--name-to-tagline: 0.75rem`
  - `--tagline-to-links: 1.5rem`
  - `--link-gap: 1.5rem`
- **Sound toggle:** Bottom-right, `--toggle-bottom: clamp(1.5rem, 3vh, 2.5rem)`, `--toggle-right: clamp(1.5rem, 4vw, 3rem)`

## Layout
- **Approach:** Full-bleed immersive (no grid, no columns)
- **Structure:** Full-screen WebGL canvas + fixed-position DOM overlay
- **Max content width:** None. Canvas fills viewport edge to edge.
- **Overlay width:** `max-width: 32rem` (512px) for text wrapping on ultra-wide screens
- **Border radius:** None. Zero borders in the entire design. The void has no edges.
- **Responsive:**
  - Desktop (>768px): Bottom-left overlay, generous margins, custom cursor active
  - Mobile (<768px): Bottom-left overlay, tighter margins, no custom cursor, links wrap with `gap: 0.75rem` (12px), 44px touch targets maintained

## Motion
- **Approach:** Expressive (the entrance IS the product)
- **Easing curves:**
  - Phase 0 to 1 (void to bloom): `ease-in-cubic` — slow start, accelerating. Gravitational pull.
  - Phase 1 to 2 (bloom peak): `ease-out-quad` — gentle deceleration. The held breath.
  - Phase 2 to 3 (reveal): `ease-out-expo` — fast dispersal, decelerating into stillness. Exhaling.
  - Particle drift (Phase 3): Simplex noise, no easing. Organic, continuous.
  - Cursor displacement: `ease-out` with 0.15s lag. Like dragging through water.
  - Text fade-in: `ease-out`, 0.5s delay after name reveal.
- **Duration:**
  - Phase 1 (void): 0 to 0.8s
  - Phase 2 (bloom): 0.8 to 2.5s
  - Phase 3 (reveal): 2.5 to 4.0s
  - Phase 4 (aftermath): 4.0s onward
  - Returning visitor: 1.5s total (compressed entrance)
- **Idle behavior:** Particles freeze after 10s of no interaction. Resume instantly on input.
- **prefers-reduced-motion:** Skip all animation. Show static aftermath with name + links visible immediately.

## Particles
- **Rendering:** THREE.Points with gl_PointSize (single draw call)
- **Count:** 2000 (desktop), 800 (mobile), auto-degrade to 400 if needed
- **Size range:** 1-4px (desktop), 1-3px (mobile)
- **Opacity range:** 0.05 to 0.4
- **Blending:** Additive (THREE.AdditiveBlending)
- **Shape:** Soft circle SDF (Gaussian alpha falloff)
- **Post-processing:** Bloom + Vignette + Film Noise (desktop). Bloom only (mobile).

## Sound (Opt-in)
- **Toggle:** "listen" in 10px Geist Mono, bottom-right. Disappears when sound is enabled.
- **Engine:** Web Audio API only. No audio files. All synthesized.
- **Aesthetic:** Deep, resonant, organic. Not electronic or musical. Felt more than heard.
- **Idle:** Fades to near-silence after 10s. Movement restores it.

## Accessibility
- **Screen readers:** All text content in DOM overlay (real HTML)
- **Keyboard:** Standard tab navigation through links. focus-visible ring on links.
- **Focus-visible ring:** `outline: 1px solid rgba(255, 255, 255, 0.5)`, `outline-offset: 2px`. Applies to links and sound toggle. Monochrome aesthetic, subtle but visible.
- **Touch targets:** 44px minimum via padding on links
- **Reduced motion:** Full bypass of all animation. Live-updates if OS setting changes.
- **WebGL fallback:** Static page with black background, name, tagline, links
- **Canvas role:** `role="presentation"` + `aria-hidden="true"` (decorative)

## Custom Cursor (Desktop Only)
- **Condition:** Only when `(pointer: fine)` matches
- **Appearance:** Small soft light circle, matches particle aesthetic
- **Link hover:** Custom cursor hidden, real cursor appears as pointer
- **Implementation:** CSS `cursor: none` + pointer-following div, `pointer-events: none`

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-27 | Initial design system | Created by /design-consultation from /office-hours + CEO + eng + design review decisions |
| 2026-03-27 | Monochrome + time-of-day | Pure B&W with adaptive temperature. Monochrome = serious. Temperature = alive. |
| 2026-03-27 | Geist Sans monumental | No new font needed. Scale + weight + tracking make Geist feel monumental. Zero extra bytes. |
| 2026-03-27 | "Just doing things." | Maximum mystery. Makes people Google you. |
| 2026-03-27 | Bottom-left overlay | Gallery-label positioning. The experience is art. The name is the label. |
| 2026-03-27 | "listen" toggle | Invitation, not button. Disappears when enabled. |
| 2026-03-27 | Points-based particles | Single draw call. Same visual as instanced meshes for soft circles. |
| 2026-03-27 | Inline shaders | No .vert/.frag files. Template literals in ParticleField.tsx. No webpack config needed. |
| 2026-03-27 | Freeze-on-idle | Not on-demand rendering. Particles freeze after 10s, resume on input. |
