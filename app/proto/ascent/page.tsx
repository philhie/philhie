import { readGeo } from "../_lib/geo";
import Ascent from "./Ascent";

// Dynamic so we can read the visitor's edge geo for "your sky".
export const dynamic = "force-dynamic";

export default async function AscentPage() {
  const geo = await readGeo();
  return <Ascent geo={geo} />;
}
