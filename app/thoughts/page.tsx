import Link from "next/link";
import type { Metadata } from "next";
import { getAllThoughts, formatDate } from "./_data";

export const metadata: Metadata = {
  title: "Thoughts",
  description: "Essays by Phil Hie.",
};

export default function ThoughtsIndex() {
  const thoughts = getAllThoughts();
  return (
    <div className="thoughts-wrap">
      <Link href="/" className="thoughts-back">
        ← Phil Hie
      </Link>
      <h1 className="thoughts-title">Thoughts</h1>
      <p className="thoughts-sub">My Beautiful Dark Twisted Mind</p>

      <ul className="thoughts-list">
        {thoughts.map((t) => (
          <li key={t.slug} className="thoughts-item">
            <Link href={`/thoughts/${t.slug}`} className="thoughts-link">
              <h2>{t.title}</h2>
              <p>{t.description}</p>
              <div className="thoughts-meta">
                {formatDate(t.date)} · {t.readingMin} min read
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
