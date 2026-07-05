/**
 * The Index — Phil's record as a magazine contents page. Newest first.
 * Ported verbatim from the old Provenance ledger; nouns + numbers, zero
 * adjectives. Receipts are true.
 */

export interface IndexEntry {
  n: string;
  role: string;
  company: string;
  year: string;
  receipt: string;
}

export const INDEX: IndexEntry[] = [
  { n: "01", role: "Founder", company: "Stealth", year: "2026 —", receipt: "in stealth" },
  {
    n: "02",
    role: "Founders Associate",
    company: "Avelios",
    year: "2025 – 26",
    receipt: "AI hospital OS · Sequoia-backed",
  },
  {
    n: "03",
    role: "Co-Founder",
    company: "Adepto",
    year: "2023 – 25",
    receipt: "AI newsletter · 115,000 · top 5",
  },
  {
    n: "04",
    role: "Investment Banker",
    company: "Goldman Sachs",
    year: "2022 – 23",
    receipt: "IBD · M&A",
  },
  {
    n: "05",
    role: "Co-Founder",
    company: "Grex",
    year: "2022 – 23",
    receipt: "career platform · 3,000 · 20 partners",
  },
];
