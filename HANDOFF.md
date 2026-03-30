# Handoff: Eng + Design Review Implementation

## Current State
- **Branch:** `claude/plan-eng-review-FABP8`
- **PR:** philhie/personal-website#5 (open, targeting `main`)
- **Status:** All code changes implemented, committed, pushed. PR created.

## What Was Done

### gstack installed
- Installed to `~/.claude/skills/gstack` (global, not in repo)
- All skills work except `/browse` and `/qa` (Chromium download failed in cloud env)

### Reviews Completed
1. **`/plan-eng-review`** — found 13 issues (architecture, code quality, bugs, performance)
2. **Outside voice** (Claude subagent) — found 5 additional issues, 5 tension points resolved
3. **`/plan-design-review`** — score improved 7/10 → 9/10, 2 design decisions added

### All 13 Issues Implemented

| # | Issue | File(s) Changed |
|---|-------|----------------|
| 1 | Extract shared Overlay component (DRY) | `Overlay.tsx` (new), `page.tsx` |
| 2 | Fix stale cursor in SoundEngine | `SoundEngine.tsx`, `page.tsx` |
| 3 | Add canvas a11y attributes | `Scene.tsx` |
| 4 | Fix responsive detection (resize listener) | `Scene.tsx` |
| 5 | Fix pad2 oscillator cleanup | `SoundEngine.tsx` |
| 6 | Extract shared PRNG | `ParticleField.tsx` |
| 7 | Add focus-visible styles | `Overlay.tsx`, `SoundToggle.tsx` |
| 8 | Fix visit counter race condition | `page.tsx`, `ParticleField.tsx` |
| 9 | Fix custom cursor flash at (0,0) | `CustomCursor.tsx` |
| 10 | Add reduced-motion change listener | `page.tsx` |
| 11 | Memoize Vector2 in Scene | `Scene.tsx` |
| 12 | Replace setInterval with rAF | `SoundEngine.tsx` (merged into #5) |
| 13 | Full test suite | `vitest.config.ts`, `playwright.config.ts`, `__tests__/*`, `e2e/*` |

### Design System Updates
- `DESIGN.md` — added focus-visible ring spec + mobile link layout spec

### Test Infrastructure
- **Vitest** + `@testing-library/react`: 29 unit tests, all passing
- **Playwright**: E2E config + smoke test spec (needs Chromium to run)
- Test files: `__tests__/particle-field.test.ts`, `middleware.test.ts`, `overlay.test.tsx`, `sound-toggle.test.tsx`, `e2e/homepage.spec.ts`

## What's Left (TODOS.md)

Three items deferred to `TODOS.md` in the repo:

1. **Sound disable toggle** — users can't turn sound off after enabling. Needs design decision on button behavior.
2. **Error boundary around Scene** — if Three.js throws (not just context loss), the page white-screens. Wrap in error boundary.
3. **Mobile touch-action** — add `touch-action: none` to prevent overscroll/bounce on Android.

## Key Architecture Decisions Made
- SoundEngine owns its own `pointermove` listener (no cursor props from parent)
- Visit counter centralized in `page.tsx`, passed as `isReturning` prop to ParticleField
- `useSyncExternalStore` used for reduced-motion and desktop detection (live updates)
- Custom cursor delays `cursor: none` until first mousemove (prevents flash)

## How to Continue
```bash
git checkout claude/plan-eng-review-FABP8
npm install
npx vitest run          # 29 tests should pass
npm run lint            # 0 errors, 1 pre-existing warning in middleware.ts
npx tsc --noEmit        # 0 type errors
npm run build           # works locally (needs Google Fonts network access)
```

## Plan File
Full eng review plan with coverage diagrams, failure modes, and parallelization strategy: `~/.claude/plans/noble-forging-teapot.md`

## Review Dashboard State
```
Eng Review:    CLEAR (PLAN) — 13 issues, 2 critical gaps
Design Review: CLEAR (FULL) — score 7/10 → 9/10, 2 decisions
Outside Voice: issues_found (claude) — 5 tension points resolved
```
