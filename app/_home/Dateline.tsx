"use client";

import { useEffect, useState } from "react";
import { localTimeString } from "../_lib/clock";

/**
 * Masthead dateline — pinned to Phil's city and its local time.
 * PHIL HIE · SAN FRANCISCO · 14:22 LOCAL
 *
 * Renders the server-computed `initialTime` first (SSR-match → no hydration
 * mismatch), then ticks the city's local clock each minute.
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

  const segments = ["Phil Hie", place, `${time} local`];

  return (
    <p className={`label-mono nums flex flex-wrap items-center ${className ?? ""}`}>
      {segments.map((seg, i) => (
        <span key={i} className="inline-flex items-center">
          {i > 0 && <span className="mx-2 text-mono-muted/50">·</span>}
          {seg}
        </span>
      ))}
    </p>
  );
}
