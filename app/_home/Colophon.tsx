import { SoundToggle } from "../_audio/SoundToggle";

/**
 * A slim colophon — the copyright, and (on a phone) the sound control.
 *
 * The sound toggle is `position: fixed` bottom-right from `md` up, where there
 * is room for it to float. Below `md` it docks here instead. Fixed, it sat on
 * top of the ledger's year column and the copyright line, inside the iOS home
 * indicator, and under Safari's bottom toolbar — which no amount of
 * `env(safe-area-inset-bottom)` can clear, because the toolbar is not a safe
 * area. Docked, it is simply part of the footer rule: "© 2026 Phil Hie · sound
 * on". One instance, one iframe; only the position changes.
 */
export function Colophon() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-[88rem] flex-wrap items-center justify-between gap-x-6 gap-y-4 px-[var(--gutter-x)] pt-[clamp(2.5rem,6vh,4rem)] pb-[calc(clamp(2.5rem,6vh,4rem)+var(--edge-bottom))]">
        <div className="label-mono">&copy; {year} Phil Hie</div>
        <SoundToggle className="md:fixed md:bottom-[var(--edge-bottom)] md:right-[var(--edge-x)] md:z-50" />
      </div>
    </footer>
  );
}
