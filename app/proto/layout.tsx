import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./_proto.css";

// Characterful variable serif for the "soul" half of soul-meets-machine.
// Pairs against Geist Sans (monumental) + Geist Mono (metadata) from the root.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prototypes",
  robots: { index: false, follow: false },
};

export default function ProtoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={fraunces.variable}>{children}</div>;
}
