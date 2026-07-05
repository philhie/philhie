import { cn } from "@/lib/utils";
import { SOCIALS } from "../_lib/site";

const LINK =
  "text-mono-muted transition-colors duration-300 ease-out hover:text-foreground link-underline";

/**
 * The follow row — the primary action, lives at the bottom of the hero so it's
 * there the moment the page opens. Muted → ink on hover, underline draws in.
 */
export function Socials({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Elsewhere"
      className={cn(
        "flex flex-wrap items-center gap-x-8 gap-y-2 text-[0.95rem]",
        className,
      )}
    >
      <a href={SOCIALS.x} target="_blank" rel="me noopener noreferrer" className={LINK}>
        X
      </a>
      <a
        href={SOCIALS.linkedin}
        target="_blank"
        rel="me noopener noreferrer"
        className={LINK}
      >
        LinkedIn
      </a>
      <a
        href={SOCIALS.github}
        target="_blank"
        rel="me noopener noreferrer"
        className={LINK}
      >
        GitHub
      </a>
    </nav>
  );
}
