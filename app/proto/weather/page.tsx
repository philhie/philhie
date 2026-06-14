import { readGeo } from "../_lib/geo";
import Weather from "./Weather";

export const dynamic = "force-dynamic";

export default async function WeatherPage() {
  const geo = await readGeo();
  return <Weather geo={geo} />;
}
