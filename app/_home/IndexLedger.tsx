"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { INDEX } from "./index-data";

/**
 * ② The Index — the record as a magazine contents page. Quiet numbered rows;
 * the receipt reveals on hover / focus (pointer) or tap (touch). Receipts are
 * always in the DOM (a11y + agent-readable); the reveal is presentational.
 */
export function IndexLedger() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="index-heading"
      className="py-[clamp(3rem,10vh,7rem)]"
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
                className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-[clamp(1.1rem,2.5vh,1.75rem)] text-left md:grid-cols-[4rem_1fr_auto] md:gap-x-8"
              >
                <span className="label-mono nums pt-2 transition-colors duration-300 group-hover:text-foreground">
                  {e.n}
                </span>

                <span className="min-w-0">
                  <span className="block font-display text-[clamp(1.5rem,4vw,2.85rem)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
                    {e.role}
                    <span className="text-mono-muted">,&nbsp;</span>
                    {e.company}
                  </span>
                  <span
                    className={cn(
                      "block overflow-hidden text-[0.85rem] font-light tracking-tight text-mono-muted transition-all duration-300 ease-out",
                      isOpen
                        ? "mt-2 max-h-10 translate-y-0 opacity-100"
                        : "max-h-0 -translate-y-1 opacity-0 md:group-hover:mt-2 md:group-hover:max-h-10 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:mt-2 md:group-focus-visible:max-h-10 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100",
                    )}
                  >
                    {e.receipt}
                  </span>
                </span>

                <span className="label-mono nums pt-2 text-right transition-colors duration-300 group-hover:text-foreground">
                  {e.year}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
