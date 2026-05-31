# Phil Hie Personal Website

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS 4 (for DOM overlay styling)
- Three.js + @react-three/fiber + @react-three/postprocessing + @react-three/drei
- Web Audio API (no audio file dependencies)
- Deployed on Vercel (auto-deploy on push to main)

## Development
```bash
npm run dev     # local dev server
npm run build   # production build
npm run lint    # eslint
```

## Architecture
- `app/page.tsx` — Main page: dynamic canvas import + DOM overlay + Konami listener
- `app/components/Scene.tsx` — R3F Canvas (on-demand frameloop) + postprocessing (Bloom/Vignette/Noise)
- `app/components/ParticleField.tsx` — Points + inline shaders + entrance + interaction
- `app/components/SoundEngine.tsx` — Web Audio API synthesizer (lazy, opt-in)
- `app/components/SoundToggle.tsx` — "listen" toggle button
- `app/components/CustomCursor.tsx` — Desktop-only pointer follower
- `app/layout.tsx` — Fonts, metadata, analytics
- `middleware.ts` — Subdomain routing (unchanged)
