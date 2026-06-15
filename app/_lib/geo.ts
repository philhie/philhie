import { headers } from "next/headers";

/**
 * Visitor geo, read from Vercel's edge headers. Free, server-side, NO browser
 * permission prompt, city-level (never creepy-precise). Absent in local dev →
 * the worlds fall back to a graceful default sky.
 */
export interface Geo {
  city: string | null;
  region: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
}

export async function readGeo(): Promise<Geo> {
  const h = await headers();
  const get = (k: string) => h.get(k) || null;
  const num = (k: string) => {
    const v = h.get(k);
    const n = v ? parseFloat(v) : NaN;
    return Number.isFinite(n) ? n : null;
  };
  const city = get("x-vercel-ip-city");
  return {
    city: city ? decodeURIComponent(city) : null,
    region: get("x-vercel-ip-country-region"),
    country: get("x-vercel-ip-country"),
    lat: num("x-vercel-ip-latitude"),
    lon: num("x-vercel-ip-longitude"),
    timezone: get("x-vercel-ip-timezone"),
  };
}
