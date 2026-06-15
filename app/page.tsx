import { readGeo } from "./_lib/geo";
import Weather from "./_home/Weather";
import "./home.css";

// Reads Vercel IP-geo headers to seed "your sky" — request-time, so dynamic.
export const dynamic = "force-dynamic";

export default async function Home() {
  const geo = await readGeo();
  return <Weather geo={geo} />;
}
