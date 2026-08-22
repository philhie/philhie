"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { localTimeString } from "../_lib/clock";

/**
 * Masthead dateline — pinned to Phil's city and its local time.
 * PHIL HIE · SAN FRANCISCO · 14:22 LOCAL
 *
 * Renders the server-computed `initialTime` first (SSR-match → no hydration
 * mismatch), then ticks the city's local clock each minute.
 *
 * At 12px the full three-part line is 316px wide, so it wrapped on every
 * phone. Below `md` the leading "Phil Hie" is dropped — the <h1> saying exactly
 * that sits directly beneath it — which brings the line to 246px and fits it on
 * one row at 320px. Each segment is `whitespace-nowrap`, so "San Francisco"
 * can never split down the middle at any width.
 */
export function Dateline({
  place,
  timezone,
  initialTime,
  className,
}: {
  place: string;
  timezone: string;
  initialTime: string;
  className?: string;
}) {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const tick = () => setTime(localTimeString(timezone));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [timezone]);

  const segments = [
    { text: "Phil Hie", phone: false },
    { text: place, phone: true },
    { text: `${time} local`, phone: true },
  ];

  return (
    <p className={`label-mono nums flex flex-wrap items-center ${className ?? ""}`}>
      {segments.map((seg, i) => (
        <span
          key={i}
          // cn() resolves the display conflict: a bare template string leaves
          // `inline-flex` and `hidden` fighting on source order.
          className={cn(
            "inline-flex items-center whitespace-nowrap",
            !seg.phone && "hidden md:inline-flex",
          )}
        >
          {i > 0 && (
            <span className="mx-2 hidden text-mono-muted/50 md:inline">·</span>
          )}
          {i > 1 && <span className="mx-2 text-mono-muted/50 md:hidden">·</span>}
          {seg.text}
        </span>
      ))}
    </p>
  );
}
