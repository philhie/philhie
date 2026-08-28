import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages serves this as plain static files — no Node server, no
  // edge functions, no per-request work. Every route here is prerenderable:
  // the ledger and colophon are constants, /thoughts is markdown read at build
  // time, and the only live value (the SF dateline clock) is corrected on the
  // client. See DESIGN.md and app/_home/Dateline.tsx.
  output: "export",
  // The dev-tools indicator is a focusable button inside a shadow root, so
  // Playwright's locators count it as part of the page and it fails the 44px
  // touch-target check. It also lands in every screenshot.
  devIndicators: false,
  // Wrap App Router client navigations in document.startViewTransition, so the
  // shared `masthead-title` element morphs between / ↔ /thoughts ↔ /stealth.
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
