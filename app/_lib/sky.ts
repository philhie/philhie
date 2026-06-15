"use client";

import { useEffect, useRef } from "react";
import type { Geo } from "./geo";

/**
 * "Your sky" — turns the visitor's local time + weather into a small state the
 * shaders read. Time-of-day resolves instantly from the timezone (no network);
 * Open-Meteo (free, no key) refines it with real cloud cover + wind a beat
 * later. The first emotional hit: "it knows where I am."
 */
export interface SkyState {
  city: string | null;
  hour: number; // local decimal hour, 0..24
  daylight: number; // 0 night .. 1 midday
  warmth: number; // 0 cold .. 1 warm (golden hours peak)
  haze: number; // 0 clear .. 1 overcast
  drift: [number, number]; // wind direction × speed, normalized
  hasWeather: boolean;
}

function localHour(tz: string | null): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz || undefined,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    return h + m / 60;
  } catch {
    const d = new Date();
    return d.getHours() + d.getMinutes() / 60;
  }
}

// Smooth daylight: ~0 before 6 / after 20, ~1 around 13. Soft shoulders.
function daylightFromHour(h: number): number {
  const x = (h - 13) / 7; // 0 at solar noon, ±1 at 6 / 20
  return Math.max(0, 1 - x * x);
}

// Warmth peaks at the golden hours (~7, ~18), warm-neutral midday, cool at night.
function warmthFromHour(h: number): number {
  const golden =
    Math.exp(-((h - 7) ** 2) / 4) + Math.exp(-((h - 18.5) ** 2) / 4);
  const day = daylightFromHour(h);
  return Math.min(1, 0.12 + 0.5 * day + 0.55 * golden);
}

export function baseSky(geo: Geo): SkyState {
  const hour = localHour(geo.timezone);
  return {
    city: geo.city,
    hour,
    daylight: daylightFromHour(hour),
    warmth: warmthFromHour(hour),
    haze: 0.25,
    drift: [0.3, 0.1],
    hasWeather: false,
  };
}

interface OpenMeteo {
  current?: {
    cloud_cover?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
  };
  daily?: { sunrise?: string[]; sunset?: string[] };
}

/**
 * Returns a stable ref the shader reads each frame. Updates in place when the
 * weather fetch resolves — no re-mount, no re-render of the canvas.
 */
export function useSky(geo: Geo) {
  const ref = useRef<SkyState>(baseSky(geo));

  useEffect(() => {
    // Refresh time-of-day immediately (covers SSR/client clock drift).
    ref.current = baseSky(geo);

    let cancelled = false;
    if (geo.lat != null && geo.lon != null) {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}` +
        `&longitude=${geo.lon}&current=cloud_cover,wind_speed_10m,wind_direction_10m` +
        `&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .then((j: OpenMeteo | null) => {
          if (cancelled || !j?.current) return;
          const cloud = (j.current.cloud_cover ?? 25) / 100;
          const windSpd = Math.min(1, (j.current.wind_speed_10m ?? 8) / 40);
          const windDir = ((j.current.wind_direction_10m ?? 90) * Math.PI) / 180;
          const prev = ref.current;
          ref.current = {
            ...prev,
            haze: cloud,
            drift: [Math.sin(windDir) * windSpd, Math.cos(windDir) * windSpd],
            hasWeather: true,
          };
        })
        .catch(() => {});
    }

    // Keep the clock honest over a long session.
    const id = window.setInterval(() => {
      const next = baseSky(geo);
      ref.current = { ...ref.current, hour: next.hour, daylight: next.daylight, warmth: next.warmth };
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [geo]);

  return ref;
}
