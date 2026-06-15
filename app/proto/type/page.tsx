import { readGeo } from "../_lib/geo";
import TypeWorld from "./Type";

export const dynamic = "force-dynamic";

export default async function TypePage() {
  const geo = await readGeo();
  return <TypeWorld geo={geo} />;
}
