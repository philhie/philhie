import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wrap App Router client navigations in document.startViewTransition, so the
  // shared `masthead-title` element morphs between / ↔ /thoughts ↔ /stealth.
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
