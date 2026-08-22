import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
