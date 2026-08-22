import { PressReveal } from "./PressReveal";
import { HOME_CITY, HOME_TZ } from "../_lib/site";
import { localTimeString } from "../_lib/clock";

/**
 * The hero. San Francisco dateline, the monumental name, "Building" (→ the
 * sealed page), and the follow row — all above the fold. Server HTML; the
 * entrance is pure CSS.
 *
 * The name is bottom-anchored (`mt-auto`) — that is the house style, and
 * `/stealth` matches it. But 92svh of it on a phone left the top half of the
 * first screen blank, so phones get 74svh: the void stays deliberate, and the
 * "Background" heading peeks over the fold as the scroll cue.
 *
 * The top padding has a floor of `--edge-top + 2.75rem`, which is the height of
 * the fixed theme toggle. The dateline therefore starts below the toggle rather
 * than beside it, and gets the full measure instead of a 5.5rem reservation.
 */
export function Masthead() {
  const initialTime = localTimeString(HOME_TZ);

  return (
    <header className="flex min-h-[74svh] flex-col pt-[max(clamp(2rem,6vh,3.5rem),calc(var(--edge-top)+2.75rem))] pb-[clamp(2rem,7vh,5rem)] md:min-h-[92svh] md:pt-[clamp(2rem,6vh,3.5rem)]">
      <PressReveal
        place={HOME_CITY}
        timezone={HOME_TZ}
        initialTime={initialTime}
      />
    </header>
  );
}
