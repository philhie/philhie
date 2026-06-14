import { readGeo } from "../_lib/geo";
import Forge from "./Forge";

export const dynamic = "force-dynamic";

export default async function ForgePage() {
  const geo = await readGeo();
  return <Forge geo={geo} />;
}
