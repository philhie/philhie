import { readGeo } from "../_lib/geo";
import ObjectWorld from "./Object";

export const dynamic = "force-dynamic";

export default async function ObjectPage() {
  const geo = await readGeo();
  return <ObjectWorld geo={geo} />;
}
