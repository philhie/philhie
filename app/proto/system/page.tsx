import { readGeo } from "../_lib/geo";
import System from "./System";

export const dynamic = "force-dynamic";

export default async function SystemPage() {
  const geo = await readGeo();
  return <System geo={geo} />;
}
