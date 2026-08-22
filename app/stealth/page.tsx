import Link from "next/link";
import type { Metadata } from "next";
import { HOME_CITY, HOME_TZ } from "../_lib/site";
import { localTimeString } from "../_lib/clock";
import { Dateline } from "../_home/Dateline";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

// SF dateline → request-time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sealed",
  description: "A company is being built here.",
};

export default function StealthPage() {
  const initialTime = localTimeString(HOME_TZ);

  return (
    <main className="mx-auto flex min-h-svh max-w-[88rem] flex-col px-[var(--gutter-x)] pt-[max(clamp(2rem,6vh,3.5rem),var(--edge-top))] pb-[calc(clamp(2rem,7vh,5rem)+var(--edge-bottom))] md:pt-[clamp(2rem,6vh,3.5rem)]">
      <div>
        <div className="flex items-center justify-between gap-4">
          <Dateline place={HOME_CITY} timezone={HOME_TZ} initialTime={initialTime} />
          <ThemeToggle variant="docked" />
        </div>
        <Separator className="mt-4 bg-hairline" />
      </div>

      <div className="mt-auto">
        <h1
          style={{ viewTransitionName: "masthead-title" }}
          className="optical-left font-display text-monument font-medium leading-[0.92] tracking-[-0.03em] text-foreground"
        >
          Sealed.
        </h1>
        <p className="mt-[clamp(1.25rem,3vh,2rem)] max-w-xl text-[clamp(1.05rem,2.2vw,1.4rem)] font-light leading-[1.45] text-mono-muted">
          A company is being built here. The rest is need-to-know&nbsp;— and
          right now, you don&rsquo;t.
        </p>
      </div>

      <footer className="mt-[clamp(3rem,10vh,6rem)] flex flex-wrap items-center justify-between gap-y-3 border-t border-hairline pt-6">
        <Link
          href="/"
          className="tap-target inline-flex min-h-11 items-center text-[0.95rem] text-mono-muted transition-colors hover:text-foreground"
        >
          <span className="link-underline">← Phil Hie</span>
        </Link>
        <span className="label-mono">Come back in 2026</span>
      </footer>
    </main>
  );
}
