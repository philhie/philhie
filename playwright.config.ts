import { defineConfig, devices } from "@playwright/test";

/**
 * The site is fluid, not breakpoint-driven, so the widths below are the
 * contract: every clamp() curve must hold at all of them. 320 and 734x343
 * (landscape) are the two that historically broke first.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } }, // 1280x720
    { name: "phone-320", use: { ...devices["iPhone SE"] } }, // 320x568  webkit
    { name: "phone-375", use: { ...devices["iPhone SE (3rd gen)"] } }, // 375x667  webkit
    { name: "phone-393", use: { ...devices["iPhone 15 Pro"] } }, // 393x659  webkit
    { name: "phone-430", use: { ...devices["iPhone 15 Pro Max"] } }, // 430x739  webkit
    { name: "phone-android", use: { ...devices["Pixel 7"] } }, // 412x839  chromium
    { name: "phone-landscape", use: { ...devices["iPhone 15 Pro landscape"] } }, // 734x343
  ],
  // E2E_TARGET=export runs the suite against the real `out/` bundle that ships
  // to Cloudflare Pages (clean-URL routing included), rather than `next dev`.
  webServer: {
    command: process.env.E2E_TARGET === "export" ? "npm run preview" : "npm run dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
