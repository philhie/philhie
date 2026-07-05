import Link from "next/link";
import type { Thought } from "../thoughts/_data";
import { formatDate } from "../thoughts/_data";

/**
 * ③ Dispatches — a quiet teaser of /thoughts. The writing is the proof of
 * thinking.
 */
export function Dispatches({ thoughts }: { thoughts: Thought[] }) {
  const items = thoughts.slice(0, 3);

  return (
    <section
      aria-labelledby="dispatches-heading"
      className="py-[clamp(3rem,10vh,7rem)]"
    >
      <div className="flex items-baseline justify-between">
        <h2 id="dispatches-heading" className="label-mono">
          Dispatches
        </h2>
        <Link
          href="/thoughts"
          className="label-mono link-underline transition-colors hover:text-foreground"
        >
          All thoughts →
        </Link>
      </div>

      <div
        aria-hidden
        className="mt-8 h-px w-full origin-left bg-hairline rule-draw"
      />
      <ul>
        {items.length === 0 && (
          <li className="border-b border-hairline py-10 font-display text-3xl font-light tracking-tight text-mono-muted">
            Soon.
          </li>
        )}
        {items.map((t) => (
          <li key={t.slug} className="border-b border-hairline">
            <Link
              href={`/thoughts/${t.slug}`}
              className="group block py-[clamp(1.25rem,3vh,2rem)]"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[clamp(1.35rem,3vw,2.1rem)] font-normal leading-tight tracking-[-0.02em] text-foreground">
                  <span className="link-underline">{t.title}</span>
                </h3>
                <span className="label-mono nums whitespace-nowrap pt-1">
                  {t.readingMin} min
                </span>
              </div>
              <p className="mt-2 max-w-2xl font-light leading-relaxed text-mono-muted">
                {t.description}
              </p>
              <span className="label-mono mt-3 block">{formatDate(t.date)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
