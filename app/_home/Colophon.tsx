/**
 * A slim colophon — just the copyright. The follow row lives in the hero.
 */
export function Colophon() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-[88rem] px-[clamp(1.5rem,5vw,5rem)] py-[clamp(2.5rem,6vh,4rem)]">
        <div className="label-mono">&copy; {year} Phil Hie</div>
      </div>
    </footer>
  );
}
