import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content/thoughts");

export interface Thought {
  slug: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  content: string;
  readingMin: number;
}

function isoDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d ?? "");
}

export function getThoughtSlugs(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getThought(slug: string): Thought | null {
  // Containment guard: a slug is only ever a kebab-case filename, never a path.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const fp = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(fp)) return null;
  const { data, content } = matter(fs.readFileSync(fp, "utf8"));
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: String(data.title ?? slug),
    date: isoDate(data.date),
    description: String(data.description ?? ""),
    content,
    readingMin: Math.max(1, Math.round(words / 200)),
  };
}

export function getAllThoughts(): Thought[] {
  return getThoughtSlugs()
    .map(getThought)
    .filter((t): t is Thought => t !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00Z");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
