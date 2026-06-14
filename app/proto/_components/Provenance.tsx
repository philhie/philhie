"use client";

/**
 * The Provenance Ledger — five credentials as a museum provenance line, not a CV.
 * At rest: quiet "Role — Company" rows. On hover/focus (or tap on touch): a Geist
 * Mono receipt fades in with the proof. Nouns + numbers, zero adjectives. Receipts
 * always live in the DOM (a11y/SEO); the reveal is presentational.
 */

import { useState } from "react";

interface Row {
  role: string;
  company: string;
  receipt: string;
}

const ROWS: Row[] = [
  { role: "Founder", company: "Stealth", receipt: "in progress" },
  { role: "Founders Associate", company: "Avelios", receipt: "AI hospital OS · Sequoia-backed" },
  { role: "Co-Founder", company: "Adepto", receipt: "AI newsletter · 115,000 · top 5" },
  { role: "Investment Banker", company: "Goldman Sachs", receipt: "IBD · M&A" },
  { role: "Co-Founder", company: "Grex", receipt: "career platform · 3,000 · 20 partners" },
];

export default function Provenance({ accent = "#e8a14c" }: { accent?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ul className="prov" style={{ ["--prov-accent" as string]: accent }}>
      {ROWS.map((r, i) => (
        <li key={r.company} className={`prov-row${open === i ? " is-open" : ""}`}>
          <button
            type="button"
            className="prov-btn"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="prov-label">
              <span className="prov-role">{r.role}</span>
              <span className="prov-dash"> — </span>
              <span className="prov-company">{r.company}</span>
            </span>
            <span className="prov-receipt">{r.receipt}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
