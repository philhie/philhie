import { cn } from "@/lib/utils";
import { SOCIALS } from "../_lib/site";

/**
 * The follow row — the primary action, lives at the bottom of the hero so it's
 * there the moment the page opens. Muted → ink on hover, underline draws in.
 *
 * Each link is a 44px-tall flex box with an invisible 44px-wide hit box on top
 * (`tap-target`). "X" is nine pixels of ink; as a bare inline anchor it was a
 * 9×23px target. The width comes from the pseudo-element rather than a
 * `min-w`, so the row's visual rhythm is untouched.
 *
 * The underline lives on an inner span, not the anchor: `.link-underline`
 * paints at the bottom of the padding box, which on a 44px-tall anchor would
 * float a line well below the text.
 */
function SocialLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="me noopener noreferrer"
      className="tap-target inline-flex min-h-11 items-center text-mono-muted transition-colors duration-300 ease-out hover:text-foreground"
    >
      <span className="link-underline">{children}</span>
    </a>
  );
}

export function Socials({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Elsewhere"
      className={cn(
        // -my-2.5 cancels the height the 44px targets add, so the hero's
        // vertical rhythm reads exactly as it did before.
        "-my-2.5 flex flex-wrap items-center gap-x-8 gap-y-1 text-[0.95rem]",
        className,
      )}
    >
      <SocialLink href={SOCIALS.x}>X</SocialLink>
      <SocialLink href={SOCIALS.linkedin}>LinkedIn</SocialLink>
      <SocialLink href={SOCIALS.github}>GitHub</SocialLink>
    </nav>
  );
}
