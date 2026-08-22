import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import "./reading.css";

// The reading room sets titles in Satoshi (the site voice) and long-form prose
// in Fraunces (a serif for reading), with Geist Mono for metadata and code.
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
  return (
    <div className={`${fraunces.variable} thoughts-root`}>
      <ThemeToggle />
      {children}
    </div>
  );
}
