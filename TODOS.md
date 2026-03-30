# TODOS

## Sound disable toggle
**What:** Allow users to turn sound off after enabling it (currently one-way: enable only).
**Why:** SoundToggle disappears after enabling. toggleSound only sets true. Users can't disable sound without refreshing. The entire SoundEngine teardown path is dead code.
**Pros:** Better UX, makes teardown code functional, prevents oscillator leaks.
**Cons:** Minor design decision needed (does "listen" reappear? or add a "mute" button?).
**Context:** `SoundToggle.tsx` returns null when enabled. `toggleSound` in `page.tsx` is `useCallback(() => setSoundEnabled(true), [])`. SoundEngine cleanup effect never runs in practice.
**Depends on:** None.
**Added:** 2026-03-30 via /plan-eng-review

## Error boundary around Scene component
**What:** Wrap the dynamic Scene import in an error boundary so any Three.js crash falls back to StaticFallback gracefully.
**Why:** If Three.js throws during rendering (not just context loss), the entire page white-screens. The onContextLost handler only catches WebGL context loss, not JS errors in shaders or R3F.
**Pros:** Graceful degradation for any Three.js failure mode. Users always see name/links.
**Cons:** Minor complexity. Error boundaries are class components (or use react-error-boundary).
**Context:** WebGL context loss is handled (`Scene.tsx` line 72), but runtime errors in `ParticleField` useFrame or shader compilation failures are not caught.
**Depends on:** None.
**Added:** 2026-03-30 via /plan-eng-review

## Mobile touch-action for scroll prevention
**What:** Add `touch-action: none` to canvas/main container to definitively prevent mobile overscroll/bounce.
**Why:** `overflow: hidden` on body (`globals.css`) doesn't prevent all mobile browsers from triggering pull-to-refresh or overscroll bounce. A prior commit (5f7c326) already fixed "white overscroll background on mobile", suggesting this was a problem.
**Pros:** Eliminates mobile overscroll/bounce on all browsers.
**Cons:** Prevents native scroll gestures (fine for single-screen experience).
**Context:** `globals.css` sets `overflow: hidden` on html/body. The canvas is fixed-position. Some Android browsers ignore overflow:hidden for touch gestures.
**Depends on:** None.
**Added:** 2026-03-30 via /plan-eng-review
