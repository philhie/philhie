# Phil Hie Personal Website

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Mobile
Check every visual change at 320px, 375px, 393px, and 430px width.
Check the change in landscape.
Read the "Responsive and Mobile" section of DESIGN.md before you change a `clamp()` curve.
Run `npm run test:e2e` — it runs every spec at all reference widths.

## Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, CSS-first. There is no `tailwind.config` file; tokens live in `app/globals.css` and breakpoints are the v4 defaults.
- shadcn/ui on Base UI primitives
- next-themes (`attribute="class"`, light default, system disabled)
- Satoshi (self-hosted variable) + Geist Mono + Fraunces (on `/thoughts` only)
- Vitest + Testing Library (unit), Playwright (end to end)
- Deployed on Vercel (auto-deploy on push to main)

## Development
```bash
npm run dev        # local dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run test       # vitest
npm run test:e2e   # playwright, all reference widths
```

## Architecture
- `app/page.tsx` — Home: masthead, ledger, colophon
- `app/layout.tsx` — Fonts, viewport (`viewportFit: "cover"`), metadata, theme provider, analytics
- `app/globals.css` — Design tokens, base layer, utilities, the one phone media query
- `app/_home/` — `Masthead`, `PressReveal`, `Dateline`, `Socials`, `IndexLedger`, `Colophon`, `index-data`
- `app/_audio/SoundToggle.tsx` — Muted YouTube loop that unmutes on the first gesture
- `app/_seo/PersonJsonLd.tsx` — schema.org Person graph
- `app/_lib/` — `site.ts` (name, city, socials), `clock.ts` (city local time)
- `app/_fonts/` — Satoshi variable woff2
- `app/stealth/page.tsx` — The sealed page, reached from "Building"
- `app/thoughts/` — Reading room: `layout.tsx`, `page.tsx`, `[slug]/page.tsx`, `reading.css`
- `app/subdomains/it/` — it.philhie.com
- `components/` — `theme-toggle.tsx`, `theme-provider.tsx`, `ui/` (shadcn)
- `middleware.ts` — Subdomain routing
- `content/` — Markdown for `/thoughts`
- `e2e/` — `homepage.spec.ts`, `mobile.spec.ts`
