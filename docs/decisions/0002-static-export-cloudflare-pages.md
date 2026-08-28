# 0002 — Static export, hosted on Cloudflare Pages

- **Status:** Accepted
- **Date:** 2026-08-27
- **Applies to:** hosting, build output, analytics, and the subdomain route

## Context

On 2026-08-23 the Vercel team `philhie's projects` was soft-blocked with
`FAIR_USE_LIMITS_EXCEEDED` on `fluidCpuDuration`. The block is account-wide, so every domain on it
returned `402 DEPLOYMENT_DISABLED` — philhie.com included. The site itself was healthy: its
production deployment was `READY` and correctly aliased. It was taken down by CPU that other
projects on the same Hobby account burned.

A measurement of what this site actually needs found almost nothing:

1. `force-dynamic` on `/` and `/stealth` existed only to seed the masthead clock's first paint.
   `Dateline` is already a client component that calls `tick()` on mount, so the server value is a
   seed, not the source of truth.
2. `HOME_TZ` is the constant `"America/Los_Angeles"`. There was no geo lookup, despite a comment in
   `clock.ts` claiming the timezone came from Vercel geo.
3. `middleware.ts` served exactly one hostname, `it.philhie.com`, which does not resolve in DNS.
4. `opengraph-image.tsx` and `apple-icon.tsx` took no parameters, so each produced one fixed PNG on
   every request.
5. There are no API routes, no server actions, no `next/image`, no rewrites, and `/thoughts/[slug]`
   already used `generateStaticParams` with `dynamicParams = false`.

## Decision

Build with `output: "export"` and host the result on Cloudflare Pages.

- **Hosting.** Cloudflare Pages, free tier: unlimited bandwidth, free custom domains and TLS, and
  GitHub auto-deploy on push to `main`. DNS for philhie.com already runs on Cloudflare
  (`craig`/`holly.ns.cloudflare.com`), so no nameserver change is needed.
- **The clock.** The build-time value stays as the SSR seed. Server and client first render both
  read the same `initialTime` prop, so there is no hydration mismatch, and `useEffect` corrects to
  the real time on mount. The trade-off is one painted frame of a stale time on first load. A
  `--:--` placeholder was rejected: it flashes on *every* load and is a visible design regression,
  where the stale value is plausible and self-corrects.
- **The images.** `opengraph-image.tsx` and `apple-icon.tsx` are replaced by the byte-identical
  PNGs they produced, captured from a `next start` build and committed as `app/opengraph-image.png`
  and `app/apple-icon.png` (plus `opengraph-image.alt.txt`). Declaring `metadata.icons` at all
  suppresses the file convention, so `icons.apple` must name the real emitted path
  `/apple-icon.png` — the old `/apple-icon` route path 404s under export.
- **The subdomain.** `middleware.ts` is deleted; static export does not support it. The content
  survives at `app/subdomains/it` and is reachable at `/subdomains/it`. To bring `it.philhie.com`
  back, ship that route as its own Pages project bound to the hostname. That is cleaner than
  host-rewriting in middleware and needs no compute.
- **Analytics.** `@vercel/analytics` and `@vercel/speed-insights` are removed. Cloudflare Web
  Analytics replaces them, gated on `NEXT_PUBLIC_CF_BEACON_TOKEN` so local and preview builds stay
  untracked.

## Consequences

- `next start` cannot serve an exported build. `npm start` now aliases `npm run preview`
  (`serve out`), and `npm run test:e2e:export` runs the full Playwright suite against the real
  `out/` bundle rather than `next dev`.
- Every route is prerendered: `/`, `/stealth`, `/thoughts`, `/thoughts/[slug]`, `/subdomains/it`.
  Adding anything request-dependent later means either moving off static export or pushing the work
  to the client.
- This does not fix Kengo. `deploy` and the `sauron-*` projects remain paused on Vercel. If Kengo
  returns to that Hobby account it will trip the same fair-use block — Hobby forbids commercial use,
  which is the likely root cause. Kengo needs its own hosting decision.

## Deployment (2026-08-27)

- Cloudflare account `9adf6a22141ded2ad5458f194509a383`, zone `philhie.com`
  (`28d9e7eda3925d4045c832d204cd216b`).
- Pages project **`philhie`**, production branch `main`, live at <https://philhie.pages.dev>.
  Deployed from `out/` with `wrangler pages deploy out --project-name philhie --branch main`.
- Credentials: `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` already exist in
  `~/.config/kengo/secrets.env`. That token grants Pages read/write but **not** Zone DNS edit, and
  `/user/tokens/verify` returns "Invalid API Token" for it while `/accounts` and `/zones` succeed —
  it simply lacks self-read. Do not re-request these values.

### Outstanding — DNS cutover

`philhie.com` and `www.philhie.com` are attached to the Pages project but sit at `status=pending`,
because DNS still points at Vercel and the token cannot rewrite it. To finish, replace these records
in the philhie.com zone:

| Name | Current | Change to |
| --- | --- | --- |
| `philhie.com` | `A 216.198.79.1` | `CNAME philhie.pages.dev` (proxied; CNAME flattening handles the apex) |
| `www` | `CNAME …vercel-dns-017.com` | `CNAME philhie.pages.dev` (proxied) |

Both domains then move to `status=active` on their own and Google-issued certs provision. Granting
`Zone → DNS → Edit` on philhie.com to the existing token lets this be done without the dashboard.
