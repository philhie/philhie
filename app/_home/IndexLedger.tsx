"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { INDEX } from "./index-data";

/**
 * ② The Index — the record as a magazine contents page. Quiet numbered rows;
 * the receipt reveals on hover / focus (pointer) or tap (touch). Receipts are
 * always in the DOM (a11y + agent-readable); the reveal is presentational.
 *
 * Two things differ below `md`:
 *
 * 1. The year drops out of the third column and onto a second row under the
 *    title. As a column it took 78px of a 375px screen — 21% of the line for
 *    secondary information — which squeezed the title into 189px and broke
 *    "Co-Founder, Adepto" across a line at the hyphen.
 * 2. The disclosure mark is the only affordance a touch device gets, since
 *    the hover reveal is pointer-only. It is always visible.
 *
 * The role size is a slope + intercept curve for the same reason as
 * `--text-monument`: a bare `4vw` sat on its 24px floor on every phone from
 * 320px to 712px, so the type never adapted at all. The curve still reaches
 * the 2.85rem cap at 1140px, so nothing changes from there up.
 *
 * The reveal animates `grid-template-rows: 0fr → 1fr` rather than a `max-h`.
 * A fixed max-height silently clipped the longest receipt, and would clip
 * again for any string added later or any narrower screen.
 */
export function IndexLedger() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="index-heading"
      className="pt-10 pb-10 md:pt-[clamp(3rem,10vh,7rem)] md:pb-[clamp(2rem,6vh,7rem)]"
    >
      <h2 id="index-heading" className="label-mono mb-8">
        Background
      </h2>

      <div aria-hidden className="h-px w-full origin-left bg-hairline rule-draw" />
      <ol>
        {INDEX.map((e, i) => {
          const isOpen = open === i;
          return (
            <li key={e.company} className="reveal-up border-b border-hairline">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group grid w-full grid-cols-[1.75rem_1fr] items-baseline gap-x-3 py-[clamp(1.1rem,2.5vh,1.75rem)] text-left md:grid-cols-[4rem_1fr_auto_1.25rem] md:gap-x-8"
              >
                <span className="label-mono nums col-start-1 row-start-1 pt-2 transition-colors duration-300 group-hover:text-foreground">
                  {e.n}
                </span>

                <span className="col-start-2 row-start-1 min-w-0">
                  <span className="block font-display text-[clamp(1.375rem,2.88vw+0.8rem,2.85rem)] font-normal leading-[1.08] tracking-[-0.02em] text-foreground">
                    {e.role}
                    <span className="text-mono-muted">,&nbsp;</span>
                    {e.company}
                  </span>

                  <span
                    className={cn(
                      "grid transition-all duration-300 ease-out",
                      isOpen
                        ? "mt-2 grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0 md:group-hover:mt-2 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100 md:group-focus-visible:mt-2 md:group-focus-visible:grid-rows-[1fr] md:group-focus-visible:opacity-100",
                    )}
                  >
                    <span className="block overflow-hidden text-[0.85rem] font-light tracking-tight text-mono-muted">
                      {e.receipt}
                    </span>
                  </span>
                </span>

                {/* One year element, placed twice. Below `md` it sits on a
                    second row under the title; from `md` it is the third
                    column it has always been. */}
                <span className="label-mono nums col-start-2 row-start-2 mt-1.5 justify-self-start whitespace-nowrap transition-colors duration-300 group-hover:text-foreground md:col-start-3 md:row-start-1 md:mt-0 md:justify-self-end md:pt-2">
                  {e.year}
                </span>

                {/* Disclosure mark. A hairline cross that rotates into a minus —
                    the only signal a touch device gets that a row opens. */}
                {/* Shares the year's cell below `md` (opposite ends of it), and
                    takes its own narrow column from `md`. */}
                <span
                  aria-hidden
                  className="relative col-start-2 row-start-2 block size-3 self-center justify-self-end text-mono-muted transition-colors duration-300 group-hover:text-foreground md:col-start-4 md:row-start-1 md:mt-3 md:self-start md:justify-self-center"
                >
                  <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                  <span
                    className={cn(
                      "absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-out",
                      isOpen
                        ? "rotate-90"
                        : "md:group-hover:rotate-90 md:group-focus-visible:rotate-90",
                    )}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
