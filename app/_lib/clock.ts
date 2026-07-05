/**
 * Visitor-local time for the masthead dateline. Pure Intl — no network, no
 * geolocation prompt. Computed on the server for first paint (from the Vercel
 * geo timezone), then re-read on the client each minute.
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
