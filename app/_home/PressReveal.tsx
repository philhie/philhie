import Link from "next/link";
import type { CSSProperties } from "react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dateline } from "./Dateline";
import { Socials } from "./Socials";

/**
 * The hero. Server-rendered (the name is real SSR HTML — the LCP element, never
 * hidden behind JS).
 *
 * Below `md` the hero fills the screen, so the stack is bracketed: masthead row
 * and name at the top, follow row anchored to the bottom edge via `mt-auto`.
 * Letting the whole stack clump at the top instead leaves the bottom half blank
 * and reads as though the content simply stopped. The entrance is a pure-CSS "focus pull": the name resolves
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
      {/* The masthead row: dateline left, after-hours control right, one
          baseline, one rule under both. The control used to float in a band of
          its own above this line, with an empty corner beside it.

          `.press-in` is deliberately NOT on this row. It animates a transform,
          and a transformed ancestor becomes the containing block for a
          `position: fixed` descendant — which from `md` up is exactly what the
          control is. Wrapping the row moved it from 64px off the viewport edge
          to 64px off this box, i.e. 128px, on desktop. The animation goes on
          the dateline and the rule instead; the control does not need it. */}
      <div className="flex items-center justify-between gap-4">
        <div
          className="press-in min-w-0"
          style={{ "--press-delay": "0.1s" } as CSSProperties}
        >
          <Dateline place={place} timezone={timezone} initialTime={initialTime} />
        </div>
        <ThemeToggle variant="docked" />
      </div>
      <div className="press-in" style={{ "--press-delay": "0.1s" } as CSSProperties}>
        <Separator className="mt-4 bg-hairline" />
      </div>

      <div className="mt-10 md:mt-auto">
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
            className="tap-target optical-left link-underline inline-block font-display text-[clamp(1.5rem,1.53vw+1.375rem,2.5rem)] font-light tracking-[-0.02em] text-foreground/90 transition-opacity hover:opacity-70"
          >
            Building
          </Link>
        </div>
      </div>

      <div
        className="press-in mt-auto pt-10 md:mt-[clamp(2.5rem,7vh,4.5rem)] md:pt-0"
        style={{ "--press-delay": "0.7s" } as CSSProperties}
      >
        <Socials />
      </div>
    </>
  );
}
