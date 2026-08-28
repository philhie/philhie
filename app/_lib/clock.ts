/**
 * Local time for the masthead dateline, pinned to HOME_TZ (not the visitor's
 * zone). Pure Intl — no network, no geolocation prompt. The site is a static
 * export, so the server value is baked at build time and is only a first-paint
 * seed; Dateline re-reads the real clock on mount and then each minute.
 */

export function localTimeString(tz: string | null): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz || undefined,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    // Some engines emit "24" at midnight — normalize.
    return `${hh === "24" ? "00" : hh}:${mm}`;
  } catch {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  }
}
