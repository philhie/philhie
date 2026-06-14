import { readGeo } from "../_lib/geo";
import Signal from "./Signal";

export const dynamic = "force-dynamic";

export default async function SignalPage() {
  const geo = await readGeo();
  return <Signal geo={geo} />;
}
