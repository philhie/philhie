import { PressReveal } from "./PressReveal";
import { HOME_CITY, HOME_TZ } from "../_lib/site";
import { localTimeString } from "../_lib/clock";

/**
 * The hero. San Francisco dateline, the monumental name, "Building" (→ the
 * sealed page), and the follow row — all above the fold. Server HTML; the
 * entrance is pure CSS.
 */
export function Masthead() {
  const initialTime = localTimeString(HOME_TZ);

  return (
    <header className="flex min-h-[92svh] flex-col pt-[clamp(2rem,6vh,3.5rem)] pb-[clamp(2rem,7vh,5rem)]">
      <PressReveal
        place={HOME_CITY}
        timezone={HOME_TZ}
        initialTime={initialTime}
      />
    </header>
  );
}
