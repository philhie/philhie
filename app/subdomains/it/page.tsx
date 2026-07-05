import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IT · Phil Hie",
  description: "IT and technology services by Phil Hie.",
};

export default function ITPage() {
  return (
    <div className="flex min-h-svh items-center bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl px-[clamp(1.5rem,6vw,3rem)] py-20">
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
          className="mt-8 inline-block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-foreground link-underline transition-colors hover:text-signal"
        >
          philhie.com ↗
        </a>
      </main>
    </div>
  );
}
