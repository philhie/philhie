import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Satoshi — the whole voice. A refined variable neo-grotesque (self-hosted).
// Light-to-medium weights carry the luxury; the size and space do the rest.
const satoshi = localFont({
  src: "./_fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

// Kept only for code inside long-form writing.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Required. Without it every `env(safe-area-inset-*)` in globals.css resolves
  // to 0px, and the floating controls sit under the notch / home indicator.
  viewportFit: "cover",
  // The theme is class-based and user-toggled (`enableSystem: false`), so it
  // must NOT key off prefers-color-scheme: a visitor with a dark OS was getting
  // a #0a0a0a browser chrome bar above a white page. Light is canonical, and
  // ThemeColorSync repaints this tag when the visitor flips to after-hours.
  themeColor: "#ffffff",
};

// Cloudflare Web Analytics — privacy-first, free, no cookies. The beacon only
// renders once NEXT_PUBLIC_CF_BEACON_TOKEN is set (Pages project → Settings →
// Variables), so local and preview builds stay untracked.
const BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

const DESCRIPTION = "Phil Hie. Building.";

export const metadata: Metadata = {
  metadataBase: new URL("https://philhie.com"),
  title: {
    default: "Phil Hie",
    template: "%s · Phil Hie",
  },
  description: DESCRIPTION,
  keywords: [
    "Phil Hie",
    "founder",
    "stealth startup",
    "technology",
    "Goldman Sachs",
    "AI",
  ],
  authors: [{ name: "Phil Hie", url: "https://philhie.com" }],
  creator: "Phil Hie",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://philhie.com",
    title: "Phil Hie",
    description: DESCRIPTION,
    siteName: "Phil Hie",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phil Hie",
    description: DESCRIPTION,
    creator: "@philhie",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    // Must be the real emitted filename. Declaring `icons` at all suppresses
    // the app/apple-icon.png file convention, and the old "/apple-icon" route
    // path no longer exists under static export.
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {BEACON_TOKEN ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token":"${BEACON_TOKEN}"}`}
          />
        ) : null}
      </body>
    </html>
  );
}
