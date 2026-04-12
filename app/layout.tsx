import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://philhie.com"),
  title: {
    default: "Phil Hie",
    template: "%s · Phil Hie",
  },
  description: "Phil Hie. Just doing things.",
  keywords: ["Phil Hie", "technology", "founder"],
  authors: [{ name: "Phil Hie", url: "https://philhie.com" }],
  creator: "Phil Hie",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://philhie.com",
    title: "Phil Hie",
    description: "Just doing things.",
    siteName: "Phil Hie",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phil Hie",
    description: "Just doing things.",
    creator: "@philhie",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon" },
    ],
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
