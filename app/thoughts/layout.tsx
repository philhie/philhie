import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./reading.css";

// The reading room borrows the hero's serif "soul" voice (Fraunces) for body
// copy, set against Geist Sans (titles) + Geist Mono (metadata) from the root.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thoughts",
  description: "Essays by Phil Hie.",
};

export default function ThoughtsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${fraunces.variable} thoughts-root`}>{children}</div>;
}
