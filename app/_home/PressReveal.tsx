import Link from "next/link";
import type { CSSProperties } from "react";
import { Separator } from "@/components/ui/separator";
import { Dateline } from "./Dateline";
import { Socials } from "./Socials";

/**
 * The hero. Server-rendered (the name is real SSR HTML — the LCP element, never
 * hidden behind JS). The entrance is a pure-CSS "focus pull": the name resolves
 * from a soft blur, then the statement and follow row settle. Reduced-motion
 * shows everything at once (the animation lives behind a media query).
 */
export function PressReveal({
  place,
  timezone,
  initialTime,
}: {
  place: string;
  timezone: string;
  initialTime: string;
}) {
  return (
    <>
      <div className="press-in" style={{ "--press-delay": "0.1s" } as CSSProperties}>
        <Dateline place={place} timezone={timezone} initialTime={initialTime} />
        <Separator className="mt-4 bg-hairline" />
      </div>

      <div className="mt-auto">
        <h1
          style={
            {
              viewTransitionName: "masthead-title",
              "--press-delay": "0.15s",
            } as CSSProperties
          }
          className="press-in press-in--focus optical-left font-display text-monument font-medium leading-[0.92] tracking-[-0.03em] text-foreground"
        >
          Phil Hie
        </h1>

        <div
          className="press-in mt-[clamp(1.25rem,3vh,2.25rem)]"
          style={{ "--press-delay": "0.5s" } as CSSProperties}
        >
          <Link
            href="/stealth"
            className="optical-left link-underline inline-block font-display text-[clamp(1.5rem,3.4vw,2.5rem)] font-light tracking-[-0.02em] text-foreground/90 transition-opacity hover:opacity-70"
          >
            Building
          </Link>
        </div>
      </div>

      <div
        className="press-in mt-[clamp(2.5rem,7vh,4.5rem)]"
        style={{ "--press-delay": "0.7s" } as CSSProperties}
      >
        <Socials />
      </div>
    </>
  );
}
