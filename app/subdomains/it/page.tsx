import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IT · Phil Hie",
  description: "IT and technology services by Phil Hie.",
};

export default function ITPage() {
  return (
    <div className="flex min-h-svh items-center bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl px-[var(--gutter-x)] pt-[calc(5rem+var(--edge-top))] pb-[calc(5rem+var(--edge-bottom))]">
        <p className="label-mono">Phil Hie · IT &amp; Technology</p>

        <h1 className="mt-6 font-display text-[clamp(2.5rem,9vw,5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-foreground">
          IT Services
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-mono-muted">
          Technology consulting, infrastructure, and digital solutions. Helping
          businesses leverage modern technology to scale.
        </p>

        <div aria-hidden className="mt-10 h-px w-full bg-hairline" />

        <a
          href="https://philhie.com"
          className="tap-target mt-6 inline-flex min-h-11 items-center font-mono text-(length:--text-label) uppercase tracking-[0.16em] text-foreground transition-colors hover:text-signal"
        >
          <span className="link-underline">philhie.com ↗</span>
        </a>
      </main>
    </div>
  );
}
