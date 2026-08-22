import { PressReveal } from "./PressReveal";
import { HOME_CITY, HOME_TZ } from "../_lib/site";
import { localTimeString } from "../_lib/clock";

/**
 * The hero. San Francisco dateline, the monumental name, "Building" (→ the
 * sealed page), and the follow row — all above the fold. Server HTML; the
 * entrance is pure CSS.
 *
 * Below `md` the stack flows from the top (see PressReveal) and the hero is
 * sized to its content, so the record starts on the first screen rather than
 * behind 400px of white.
 *
 * The top padding has a floor of `--edge-top + 2.75rem`, which is the height of
 * the fixed theme toggle. The dateline therefore starts below the toggle rather
 * than beside it, and gets the full measure instead of a 5.5rem reservation.
 */
export function Masthead() {
  const initialTime = localTimeString(HOME_TZ);

  return (
    <header className="flex flex-col pt-[max(clamp(2rem,6vh,3.5rem),calc(var(--edge-top)+2.75rem))] pb-8 md:min-h-[92svh] md:pb-[clamp(2rem,7vh,5rem)] md:pt-[clamp(2rem,6vh,3.5rem)]">
      <PressReveal
        place={HOME_CITY}
        timezone={HOME_TZ}
        initialTime={initialTime}
      />
    </header>
  );
}
